import { HttpActionResult } from '../src/http/http_action_result';
import { HttpRequest } from '../src/http/http_request';

describe('HttpActionResult', () => {
    let mockRequest: HttpRequest;
    let mockPromise: Promise<string>;
    let actionResult: HttpActionResult<string>;
    
    beforeEach(() => {
        // Создаем мок для HttpRequest
        mockRequest = {
            url: 'https://test.com/api',
            method: 'GET'
        } as HttpRequest;
        
        // Создаем Promise, который успешно завершается со значением 'success'
        mockPromise = Promise.resolve('success');
        
        // Создаем экземпляр HttpActionResult
        actionResult = new HttpActionResult<string>(mockRequest, mockPromise);
    });
    
    it('должен сохранять request и promise переданные в конструктор', () => {
        expect(actionResult.getRequest()).toBe(mockRequest);
        expect(actionResult.getPromise()).toBe(mockPromise);
    });
    
    it('должен возвращать исходный request через getRequest', () => {
        const request = actionResult.getRequest();
        expect(request).toBe(mockRequest);
        expect(request.url).toBe('https://test.com/api');
        expect(request.method).toBe('GET');
    });
    
    it('должен возвращать исходный promise через getPromise', () => {
        const promise = actionResult.getPromise();
        expect(promise).toBe(mockPromise);
        
        return promise.then(value => {
            expect(value).toBe('success');
        });
    });
    
    it('должен реализовать метод then и получить значение из promise', () => {
        let resultValue = '';
        
        return actionResult.then(value => {
            resultValue = value;
            return 'modified';
        }).then(modifiedValue => {
            expect(resultValue).toBe('success');
            expect(modifiedValue).toBe('modified');
        });
    });
    
    it('должен правильно обрабатывать rejected promise в методе then', () => {
        // Создаем rejected promise
        const rejectedPromise = Promise.reject(new Error('error message'));
        const rejectedResult = new HttpActionResult<string>(mockRequest, rejectedPromise);
        
        let errorCaught = false;
        let errorInThen = false;
        
        return rejectedResult
            .then(
                () => {
                    // Этот код не должен выполниться
                    errorInThen = true;
                },
                (error) => {
                    // Должны попасть сюда
                    errorCaught = true;
                    expect(error.message).toBe('error message');
                    return 'recovered';
                }
            )
            .then(value => {
                expect(errorCaught).toBe(true);
                expect(errorInThen).toBe(false);
                expect(value).toBe('recovered');
            });
    });
    
    it('должен реализовать метод catch и обрабатывать ошибки', () => {
        // Создаем rejected promise
        const rejectedPromise = Promise.reject(new Error('test error'));
        const rejectedResult = new HttpActionResult<string>(mockRequest, rejectedPromise);
        
        let errorCaught = false;
        
        return rejectedResult
            .catch(error => {
                errorCaught = true;
                expect(error.message).toBe('test error');
                return 'recovered';
            })
            .then(value => {
                expect(errorCaught).toBe(true);
                expect(value).toBe('recovered');
            });
    });
    
    it('должен реализовать метод finally и вызвать его независимо от результата', () => {
        let finallyCalled = false;
        
        return actionResult
            .finally(() => {
                finallyCalled = true;
            })
            .then(() => {
                expect(finallyCalled).toBe(true);
            });
    });
    
    it('должен вызвать finally даже при ошибке', () => {
        // Создаем rejected promise
        const rejectedPromise = Promise.reject(new Error('test error'));
        const rejectedResult = new HttpActionResult<string>(mockRequest, rejectedPromise);
        
        let finallyCalled = false;
        
        return rejectedResult
            .finally(() => {
                finallyCalled = true;
            })
            .catch(() => {
                expect(finallyCalled).toBe(true);
            });
    });
    
    it('должен поддерживать цепочку методов then, catch и finally', () => {
        let thenCalled = false;
        let catchCalled = false;
        let finallyCalled = false;
        
        return actionResult
            .then(value => {
                thenCalled = true;
                expect(value).toBe('success');
                return value.toUpperCase();
            })
            .catch(() => {
                // Не должен быть вызван
                catchCalled = true;
                return 'error';
            })
            .finally(() => {
                finallyCalled = true;
            })
            .then(value => {
                expect(thenCalled).toBe(true);
                expect(catchCalled).toBe(false);
                expect(finallyCalled).toBe(true);
                expect(value).toBe('SUCCESS');
            });
    });
});
