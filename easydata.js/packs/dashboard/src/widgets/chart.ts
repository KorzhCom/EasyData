import Chart from 'chart.js/auto';
import {EasyDataWidget, EasyDataWidgetOptions, TDataSet, TWidget} from "../utils/widget";
import {domel} from "@easydata/ui";

const createChartJSChart = (ctx, {axisX, axisY}, options) => {
//     const axisX = [], axisY = []
//

    options.data.labels = axisX
    options.data.datasets[0].data = axisY

    const myChart = new Chart(ctx, options);
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
            createChartJSChart(
                ctx,
                {
                    axisX,
                    axisY
                },
                widget.options)
            elem.appendChild(canvas)
        } else {

        }
    }
}