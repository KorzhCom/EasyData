import {data1} from "./data1";

export const Layout1 = {
    "meta": {},
    "widgets": [
        {
            "title": "Title Grid1",
            "class": "DataGrid",
            "size": "",
            "options": {
                dataset: data1
            },
            "footer": "Footer for grid1"
        },
        {
            "title": "Title Grid2",
            "class": "DataGrid",
            "size": "cell-one-half",
            "options": {
                dataset: data1
            },
            "footer": "Footer for grid2"
        },
        {
            "title": "Line Chart",
            "class": "Chart",
            "size": "cell-one-half",
            "options": {
                dataset: data1,
                height: "292"
            },
            "footer": "Footer for line chart"
        }
    ]
}