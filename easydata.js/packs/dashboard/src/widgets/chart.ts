import Chart from 'chart.js/auto';
import {EasyDataWidget, EasyDataWidgetOptions, TDataSet, TWidget} from "../utils/widget";
import {domel} from "@easydata/ui";

const createChartJSChart = (ctx, dataset, options) => {
    if (options.type === 'bar') {
        const labels = [], data = []

        for (let r of dataset) {
            labels.push(r[0])
            data.push(r[1])
        }

        options.data.labels = labels
        options.data.datasets[0].data = data
    }

    const myChart = new Chart(ctx, options);

}

export class EasyChart extends EasyDataWidget {
    constructor(elem: HTMLElement, widget: TWidget) {
        super(elem, "EasyChart", widget.options);

        if (widget.lib.toLowerCase() === 'chartjs') {
            const canvas = domel("canvas").toDOM()
            const ctx = canvas.getContext("2d")
            createChartJSChart(ctx, widget.dataset.resultSet.rows, widget.options)
            elem.appendChild(canvas)
        } else {

        }
    }
}