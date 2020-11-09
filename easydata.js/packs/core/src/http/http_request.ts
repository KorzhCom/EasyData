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
    queryParams?: QueryParams; 
}


export class HttpRequest {

    constructor(private xhr: XMLHttpRequest, private data?: any) {

    }

    public getXMLHttpRequest(): XMLHttpRequest {
        return this.xhr;
    }

    public getData() {
        return this.data;
    }
   
    public setHeader(name: string, value: string) {
        this.xhr.setRequestHeader(name, value);
    }

    public abort() {
        this.xhr.abort();
    }
}