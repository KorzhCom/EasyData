import { EasyDataTable } from "./easy_data_table";

export interface DataLoader {
    loadChunk: (params?: DataChunkDescriptor) => Promise<DataChunk>;
}

export interface DataChunkDescriptor {
    offset: number;
    limit: number;
    needTotal: boolean;
}

/** An alias kept for the code that refers to the chunk parameters under this name. */
export type ChunkInfo = DataChunkDescriptor;

export interface DataChunk {
    table: EasyDataTable;
    total?: number;
    hasNext?: boolean;
}