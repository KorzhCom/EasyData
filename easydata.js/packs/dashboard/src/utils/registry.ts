export class Registry {
    private registry: any

    constructor(registry) {
        this.registry = registry
    }

    register(name, _class){
        if (this.registry[name]) {
            return
        }
        this.registry[name] = _class
    }

    unregister(name, _class){
        if (!this.registry[name] || this.registry[name] !== _class) {
            return
        }
        delete this.registry[name]
    }

    getClass(name){
        return this.registry[name]
    }

    getRegistry(){
        return this.registry
    }

    dump(){
        console.log(this.registry)
    }
}