import {panic} from "../utils/panic";
import {EasyDataWidget, TWidget} from "../utils/widget";
import {domel} from "@easydata/ui";
import {checkChartJS, createChartJSChart} from "./chartjs"
import {checkGoogleChart, createGoogleChart} from "./googlechart"

export class EasyChart extends EasyDataWidget {
    constructor(elem: HTMLElement, widget: TWidget) {
        super(elem, "EasyChart", widget.options);

        if (!Array.isArray(widget.dataset)) {
            widget.dataset = [widget.dataset]
        }
        
        const datasets = []
        let axisX = [], axisY = [], axisZ = []
        
        for(let i = 0; i < widget.dataset.length; i++) {
            if (!widget.dataset[i].resultSet) continue

            const ds = widget.dataset[i].resultSet.rows

            axisX = []; axisY = []; axisZ = [];

            for(let r of ds) {
                // console.log(r)
                axisX.push(r[widget.axis.x])
                axisY.push(r[widget.axis.y])
                axisZ.push(r[widget.axis.z])
            }

            // console.log({axisX, axisY, axisZ})

            datasets.push({axisX, axisY, axisZ})
        }

        // console.log(datasets)

        if (widget.lib.toLowerCase() === 'chartjs') {
            checkChartJS()

            const canvas = domel("canvas").toDOM()
            const ctx = canvas.getContext("2d")
            elem.appendChild(canvas)

            createChartJSChart(ctx, datasets, widget)
        } else {
            checkGoogleChart()

            const ctx = domel("div").id("google-chart-"+(new Date().getTime())).toDOM()
            elem.appendChild(ctx)
            // createGoogleChart(ctx, datasets, widget)
        }
    }
}