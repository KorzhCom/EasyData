
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

    /** Returns true if the aggregated data should be recalculated
     * (for example because of a new chunk of data was fetched)
     */
    needRecalculation() : boolean;

    /** Clears all internal structures and sets needRecalculation to true */
    reset(): void;
}

/** Represents a group key which is a list og (columnId:value) pairs.  */
export interface GroupKey {
    [key: string]: any;
}

/** Represents the totals of one group - a list (AggregationColumnId:AggregatedValue) pairs */
export interface GroupTotals {
    [key: string]: any;
}

/** Represents the internal storage of aggregated data (totals) inside AggregatesContainer */
type AggregatedData = Map<string, GroupTotals>;


/** Defines the interface for container that stores aggregated data (totals) */
export interface AggregatesContainer {
    setAggregateData(level: number, data: AggregatedData);
    getAggregateData(level: number, key: GroupKey): Promise<GroupTotals>;
    updateAggregateData(level: number, groupKey : GroupKey, values: GroupTotals);
}

/** Represents an auxiliary type that is used to to create a new DataGroup  */
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

export interface AggregateColumn { 
    colId: string, 
    funcId: string 
}

/** Represents an object that holds the list of columns 
 * and can perform a few operations over them */
export interface AggregationColumnStore {
    getColumnIds(from: number, to?: number): string[];
    validateColumns(colIds: string[]): boolean;
    validateAggregate(colId: string, funcId: string): boolean;
}
