import {panic} from "../utils/panic"

declare var google

export const checkGoogleChart = () => {
    if (typeof google === "undefined" || typeof google["charts"] === "undefined") {
        panic("Google charts required!")
    }
    
    google.charts.load('current', {packages: ['corechart']});
}

export const createGoogleChart = (ctx, data, widget) => {
    function drawChart(){
        let chart;
        const _data = new google.visualization.DataTable()
        const chartFun = {
            "bar": "BarChart",
            "pie": "PieChart",
            "line": "LineChart",
        }

        switch (widget.type) {
            case 'bar': 
            case 'pie': 
            {
                const _rows = []

                _data.addColumn('string', 'X')
                _data.addColumn('number', 'Y')

                for(let i = 0; i < data['axisX'].length; i++) {
                    _rows.push([data['axisX'][i], data['axisY'][i]])
                }
                _data.addRows(_rows)
                
                chart = new google.visualization[chartFun[widget.type]](ctx)

                break
            }
            case "line":
            {
                const _rows = []

                _data.addColumn('string', 'X')
                _data.addColumn('number', 'Y')

                for(let i = 0; i < data['axisX'].length; i++) {
                    _rows.push([data['axisX'][i], data['axisY'][i]])
                }
                _data.addRows(_rows)

                chart = new google.visualization[chartFun[widget.type]](ctx)
                
                break
            }
        }
        // = new google.visualization.PieChart(ctx);
        chart.draw(_data, widget.options);
    }
    
    google.charts.setOnLoadCallback(drawChart)
}