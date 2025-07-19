import { expect } from "@olton/latte";

import { HttpRequest, HttpRequestDescriptor } from '../src/http/http_request';
import { HttpMethod } from '../src/http/http_method';

describe('HttpRequest', () => {
    let xhrMock: any;
    let requestDescriptor: HttpRequestDescriptor;

    beforeEach(() => {
        // Mock for XMLHttpRequest
        xhrMock = {
            open: mock(),
            abort: mock(),
            setRequestHeader: mock(),
            readyState: 0, // UNSENT
            UNSENT: 0,
            HEADERS_RECEIVED: 2,
            getAllResponseHeaders: mock().mockReturnValue('Content-Type: application/json\nX-Custom-Header: test')
        };

        // Basic request descriptor for tests
        requestDescriptor = {
            method: HttpMethod.GET,
            url: 'https://test.com/api',
            headers: {
                'Content-Type': 'application/json'
            },
            queryParams: {}
        };
    });

    it('should initialize request with passed parameters', () => {
        const request = new HttpRequest(xhrMock, requestDescriptor);
        
        expect(request.method).toBe(HttpMethod.GET);
        expect(request.url).toBe('https://test.com/api');
        expect(request.data).toBeUndefined();
    });

    it('should store passed data', () => {
        const data = { test: 'value' };
        requestDescriptor.data = data;
        
        const request = new HttpRequest(xhrMock, requestDescriptor);
        
        expect(request.data).toBe(data);
    });

    it('should add header using setHeader', () => {
        const request = new HttpRequest(xhrMock, requestDescriptor);
        
        request.setHeader('Authorization', 'Bearer token123');
        request.open();
        
        expect(xhrMock.setRequestHeader).toHaveBeenCalledWith('Authorization', 'Bearer token123');
    });

    it('should add query parameters using setQueryParam', () => {
        const request = new HttpRequest(xhrMock, requestDescriptor);
        
        request.setQueryParam('id', '123');
        request.open();
        
        expect(xhrMock.open).toHaveBeenCalledWith('GET', 'https://test.com/api?id=123', true);
    });

    it('should correctly combine multiple query parameters', () => {
        requestDescriptor.queryParams = {
            'id': '123',
            'name': 'test'
        };
        
        const request = new HttpRequest(xhrMock, requestDescriptor);
        request.open();
        
        expect(xhrMock.open).toHaveBeenCalledWith('GET', 'https://test.com/api?id=123&name=test', true);
    });

    it('should return XMLHttpRequest via getXMLHttpRequest', () => {
        const request = new HttpRequest(xhrMock, requestDescriptor);
        
        const xhr = request.getXMLHttpRequest();
        
        expect(xhr).toBe(xhrMock);
    });

    it('should parse response headers via getResponseHeaders', () => {
        xhrMock.readyState = xhrMock.HEADERS_RECEIVED;
        
        const request = new HttpRequest(xhrMock, requestDescriptor);
        const headers = request.getResponseHeaders();
        
        expect(headers).toBeObject({
            'Content-Type': 'application/json',
            'X-Custom-Header': 'test'
        });
    });

    it('should return empty headers object when readyState is not HEADERS_RECEIVED', () => {
        xhrMock.readyState = xhrMock.UNSENT;
        
        const request = new HttpRequest(xhrMock, requestDescriptor);
        const headers = request.getResponseHeaders();
        
        expect(headers).toBeObject({});
    });

    it('should open request with correct parameters', () => {
        const request = new HttpRequest(xhrMock, requestDescriptor);
        
        request.open();
        
        expect(xhrMock.open).toHaveBeenCalledWith('GET', 'https://test.com/api', true);
        expect(xhrMock.setRequestHeader).toHaveBeenCalledWith('X-Requested-With', 'XMLHttpRequest');
        expect(xhrMock.setRequestHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
    });

    it('should not open the request again if it is already open', () => {
        xhrMock.readyState = 1; // OPENED
        
        const request = new HttpRequest(xhrMock, requestDescriptor);
        request.open();
        
        expect(xhrMock.open).not.toHaveBeenCalled();
    });

    it('should call abort on XMLHttpRequest when abort is called', () => {
        const request = new HttpRequest(xhrMock, requestDescriptor);
        
        request.abort();
        
        expect(xhrMock.abort).toHaveBeenCalled();
    });

    it('should correctly encode URL with query parameters', () => {
        const request = new HttpRequest(xhrMock, requestDescriptor);
        
        request.setQueryParam('name', 'John Doe');
        request.setQueryParam('tags', 'tag1,tag2');
        request.open();
        
        // URL should be encoded correctly
        expect(xhrMock.open).toHaveBeenCalledWith('GET', 
            'https://test.com/api?name=John%20Doe&tags=tag1%2Ctag2', true);
    });

    it('should support various HTTP methods', () => {
        // Testing POST method
        requestDescriptor.method = HttpMethod.POST;
        let request = new HttpRequest(xhrMock, requestDescriptor);
        request.open();
        expect(xhrMock.open).toHaveBeenCalledWith('POST', 'https://test.com/api', true);
        
        // Testing PUT method
        xhrMock.open.mockClear();
        requestDescriptor.method = HttpMethod.PUT;
        request = new HttpRequest(xhrMock, requestDescriptor);
        request.open();
        expect(xhrMock.open).toHaveBeenCalledWith('PUT', 'https://test.com/api', true);
        
        // Testing DELETE method
        xhrMock.open.mockClear();
        requestDescriptor.method = HttpMethod.DELETE;
        request = new HttpRequest(xhrMock, requestDescriptor);
        request.open();
        expect(xhrMock.open).toHaveBeenCalledWith('DELETE', 'https://test.com/api', true);
    });
});
