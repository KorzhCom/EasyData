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

    private options?: EasyDataViewDispatcherOptions = { };

    constructor(options?: EasyDataViewDispatcherOptions) {
        options = options || {};

        this.options = dataUtils.assign(this.options, options);

        // this.options.basePath = (!this.options.rootEntity)
        //     ? this.pretiffyPath(this.options.basePath)
        //     : this.pretiffyPath(window.location.pathname);

        if (this.options.rootEntity)
            this.options.showBackToEntities = false;

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

        this.basePath = this.getBasePath();
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

    private getActiveEntityId(): string | null {
        if (this.options.rootEntity) 
            return this.options.rootEntity;

        const path = this.trimSlashes(window.location.pathname);
        const idx = path.lastIndexOf('/');
        const typeName = idx >=0 ? path.substring(idx + 1) : null;

        return typeName;
    }

    private getBasePath(): string {
        return this.trimSlashes(window.location.pathname);
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

        const activeEntityId = this.getActiveEntityId();
        if (activeEntityId) {
            this.context.setActiveEntity(activeEntityId);
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