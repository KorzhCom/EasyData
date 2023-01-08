import { HttpClient} from '../http/http_client';
import { MetaData } from '../meta/meta_data';
import { MetaEntity } from '../meta/meta_entity';
import { combinePath } from '../utils/string_utils' 
import { EasyDataTable, EasyDataTableOptions } from '../data/easy_data_table';
import { DataLoader } from '../data/data_loader';
import { DataFilter } from './data_filter';
import { TextDataFilter } from './text_data_filter';

import { EasyDataServerLoader } from './easy_data_server_loader';

type EasyDataEndpointKey = 
    'GetMetaData'   |
    'FetchData'     | 
    'FetchRecord'   |
    'CreateRecord'  |
    'UpdateRecord'  |
    'DeleteRecord'  ;


interface CompoundRecordKey { 
    [key: string]: string 
}
    
export interface EasyDataContextOptions {
    metaDataId?: string;
    endpoint?: string;
    dataTable?: EasyDataTableOptions,
    onProcessStart?: () => void;
    onProcessEnd?: () => void;
}

export class DataContext {
    private endpoints: Map<string, string> = new Map<string, string>();

    private http: HttpClient;

    private model: MetaData;

    private data: EasyDataTable;

    private dataLoader: EasyDataServerLoader;

    private activeEntity: MetaEntity;

    private options: EasyDataContextOptions;

    constructor(options?: EasyDataContextOptions) {
        this.options = options || {};

        this.http = new HttpClient();
        this.model = new MetaData();
        this.model.id = options.metaDataId || '__default';

        this.dataLoader = new EasyDataServerLoader(this);
        const dataTableOptions = {
            loader: this.dataLoader,
            ...options.dataTable
        };

        this.data = new EasyDataTable(dataTableOptions);

        this.setDefaultEndpoints(this.options.endpoint || '/api/easydata');
    }

    public getActiveEntity() {
        return this.activeEntity;
    }

    public setActiveSource(entityId: string) {
        this.activeEntity = this.model.getRootEntity().subEntities
                .filter(e => e.id == entityId)[0];
    }

    public getMetaData(): MetaData {
       return this.model;
    }

    public getData() {
        return this.data;
    }

    public getDataLoader(): DataLoader {
        return this.dataLoader;
    }

    public createFilter(): DataFilter
    public createFilter(sourceId: string, data: EasyDataTable, isLookup?: boolean): DataFilter
    public createFilter(sourceId?: string, data?: EasyDataTable, isLookup?: boolean): DataFilter {
        return new TextDataFilter(
            this.dataLoader, 
            data || this.getData(), 
            sourceId || this.activeEntity.id, 
            isLookup);
    }

    public loadMetaData(): Promise<MetaData> {
        const url = this.resolveEndpoint('GetMetaData');
        this.startProcess();
        return this.http.get(url) 
            .then(result => {
                if (result.model) {
                    this.model.loadFromData(result.model);
                }

                return this.model;
            })
            .catch(error => { 
                console.error(`Error: ${error.message}. Source: ${error.sourceError}`);
                return null;
            })
            .finally(() => {
                this.endProcess();
            });
    }

    public getHttpClient() {
        return this.http;
    }

    /**
     * @deprecated Use fetchData instead
     */
    public fetchDataset(){
        console.warn('"fetchDataset() method is deprecated. Use "fetchData()" instead');
        this.fetchData();
    }

    public fetchData() {
        this.data.clear();
        return this.dataLoader.loadChunk({offset: 0, limit: this.data.chunkSize, needTotal: true})
            .then(result => {                
                for(const col of result.table.columns.getItems()) {
                    this.data.columns.add(col);
                }

                this.data.setTotal(result.total);

                for(const row of result.table.getCachedRows()) {
                    this.data.addRow(row);
                }

                return this.data;
            })
    }

    public fetchRecord(keys : CompoundRecordKey, sourceId?: string) {
        const url = this.resolveEndpoint('FetchRecord', { sourceId: sourceId || this.activeEntity.id });
        
        this.startProcess();
        return this.http.get(url, { queryParams: keys})
            .finally(() => this.endProcess());
    }

    public createRecord(obj: any, sourceId?: string) {
        const url = this.resolveEndpoint('CreateRecord', 
            { sourceId: sourceId || this.activeEntity.id });

        this.startProcess();
        return this.http.post(url, obj, { dataType: 'json' })
            .finally(() => this.endProcess());
    }

    public updateRecord(obj: any, sourceId?: string) {
        const url = this.resolveEndpoint('UpdateRecord', { sourceId: sourceId || this.activeEntity.id });
        this.startProcess();
        return this.http.post(url, obj, { dataType: 'json' })
            .finally(() => this.endProcess());
    }

    public deleteRecord(obj: any, sourceId?: string) {
        const url = this.resolveEndpoint('DeleteRecord', { sourceId: sourceId || this.activeEntity.id });

        this.startProcess();
        return this.http.post(url, obj, { dataType: 'json'})
            .finally(() => this.endProcess());
    }

    public setEndpoint(key: EasyDataEndpointKey, value: string) : void
    public setEndpoint(key: EasyDataEndpointKey | string, value: string) : void {
        this.endpoints.set(key, value);
    }

    public setEnpointIfNotExist(key: EasyDataEndpointKey, value: string): void
    public setEnpointIfNotExist(key: EasyDataEndpointKey | string, value: string): void {
        if (!this.endpoints.has(key))
         this.endpoints.set(key, value);
    }

    private endpointVarsRegex = /\{.*?\}/g;

    public resolveEndpoint(endpointKey: EasyDataEndpointKey, options?: any): string 
    public resolveEndpoint(endpointKey: EasyDataEndpointKey | string, options?: any) : string {
        options = options || {};

        let result = this.endpoints.get(endpointKey);
        if (!result) {
            throw endpointKey + ' endpoint is not defined';            
        }

        let matches = result.match(this.endpointVarsRegex);
        if (matches) {
            for (let match of matches) {
                let opt = match.substring(1, match.length - 1);
                let optVal = options[opt];
                if (!optVal) {
                    if (opt == 'modelId') {
                        optVal = this.model.getId();
                    }
                    else if (opt == 'sourceId') {
                        optVal = this.activeEntity.id;
                    }
                    else {
                        throw `Parameter [${opt}] is not defined`;
                    }
                }
    
                result = result.replace(match, optVal);
            }
        }
      
        return result;
    }

    public startProcess() {
        if (this.options.onProcessStart)
            this.options.onProcessStart();
    }

    public endProcess() {
        if (this.options.onProcessEnd)
            this.options.onProcessEnd();
    }

    private setDefaultEndpoints(endpointBase : string) {
        this.setEnpointIfNotExist('GetMetaData', combinePath(endpointBase, 'models/{modelId}'));
        this.setEnpointIfNotExist('FetchData', combinePath(endpointBase, 'models/{modelId}/sources/{sourceId}/fetch'));
        this.setEnpointIfNotExist('FetchRecord', combinePath(endpointBase, 'models/{modelId}/sources/{sourceId}/fetch'));
        this.setEnpointIfNotExist('CreateRecord', combinePath(endpointBase, 'models/{modelId}/sources/{sourceId}/create'));
        this.setEnpointIfNotExist('UpdateRecord', combinePath(endpointBase, 'models/{modelId}/sources/{sourceId}/update'));
        this.setEnpointIfNotExist('DeleteRecord', combinePath(endpointBase, 'models/{modelId}/sources/{sourceId}/delete'));
    }
}