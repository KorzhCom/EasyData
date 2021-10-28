import { utils } from '../utils/utils'
import { HttpActionResult } from './http_action_result';
import { HttpMethod } from './http_method';
import { HttpHeaders, HttpRequest, HttpRequestDescriptor, HttpRequestOptions } from './http_request';

export class HttpResponseError extends Error {
    constructor(public status: number, message: string) {
        super(message);
    }
}

export class HttpClient {
    public defaultHeaders: HttpHeaders;

    public customPayload: [string];

    constructor() {
        this.defaultHeaders = {};
        this.customPayload = undefined;
    }

    /**
     * This option is deprecated and will be removed in future updates.
     * Use 'onRequest' instead.
     * @deprecated
     */
    public beforeEachRequest?: (request: HttpRequest) => void;

    public onRequest?: (request: HttpRequest) => void;

    public get<T = any>(url: string, options?: HttpRequestOptions): HttpActionResult<T> {
        return this.send<T>(HttpMethod.Get, url, null, options);
    }

    public post<T = any>(url: string, data: any, options?: HttpRequestOptions): HttpActionResult<T> {
        return this.send(HttpMethod.Post, url, data, options);
    }

    public put<T = any>(url: string, data: any, options?: HttpRequestOptions): HttpActionResult<T> {
        return this.send(HttpMethod.Put, url, data, options);
    }

    public delete<T = any>(url: string, data?: any, options?: HttpRequestOptions): HttpActionResult<T> {
        return this.send(HttpMethod.Delete, url, data, options);
    }

    public send<T = any>(method: HttpMethod, url: string, data?: any, options?: HttpRequestOptions):  HttpActionResult<T> {
        options = options || {};

        const dataType = options.dataType || 'json';
        const contentType = options.contentType || (dataType !== 'form-data') 
            ? 'application/json' 
            : null;

        if (data && dataType != 'form-data' && this.customPayload) {
            data.data = utils.assignDeep(data.data || {}, this.customPayload);
        }

        const XHR = ('onload' in new XMLHttpRequest()) 
            ? XMLHttpRequest 
            : window["XDomainRequest"]; //IE support

        const xhr: XMLHttpRequest = new XHR();
        const desc: HttpRequestDescriptor = {
            method: method,
            url: url,
            headers: { ... this.defaultHeaders, ...options.headers || {} },
            queryParams: options.queryParams || {},
            data: data
        };

        if (contentType)
            desc.headers['Content-Type'] = contentType;

        const request = new HttpRequest(xhr, desc);

        if (this.beforeEachRequest) {
            console.warn(`HttpClient: 'beforeEachRequest' is deprecated and will be removed in future updates.
            Use 'onRequest' instead`);
            this.beforeEachRequest(request);
        }

        if (this.onRequest) {
            this.onRequest(request);
        }
    
        const dataToSend = (request.data && typeof request.data !== 'string'
         && dataType == 'json')
            ? JSON.stringify(request.data)
            : request.data;
      
        request.open();

        return new HttpActionResult<T>(request, new Promise<T>((resolve, reject) => {
        
            if (options.responseType)
                xhr.responseType = options.responseType;

            xhr.onreadystatechange = () => {

                if (xhr.readyState != 4) {
                    return;
                }
                
                const responseContentType = xhr.getResponseHeader('Content-Type') || '';
                const status = xhr.status;
                if (status >= 300 || status < 200) {
                    const rtPromise = (xhr.responseType === 'arraybuffer' 
                        || xhr.responseType === 'blob')
                        ? HttpClient.decodeArrayBuffer(xhr.response)
                        : Promise.resolve(xhr.responseText);
                       
                    rtPromise.then(responseText => {
                        const responseObj = (responseContentType.indexOf('application/json') == 0)
                            ? JSON.parse(responseText)
                            : responseText;

                        const message = responseObj.message ||
                            (status == 404
                                ? `No such endpoint: ${url}`
                                : responseObj);

                        reject(new HttpResponseError(status, message));
                    });
    
                    return;
                }

                const responseObj = 
                    (xhr.responseType === 'arraybuffer'|| xhr.responseType === 'blob')
                        ? xhr.response
                        : (responseContentType.indexOf('application/json') == 0)
                            ? JSON.parse(xhr.responseText)
                            : xhr.responseText;

                resolve(responseObj);
            }
      
            xhr.send(dataToSend);

        }));
    }

    private static decodeArrayBuffer(uintArray): Promise<string> {
        var reader = new FileReader();
        return new Promise<string>((resolve) => {
            reader.onloadend = function () {
                if (reader.readyState == FileReader.DONE) { 
                    resolve(reader.result as string);
                }
            };
            reader.readAsText(new Blob([uintArray]));
        });
    }
}