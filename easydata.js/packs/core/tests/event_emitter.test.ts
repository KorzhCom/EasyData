import { EventEmitter, EqEvent } from '../src/event/event_emitter';

describe('EventEmitter', () => {
    let eventEmitter: EventEmitter;
    let source: object;

    beforeEach(() => {
        source = { name: 'TestSource' };
        eventEmitter = new EventEmitter(source);
    });

    it('should be created with a specified source', () => {
        expect(eventEmitter).toBeDefined();

        // We need to fire an event to check the source
        const testCallback = (event: EqEvent) => {
            expect(event.source).toBe(source);
        };

        eventEmitter.subscribe('testEvent', testCallback);
        eventEmitter.fire('testEvent');
    });

    it('should return ID of subscription when subscribing to an event', () => {
        const callback = (event: EqEvent) => {};
        
        const subscriptionId = eventEmitter.subscribe('testEvent', callback);
        
        expect(subscriptionId).toBeDefined();
        expect(typeof subscriptionId).toBe('string');
        expect(subscriptionId.length).toBeGreaterThan(0);
    });

    it('should call a callback when event is fired', () => {
        let callbackCalled = false;
        const testData = { test: 'data' };
        
        const callback = (event: EqEvent) => {
            callbackCalled = true;
            expect(event.type).toBe('testEvent');
            expect(event.source).toBe(source);
            expect(event.data).toBe(testData);
        };
        
        eventEmitter.subscribe('testEvent', callback);
        eventEmitter.fire('testEvent', testData);
        
        expect(callbackCalled).toBe(true);
    });

    it('should call multiple callbacks for a single event', () => {
        let callCount = 0;
        
        const callback1 = () => { callCount++; };
        const callback2 = () => { callCount++; };
        const callback3 = () => { callCount++; };
        
        eventEmitter.subscribe('testEvent', callback1);
        eventEmitter.subscribe('testEvent', callback2);
        eventEmitter.subscribe('testEvent', callback3);
        
        eventEmitter.fire('testEvent');
        
        expect(callCount).toBe(3);
    });

    it('should call only callbacks for the specified event type', () => {
        let event1CallCount = 0;
        let event2CallCount = 0;
        
        eventEmitter.subscribe('event1', () => { event1CallCount++; });
        eventEmitter.subscribe('event2', () => { event2CallCount++; });
        
        eventEmitter.fire('event1');
        
        expect(event1CallCount).toBe(1);
        expect(event2CallCount).toBe(0);
    });

    it('should not call a callback after unsubscribing', () => {
        let callbackCalled = false;
        
        const callback = () => { callbackCalled = true; };
        
        const subscriptionId = eventEmitter.subscribe('testEvent', callback);
        eventEmitter.unsubscribe('testEvent', subscriptionId);
        eventEmitter.fire('testEvent');
        
        expect(callbackCalled).toBe(false);
    });

    it('should work correctly when unsubscribing non-existent ID', () => {
        // Should not throw an exception
        expect(() => {
            eventEmitter.unsubscribe('testEvent', 'non-existent-id');
        }).not.toThrow();
    });

    it('should work correctly when firing non-existent event', () => {
        // Should not throw an exception
        expect(() => {
            eventEmitter.fire('non-existent-event');
        }).not.toThrow();
    });

    it('should postpone event execution with a postpone parameter', (done) => {
        let callbackCalled = false;
        
        const callback = () => {
            callbackCalled = true;
            expect(callbackCalled).toBe(true);
        };
        
        eventEmitter.subscribe('testEvent', callback);
        
        eventEmitter.fire('testEvent', null, 50); // delay for 50 ms
        
        // Immediately after calling fire, callback should not be called yet
        expect(callbackCalled).toBe(false);
    });

    it('should enter silent mode and exit from it', () => {
        let callbackCalled = false;
        
        const callback = () => { callbackCalled = true; };
        
        eventEmitter.subscribe('testEvent', callback);
        
        // By default, not in silent mode
        expect(eventEmitter.isSilent()).toBe(false);
        
        // Entering silent mode
        eventEmitter.enterSilentMode();
        expect(eventEmitter.isSilent()).toBe(true);
        
        // In silent mode, the callback should not be called
        eventEmitter.fire('testEvent');
        expect(callbackCalled).toBe(false);
        
        // Exiting silent mode
        eventEmitter.exitSilentMode();
        expect(eventEmitter.isSilent()).toBe(false);
        
        // After exiting silent mode, callback should be called
        eventEmitter.fire('testEvent');
        expect(callbackCalled).toBe(true);
    });

    it('should support nested silent mode', () => {
        let callbackCalled = false;
        
        const callback = () => { callbackCalled = true; };
        
        eventEmitter.subscribe('testEvent', callback);
        
        // Enter silent mode twice
        eventEmitter.enterSilentMode();
        eventEmitter.enterSilentMode();
        expect(eventEmitter.isSilent()).toBe(true);
        
        // Exit silent mode once - should still be in silent mode
        eventEmitter.exitSilentMode();
        expect(eventEmitter.isSilent()).toBe(true);
        
        // In silent mode, callback should not be called
        eventEmitter.fire('testEvent');
        expect(callbackCalled).toBe(false);
        
        // Exit silent mode once more
        eventEmitter.exitSilentMode();
        expect(eventEmitter.isSilent()).toBe(false);
        
        // After fully exiting silent mode, callback should be called
        eventEmitter.fire('testEvent');
        expect(callbackCalled).toBe(true);
    });

    it('should force trigger events in silent mode with force parameter', () => {
        let callbackCalled = false;
        
        const callback = () => { callbackCalled = true; };
        
        eventEmitter.subscribe('testEvent', callback);
        
        // Enter silent mode
        eventEmitter.enterSilentMode();
        expect(eventEmitter.isSilent()).toBe(true);
        
        // Normal call should not trigger
        eventEmitter.fire('testEvent');
        expect(callbackCalled).toBe(false);
        
        // Forced call should work even in silent mode
        eventEmitter.fire('testEvent', null, 0, true);
        expect(callbackCalled).toBe(true);
    });
});
