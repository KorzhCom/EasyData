import {data1} from "./data1";

export const Layout1 = {
    "meta": {
        chartLib: "ChartJS", // 
    },
    "widgets": [
        {
            "title": "Grid Widget Example",
            "titleClass": "dashboard-grid__widget__subtitle",
            "class": "DataGrid",
            "style": "p-2",
            "dataset": data1,
            "options": {
            },
            "footer": "Footer for grid1"
        },{
            "title": "ChartJS Using",
            "class": null,
            "style": "p-2",
            "footer": "Below you can see examples of ChartJS using"
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
            "colors": [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)',
            ],
            "options": {
                data: {
                    datasets: [{
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
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(255, 206, 86, 0.2)',
                            'rgba(75, 192, 192, 0.2)',
                            'rgba(153, 102, 255, 0.2)',
                            'rgba(255, 159, 64, 0.2)'
                        ],
                        hoverOffset: 10
                    }]
                },
                options: {
                    aspectRatio: 2,
                    plugins: {
                        legend: {
                            position: "bottom",
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
            "dataset": data1,
            "axis": {
                "x": 0,
                "y": 1
            },
            "type": 'line',
            "options": {
                data: {
                    datasets: [{
                        fill: false,
                        borderColor: 'rgb(75, 192, 192)',
                        tension: 0.1
                    }]
                }
            },
            "footer": "Footer for chart"
        }
    ]
}