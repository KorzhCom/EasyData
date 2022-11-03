import { utils } from '@easydata/core';
import {
    DefaultDialogService,
    DialogService, domel, EasyGrid,
    GridCellRenderer, GridColumn, RowClickEvent
} from '@easydata/ui';
import {getContainer} from "../utils/container"

type EasyDataToolbarButton = {
    caption?: string,
    icon?: string,
    cls?: string,
    onclick?: any
}

type EasyDataToolbarPanel = {
    name?: string,
    buttons: EasyDataToolbarButton[]
}

type EasyDataToolbarView = {
    panels: EasyDataToolbarPanel[]
}

type EasyDataToolbarOptions = {
    container: string
}

export class EasyDataToolbar {
    private view: EasyDataToolbarView 
    private options: EasyDataToolbarOptions = {
        container: "#EasyDataToolbarContainer"
    }
    private container: HTMLElement
    
    constructor(view: EasyDataToolbarView, options?:EasyDataToolbarOptions) {
        this.options = utils.assignDeep(this.options, options || {});
        this.view = view
        this.container = getContainer(this.options.container)
        this.render()
    }
    
    private render(){
        for(let panel of this.view.panels) {
            const toolbarPanel = domel('div')
                .addClass("toolbar__panel")
                .title(panel.name)
                .toDOM()

            for(let btn of panel.buttons) {
                const button = domel('button')                    
                    .addClass("toolbar__panel__button")
                    .addClass(btn.cls)
                    .on("click", btn.onclick)
                                    
                if (btn.cls) button.addClass(btn.cls)                
                if (btn.icon) button.addHtml(btn.icon)                
                if (btn.caption) button.addHtml(btn.caption)
                
                toolbarPanel.appendChild(button.toDOM())
            }
            
            this.container.appendChild(toolbarPanel)
        }
    }
}