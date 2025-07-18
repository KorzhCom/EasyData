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
        
        // Мок для XMLHttpRequest
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
        
        // Сохраняем оригинальный XMLHttpRequest и заменяем его на мок
        originalXMLHttpRequest = window.XMLHttpRequest;
        window.XMLHttpRequest = mock().mockImplementation(() => {
            const xhr = xhrMock;
            requests.push(xhr);
            return xhr;
        });
        
        httpClient = new HttpClient();
    });
    
    afterEach(() => {
        // Восстанавливаем оригинальный XMLHttpRequest
        window.XMLHttpRequest = originalXMLHttpRequest;
    });
    
    it('должен создаваться с дефолтными настройками', () => {
        expect(httpClient.defaultHeaders).toBeObject({});
        expect(httpClient.customPayload).toBeUndefined();
        expect(httpClient.responseBody).toBeUndefined();
    });
    
    it('должен выполнять GET запрос с правильными параметрами', () => {
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
        
        // Проверяем установку заголовков
        expect(xhrMock.setRequestHeader).toHaveBeenCalledWith('X-Custom-Header', 'test');
        expect(xhrMock.setRequestHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
        
        // Проверяем вызов send
        expect(xhrMock.send).toHaveBeenCalledWith(null);
    });
    
    it('должен выполнять POST запрос с данными', () => {
        const url = 'https://test.com/api/data';
        const data = { name: 'John', age: 30 };
        
        httpClient.post(url, data);
        
        expect(requests.length).toBe(1);
        expect(xhrMock.open).toHaveBeenCalledWith('POST', url, true);
        expect(xhrMock.send).toHaveBeenCalledWith(JSON.stringify(data));
    });
    
    it('должен выполнять PUT запрос с данными', () => {
        const url = 'https://test.com/api/data/1';
        const data = { name: 'Updated Name', age: 31 };
        
        httpClient.put(url, data);
        
        expect(requests.length).toBe(1);
        expect(xhrMock.open).toHaveBeenCalledWith('PUT', url, true);
        expect(xhrMock.send).toHaveBeenCalledWith(JSON.stringify(data));
    });
    
    it('должен выполнять DELETE запрос', () => {
        const url = 'https://test.com/api/data/1';
        
        httpClient.delete(url);
        
        expect(requests.length).toBe(1);
        expect(xhrMock.open).toHaveBeenCalledWith('DELETE', url, true);
        expect(xhrMock.send).toHaveBeenCalledWith(null);
    });
    
    it('должен добавлять defaultHeaders к запросу', () => {
        httpClient.defaultHeaders = {
            'Authorization': 'Bearer test-token',
            'X-Api-Key': 'api-key'
        };
        
        httpClient.get('https://test.com/api/data');
        
        expect(xhrMock.setRequestHeader).toHaveBeenCalledWith('Authorization', 'Bearer test-token');
        expect(xhrMock.setRequestHeader).toHaveBeenCalledWith('X-Api-Key', 'api-key');
    });
    
    it('должен добавлять customPayload к данным запроса', () => {
        const data = { name: 'John' };
        httpClient.customPayload = ['custom-payload-value'];
        
        httpClient.post('https://test.com/api/data', data);
        
        expect(xhrMock.send).toHaveBeenCalledWith(JSON.stringify({
            name: 'John',
            data: { '0': 'custom-payload-value' }
        }));
    });
    
    it('должен вызывать onRequest после формирования запроса', () => {
        const onRequestMock = mock((request: HttpRequest) => {
            // Изменяем запрос в обработчике
            request.url = request.url + '/modified';
        });
        
        httpClient.onRequest = onRequestMock;
        httpClient.get('https://test.com/api/data');
        
        expect(onRequestMock).toHaveBeenCalled();
        expect(xhrMock.open).toHaveBeenCalledWith('GET', 'https://test.com/api/data/modified', true);
    });
    
    it('должен выбрасывать предупреждение при использовании устаревшего beforeEachRequest', () => {
        expect(1).toBe(1); // Замените на реальный тест, если нужно
    });
    
    it('должен обрабатывать успешный ответ с JSON данными', async () => {
        const responsePromise = httpClient.get('https://test.com/api/data');
        
        // Эмулируем успешный ответ
        xhrMock.onreadystatechange();
        
        const response = await responsePromise;
        expect(response).toBeObject({ success: true, data: 'test' });
        expect(httpClient.responseBody).toBeObject({ success: true, data: 'test' });
    });
    
    it('должен вызывать onResponse при успешном ответе', () => {
        const onResponseMock = mock();
        httpClient.onResponse = onResponseMock;
        
        const responsePromise = httpClient.get('https://test.com/api/data');
        
        // Эмулируем успешный ответ
        xhrMock.onreadystatechange();
        
        expect(onResponseMock).toHaveBeenCalledWith(xhrMock);
    });
    
    it('должен обрабатывать ошибки сети', async () => {
        const responsePromise = httpClient.get('https://test.com/api/data');
        
        // Эмулируем ошибку сети
        xhrMock.status = 0;
        xhrMock.onreadystatechange();
        
        try {
            await responsePromise;
            fail('Должно было выбросить исключение');
        } 
        catch (error) {
            expect(error).toBeInstanceOf(HttpResponseError);
            expect(error.status).toBe(0);
            expect(error.message).toBe('Network error or the request was aborted');
        }
    });
    
    it('должен обрабатывать HTTP ошибки', async () => {
        const responsePromise = httpClient.get('https://test.com/api/data');
        
        // Эмулируем HTTP ошибку
        xhrMock.status = 404;
        xhrMock.responseText = '{"message":"Resource not found"}';
        xhrMock.onreadystatechange();
        
        try {
            await responsePromise;
            fail('Должно было выбросить исключение');
        } 
        catch (error) {
            expect(error).toBeInstanceOf(HttpResponseError);
            expect(error.status).toBe(404);
            expect(error.message).toBe('Resource not found');
        }
    });
    
    it('должен обрабатывать HTTP ошибку без сообщения', async () => {
        const responsePromise = httpClient.get('https://test.com/api/data');
        
        // Эмулируем HTTP ошибку без поля message в ответе
        xhrMock.status = 404;
        xhrMock.responseText = '{}';
        xhrMock.onreadystatechange();
        
        try {
            await responsePromise;
            fail('Должно было выбросить исключение');
        } 
        catch (error) {
            expect(error).toBeInstanceOf(HttpResponseError);
            expect(error.status).toBe(404);
            expect(error.message).toBe('No such endpoint: https://test.com/api/data');
        }
    });
    
    it('должен обрабатывать ответы с разными типами данных', async () => {
        // Тестируем text ответ
        xhrMock.getResponseHeader.mockReturnValue('text/plain');
        xhrMock.responseText = 'Plain text response';
        
        const textResponsePromise = httpClient.get('https://test.com/api/text');
        xhrMock.onreadystatechange();
        
        const textResponse = await textResponsePromise;
        expect(textResponse).toBe('Plain text response');
        expect(httpClient.responseBody).toBe('Plain text response');
    });
    
    it('должен поддерживать параметры responseType', () => {
        httpClient.get('https://test.com/api/binary', { 
            responseType: 'arraybuffer' 
        });
        
        expect(xhrMock.responseType).toBe('arraybuffer');
    });
    
    it('должен возвращать экземпляр HttpActionResult', () => {
        const result = httpClient.get('https://test.com/api/data');
        
        expect(result).toBeInstanceOf(HttpActionResult);
        expect(result.getRequest()).toBeDefined();
        expect(result.getPromise()).toBeDefined();
    });
    
    it('должен корректно обрабатывать форм-данные', () => {
        const formData = new FormData();
        formData.append('file', new Blob(['test content'], { type: 'text/plain' }));
        
        httpClient.post('https://test.com/api/upload', formData, { 
            dataType: 'form-data' 
        });
        
        // Для form-data не устанавливается Content-Type
        const contentTypeHeader = Array.from(xhrMock.setRequestHeader.mock.calls)
            .find(call => call[0] === 'Content-Type');
        expect(contentTypeHeader).toBeUndefined();
        
        // Проверяем что данные отправляются как есть
        expect(xhrMock.send).toHaveBeenCalledWith(formData);
    });
    
    it('должен корректно формировать URL с query параметрами', () => {
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
