import { HttpRequest } from './http_request';

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