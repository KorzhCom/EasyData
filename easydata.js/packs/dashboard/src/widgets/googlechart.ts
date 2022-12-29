import {panic} from "../utils/panic"

declare var google

export const checkGoogleChart = () => {
    if (typeof google === "undefined" || typeof google["charts"] === "undefined") {
        panic("Google charts required!")
    }
    
    google.charts.load('current', {packages: ['corechart']});
}

export const createGoogleChart = (ctx, datasets, widget) => {
    
    const graphTitles = widget.graphTitle ? widget.graphTitle.split(",").map(s => s.trim()) : ""

    function drawChart(){
        let chart, data
        const chartFun = {
            "bar": "BarChart",
            "pie": "PieChart",
            "line": "LineChart",
            "bubble": "BubbleChart",
            "scatter": "ScatterChart",
        }

        switch (widget.type) {
            case 'bar': 
            case 'pie': 
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
            
            // case "bubble":
            // {
            //     const _rows = []
            //    
            //     _data.addColumn('string', widget.dataset.resultSet.cols[widget.axis.x].label || 'ID')
            //     _data.addColumn('number', widget.dataset.resultSet.cols[widget.axis.x].label || 'X')
            //     _data.addColumn('number', widget.dataset.resultSet.cols[widget.axis.y].label || 'Y')
            //     _data.addColumn('number', widget.dataset.resultSet.cols[widget.axis.z].label || 'R')
            //
            //     for(let i = 0; i < data['axisX'].length; i++) {
            //         _rows.push(['', data['axisX'][i], data['axisY'][i], data['axisZ'][i]])
            //     }
            //     _data.addRows(_rows)
            //
            //     chart = new google.visualization[chartFun[widget.type]](ctx)
            //    
            //     break
            // }
        }
        // = new google.visualization.PieChart(ctx);
        chart = new google.visualization[chartFun[widget.type]](ctx)
        chart.draw(data, widget.options);
    }
    
    google.charts.setOnLoadCallback(drawChart)
}