import { EasyDataContext } from '../main/easy_data_context';
import { EntityDataView } from './entity_data_view';
import { EasyDataViewDispatcherOptions } from './options';
import { RootDataView } from './root_data_view';

export class EasyDataViewDispatcher {

    private context: EasyDataContext;
    private basePath: string;

    private container: HTMLElement;

    constructor(private options?: EasyDataViewDispatcherOptions) {

        options = options || {};

        this.setContainer(options.container);

        this.context = new EasyDataContext();

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
                console.log('Active entity: ', this.context.getActiveEntity());
                new EntityDataView(this.container, this.context, 
                    this.basePath, this.options);
            }
            else {
                new RootDataView(this.container, metaData, this.basePath);
            }
        })
    }
}