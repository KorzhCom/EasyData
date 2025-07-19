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

        // Базовый дескриптор запроса для тестов
        requestDescriptor = {
            method: HttpMethod.GET,
            url: 'https://test.com/api',
            headers: {
                'Content-Type': 'application/json'
            },
            queryParams: {}
        };
    });

    it('should инициализировать запрос с переданными параметрами', () => {
        const request = new HttpRequest(xhrMock, requestDescriptor);
        
        expect(request.method).toBe(HttpMethod.GET);
        expect(request.url).toBe('https://test.com/api');
        expect(request.data).toBeUndefined();
    });

    it('should сохранять переданные данные', () => {
        const data = { test: 'value' };
        requestDescriptor.data = data;
        
        const request = new HttpRequest(xhrMock, requestDescriptor);
        
        expect(request.data).toBe(data);
    });

    it('should добавлять заголовок с помощью setHeader', () => {
        const request = new HttpRequest(xhrMock, requestDescriptor);
        
        request.setHeader('Authorization', 'Bearer token123');
        request.open();
        
        expect(xhrMock.setRequestHeader).toHaveBeenCalledWith('Authorization', 'Bearer token123');
    });

    it('should добавлять параметры запроса с помощью setQueryParam', () => {
        const request = new HttpRequest(xhrMock, requestDescriptor);
        
        request.setQueryParam('id', '123');
        request.open();
        
        expect(xhrMock.open).toHaveBeenCalledWith('GET', 'https://test.com/api?id=123', true);
    });

    it('should правильно объединять несколько параметров запроса', () => {
        requestDescriptor.queryParams = {
            'id': '123',
            'name': 'test'
        };
        
        const request = new HttpRequest(xhrMock, requestDescriptor);
        request.open();
        
        expect(xhrMock.open).toHaveBeenCalledWith('GET', 'https://test.com/api?id=123&name=test', true);
    });

    it('should return XMLHttpRequest через getXMLHttpRequest', () => {
        const request = new HttpRequest(xhrMock, requestDescriptor);
        
        const xhr = request.getXMLHttpRequest();
        
        expect(xhr).toBe(xhrMock);
    });

    it('should парсить заголовки ответа через getResponseHeaders', () => {
        xhrMock.readyState = xhrMock.HEADERS_RECEIVED;
        
        const request = new HttpRequest(xhrMock, requestDescriptor);
        const headers = request.getResponseHeaders();
        
        expect(headers).toBeObject({
            'Content-Type': 'application/json',
            'X-Custom-Header': 'test'
        });
    });

    it('should return пустой объект заголовков когда readyState не HEADERS_RECEIVED', () => {
        xhrMock.readyState = xhrMock.UNSENT;
        
        const request = new HttpRequest(xhrMock, requestDescriptor);
        const headers = request.getResponseHeaders();
        
        expect(headers).toBeObject({});
    });

    it('should открывать запрос с правильными параметрами', () => {
        const request = new HttpRequest(xhrMock, requestDescriptor);
        
        request.open();
        
        expect(xhrMock.open).toHaveBeenCalledWith('GET', 'https://test.com/api', true);
        expect(xhrMock.setRequestHeader).toHaveBeenCalledWith('X-Requested-With', 'XMLHttpRequest');
        expect(xhrMock.setRequestHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
    });

    it('не should открывать запрос повторно если он уже открыт', () => {
        xhrMock.readyState = 1; // OPENED
        
        const request = new HttpRequest(xhrMock, requestDescriptor);
        request.open();
        
        expect(xhrMock.open).not.toHaveBeenCalled();
    });

    it('should вызывать abort у XMLHttpRequest при вызове abort', () => {
        const request = new HttpRequest(xhrMock, requestDescriptor);
        
        request.abort();
        
        expect(xhrMock.abort).toHaveBeenCalled();
    });

    it('should correctly кодировать URL с параметрами запроса', () => {
        const request = new HttpRequest(xhrMock, requestDescriptor);
        
        request.setQueryParam('name', 'John Doe');
        request.setQueryParam('tags', 'tag1,tag2');
        request.open();
        
        // URL should быть закодирован правильно
        expect(xhrMock.open).toHaveBeenCalledWith('GET', 
            'https://test.com/api?name=John%20Doe&tags=tag1%2Ctag2', true);
    });

    it('should поддерживать различные HTTP методы', () => {
        // Тестируем метод POST
        requestDescriptor.method = HttpMethod.POST;
        let request = new HttpRequest(xhrMock, requestDescriptor);
        request.open();
        expect(xhrMock.open).toHaveBeenCalledWith('POST', 'https://test.com/api', true);
        
        // Тестируем метод PUT
        xhrMock.open.mockClear();
        requestDescriptor.method = HttpMethod.PUT;
        request = new HttpRequest(xhrMock, requestDescriptor);
        request.open();
        expect(xhrMock.open).toHaveBeenCalledWith('PUT', 'https://test.com/api', true);
        
        // Тестируем метод DELETE
        xhrMock.open.mockClear();
        requestDescriptor.method = HttpMethod.DELETE;
        request = new HttpRequest(xhrMock, requestDescriptor);
        request.open();
        expect(xhrMock.open).toHaveBeenCalledWith('DELETE', 'https://test.com/api', true);
    });
});
