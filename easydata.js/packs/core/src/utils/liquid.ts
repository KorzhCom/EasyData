export namespace liquid {
    export function renderLiquidTemplate(template : string, vars: any) {
        let result = template;

        if (vars) {
            for (let v in vars) {
                const liquidVarRegexp = new RegExp('\{\{' + v + '\}\}', 'g');
                result = result.replace(liquidVarRegexp, vars[v]);
            }    
        }
        return result;
    }
}