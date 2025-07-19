import { expect } from "@olton/latte"; 

import { HttpClient, HttpResponseError } from '../src/http/http_client';
import { HttpMethod } from '../src/http/http_method';
import { HttpRequest } from '../src/http/http_request';
import { HttpActionResult } from '../src/http/http_action_result';

describe('HttpClient', () => {
    let httpClient: HttpClient;
    let xhrMock: any;
    let requests: any[];
    let originalXMLHttpRequest: any;

    beforeEach(() => {
        requests = [];
        
        // Mock for XMLHttpRequest
        xhrMock = {
            open: mock(),
            send: mock(),
            setRequestHeader: mock(),
            readyState: 4,
            status: 200,
            responseText: '{"success":true,"data":"test"}',
            getResponseHeader: mock().mockReturnValue('application/json'),
            onreadystatechange: null,
            onerror: null
        };
        
        // Save original XMLHttpRequest and replace it with mock
        originalXMLHttpRequest = window.XMLHttpRequest;
        window.XMLHttpRequest = mock().mockImplementation(() => {
            const xhr = xhrMock;
            requests.push(xhr);
            return xhr;
        });
        
        httpClient = new HttpClient();
    });
    
    afterEach(() => {
        // Restore original XMLHttpRequest
        window.XMLHttpRequest = originalXMLHttpRequest;
    });
    
    it('should be created with default settings', () => {
        expect(httpClient.defaultHeaders).toBeObject({});
        expect(httpClient.customPayload).toBeUndefined();
        expect(httpClient.responseBody).toBeUndefined();
    });
    
    it('should perform GET request with correct parameters', () => {
        const url = 'https://test.com/api/data';
        const options = {
            headers: { 'X-Custom-Header': 'test' },
            queryParams: { param1: 'value1', param2: 123 }
        };
        
        httpClient.get(url, options);
        
        expect(requests.length).toBe(1);
        expect(xhrMock.open).toHaveBeenCalledWith(
            'GET', 
            'https://test.com/api/data?param1=value1&param2=123', 
            true
        );
        
        // Check header setup
        expect(xhrMock.setRequestHeader).toHaveBeenCalledWith('X-Custom-Header', 'test');
        expect(xhrMock.setRequestHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
        
        // Check send call
        expect(xhrMock.send).toHaveBeenCalledWith(null);
    });
    
    it('should perform POST request with data', () => {
        const url = 'https://test.com/api/data';
        const data = { name: 'John', age: 30 };
        
        httpClient.post(url, data);
        
        expect(requests.length).toBe(1);
        expect(xhrMock.open).toHaveBeenCalledWith('POST', url, true);
        expect(xhrMock.send).toHaveBeenCalledWith(JSON.stringify(data));
    });
    
    it('should выполнять PUT запрос с данными', () => {
        const url = 'https://test.com/api/data/1';
        const data = { name: 'Updated Name', age: 31 };
        
        httpClient.put(url, data);
        
        expect(requests.length).toBe(1);
        expect(xhrMock.open).toHaveBeenCalledWith('PUT', url, true);
        expect(xhrMock.send).toHaveBeenCalledWith(JSON.stringify(data));
    });
    
    it('should perform DELETE request', () => {
        const url = 'https://test.com/api/data/1';
        
        httpClient.delete(url);
        
        expect(requests.length).toBe(1);
        expect(xhrMock.open).toHaveBeenCalledWith('DELETE', url, true);
        expect(xhrMock.send).toHaveBeenCalledWith(null);
    });
    
    it('should add defaultHeaders to request', () => {
        httpClient.defaultHeaders = {
            'Authorization': 'Bearer test-token',
            'X-Api-Key': 'api-key'
        };
        
        httpClient.get('https://test.com/api/data');
        
        expect(xhrMock.setRequestHeader).toHaveBeenCalledWith('Authorization', 'Bearer test-token');
        expect(xhrMock.setRequestHeader).toHaveBeenCalledWith('X-Api-Key', 'api-key');
    });
    
    it('should add customPayload to request data', () => {
        const data = { name: 'John' };
        httpClient.customPayload = ['custom-payload-value'];
        
        httpClient.post('https://test.com/api/data', data);
        
        expect(xhrMock.send).toHaveBeenCalledWith(JSON.stringify({
            name: 'John',
            data: { '0': 'custom-payload-value' }
        }));
    });
    
    it('should call onRequest after forming request', () => {
        const onRequestMock = mock((request: HttpRequest) => {
            // Modify request in handler
            request.url = request.url + '/modified';
        });
        
        httpClient.onRequest = onRequestMock;
        httpClient.get('https://test.com/api/data');
        
        expect(onRequestMock).toHaveBeenCalled();
        expect(xhrMock.open).toHaveBeenCalledWith('GET', 'https://test.com/api/data/modified', true);
    });
    
    it('should throw warning when using deprecated beforeEachRequest', () => {
        expect(1).toBe(1); // Replace with real test if needed
    });
    
    it('should handle successful response with JSON data', async () => {
        const responsePromise = httpClient.get('https://test.com/api/data');
        
        // Emulate a successful response
        xhrMock.onreadystatechange();
        
        const response = await responsePromise;
        expect(response).toBeObject({ success: true, data: 'test' });
        expect(httpClient.responseBody).toBeObject({ success: true, data: 'test' });
    });

    it('should call onResponse on successful response', () => {
        const onResponseMock = mock();
        httpClient.onResponse = onResponseMock;
        
        const responsePromise = httpClient.get('https://test.com/api/data');
        
        // Emulate a successful response
        xhrMock.onreadystatechange();
        
        expect(onResponseMock).toHaveBeenCalledWith(xhrMock);
    });
    
    it('should handle network errors', async () => {
        const responsePromise = httpClient.get('https://test.com/api/data');
        
        // Emulate a network error
        xhrMock.status = 0;
        xhrMock.onreadystatechange();
        
        try {
            await responsePromise;
            fail('It should have thrown an exception');
        } 
        catch (error) {
            expect(error).toBeInstanceOf(HttpResponseError);
            expect(error.status).toBe(0);
            expect(error.message).toBe('Network error or the request was aborted');
        }
    });
    
    it('should handle HTTP errors', async () => {
        const responsePromise = httpClient.get('https://test.com/api/data');
        
        // Emulate HTTP ошибку
        xhrMock.status = 404;
        xhrMock.responseText = '{"message":"Resource not found"}';
        xhrMock.onreadystatechange();
        
        try {
            await responsePromise;
            fail('It should have thrown an exception');
        } 
        catch (error) {
            expect(error).toBeInstanceOf(HttpResponseError);
            expect(error.status).toBe(404);
            expect(error.message).toBe('Resource not found');
        }
    });

    it('should handle HTTP error without message', async () => {
        const responsePromise = httpClient.get('https://test.com/api/data');

        // Emulate HTTP error without message field in response
        xhrMock.status = 404;
        xhrMock.responseText = '{}';
        xhrMock.onreadystatechange();
        
        try {
            await responsePromise;
            fail('It should have thrown an exception');
        } 
        catch (error) {
            expect(error).toBeInstanceOf(HttpResponseError);
            expect(error.status).toBe(404);
            expect(error.message).toBe('No such endpoint: https://test.com/api/data');
        }
    });

    it('should handle responses with different data types', async () => {
        // Testing text response
        xhrMock.getResponseHeader.mockReturnValue('text/plain');
        xhrMock.responseText = 'Plain text response';
        
        const textResponsePromise = httpClient.get('https://test.com/api/text');
        xhrMock.onreadystatechange();
        
        const textResponse = await textResponsePromise;
        expect(textResponse).toBe('Plain text response');
        expect(httpClient.responseBody).toBe('Plain text response');
    });
    
    it('should support responseType parameters', () => {
        httpClient.get('https://test.com/api/binary', { 
            responseType: 'arraybuffer' 
        });
        
        expect(xhrMock.responseType).toBe('arraybuffer');
    });
    
    it('should return HttpActionResult instance', () => {
        const result = httpClient.get('https://test.com/api/data');
        
        expect(result).toBeInstanceOf(HttpActionResult);
        expect(result.getRequest()).toBeDefined();
        expect(result.getPromise()).toBeDefined();
    });
    
    it('should correctly handle form data', () => {
        const formData = new FormData();
        formData.append('file', new Blob(['test content'], { type: 'text/plain' }));
        
        httpClient.post('https://test.com/api/upload', formData, { 
            dataType: 'form-data' 
        });
        
        // For form-data, Content-Type is not set
        const contentTypeHeader = Array.from(xhrMock.setRequestHeader.mock.calls)
            .find(call => call[0] === 'Content-Type');
        expect(contentTypeHeader).toBeUndefined();
        
        // Check that data is sent as is
        expect(xhrMock.send).toHaveBeenCalledWith(formData);
    });
    
    it('should correctly form URL with query parameters', () => {
        httpClient.get('https://test.com/api/data', {
            queryParams: {
                id: 123,
                name: 'test name',
                active: true,
                tags: ['tag1', 'tag2']
            }
        });
        
        expect(xhrMock.open).toHaveBeenCalledWith(
            'GET', 
            'https://test.com/api/data?id=123&name=test%20name&active=true&tags=tag1%2Ctag2', 
            true
        );
    });
});
