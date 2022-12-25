import {panic} from "../utils/panic";
import {EasyDataWidget, TWidget} from "../utils/widget";
import {domel} from "@easydata/ui";

declare var Chart
declare var google

const cheChartJS = () => {
    if (typeof Chart === "undefined") {
        panic(`ChartJS library required!`)
    }
}
const createBarPieChartJSChart = (ctx, {axisX, axisY}, options) => {
    cheChartJS()
    
    options.data.labels = axisX
    options.data.datasets[0].data = axisY

    return new Chart(ctx, options)
}

const createLineChartJSChart = (ctx, {axisX, axisY}, options) => {
    cheChartJS()

    const {indexAxis = 'x'} = options
    
    if (indexAxis === 'x') {
        options.data.labels = axisX
        options.data.datasets[0].data = axisY        
    } else {
        options.data.labels = axisY
        options.data.datasets[0].data = axisX
    }

    return new Chart(ctx, options)
}

export class EasyChart extends EasyDataWidget {
    constructor(elem: HTMLElement, widget: TWidget) {
        super(elem, "EasyChart", widget.options);

        const axisX = [], axisY = []
        const data = widget.dataset.resultSet.rows
        for (let r of data) {
            axisX.push(r[widget.axis.x])
            axisY.push(r[widget.axis.y])
        }

        if (widget.lib.toLowerCase() === 'chartjs') {
            const canvas = domel("canvas").toDOM()
            const ctx = canvas.getContext("2d")
            elem.appendChild(canvas)

            switch (widget.options.type) {
                case "bar":
                case "pie":
                case "doughnut": {
                    createBarPieChartJSChart(ctx,{axisX, axisY}, widget.options)
                    break;
                }
                case "line": {
                    createLineChartJSChart(ctx,{axisX, axisY}, widget.options)
                    break;
                }
            }
        } else {

        }
    }
}