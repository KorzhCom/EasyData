import {panic} from "../utils/panic"

declare var Chart

export const checkChartJS = () => {
    if (typeof Chart === "undefined") {
        panic(`ChartJS library required!`)
    }
}

export const createChartJSChart = (ctx, data, widget) => {
    if (!widget.options) {
        widget.options = {}
    }
    
    widget.options.type = widget.type
    
    switch (widget.type) {
        case 'scatter': {
            const _data = []

            data["axisX"].forEach((x, index)=>{
                _data.push({
                    x: x,
                    y: data["axisY"][index],
                })
            })

            widget.options.datasets = {data: _data}

            break
        }
        case 'bubble': {
            const _data = []

            data["axisX"].forEach((x, index)=>{
                _data.push({
                    x: x,
                    y: data["axisY"][index],
                    r: data["axisZ"][index],
                })
            })

            widget.options.data = {
                datasets: [{
                    label: widget.graphTitle || "",
                    data: _data
                }]
            }

            break
        }
        case 'line': {
            const {indexAxis = 'x'} = widget.options
            
            if (!widget.options.data || !widget.options.data.datasets) {
                widget.options.data = {
                    datasets: [{
                        data: null
                    }]
                }
            }
            
            if (indexAxis === 'x') {
                widget.options.data.labels = data["axisX"]
                widget.options.data.datasets[0].data = data["axisY"]
            } else {
                widget.options.data.labels = data["axisY"]
                widget.options.data.datasets[0].data = data["axisX"]
            }

            widget.options.data.datasets[0].label = widget.graphTitle || ""
            
            break
        }
        case 'radar':
        case 'polar':
        case 'pie': 
        case 'bar':
        case 'doughnut': {
            widget.options.data.labels = data["axisX"]
            widget.options.data.datasets[0].data = data["axisY"]

            widget.options.data.datasets[0].label = widget.graphTitle || ""
            
            break
        }
    }

    return new Chart(ctx, widget.options)
}
