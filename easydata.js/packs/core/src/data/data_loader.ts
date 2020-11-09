import { EasyDataTable } from "./easy_data_table";

export interface DataLoader {
    loadChunk: (params?: DataChunkDescriptor) => Promise<DataChunk>;
}

export interface DataChunkDescriptor {
    offset: number;
    limit: number;
    needTotal: boolean;
}

export interface DataChunk {
    table: EasyDataTable;
    total?: number;
    hasNext?: boolean;
}