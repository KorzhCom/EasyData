export interface ChartAdapter {
    checkLib(),
    createChart(ctx, datasets, wo),
    createContext(),
}