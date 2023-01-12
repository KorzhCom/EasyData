import {Registry} from "../utils/registry";
import {GoogleChartAdapter} from "./googlechart"
import {ChartJSAdapter} from "./chartjs"

const ADAPTER_REGISTRY = new Registry(globalThis.aregistry = {})

ADAPTER_REGISTRY.register("googlechart", new GoogleChartAdapter())
ADAPTER_REGISTRY.register("chartjs", new ChartJSAdapter())

export default ADAPTER_REGISTRY
