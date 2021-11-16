import { 
    HttpClient, MetaData,
    MetaEntity, combinePath, 
    EasyDataTable, 
    DataLoader
} from '@easydata/core';
import { DataFilter } from '../filter/data_filter';
import { TextDataFilter } from '../filter/text_data_filter';

import { EasyDataServerLoader } from './easy_data_server_loader';

type EasyDataEndpointKey = 
    'GetMetaData'   |
    'GetEntities'   | 
    'GetEntity'     |
    'CreateEntity'  |
    'UpdateEntity'  |
    'DeleteEntity'  ;

export interface EasyDataContextOptions {
    metaDataId?: string;
    endpoint?: string;
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
        this.data = new EasyDataTable({
            loader: this.dataLoader
        });

        this.setDefaultEndpoints(this.options.endpoint || '/api/easydata')
    }

    public getActiveEntity() {
        return this.activeEntity;
    }

    public setActiveEntity(entityId: string) {
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
    public createFilter(entityId: string, data: EasyDataTable, isLookup?: boolean): DataFilter
    public createFilter(entityId?: string, data?: EasyDataTable, isLookup?: boolean): DataFilter {
        return new TextDataFilter(
            this.dataLoader, 
            data || this.getData(), 
            entityId || this.activeEntity.id, 
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

    public getEntities() {
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

    public getEntity(id: string, entityId?: string) {
        const url = this.resolveEndpoint('GetEntity', { id, 
            entityId: entityId || this.activeEntity.id });
        
        this.startProcess();
        return this.http.get(url).getPromise()
            .finally(() => this.endProcess());
    }

    public createEntity(obj: any, entityId?: string) {
        const url = this.resolveEndpoint('CreateEntity', 
            { entityId: entityId || this.activeEntity.id });

        this.startProcess();
        return this.http.post(url, obj, { dataType: 'json' }).getPromise().finally(() => this.endProcess());
    }

    public updateEntity(id: string, obj, entityId?: string) {
        const url = this.resolveEndpoint('UpdateEntity', { id, 
            entityId: entityId || this.activeEntity.id });
        
        this.startProcess();
        return this.http.post(url, obj, { dataType: 'json' }).getPromise().finally(() => this.endProcess());
    }

    public deleteEntity(id: string, entityId?: string) {
        const url = this.resolveEndpoint('DeleteEntity', { id, 
            entityId: entityId || this.activeEntity.id });

        this.startProcess();
        return this.http.post(url, null).getPromise().finally(() => this.endProcess());
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
                    else if (opt == 'entityId') {
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
        this.setEnpointIfNotExist('GetEntities', combinePath(endpointBase, 'models/{modelId}/crud/{entityId}/fetch'));
        this.setEnpointIfNotExist('GetEntity', combinePath(endpointBase, 'models/{modelId}/crud/{entityId}/fetch/{id}'));
        this.setEnpointIfNotExist('CreateEntity', combinePath(endpointBase, 'models/{modelId}/crud/{entityId}/create'));
        this.setEnpointIfNotExist('UpdateEntity', combinePath(endpointBase, 'models/{modelId}/crud/{entityId}/update/{id}'));
        this.setEnpointIfNotExist('DeleteEntity', combinePath(endpointBase, 'models/{modelId}/crud/{entityId}/delete/{id}'));
    }
}