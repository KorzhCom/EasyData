import {panic} from "../utils/panic"
import {ChartAdapter} from "./interface_chart_adapter"
import {domel} from "@easydata/ui";

declare var google

export class GoogleChartAdapter implements ChartAdapter {
    checkLib(){
        if (typeof google === "undefined" || typeof google["charts"] === "undefined") {
            panic("Google charts required!")
        }

        google.charts.load('current', {packages: ['corechart']});
        
        return true
    }
    createContext(){
        const ctx = 
            domel("div")
                .id("google-chart-"+(new Date().getTime()))
                .toDOM()
        return {ctx: ctx, elem: ctx}
    }
    createChart(ctx, datasets, widget){
        const graphTitle = widget.graphTitle
        const graphTitles = graphTitle ? graphTitle.split(",").map(s => s.trim()) : ""

        function drawChart(){
            let chart, data
            const chartFun = {
                "bar": "BarChart",
                "column": "ColumnChart",
                "pie": "PieChart",
                "doughnut": "PieChart",
                "line": "LineChart",
                "bubble": "BubbleChart",
                "scatter": "ScatterChart",
            }

            switch (widget.type) {
                case 'bar':
                case 'column':
                case 'line':
                {
                    const rows = []

                    let row = []
                    datasets[0]["axisX"].forEach( (ax, i) => {
                        row.push(ax)
                        datasets.forEach(ds => {
                            row.push(ds["axisY"][i])
                        })
                        rows.push(row)
                        row = []
                    })

                    data = google.visualization.arrayToDataTable([
                        ["id", ...graphTitles],
                        ...rows
                    ])

                    break
                }

                case "pie":
                case "doughnut":
                case "scatter":
                {
                    const ds = datasets[0]
                    const rows = []

                    ds["axisX"].forEach((ax, i) => {
                        rows.push([
                            ax, ds["axisY"][i]
                        ])
                    })

                    data = google.visualization.arrayToDataTable([
                        [...graphTitles],
                        ...rows
                    ])

                    break
                }

                case "bubble":
                {
                    const ds = datasets[0]
                    const rows = []

                    ds["axisX"].forEach((ax, i) => {
                        rows.push([
                            "", ax, ds["axisY"][i], ds["axisZ"][i]
                        ])
                    })

                    data = google.visualization.arrayToDataTable([
                        ["", ...graphTitles],
                        ...rows
                    ])

                    break
                }
            }
            // = new google.visualization.PieChart(ctx);
            chart = new google.visualization[chartFun[widget.type]](ctx)
            chart.draw(data, widget.options);
        }

        google.charts.setOnLoadCallback(drawChart)
    }
}


// export const checkGoogleChart = () => {
//     if (typeof google === "undefined" || typeof google["charts"] === "undefined") {
//         panic("Google charts required!")
//     }
//    
//     google.charts.load('current', {packages: ['corechart']});
// }
//
// export const createGoogleChart = (ctx, datasets, widget) => {
//    
//     const graphTitle = widget.graphTitle
//     const graphTitles = graphTitle ? graphTitle.split(",").map(s => s.trim()) : ""
//
//     function drawChart(){
//         let chart, data
//         const chartFun = {
//             "bar": "BarChart",
//             "column": "ColumnChart",
//             "pie": "PieChart",
//             "doughnut": "PieChart",
//             "line": "LineChart",
//             "bubble": "BubbleChart",
//             "scatter": "ScatterChart",
//         }
//
//         switch (widget.type) {
//             case 'bar': 
//             case 'column': 
//             case 'line': 
//             {
//                 const rows = []
//                
//                 let row = []
//                 datasets[0]["axisX"].forEach( (ax, i) => {
//                     row.push(ax)
//                     datasets.forEach(ds => {
//                         row.push(ds["axisY"][i])
//                     })
//                     rows.push(row)
//                     row = []
//                 })
//
//                 data = google.visualization.arrayToDataTable([
//                     ["id", ...graphTitles],
//                     ...rows
//                 ])
//
//                 break
//             }
//            
//             case "pie": 
//             case "doughnut": 
//             case "scatter": 
//             {
//                 const ds = datasets[0]
//                 const rows = []
//
//                 ds["axisX"].forEach((ax, i) => {
//                     rows.push([
//                         ax, ds["axisY"][i]
//                     ])
//                 })
//
//                 data = google.visualization.arrayToDataTable([
//                     [...graphTitles],
//                     ...rows
//                 ])
//
//                 break
//             }
//            
//             case "bubble":
//             {
//                 const ds = datasets[0]
//                 const rows = []
//
//                 ds["axisX"].forEach((ax, i) => {
//                     rows.push([
//                         "", ax, ds["axisY"][i], ds["axisZ"][i]
//                     ])
//                 })
//
//                 data = google.visualization.arrayToDataTable([
//                     ["", ...graphTitles],
//                     ...rows
//                 ])
//
//                 break
//             }
//         }
//         // = new google.visualization.PieChart(ctx);
//         chart = new google.visualization[chartFun[widget.type]](ctx)
//         chart.draw(data, widget.options);
//     }
//    
//     google.charts.setOnLoadCallback(drawChart)
// }