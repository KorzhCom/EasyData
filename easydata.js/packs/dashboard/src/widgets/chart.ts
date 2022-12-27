import {panic} from "../utils/panic";
import {EasyDataWidget, TWidget} from "../utils/widget";
import {domel} from "@easydata/ui";
import {checkChartJS, createChartJSChart} from "./chartjs"
import {checkGoogleChart, createGoogleChart} from "./googlechart"

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
            checkChartJS()

            const canvas = domel("canvas").toDOM()
            const ctx = canvas.getContext("2d")
            elem.appendChild(canvas)

            createChartJSChart(
                ctx, 
                {
                    axisX, 
                    axisY, 
                    axisZ
                },
                widget
            )
        } else {
            checkGoogleChart()

            const ctx = domel("div").id("google-chart-"+(new Date().getTime())).toDOM()
            elem.appendChild(ctx)
            createGoogleChart(
                ctx,
                {
                    axisX,
                    axisY,
                    axisZ
                },
                widget
            )
        }
    }
}