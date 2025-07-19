import { EventEmitter, EqEvent } from '../src/event/event_emitter';

describe('EventEmitter', () => {
    let eventEmitter: EventEmitter;
    let source: object;

    beforeEach(() => {
        source = { name: 'TestSource' };
        eventEmitter = new EventEmitter(source);
    });

    it('should создаваться с указанным источником', () => {
        expect(eventEmitter).toBeDefined();
        
        // Нам нужно вызвать событие, чтобы проверить источник
        const testCallback = (event: EqEvent) => {
            expect(event.source).toBe(source);
        };

        eventEmitter.subscribe('testEvent', testCallback);
        eventEmitter.fire('testEvent');
    });

    it('should return ID подписки при подписке на событие', () => {
        const callback = (event: EqEvent) => {};
        
        const subscriptionId = eventEmitter.subscribe('testEvent', callback);
        
        expect(subscriptionId).toBeDefined();
        expect(typeof subscriptionId).toBe('string');
        expect(subscriptionId.length).toBeGreaterThan(0);
    });

    it('should вызывать колбэк при активации события', () => {
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

    it('should вызывать несколько колбэков для одного события', () => {
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

    it('should вызывать только колбэки для указанного типа события', () => {
        let event1CallCount = 0;
        let event2CallCount = 0;
        
        eventEmitter.subscribe('event1', () => { event1CallCount++; });
        eventEmitter.subscribe('event2', () => { event2CallCount++; });
        
        eventEmitter.fire('event1');
        
        expect(event1CallCount).toBe(1);
        expect(event2CallCount).toBe(0);
    });

    it('не should вызывать колбэк после отписки', () => {
        let callbackCalled = false;
        
        const callback = () => { callbackCalled = true; };
        
        const subscriptionId = eventEmitter.subscribe('testEvent', callback);
        eventEmitter.unsubscribe('testEvent', subscriptionId);
        eventEmitter.fire('testEvent');
        
        expect(callbackCalled).toBe(false);
    });

    it('should правильно работать при отписке несуществующего ID', () => {
        // Не должно выбрасывать исключение
        expect(() => {
            eventEmitter.unsubscribe('testEvent', 'non-existent-id');
        }).not.toThrow();
    });

    it('should правильно работать при попытке активации несуществующего события', () => {
        // Не должно выбрасывать исключение
        expect(() => {
            eventEmitter.fire('non-existent-event');
        }).not.toThrow();
    });

    it('should откладывать выполнение события с параметром postpone', (done) => {
        let callbackCalled = false;
        
        const callback = () => {
            callbackCalled = true;
            expect(callbackCalled).toBe(true);
        };
        
        eventEmitter.subscribe('testEvent', callback);
        
        eventEmitter.fire('testEvent', null, 50); // отложить на 50 мс
        
        // Сразу после вызова fire колбэк еще не should быть вызван
        expect(callbackCalled).toBe(false);
    });

    it('should входить в тихий режим и выходить из него', () => {
        let callbackCalled = false;
        
        const callback = () => { callbackCalled = true; };
        
        eventEmitter.subscribe('testEvent', callback);
        
        // По умолчанию не в тихом режиме
        expect(eventEmitter.isSilent()).toBe(false);
        
        // Входим в тихий режим
        eventEmitter.enterSilentMode();
        expect(eventEmitter.isSilent()).toBe(true);
        
        // В тихом режиме колбэк не should вызываться
        eventEmitter.fire('testEvent');
        expect(callbackCalled).toBe(false);
        
        // Выходим из тихого режима
        eventEmitter.exitSilentMode();
        expect(eventEmitter.isSilent()).toBe(false);
        
        // После выхода из тихого режима колбэк should вызываться
        eventEmitter.fire('testEvent');
        expect(callbackCalled).toBe(true);
    });

    it('should поддерживать вложенный тихий режим', () => {
        let callbackCalled = false;
        
        const callback = () => { callbackCalled = true; };
        
        eventEmitter.subscribe('testEvent', callback);
        
        // Входим в тихий режим дважды
        eventEmitter.enterSilentMode();
        eventEmitter.enterSilentMode();
        expect(eventEmitter.isSilent()).toBe(true);
        
        // Выходим из тихого режима один раз - все еще должны быть в тихом режиме
        eventEmitter.exitSilentMode();
        expect(eventEmitter.isSilent()).toBe(true);
        
        // В тихом режиме колбэк не should вызываться
        eventEmitter.fire('testEvent');
        expect(callbackCalled).toBe(false);
        
        // Выходим из тихого режима еще раз
        eventEmitter.exitSilentMode();
        expect(eventEmitter.isSilent()).toBe(false);
        
        // После полного выхода из тихого режима колбэк should вызываться
        eventEmitter.fire('testEvent');
        expect(callbackCalled).toBe(true);
    });

    it('should принудительно вызывать события в тихом режиме с параметром force', () => {
        let callbackCalled = false;
        
        const callback = () => { callbackCalled = true; };
        
        eventEmitter.subscribe('testEvent', callback);
        
        // Входим в тихий режим
        eventEmitter.enterSilentMode();
        expect(eventEmitter.isSilent()).toBe(true);
        
        // Обычный вызов не should срабатывать
        eventEmitter.fire('testEvent');
        expect(callbackCalled).toBe(false);
        
        // Принудительный вызов should сработать даже в тихом режиме
        eventEmitter.fire('testEvent', null, 0, true);
        expect(callbackCalled).toBe(true);
    });
});
