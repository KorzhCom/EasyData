import { HttpMethod } from './http_method';

export interface HttpHeaders {
    [key: string]: string;
}

export interface QueryParams {
    [key: string]: string;
}

export interface HttpRequestOptions {
    headers?: HttpHeaders;
    contentType?: string;
    dataType?: string; 
    responseType?: XMLHttpRequestResponseType;
    queryParams?: QueryParams; 
}

export interface HttpRequestDescriptor {
    headers: HttpHeaders;
    queryParams: QueryParams;
    method: HttpMethod;
    url: string; 
    data?: any;
}

export class HttpRequest {

    public method: HttpMethod;

    public url: string;

    private headers: HttpHeaders;

    private queryParams: QueryParams;

    public data?: any;

    constructor(private xhr: XMLHttpRequest, descriptor: HttpRequestDescriptor) {
        this.method = descriptor.method;
        this.url = descriptor.url;
        this.headers = descriptor.headers;
        this.queryParams = descriptor.queryParams;
        this.data = descriptor.data;
    }

    public setHeader(name: string, value: string) {
        this.headers[name] = value;
    }

    public setQueryParam(name: string, value: string) {
        this.queryParams[name] = value;
    }

    public getXMLHttpRequest(): XMLHttpRequest {
        return this.xhr;
    }

    public getResponseHeaders(): HttpHeaders {
        if (this.xhr.readyState == this.xhr.HEADERS_RECEIVED) {
            const headers = this.xhr.getAllResponseHeaders();
            const arr = headers.trim().split(/[\r\n]+/);

            // Create a map of header names to values
            const headerMap: HttpHeaders = {};
            for(const line of arr) {
                const parts = line.split(': ');
                const header = parts.shift();
                const value = parts.join(': ');
                headerMap[header] = value;
            }

            return headerMap;
        }

        return {};
    }

    public open() {

        if (this.xhr.readyState !== this.xhr.UNSENT)
            return;

        let url = this.url;
        if (this.queryParams && Object.keys(this.queryParams).length > 0) {
            url += encodeURI('?' + Object.keys(this.queryParams)
                .map(param => param + '=' + this.queryParams[param])
                .join('&'));
        }

        this.xhr.open(this.method, url, true);
        this.xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        for (const header in this.headers) {
            this.xhr.setRequestHeader(header, this.headers[header]);
        }

    }

    public abort() {
        this.xhr.abort();
    }
}