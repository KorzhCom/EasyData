import {panic} from "../utils/panic"
import {isset} from "../utils/isset"
import {ChartAdapter} from "./interface_chart_adapter"
import {domel} from "@easydata/ui";

declare var Chart

export class ChartJSAdapter implements ChartAdapter {
    checkLib(){
        if (typeof Chart === "undefined") {
            panic(`ChartJS library required!`)
        }
        return true
    }
    
    createContext(){
        const canvas = domel("canvas").toDOM()
        const ctx = canvas.getContext("2d")
        return {ctx: ctx, elem: canvas}
    }
    createChart(ctx, datasets, widget){
        if (!widget.options) {
            widget.options = {}
        }

        if (widget.type === 'polar') {
            widget.type = 'polarArea'
        }
        widget.options.type = widget.type

        const graphTitles = widget.graphTitle ? widget.graphTitle.split(",").map(s => s.trim()) : ""

        switch (widget.type) {
            case 'scatter': {
                const _data = []

                widget.options.data = {
                    datasets: []
                }

                let k = 0
                for(let ds of datasets) {
                    ds["axisX"].forEach((x, i)=>{
                        _data.push({
                            x: x,
                            y: ds["axisY"][i],
                        })
                    })
                    widget.options.data.datasets[k] = {
                        label: graphTitles[k],
                        data: _data
                    }
                    k++
                }

                break
            }
            case 'bubble': {
                const _data = []

                widget.options.data = {
                    datasets: []
                }

                let k = 0
                for(let ds of datasets) {
                    ds["axisX"].forEach((x, i)=>{
                        _data.push({
                            x: x,
                            y: ds["axisY"][i],
                            r: ds["axisZ"][i],
                        })
                    })
                    widget.options.data.datasets[k] = {
                        label: graphTitles[k],
                        data: _data
                    }
                    k++
                }

                break
            }
            case 'line': {
                const {indexAxis = 'x'} = widget.options

                if (!isset(widget.options.data.datasets)) {
                    widget.options.data = {
                        datasets: []
                    }
                }

                if (indexAxis === 'x') {
                    let k = 0
                    for(let ds of datasets) {
                        widget.options.data.datasets[k].data = ds["axisY"]
                        widget.options.data.datasets[k].label = graphTitles[k]
                        k++
                    }
                    widget.options.data.labels = datasets[0]["axisX"]
                } else {
                    let k = 0
                    for(let ds of datasets) {
                        widget.options.data.datasets[k].data = ds["axisX"]
                        widget.options.data.datasets[k].label = graphTitles[k]
                        k++
                    }
                    widget.options.data.labels = datasets[0]["axisY"]
                }

                break
            }
            case 'radar':
            case 'polarArea':
            case 'pie':
            case 'bar':
            case 'doughnut': {
                if (!isset(widget.options.data.datasets)) {
                    widget.options.data = {
                        datasets: Array(datasets.length)
                    }
                }

                let k = 0
                for(let ds of datasets) {
                    widget.options.data.datasets[k].data = ds["axisY"]
                    widget.options.data.datasets[k].label = graphTitles[k]
                    k++
                }
                widget.options.data.labels = datasets[0]["axisX"]

                break
            }
        }

        return new Chart(ctx, widget.options)
    }
}