import {panic} from "../utils/panic";
import {EasyDataWidget, TWidget} from "../utils/widget";
import {domel} from "@easydata/ui";

declare var Chart
declare var google

const checkChartJS = () => {
    if (typeof Chart === "undefined") {
        panic(`ChartJS library required!`)
    }
}

const createChartJSChart = (ctx, type, data, options) => {
    checkChartJS()

    switch (type) {
        case 'bubble': {
            const data = []

            data["axisX"].forEach((el, index)=>{
                data.push({
                    x: el,
                    y: data["axisY"][index],
                    r: data["axisZ"][index],
                })
            })
            
            options.datasets.data = data
            
            break
        }
        case 'line': {
            const {indexAxis = 'x'} = options

            if (indexAxis === 'x') {
                options.data.labels = data["axisX"]
                options.data.datasets[0].data = data["axisY"]
            } else {
                options.data.labels = data["axisY"]
                options.data.datasets[0].data = data["axisX"]
            }
            
            break
        }
        case 'pie':
        case 'bar':
        case 'doughnut': {
            options.data.labels = data["axisX"]
            options.data.datasets[0].data = data["axisY"]
            
            break
        }
    }
    
    return new Chart(ctx, options)
}

export class EasyChart extends EasyDataWidget {
    constructor(elem: HTMLElement, widget: TWidget) {
        super(elem, "EasyChart", widget.options);

        const axisX = [], axisY = [], axisZ = []
        const data = widget.dataset.resultSet.rows
        for (let r of data) {
            axisX.push(r[widget.axis.x])
            axisY.push(r[widget.axis.y])
            axisZ.push(r[widget.axis.z])
        }

        if (widget.lib.toLowerCase() === 'chartjs') {
            const canvas = domel("canvas").toDOM()
            const ctx = canvas.getContext("2d")
            elem.appendChild(canvas)

            createChartJSChart(
                ctx, 
                widget.options.type,
                {
                    axisX, 
                    axisY, 
                    axisZ
                }, 
                widget.options
            )
        } else {

        }
    }
}