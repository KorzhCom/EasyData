// import Chart from 'chart.js/auto';

import {panic} from "../utils/panic";

declare var Chart

import {EasyDataWidget, EasyDataWidgetOptions, TDataSet, TWidget} from "../utils/widget";
import {domel} from "@easydata/ui";

const createBarPieChartJSChart = (ctx, {axisX, axisY}, options) => {
    options.data.labels = axisX
    options.data.datasets[0].data = axisY

    return typeof Chart !== "undefined" ? new Chart(ctx, options) : panic(`ChartJS library required!`);
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

            if (['bar', 'pie', 'doughnut'].includes(widget.options.type)) {
                createBarPieChartJSChart(
                    ctx,
                    {
                        axisX,
                        axisY
                    },
                    widget.options)
            }
        } else {

        }
    }
}