import { HttpActionResult } from '../src/http/http_action_result';
import { HttpRequest } from '../src/http/http_request';

describe('HttpActionResult', () => {
    let mockRequest: HttpRequest;
    let mockPromise: Promise<string>;
    let actionResult: HttpActionResult<string>;
    
    beforeEach(() => {
        // Create mock for HttpRequest
        mockRequest = {
            url: 'https://test.com/api',
            method: 'GET'
        } as HttpRequest;
        
        // Create Promise that successfully resolves with value 'success'
        mockPromise = Promise.resolve('success');
        
        // Create instance HttpActionResult
        actionResult = new HttpActionResult<string>(mockRequest, mockPromise);
    });
    
    it('should store request and promise passed to constructor', () => {
        expect(actionResult.getRequest()).toBe(mockRequest);
        expect(actionResult.getPromise()).toBe(mockPromise);
    });
    
    it('should return original request via getRequest', () => {
        const request = actionResult.getRequest();
        expect(request).toBe(mockRequest);
        expect(request.url).toBe('https://test.com/api');
        expect(request.method).toBe('GET');
    });
    
    it('should return original promise via getPromise', () => {
        const promise = actionResult.getPromise();
        expect(promise).toBe(mockPromise);
        
        return promise.then(value => {
            expect(value).toBe('success');
        });
    });
    
    it('should implement then method and get value from promise', () => {
        let resultValue = '';
        
        return actionResult.then(value => {
            resultValue = value;
            return 'modified';
        }).then(modifiedValue => {
            expect(resultValue).toBe('success');
            expect(modifiedValue).toBe('modified');
        });
    });
    
    it('should properly handle rejected promise in then method', () => {
        // Create rejected promise
        const rejectedPromise = Promise.reject(new Error('error message'));
        const rejectedResult = new HttpActionResult<string>(mockRequest, rejectedPromise);
        
        let errorCaught = false;
        let errorInThen = false;
        
        return rejectedResult
            .then(
                () => {
                    // This code should not execute
                    errorInThen = true;
                },
                (error) => {
                    // Should end up here
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
    
    it('should implement catch method and handle errors', () => {
        // Create rejected promise
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
    
    it('should implement "finally" method and call it regardless of result', () => {
        let finallyCalled = false;
        
        return actionResult
            .finally(() => {
                finallyCalled = true;
            })
            .then(() => {
                expect(finallyCalled).toBe(true);
            });
    });
    
    it('should call finally even on error', () => {
        // Create rejected promise
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
    
    it('should support method chaining of then, catch and finally', () => {
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
                // Should not be called
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
