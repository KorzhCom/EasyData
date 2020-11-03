import { EasyDataContext } from '../main/easy_data_context';
import { EntityDataView } from './entity_data_view';
import { EasyDataViewOptions } from './options';
import { RootDataView } from './root_data_view';

export class EasyDataViewDispatcher {

    private context: EasyDataContext;
    private basePath: string;

    constructor(private slot: HTMLElement, private options?: EasyDataViewOptions) {
        this.context = new EasyDataContext();

        this.basePath = this.getBasePath();
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
                new EntityDataView(this.slot, this.context, 
                    this.basePath, this.options);
            }
            else {
                new RootDataView(this.slot, metaData, this.basePath);
            }
        })
    }
}