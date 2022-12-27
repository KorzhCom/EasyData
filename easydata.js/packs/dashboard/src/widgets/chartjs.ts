import {panic} from "../utils/panic"

declare var Chart

export const checkChartJS = () => {
    if (typeof Chart === "undefined") {
        panic(`ChartJS library required!`)
    }
}

export const createChartJSChart = (ctx, data, widget) => {
    widget.options.type = widget.type
    
    switch (widget.type) {
        case 'scatter': {
            const data = []

            data["axisX"].forEach((el, index)=>{
                data.push({
                    x: el,
                    y: data["axisY"][index],
                })
            })

            widget.options.datasets.data = data

            break
        }
        case 'bubble': {
            const data = []

            data["axisX"].forEach((el, index)=>{
                data.push({
                    x: el,
                    y: data["axisY"][index],
                    r: data["axisZ"][index],
                })
            })

            widget.options.datasets.data = data

            break
        }
        case 'line': {
            const {indexAxis = 'x'} = widget.options
            
            if (indexAxis === 'x') {
                widget.options.data.labels = data["axisX"]
                widget.options.data.datasets[0].data = data["axisY"]
            } else {
                widget.options.data.labels = data["axisY"]
                widget.options.data.datasets[0].data = data["axisX"]
            }

            break
        }
        case 'radar':
        case 'polar':
        case 'pie': 
        case 'bar':
        case 'doughnut': {
            widget.options.data.labels = data["axisX"]
            widget.options.data.datasets[0].data = data["axisY"]

            break
        }
    }

    return new Chart(ctx, widget.options)
}
