import { utils } from '../utils/utils'
import { HttpMethod } from './http_method';
import { HttpHeaders, HttpRequest, HttpRequestOptions } from './http_request';

export class HttpActionResult<T> {

    constructor(private request: HttpRequest, private promise: Promise<T>) {

    }

    public getPromise() {
        return this.promise;
    }

    public getRequest() {
        return this.request;
    }

    public then<TResult1 = T, TResult2 = never>(onfulfilled?: (value: T) => TResult1 | PromiseLike<TResult1>, 
                                                onrejected?: (reason: any) => TResult2 | PromiseLike<TResult2>): Promise<TResult1 | TResult2> {
        return this.promise.then(onfulfilled, onrejected);
    }

    public catch<TResult = never>(onrejected?: (reason: any) => TResult | PromiseLike<TResult>): Promise<T | TResult> {
        return this.promise.catch(onrejected);
    }

    public finally(onfinally?: () => void): Promise<T> {
        return this.promise.finally(onfinally);
    }

}

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

    public beforeEachRequest?: (request: HttpRequest) => void;

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
        const contentType = options.contentType || (dataType !== 'form-data') ? 'application/json' : null;

        if (data && dataType != 'form-data' && this.customPayload) {
            data.data = utils.assignDeep(data.data || {}, this.customPayload);
        }

        let XDomainRequest: any = window["XDomainRequest"];
        let XHR = ("onload" in new XMLHttpRequest()) ? XMLHttpRequest : XDomainRequest; //IE support
        let xhr: XMLHttpRequest = new XHR();


        if (options.queryParams && Object.keys(options.queryParams)) {
            url += encodeURI('?' + Object.keys(options.queryParams)
                .map(name => name + '=' + options.queryParams[name])
                .join('&'));
        }

        xhr.open(method, url, true);
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

        for(let header in this.defaultHeaders) {
            xhr.setRequestHeader(header, this.defaultHeaders[header]);
        }

        if (options.headers) {
            for(let header in options.headers) {
                xhr.setRequestHeader(header, options.headers[header]);
            }
        }

        if (contentType)
            xhr.setRequestHeader('Content-Type', contentType);

        const request = new HttpRequest(xhr, data);

        if (this.beforeEachRequest) {
            this.beforeEachRequest(request);
        }
    
        let dataToSend;
        if (data && typeof data!== "string" && dataType == 'json') {
            dataToSend = JSON.stringify(request.getData());
        } else {
            dataToSend = request.getData();
        }
    
        return new HttpActionResult<T>(request, new Promise<T>((resolve, reject) => {
                
            xhr.onreadystatechange = () => {

                if (xhr.readyState != 4) {
                    return;
                } 

                const responseContentType = xhr.getResponseHeader('Content-Type') || '';
                const responseObj = 
                    (responseContentType.indexOf('application/json') == 0)
                        ? JSON.parse(xhr.responseText)
                        :xhr.responseText;
      
                const status = parseInt(xhr.status.toString());
                if (status >= 300 || status < 200) {
                    const message = responseObj.message ||
                        (status == 404 
                            ? `No such endpoint: ${url}`
                            : responseObj);

                    reject(new HttpResponseError(status, message));    
                    return;
                }

                resolve(responseObj);
            }
      
            xhr.send(dataToSend);

        }));
    }
}