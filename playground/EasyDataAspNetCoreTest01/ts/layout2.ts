import {data1} from "./data1";
import {data2} from "./data2";
import {data3} from "./data3";

const colors = [
    'rgb(255, 99, 132)',
    'rgb(54, 162, 235)',
    'rgb(255, 206, 86)',
    'rgb(75, 192, 192)',
    'rgb(153, 102, 255)',
    'rgb(255, 159, 64)',
]

export const Layout2 = {
    "widgets": [
        {
            "title": "Line Chart",
            "titleClass": "dashboard-grid__widget__subtitle",
            "class": "Chart",
            "lib": "ChartJS",
            "style": "p-2 cell-one-half",
            "dataset": [data1, data3],
            graphTitle: "Products1, Products2",
            "axis": {
                "x": 0,
                "y": 1
            },
            "type": 'line',
            "options": {
                data: {
                    datasets: [
                        {
                            fill: false,
                            borderColor: 'rgb(75, 192, 192)',
                            tension: 0.1
                        },
                        {
                            fill: false,
                            borderColor: 'rgb(210,33,139)',
                            tension: 0.1
                        },
                    ]
                }
            },
            "footer": "Footer for chart"
        },
    ]
}