import Chart from 'chart.js/auto';
import {EasyDataWidget, EasyDataWidgetOptions} from "../utils/widget";
import {domel} from "@easydata/ui";

export class EasyChart extends EasyDataWidget {
    constructor(elem: HTMLElement, options: EasyDataWidgetOptions) {
        super(elem, "EasyDataChart", options);

        const labels = [], data = []

        for (let r of options.dataset.resultSet.rows) {
            labels.push(r[0])
            data.push(r[1])
        }

        const rect = elem.getBoundingClientRect()

        if (!options.width) {
            options.width = rect.width
        }

        if (!options.height) {
            options.height = rect.height
        }

        const canvas = document.createElement('canvas')
        canvas.width = options.width
        canvas.height = options.height

        elem.appendChild(canvas)

        const ctx = canvas.getContext("2d")

        const myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: '# of Votes',
                    data,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(255, 159, 64, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}