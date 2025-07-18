describe('Demo', () => {
    it('should run a simple test', () => {
        expect(1 + 1).toBe(2);
    });

    it('should mock a function', () => {
        const mockFunction = mock(() => 42, null, 'default');
        expect(mockFunction()).toBe(42);
    });

    it('should create a class instance', () => {
        class DemoClass {
            constructor(public name: string) {}
        }
        const instance = new DemoClass('Test');
        expect(instance.name).toBe('Test');
    });
})