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

const colorsA = [
    'rgba(255, 99, 132, .2)',
    'rgba(54, 162, 235, .2)',
    'rgba(255, 206, 86, .2)',
    'rgba(75, 192, 192, .2)',
    'rgba(153, 102, 255, .2)',
    'rgba(255, 159, 64, .2)',
]

export const Layout1 = {
    "meta": {
        chartLib: "ChartJS", // 
    },
    "widgets": [
        {
            "title": "Grid Widget Example",
            "titleClass": "dashboard-grid__widget__subtitle",
            "class": "DataGrid",
            "style": "p-2 cell-one-half",
            "dataset": data1,
            "options": {
            },
            "footer": "Footer for grid1"
        },
        {
            "title": "Grid Widget Example",
            "titleClass": "dashboard-grid__widget__subtitle",
            "class": "DataGrid",
            "style": "p-2 cell-one-half",
            "dataset": data2,
            "options": {
            },
            "footer": "Footer for grid1"
        },
        {
            "title": "ChartJS Using",
            "class": null,
            "style": "p-2",
            "footer": "Below you can see examples of ChartJS using"
        },
        {
            "title": "Scatter Chart",
            "titleClass": "dashboard-grid__widget__subtitle",
            "graphTitle": "Scatter Demo",
            "class": "Chart",
            "lib": "ChartJS",
            "style": "p-2 cell-one-half",
            "dataset": data2,
            "axis": {
                "x": 0,
                "y": 1
            },
            "type": 'scatter',
            "options": {
                data: {
                    datasets: [{
                    }]
                },
                options: {
                    scales: {
                        x: {
                            type: 'linear',
                            position: 'bottom'
                        }
                    }
                }
            },
            "footer": "Footer for chart"
        },
        {
            "title": "Bar Chart",
            "titleClass": "dashboard-grid__widget__subtitle",
            "class": "Chart",
            "lib": "ChartJS",
            "style": "p-2 cell-one-half",
            "dataset": data1,
            "axis": {
                "x": 0,
                "y": 1
            },
            "type": 'bar',
            "options": {
                data: {
                    datasets: [{
                        backgroundColor: [
                            ...colors
                        ],
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    },
                    aspectRatio: 2,
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            },
            "footer": "Footer for chart"
        },
        {
            "title": "Doughnut Chart",
            "titleClass": "dashboard-grid__widget__subtitle",
            "class": "Chart",
            "lib": "ChartJS",
            "style": "p-2 cell-one-half",
            "dataset": data1,
            "axis": {
                "x": 0,
                "y": 1
            },
            "type": 'doughnut',
            "options": {
                data: {
                    datasets: [{
                        backgroundColor: [
                            ...colors
                        ],
                    }]
                },
                options: {
                    aspectRatio: 2,
                    plugins: {
                        legend: {
                            position: "right",
                            onClick: () => {}
                        }
                    }
                }
            },
            "footer": "Footer for chart"
        },
        {
            "title": "Radar Chart",
            "titleClass": "dashboard-grid__widget__subtitle",
            graphTitle: "Products1, Products2",
            "class": "Chart",
            "lib": "ChartJS",
            "style": "p-2 cell-one-half",
            "dataset": [data1, data3],
            "axis": {
                "x": 0,
                "y": 1
            },
            "type": 'radar',
            "options": {
                data: {
                    datasets: [
                        {
                            backgroundColor: [
                                ...colorsA
                            ],
                        },
                        {
                            backgroundColor: [
                                ...colorsA
                            ],
                        },
                    ]
                },
                options: {
                    aspectRatio: 2,
                    plugins: {
                        legend: {
                            position: "right",
                            onClick: () => {}
                        }
                    }
                }
            },
            "footer": "Footer for chart"
        },
        {
            "title": "Polar Chart",
            "titleClass": "dashboard-grid__widget__subtitle",
            "class": "Chart",
            "lib": "ChartJS",
            "style": "p-2 cell-one-half",
            "dataset": [data1],
            "axis": {
                "x": 0,
                "y": 1
            },
            "type": 'polar',
            "options": {
                data: {
                    datasets: [{
                        backgroundColor: [
                            ...colors
                        ],
                    }]
                },
                options: {
                    aspectRatio: 2,
                    plugins: {
                        legend: {
                            position: "right",
                            onClick: () => {}
                        }
                    }
                }
            },
            "footer": "Footer for chart"
        },
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
        {
            "title": "Bubble Chart",
            "titleClass": "dashboard-grid__widget__subtitle",
            "class": "Chart",
            "lib": "ChartJS",
            "style": "p-2 cell-one-half",
            "graphTitle": "Bubbles Demo",
            "dataset": data2,
            "axis": {
                "x": 0,
                "y": 1,
                "z": 2,
            },
            "type": 'bubble',
            "footer": "Footer for chart"
        },
        {
            "title": "Google Chart Using",
            "class": null,
            "style": "p-2",
            "footer": "Below you can see examples of Google Chart using"
        },
        {
            "title": "Bar Chart",
            "titleClass": "dashboard-grid__widget__subtitle",
            "class": "Chart",
            "lib": "google",
            "style": "p-2 cell-one-half",
            "dataset": data1,
            "axis": {
                "x": 0,
                "y": 1
            },
            "type": 'bar',
            "options": {
                legend: { position: "none" },
                'width':"100%",
                'height':300
            },
            "footer": "Footer for chart"
        },
        {
            "title": "Pie Chart",
            "titleClass": "dashboard-grid__widget__subtitle",
            "class": "Chart",
            "lib": "google",
            "style": "p-2 cell-one-half",
            "dataset": data1,
            "axis": {
                "x": 0,
                "y": 1
            },
            "type": 'pie',
            "options": {
                'width':"100%",
                'height':300
            },
            "footer": "Footer for chart"
        },
        {
            "title": "Line Chart",
            "titleClass": "dashboard-grid__widget__subtitle",
            "graphTitle": "Products1, Products2",
            "class": "Chart",
            "lib": "google",
            "style": "p-2 cell-one-half",
            "dataset": [data1, data3],
            "axis": {
                "x": 0,
                "y": 1,
            },
            "type": 'line',
            "options": {
                legend: { position: 'top', alignment: 'center' },
                'width':"100%",
                'height':300
            },
            "footer": "Footer for chart"
        },
        {
            "title": "Bubble Chart",
            "titleClass": "dashboard-grid__widget__subtitle",
            "class": "Chart",
            "lib": "google",
            "style": "p-2 cell-one-half",
            "dataset": data2,
            "axis": {
                "x": 0,
                "y": 1,
                "z": 2,
            },
            "type": 'bubble',
            "options": {
                colorAxis: {colors: ['#cae5eb', '#6495ed']},
                'width':"100%",
                'height':300
            },
            "footer": "Footer for chart"
        }
    ]
}