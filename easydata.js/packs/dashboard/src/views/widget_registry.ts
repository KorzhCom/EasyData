import {Registry} from "../utils/registry";
import {EasyDatagrid} from "../widgets/datagrid";
import {EasyChart} from "../widgets/chart";

const REGISTRY = new Registry(globalThis.registry = {})

REGISTRY.register('DataGrid', EasyDatagrid)
REGISTRY.register('Chart', EasyChart)

export default REGISTRY