import {panic} from "../utils/panic"

declare var google

export const checkGoogleChart = () => {
    if (typeof google === "undefined" || typeof google["charts"] === "undefined") {
        panic("Google charts required!")
    }
    
    google.charts.load('current', {packages: ['corechart']});
}

export const createGoogleChart = (ctx, data, widget) => {
    let chart;
    const options = widget.options
        
    switch (widget.type) {
        case 'bar': {
            const data = google.visualization.arrayToDataTable()
            data.push('axisX', 'axisY')
            for(let i = 0; i < data['axisX'].length; i++) {
                data.push[data['axisX'][i], data['axisY'][i], widget && widget.colors[i] || data['axisZ'][i]]
            }
            chart = new google.visualization.ColumnChart(ctx)
            break
        }
    }        
        // = new google.visualization.PieChart(ctx);
    chart.draw(data, options);
}