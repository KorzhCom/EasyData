import { ProgressBar } from '../widgets/progress_bar';
import { DataContext } from '../main/data_context';
import { EntityDataView } from './entity_data_view';
import { EasyDataViewDispatcherOptions } from './options';
import { RootDataView } from './root_data_view';

export class EasyDataViewDispatcher {

    private context: DataContext;
    private basePath: string;

    private container: HTMLElement;

    constructor(private options?: EasyDataViewDispatcherOptions) {

        options = options || {};

        this.setContainer(options.container);

        const progressBarSlot = document.createElement('div');
        const bar = new ProgressBar(progressBarSlot);   
        
        const parent = this.container.parentElement;
        parent.insertBefore(progressBarSlot, parent.firstElementChild);
        
        this.context = new DataContext({
            onProcessStart: () => bar.show(),
            onProcessEnd: () => bar.hide()
        });

        this.basePath = this.getBasePath();
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
                    '(Must be id, class or HTMLElement): ' + container);
                }
            }
        }
        else {
            this.container = container;
        }
    }

    private getActiveEntityId(): string | null {
        const decodedUrl = decodeURIComponent(window.location.href);
        const splitIndex = decodedUrl.lastIndexOf('/');
        const typeName = decodedUrl.substring(splitIndex + 1);

        return typeName && typeName.toLocaleLowerCase() !== 'easydata'
            ? typeName
            : null;
    }

    private getBasePath(): string {
        const decodedUrl = decodeURIComponent(window.location.href);
        const easyDataIndex = decodedUrl.indexOf('easydata');
        return decodedUrl.substring(0, easyDataIndex + 'easydata'.length);
    }

    run(): Promise<void> {
        return this.context.loadMetaData()
        .then((metaData) => {
            const activeEntityId = this.getActiveEntityId();
            if (activeEntityId) {
                this.context.setActiveEntity(activeEntityId);
                new EntityDataView(this.container, this.context, 
                    this.basePath, this.options);
            }
            else {
                new RootDataView(this.container, this.context, this.basePath);
            }
        })
    }
}