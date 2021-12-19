
/** Represents an error that occurs during groups/aggregates calculation */
export interface AggrCalculationError extends Error {
    /** Get the group level on which the error occurs */
    level? : number;
}

/** Represents options of the aggregates calculator */
export interface AggrCalculationOptions {
    /** Gets or sets the maximum level of grouping */
    maxLevel?: number;

    /** A callback function that is called when we get the result of calculation for some level */
    resultObtained?(result?: any, level?: number);

    /** A callback function that is called when an error occurred during the calculation */
    errorOccurred?(error:AggrCalculationError);    
}

/** Defines the interface for an object that calculates groups/aggregates */
export interface AggregatesCalculator {

    /** Gets the aggregate container - 
     * an object that stores all data about groups, aggregates, etc
     **/
    getAggrContainer(): AggregatesContainer;
    
    
    /** Start the process of calculation and returns a Promise 
     * that is resolved when the calculation is finished */
    calculate(options?: AggrCalculationOptions): Promise<void>;
}

/** Contains the dictionary of group keys */
export interface GroupKeys {
    [key: string]: any;
}

export interface GroupValues {
    [key: string]: any;
}

type LevelData = Map<string, GroupValues>;

export interface AggregatesContainer {
    setAggregateData(level: number, data: LevelData);
    getAggregateData(level: number, key: GroupKeys): Promise<GroupValues>;
    updateAggregateData(level: number, groupKey : GroupKeys, values: GroupValues);
}

export interface GroupDescriptor {
    name?: string;
    columns?: string[],
    from?: number;
    to?: number;
}

/** Represents a definition of one group */
export interface DataGroup {
    name?: string;
    columns: Array<string>;
}

export interface DataAggregate { 
    colId: string, 
    funcId: string 
}

/** Represents an object that holds the list of columns 
 * and can perform a few operations over it */
export interface AggregationColumnStore {
    getColumnIds(from: number, to?: number): string[];
    validateColumns(colIds: string[]): boolean;
    validateAggregate(colId: string, funcId: string): boolean;
}
