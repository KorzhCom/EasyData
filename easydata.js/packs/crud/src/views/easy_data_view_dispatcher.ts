import { utils as dataUtils } from '@easydata/core';

import { ProgressBar } from '../widgets/progress_bar';
import { DataContext } from '../main/data_context';
import { EntityDataView } from './entity_data_view';
import { EasyDataViewDispatcherOptions } from './options';
import { RootDataView } from './root_data_view';

export class EasyDataViewDispatcher {
    private context: DataContext;
    private basePath: string;

    private container: HTMLElement;

    private options: EasyDataViewDispatcherOptions = { basePath: 'easydata' };

    constructor(options?: EasyDataViewDispatcherOptions) {
        this.options = dataUtils.assign(this.options, options || {});

        if (this.options.rootEntity) {
            this.options.showBackToEntities = false;
            this.basePath = '/';
        }
        else {
            this.basePath = this.normalizeBasePath(this.options.basePath);
        }

        this.setContainer(options.container);

        const progressBarSlot = document.createElement('div');
        const bar = new ProgressBar(progressBarSlot);   
        
        const parent = this.container.parentElement;
        parent.insertBefore(progressBarSlot, parent.firstElementChild);
        
        this.context = new DataContext({
            endpoint: options.endpoint,
            dataTable: options.dataTable,
            onProcessStart: () => bar.show(),
            onProcessEnd: () => bar.hide()
        });

    }
    
    private normalizeBasePath(basePath: string): string {
        basePath = this.trimSlashes(basePath);
        const fullPath = decodeURIComponent(window.location.pathname);
        const idx = fullPath.toLocaleLowerCase().indexOf(basePath);
        return idx >= 0 ? fullPath.substring(0, idx + basePath.length) : '/';
    }

    private trimSlashes(path: string): string {
        return path.replace(/^\/|\/$/g, '')
    }

    private setContainer(container: HTMLElement | string) {
        if (!container) {
            this.container = document.getElementById('EasyDataContainer');
            return;
        }

        if (typeof container === 'string') {
            if (container.length){
                if (container[0] === '#') {
                    this.container = document.getElementById(container.substring(1));
                }
                else if (container[0] === '.') {
                    const result = document.getElementsByClassName(container.substring(1));
                    if (result.length) 
                        this.container = result[0] as HTMLElement;
                }
                else {
                    throw Error('Unrecognized container parameter ' + 
                    '(Must be an element ID, a class name or HTMLElement object itself): ' + container);
                }
            }
        }
        else {
            this.container = container;
        }
    }

    private getActiveSourceId(): string | null {
        if (this.options.rootEntity) 
            return this.options.rootEntity;

        const path = decodeURIComponent(window.location.pathname);
        const idIndex = this.basePath.length + 1;
        return idIndex < path.length ? path.substring(idIndex) : null;
    }

    run(): Promise<void> {
        window.addEventListener('ed_set_location', this.onSetLocation);
        return this.context.loadMetaData()
        .then(() => {
            this.setActiveView();
        })
        .catch(error => console.error(error))
    }

    private setActiveView() {
        this.clear();

        const sourceId = this.getActiveSourceId();
        if (sourceId) {
            this.context.setActiveSource(sourceId);
            window['EDView'] = new EntityDataView(this.container, this.context,
                this.basePath, this.options);
        }
        else {
            window['EDView'] = new RootDataView(this.container, this.context, this.basePath);
        }
    }

    private clear() {
        this.container.innerHTML = '';
        this.context.getData().clear();
    }

    private onSetLocation = () => {
        this.setActiveView();
    }

    detach() {
        window.removeEventListener('ed_set_location', this.onSetLocation);
    }
}