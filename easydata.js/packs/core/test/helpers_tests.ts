//lib
import { utils } from "../src/utils/utils";

describe("Functions", ()=> {
    it("assign", () => {
        let object1 = {
            data: "Hello",
            val: "test"
        };

        let object2 = {
            data: "why",
            prop: "hello",
        };

        let object3 = {
            column: "test"
        };

        let result = utils.assign(object1, object2, object3);
        expect(result.data).toBe(object2.data);
        expect(result.prop).toBe(object2.prop);
        expect(result.val).toBe(object1.val);
        expect(result.column).toBe(object3.column);
    });

    it("assignDeep", () => {
        let object1 = {
            data: {
                get: "bla",
                set: "kek"
            },
            val: "test",
        };

        let object2: any = {
            data: {
                get: "why"
            },
            prop: "hello",
        };

        let object3 = {
            data: {
                set: "ohh"
            },
            column: "test"
        };

        let result = utils.assignDeep(object1, object2, object3);
        expect(result.data.get).toBe(object2.data.get);
        expect(result.data.set).toBe(object3.data.set);
        expect(result.val).toBe(object1.val);
        expect(result.prop).toBe(object2.prop);
        expect(result.column).toBe(object3.column);

    });

    it('assignDeep circular', () => {
        function A() {}
        function B() {}
        var a = new A();
        var b = new B();
        a.b = b;
        b.a = a;

        const result = utils.assignDeep({}, a);
        expect(result.b.a).toEqual(a);
    });

    it('assignDeep array', () => {
       
        let object1 = {
            arr: [
                {
                    data: {
                        get: "bla",
                        set: "kek"
                    }
                }
            ]
        }

        let object2 = {
            arr: [
                {
                    data: {
                        get: "why"
                    } 
                }
            ]

        }

        utils.assignDeep(object1, object2);
        expect(object1.arr[0].data.get).toEqual(object2.arr[0].data.get);
    });
    
    it('generateId test', async () => {
        const array = []
        
        const gen_pack = () => {
            for (let i = 0; i < 100; i++) {
                array.push(utils.generateId('id'))
            }
        }

        const delay = (ms: number) => {
            return new Promise((resolve, reject) => {
                setTimeout(resolve, ms);
            });
        }

        gen_pack()
        
        for (let j = 0; j < 5; j++) {
            await delay(1000)
            gen_pack()
        }
        
        const test = new Set(array)

        expect(array.length).toEqual(test.size)
    }, 20000)
});
