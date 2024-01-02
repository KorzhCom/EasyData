
/*!
 * EasyData.JS CRUD v1.4.20
 * Copyright 2023 Korzh.com
 * Licensed under MIT
 */

var easydata = (function (exports) {
    'use strict';

    /*!
     * EasyData.JS Core v1.4.20
     * Copyright 2023 Korzh.com
     * Licensed under MIT
     */

    /** Represents the common types of the data. */
    var DataType$3;
    (function (DataType) {
        /** Unknown type value*/
        DataType[DataType["Unknown"] = 0] = "Unknown";
        /** String value*/
        DataType[DataType["String"] = 1] = "String";
        /** 8-bit integer value */
        DataType[DataType["Byte"] = 2] = "Byte";
        /** 16-bit integer value */
        DataType[DataType["Word"] = 3] = "Word";
        /** 32-bit integer value */
        DataType[DataType["Int32"] = 4] = "Int32";
        /** 64-bit integer value */
        DataType[DataType["Int64"] = 5] = "Int64";
        /** Boolean value */
        DataType[DataType["Bool"] = 6] = "Bool";
        /** Floating-point numeric value */
        DataType[DataType["Float"] = 7] = "Float";
        /** Money value */
        DataType[DataType["Currency"] = 8] = "Currency";
        /** Binary-coded decimal value */
        DataType[DataType["BCD"] = 9] = "BCD";
        /** Date value */
        DataType[DataType["Date"] = 10] = "Date";
        /** Time value */
        DataType[DataType["Time"] = 11] = "Time";
        /** Date and time value */
        DataType[DataType["DateTime"] = 12] = "DateTime";
        /** Autoincrement 32-bit integer value */
        DataType[DataType["Autoinc"] = 13] = "Autoinc";
        /** MEMO value (text with unlimited length) */
        DataType[DataType["Memo"] = 14] = "Memo";
        /** BLOB value (any data with unlimited length) */
        DataType[DataType["Blob"] = 15] = "Blob";
        /** Fixed character value */
        DataType[DataType["FixedChar"] = 16] = "FixedChar";
        /** The unique identifier */
        DataType[DataType["Guid"] = 17] = "Guid";
        /*-------- Spatial data types ----------*/
        /** Any geometry data */
        DataType[DataType["Geometry"] = 18] = "Geometry";
        /** Any data that represents some geography objects</summary> */
        DataType[DataType["Geography"] = 19] = "Geography";
    })(DataType$3 || (DataType$3 = {}));

    var EntityAttrKind$3;
    (function (EntityAttrKind) {
        EntityAttrKind[EntityAttrKind["Data"] = 0] = "Data";
        EntityAttrKind[EntityAttrKind["Virtual"] = 1] = "Virtual";
        EntityAttrKind[EntityAttrKind["Lookup"] = 2] = "Lookup";
    })(EntityAttrKind$3 || (EntityAttrKind$3 = {}));

    const EditorTag$1 = {
        /** Unknown tag value */
        Unknown: "Unknown",
        /** Edit tag value */
        Edit: "EDIT",
        /** DateTime tag value  */
        DateTime: "DATETIME",
        /** List tag value */
        List: "LIST",
        /** CustomList tag value */
        CustomList: "CUSTOMLIST",
        /** File tag value */
        File: "FILE"
    };

    /**
     * Represents a date/time value that can return either a date itself or a special date name
     */
    class TimeValue {
        constructor(dt) {
            if (dt instanceof Date) {
                this.date = dt;
            }
            else {
                this._name = dt;
            }
        }
        asTime(settings) {
            if (this.date) {
                return this.date;
            }
            else {
                specialDatesResolver.getDateByName(this._name);
            }
        }
        get name() {
            return this.name;
        }
    }
    class SpecialDatesResolver {
        getDateByName(name, settings) {
            if (this[name]) {
                return this[name](settings);
            }
            else {
                return undefined;
            }
        }
        Today(settings) {
            return new Date();
        }
        Yesterday(settings) {
            let d = new Date();
            d.setDate(d.getDate() - 1);
            return d;
        }
        Tomorrow(settings) {
            let d = new Date();
            d.setDate(d.getDate() + 1);
            return d;
        }
        FirstDayOfMonth(settings) {
            let d = new Date();
            d.setDate(1);
            return d;
        }
        LastDayOfMonth(settings) {
            let d = new Date();
            d.setMonth(d.getMonth() + 1, 0);
            return d;
        }
        FirstDayOfNextMonth(settings) {
            let d = new Date();
            d.setMonth(d.getMonth() + 1, 1);
            return d;
        }
        FirstDayOfPrevMonth(settings) {
            let d = new Date();
            d.setMonth(d.getMonth() - 1, 1);
            return d;
        }
        FirstDayOfYear(settings) {
            const d = new Date();
            d.setMonth(0, 1);
            return d;
        }
        FirstDayOfPrevYear(settings) {
            let d = new Date();
            d.setFullYear(d.getFullYear() - 1, 0, 1);
            return d;
        }
        FirstDayOfNextYear(settings) {
            let d = new Date();
            d.setFullYear(d.getFullYear() + 1, 0, 1);
            return d;
        }
        FirstDayOfWeek(settings) {
            const d = new Date();
            let day = d.getDay();
            day = (day == 0) ? 6 : day - 1; //We start week from Monday, but js - from Sunday
            d.setDate(d.getDate() - day);
            return d;
        }
        FirstDayOfPrevWeek(settings) {
            let d = new Date();
            let day = d.getDay();
            day = (day == 0) ? 1 : 8 - day; //We start week from Monday, but js - from Sunday
            d.setDate(d.getDate() - day);
            return d;
        }
        FirstDayOfNextWeek(settings) {
            let d = new Date();
            var day = d.getDay();
            day = (day == 0) ? 1 : 8 - day; //We start week from Monday, but js - from Sunday
            d.setDate(d.getDate() + day);
            return d;
        }
    }
    var specialDatesResolver = new SpecialDatesResolver();
    function registerSpecialDatesResolver(resolver) {
        specialDatesResolver = resolver;
    }

    var HttpMethod$3;
    (function (HttpMethod) {
        HttpMethod["Trace"] = "TRACE";
        HttpMethod["Options"] = "OPTIONS";
        HttpMethod["Get"] = "GET";
        HttpMethod["Put"] = "PUT";
        HttpMethod["Post"] = "POST";
        HttpMethod["Delete"] = "DELETE";
    })(HttpMethod$3 || (HttpMethod$3 = {}));

    let HttpRequest$1 = class HttpRequest {
        constructor(xhr, descriptor) {
            this.xhr = xhr;
            this.method = descriptor.method;
            this.url = descriptor.url;
            this.headers = descriptor.headers;
            this.queryParams = descriptor.queryParams;
            this.data = descriptor.data;
        }
        setHeader(name, value) {
            this.headers[name] = value;
        }
        setQueryParam(name, value) {
            this.queryParams[name] = value;
        }
        getXMLHttpRequest() {
            return this.xhr;
        }
        getResponseHeaders() {
            if (this.xhr.readyState == this.xhr.HEADERS_RECEIVED) {
                const headers = this.xhr.getAllResponseHeaders();
                const arr = headers.trim().split(/[\r\n]+/);
                // Create a map of header names to values
                const headerMap = {};
                for (const line of arr) {
                    const parts = line.split(': ');
                    const header = parts.shift();
                    const value = parts.join(': ');
                    headerMap[header] = value;
                }
                return headerMap;
            }
            return {};
        }
        open() {
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
        abort() {
            this.xhr.abort();
        }
    };

    var utils$3;
    (function (utils) {
        function getAllDataTypes() {
            return Object.values(DataType$3).filter(item => typeof item === "number");
        }
        utils.getAllDataTypes = getAllDataTypes;
        function getDateDataTypes() {
            return [DataType$3.Time, DataType$3.Date, DataType$3.DateTime];
        }
        utils.getDateDataTypes = getDateDataTypes;
        function getStringDataTypes() {
            return [DataType$3.String, DataType$3.Memo, DataType$3.FixedChar];
        }
        utils.getStringDataTypes = getStringDataTypes;
        const _numericTypes = [DataType$3.Byte, DataType$3.Word, DataType$3.Int32,
            DataType$3.Int64, DataType$3.Float, DataType$3.Currency, DataType$3.Autoinc];
        function getNumericDataTypes() {
            return _numericTypes;
        }
        utils.getNumericDataTypes = getNumericDataTypes;
        const _intTypes = [DataType$3.Byte, DataType$3.Word, DataType$3.Int32, DataType$3.Int64, DataType$3.Autoinc];
        //-------------- object functions -------------------
        /**
         * Copy the content of all objests passed in `args` parameters into `target`
         * and returns the result
         * NB: This function copies only the first level properties.
         * For a deep copy please use `assignDeep`
         * @param target - the target object
         * @param args  - an array of the source objects
         */
        function assign(target, ...args) {
            for (let i = 0; i < args.length; i++) {
                let source = args[i];
                if (source) {
                    for (let key in source) {
                        if (source.hasOwnProperty(key)) {
                            target[key] = source[key];
                        }
                    }
                }
            }
            return target;
        }
        utils.assign = assign;
        /**
         * Copy the content of all objests passed in `args` parameters into `target`
         * and returns the result
         * NB: This function make a deep copy -
         * so `assignDeep` will be called recursively for all object properties
         * on the first level.
         * @param target - the target object
         * @param sources  - an array of the source objects
         */
        function assignDeep(target, ...sources) {
            return assignDeepCore(new WeakMap(), target, sources);
        }
        utils.assignDeep = assignDeep;
        function assignDeepCore(hashSet, target, sources) {
            if (!target) {
                target = {};
            }
            for (let source of sources) {
                if (source) {
                    for (let key in source) {
                        if (source.hasOwnProperty(key)) {
                            let sourceVal = source[key];
                            if (sourceVal !== null && typeof sourceVal === 'object') {
                                if (hashSet.has(sourceVal)) {
                                    target[key] = hashSet.get(sourceVal);
                                }
                                else {
                                    if (Array.isArray(sourceVal)) {
                                        target[key] = createArrayFrom(sourceVal);
                                        hashSet.set(sourceVal, target[key]);
                                    }
                                    else {
                                        if (typeof target[key] == 'undefined' || target[key] == null) {
                                            target[key] = Object.create(Object.getPrototypeOf(sourceVal));
                                        }
                                        hashSet.set(sourceVal, target[key]);
                                        assignDeepCore(hashSet, target[key], [sourceVal]);
                                    }
                                }
                            }
                            else {
                                target[key] = sourceVal;
                            }
                        }
                    }
                }
            }
            return target;
        }
        function getIfDefined(value, defaultValue) {
            return (typeof value !== 'undefined') ? value : defaultValue;
        }
        utils.getIfDefined = getIfDefined;
        function IsDefinedAndNotNull(value) {
            return typeof value !== 'undefined' && value !== null;
        }
        utils.IsDefinedAndNotNull = IsDefinedAndNotNull;
        function copyArrayTo(collection1, collection2) {
            const len1 = collection1.length;
            const len2 = collection2.length;
            for (let i = 0; i < len1 && i < len2; i++) {
                collection2[i] = collection1[i];
            }
        }
        utils.copyArrayTo = copyArrayTo;
        function createArrayFrom(collection) {
            let result = [];
            for (let item of collection) {
                result.push(item);
            }
            return result;
        }
        utils.createArrayFrom = createArrayFrom;
        /**
         * Searches an array of the objects which implement ItemWithId by ID
         * Returs the found object or null.
         * @param array
         * @param id
         */
        function findItemById(array, id) {
            var arrLength = array.length;
            for (var idx = 0; idx < arrLength; idx++) {
                if (array[idx].id === id)
                    return array[idx];
            }
            return null;
        }
        utils.findItemById = findItemById;
        function findItemIndexById(array, id) {
            var arrLength = array.length;
            for (var idx = 0; idx < arrLength; idx++) {
                if (array[idx].id === id)
                    return idx;
            }
            return -1;
        }
        utils.findItemIndexById = findItemIndexById;
        /**
         * Searches an array of the objects which implement ItemWithId by ID
         * Returs the index of the found element, or -1 if nothing was found.
         * @param array
         * @param id
         */
        function indexOfArrayItem(arr, item) {
            if (arr.indexOf) {
                return arr.indexOf(item);
            }
            else {
                let len = arr.length;
                for (let i = 0; i < len; i++) {
                    if (item == arr[i]) {
                        return i;
                    }
                }
                return -1;
            }
        }
        utils.indexOfArrayItem = indexOfArrayItem;
        /**
         * Moves an item in some array to a new position
         * @param array
         * @param index1
         * @param index2
         */
        function moveArrayItem(array, index1, index2) {
            if (index1 >= array.length) {
                throw 'Index out of bounds: ' + index1;
            }
            if (index2 >= array.length) {
                index2 = array.length - 1;
            }
            let item = array.splice(index1, 1)[0];
            array.splice(index2, 0, item);
        }
        utils.moveArrayItem = moveArrayItem;
        /**
         * Searches for a particular item in the array are removes that item if found.
         * @param arr
         * @param value
         */
        function removeArrayItem(arr, value) {
            let index = arr.indexOf(value);
            if (index != -1) {
                return arr.splice(index, 1)[0];
            }
        }
        utils.removeArrayItem = removeArrayItem;
        function insertArrayItem(arr, index, value) {
            arr.splice(index, 0, value);
        }
        utils.insertArrayItem = insertArrayItem;
        function fillArray(arr, value, start = 0, end) {
            let len = arr.length >>> 0;
            var relativeStart = start >> 0;
            var k = relativeStart < 0 ?
                Math.max(len + relativeStart, 0) :
                Math.min(relativeStart, len);
            var relativeEnd = end === undefined ?
                len : end >> 0;
            let final = relativeEnd < 0 ?
                Math.max(len + relativeEnd, 0) :
                Math.min(relativeEnd, len);
            while (k < final) {
                arr[k] = value;
                k++;
            }
            return arr;
        }
        utils.fillArray = fillArray;
        //------------ DOM utils ------------
        /**
         * Calculates the shift on which we need to move our element horizontally
         * to find current window
         * @param absLeft
         * @param width
         */
        function shiftToFitWindow(absLeft, width) {
            let body = document.getElementsByTagName('body')[0];
            let winWidth = window.innerWidth || document.documentElement.clientWidth || body.clientWidth;
            var absRight = absLeft + width;
            let shift = 0;
            if (absRight > winWidth) {
                shift = winWidth - absRight - 10;
                if (absLeft + shift < 0) {
                    shift = 10 - absLeft;
                }
            }
            return shift;
        }
        utils.shiftToFitWindow = shiftToFitWindow;
        /**
         * Returns `true` if the value passed in the parameter is an object
         * @param val
         */
        function isObject(val) {
            if (val === null) {
                return false;
            }
            return ((typeof val === 'function') || (typeof val === 'object'));
        }
        utils.isObject = isObject;
        /**
         * Returns `true` if the `DataType` value passed in the parameter
         * represents some numeric type
         * @param dtype
         */
        function isNumericType(dtype) {
            const index = _numericTypes.indexOf(dtype);
            return (index >= 0);
        }
        utils.isNumericType = isNumericType;
        /**
         * Returns `true` if the `DataType` value passed in the parameter
         * represents some numeric type
         * @param dtype
         */
        function isIntType(dtype) {
            const index = _intTypes.indexOf(dtype);
            return (index >= 0);
        }
        utils.isIntType = isIntType;
        /**
         * Returns `true` if the value passed in the parameter is an a numeric value
         * @param val
         */
        function isNumeric(val) {
            return !isNaN(parseFloat(val)) && isFinite(val);
        }
        utils.isNumeric = isNumeric;
        /**
         * Returns `true` if two data types  passed in parameters
         * are compatible - so it's safe to copy the values between
         * two expressions with these two types
         * @param type1
         * @param type2
         */
        function areCompatibleDataTypes(type1, type2) {
            return typeof type1 == "undefined" || typeof type2 == "undefined" || type1 == DataType$3.Unknown || type2 == DataType$3.Unknown
                || (type1 == type2) || (type1 == DataType$3.Date && type2 == DataType$3.DateTime)
                || (type1 == DataType$3.DateTime && type2 == DataType$3.Date);
        }
        utils.areCompatibleDataTypes = areCompatibleDataTypes;
        /**
         * Returns `true` if the property with named `propName`
         * in the object `obj` has some value
         * @param obj
         * @param propName
         */
        function isPropSet(obj, propName) {
            return obj[propName] || obj[propName.toLowerCase()] || obj[propName.toUpperCase()];
        }
        utils.isPropSet = isPropSet;
        //-------------- ID generator -----------
        const prefixIdLen = 4;
        const symbols = "0123456789abcdefghijklmnopqrstuvwxyz";
        const magicTicks = 636712160627685350;
        /**
         * Generates an unique ID
         */
        function generateId(prefix) {
            if (!prefix) {
                prefix = 'easy';
            }
            let prfx = (prefix.length > prefixIdLen) ? squeezeMoniker(prefix, prefixIdLen) : prefix;
            if (prfx && prfx.length > 0) {
                prfx += "-";
            }
            //adding 3 random symbols
            var randCharPart = symbols[getRandomInt(0, symbols.length)] +
                symbols[getRandomInt(0, symbols.length)] +
                symbols[getRandomInt(0, symbols.length)];
            var randInt = getRandomInt(0, 10000);
            //generating main ID part 
            //it's a 36-base representation of some random number based on current value of ticks
            let ticksNum36 = intToNumBase(getNowTicks() - magicTicks - randInt);
            return prfx + randCharPart + ticksNum36;
        }
        utils.generateId = generateId;
        function intToNumBase(value, targetBase = 36) {
            var buffer = '';
            var rest = value;
            do {
                buffer = symbols[rest % targetBase] + buffer;
                rest = Math.floor(rest /= targetBase);
            } while (rest > 0);
            return buffer;
        }
        function squeezeMoniker(str, maxlen) {
            let parts = str.split('-');
            let pml = 1;
            let ptt = maxlen;
            if (parts.length < maxlen) {
                pml = maxlen / parts.length;
                ptt = parts.length;
            }
            let result = "";
            for (let i = 0; i < ptt; i++) {
                result += squeeze(parts[i], pml);
            }
            return result;
        }
        function squeeze(str, maxlen) {
            const len = str.length;
            if (len > maxlen) {
                let step = len / maxlen;
                let result = "";
                result += str[0];
                let nextIndex = step;
                let ch;
                for (let i = 1; i < len; i++) {
                    ch = str[i];
                    if (i + 1 > nextIndex) {
                        result += ch;
                        nextIndex += step;
                    }
                }
                return result;
            }
            else {
                return str;
            }
        }
        function getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min)) + min;
        }
        function getNowTicks() {
            return (621355968e9 + (new Date()).getTime() * 1e4);
        }
        function safeParseInt(str) {
            const res = parseInt(str);
            if (isNaN(res))
                throw `"${str}" is not a valid number`;
            return res;
        }
        function getDaysInMonth(month, year) {
            return new Date(year, month + 1, 0).getDate();
        }
        // ------------- date/time functions -------------------
        // TO DO: improve to process all datetime cases
        function strToDateTime(value, format) {
            if (!value || value.length == 0)
                return new Date();
            const normalizedValue = value.replace(/[^a-zA-Z0-9_]/g, '-');
            const normalizedFormat = format.replace(/[^a-zA-Z0-9_]/g, '-');
            const formatItems = normalizedFormat.split('-');
            const dateItems = normalizedValue.split('-');
            const monthIndex = formatItems.indexOf("MM");
            const dayIndex = formatItems.indexOf("dd");
            const yearIndex = formatItems.indexOf("yyyy");
            const hourIndex = formatItems.indexOf("HH");
            const minutesIndex = formatItems.indexOf("mm");
            const secondsIndex = formatItems.indexOf("ss");
            const today = new Date();
            try {
                const year = yearIndex > -1 && yearIndex < dateItems.length
                    ? safeParseInt(dateItems[yearIndex])
                    : today.getFullYear();
                const month = monthIndex > -1 && monthIndex < dateItems.length
                    ? safeParseInt(dateItems[monthIndex]) - 1
                    : today.getMonth() - 1;
                if (month > 11)
                    throw '';
                const day = dayIndex > -1 && dayIndex < dateItems.length
                    ? safeParseInt(dateItems[dayIndex])
                    : today.getDate();
                if (day > getDaysInMonth(month, year))
                    throw '';
                const hour = hourIndex > -1 && hourIndex < dateItems.length
                    ? safeParseInt(dateItems[hourIndex])
                    : 0;
                if (hour > 23)
                    throw '';
                const minute = minutesIndex > -1 && minutesIndex < dateItems.length
                    ? safeParseInt(dateItems[minutesIndex])
                    : 0;
                if (minute > 59)
                    throw '';
                const second = secondsIndex > -1 && secondsIndex < dateItems.length
                    ? safeParseInt(dateItems[secondsIndex])
                    : 0;
                if (second > 59)
                    throw '';
                return new Date(year, month, day, hour, minute, second);
            }
            catch (_a) {
                throw `${value} is not a valid date.`;
            }
        }
        utils.strToDateTime = strToDateTime;
        function strToTime(str) {
            const timeItems = str.split(':');
            try {
                const hour = timeItems.length > 0 ? safeParseInt(timeItems[0]) : 0;
                if (hour > 23)
                    throw '';
                const minute = timeItems.length > 1 ? safeParseInt(timeItems[1]) : 0;
                if (minute > 59)
                    throw '';
                const second = timeItems.length > 1 ? safeParseInt(timeItems[1]) : 0;
                if (second > 59)
                    throw '';
                return new Date(0, 0, 0, hour, minute, second);
            }
            catch (_a) {
                throw `${str} is not a valid time.`;
            }
        }
        utils.strToTime = strToTime;
    })(utils$3 || (utils$3 = {}));

    let HttpActionResult$1 = class HttpActionResult {
        constructor(request, promise) {
            this.request = request;
            this.promise = promise;
        }
        getPromise() {
            return this.promise;
        }
        getRequest() {
            return this.request;
        }
        then(onfulfilled, onrejected) {
            return this.promise.then(onfulfilled, onrejected);
        }
        catch(onrejected) {
            return this.promise.catch(onrejected);
        }
        finally(onfinally) {
            return this.promise.finally(onfinally);
        }
    };

    let HttpResponseError$1 = class HttpResponseError extends Error {
        constructor(status, message) {
            super(message);
            this.status = status;
        }
    };
    let HttpClient$1 = class HttpClient {
        /** Gets the response body for the latest request  */
        get responseBody() {
            return this._responseBody;
        }
        constructor() {
            this.defaultHeaders = {};
            this.customPayload = undefined;
        }
        get(url, options) {
            return this.send(HttpMethod$3.Get, url, null, options);
        }
        post(url, data, options) {
            return this.send(HttpMethod$3.Post, url, data, options);
        }
        put(url, data, options) {
            return this.send(HttpMethod$3.Put, url, data, options);
        }
        delete(url, data, options) {
            return this.send(HttpMethod$3.Delete, url, data, options);
        }
        send(method, url, data, options) {
            options = options || {};
            const dataType = options.dataType || 'json';
            const contentType = options.contentType || (dataType !== 'form-data')
                ? 'application/json'
                : null;
            if (data && dataType != 'form-data' && this.customPayload) {
                data.data = utils$3.assignDeep(data.data || {}, this.customPayload);
            }
            const XHR = ('onload' in new XMLHttpRequest())
                ? XMLHttpRequest
                : window["XDomainRequest"]; //IE support
            const xhr = new XHR();
            const desc = {
                method: method,
                url: url,
                headers: Object.assign(Object.assign({}, this.defaultHeaders), options.headers || {}),
                queryParams: options.queryParams || {},
                data: data
            };
            if (contentType)
                desc.headers['Content-Type'] = contentType;
            const request = new HttpRequest$1(xhr, desc);
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
            return new HttpActionResult$1(request, new Promise((resolve, reject) => {
                if (options.responseType)
                    xhr.responseType = options.responseType;
                xhr.onerror = (error) => {
                    reject(new HttpResponseError$1(xhr.status, xhr.responseText));
                };
                xhr.onreadystatechange = () => {
                    if (xhr.readyState != 4)
                        return; //we process only the state change to DONE(4)
                    const responseContentType = xhr.getResponseHeader('Content-Type') || '';
                    const status = xhr.status;
                    if (status === 0) {
                        reject(new HttpResponseError$1(status, "Network error or the request was aborted"));
                    }
                    else if (status >= 200 && status < 400) {
                        //Success
                        const responseObj = (xhr.responseType === 'arraybuffer' || xhr.responseType === 'blob')
                            ? xhr.response
                            : (responseContentType.indexOf('application/json') == 0
                                ? JSON.parse(xhr.responseText)
                                : xhr.responseText);
                        this._responseBody = responseObj;
                        if (this.onResponse) {
                            this.onResponse(xhr);
                        }
                        resolve(responseObj);
                    }
                    else {
                        //Error
                        const rtPromise = (xhr.responseType === 'arraybuffer' || xhr.responseType === 'blob')
                            ? HttpClient.decodeArrayBuffer(xhr.response)
                            : Promise.resolve(xhr.responseText);
                        rtPromise.then(responseText => {
                            const responseObj = (responseContentType.indexOf('application/json') == 0)
                                ? JSON.parse(responseText)
                                : responseText;
                            this._responseBody = responseObj;
                            const message = responseObj.message ||
                                (status == 404
                                    ? `No such endpoint: ${url}`
                                    : responseObj);
                            reject(new HttpResponseError$1(status, message));
                        });
                    }
                };
                xhr.send(dataToSend);
            }));
        }
        static decodeArrayBuffer(uintArray) {
            var reader = new FileReader();
            return new Promise((resolve) => {
                reader.onloadend = function () {
                    if (reader.readyState == FileReader.DONE) {
                        resolve(reader.result);
                    }
                };
                reader.readAsText(new Blob([uintArray]));
            });
        }
    };

    /**
     * Contains internatialization functionality.
     */
    var i18n$3;
    (function (i18n) {
        let englishUSLocaleSettings = {
            shortDateFormat: 'MM/dd/yyyy',
            longDateFormat: 'dd MMM, yyyy',
            editDateFormat: 'MM/dd/yyyy',
            shortTimeFormat: 'HH:mm',
            editTimeFormat: 'HH:mm',
            longTimeFormat: 'HH:mm:ss',
            shortMonthNames: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            longMonthNames: ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'],
            shortWeekDayNames: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            longWeekDayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            decimalSeparator: '.',
            currency: 'USD'
        };
        let defaultLocale = {
            localeId: 'en-US',
            englishName: 'English',
            displayName: 'English',
            texts: {
                ButtonOK: 'OK',
                ButtonCancel: 'Cancel',
                Yes: 'Yes',
                No: 'No',
                True: 'True',
                False: 'False'
            },
            settings: englishUSLocaleSettings
        };
        let allLocales = {
            'en-US': defaultLocale
        };
        let currentLocale;
        const mappers = [];
        function mapInfo(info) {
            for (const mapper of mappers) {
                mapper(info);
            }
        }
        function addMapper(mapper) {
            mappers.push(mapper);
        }
        i18n.addMapper = addMapper;
        /**
         * Gets added locales with their names.
         * @returns  The locales.
         */
        function getLocales() {
            let result = [];
            for (let locale in allLocales) {
                result.push({
                    locale: locale,
                    englishName: allLocales[locale].englishName,
                    displayName: allLocales[locale].displayName
                });
            }
            return result.sort((a, b) => {
                if (a.englishName > b.englishName) {
                    return 1;
                }
                else if (a.englishName === b.englishName) {
                    return 0;
                }
                return -1;
            });
        }
        i18n.getLocales = getLocales;
        /**
         * Gets the current locale ID.
         * @returns The locale.
         */
        function getCurrentLocale() {
            return currentLocale.localeId;
        }
        i18n.getCurrentLocale = getCurrentLocale;
        /**
        * Sets the curent locale.
        * @deprecated Use setCurrentLocale instead
        * @param l The locale.
        */
        function setLocale(l) {
            console.warn('This method is deprecated. Use setCurrentLocale instead');
            setCurrentLocale(l);
        }
        i18n.setLocale = setLocale;
        /**
         * Sets the curent locale.
         * @param localeId The locale.
         */
        function setCurrentLocale(localeId) {
            const newLocale = allLocales[localeId];
            if (newLocale) {
                utils$3.assignDeep(currentLocale, newLocale);
            }
            else {
                currentLocale.englishName = localeId;
                currentLocale.displayName = localeId;
                currentLocale.texts = utils$3.assignDeep({}, defaultLocale.texts);
            }
            currentLocale.localeId = localeId;
        }
        i18n.setCurrentLocale = setCurrentLocale;
        /**
         * Returns localized text by the key defined in parameter.
         * Here we get the text of the resource string assigned to CmdClickToAddCondition key:
         *
         ```
           const text = i18n.getText('CmdClickToAddCondition')
         ```
         * @param args The keys of the resource string.
         * @returns Text of the resource defined by key or null if the key is not found
         *
         */
        function getText(...args) {
            let textsObj = currentLocale.texts;
            let resText = '';
            if (args && args.length) {
                const argLength = args.length;
                for (let i = 0; i < argLength; i++) {
                    resText = textsObj[args[i]];
                    if (typeof resText === 'object') {
                        textsObj = resText;
                    }
                    else {
                        break;
                    }
                }
            }
            return resText;
        }
        i18n.getText = getText;
        function getLocaleSettings() {
            return currentLocale.settings;
        }
        i18n.getLocaleSettings = getLocaleSettings;
        function getOneLocaleSetting(key) {
            return currentLocale.settings[key];
        }
        i18n.getOneLocaleSetting = getOneLocaleSetting;
        function getShortMonthName(monthNum) {
            const settings = getLocaleSettings();
            if (monthNum > 0 && monthNum < 13) {
                return settings.shortMonthNames[monthNum - 1];
            }
            else {
                throw 'Wrong month number: ' + monthNum;
            }
        }
        i18n.getShortMonthName = getShortMonthName;
        function getLongMonthName(monthNum) {
            const settings = getLocaleSettings();
            if (monthNum > 0 && monthNum < 13) {
                return settings.longMonthNames[monthNum - 1];
            }
            else {
                throw 'Wrong month number: ' + monthNum;
            }
        }
        i18n.getLongMonthName = getLongMonthName;
        function getShortWeekDayName(dayNum) {
            const settings = getLocaleSettings();
            if (dayNum > 0 && dayNum < 8) {
                return settings.shortWeekDayNames.length >= dayNum
                    ? settings.shortWeekDayNames[dayNum - 1]
                    : dayNum.toString();
            }
            else {
                throw 'Wrong month number: ' + dayNum;
            }
        }
        i18n.getShortWeekDayName = getShortWeekDayName;
        function getLongWeekDayName(dayNum) {
            const settings = getLocaleSettings();
            if (dayNum > 0 && dayNum < 8) {
                return settings.longWeekDayNames.length >= dayNum
                    ? settings.longWeekDayNames[dayNum - 1]
                    : dayNum.toString();
            }
            else {
                throw 'Wrong month number: ' + dayNum;
            }
        }
        i18n.getLongWeekDayName = getLongWeekDayName;
        /**
         * Updates the locale settings (date/time formats, separators, etc) for the specified locale.
         * @param settingsToUpdate a LocaleSettings object
         */
        function updateLocaleSettings(settingsToUpdate) {
            if (!currentLocale.settings) {
                currentLocale.settings = utils$3.assignDeep({}, englishUSLocaleSettings);
            }
            currentLocale.settings = utils$3.assignDeep(currentLocale.settings, settingsToUpdate);
        }
        i18n.updateLocaleSettings = updateLocaleSettings;
        /**
         * Updates the texts for the current locale
         * @param texts A plain JS object that contains textual resources
         */
        function updateLocaleTexts(texts) {
            if (typeof texts !== 'object') {
                console.error('Wrong parameter type in updateLocaleTexts function call.' +
                    'The first parameter (localeId) is not necessary. Use updateLocaleTexts(texts) instead');
                return;
            }
            mapInfo({ localeId: currentLocale.localeId, texts: texts });
            utils$3.assignDeep(currentLocale.texts, texts);
        }
        i18n.updateLocaleTexts = updateLocaleTexts;
        function updateDefaultTexts(texts) {
            for (let localeId in allLocales) {
                let locale = allLocales[localeId];
                locale.texts = utils$3.assignDeep({}, texts, locale.texts);
            }
            currentLocale.texts = utils$3.assignDeep({}, texts, currentLocale.texts);
        }
        i18n.updateDefaultTexts = updateDefaultTexts;
        /**
         * Updates the information for the specified locale.
         * @param localeId The locale ID (like 'en', 'de', 'uk', etc).
         * If the locale does exist yet - it will be added
         * @param localeInfo  a LocaleInfo object that contains the locale settings and textual resources
         */
        function updateLocaleInfo(localeId, localeData) {
            mapInfo(localeData);
            let localeInfoToUpdate = currentLocale;
            if (localeId) {
                if (!localeData.localeId) {
                    localeData.localeId = localeId;
                }
                localeInfoToUpdate = allLocales[localeId];
                if (!localeInfoToUpdate) {
                    localeInfoToUpdate = utils$3.assignDeep({}, defaultLocale);
                    allLocales[localeId] = localeInfoToUpdate;
                }
            }
            utils$3.assignDeep(localeInfoToUpdate, localeData);
        }
        i18n.updateLocaleInfo = updateLocaleInfo;
        /**
         * Adds the locale.
         * @param localeId The locale ID (like 'en', 'de', 'uk', etc).
         * If the locale does exist yet - it will be created
         * @param localeInfo - a LocaleInfo object that contains the locale settings and textual resources
         */
        function addLocale(localeId, localeInfo) {
            updateLocaleInfo(localeId, localeInfo);
        }
        i18n.addLocale = addLocale;
        /**
         * Overwrites some locale settings (date/time formats) with the formats used in browser's current language
         */
        function determineSettingsByLocale(localeId) {
            const now = new Date(2020, 5, 7, 19, 34, 56, 88);
            const dateOptions = { year: 'numeric', month: 'numeric', day: 'numeric' };
            const timeOptions = { hour: 'numeric', minute: 'numeric', second: 'numeric' };
            const dateStr = now.toLocaleDateString(localeId, dateOptions);
            const timeStr = now.toLocaleTimeString(localeId, timeOptions);
            let dateFormat = dateStr
                .replace('07', 'dd')
                .replace('7', 'd')
                .replace('06', 'MM')
                .replace('6', 'M')
                .replace('2020', 'yyyy')
                .replace('20', 'yy');
            let timeFormat = timeStr
                .replace('19', 'HH')
                .replace('07', 'hh')
                .replace('7', 'h')
                .replace('34', 'mm')
                .replace('56', 'ss')
                .replace('PM', 'tt');
            if (!currentLocale.settings) {
                currentLocale.settings = {};
            }
            const localeSettings = {
                shortDateFormat: dateFormat,
                shortTimeFormat: timeFormat
            };
            updateLocaleSettings(localeSettings);
        }
        function loadBrowserLocaleSettings() {
            const lang = typeof navigator === 'object' ? navigator.language : undefined;
            determineSettingsByLocale(lang);
        }
        function resetLocales() {
            if (!currentLocale) {
                currentLocale = utils$3.assignDeep({}, defaultLocale);
                loadBrowserLocaleSettings();
            }
        }
        i18n.resetLocales = resetLocales;
        const DT_FORMAT_RGEX = /\[([^\]]+)]|y{2,4}|M{1,4}|d{1,2}|H{1,2}|h{1,2}|m{2}|s{2}|t{2}/g;
        /**
         * Returns string representation of the date/time value according to the custom format (second parameter)
         * The format is compatible with the one used in .NET: https://docs.microsoft.com/en-us/dotnet/standard/base-types/custom-date-and-time-format-strings
         * @param date
         * @param format
         */
        function dateTimeToStr(date, format) {
            const year = date.getFullYear();
            const yearStr = year.toString();
            const month = date.getMonth() + 1;
            const day = date.getDate();
            const hour = date.getHours();
            const minute = date.getMinutes();
            const second = date.getSeconds();
            const hour12 = hour % 12 || 12; //the remainder of the division by 12. Or 12 if it's 0
            const isPm = hour > 11;
            const matches = {
                yyyy: yearStr,
                yy: yearStr.substring(yearStr.length - 2),
                MMMM: i18n.getLongMonthName(month),
                MMM: i18n.getShortMonthName(month),
                MM: (month < 10) ? '0' + month : month.toString(),
                M: month.toString(),
                dd: (day < 10) ? '0' + day : day.toString(),
                d: day.toString(),
                HH: (hour < 10) ? '0' + hour : hour.toString(),
                H: hour.toString(),
                hh: (hour12 < 10) ? '0' + hour12 : hour12.toString(),
                h: hour12.toString(),
                tt: isPm ? 'PM' : 'AM',
                mm: (minute < 10) ? '0' + minute : minute.toString(),
                ss: (second < 10) ? '0' + second : second.toString()
            };
            return format.replace(DT_FORMAT_RGEX, (match, $1) => {
                return $1 || matches[match];
            });
        }
        i18n.dateTimeToStr = dateTimeToStr;
        function dateTimeToStrEx(dateTime, dataType, format) {
            if (format) {
                if (format == 'd') {
                    format = buildShortDateTimeFormat(DataType$3.Date);
                }
                else if (format == 'D') {
                    format = buildLongDateTimeFormat(DataType$3.Date);
                }
                else if (format == 'f') {
                    format = buildShortDateTimeFormat(DataType$3.DateTime);
                }
                else if (format == 'F') {
                    format = buildLongDateTimeFormat(DataType$3.DateTime);
                }
            }
            else {
                format = buildShortDateTimeFormat(dataType);
            }
            return dateTimeToStr(dateTime, format);
        }
        i18n.dateTimeToStrEx = dateTimeToStrEx;
        function buildShortDateTimeFormat(dataType) {
            const localeSettings = getLocaleSettings();
            let format;
            switch (dataType) {
                case DataType$3.Date:
                    format = localeSettings.shortDateFormat;
                    break;
                case DataType$3.Time:
                    format = localeSettings.shortTimeFormat;
                    break;
                default:
                    format = localeSettings.shortDateFormat + ' ' + localeSettings.shortTimeFormat;
                    break;
            }
            return format;
        }
        function buildLongDateTimeFormat(dataType) {
            const localeSettings = getLocaleSettings();
            let format;
            switch (dataType) {
                case DataType$3.Date:
                    format = localeSettings.longDateFormat;
                    break;
                case DataType$3.Time:
                    format = localeSettings.longTimeFormat;
                    break;
                default:
                    format = localeSettings.longDateFormat + ' ' + localeSettings.longTimeFormat;
                    break;
            }
            return format;
        }
        /**
        * Converts a numeric value to the string taking into the account the decimal separator
        * @param value - the number to convert
        * @param format - the format of the number representation (D - decimal, F - float, C - currency)
        * @param decimalSeparator - the symbol that represents decimal separator. If not specified the function gets the one from the current locale settings.
        */
        function numberToStr(number, format, decimalSeparator) {
            if (format && format.length > 0) {
                const type = format.charAt(0).toUpperCase();
                if (type === 'S') {
                    return formatWithSequence(number, format.slice(1));
                }
                else if (['D', 'F', 'C'].indexOf(type) >= 0) {
                    const locale = getCurrentLocale();
                    return number.toLocaleString(locale, getNumberFormatOptions(format));
                }
                else {
                    return convertWithMask(Math.trunc(number), format);
                }
            }
            const localeSettings = getLocaleSettings();
            decimalSeparator = decimalSeparator || localeSettings.decimalSeparator;
            return number.toString().replace('.', decimalSeparator);
        }
        i18n.numberToStr = numberToStr;
        function booleanToStr(bool, format) {
            if (format && format.length > 0) {
                const type = format.charAt(0).toUpperCase();
                if (type === 'S') {
                    const values = format.slice(1).split('|');
                    if (values.length > 1) {
                        const value = values[(bool) ? 1 : 0];
                        return i18n.getText(value) || value;
                    }
                }
            }
            return `${bool}`;
        }
        i18n.booleanToStr = booleanToStr;
        const cachedSequenceFormats = {};
        function formatWithSequence(number, format) {
            if (!cachedSequenceFormats[format]) {
                // parse and save in cache format values 
                const values = format.split('|')
                    .filter(v => v.length > 0)
                    .map(v => v.split('='));
                cachedSequenceFormats[format] = {};
                if (values.length > 0) {
                    if (values[0].length > 1) {
                        for (const value of values) {
                            cachedSequenceFormats[format][Number.parseInt(value[1])] = value[0];
                        }
                    }
                    else {
                        values.forEach((value, index) => {
                            cachedSequenceFormats[format][index] = value[0];
                        });
                    }
                }
            }
            const values = cachedSequenceFormats[format];
            if (values[number] !== undefined) {
                const value = values[number];
                return i18n.getText(value) || value;
            }
            return number.toString();
        }
        function convertWithMask(number, mask) {
            let value = number.toString();
            let result = '';
            let index = value.length - 1;
            for (let i = mask.length - 1; i >= 0; i--) {
                const ch = mask.charAt(i);
                if (ch === '#' || ch === '0') {
                    if (index >= 0) {
                        result += value.charAt(index);
                        index--;
                    }
                    else {
                        if (ch === '0') {
                            result += 0;
                        }
                    }
                }
                else {
                    result += ch;
                }
            }
            return result.split('').reverse().join('');
        }
        function getNumberFormatOptions(format) {
            const localeSettings = getLocaleSettings();
            const type = format[0].toUpperCase();
            const digits = (format.length > 1)
                ? Number.parseInt(format.slice(1))
                : type == 'D' ? 1 : 2;
            switch (type) {
                case 'D':
                    return {
                        style: 'decimal',
                        useGrouping: false,
                        minimumIntegerDigits: digits
                    };
                case 'C':
                    return {
                        style: 'currency',
                        currency: localeSettings.currency,
                        minimumFractionDigits: digits
                    };
                default:
                    return {
                        style: 'decimal',
                        minimumFractionDigits: digits,
                        maximumFractionDigits: digits
                    };
            }
        }
    })(i18n$3 || (i18n$3 = {}));

    /**
     * Represents one entity.
     */
    let MetaEntity$1 = class MetaEntity {
        /** The default constructor. */
        constructor(parent) {
            /** Returns false if this entity is read-only */
            this.isEditable = true;
            this.name = "";
            this.caption = "";
            this.description = "";
            this.parent = parent;
            this.attributes = new Array();
            this.subEntities = new Array();
        }
        /**
        * Loads entity from its JSON representation object.
        * @param model The Data Model.
        * @param dto The JSON representation object.
        */
        loadFromData(model, dto) {
            if (dto) {
                this.id = dto.id;
                this.name = dto.name;
                this.captionPlural = dto.namePlur;
                this.caption = dto.name;
                this.description = dto.desc;
                if (typeof (dto.ied) !== 'undefined')
                    this.isEditable = dto.ied;
                this.subEntities = new Array();
                if (dto.ents) {
                    for (let i = 0; i < dto.ents.length; i++) {
                        let newEntity = model.createEntity(this);
                        newEntity.loadFromData(model, dto.ents[i]);
                        this.subEntities.push(newEntity);
                    }
                }
                this.attributes = new Array();
                if (dto.attrs) {
                    for (let i = 0; i < dto.attrs.length; i++) {
                        let newAttr = model.createEntityAttr(this);
                        newAttr.loadFromData(model, dto.attrs[i]);
                        this.attributes.push(newAttr);
                    }
                }
            }
        }
        scan(processAttribute, processEntity) {
            let opts = { stop: false };
            let internalProcessEntity = (entity) => {
                if (processEntity)
                    processEntity(entity, opts);
                if (entity.attributes) {
                    let attrCount = entity.attributes.length;
                    for (let i = 0; (i < attrCount) && !opts.stop; i++) {
                        let attr = entity.attributes[i];
                        if (processAttribute) {
                            processAttribute(attr, opts);
                        }
                        if (opts.stop)
                            return;
                    }
                }
                if (entity.subEntities) {
                    let subEntityCount = entity.subEntities.length;
                    for (let i = 0; (i < subEntityCount) && !opts.stop; i++) {
                        internalProcessEntity(entity.subEntities[i]);
                    }
                }
            };
            internalProcessEntity(this);
        }
        getFirstPrimaryAttr() {
            return this.getPrimaryAttrs()[0];
        }
        getPrimaryAttrs() {
            return this.attributes.filter(attr => attr.isPrimaryKey);
        }
    };
    let MetaEntityAttr$1 = class MetaEntityAttr {
        /** The default constructor. */
        constructor(entity) {
            this.id = "";
            this.caption = "{Unrecognized attribute}";
            this.dataType = DataType$3.String;
            this.size = 0;
            this.isPrimaryKey = false;
            this.isForeignKey = false;
            this.isNullable = true;
            this.showOnView = true;
            this.isEditable = true;
            this.showOnCreate = true;
            this.showOnEdit = true;
            this.showInLookup = false;
            this.lookupAttr = "";
            this.expr = "";
            this.entity = entity;
            this.kind = EntityAttrKind$3.Data;
        }
        /**
         * Loads entity attribute from JSON representation object.
         * @param model The Data Model.
         * @param dto The JSON representation object.
         */
        loadFromData(model, dto) {
            if (dto) {
                this.id = dto.id;
                this.description = dto.desc;
                this.caption = dto.cptn;
                this.dataType = dto.dtype;
                this.isPrimaryKey = dto.ipk;
                this.isForeignKey = dto.ifk;
                this.size = dto.size;
                this.lookupAttr = dto.lattr;
                this.lookupEntity = dto.lent;
                this.dataAttr = dto.dattr;
                this.lookupDataAttr = dto.ldattr;
                const isDataType = utils$3.getDateDataTypes().indexOf(this.dataType);
                this.defaultValue = dto.defVal && isDataType ? new Date(dto.defVal) : dto.defVal;
                this.isNullable = utils$3.getIfDefined(dto.nul, this.isNullable);
                this.isEditable = utils$3.getIfDefined(dto.ied, this.isEditable);
                this.showOnView = utils$3.getIfDefined(dto.ivis || dto.sov, this.showOnView);
                this.showOnCreate = utils$3.getIfDefined(dto.soc, this.showOnCreate);
                this.showOnEdit = utils$3.getIfDefined(dto.soe, this.showOnEdit);
                this.showInLookup = utils$3.getIfDefined(dto.sil, this.showInLookup);
                this.kind = dto.kind;
                this.displayFormat = dto.dfmt;
                if (dto.udata)
                    this.userData = dto.udata;
                if (dto.edtr) {
                    this.defaultEditor = model.getEditorById(dto.edtr) || model.createValueEditor();
                }
            }
        }
    };

    /**
     * Represents a value editor.
     */
    let ValueEditor$1 = class ValueEditor {
        /** The default constructor. */
        constructor() {
            this.id = "";
            this.tag = EditorTag$1.Unknown;
            this.resType = DataType$3.Unknown;
            this.defValue = "";
        }
        /**
         * Loads value editor from its JSON representation object.
         * @param data The JSON representation object.
         */
        loadFromData(data) {
            if (data) {
                this.id = data.id;
                this.tag = data.tag;
                this.defValue = data.defval;
                this.resType = data.rtype;
                this.accept = data.accept;
                this.multiline = data.multiline;
                if (data.subType) {
                    this.resType = data.subType;
                }
                if (data.name) {
                    this.name = data.name;
                }
                if (data.values) {
                    this.values = data.values;
                }
            }
        }
        getValueText(value) {
            let result = "";
            if (!this.values)
                return result;
            if (Array.isArray(value)) {
                for (let item of this.values) {
                    if (value.indexOf(item.id) >= 0) {
                        result += item.text + ',';
                    }
                }
            }
            else {
                for (let item of this.values) {
                    if (item.id === value) {
                        result += item.text + ',';
                    }
                }
            }
            if (result) {
                result = result.substring(0, result.length - 1);
            }
            return result;
        }
    };

    /**
     * Represents a data model
     */
    let MetaData$1 = class MetaData {
        /** The default constructor. */
        constructor() {
            this.mainEntity = null;
            this.id = '__none';
            this.name = 'Empty model';
            this.rootEntity = this.createEntity();
            this.displayFormats = new Map();
        }
        /**
         * Gets the main entity of model
         * @return The main entity.
         */
        getMainEntity() {
            return this.mainEntity;
        }
        createEntity(parent) {
            return new MetaEntity$1(parent);
        }
        createEntityAttr(parent) {
            return new MetaEntityAttr$1(parent);
        }
        createValueEditor() {
            return new ValueEditor$1();
        }
        /**
         * Loads data model from JSON.
         * @param stringJson The JSON string.
         */
        loadFromJSON(stringJson) {
            let model = JSON.parse(stringJson);
            this.loadFromData(model);
        }
        /**
         * Loads data model from its JSON representation object.
         * @param data The JSON representation object.
         */
        loadFromData(data) {
            this.id = data.id;
            this.name = data.name;
            this.version = data.vers;
            //Editors
            this.editors = new Array();
            if (data.editors) {
                for (let i = 0; i < data.editors.length; i++) {
                    let newEditor = this.createValueEditor();
                    newEditor.loadFromData(data.editors[i]);
                    this.editors.push(newEditor);
                }
            }
            //rootEntity
            this.rootEntity.loadFromData(this, data.entroot);
            //DataFormats
            this.displayFormats = new Map();
            if (data.displayFormats) {
                for (const dtypeStr in data.displayFormats) {
                    const dtype = DataType$3[dtypeStr];
                    const formats = data.displayFormats[dtypeStr] || new Array();
                    this.displayFormats.set(dtype, formats);
                }
            }
        }
        /**
         * Gets the display formats.
         * @returns The display formats.
         */
        getDisplayFormats() {
            return this.displayFormats;
        }
        /**
         * Gets the display formats for type
         * @param type The type
         * @returns An array of display formats
         */
        getDisplayFormatsForType(type) {
            if (this.displayFormats.has(type)) {
                return this.displayFormats.get(type);
            }
            return [];
        }
        /**
         * Gets the default display format for the provided type
         * @param type The type
         * @returns The default type format or null
         */
        getDefaultFormat(type) {
            if (this.displayFormats.has(type)) {
                return this.displayFormats.get(type).filter(f => f.isdef)[0];
            }
            return null;
        }
        /**
         * Sets data to data model.
         * @param model Its JSON representation object or JSON string.
         */
        setData(model) {
            if (typeof model === 'string') {
                this.loadFromJSON(model);
            }
            else {
                this.loadFromData(model);
            }
        }
        /**
         * Checks wether the data model is empty.
         * @returns `true` if the data model is empty, otherwise `false`.
         */
        isEmpty() {
            return this.rootEntity.subEntities.length === 0 && this.rootEntity.attributes.length === 0;
        }
        /**
         * Gets ID of the data model.
         * @returns The ID.
         */
        getId() {
            return this.id;
        }
        /**
         * Gets name of the data model.
         * @returns The name.
         */
        getName() {
            return this.name;
        }
        /**
         * Gets root entity of the data model.
         * @returns The root entity.
         */
        getRootEntity() {
            return this.rootEntity;
        }
        /**
         * Finds editor by its ID.
         * @param editorId The editor ID.
         * @returns The value editor or `null`.
         */
        getEditorById(editorId) {
            for (let editor of this.editors) {
                if (editor.id === editorId) {
                    return editor;
                }
            }
            return null;
        }
        /**
         * Gets entity attribute by its ID.
         * This function runs through all attributes inside specified model (it's root entity and all its sub-entities).
         * @param attrId The attribute ID.
         * @returns The attribute or `null`.
         */
        getAttributeById(attrId) {
            let attr = this.getEntityAttrById(this.getRootEntity(), attrId);
            if (!attr) {
                return null;
            }
            return attr;
        }
        /**
         * Checks wether attribute contains such property.
         * @param attrId The attribute ID.
         * @param propName The property name.
         * @returns `true` if the attribute contains the property, otherwise `false`.
         */
        checkAttrProperty(attrId, propName) {
            let attribute = this.getAttributeById(attrId);
            if (attribute) {
                if (typeof attribute[propName] === 'undefined') {
                    throw 'No such property: ' + propName;
                }
                if (attribute[propName]) {
                    return true;
                }
                else if (attribute.lookupAttr) {
                    attrId = attribute.lookupAttr;
                    attribute = this.getAttributeById(attrId);
                    return attribute && attribute[propName];
                }
                else {
                    return false;
                }
            }
            else
                return false;
        }
        /**
         * Gets entity attribute by its ID.
         * This function runs through all attributes inside specified entity and all its sub-entities.
         * @param entity
         * @param attrId
         * @returns The attribute or `null`.
         */
        getEntityAttrById(entity, attrId) {
            let idx;
            if (entity.attributes) {
                let attrCount = entity.attributes.length;
                for (idx = 0; idx < attrCount; idx++) {
                    if (entity.attributes[idx].id == attrId) {
                        return entity.attributes[idx];
                    }
                }
            }
            let res;
            if (entity.subEntities) {
                let subEntityCount = entity.subEntities.length;
                for (idx = 0; idx < subEntityCount; idx++) {
                    res = this.getEntityAttrById(entity.subEntities[idx], attrId);
                    if (res)
                        return res;
                }
            }
            return null;
        }
        listByEntityWithFilter(entity, filterFunc) {
            let result = new Array();
            let caption;
            let ent = null;
            if (entity.subEntities) {
                let subEntityCount = entity.subEntities.length;
                for (let entIdx = 0; entIdx < subEntityCount; entIdx++) {
                    ent = entity.subEntities[entIdx];
                    if (!filterFunc || filterFunc(ent, null)) {
                        caption = i18n$3.getText('Entities', ent.name);
                        if (!caption) {
                            caption = ent.caption;
                        }
                        let newEnt = utils$3.assign(this.createEntity(), { id: ent.name, text: caption, items: [], isEntity: true });
                        newEnt.items = this.listByEntityWithFilter(ent, filterFunc);
                        if (newEnt.items.length > 0)
                            result.push(newEnt);
                    }
                }
            }
            let attr = null;
            if (entity.attributes) {
                let attrCount = entity.attributes.length;
                for (let attrIdx = 0; attrIdx < attrCount; attrIdx++) {
                    attr = entity.attributes[attrIdx];
                    if (!filterFunc || filterFunc(entity, attr)) {
                        caption = i18n$3.getText('Attributes', attr.id);
                        if (!caption)
                            caption = attr.caption;
                        let newEnt = utils$3.assign(this.createEntity(), { id: attr.id, text: caption, dataType: attr.dataType });
                        result.push(newEnt);
                    }
                }
            }
            return result;
        }
        listByEntity(entity, opts, filterFunc) {
            opts = opts || {};
            let resultEntities = [];
            let resultAttributes = [];
            let caption;
            let ent = null;
            if (entity.subEntities) {
                let subEntityCount = entity.subEntities.length;
                for (let entIdx = 0; entIdx < subEntityCount; entIdx++) {
                    ent = entity.subEntities[entIdx];
                    if (!filterFunc || filterFunc(ent, null)) {
                        caption = i18n$3.getText('Entities', ent.name) || ent.caption;
                        let newEnt = utils$3.assign(this.createEntity(), {
                            id: ent.name,
                            text: caption,
                            items: [],
                            isEntity: true,
                            description: ent.description
                        });
                        let newOpts = utils$3.assign({}, opts);
                        newOpts.includeRootData = false;
                        newEnt.items = this.listByEntity(ent, newOpts, filterFunc);
                        if (newEnt.items.length > 0) {
                            resultEntities.push(newEnt);
                        }
                    }
                }
            }
            let attr = null;
            if (entity.attributes) {
                let attrCount = entity.attributes.length;
                for (let attrIdx = 0; attrIdx < attrCount; attrIdx++) {
                    attr = entity.attributes[attrIdx];
                    if (!filterFunc || filterFunc(entity, attr)) {
                        caption = i18n$3.getText('Attributes', attr.id) || attr.caption;
                        resultAttributes.push(utils$3.assign(this.createEntityAttr(entity), {
                            id: attr.id, text: caption,
                            dataType: attr.dataType, lookupAttr: attr.lookupAttr,
                            description: attr.description
                        }));
                    }
                }
            }
            let sortCheck = (a, b) => {
                if (a.text.toLowerCase() == b.text.toLowerCase()) {
                    return 0;
                }
                if (a.text.toLowerCase() > b.text.toLowerCase()) {
                    return 1;
                }
                return -1;
            };
            if (opts.sortEntities) {
                resultEntities.sort(sortCheck);
                resultAttributes.sort(sortCheck);
            }
            let result;
            if (!opts.attrPlacement || opts.attrPlacement == 0) {
                result = resultEntities.concat(resultAttributes);
            }
            else {
                result = resultAttributes.concat(resultEntities);
            }
            if (opts.attrPlacement == 2) {
                result.sort(sortCheck);
            }
            if (opts.includeRootData) {
                caption = i18n$3.getText('Entities', entity.name);
                if (!caption)
                    caption = entity.caption;
                return { id: entity.name, text: caption, items: result };
            }
            else {
                return result;
            }
        }
        /**
         * Clears data model.
         */
        clear() {
            this.rootEntity = this.createEntity();
            this.editors = [];
            this.version = '';
        }
        /**
         * Add default value editors.
         */
        addDefaultValueEditors() {
            let ve;
            ve = this.addOrUpdateValueEditor('_DTE', EditorTag$1.Edit, DataType$3.String);
            ve.defValue = '';
            this.addOrUpdateValueEditor('_DPDE', EditorTag$1.DateTime, DataType$3.DateTime);
            this.addOrUpdateValueEditor('_DPTE', EditorTag$1.DateTime, DataType$3.DateTime);
        }
        /**
        * Add or update a value editor.
        * @param id The id.
        * @param tag The tag.
        * @param resType The result type.
        * @returns The value editor.
        */
        addOrUpdateValueEditor(id, tag, resType) {
            let ve = utils$3.findItemById(this.editors, id);
            if (!ve) {
                ve = this.createValueEditor();
                ve.id = id;
                this.editors.push(ve);
            }
            ve.tag = tag;
            ve.resType = resType;
            return ve;
        }
        /**
         * Gets entities tree.
         * @param opts The options.
         * @param filterFunc The filter function.
         * Takes two parameters, Entity and EntityAttr (second parameter will be null for entities), and returns boolean (true if the corresponding entity or attribute).
         * @returns The tree of the entities and their attributes according to options and the filter function
         */
        getEntitiesTree(opts, filterFunc) {
            return this.listByEntity(this.getRootEntity(), opts, filterFunc);
        }
        /**
         * Gets entities tree due to filter.
         * @param filterFunc The filter function.
         * Takes two parameters, Entity and EntityAttr (second parameter will be null for entities), and returns boolean (true if the corresponding entity or attribute).
         * @returns The tree of the entities and their attributes according to the filter function
         */
        getEntitiesTreeWithFilter(filterFunc) {
            return this.listByEntityWithFilter(this.getRootEntity(), filterFunc);
        }
        /**
         * Finds full entity path by attribute
         * @param attrId The attribute id.
         * @param sep The separator.
         * @returns The path.
         */
        getFullEntityPathByAttr(attrId, sep) {
            sep = sep || ' ';
            return this.getEntityPathByAttr(this.getRootEntity(), attrId, sep, true);
        }
        /**
        * Finds entity path by attribute
        * @param entity The entity.
        * @param attrId The attribute id.
        * @param sep The separator.
        * @param root The root option.
        * @returns The path.
        */
        getEntityPathByAttr(entity, attrId, sep, root) {
            if (!entity)
                return '';
            sep = sep || ' ';
            let entityCaption = '';
            if (entity.caption && !root) {
                let entityText = i18n$3.getText('Entities', entity.caption);
                entityCaption = entityText ? entityText : entity.caption;
            }
            if (entity.attributes) {
                let attrCount = entity.attributes.length;
                for (let i = 0; i < attrCount; i++) {
                    if (entity.attributes[i].id == attrId) {
                        return entityCaption;
                    }
                }
            }
            if (entity.subEntities) {
                let subEntityCount = entity.subEntities.length;
                for (let i = 0; i < subEntityCount; i++) {
                    let ent = entity.subEntities[i];
                    let res = this.getEntityPathByAttr(ent, attrId, sep, false);
                    if (res !== '') {
                        if (entityCaption !== '')
                            res = entityCaption + sep + res;
                        return res;
                    }
                }
            }
            return '';
        }
        /**
         * Gets the attribute text.
         * @param attr The attribute.
         * @param format The format.
         * @returns Formatted text.
         */
        getAttributeText(attr, format) {
            let attrText = i18n$3.getText('Attributes', attr.id);
            if (!attrText) {
                attrText = attr.caption;
            }
            if (!format) {
                return attrText;
            }
            let result = '';
            let entityPath = this.getFullEntityPathByAttr(attr.id, ' ');
            if (entityPath) {
                result = format.replace(new RegExp('{attr}', 'g'), attrText);
                result = result.replace(new RegExp('{entity}', 'g'), entityPath);
            }
            else {
                result = attrText;
            }
            return result.trim();
        }
        /**
         * Scans model's entity tree and calls the callback functions for each attribute and entity.
         * @param processAttribute The callback function which is called for each attribute in model's entity tree.
         * The processed attribute is passed in the first function parameter.
         * @param processEntity The callback function which is called for each entity in tree.
         * The processed entity is passed in the first function parameter.
         */
        runThroughEntities(processAttribute, processEntity) {
            this.getRootEntity().scan(processAttribute, processEntity);
        }
        /**
         * Finds first attribute by filter.
         * @param filterFunc The filter function. Takes EntityAttr object in parameter and returns boolean
         */
        getFirstAttributeByFilter(filterFunc) {
            let res = null;
            this.runThroughEntities(function (attr, opts) {
                if (filterFunc(attr)) {
                    opts.stop = true;
                    res = attr;
                }
            }, null);
            return res;
        }
    };

    /**
     * Defines aggregations settings for the current context.
     * Group, aggregate columns, grand totals, etc.
     */
    class AggregationSettings {
        constructor(colStore) {
            this.colStore = colStore;
            this.aggregates = [];
            this.groups = [];
            this.useGrandTotals = false;
            this.useRecordCount = false;
            this._caseSensitiveGroups = false;
            this.COUNT_FIELD_NAME = 'GRPRECCNT';
        }
        get caseSensitiveGroups() {
            return this._caseSensitiveGroups;
        }
        set caseSensitiveGroups(value) {
            this._caseSensitiveGroups = value;
            this.updateCompareProc();
        }
        updateCompareProc() {
            this.compareValues = this._caseSensitiveGroups
                ? this.strictCompare
                : this.caseInsensitiveCompare;
        }
        addGroup(settings) {
            const cols = settings.columns || this.colStore.getColumnIds(settings.from, settings.to);
            if (!this.colStore.validateColumns(cols))
                throw "Invalid columns: " + cols;
            if (this.hasColumnsInUse(cols))
                throw "Can't add same columns to different groups/aggregates";
            this.groups.push(Object.assign({ columns: cols }, settings));
            return this;
        }
        addAggregateColumn(colIndexOrId, funcId) {
            const colId = typeof colIndexOrId == 'string'
                ? colIndexOrId
                : this.colStore.getColumnIds(colIndexOrId, colIndexOrId)[0];
            if (this.hasColumnsInUse([colId]) || !this.colStore.validateAggregate(colId, funcId))
                throw 'Invalid aggregation function for the column: ' + colId;
            this.aggregates.push({ colId, funcId });
            return this;
        }
        addGrandTotals() {
            this.useGrandTotals = true;
            return this;
        }
        addCounts() {
            this.useRecordCount = true;
            return this;
        }
        getGroups() {
            let cols = [];
            const mappedGrops = this.groups.map(grp => {
                cols = cols.concat(grp.columns);
                return Object.assign(Object.assign({}, grp), { columns: Array.from(cols), aggregates: Array.from(this.aggregates) });
            });
            return mappedGrops;
        }
        getInternalGroups() {
            return this.groups;
        }
        lastGroup() {
            const groups = this.getGroups();
            return groups[groups.length - 1];
        }
        getAggregates() {
            return this.aggregates;
        }
        hasAggregates() {
            return this.aggregates.length > 0;
        }
        hasGroups() {
            return this.groups.length > 0;
        }
        hasGrandTotals() {
            return this.useGrandTotals;
        }
        hasRecordCount() {
            return this.useRecordCount;
        }
        isEmpty() {
            return !(this.hasAggregates() || this.hasGroups() ||
                this.hasAggregates() || this.hasRecordCount());
        }
        drop() {
            console.warn('"drop()" method is obsolete. Use "clear()" instead');
            this.clear();
        }
        clear() {
            this.groups = [];
            this.aggregates = [];
            this.useGrandTotals = false;
            this.useRecordCount = false;
            this.caseSensitiveGroups = false;
            return this;
        }
        /**
         * Checks if all columns from the list passed in the parameter are "unused".
         * Here "unused column" means a column that is included neither in any group nor in the aggregates list.
         * @param cols - the array of column IDs
         * @returns true if all columns in the list are not used anywhere, othervise - fals
         */
        hasColumnsInUse(cols) {
            for (const group of this.groups) {
                const interCols = group.columns
                    .filter(c => cols.indexOf(c) >= 0);
                if (interCols.length > 0)
                    return true;
            }
            for (const aggr of this.aggregates) {
                if (cols.indexOf(aggr.colId) >= 0)
                    return true;
            }
            return false;
        }
        needAggrCalculation() {
            return (this.hasAggregates() || this.hasRecordCount())
                && (this.hasGrandTotals() || this.hasGroups());
        }
        saveToData() {
            return {
                groups: Array.from(this.groups),
                ugt: this.useGrandTotals,
                urc: this.useRecordCount,
                csg: this.caseSensitiveGroups,
                aggregates: Array.from(this.aggregates)
            };
        }
        loadFromData(data) {
            if (data) {
                if (typeof data.ugt !== 'undefined')
                    this.useGrandTotals = data.ugt;
                if (typeof data.urc !== 'undefined')
                    this.useRecordCount = data.urc;
                if (typeof data.csg !== 'undefined')
                    this.caseSensitiveGroups = data.csg;
                if (data.groups) {
                    this.groups = Array.from(data.groups);
                }
                if (data.aggregates) {
                    this.aggregates = Array.from(data.aggregates);
                }
            }
        }
        buildGroupKey(group, row) {
            const caseInsensitive = !this.caseSensitiveGroups;
            let result = {};
            if (group) {
                for (const colId of group.columns) {
                    let keyVal = row.getValue(colId);
                    if (caseInsensitive && typeof (keyVal) === 'string') {
                        keyVal = keyVal.toLowerCase();
                    }
                    result[colId] = keyVal;
                }
            }
            return result;
        }
        //returns true if value1 == value2
        strictCompare(value1, value2) {
            if (value1 instanceof Date) {
                return value1.getTime() === value2.getTime();
            }
            else
                return value1 === value2;
        }
        //makes a case insensative comparision of two values and return true if there are equal
        caseInsensitiveCompare(value1, value2) {
            if (value1 instanceof Date) {
                return value1.getTime() === value2.getTime();
            }
            else {
                const val1 = (typeof value1 === 'string') ? value1.toLowerCase() : value1;
                const val2 = (typeof value2 === 'string') ? value2.toLowerCase() : value2;
                return val1 === val2;
            }
        }
    }

    var ColumnAlignment$3;
    (function (ColumnAlignment) {
        ColumnAlignment[ColumnAlignment["None"] = 0] = "None";
        ColumnAlignment[ColumnAlignment["Left"] = 1] = "Left";
        ColumnAlignment[ColumnAlignment["Center"] = 2] = "Center";
        ColumnAlignment[ColumnAlignment["Right"] = 3] = "Right";
    })(ColumnAlignment$3 || (ColumnAlignment$3 = {}));
    let DataColumn$1 = class DataColumn {
        constructor(desc) {
            if (!desc)
                throw Error("Options are required");
            if (!desc.id)
                throw Error("Field Id is required");
            if (!desc.label)
                throw Error("Label is required");
            this.id = desc.id;
            this.type = utils$3.getIfDefined(desc.type, DataType$3.String);
            this.label = desc.label;
            this.originAttrId = desc.originAttrId;
            this.isAggr = desc.isAggr || false;
            this.displayFormat = desc.dfmt;
            this.groupFooterColumnTemplate = desc.gfct;
            this.style = desc.style || {};
            this.description = desc.description;
            this.calculatedWidth = 0;
        }
    };
    let DataColumnList$1 = class DataColumnList {
        constructor() {
            this.items = [];
            this.mapper = {};
            this._dateColumnIdx = [];
        }
        get count() {
            return this.items.length;
        }
        add(colOrDesc) {
            let col;
            if (colOrDesc instanceof DataColumn$1) {
                col = colOrDesc;
            }
            else {
                col = new DataColumn$1(colOrDesc);
            }
            const index = this.items.length;
            this.items.push(col);
            this.mapper[col.id] = index;
            if ([DataType$3.Date, DataType$3.DateTime, DataType$3.Time].indexOf(col.type) >= 0) {
                this._dateColumnIdx.push(index);
            }
            return index;
        }
        updateDateColumnIdx() {
            this._dateColumnIdx = this.getItems()
                .filter(col => [DataType$3.Date, DataType$3.DateTime, DataType$3.Time].indexOf(col.type) >= 0)
                .map((col, index) => index);
        }
        put(index, col) {
            if (index >= 0 && index < this.count) {
                this.items[index] = col;
                this.updateDateColumnIdx();
            }
        }
        move(col, newIndex) {
            let oldIndex = this.items.indexOf(col);
            if (oldIndex >= 0 && oldIndex != newIndex) {
                utils$3.moveArrayItem(this.items, oldIndex, newIndex);
                this.updateDateColumnIdx();
            }
        }
        get(index) {
            if (index >= 0 && index < this.count) {
                return this.items[index];
            }
            else {
                return null;
            }
        }
        getIndex(id) {
            return this.mapper[id];
        }
        getItems() {
            return this.items;
        }
        getDateColumnIndexes() {
            return this._dateColumnIdx;
        }
        removeAt(index) {
            const col = this.get(index);
            this.items.splice(index, 1);
            const removeDate = this._dateColumnIdx.indexOf(index);
            if (removeDate >= 0) {
                this._dateColumnIdx.splice(removeDate, 1);
            }
            delete this.mapper[col.id];
        }
        clear() {
            this.items = [];
            this._dateColumnIdx = [];
            this.mapper = {};
        }
    };

    let DataRow$3 = class DataRow {
        constructor(columns, values) {
            this.columns = columns;
            this.values = values;
        }
        toArray() {
            return Array.from(this.values);
        }
        size() {
            return this.values.length;
        }
        getValue(colIdOrIndex) {
            let index;
            if (typeof colIdOrIndex === "string") {
                index = this.columns.getIndex(colIdOrIndex);
                if (index === undefined) {
                    throw new RangeError(`No column with id '${colIdOrIndex}'`);
                }
            }
            else {
                index = colIdOrIndex;
            }
            if (index >= this.values.length)
                throw new RangeError("Out of range: " + index);
            return this.values[index];
        }
        setValue(colIdOrIndex, value) {
            let index;
            if (typeof colIdOrIndex === "string") {
                index = this.columns.getIndex(colIdOrIndex);
                if (index === undefined) {
                    throw new RangeError(`No column with id '${colIdOrIndex}'`);
                }
            }
            else {
                index = colIdOrIndex;
            }
            if (index >= this.values.length)
                throw new RangeError("Out of range: " + index);
            this.values[index] = value;
        }
    };

    let EasyDataTable$1 = class EasyDataTable {
        constructor(options) {
            this._chunkSize = 1000;
            this._elasticChunks = false;
            this.cachedRows = [];
            this.total = 0;
            this.loader = null;
            this.needTotal = true;
            this.isInMemory = false;
            options = options || {};
            this._chunkSize = options.chunkSize || this._chunkSize;
            this._elasticChunks = options.elasticChunks || this._elasticChunks;
            this.loader = options.loader;
            if (typeof options.inMemory !== 'undefined') {
                this.isInMemory = options.inMemory;
            }
            if (this.isInMemory) {
                this.needTotal = false;
            }
            this._columns = new DataColumnList$1();
            this.onUpdate = options.onUpdate;
            if (options.columns) {
                for (const colDesc of options.columns) {
                    this._columns.add(colDesc);
                }
            }
            if (options.rows) {
                for (const rowData of options.rows) {
                    const row = this.createRow(rowData);
                    this.addRow(row);
                }
            }
            this.needTotal = !this._elasticChunks;
        }
        get columns() {
            return this._columns;
        }
        get chunkSize() {
            return this._chunkSize;
        }
        set chunkSize(value) {
            this._chunkSize = value;
            this.total = 0;
            this.needTotal = !this.elasticChunks;
            this.cachedRows = [];
        }
        get elasticChunks() {
            return this._elasticChunks;
        }
        set elasticChunks(value) {
            this._elasticChunks = value;
            this.total = 0;
            this.needTotal = !this.elasticChunks;
            this.cachedRows = [];
        }
        getRows(params) {
            let fromIndex = 0, count = this._chunkSize;
            if (params) {
                if ('page' in params) {
                    fromIndex = params.pageSize * (params.page - 1);
                    count = params.pageSize;
                }
                else {
                    fromIndex = params.offset;
                    count = params.limit;
                }
            }
            let endIndex = fromIndex + count; //the first index of the next page
            //if we don't calculate total on this request
            if (!this.needTotal && !this.elasticChunks) {
                if (fromIndex >= this.total) {
                    return Promise.resolve([]);
                }
                if (endIndex > this.total) {
                    endIndex = this.total;
                }
            }
            if (this.isInMemory && endIndex > this.cachedRows.length) {
                endIndex = this.cachedRows.length;
            }
            let allChunksCached = endIndex <= this.cachedRows.length;
            if (allChunksCached) {
                return Promise.resolve(this.cachedRows.slice(fromIndex, endIndex));
            }
            //if loader is not defined
            if (!this.loader) {
                throw `Loader is not defined. Can't get the rows from ${fromIndex} to ${endIndex}`;
            }
            // we need total only for the first request
            const needTotal = this.needTotal;
            if (this.needTotal) {
                this.needTotal = false;
            }
            let offset = this.cachedRows.length;
            let limit = endIndex - offset;
            if (limit < this._chunkSize) {
                limit = this._chunkSize;
            }
            const resultPromise = this.loader.loadChunk({
                offset: offset,
                limit: limit,
                needTotal: needTotal
            })
                .then(result => {
                if (needTotal) {
                    this.total = result.total;
                }
                Array.prototype.push.apply(this.cachedRows, result.table.getCachedRows());
                if (endIndex > this.cachedRows.length) {
                    endIndex = this.cachedRows.length;
                }
                if (this.elasticChunks) {
                    const count = result.table.getCachedCount();
                    if (count < limit) {
                        this.total = this.cachedRows.length;
                    }
                }
                this.fireUpdated();
                return this.cachedRows.slice(fromIndex, endIndex);
            });
            return resultPromise;
        }
        getRow(index) {
            return this.getRows({ offset: index, limit: 1 })
                .then(rows => rows.length > 0 ? rows[0] : null);
        }
        getTotal() {
            return this.total;
        }
        setTotal(total) {
            this.total = total;
            this.needTotal = false;
        }
        getCachedCount() {
            return this.cachedRows.length;
        }
        clear() {
            this.columns.clear();
            this.cachedRows = [];
            this.total = 0;
            this.needTotal = !this._elasticChunks;
            this.fireUpdated();
        }
        createRow(dataOrRow) {
            const dateIdx = this._columns.getDateColumnIndexes();
            const values = new Array(this._columns.count);
            const getValue = dataOrRow instanceof DataRow$3
                ? (colId) => dataOrRow.getValue(colId)
                : (colId) => dataOrRow[colId];
            if (dataOrRow) {
                this.columns.getItems().forEach((column) => {
                    const value = getValue(column.id);
                    const index = this.columns.getIndex(column.id);
                    values[index] = (dateIdx.indexOf(index) >= 0)
                        ? this.mapDate(value, column.type)
                        : value;
                });
            }
            return new DataRow$3(this._columns, values);
        }
        mapDate(value, dtype) {
            if (value) {
                let result = new Date(value);
                if (isNaN(result.getTime())
                    && dtype == DataType$3.Time) {
                    result = utils$3.strToTime(value);
                }
                return result;
            }
            return null;
        }
        addRow(rowOrValues) {
            let newRow;
            if (Array.isArray(rowOrValues)) {
                let values = rowOrValues;
                const dateIdx = this._columns.getDateColumnIndexes();
                if (dateIdx.length > 0) {
                    for (const idx of dateIdx) {
                        if (values[idx]) {
                            values[idx] = this.mapDate(values[idx], this._columns.get(idx).type);
                        }
                    }
                }
                newRow = new DataRow$3(this._columns, values);
            }
            else {
                newRow = this.createRow(rowOrValues);
            }
            this.cachedRows.push(newRow);
            const cachedTotal = this.getCachedCount();
            if (cachedTotal > this.total) {
                this.total = cachedTotal;
            }
            return newRow;
        }
        getCachedRows() {
            return this.cachedRows;
        }
        totalIsKnown() {
            if (this.elasticChunks) {
                const count = this.getCachedCount();
                return count === this.total;
            }
            return !this.needTotal;
        }
        fireUpdated() {
            if (this.onUpdate) {
                this.onUpdate(this);
            }
        }
    };

    /**
     * EasyData representation of GUID.
     */
    let EasyGuid$2 = class EasyGuid {
        /**
         * Generates new GUID.
         * @returns The string representation of GUID.
         */
        static newGuid() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }
    };

    /**
     * The representation of event emitter.
     */
    let EventEmitter$2 = class EventEmitter {
        /**
         * The default constructor.
         * @param source The source.
         */
        constructor(source) {
            this.silentMode = 0;
            this.events = new Array();
            this.source = source;
        }
        /**
         * Subscries to the event.
         * @param eventType The event type.
         * @param callback The callback.
         * @returns The subscribtion ID.
         */
        subscribe(eventType, callback) {
            let event = this.getEventRecByType(eventType);
            const eventCallback = {
                id: EasyGuid$2.newGuid(),
                callback: callback
            };
            if (event) {
                event.eventCallbacks.push(eventCallback);
            }
            else {
                event = {
                    type: eventType,
                    eventCallbacks: new Array(eventCallback)
                };
                this.events.push(event);
            }
            return eventCallback.id;
        }
        /**
         * Unsubsribes from the event.
         * @param eventType The event type.
         * @param callbackId The subscribtion ID.
         */
        unsubscribe(eventType, callbackId) {
            let event = this.getEventRecByType(eventType);
            if (event) {
                let index = -1;
                for (index = 0; index < event.eventCallbacks.length; index++) {
                    if (event.eventCallbacks[index].id === callbackId) {
                        break;
                    }
                }
                if (index >= 0) {
                    event.eventCallbacks.splice(index, 1);
                }
            }
        }
        /**
         * Fires the event.
         * @param eventType The event type.
         * @param data The event data.
         * @param postpone  The postpone.
         * @param force To fire force. If value is `true`, ignores silent mode.
         */
        fire(eventType, data, postpone = 0, force = false) {
            if (this.silentMode && !force) {
                return;
            }
            let eventRec = this.getEventRecByType(eventType);
            if (eventRec) {
                const eqevent = {
                    type: eventType,
                    source: this.source,
                    data: data
                };
                let emitAllFunc = () => {
                    for (let callback of eventRec.eventCallbacks) {
                        callback.callback(eqevent);
                    }
                };
                if (postpone > 0) {
                    setTimeout(emitAllFunc, postpone);
                }
                else {
                    emitAllFunc();
                }
            }
        }
        /**
         * Enters to silent mode.
         */
        enterSilentMode() {
            this.silentMode++;
        }
        /**
         * Exits from silent mode.
         */
        exitSilentMode() {
            if (this.silentMode) {
                this.silentMode--;
            }
        }
        /**
         * Checks if emitter is in silent mode.
         * @return `true`, if silent mode is enable.
         */
        isSilent() {
            return this.silentMode > 0;
        }
        getEventRecByType(eventType) {
            for (let event of this.events) {
                if (event.type == eventType) {
                    return event;
                }
            }
            return null;
        }
    };

    function repeatString(str, times) {
        return str.repeat(times);
    }
    function reverseString(str) {
        return str.split("").reverse().join("");
    }
    function strEndsWith(str, symbol) {
        return str && str.lastIndexOf(symbol) == (str.length - symbol.length);
    }
    /**
     * Adds two paths and returns the result
     * Correctly processes leading and trailing slashes
     * @param path1
     * @param path2
     */
    function combinePath$1(path1, path2) {
        let result = path1;
        if (result != null && result.length > 0) {
            if (result.charAt(result.length - 1) != '/')
                result += "/";
            result += path2;
        }
        else {
            result = path2;
        }
        return result;
    }

    var liquid$3;
    (function (liquid) {
        function renderLiquidTemplate(template, vars) {
            let result = template;
            if (vars) {
                for (let v in vars) {
                    const liquidVarRegexp = new RegExp('\{\{' + v + '\}\}', 'g');
                    result = result.replace(liquidVarRegexp, vars[v]);
                }
            }
            return result;
        }
        liquid.renderLiquidTemplate = renderLiquidTemplate;
    })(liquid$3 || (liquid$3 = {}));

    i18n$3.resetLocales();

    //types
    if (typeof Object.values !== 'function') {
        Object.values = function (obj) {
            return Object.keys(obj).map(key => obj[key]);
        };
    }
    if (typeof Math.trunc !== 'function') {
        Math.trunc = function (x) {
            if (isNaN(x)) {
                return NaN;
            }
            if (x > 0) {
                return Math.floor(x);
            }
            return Math.ceil(x);
        };
    }

    var easydata_core_es = /*#__PURE__*/Object.freeze({
        __proto__: null,
        AggregationSettings: AggregationSettings,
        get ColumnAlignment () { return ColumnAlignment$3; },
        DataColumn: DataColumn$1,
        DataColumnList: DataColumnList$1,
        DataRow: DataRow$3,
        get DataType () { return DataType$3; },
        EasyDataTable: EasyDataTable$1,
        EasyGuid: EasyGuid$2,
        EditorTag: EditorTag$1,
        get EntityAttrKind () { return EntityAttrKind$3; },
        EventEmitter: EventEmitter$2,
        HttpClient: HttpClient$1,
        get HttpMethod () { return HttpMethod$3; },
        HttpRequest: HttpRequest$1,
        HttpResponseError: HttpResponseError$1,
        MetaData: MetaData$1,
        MetaEntity: MetaEntity$1,
        MetaEntityAttr: MetaEntityAttr$1,
        SpecialDatesResolver: SpecialDatesResolver,
        TimeValue: TimeValue,
        ValueEditor: ValueEditor$1,
        combinePath: combinePath$1,
        get i18n () { return i18n$3; },
        get liquid () { return liquid$3; },
        registerSpecialDatesResolver: registerSpecialDatesResolver,
        repeatString: repeatString,
        reverseString: reverseString,
        strEndsWith: strEndsWith,
        get utils () { return utils$3; }
    });

    /*!
     * EasyData.JS UI v1.4.20
     * Copyright 2023 Korzh.com
     * Licensed under MIT
     */

    /*!
     * EasyData.JS Core v1.4.20
     * Copyright 2023 Korzh.com
     * Licensed under MIT
     */

    /** Represents the common types of the data. */
    var DataType$2;
    (function (DataType) {
        /** Unknown type value*/
        DataType[DataType["Unknown"] = 0] = "Unknown";
        /** String value*/
        DataType[DataType["String"] = 1] = "String";
        /** 8-bit integer value */
        DataType[DataType["Byte"] = 2] = "Byte";
        /** 16-bit integer value */
        DataType[DataType["Word"] = 3] = "Word";
        /** 32-bit integer value */
        DataType[DataType["Int32"] = 4] = "Int32";
        /** 64-bit integer value */
        DataType[DataType["Int64"] = 5] = "Int64";
        /** Boolean value */
        DataType[DataType["Bool"] = 6] = "Bool";
        /** Floating-point numeric value */
        DataType[DataType["Float"] = 7] = "Float";
        /** Money value */
        DataType[DataType["Currency"] = 8] = "Currency";
        /** Binary-coded decimal value */
        DataType[DataType["BCD"] = 9] = "BCD";
        /** Date value */
        DataType[DataType["Date"] = 10] = "Date";
        /** Time value */
        DataType[DataType["Time"] = 11] = "Time";
        /** Date and time value */
        DataType[DataType["DateTime"] = 12] = "DateTime";
        /** Autoincrement 32-bit integer value */
        DataType[DataType["Autoinc"] = 13] = "Autoinc";
        /** MEMO value (text with unlimited length) */
        DataType[DataType["Memo"] = 14] = "Memo";
        /** BLOB value (any data with unlimited length) */
        DataType[DataType["Blob"] = 15] = "Blob";
        /** Fixed character value */
        DataType[DataType["FixedChar"] = 16] = "FixedChar";
        /** The unique identifier */
        DataType[DataType["Guid"] = 17] = "Guid";
        /*-------- Spatial data types ----------*/
        /** Any geometry data */
        DataType[DataType["Geometry"] = 18] = "Geometry";
        /** Any data that represents some geography objects</summary> */
        DataType[DataType["Geography"] = 19] = "Geography";
    })(DataType$2 || (DataType$2 = {}));

    var EntityAttrKind$2;
    (function (EntityAttrKind) {
        EntityAttrKind[EntityAttrKind["Data"] = 0] = "Data";
        EntityAttrKind[EntityAttrKind["Virtual"] = 1] = "Virtual";
        EntityAttrKind[EntityAttrKind["Lookup"] = 2] = "Lookup";
    })(EntityAttrKind$2 || (EntityAttrKind$2 = {}));

    var HttpMethod$2;
    (function (HttpMethod) {
        HttpMethod["Trace"] = "TRACE";
        HttpMethod["Options"] = "OPTIONS";
        HttpMethod["Get"] = "GET";
        HttpMethod["Put"] = "PUT";
        HttpMethod["Post"] = "POST";
        HttpMethod["Delete"] = "DELETE";
    })(HttpMethod$2 || (HttpMethod$2 = {}));

    var utils$2;
    (function (utils) {
        function getAllDataTypes() {
            return Object.values(DataType$2).filter(item => typeof item === "number");
        }
        utils.getAllDataTypes = getAllDataTypes;
        function getDateDataTypes() {
            return [DataType$2.Time, DataType$2.Date, DataType$2.DateTime];
        }
        utils.getDateDataTypes = getDateDataTypes;
        function getStringDataTypes() {
            return [DataType$2.String, DataType$2.Memo, DataType$2.FixedChar];
        }
        utils.getStringDataTypes = getStringDataTypes;
        const _numericTypes = [DataType$2.Byte, DataType$2.Word, DataType$2.Int32,
            DataType$2.Int64, DataType$2.Float, DataType$2.Currency, DataType$2.Autoinc];
        function getNumericDataTypes() {
            return _numericTypes;
        }
        utils.getNumericDataTypes = getNumericDataTypes;
        const _intTypes = [DataType$2.Byte, DataType$2.Word, DataType$2.Int32, DataType$2.Int64, DataType$2.Autoinc];
        //-------------- object functions -------------------
        /**
         * Copy the content of all objests passed in `args` parameters into `target`
         * and returns the result
         * NB: This function copies only the first level properties.
         * For a deep copy please use `assignDeep`
         * @param target - the target object
         * @param args  - an array of the source objects
         */
        function assign(target, ...args) {
            for (let i = 0; i < args.length; i++) {
                let source = args[i];
                if (source) {
                    for (let key in source) {
                        if (source.hasOwnProperty(key)) {
                            target[key] = source[key];
                        }
                    }
                }
            }
            return target;
        }
        utils.assign = assign;
        /**
         * Copy the content of all objests passed in `args` parameters into `target`
         * and returns the result
         * NB: This function make a deep copy -
         * so `assignDeep` will be called recursively for all object properties
         * on the first level.
         * @param target - the target object
         * @param sources  - an array of the source objects
         */
        function assignDeep(target, ...sources) {
            return assignDeepCore(new WeakMap(), target, sources);
        }
        utils.assignDeep = assignDeep;
        function assignDeepCore(hashSet, target, sources) {
            if (!target) {
                target = {};
            }
            for (let source of sources) {
                if (source) {
                    for (let key in source) {
                        if (source.hasOwnProperty(key)) {
                            let sourceVal = source[key];
                            if (sourceVal !== null && typeof sourceVal === 'object') {
                                if (hashSet.has(sourceVal)) {
                                    target[key] = hashSet.get(sourceVal);
                                }
                                else {
                                    if (Array.isArray(sourceVal)) {
                                        target[key] = createArrayFrom(sourceVal);
                                        hashSet.set(sourceVal, target[key]);
                                    }
                                    else {
                                        if (typeof target[key] == 'undefined' || target[key] == null) {
                                            target[key] = Object.create(Object.getPrototypeOf(sourceVal));
                                        }
                                        hashSet.set(sourceVal, target[key]);
                                        assignDeepCore(hashSet, target[key], [sourceVal]);
                                    }
                                }
                            }
                            else {
                                target[key] = sourceVal;
                            }
                        }
                    }
                }
            }
            return target;
        }
        function getIfDefined(value, defaultValue) {
            return (typeof value !== 'undefined') ? value : defaultValue;
        }
        utils.getIfDefined = getIfDefined;
        function IsDefinedAndNotNull(value) {
            return typeof value !== 'undefined' && value !== null;
        }
        utils.IsDefinedAndNotNull = IsDefinedAndNotNull;
        function copyArrayTo(collection1, collection2) {
            const len1 = collection1.length;
            const len2 = collection2.length;
            for (let i = 0; i < len1 && i < len2; i++) {
                collection2[i] = collection1[i];
            }
        }
        utils.copyArrayTo = copyArrayTo;
        function createArrayFrom(collection) {
            let result = [];
            for (let item of collection) {
                result.push(item);
            }
            return result;
        }
        utils.createArrayFrom = createArrayFrom;
        /**
         * Searches an array of the objects which implement ItemWithId by ID
         * Returs the found object or null.
         * @param array
         * @param id
         */
        function findItemById(array, id) {
            var arrLength = array.length;
            for (var idx = 0; idx < arrLength; idx++) {
                if (array[idx].id === id)
                    return array[idx];
            }
            return null;
        }
        utils.findItemById = findItemById;
        function findItemIndexById(array, id) {
            var arrLength = array.length;
            for (var idx = 0; idx < arrLength; idx++) {
                if (array[idx].id === id)
                    return idx;
            }
            return -1;
        }
        utils.findItemIndexById = findItemIndexById;
        /**
         * Searches an array of the objects which implement ItemWithId by ID
         * Returs the index of the found element, or -1 if nothing was found.
         * @param array
         * @param id
         */
        function indexOfArrayItem(arr, item) {
            if (arr.indexOf) {
                return arr.indexOf(item);
            }
            else {
                let len = arr.length;
                for (let i = 0; i < len; i++) {
                    if (item == arr[i]) {
                        return i;
                    }
                }
                return -1;
            }
        }
        utils.indexOfArrayItem = indexOfArrayItem;
        /**
         * Moves an item in some array to a new position
         * @param array
         * @param index1
         * @param index2
         */
        function moveArrayItem(array, index1, index2) {
            if (index1 >= array.length) {
                throw 'Index out of bounds: ' + index1;
            }
            if (index2 >= array.length) {
                index2 = array.length - 1;
            }
            let item = array.splice(index1, 1)[0];
            array.splice(index2, 0, item);
        }
        utils.moveArrayItem = moveArrayItem;
        /**
         * Searches for a particular item in the array are removes that item if found.
         * @param arr
         * @param value
         */
        function removeArrayItem(arr, value) {
            let index = arr.indexOf(value);
            if (index != -1) {
                return arr.splice(index, 1)[0];
            }
        }
        utils.removeArrayItem = removeArrayItem;
        function insertArrayItem(arr, index, value) {
            arr.splice(index, 0, value);
        }
        utils.insertArrayItem = insertArrayItem;
        function fillArray(arr, value, start = 0, end) {
            let len = arr.length >>> 0;
            var relativeStart = start >> 0;
            var k = relativeStart < 0 ?
                Math.max(len + relativeStart, 0) :
                Math.min(relativeStart, len);
            var relativeEnd = end === undefined ?
                len : end >> 0;
            let final = relativeEnd < 0 ?
                Math.max(len + relativeEnd, 0) :
                Math.min(relativeEnd, len);
            while (k < final) {
                arr[k] = value;
                k++;
            }
            return arr;
        }
        utils.fillArray = fillArray;
        //------------ DOM utils ------------
        /**
         * Calculates the shift on which we need to move our element horizontally
         * to find current window
         * @param absLeft
         * @param width
         */
        function shiftToFitWindow(absLeft, width) {
            let body = document.getElementsByTagName('body')[0];
            let winWidth = window.innerWidth || document.documentElement.clientWidth || body.clientWidth;
            var absRight = absLeft + width;
            let shift = 0;
            if (absRight > winWidth) {
                shift = winWidth - absRight - 10;
                if (absLeft + shift < 0) {
                    shift = 10 - absLeft;
                }
            }
            return shift;
        }
        utils.shiftToFitWindow = shiftToFitWindow;
        /**
         * Returns `true` if the value passed in the parameter is an object
         * @param val
         */
        function isObject(val) {
            if (val === null) {
                return false;
            }
            return ((typeof val === 'function') || (typeof val === 'object'));
        }
        utils.isObject = isObject;
        /**
         * Returns `true` if the `DataType` value passed in the parameter
         * represents some numeric type
         * @param dtype
         */
        function isNumericType(dtype) {
            const index = _numericTypes.indexOf(dtype);
            return (index >= 0);
        }
        utils.isNumericType = isNumericType;
        /**
         * Returns `true` if the `DataType` value passed in the parameter
         * represents some numeric type
         * @param dtype
         */
        function isIntType(dtype) {
            const index = _intTypes.indexOf(dtype);
            return (index >= 0);
        }
        utils.isIntType = isIntType;
        /**
         * Returns `true` if the value passed in the parameter is an a numeric value
         * @param val
         */
        function isNumeric(val) {
            return !isNaN(parseFloat(val)) && isFinite(val);
        }
        utils.isNumeric = isNumeric;
        /**
         * Returns `true` if two data types  passed in parameters
         * are compatible - so it's safe to copy the values between
         * two expressions with these two types
         * @param type1
         * @param type2
         */
        function areCompatibleDataTypes(type1, type2) {
            return typeof type1 == "undefined" || typeof type2 == "undefined" || type1 == DataType$2.Unknown || type2 == DataType$2.Unknown
                || (type1 == type2) || (type1 == DataType$2.Date && type2 == DataType$2.DateTime)
                || (type1 == DataType$2.DateTime && type2 == DataType$2.Date);
        }
        utils.areCompatibleDataTypes = areCompatibleDataTypes;
        /**
         * Returns `true` if the property with named `propName`
         * in the object `obj` has some value
         * @param obj
         * @param propName
         */
        function isPropSet(obj, propName) {
            return obj[propName] || obj[propName.toLowerCase()] || obj[propName.toUpperCase()];
        }
        utils.isPropSet = isPropSet;
        //-------------- ID generator -----------
        const prefixIdLen = 4;
        const symbols = "0123456789abcdefghijklmnopqrstuvwxyz";
        const magicTicks = 636712160627685350;
        /**
         * Generates an unique ID
         */
        function generateId(prefix) {
            if (!prefix) {
                prefix = 'easy';
            }
            let prfx = (prefix.length > prefixIdLen) ? squeezeMoniker(prefix, prefixIdLen) : prefix;
            if (prfx && prfx.length > 0) {
                prfx += "-";
            }
            //adding 3 random symbols
            var randCharPart = symbols[getRandomInt(0, symbols.length)] +
                symbols[getRandomInt(0, symbols.length)] +
                symbols[getRandomInt(0, symbols.length)];
            var randInt = getRandomInt(0, 10000);
            //generating main ID part 
            //it's a 36-base representation of some random number based on current value of ticks
            let ticksNum36 = intToNumBase(getNowTicks() - magicTicks - randInt);
            return prfx + randCharPart + ticksNum36;
        }
        utils.generateId = generateId;
        function intToNumBase(value, targetBase = 36) {
            var buffer = '';
            var rest = value;
            do {
                buffer = symbols[rest % targetBase] + buffer;
                rest = Math.floor(rest /= targetBase);
            } while (rest > 0);
            return buffer;
        }
        function squeezeMoniker(str, maxlen) {
            let parts = str.split('-');
            let pml = 1;
            let ptt = maxlen;
            if (parts.length < maxlen) {
                pml = maxlen / parts.length;
                ptt = parts.length;
            }
            let result = "";
            for (let i = 0; i < ptt; i++) {
                result += squeeze(parts[i], pml);
            }
            return result;
        }
        function squeeze(str, maxlen) {
            const len = str.length;
            if (len > maxlen) {
                let step = len / maxlen;
                let result = "";
                result += str[0];
                let nextIndex = step;
                let ch;
                for (let i = 1; i < len; i++) {
                    ch = str[i];
                    if (i + 1 > nextIndex) {
                        result += ch;
                        nextIndex += step;
                    }
                }
                return result;
            }
            else {
                return str;
            }
        }
        function getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min)) + min;
        }
        function getNowTicks() {
            return (621355968e9 + (new Date()).getTime() * 1e4);
        }
        function safeParseInt(str) {
            const res = parseInt(str);
            if (isNaN(res))
                throw `"${str}" is not a valid number`;
            return res;
        }
        function getDaysInMonth(month, year) {
            return new Date(year, month + 1, 0).getDate();
        }
        // ------------- date/time functions -------------------
        // TO DO: improve to process all datetime cases
        function strToDateTime(value, format) {
            if (!value || value.length == 0)
                return new Date();
            const normalizedValue = value.replace(/[^a-zA-Z0-9_]/g, '-');
            const normalizedFormat = format.replace(/[^a-zA-Z0-9_]/g, '-');
            const formatItems = normalizedFormat.split('-');
            const dateItems = normalizedValue.split('-');
            const monthIndex = formatItems.indexOf("MM");
            const dayIndex = formatItems.indexOf("dd");
            const yearIndex = formatItems.indexOf("yyyy");
            const hourIndex = formatItems.indexOf("HH");
            const minutesIndex = formatItems.indexOf("mm");
            const secondsIndex = formatItems.indexOf("ss");
            const today = new Date();
            try {
                const year = yearIndex > -1 && yearIndex < dateItems.length
                    ? safeParseInt(dateItems[yearIndex])
                    : today.getFullYear();
                const month = monthIndex > -1 && monthIndex < dateItems.length
                    ? safeParseInt(dateItems[monthIndex]) - 1
                    : today.getMonth() - 1;
                if (month > 11)
                    throw '';
                const day = dayIndex > -1 && dayIndex < dateItems.length
                    ? safeParseInt(dateItems[dayIndex])
                    : today.getDate();
                if (day > getDaysInMonth(month, year))
                    throw '';
                const hour = hourIndex > -1 && hourIndex < dateItems.length
                    ? safeParseInt(dateItems[hourIndex])
                    : 0;
                if (hour > 23)
                    throw '';
                const minute = minutesIndex > -1 && minutesIndex < dateItems.length
                    ? safeParseInt(dateItems[minutesIndex])
                    : 0;
                if (minute > 59)
                    throw '';
                const second = secondsIndex > -1 && secondsIndex < dateItems.length
                    ? safeParseInt(dateItems[secondsIndex])
                    : 0;
                if (second > 59)
                    throw '';
                return new Date(year, month, day, hour, minute, second);
            }
            catch (_a) {
                throw `${value} is not a valid date.`;
            }
        }
        utils.strToDateTime = strToDateTime;
        function strToTime(str) {
            const timeItems = str.split(':');
            try {
                const hour = timeItems.length > 0 ? safeParseInt(timeItems[0]) : 0;
                if (hour > 23)
                    throw '';
                const minute = timeItems.length > 1 ? safeParseInt(timeItems[1]) : 0;
                if (minute > 59)
                    throw '';
                const second = timeItems.length > 1 ? safeParseInt(timeItems[1]) : 0;
                if (second > 59)
                    throw '';
                return new Date(0, 0, 0, hour, minute, second);
            }
            catch (_a) {
                throw `${str} is not a valid time.`;
            }
        }
        utils.strToTime = strToTime;
    })(utils$2 || (utils$2 = {}));

    /**
     * Contains internatialization functionality.
     */
    var i18n$2;
    (function (i18n) {
        let englishUSLocaleSettings = {
            shortDateFormat: 'MM/dd/yyyy',
            longDateFormat: 'dd MMM, yyyy',
            editDateFormat: 'MM/dd/yyyy',
            shortTimeFormat: 'HH:mm',
            editTimeFormat: 'HH:mm',
            longTimeFormat: 'HH:mm:ss',
            shortMonthNames: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            longMonthNames: ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'],
            shortWeekDayNames: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            longWeekDayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            decimalSeparator: '.',
            currency: 'USD'
        };
        let defaultLocale = {
            localeId: 'en-US',
            englishName: 'English',
            displayName: 'English',
            texts: {
                ButtonOK: 'OK',
                ButtonCancel: 'Cancel',
                Yes: 'Yes',
                No: 'No',
                True: 'True',
                False: 'False'
            },
            settings: englishUSLocaleSettings
        };
        let allLocales = {
            'en-US': defaultLocale
        };
        let currentLocale;
        const mappers = [];
        function mapInfo(info) {
            for (const mapper of mappers) {
                mapper(info);
            }
        }
        function addMapper(mapper) {
            mappers.push(mapper);
        }
        i18n.addMapper = addMapper;
        /**
         * Gets added locales with their names.
         * @returns  The locales.
         */
        function getLocales() {
            let result = [];
            for (let locale in allLocales) {
                result.push({
                    locale: locale,
                    englishName: allLocales[locale].englishName,
                    displayName: allLocales[locale].displayName
                });
            }
            return result.sort((a, b) => {
                if (a.englishName > b.englishName) {
                    return 1;
                }
                else if (a.englishName === b.englishName) {
                    return 0;
                }
                return -1;
            });
        }
        i18n.getLocales = getLocales;
        /**
         * Gets the current locale ID.
         * @returns The locale.
         */
        function getCurrentLocale() {
            return currentLocale.localeId;
        }
        i18n.getCurrentLocale = getCurrentLocale;
        /**
        * Sets the curent locale.
        * @deprecated Use setCurrentLocale instead
        * @param l The locale.
        */
        function setLocale(l) {
            console.warn('This method is deprecated. Use setCurrentLocale instead');
            setCurrentLocale(l);
        }
        i18n.setLocale = setLocale;
        /**
         * Sets the curent locale.
         * @param localeId The locale.
         */
        function setCurrentLocale(localeId) {
            const newLocale = allLocales[localeId];
            if (newLocale) {
                utils$2.assignDeep(currentLocale, newLocale);
            }
            else {
                currentLocale.englishName = localeId;
                currentLocale.displayName = localeId;
                currentLocale.texts = utils$2.assignDeep({}, defaultLocale.texts);
            }
            currentLocale.localeId = localeId;
        }
        i18n.setCurrentLocale = setCurrentLocale;
        /**
         * Returns localized text by the key defined in parameter.
         * Here we get the text of the resource string assigned to CmdClickToAddCondition key:
         *
         ```
           const text = i18n.getText('CmdClickToAddCondition')
         ```
         * @param args The keys of the resource string.
         * @returns Text of the resource defined by key or null if the key is not found
         *
         */
        function getText(...args) {
            let textsObj = currentLocale.texts;
            let resText = '';
            if (args && args.length) {
                const argLength = args.length;
                for (let i = 0; i < argLength; i++) {
                    resText = textsObj[args[i]];
                    if (typeof resText === 'object') {
                        textsObj = resText;
                    }
                    else {
                        break;
                    }
                }
            }
            return resText;
        }
        i18n.getText = getText;
        function getLocaleSettings() {
            return currentLocale.settings;
        }
        i18n.getLocaleSettings = getLocaleSettings;
        function getOneLocaleSetting(key) {
            return currentLocale.settings[key];
        }
        i18n.getOneLocaleSetting = getOneLocaleSetting;
        function getShortMonthName(monthNum) {
            const settings = getLocaleSettings();
            if (monthNum > 0 && monthNum < 13) {
                return settings.shortMonthNames[monthNum - 1];
            }
            else {
                throw 'Wrong month number: ' + monthNum;
            }
        }
        i18n.getShortMonthName = getShortMonthName;
        function getLongMonthName(monthNum) {
            const settings = getLocaleSettings();
            if (monthNum > 0 && monthNum < 13) {
                return settings.longMonthNames[monthNum - 1];
            }
            else {
                throw 'Wrong month number: ' + monthNum;
            }
        }
        i18n.getLongMonthName = getLongMonthName;
        function getShortWeekDayName(dayNum) {
            const settings = getLocaleSettings();
            if (dayNum > 0 && dayNum < 8) {
                return settings.shortWeekDayNames.length >= dayNum
                    ? settings.shortWeekDayNames[dayNum - 1]
                    : dayNum.toString();
            }
            else {
                throw 'Wrong month number: ' + dayNum;
            }
        }
        i18n.getShortWeekDayName = getShortWeekDayName;
        function getLongWeekDayName(dayNum) {
            const settings = getLocaleSettings();
            if (dayNum > 0 && dayNum < 8) {
                return settings.longWeekDayNames.length >= dayNum
                    ? settings.longWeekDayNames[dayNum - 1]
                    : dayNum.toString();
            }
            else {
                throw 'Wrong month number: ' + dayNum;
            }
        }
        i18n.getLongWeekDayName = getLongWeekDayName;
        /**
         * Updates the locale settings (date/time formats, separators, etc) for the specified locale.
         * @param settingsToUpdate a LocaleSettings object
         */
        function updateLocaleSettings(settingsToUpdate) {
            if (!currentLocale.settings) {
                currentLocale.settings = utils$2.assignDeep({}, englishUSLocaleSettings);
            }
            currentLocale.settings = utils$2.assignDeep(currentLocale.settings, settingsToUpdate);
        }
        i18n.updateLocaleSettings = updateLocaleSettings;
        /**
         * Updates the texts for the current locale
         * @param texts A plain JS object that contains textual resources
         */
        function updateLocaleTexts(texts) {
            if (typeof texts !== 'object') {
                console.error('Wrong parameter type in updateLocaleTexts function call.' +
                    'The first parameter (localeId) is not necessary. Use updateLocaleTexts(texts) instead');
                return;
            }
            mapInfo({ localeId: currentLocale.localeId, texts: texts });
            utils$2.assignDeep(currentLocale.texts, texts);
        }
        i18n.updateLocaleTexts = updateLocaleTexts;
        function updateDefaultTexts(texts) {
            for (let localeId in allLocales) {
                let locale = allLocales[localeId];
                locale.texts = utils$2.assignDeep({}, texts, locale.texts);
            }
            currentLocale.texts = utils$2.assignDeep({}, texts, currentLocale.texts);
        }
        i18n.updateDefaultTexts = updateDefaultTexts;
        /**
         * Updates the information for the specified locale.
         * @param localeId The locale ID (like 'en', 'de', 'uk', etc).
         * If the locale does exist yet - it will be added
         * @param localeInfo  a LocaleInfo object that contains the locale settings and textual resources
         */
        function updateLocaleInfo(localeId, localeData) {
            mapInfo(localeData);
            let localeInfoToUpdate = currentLocale;
            if (localeId) {
                if (!localeData.localeId) {
                    localeData.localeId = localeId;
                }
                localeInfoToUpdate = allLocales[localeId];
                if (!localeInfoToUpdate) {
                    localeInfoToUpdate = utils$2.assignDeep({}, defaultLocale);
                    allLocales[localeId] = localeInfoToUpdate;
                }
            }
            utils$2.assignDeep(localeInfoToUpdate, localeData);
        }
        i18n.updateLocaleInfo = updateLocaleInfo;
        /**
         * Adds the locale.
         * @param localeId The locale ID (like 'en', 'de', 'uk', etc).
         * If the locale does exist yet - it will be created
         * @param localeInfo - a LocaleInfo object that contains the locale settings and textual resources
         */
        function addLocale(localeId, localeInfo) {
            updateLocaleInfo(localeId, localeInfo);
        }
        i18n.addLocale = addLocale;
        /**
         * Overwrites some locale settings (date/time formats) with the formats used in browser's current language
         */
        function determineSettingsByLocale(localeId) {
            const now = new Date(2020, 5, 7, 19, 34, 56, 88);
            const dateOptions = { year: 'numeric', month: 'numeric', day: 'numeric' };
            const timeOptions = { hour: 'numeric', minute: 'numeric', second: 'numeric' };
            const dateStr = now.toLocaleDateString(localeId, dateOptions);
            const timeStr = now.toLocaleTimeString(localeId, timeOptions);
            let dateFormat = dateStr
                .replace('07', 'dd')
                .replace('7', 'd')
                .replace('06', 'MM')
                .replace('6', 'M')
                .replace('2020', 'yyyy')
                .replace('20', 'yy');
            let timeFormat = timeStr
                .replace('19', 'HH')
                .replace('07', 'hh')
                .replace('7', 'h')
                .replace('34', 'mm')
                .replace('56', 'ss')
                .replace('PM', 'tt');
            if (!currentLocale.settings) {
                currentLocale.settings = {};
            }
            const localeSettings = {
                shortDateFormat: dateFormat,
                shortTimeFormat: timeFormat
            };
            updateLocaleSettings(localeSettings);
        }
        function loadBrowserLocaleSettings() {
            const lang = typeof navigator === 'object' ? navigator.language : undefined;
            determineSettingsByLocale(lang);
        }
        function resetLocales() {
            if (!currentLocale) {
                currentLocale = utils$2.assignDeep({}, defaultLocale);
                loadBrowserLocaleSettings();
            }
        }
        i18n.resetLocales = resetLocales;
        const DT_FORMAT_RGEX = /\[([^\]]+)]|y{2,4}|M{1,4}|d{1,2}|H{1,2}|h{1,2}|m{2}|s{2}|t{2}/g;
        /**
         * Returns string representation of the date/time value according to the custom format (second parameter)
         * The format is compatible with the one used in .NET: https://docs.microsoft.com/en-us/dotnet/standard/base-types/custom-date-and-time-format-strings
         * @param date
         * @param format
         */
        function dateTimeToStr(date, format) {
            const year = date.getFullYear();
            const yearStr = year.toString();
            const month = date.getMonth() + 1;
            const day = date.getDate();
            const hour = date.getHours();
            const minute = date.getMinutes();
            const second = date.getSeconds();
            const hour12 = hour % 12 || 12; //the remainder of the division by 12. Or 12 if it's 0
            const isPm = hour > 11;
            const matches = {
                yyyy: yearStr,
                yy: yearStr.substring(yearStr.length - 2),
                MMMM: i18n.getLongMonthName(month),
                MMM: i18n.getShortMonthName(month),
                MM: (month < 10) ? '0' + month : month.toString(),
                M: month.toString(),
                dd: (day < 10) ? '0' + day : day.toString(),
                d: day.toString(),
                HH: (hour < 10) ? '0' + hour : hour.toString(),
                H: hour.toString(),
                hh: (hour12 < 10) ? '0' + hour12 : hour12.toString(),
                h: hour12.toString(),
                tt: isPm ? 'PM' : 'AM',
                mm: (minute < 10) ? '0' + minute : minute.toString(),
                ss: (second < 10) ? '0' + second : second.toString()
            };
            return format.replace(DT_FORMAT_RGEX, (match, $1) => {
                return $1 || matches[match];
            });
        }
        i18n.dateTimeToStr = dateTimeToStr;
        function dateTimeToStrEx(dateTime, dataType, format) {
            if (format) {
                if (format == 'd') {
                    format = buildShortDateTimeFormat(DataType$2.Date);
                }
                else if (format == 'D') {
                    format = buildLongDateTimeFormat(DataType$2.Date);
                }
                else if (format == 'f') {
                    format = buildShortDateTimeFormat(DataType$2.DateTime);
                }
                else if (format == 'F') {
                    format = buildLongDateTimeFormat(DataType$2.DateTime);
                }
            }
            else {
                format = buildShortDateTimeFormat(dataType);
            }
            return dateTimeToStr(dateTime, format);
        }
        i18n.dateTimeToStrEx = dateTimeToStrEx;
        function buildShortDateTimeFormat(dataType) {
            const localeSettings = getLocaleSettings();
            let format;
            switch (dataType) {
                case DataType$2.Date:
                    format = localeSettings.shortDateFormat;
                    break;
                case DataType$2.Time:
                    format = localeSettings.shortTimeFormat;
                    break;
                default:
                    format = localeSettings.shortDateFormat + ' ' + localeSettings.shortTimeFormat;
                    break;
            }
            return format;
        }
        function buildLongDateTimeFormat(dataType) {
            const localeSettings = getLocaleSettings();
            let format;
            switch (dataType) {
                case DataType$2.Date:
                    format = localeSettings.longDateFormat;
                    break;
                case DataType$2.Time:
                    format = localeSettings.longTimeFormat;
                    break;
                default:
                    format = localeSettings.longDateFormat + ' ' + localeSettings.longTimeFormat;
                    break;
            }
            return format;
        }
        /**
        * Converts a numeric value to the string taking into the account the decimal separator
        * @param value - the number to convert
        * @param format - the format of the number representation (D - decimal, F - float, C - currency)
        * @param decimalSeparator - the symbol that represents decimal separator. If not specified the function gets the one from the current locale settings.
        */
        function numberToStr(number, format, decimalSeparator) {
            if (format && format.length > 0) {
                const type = format.charAt(0).toUpperCase();
                if (type === 'S') {
                    return formatWithSequence(number, format.slice(1));
                }
                else if (['D', 'F', 'C'].indexOf(type) >= 0) {
                    const locale = getCurrentLocale();
                    return number.toLocaleString(locale, getNumberFormatOptions(format));
                }
                else {
                    return convertWithMask(Math.trunc(number), format);
                }
            }
            const localeSettings = getLocaleSettings();
            decimalSeparator = decimalSeparator || localeSettings.decimalSeparator;
            return number.toString().replace('.', decimalSeparator);
        }
        i18n.numberToStr = numberToStr;
        function booleanToStr(bool, format) {
            if (format && format.length > 0) {
                const type = format.charAt(0).toUpperCase();
                if (type === 'S') {
                    const values = format.slice(1).split('|');
                    if (values.length > 1) {
                        const value = values[(bool) ? 1 : 0];
                        return i18n.getText(value) || value;
                    }
                }
            }
            return `${bool}`;
        }
        i18n.booleanToStr = booleanToStr;
        const cachedSequenceFormats = {};
        function formatWithSequence(number, format) {
            if (!cachedSequenceFormats[format]) {
                // parse and save in cache format values 
                const values = format.split('|')
                    .filter(v => v.length > 0)
                    .map(v => v.split('='));
                cachedSequenceFormats[format] = {};
                if (values.length > 0) {
                    if (values[0].length > 1) {
                        for (const value of values) {
                            cachedSequenceFormats[format][Number.parseInt(value[1])] = value[0];
                        }
                    }
                    else {
                        values.forEach((value, index) => {
                            cachedSequenceFormats[format][index] = value[0];
                        });
                    }
                }
            }
            const values = cachedSequenceFormats[format];
            if (values[number] !== undefined) {
                const value = values[number];
                return i18n.getText(value) || value;
            }
            return number.toString();
        }
        function convertWithMask(number, mask) {
            let value = number.toString();
            let result = '';
            let index = value.length - 1;
            for (let i = mask.length - 1; i >= 0; i--) {
                const ch = mask.charAt(i);
                if (ch === '#' || ch === '0') {
                    if (index >= 0) {
                        result += value.charAt(index);
                        index--;
                    }
                    else {
                        if (ch === '0') {
                            result += 0;
                        }
                    }
                }
                else {
                    result += ch;
                }
            }
            return result.split('').reverse().join('');
        }
        function getNumberFormatOptions(format) {
            const localeSettings = getLocaleSettings();
            const type = format[0].toUpperCase();
            const digits = (format.length > 1)
                ? Number.parseInt(format.slice(1))
                : type == 'D' ? 1 : 2;
            switch (type) {
                case 'D':
                    return {
                        style: 'decimal',
                        useGrouping: false,
                        minimumIntegerDigits: digits
                    };
                case 'C':
                    return {
                        style: 'currency',
                        currency: localeSettings.currency,
                        minimumFractionDigits: digits
                    };
                default:
                    return {
                        style: 'decimal',
                        minimumFractionDigits: digits,
                        maximumFractionDigits: digits
                    };
            }
        }
    })(i18n$2 || (i18n$2 = {}));

    var ColumnAlignment$2;
    (function (ColumnAlignment) {
        ColumnAlignment[ColumnAlignment["None"] = 0] = "None";
        ColumnAlignment[ColumnAlignment["Left"] = 1] = "Left";
        ColumnAlignment[ColumnAlignment["Center"] = 2] = "Center";
        ColumnAlignment[ColumnAlignment["Right"] = 3] = "Right";
    })(ColumnAlignment$2 || (ColumnAlignment$2 = {}));

    let DataRow$2 = class DataRow {
        constructor(columns, values) {
            this.columns = columns;
            this.values = values;
        }
        toArray() {
            return Array.from(this.values);
        }
        size() {
            return this.values.length;
        }
        getValue(colIdOrIndex) {
            let index;
            if (typeof colIdOrIndex === "string") {
                index = this.columns.getIndex(colIdOrIndex);
                if (index === undefined) {
                    throw new RangeError(`No column with id '${colIdOrIndex}'`);
                }
            }
            else {
                index = colIdOrIndex;
            }
            if (index >= this.values.length)
                throw new RangeError("Out of range: " + index);
            return this.values[index];
        }
        setValue(colIdOrIndex, value) {
            let index;
            if (typeof colIdOrIndex === "string") {
                index = this.columns.getIndex(colIdOrIndex);
                if (index === undefined) {
                    throw new RangeError(`No column with id '${colIdOrIndex}'`);
                }
            }
            else {
                index = colIdOrIndex;
            }
            if (index >= this.values.length)
                throw new RangeError("Out of range: " + index);
            this.values[index] = value;
        }
    };

    /**
     * EasyData representation of GUID.
     */
    let EasyGuid$1 = class EasyGuid {
        /**
         * Generates new GUID.
         * @returns The string representation of GUID.
         */
        static newGuid() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }
    };

    /**
     * The representation of event emitter.
     */
    let EventEmitter$1 = class EventEmitter {
        /**
         * The default constructor.
         * @param source The source.
         */
        constructor(source) {
            this.silentMode = 0;
            this.events = new Array();
            this.source = source;
        }
        /**
         * Subscries to the event.
         * @param eventType The event type.
         * @param callback The callback.
         * @returns The subscribtion ID.
         */
        subscribe(eventType, callback) {
            let event = this.getEventRecByType(eventType);
            const eventCallback = {
                id: EasyGuid$1.newGuid(),
                callback: callback
            };
            if (event) {
                event.eventCallbacks.push(eventCallback);
            }
            else {
                event = {
                    type: eventType,
                    eventCallbacks: new Array(eventCallback)
                };
                this.events.push(event);
            }
            return eventCallback.id;
        }
        /**
         * Unsubsribes from the event.
         * @param eventType The event type.
         * @param callbackId The subscribtion ID.
         */
        unsubscribe(eventType, callbackId) {
            let event = this.getEventRecByType(eventType);
            if (event) {
                let index = -1;
                for (index = 0; index < event.eventCallbacks.length; index++) {
                    if (event.eventCallbacks[index].id === callbackId) {
                        break;
                    }
                }
                if (index >= 0) {
                    event.eventCallbacks.splice(index, 1);
                }
            }
        }
        /**
         * Fires the event.
         * @param eventType The event type.
         * @param data The event data.
         * @param postpone  The postpone.
         * @param force To fire force. If value is `true`, ignores silent mode.
         */
        fire(eventType, data, postpone = 0, force = false) {
            if (this.silentMode && !force) {
                return;
            }
            let eventRec = this.getEventRecByType(eventType);
            if (eventRec) {
                const eqevent = {
                    type: eventType,
                    source: this.source,
                    data: data
                };
                let emitAllFunc = () => {
                    for (let callback of eventRec.eventCallbacks) {
                        callback.callback(eqevent);
                    }
                };
                if (postpone > 0) {
                    setTimeout(emitAllFunc, postpone);
                }
                else {
                    emitAllFunc();
                }
            }
        }
        /**
         * Enters to silent mode.
         */
        enterSilentMode() {
            this.silentMode++;
        }
        /**
         * Exits from silent mode.
         */
        exitSilentMode() {
            if (this.silentMode) {
                this.silentMode--;
            }
        }
        /**
         * Checks if emitter is in silent mode.
         * @return `true`, if silent mode is enable.
         */
        isSilent() {
            return this.silentMode > 0;
        }
        getEventRecByType(eventType) {
            for (let event of this.events) {
                if (event.type == eventType) {
                    return event;
                }
            }
            return null;
        }
    };

    var liquid$2;
    (function (liquid) {
        function renderLiquidTemplate(template, vars) {
            let result = template;
            if (vars) {
                for (let v in vars) {
                    const liquidVarRegexp = new RegExp('\{\{' + v + '\}\}', 'g');
                    result = result.replace(liquidVarRegexp, vars[v]);
                }
            }
            return result;
        }
        liquid.renderLiquidTemplate = renderLiquidTemplate;
    })(liquid$2 || (liquid$2 = {}));

    i18n$2.resetLocales();

    //types
    if (typeof Object.values !== 'function') {
        Object.values = function (obj) {
            return Object.keys(obj).map(key => obj[key]);
        };
    }
    if (typeof Math.trunc !== 'function') {
        Math.trunc = function (x) {
            if (isNaN(x)) {
                return NaN;
            }
            if (x > 0) {
                return Math.floor(x);
            }
            return Math.ceil(x);
        };
    }

    var browserUtils$1;
    (function (browserUtils) {
        let _isFirefox = null;
        let _isIE = null;
        function IsIE() {
            if (_isIE === null) {
                const ua = navigator.userAgent;
                /* MSIE used to detect old browsers and Trident used to newer ones*/
                _isIE = ua.indexOf("MSIE ") > -1 || ua.indexOf("Trident/") > -1;
            }
            return _isIE;
        }
        browserUtils.IsIE = IsIE;
        function IsEdge() {
            const ua = window.navigator.userAgent;
            return !IsIE() && ua.includes('Edge/');
        }
        browserUtils.IsEdge = IsEdge;
        function IsFirefox() {
            if (_isFirefox === null) {
                const ua = navigator.userAgent;
                _isFirefox = ua.toLowerCase().indexOf('firefox') > -1;
            }
            return _isFirefox;
        }
        browserUtils.IsFirefox = IsFirefox;
        let _detectedIsMobileMode = false;
        let _isMobileMode = undefined;
        let detectIsMobileMode = () => {
            const oldValue = isMobileMode();
            _detectedIsMobileMode = window.matchMedia('only screen and (max-width: 840px)').matches
                || window.matchMedia('only screen and (max-height: 420px)').matches;
            const newValue = isMobileMode();
            if (newValue !== oldValue && mobileModeChangeHandler) {
                mobileModeChangeHandler(newValue);
            }
        };
        detectIsMobileMode();
        window.addEventListener('resize', () => detectIsMobileMode());
        function isMobileMode() {
            if (_isMobileMode !== undefined) {
                return _isMobileMode;
            }
            else {
                return _detectedIsMobileMode;
            }
        }
        browserUtils.isMobileMode = isMobileMode;
        function setIsMobileMode(value) {
            const oldValue = isMobileMode();
            _isMobileMode = value;
            const newValue = isMobileMode();
            if (newValue !== oldValue && mobileModeChangeHandler) {
                mobileModeChangeHandler(newValue);
            }
        }
        browserUtils.setIsMobileMode = setIsMobileMode;
        let mobileModeChangeHandler;
        function onMobileModeChanged(callback) {
            mobileModeChangeHandler = callback;
        }
        browserUtils.onMobileModeChanged = onMobileModeChanged;
        function getMobileCssClass() {
            return isMobileMode() ? 'k-mobile' : null;
        }
        browserUtils.getMobileCssClass = getMobileCssClass;
    })(browserUtils$1 || (browserUtils$1 = {}));

    /**
     * Wraps all the elements inside "parent" by "wrapper" element
     * @param parent The element to add wrapper to.
     * @param wrapper The element that will wrap child elements.
     */
    function wrapInner(parent, wrapper) {
        parent.appendChild(wrapper);
        while (parent.firstChild !== wrapper) {
            wrapper.appendChild(parent.firstChild);
        }
    }
    /**
     * Creates ands adds a new [[HTMLElement]] to "parent"
     * @param parent The element to add new element to.
     * @param tag Html tag of the new element.
     * @param options The options. In particular, options.cssClass sets the new element class.
     * @returns New element.
     */
    function addElement(parent, tag, options) {
        let element = document.createElement(tag);
        let opts = options || {};
        if (opts.cssClass) {
            element.className = opts.cssClass;
        }
        parent.appendChild(element);
        return element;
    }
    /**
     * Adds css class to the html element.
     * @param element The element to add css class to.
     * @param className The name of the css class to be added.
     */
    function addCssClass(element, className) {
        element.className = (element.className)
            ? element.className + ' ' + className
            : className;
    }
    /**
     * Hides the html element.
     * @param element The element to be hidden.
     */
    function hideElement(element) {
        element.style.display = 'none';
    }
    /**
     * Shows the html element.
     * @param element The element to be shown.
     * @param display The value of "display" style to be set. Default value is "block".
     */
    function showElement(element, display) {
        if (!display) {
            display = '';
        }
        element.style.display = display;
    }
    /**
     * Hides the "first" element and shows the "second".
     * @param first The element to be hidden.
     * @param second The element to be shown.
     * @param options The options. The following options are applied:
     * - display - the value of "display" style to be set. Default value is "block"
     * - duration - the duration of fading in and out
     * - complete - the callback to be called when toggle is complete
     */
    function toggleVisibility(first, second, options) {
        if (!options) {
            options = {};
        }
        if (!options.display) {
            options.display = '';
        }
        if (!options.duration) {
            options.duration = 200;
        }
        //TODO: later we need to make it fading in and out
        hideElement(first);
        showElement(second, options.display);
        if (options.complete) {
            options.complete();
        }
    }
    /**
     * Checks if element is visible
     * @param element The element to check.
     * @returns `true` if visible, otherwise - `false`.
     */
    function isVisible(element) {
        return element.style.display != 'none'
            && element.offsetWidth != 0
            && element.offsetHeight != 0;
    }
    function createBrowserEvent(eventName) {
        var event;
        if (typeof (Event) === 'function') {
            event = new Event(eventName);
        }
        else {
            event = document.createEvent('Event');
            event.initEvent(eventName, true, true);
        }
        return event;
    }
    function getViewportSize() {
        const width = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
        const height = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
        return {
            width: width,
            height: height
        };
    }
    function getDocSize() {
        if (browserUtils$1.IsIE())
            return getWinSize();
        const width = Math.max(document.documentElement.clientWidth, document.body.clientWidth || 0);
        const height = Math.max(document.documentElement.clientHeight, document.body.clientHeight || 0);
        return {
            width: width,
            height: height
        };
    }
    function getScrollPos$1() {
        const body = document.body;
        const docElem = document.documentElement;
        return {
            top: window.pageYOffset || docElem.scrollTop || body.scrollTop,
            left: window.pageXOffset || docElem.scrollLeft || body.scrollLeft
        };
    }
    function getElementAbsolutePos$1(element) {
        let res = { x: 0, y: 0 };
        if (element !== null) {
            const position = offset$1(element);
            res = { x: position.left, y: position.top };
        }
        return res;
    }
    function offset$1(element) {
        const defaultBoundingClientRect = { top: 0, right: 0, bottom: 0, left: 0, width: 0, height: 0 };
        let box;
        try {
            box = element.getBoundingClientRect();
        }
        catch (_a) {
            box = defaultBoundingClientRect;
        }
        const body = document.body;
        const docElem = document.documentElement;
        const scollPos = getScrollPos$1();
        const scrollTop = scollPos.top;
        const scrollLeft = scollPos.left;
        const clientTop = docElem.clientTop || body.clientTop || 0;
        const clientLeft = docElem.clientLeft || body.clientLeft || 0;
        const top = box.top + scrollTop - clientTop;
        const left = box.left + scrollLeft - clientLeft;
        return { top: Math.round(top), left: Math.round(left) };
    }
    function getWinSize() {
        return {
            width: window.innerWidth,
            height: window.innerHeight
        };
    }
    function slideDown(target, duration, callback) {
        target.style.removeProperty('display');
        let display = window.getComputedStyle(target).display;
        if (display === 'none')
            display = 'block';
        target.style.display = display;
        let height = target.offsetHeight;
        target.style.overflow = 'hidden';
        target.style.height = 0 + 'px';
        target.style.paddingTop = 0 + 'px';
        target.style.paddingBottom = 0 + 'px';
        target.style.marginTop = 0 + 'px';
        target.style.marginBottom = 0 + 'px';
        target.offsetHeight;
        target.style.boxSizing = 'border-box';
        target.style.transitionProperty = "height, margin, padding";
        target.style.transitionDuration = duration + 'ms';
        target.style.height = height + 'px';
        target.style.removeProperty('padding-top');
        target.style.removeProperty('padding-bottom');
        target.style.removeProperty('margin-top');
        target.style.removeProperty('margin-bottom');
        window.setTimeout(() => {
            target.style.removeProperty('height');
            target.style.removeProperty('overflow');
            target.style.removeProperty('transition-duration');
            target.style.removeProperty('transition-property');
            target.style.removeProperty('box-sizing');
            if (callback) {
                callback();
            }
        }, duration);
    }
    function slideUp(target, duration, callback) {
        target.style.transitionProperty = 'height, margin, padding';
        target.style.transitionDuration = duration + 'ms';
        target.style.boxSizing = 'border-box';
        target.style.height = target.offsetHeight + 'px';
        target.offsetHeight;
        target.style.overflow = 'hidden';
        target.style.height = 0 + 'px';
        target.style.paddingTop = 0 + 'px';
        target.style.paddingBottom = 0 + 'px';
        target.style.marginTop = 0 + 'px';
        target.style.marginBottom = 0 + 'px';
        window.setTimeout(() => {
            target.style.display = 'none';
            target.style.removeProperty('height');
            target.style.removeProperty('padding-top');
            target.style.removeProperty('padding-bottom');
            target.style.removeProperty('margin-top');
            target.style.removeProperty('margin-bottom');
            target.style.removeProperty('overflow');
            target.style.removeProperty('transition-duration');
            target.style.removeProperty('transition-property');
            target.style.removeProperty('box-sizing');
            if (callback) {
                callback();
            }
        }, duration);
    }
    const eqCssPrefix$1 = 'eqjs';
    const eqCssMobile = 'eqjs-mobile';

    function mask$1(input, maskPattern) {
        const d = { 9: '[0-9]', a: '[a-z]' };
        const mask = maskPattern.split('');
        const keyDownHandler = (e) => {
            // backspace key or delete key
            if (e.keyCode === 8 || e.keyCode === 46) {
                e.preventDefault();
                let mskd = [];
                let startSelection = input.selectionStart;
                if (startSelection == 0)
                    return;
                let selection = startSelection;
                let onlyLodash = true;
                for (let index = mask.length - 1; index >= 0; index--) {
                    const el = mask[index];
                    if (d[el]) {
                        let t = new RegExp(d[el], 'i').test(input.value.charAt(index));
                        if (t && index != startSelection - 1) {
                            onlyLodash = false;
                        }
                        if (index === startSelection - 1)
                            selection--;
                        mskd.push(t && index != startSelection - 1
                            ? input.value.charAt(index)
                            : '_');
                    }
                    else {
                        if (index === selection - 1)
                            selection--;
                        if (startSelection - 1 === index)
                            startSelection--;
                        mskd.push(el);
                    }
                }
                input.value = !onlyLodash ? mskd.reverse().join('') : '';
                input.selectionStart = input.selectionEnd = selection < 0 ? 0 : selection;
                const event = document.createEvent('Event');
                event.initEvent('input', true, true);
                input.dispatchEvent(event);
            }
        };
        const keyPressHandler = (e) => {
            const char = String.fromCharCode(e.charCode);
            if (char) {
                e.preventDefault();
                let mskd = [];
                let selectionStart = input.selectionStart;
                let selection = selectionStart;
                mask.forEach((el, index) => {
                    if (d[el]) {
                        const ch = (index != selectionStart)
                            ? input.value.charAt(index)
                            : char;
                        let t = new RegExp(d[el], 'i').test(ch);
                        mskd.push(t ? ch : '_');
                        if (t && selectionStart === index)
                            selection++;
                    }
                    else {
                        mskd.push(el);
                        if (selection === index)
                            selection++;
                        if (selectionStart === index)
                            selectionStart++;
                    }
                });
                input.value = mskd.join('');
                input.selectionStart = input.selectionEnd = selection;
                const event = document.createEvent('Event');
                event.initEvent('input', true, true);
                input.dispatchEvent(event);
            }
        };
        const inputHandler = (e) => {
            if (e.type === 'focus' && input.value !== '')
                return;
            let mskd = [];
            let startSelection = input.selectionStart;
            mask.forEach((el, index) => {
                if (d[el]) {
                    let t = new RegExp(d[el], 'i').test(input.value.charAt(index));
                    mskd.push(t ? input.value.charAt(index) : '_');
                }
                else {
                    mskd.push(el);
                }
            });
            input.value = mskd.join('');
            input.selectionStart = input.selectionEnd = startSelection;
        };
        input.addEventListener('keydown', keyDownHandler);
        input.addEventListener('keypress', keyPressHandler);
        input.addEventListener('input', inputHandler);
        input.addEventListener('focus', inputHandler);
    }

    let DomElementBuilder$1 = class DomElementBuilder {
        constructor(tag, parent) {
            if (typeof tag === "string") {
                this.element = document.createElement(tag);
            }
            else {
                this.element = tag;
            }
            if (parent && this.element.parentElement !== parent) {
                parent.appendChild(this.element);
            }
        }
        addChild(tag, childBuilder) {
            const builder = domel$1(tag, this.element);
            if (childBuilder) {
                childBuilder(builder);
            }
            return this;
        }
        addChildElement(element) {
            if (element) {
                this.element.appendChild(element);
            }
            return this;
        }
        attr(attrId, attrValue) {
            this.element.setAttribute(attrId, attrValue);
            return this;
        }
        id(value) {
            return this.attr("id", value);
        }
        focus() {
            this.element.focus();
            return this;
        }
        title(value) {
            return this.attr('title', value);
        }
        data(dataId, dataValue = null) {
            if (dataValue === null) {
                this.element.removeAttribute('data-' + dataId);
                return this;
            }
            else {
                return this.attr('data-' + dataId, dataValue);
            }
        }
        show() {
            return this.removeStyle('display');
        }
        hide(toHide = true) {
            return (toHide) ? this.setStyle('display', 'none') : this;
        }
        visible(isVisible = true) {
            return isVisible ? this.setStyle('visibility', 'visible') : this.setStyle('visibility', 'hidden');
        }
        isVisible() {
            return !!(this.element.offsetWidth || this.element.offsetHeight || this.element.getClientRects().length);
        }
        addClass(className, ...classNames) {
            if (className) {
                const fullList = [...className.trim().split(" "), ...classNames];
                for (let i = 0; i < fullList.length; i++)
                    this.element.classList.add(fullList[i]);
            }
            return this;
        }
        removeClass(className, ...classNames) {
            if (className) {
                const fullList = [...className.trim().split(" "), ...classNames];
                for (let i = 0; i < fullList.length; i++)
                    this.element.classList.remove(fullList[i]);
            }
            return this;
        }
        toggleClass(className, force = undefined) {
            if (className) {
                this.element.classList.toggle(className, force);
            }
            return this;
        }
        on(eventType, listener) {
            const eventTypes = eventType.split(' ');
            for (let i = 0; i < eventTypes.length; i++) {
                this.element.addEventListener(eventTypes[i], listener);
            }
            return this;
        }
        off(eventType, listener) {
            const eventTypes = eventType.split(' ');
            for (let i = 0; i < eventTypes.length; i++) {
                this.element.removeEventListener(eventTypes[i], listener);
            }
            return this;
        }
        setStyle(styleId, styleValue) {
            this.element.style.setProperty(styleId, styleValue);
            return this;
        }
        removeStyle(styleId) {
            this.element.style.removeProperty(styleId);
            return this;
        }
        text(text) {
            this.element.innerText = text;
            return this;
        }
        html(html) {
            this.element.innerHTML = html;
            return this;
        }
        clear() {
            const oldElem = this.element;
            this.element = document.createElement(this.element.tagName);
            oldElem.replaceWith(this.element);
        }
        addText(text) {
            const textEl = document.createTextNode(text);
            this.element.appendChild(textEl);
            return this;
        }
        addHtml(html) {
            this.element.innerHTML += html;
            return this;
        }
        toDOM() {
            return this.element;
        }
        appendTo(parent) {
            if (parent) {
                parent.appendChild(this.element);
            }
            return this;
        }
    };
    let DomTextAreaElementBuilder$1 = class DomTextAreaElementBuilder extends DomElementBuilder$1 {
        constructor(element, parent) {
            if (element) {
                super(element, parent);
            }
            else {
                super("textarea", parent);
            }
        }
        name(value) {
            this.element.name = value;
            return this;
        }
        rows(rows) {
            this.element.rows = rows;
            return this;
        }
        cols(cols) {
            this.element.cols = cols;
            return this;
        }
        value(value) {
            this.element.value = value;
            return this;
        }
    };
    let DomInputElementBuilder$1 = class DomInputElementBuilder extends DomElementBuilder$1 {
        constructor(element, parent) {
            if (element) {
                super(element, parent);
            }
            else {
                super("input", parent);
            }
        }
        name(value) {
            this.element.name = value;
            return this;
        }
        type(value) {
            this.element.type = value;
            return this;
        }
        size(value) {
            this.element.size = value;
            return this;
        }
        value(value) {
            if (value instanceof Date) {
                this.element.valueAsDate = value;
            }
            else if (typeof value === "number") {
                this.element.valueAsNumber = value;
            }
            else {
                this.element.value = value;
            }
            return this;
        }
        mask(maskPattern) {
            mask$1(this.element, maskPattern);
            return this;
        }
    };
    let DomSelectElementBuilder$1 = class DomSelectElementBuilder extends DomElementBuilder$1 {
        constructor(element, parent) {
            if (element) {
                super(element, parent);
            }
            else {
                super("select", parent);
            }
        }
        addOption(value) {
            const option = document.createElement('option');
            if (typeof value === "string") {
                option.value = value;
                option.innerHTML = value;
            }
            else {
                option.value = value.value;
                option.innerHTML = value.title || value.value;
                option.selected = value.selected || false;
            }
            this.element.appendChild(option);
            return this;
        }
        value(value) {
            this.element.value = value;
            return this;
        }
    };
    function domel$1(tag, parent) {
        if (tag === "div" || tag instanceof HTMLDivElement) {
            return new DomElementBuilder$1(tag, parent);
        }
        if (tag === "span" || tag instanceof HTMLSpanElement) {
            return new DomElementBuilder$1(tag, parent);
        }
        else if (tag === "a" || tag instanceof HTMLAnchorElement) {
            return new DomElementBuilder$1(tag, parent);
        }
        else if (tag === "button" || tag instanceof HTMLButtonElement) {
            return new DomElementBuilder$1(tag, parent);
        }
        else if (tag === "img" || tag instanceof HTMLImageElement) {
            return new DomElementBuilder$1(tag, parent);
        }
        else if (tag === "input" || tag instanceof HTMLInputElement) {
            return new DomInputElementBuilder$1(tag instanceof HTMLInputElement ? tag : null, parent);
        }
        else if (tag === "textarea" || tag instanceof HTMLTextAreaElement) {
            return new DomTextAreaElementBuilder$1(tag instanceof HTMLTextAreaElement ? tag : null, parent);
        }
        else if (tag === "select" || tag instanceof HTMLSelectElement) {
            return new DomSelectElementBuilder$1(tag instanceof HTMLSelectElement ? tag : null, parent);
        }
        return new DomElementBuilder$1(tag, parent);
    }

    const touchEventIsDefined$1 = typeof TouchEvent !== 'undefined';
    var DropEffect$1;
    (function (DropEffect) {
        DropEffect["None"] = "none";
        DropEffect["Allow"] = "allow";
        DropEffect["Forbid"] = "forbid";
    })(DropEffect$1 || (DropEffect$1 = {}));
    let EqDragEvent$1 = class EqDragEvent {
        constructor(item, dragImage, sourceEvent) {
            this.dropEffect = DropEffect$1.Allow;
            this.pageX = 0;
            this.pageY = 0;
            this.item = item;
            this.dragImage = dragImage;
            this.data = item.data;
            this.sourceEvent = sourceEvent;
            if (sourceEvent && sourceEvent instanceof MouseEvent) {
                this.pageX = sourceEvent.pageX,
                    this.pageY = sourceEvent.pageY;
            }
            if (sourceEvent && touchEventIsDefined$1 && sourceEvent instanceof TouchEvent
                && sourceEvent.touches[0]) {
                this.pageX = sourceEvent.touches[0].pageX,
                    this.pageY = sourceEvent.touches[0].pageY;
            }
        }
    };
    let Position$1 = class Position {
        constructor(ev) {
            if (ev && ev instanceof MouseEvent) {
                this.x = ev.pageX,
                    this.y = ev.pageY;
            }
            if (ev && touchEventIsDefined$1 && ev instanceof TouchEvent && ev.touches[0]) {
                this.x = ev.touches[0].pageX,
                    this.y = ev.touches[0].pageY;
            }
        }
    };
    let DragManager$1 = class DragManager {
        constructor() {
            this.delta = 5;
            this.draggableItem = null;
            this.dragImage = null;
            this.finishedSuccessfully = false;
            this.mouseDownPosition = null;
            this.containerDescriptors = [];
            this.containerDescriptorIndex = -1;
            this.dropEffect = DropEffect$1.None;
            this.classPrefix = 'eqjs-drop';
            this.DRAG_DISABLED_ATTR = 'drag-disabled';
        }
        registerDraggableItem(descriptor) {
            const element = descriptor.element;
            if (!element) {
                throw Error("Element in draggle item is null or undefined");
            }
            element.ondragstart = function () {
                return false;
            };
            const detectDragging = (ev) => {
                if (element.hasAttribute(this.DRAG_DISABLED_ATTR)) {
                    return;
                }
                ev.preventDefault();
                if (ev instanceof MouseEvent) {
                    ev.stopPropagation();
                }
                const cursorPosition = new Position$1(ev);
                if (Math.abs(cursorPosition.x - this.mouseDownPosition.x) > this.delta
                    || Math.abs(cursorPosition.y - this.mouseDownPosition.y) > this.delta) {
                    startDragging(ev);
                }
            };
            const mouseMoveEventListener = (ev) => {
                this.mouseMoveDragListener(ev);
            };
            const startDragging = (ev) => {
                ev.preventDefault();
                ev.stopPropagation();
                element.removeEventListener('mousemove', detectDragging);
                element.removeEventListener('touchmove', detectDragging);
                this.finishedSuccessfully = false;
                if (descriptor.beforeDragStart)
                    descriptor.beforeDragStart();
                this.dragImage = domel$1('div')
                    .setStyle('position', 'absolute')
                    .setStyle('z-index', '65530')
                    .toDOM();
                document.body.appendChild(this.dragImage);
                this.dragImage.appendChild(element.cloneNode(true));
                if (descriptor.renderer) {
                    descriptor.renderer(this.dragImage);
                }
                this.dropEffect = DropEffect$1.None;
                this.updateCusror(this.dropEffect);
                this.updateImageClass(this.dropEffect);
                this.draggableItem = {
                    element: element,
                    scope: descriptor.scope,
                    data: descriptor.data
                };
                this.updateDragItemPosition(ev);
                const event = new EqDragEvent$1(this.draggableItem, this.dragImage, ev);
                event.dropEffect = this.dropEffect;
                if (descriptor.onDragStart) {
                    descriptor.onDragStart(event);
                }
                if (this.dropEffect !== event.dropEffect) {
                    this.dropEffect = event.dropEffect;
                    this.updateImageClass(this.dropEffect);
                }
                document.addEventListener('mousemove', mouseMoveEventListener, true);
                document.addEventListener('touchmove', mouseMoveEventListener, true);
            };
            const mouseDownListener = (ev) => {
                if (touchEventIsDefined$1 && ev instanceof TouchEvent) {
                    ev.preventDefault();
                }
                this.mouseDownPosition = new Position$1(ev);
                element.addEventListener('mousemove', detectDragging);
                element.addEventListener('touchmove', detectDragging);
                document.addEventListener('mouseup', mouseUpListener);
                document.addEventListener('touchend', mouseUpListener);
            };
            element.addEventListener('mousedown', mouseDownListener);
            element.addEventListener('touchstart', mouseDownListener);
            const mouseUpListener = (ev) => {
                this.mouseDownPosition = null;
                element.removeEventListener('mousemove', detectDragging);
                element.removeEventListener('touchmove', detectDragging);
                document.removeEventListener('mousemove', mouseMoveEventListener, true);
                document.removeEventListener('touchmove', mouseMoveEventListener, true);
                if (this.draggableItem) {
                    endDraggind(ev);
                }
            };
            const endDraggind = (ev) => {
                try {
                    if (this.containerDescriptorIndex >= 0) {
                        const dropContDesc = this.containerDescriptors[this.containerDescriptorIndex];
                        const container = {
                            element: dropContDesc.element,
                            scopes: dropContDesc.scopes,
                            data: dropContDesc.data
                        };
                        const event = new EqDragEvent$1(this.draggableItem, this.dragImage, ev);
                        try {
                            if (container.scopes.indexOf(this.draggableItem.scope) >= 0
                                && this.dropEffect === DropEffect$1.Allow) {
                                this.finishedSuccessfully = true;
                                if (dropContDesc.onDrop) {
                                    dropContDesc.onDrop(container, event);
                                }
                            }
                        }
                        finally {
                            if (dropContDesc.onDragLeave) {
                                dropContDesc.onDragLeave(container, event);
                            }
                        }
                    }
                }
                finally {
                    try {
                        const event = new EqDragEvent$1(this.draggableItem, this.dragImage, ev);
                        event.data.finishedSuccessfully = this.finishedSuccessfully;
                        if (descriptor.onDragEnd) {
                            descriptor.onDragEnd(event);
                        }
                    }
                    finally {
                        this.draggableItem = null;
                        if (this.dragImage && this.dragImage.parentElement) {
                            this.dragImage.parentElement.removeChild(this.dragImage);
                        }
                        this.dragImage = null;
                        this.finishedSuccessfully = false;
                        document.removeEventListener('mouseup', mouseUpListener);
                        document.removeEventListener('touchend', mouseUpListener);
                    }
                }
            };
        }
        registerDropContainer(descriptor) {
            const element = descriptor.element;
            if (!element) {
                throw Error("Element in drop container is null or undefined");
            }
            this.containerDescriptors.push(descriptor);
        }
        removeDropContainer(descriptorOrSlot) {
            const descs = this.containerDescriptors
                .filter(desc => desc === descriptorOrSlot
                || desc.element == descriptorOrSlot);
            if (descs) {
                for (const desc of descs) {
                    utils$2.removeArrayItem(this.containerDescriptors, desc);
                }
            }
        }
        mouseMoveDragListener(ev) {
            if (ev instanceof MouseEvent) {
                ev.preventDefault();
            }
            ev.stopPropagation();
            this.updateDragItemPosition(ev);
            if (this.containerDescriptorIndex == -1) {
                for (let i = 0; i < this.containerDescriptors.length; i++) {
                    const descriptor = this.containerDescriptors[i];
                    if (this.detectDragEnterEvent(descriptor.element, ev)) {
                        this.containerDescriptorIndex = i;
                        break;
                    }
                }
                if (this.containerDescriptorIndex >= 0) {
                    this.dragEnterEvent(ev);
                }
            }
            else {
                const descriptor = this.containerDescriptors[this.containerDescriptorIndex];
                if (this.detectDragLeaveEvent(descriptor.element, ev)) {
                    this.dragLeaveEvent(ev);
                    this.containerDescriptorIndex = -1;
                }
            }
            if (this.containerDescriptorIndex >= 0) {
                const descriptor = this.containerDescriptors[this.containerDescriptorIndex];
                const container = {
                    element: descriptor.element,
                    scopes: descriptor.scopes,
                    data: descriptor.data
                };
                if (container.scopes.indexOf(this.draggableItem.scope) >= 0) {
                    const event = new EqDragEvent$1(this.draggableItem, this.dragImage, ev);
                    event.dropEffect = this.dropEffect;
                    if (descriptor.onDragOver) {
                        descriptor.onDragOver(container, event);
                    }
                }
            }
        }
        updateCusror(dropEffect) {
            switch (dropEffect) {
                case DropEffect$1.Allow:
                    this.setCursorStyle(this.dragImage, 'grabbing');
                    break;
                case DropEffect$1.Forbid:
                    this.setCursorStyle(this.dragImage, 'no-drop');
                    break;
                default:
                    this.setCursorStyle(this.dragImage, 'grabbing');
                    break;
            }
        }
        updateImageClass(dropEffect) {
            this.dragImage.classList.remove(`${this.classPrefix}-allow`);
            this.dragImage.classList.remove(`${this.classPrefix}-forbid`);
            this.dragImage.classList.remove(`${this.classPrefix}-none`);
            switch (dropEffect) {
                case DropEffect$1.Allow:
                    this.dragImage.classList.add(`${this.classPrefix}-allow`);
                    break;
                case DropEffect$1.None:
                    this.dragImage.classList.add(`${this.classPrefix}-none`);
                    break;
                case DropEffect$1.Forbid:
                    this.dragImage.classList.add(`${this.classPrefix}-forbid`);
                    break;
                default:
                    this.dragImage.classList.add(`${this.classPrefix}-none`);
                    break;
            }
        }
        setCursorStyle(element, cursor) {
            if (element) {
                element.style.cursor = cursor;
                for (let i = 0; i < element.children.length; i++) {
                    this.setCursorStyle(element.children[i], cursor);
                }
            }
        }
        updateDragItemPosition(ev) {
            if (this.dragImage) {
                const pos = new Position$1(ev);
                this.dragImage.style.top = (pos.y - this.dragImage.offsetHeight / 2) + 'px';
                this.dragImage.style.left = (pos.x - this.dragImage.offsetWidth / 2) + 'px';
            }
        }
        dragEnterEvent(ev) {
            const descriptor = this.containerDescriptors[this.containerDescriptorIndex];
            const container = {
                element: descriptor.element,
                scopes: descriptor.scopes,
                data: descriptor.data
            };
            if (container.scopes.indexOf(this.draggableItem.scope) >= 0) {
                const event = new EqDragEvent$1(this.draggableItem, this.dragImage, ev);
                event.dropEffect = DropEffect$1.Allow;
                if (descriptor.onDragEnter) {
                    descriptor.onDragEnter(container, event);
                }
                this.dropEffect = event.dropEffect;
                this.updateCusror(this.dropEffect);
                this.updateImageClass(this.dropEffect);
            }
            else {
                if (this.dropEffect !== DropEffect$1.Forbid) {
                    this.dropEffect = DropEffect$1.None;
                    this.updateCusror(this.dropEffect);
                    this.updateImageClass(this.dropEffect);
                }
            }
        }
        dragLeaveEvent(ev) {
            const descriptor = this.containerDescriptors[this.containerDescriptorIndex];
            const container = {
                element: descriptor.element,
                scopes: descriptor.scopes,
                data: descriptor.data
            };
            if (container.scopes.indexOf(this.draggableItem.scope) >= 0) {
                const event = new EqDragEvent$1(this.draggableItem, this.dragImage, ev);
                event.dropEffect = DropEffect$1.None;
                if (descriptor.onDragLeave) {
                    descriptor.onDragLeave(container, event);
                }
                this.dropEffect = event.dropEffect;
                this.updateCusror(this.dropEffect);
                this.updateImageClass(this.dropEffect);
            }
        }
        detectDragEnterEvent(container, ev) {
            const containerPos = getElementAbsolutePos$1(container);
            const pos = new Position$1(ev);
            if (pos.y < containerPos.y || pos.y > containerPos.y + container.offsetHeight) {
                return false;
            }
            if (pos.x < containerPos.x || pos.x > containerPos.x + container.offsetWidth) {
                return false;
            }
            return true;
        }
        detectDragLeaveEvent(container, ev) {
            const containerPos = getElementAbsolutePos$1(container);
            const pos = new Position$1(ev);
            if (pos.y > containerPos.y && pos.y < containerPos.y + container.offsetHeight
                && pos.x > containerPos.x && pos.x < containerPos.x + container.offsetWidth) {
                return false;
            }
            return true;
        }
    };
    //global variable
    const eqDragManager$1 = new DragManager$1();

    var AutoResizeColumns$1;
    (function (AutoResizeColumns) {
        AutoResizeColumns[AutoResizeColumns["Always"] = 0] = "Always";
        AutoResizeColumns[AutoResizeColumns["Once"] = 1] = "Once";
        AutoResizeColumns[AutoResizeColumns["Never"] = 2] = "Never";
    })(AutoResizeColumns$1 || (AutoResizeColumns$1 = {}));

    //import { CellRendererType } from "./easy_grid_cell_renderer";
    //import { GridCellRenderer } from './easy_grid_cell_renderer';
    const DEFAULT_WIDTH_STRING$1 = 250;
    const ROW_NUM_WIDTH$1 = 60;
    var GridColumnAlign$1;
    (function (GridColumnAlign) {
        GridColumnAlign[GridColumnAlign["NONE"] = 1] = "NONE";
        GridColumnAlign[GridColumnAlign["LEFT"] = 2] = "LEFT";
        GridColumnAlign[GridColumnAlign["CENTER"] = 3] = "CENTER";
        GridColumnAlign[GridColumnAlign["RIGHT"] = 4] = "RIGHT";
    })(GridColumnAlign$1 || (GridColumnAlign$1 = {}));
    function MapAlignment$1(alignment) {
        switch (alignment) {
            case ColumnAlignment$2.Left:
                return GridColumnAlign$1.LEFT;
            case ColumnAlignment$2.Center:
                return GridColumnAlign$1.CENTER;
            case ColumnAlignment$2.Right:
                return GridColumnAlign$1.RIGHT;
            default:
                return GridColumnAlign$1.NONE;
        }
    }
    let GridColumn$1 = class GridColumn {
        constructor(column, grid, isRowNum = false) {
            this._label = null;
            this._description = null;
            //public left: number;
            this.align = GridColumnAlign$1.NONE;
            this.isVisible = true;
            this.isRowNum = false;
            this.dataColumn = column;
            this.grid = grid;
            const widthOptions = grid.options.columnWidths || {};
            if (column) {
                if (column.style.alignment) {
                    this.align = MapAlignment$1(column.style.alignment);
                }
                this.width = (widthOptions && widthOptions[this.type]) ? widthOptions[this.type].default : DEFAULT_WIDTH_STRING$1;
                this._description = column.description;
            }
            else if (isRowNum) {
                this.isRowNum = true;
                this.width = (widthOptions && widthOptions.rowNumColumn) ? widthOptions.rowNumColumn.default : ROW_NUM_WIDTH$1;
                this._label = '';
            }
        }
        get label() {
            return this._label ? this._label : this.isRowNum ? '' : this.dataColumn.label;
        }
        ;
        set label(value) {
            this._label = this.label;
        }
        /** Get column description. */
        get description() {
            return this._description;
        }
        get type() {
            return this.dataColumn ? this.dataColumn.type : null;
        }
    };
    let GridColumnList$1 = class GridColumnList {
        constructor(columnList, grid) {
            this.items = [];
            this.grid = grid;
            this.sync(columnList);
        }
        sync(columnList, hasRowNumCol = true) {
            this.clear();
            const rowNumCol = new GridColumn$1(null, this.grid, true);
            this.add(rowNumCol);
            if (!hasRowNumCol) {
                rowNumCol.isVisible = false;
            }
            if (columnList) {
                for (let column of columnList.getItems()) {
                    const col = new GridColumn$1(column, this.grid);
                    if (this.grid.options.onSyncGridColumn) {
                        this.grid.options.onSyncGridColumn(col);
                    }
                    this.add(col);
                }
            }
        }
        get count() {
            return this.items.length;
        }
        add(col) {
            const index = this.items.length;
            this.items.push(col);
            return index;
        }
        put(index, col) {
            if (index >= 0 && index < this.items.length) {
                this.items[index] = col;
            }
        }
        move(col, newIndex) {
            let oldIndex = this.items.indexOf(col);
            if (oldIndex >= 0 && oldIndex != newIndex)
                utils$2.moveArrayItem(this.items, oldIndex, newIndex);
        }
        get(index) {
            if (index >= 0 && index < this.items.length) {
                return this.items[index];
            }
            else {
                return null;
            }
        }
        //    public getIndex(name: string) : number {
        //        return this.mapper[name];
        //    }
        getItems() {
            return this.items;
        }
        removeAt(index) {
            this.get(index);
            this.items.splice(index, 1);
            //delete this.mapper[col.name];
        }
        clear() {
            this.items = [];
            //this.mapper = {};
        }
    };

    const cssPrefix$1$1 = "keg";
    const DFMT_REGEX$1 = /{0:(.*?)}/g;
    var CellRendererType$1;
    (function (CellRendererType) {
        CellRendererType[CellRendererType["STRING"] = 1] = "STRING";
        CellRendererType[CellRendererType["NUMBER"] = 2] = "NUMBER";
        CellRendererType[CellRendererType["DATETIME"] = 3] = "DATETIME";
        CellRendererType[CellRendererType["BOOL"] = 4] = "BOOL";
    })(CellRendererType$1 || (CellRendererType$1 = {}));
    const StringCellRendererDefault$1 = (value, column, cellValueElement, rowElement) => {
        const text = value ? value.toString().replace(/\n/g, '\u21B5 ') : '';
        cellValueElement.innerText = text;
        cellValueElement.title = text;
        if (column.align == GridColumnAlign$1.NONE) {
            cellValueElement.classList.add(`${cssPrefix$1$1}-cell-value-align-left`);
        }
    };
    const NumberCellRendererDefault$1 = (value, column, cellValueElement, rowElement) => {
        let strValue = (value || '').toString();
        if (typeof value == 'number') {
            if (column.dataColumn && column.dataColumn.displayFormat
                && DFMT_REGEX$1.test(column.dataColumn.displayFormat)) {
                strValue = column.dataColumn.displayFormat.replace(DFMT_REGEX$1, (_, $1) => {
                    return i18n$2.numberToStr(value, $1);
                });
            }
            else {
                strValue = value.toLocaleString();
            }
        }
        cellValueElement.innerText = strValue;
        cellValueElement.title = strValue;
        if (column.align == GridColumnAlign$1.NONE) {
            cellValueElement.classList.add(`${cssPrefix$1$1}-cell-value-align-right`);
        }
    };
    const DateTimeCellRendererDefault$1 = (value, column, cellValueElement, rowElement) => {
        const isDate = Object.prototype.toString.call(value) === '[object Date]';
        let strValue = (value || '').toString();
        if (isDate) {
            if (column.dataColumn && column.dataColumn.displayFormat
                && DFMT_REGEX$1.test(column.dataColumn.displayFormat)) {
                strValue = column.dataColumn.displayFormat.replace(DFMT_REGEX$1, (_, $1) => {
                    return i18n$2.dateTimeToStrEx(value, column.type, $1);
                });
            }
            else {
                const locale = i18n$2.getCurrentLocale();
                const timeOptions = { hour: 'numeric', minute: 'numeric', second: 'numeric' };
                switch (column.type) {
                    case DataType$2.Date:
                        strValue = value.toLocaleDateString(locale);
                        break;
                    case DataType$2.Time:
                        strValue = value.toLocaleTimeString(locale, timeOptions);
                        break;
                    case DataType$2.DateTime:
                        strValue = `${value.toLocaleDateString(locale)} ${value.toLocaleTimeString(locale, timeOptions)}`;
                        break;
                }
            }
        }
        cellValueElement.innerText = strValue;
        cellValueElement.title = strValue;
        if (column.align == GridColumnAlign$1.NONE) {
            cellValueElement.classList.add(`${cssPrefix$1$1}-cell-value-align-right`);
        }
    };
    const BoolCellRendererDefault$1 = (value, column, cellValueElement, rowElement) => {
        if (column.dataColumn && column.dataColumn.displayFormat
            && DFMT_REGEX$1.test(column.dataColumn.displayFormat)) {
            const strValue = column.dataColumn.displayFormat.replace(DFMT_REGEX$1, (_, $1) => {
                return i18n$2.booleanToStr(value, $1);
            });
            return StringCellRendererDefault$1(strValue, column, cellValueElement);
        }
        else {
            cellValueElement.classList.add(`${cssPrefix$1$1}-cell-value-bool`);
            cellValueElement.classList.add(`${cssPrefix$1$1}-${value ? 'cell-value-true' : 'cell-value-false'}`);
        }
    };
    let GridCellRendererStore$1 = class GridCellRendererStore {
        constructor(options) {
            this.renderers = {};
            this.defaultRenderers = {};
            this.registerRenderer('StringDefault', StringCellRendererDefault$1);
            this.setDefaultRenderer(CellRendererType$1.STRING, StringCellRendererDefault$1);
            this.registerRenderer('NumberDefault', NumberCellRendererDefault$1);
            this.setDefaultRenderer(CellRendererType$1.NUMBER, NumberCellRendererDefault$1);
            this.registerRenderer('DateTimeDefault', DateTimeCellRendererDefault$1);
            this.setDefaultRenderer(CellRendererType$1.DATETIME, DateTimeCellRendererDefault$1);
            this.registerRenderer('BoolDefault', BoolCellRendererDefault$1);
            this.setDefaultRenderer(CellRendererType$1.BOOL, BoolCellRendererDefault$1);
        }
        getDefaultRenderer(columnType) {
            const cellType = this.getCellType(columnType);
            return this.defaultRenderers[CellRendererType$1[cellType]];
        }
        getDefaultRendererByType(rendererType) {
            return this.defaultRenderers[CellRendererType$1[rendererType]];
        }
        setDefaultRenderer(cellType, renderer) {
            if (renderer) {
                this.defaultRenderers[CellRendererType$1[cellType]] = renderer;
            }
        }
        getRenderer(name) {
            return this.renderers[name];
        }
        registerRenderer(name, renderer) {
            this.renderers[name] = renderer;
        }
        getCellType(dataType) {
            switch (dataType) {
                case DataType$2.Autoinc:
                case DataType$2.Byte:
                case DataType$2.Word:
                case DataType$2.Currency:
                case DataType$2.Float:
                case DataType$2.Int32:
                case DataType$2.Int64:
                    return CellRendererType$1.NUMBER;
                case DataType$2.Date:
                case DataType$2.DateTime:
                case DataType$2.Time:
                    return CellRendererType$1.DATETIME;
                case DataType$2.Bool:
                    return CellRendererType$1.BOOL;
                default:
                    return CellRendererType$1.STRING;
            }
        }
    };

    const DEFAULT_ROW_HEIGHT$1 = 36;
    /** Represents a grid widget with columns rows, paging, custom rendering and more */
    let EasyGrid$1 = class EasyGrid {
        /** Creates and initializes all internal properties of the grid object */
        constructor(options) {
            this.cssPrefix = "keg";
            this.pagination = { page: 1, pageSize: 30, total: 0 };
            this.paginationOptions = {
                maxButtonCount: 10,
                useBootstrap: false //true
            };
            this.defaultDataGridOptions = {
                slot: null,
                dataTable: null,
                fixHeightOnFirstRender: false,
                syncGridColumns: true,
                useRowNumeration: true,
                allowDragDrop: false,
                aggregates: {
                    settings: null,
                    calculator: null
                },
                paging: {
                    enabled: true,
                    pageSize: 30,
                    pageSizeItems: [20, 30, 50, 100, 200]
                },
                columnWidths: {
                    autoResize: AutoResizeColumns$1.Always,
                    stringColumns: {
                        min: 100,
                        max: 500,
                        default: 250
                    },
                    numberColumns: {
                        min: 60,
                        default: 120
                    },
                    boolColumns: {
                        min: 50,
                        default: 80
                    },
                    dateColumns: {
                        min: 80,
                        default: 200
                    },
                    otherColumns: {
                        min: 100,
                        max: 500,
                        default: 250
                    },
                    rowNumColumn: {
                        min: 40,
                        default: 60
                    }
                },
                showPlusButton: false,
                viewportRowsCount: null,
                showActiveRow: true
            };
            this.rowsOnPagePromise = null;
            this.containerInitialHeight = 0;
            this.firstRender = true;
            this.prevRowTotals = null;
            this.landingIndex = -1;
            this.landingSlot = domel$1('div')
                .addClass(`${this.cssPrefix}-col-landing-slot`)
                .addChildElement(domel$1('div')
                .toDOM())
                .toDOM();
            this._activeRowIndex = -1;
            if (options && options.paging) {
                options.paging = utils$2.assign(this.defaultDataGridOptions.paging, options.paging);
            }
            this.options = this.mergeOptions(options);
            this.processColumnWidthsOptions();
            if (!this.options.slot)
                throw Error('"slot" parameter is required to initialize EasyDataGrid');
            if (!this.options.dataTable)
                throw Error('"dataTable" parameter is required to initialize EasyDataGrid');
            this.dataTable = options.dataTable;
            this.eventEmitter = new EventEmitter$1(this);
            this.cellRendererStore = new GridCellRendererStore$1(options);
            this.columns = new GridColumnList$1(this.dataTable.columns, this);
            this.setSlot(this.options.slot);
            this.init(this.options);
        }
        mergeOptions(options) {
            const colWidthOptions = utils$2.assignDeep({}, this.defaultDataGridOptions.columnWidths, options.columnWidths);
            const pagingOptions = utils$2.assignDeep({}, this.defaultDataGridOptions.paging, options.paging);
            const result = utils$2.assign({}, this.defaultDataGridOptions, options);
            result.columnWidths = colWidthOptions;
            result.paging = pagingOptions;
            return result;
        }
        processColumnWidthsOptions() {
            const widthOptions = this.options.columnWidths;
            if (!widthOptions)
                return;
            //string columns
            utils$2.getStringDataTypes().forEach(dataType => {
                widthOptions[dataType] = Object.assign(Object.assign({}, widthOptions.stringColumns), widthOptions[dataType]);
            });
            //numeric columns
            utils$2.getNumericDataTypes().forEach(dataType => {
                widthOptions[dataType] = Object.assign(Object.assign({}, widthOptions.numberColumns), widthOptions[dataType]);
            });
            //bool columns
            widthOptions[DataType$2.Bool] = Object.assign(Object.assign({}, widthOptions.boolColumns), widthOptions[DataType$2.Bool]);
            //date columns
            utils$2.getDateDataTypes().forEach(dataType => {
                widthOptions[dataType] = Object.assign(Object.assign({}, widthOptions.dateColumns), widthOptions[dataType]);
            });
            //other columns
            const knownTypes = [
                ...utils$2.getStringDataTypes(),
                ...utils$2.getNumericDataTypes(),
                ...utils$2.getDateDataTypes(),
                DataType$2.Bool
            ];
            utils$2.getAllDataTypes().forEach(dataType => {
                if (!(dataType in knownTypes)) {
                    widthOptions[dataType] = Object.assign(Object.assign({}, widthOptions.otherColumns), widthOptions[dataType]);
                }
            });
            widthOptions[DataType$2.Unknown] = widthOptions.otherColumns;
        }
        setSlot(slot) {
            if (typeof slot === 'string') {
                if (slot.length) {
                    if (slot[0] === '#') {
                        this.slot = document.getElementById(slot.substring(1));
                    }
                    else if (slot[0] === '.') {
                        const result = document.getElementsByClassName(slot.substring(1));
                        if (result.length)
                            this.slot = result[0];
                    }
                    else {
                        throw Error('Unrecognized slot parameter ' +
                            '(Must be id, class or HTMLElement): ' + slot);
                    }
                }
            }
            else {
                this.slot = slot;
            }
        }
        /** Initializes grid widget according to the options passed in the parameter */
        init(options) {
            if (options.onInit) {
                this.addEventListener('init', options.onInit);
            }
            if (options.onRowClick) {
                this.addEventListener('rowClick', options.onRowClick);
            }
            if (options.onRowDbClick) {
                this.addEventListener('rowDbClick', options.onRowDbClick);
            }
            if (options.onPlusButtonClick) {
                this.addEventListener('plusButtonClick', options.onPlusButtonClick);
            }
            if (options.onColumnChanged) {
                this.addEventListener('columnChanged', options.onColumnChanged);
            }
            if (options.onColumnDeleted) {
                this.addEventListener('columnDeleted', options.onColumnDeleted);
            }
            if (options.onColumnMoved) {
                this.addEventListener('columnMoved', options.onColumnMoved);
            }
            if (options.onPageChanged) {
                this.addEventListener('pageChanged', options.onPageChanged);
            }
            if (options.onActiveRowChanged) {
                this.addEventListener('activeRowChanged', options.onActiveRowChanged);
            }
            this.addEventListener('pageChanged', ev => this.activeRowIndex = -1);
            utils$2.assignDeep(this.paginationOptions, options.pagination);
            this.pagination.pageSize = this.options.paging.pageSize
                || this.pagination.pageSize;
            if (this.options.allowDragDrop) {
                eqDragManager$1.registerDropContainer({
                    element: this.slot,
                    scopes: ["gridColumnMove"],
                    onDragEnter: (_, ev) => {
                        this.slot.classList.add(`${eqCssPrefix$1}-drophover`);
                        this.showLandingSlot(ev.pageX, ev.pageY);
                    },
                    onDragOver: (_, ev) => {
                        this.showLandingSlot(ev.pageX, ev.pageY);
                    },
                    onDragLeave: (_, ev) => {
                        ev.dropEffect = DropEffect$1.Forbid;
                        this.slot.classList.remove(`${eqCssPrefix$1}-drophover`);
                        this.hideLandingSlot();
                    },
                    onDrop: (_, ev) => {
                        this.dataTable.columns.move(ev.data.column, this.landingIndex);
                        this.refresh();
                        this.fireEvent({
                            type: 'columnMoved',
                            columnId: ev.data.column.id,
                            newIndex: this.landingIndex
                        });
                    }
                });
            }
            this.refresh();
            this.fireEvent('init');
        }
        /** Fires a grid event. You can pass either an event type
         * (like 'init', 'rowClick', 'pageChanged', etc )
         * or a ready-to-use grid event object
         * */
        fireEvent(event) {
            if (typeof event === "string") {
                this.eventEmitter.fire(event);
            }
            else {
                this.eventEmitter.fire(event.type, event);
            }
        }
        /** Allows to set the data (represented by a EasyDataTable object)
         *  or to replace the existing one associated with the grid */
        setData(data) {
            this.dataTable = data;
            this.clear();
            this.refresh();
        }
        /** Returns the EasyDataTable object associated with the grid via `setData()` call */
        getData() {
            return this.dataTable;
        }
        /** Gets the list of grid columns */
        getColumns() {
            return this.columns;
        }
        /** This function is called when the grid is destroyed */
        destroy() {
            this.slot.innerHTML = "";
        }
        /** Clears the current DOM object and re-renders everything from the scratch */
        refresh() {
            this.clearDOM();
            this.render();
        }
        clearDOM() {
            this.slot.innerHTML = '';
        }
        /** Clears all DOM object in the grid and return it to its initial state */
        clear() {
            this.pagination.page = 1;
            this.clearDOM();
        }
        /** Renders the grid */
        render() {
            if (!this.hasData() && !this.options.showPlusButton)
                return;
            this.containerInitialHeight = this.slot.clientHeight;
            this.rootDiv = document.createElement('div');
            this.rootDiv.style.width = '100%';
            this.rootDiv.classList.add(`${this.cssPrefix}-root`);
            this.columns.sync(this.dataTable.columns, this.options.useRowNumeration);
            this.renderHeader();
            this.rootDiv.appendChild(this.headerDiv);
            this.renderBody();
            this.rootDiv.appendChild(this.bodyDiv);
            this.renderFooter();
            this.rootDiv.appendChild(this.footerDiv);
            let gridContainer = document.createElement('div');
            gridContainer.classList.add(`${this.cssPrefix}-container`);
            gridContainer.appendChild(this.rootDiv);
            this.slot.appendChild(gridContainer);
            const needAutoResize = this.options.columnWidths.autoResize !== AutoResizeColumns$1.Never;
            if (this.rowsOnPagePromise) {
                this.rowsOnPagePromise
                    .then(() => this.updateHeight())
                    .then(() => {
                    this.firstRender = false;
                    this.rowsOnPagePromise = null;
                });
            }
            else {
                setTimeout(() => {
                    this.updateHeight()
                        .then(() => {
                        this.firstRender = false;
                        if (needAutoResize) {
                            this.resizeColumns();
                        }
                    });
                }, 100);
            }
        }
        updateHeight() {
            return new Promise((resolve) => {
                if (this.options.viewportRowsCount) {
                    const firstRow = this.bodyCellContainerDiv.firstElementChild;
                    const rowHeight = firstRow ? firstRow.offsetHeight : DEFAULT_ROW_HEIGHT$1;
                    const rowCount = this.options.viewportRowsCount; // || DEFAULT_ROW_COUNT;
                    let viewportHeight = rowHeight * rowCount;
                    domel$1(this.bodyViewportDiv)
                        .setStyle('height', `${viewportHeight}px`);
                    setTimeout(() => {
                        const sbHeight = this.bodyViewportDiv.offsetHeight - this.bodyViewportDiv.clientHeight;
                        viewportHeight = viewportHeight + sbHeight;
                        domel$1(this.bodyViewportDiv)
                            .setStyle('height', `${viewportHeight}px`);
                        resolve();
                    }, 100);
                    return;
                }
                else if (this.containerInitialHeight > 0) ;
                resolve();
            })
                .then(() => {
                if (this.options.fixHeightOnFirstRender && this.firstRender) {
                    this.slot.style.height = `${this.slot.offsetHeight}px`;
                }
            });
        }
        getContainerWidth() {
            return this.columns.getItems()
                .filter(col => col.isVisible)
                .map(col => col.width)
                .reduce((sum, current) => { return sum + current; });
        }
        renderHeader() {
            this.headerDiv = domel$1('div')
                .addClass(`${this.cssPrefix}-header`)
                .toDOM();
            this.headerViewportDiv = domel$1('div', this.headerDiv)
                .addClass(`${this.cssPrefix}-header-viewport`)
                .toDOM();
            this.headerCellContainerDiv = domel$1('div', this.headerViewportDiv)
                .addClass(`${this.cssPrefix}-header-cell-container`)
                .toDOM();
            this.headerRowDiv = domel$1('div', this.headerCellContainerDiv)
                .addClass(`${this.cssPrefix}-header-row`)
                .toDOM();
            this.columns.getItems().forEach((column, index) => {
                if (!column.isVisible) {
                    return;
                }
                let hd = this.renderColumnHeader(column, index);
                this.headerRowDiv.appendChild(hd);
                if (column.isRowNum) {
                    domel$1(hd)
                        .addChildElement(this.renderHeaderButtons());
                }
            });
            const containerWidth = this.getContainerWidth();
            domel$1(this.headerCellContainerDiv)
                .setStyle('width', `${containerWidth}px`);
        }
        hasData() {
            return this.dataTable.columns.count > 0;
        }
        renderColumnHeader(column, index) {
            let colBuilder = domel$1('div')
                .addClass(`${this.cssPrefix}-header-cell`)
                .data('col-idx', `${index}`)
                .setStyle('width', `${column.width}px`);
            if (column.dataColumn) {
                colBuilder
                    .data('col-id', `${column.dataColumn.id}`);
            }
            let colDiv = colBuilder.toDOM();
            domel$1('div', colDiv)
                .addClass(`${this.cssPrefix}-header-cell-resize`);
            if (!column.isRowNum) {
                domel$1('div', colDiv)
                    .addClass(`${this.cssPrefix}-header-cell-label`)
                    .text(column.label);
            }
            if (column.description) {
                domel$1('div', colDiv)
                    .addClass('question-mark')
                    .title(column.description);
            }
            if (this.options.allowDragDrop) {
                eqDragManager$1.registerDraggableItem({
                    element: colDiv,
                    scope: "gridColumnMove",
                    data: { column: column },
                    renderer: (dragImage) => {
                        dragImage.innerHTML = '';
                        const attrLabel = document.createElement('div');
                        attrLabel.innerText = column.label;
                        dragImage.classList.add(`${this.cssPrefix}-sortable-helper`);
                        dragImage.appendChild(attrLabel);
                    },
                    onDragStart: (ev) => {
                        ev.dropEffect = DropEffect$1.Allow;
                    }
                });
            }
            return colDiv;
        }
        renderBody() {
            this.bodyDiv = domel$1('div')
                .addClass(`${this.cssPrefix}-body`)
                .toDOM();
            this.bodyViewportDiv = domel$1('div', this.bodyDiv)
                .addClass(`${this.cssPrefix}-body-viewport`)
                .attr('tabIndex', '0')
                .toDOM();
            this.bodyCellContainerDiv = domel$1('div', this.bodyViewportDiv)
                .addClass(`${this.cssPrefix}-cell-container`)
                .toDOM();
            const showAggrs = this.canShowAggregates();
            if (this.dataTable) {
                this.showProgress();
                this.rowsOnPagePromise = this.getRowsToRender()
                    .then((rows) => {
                    this.pagination.total = this.dataTable.getTotal();
                    this.hideProgress();
                    //prevent double rendering (bad solution, we have to figure out how to avoid this behavior properly)
                    this.bodyCellContainerDiv.innerHTML = '';
                    this.prevRowTotals = null;
                    let rowsToRender = 0;
                    if (rows.length) {
                        const groups = showAggrs
                            ? this.options.aggregates.settings.getGroups()
                            : [];
                        rowsToRender = (rows.length < this.pagination.pageSize)
                            ? rows.length
                            : this.pagination.pageSize;
                        rows.forEach((row, index) => {
                            if (showAggrs)
                                this.updateTotalsState(groups, row);
                            //we don't actually render the last row
                            if (index < rowsToRender) {
                                const tr = this.renderRow(row, index);
                                this.bodyCellContainerDiv.appendChild(tr);
                            }
                        });
                        const showGrandTotalsOnEachPage = this.options.aggregates && this.options.aggregates.showGrandTotalsOnEachPage;
                        if (showAggrs && (this.isLastPage() || showGrandTotalsOnEachPage)) {
                            const row = new DataRow$2(this.dataTable.columns, new Array(this.dataTable.columns.count));
                            this.updateTotalsState(groups, row, true);
                        }
                    }
                    const needAutoResize = this.options.columnWidths.autoResize !== AutoResizeColumns$1.Never;
                    if (needAutoResize) {
                        this.resizeColumns();
                    }
                    else {
                        const containerWidth = this.getContainerWidth();
                        domel$1(this.bodyCellContainerDiv)
                            .setStyle('width', `${containerWidth}px`);
                    }
                    return rowsToRender;
                })
                    .catch(error => { console.error(error); return 0; });
            }
            this.bodyViewportDiv.addEventListener('scroll', ev => {
                domel$1(this.headerViewportDiv)
                    .setStyle('margin-left', `-${this.bodyViewportDiv.scrollLeft}px`);
            });
            this.bodyViewportDiv.addEventListener('keydown', this.onViewportKeydown.bind(this));
        }
        isLastPage() {
            if (this.dataTable.elasticChunks) {
                return this.dataTable.totalIsKnown()
                    && (this.pagination.page * this.pagination.pageSize) >= this.pagination.total;
            }
            return this.pagination.page * this.pagination.pageSize >= this.pagination.total;
        }
        canShowAggregates() {
            if (!this.options || !this.options.aggregates || !this.options.aggregates.settings)
                return false;
            const aggrSettings = this.options.aggregates.settings;
            const result = (aggrSettings.hasAggregates() || aggrSettings.hasRecordCount())
                && (aggrSettings.hasGroups() || aggrSettings.hasGrandTotals());
            return result;
        }
        updateTotalsState(groups, newRow, isLast = false) {
            const aggrSettings = this.options.aggregates.settings;
            if (this.prevRowTotals && aggrSettings.hasGroups()) {
                let changeLevel = -1;
                for (let level = 1; level <= groups.length; level++) {
                    const group = groups[level - 1];
                    for (const col of group.columns) {
                        if (!aggrSettings.compareValues(this.prevRowTotals.getValue(col), newRow.getValue(col))) {
                            changeLevel = level;
                            break;
                        }
                    }
                    if (changeLevel !== -1)
                        break;
                }
                if (changeLevel !== -1) {
                    for (let level = groups.length; level >= changeLevel; level--) {
                        const row = new DataRow$2(this.dataTable.columns, this.prevRowTotals.toArray());
                        const tr = this.renderTotalsRow(level, row);
                        this.bodyCellContainerDiv.appendChild(tr);
                    }
                }
            }
            if (isLast && aggrSettings.hasGrandTotals() && aggrSettings.hasAggregates()) {
                const tr = this.renderTotalsRow(0, newRow);
                this.bodyCellContainerDiv.appendChild(tr);
            }
            this.prevRowTotals = newRow;
        }
        applyGroupColumnTemplate(template, value, count) {
            let result = template.replace(/{{\s*GroupValue\s*}}/g, value ? `${value}` : '-');
            result = result.replace(/{{\s*GroupCount\s*}}/g, count ? `${count}` : '-');
            return result;
        }
        renderTotalsRow(level, row) {
            const aggrSettings = this.options.aggregates.settings;
            const group = (level > 0)
                ? aggrSettings.getGroups()[level - 1]
                : { columns: [], aggregates: aggrSettings.getAggregates() };
            const rowBuilder = domel$1('div')
                .addClass(`${this.cssPrefix}-row`)
                .addClass(`${this.cssPrefix}-row-totals`)
                .addClass(`${this.cssPrefix}-totals-lv${level}`)
                .data('totals-level', `${level}`)
                .attr('tabindex', '-1');
            const rowElement = rowBuilder.toDOM();
            this.columns.getItems().forEach((column, index) => {
                if (!column.isVisible) {
                    return;
                }
                let val = '';
                const colIndex = !column.isRowNum
                    ? this.dataTable.columns.getIndex(column.dataColumn.id)
                    : -1;
                if (!column.isRowNum && column.dataColumn) {
                    if (group.columns.indexOf(column.dataColumn.id) >= 0) {
                        val = row.getValue(colIndex);
                    }
                }
                if (colIndex == this.dataTable.columns.count - 1) {
                    val = '.  .  .  .  .  .';
                }
                rowElement.appendChild(this.renderCell(column, index, val, rowElement));
            });
            const aggrContainer = this.options.aggregates.calculator.getAggrContainer();
            const aggrCols = aggrSettings.getAggregates().map(c => c.colId);
            const key = aggrSettings.buildGroupKey(group, row);
            aggrContainer.getAggregateData(level, key)
                .then((values) => {
                for (const aggrColId of aggrCols) {
                    row.setValue(aggrColId, values[aggrColId]);
                }
                rowElement.innerHTML = '';
                this.columns.getItems().forEach((column, index) => {
                    if (!column.isVisible) {
                        return;
                    }
                    let val = '';
                    const colIndex = !column.isRowNum
                        ? this.dataTable.columns.getIndex(column.dataColumn.id)
                        : -1;
                    if (!column.isRowNum) {
                        let isLastGroupColumn = false;
                        if (column.dataColumn) {
                            const groupColIndex = group.columns.indexOf(column.dataColumn.id);
                            const aggrColIndex = aggrCols.indexOf(column.dataColumn.id);
                            if (level > 0) {
                                isLastGroupColumn = groupColIndex == group.columns.length - 1;
                            }
                            else {
                                //if it's a grand total row consider first column as the last group column
                                isLastGroupColumn = colIndex == 0;
                            }
                            if (groupColIndex >= 0 || aggrColIndex >= 0) {
                                val = row.getValue(colIndex);
                            }
                        }
                        let groupFooterTemplate = '';
                        if (level > 0) {
                            groupFooterTemplate = column.dataColumn.groupFooterColumnTemplate;
                            //set the default template for the last grouping column
                            if (!groupFooterTemplate && aggrSettings.hasRecordCount() && isLastGroupColumn) {
                                groupFooterTemplate = '{{GroupValue}} ({{GroupCount}})';
                            }
                        }
                        if (groupFooterTemplate) {
                            const cellDiv = this.renderCell(column, index, val, rowElement);
                            const innerCell = cellDiv.firstChild;
                            val = innerCell.innerHTML;
                            val = this.applyGroupColumnTemplate(groupFooterTemplate, val, values[aggrSettings.COUNT_FIELD_NAME]);
                        }
                    }
                    const cellDiv = this.renderCell(column, index, val, rowElement);
                    rowElement.appendChild(cellDiv);
                });
            })
                .catch((error) => console.error(error));
            return rowElement;
        }
        onViewportKeydown(ev) {
            if (this.options.showActiveRow) {
                const rowCount = this.bodyCellContainerDiv.querySelectorAll(`.${this.cssPrefix}-row`).length;
                let newValue;
                switch (ev.key) {
                    case 'ArrowLeft':
                        break;
                    case 'ArrowRight':
                        break;
                    case 'ArrowUp':
                        ev.preventDefault();
                        newValue = this.activeRowIndex < 0 || this.activeRowIndex >= rowCount ? rowCount - 1 : this.activeRowIndex - 1;
                        this.activeRowIndex = newValue >= 0 ? newValue : 0;
                        break;
                    case 'ArrowDown':
                        ev.preventDefault();
                        newValue = this.activeRowIndex < 0 || this.activeRowIndex >= rowCount ? 0 : this.activeRowIndex + 1;
                        this.activeRowIndex = newValue < rowCount ? newValue : rowCount - 1;
                        break;
                }
            }
        }
        ensureRowVisibility(rowOrIndex) {
            const row = typeof rowOrIndex === 'number'
                ? this.getDataRow(rowOrIndex)
                : rowOrIndex;
            if (row) {
                let rowRect = row.getBoundingClientRect();
                const viewportRect = this.bodyViewportDiv.getBoundingClientRect();
                const rowTop = rowRect.top - viewportRect.top;
                const rowBottom = rowRect.bottom - viewportRect.top;
                const viewportHeight = this.bodyViewportDiv.clientHeight;
                const windowHeight = window.innerHeight || document.documentElement.clientHeight;
                if (rowTop > 0 &&
                    rowBottom <= viewportHeight &&
                    rowRect.top > 0 &&
                    rowRect.bottom < windowHeight) {
                    return;
                }
                if (rowTop < 0) {
                    this.bodyViewportDiv.scrollTop = this.bodyViewportDiv.scrollTop + rowTop;
                }
                else if (rowBottom > viewportHeight) {
                    this.bodyViewportDiv.scrollTop = this.bodyViewportDiv.scrollTop + rowBottom - viewportHeight;
                }
                rowRect = row.getBoundingClientRect();
                if (rowRect.top < 0) {
                    document.documentElement.scrollTop = document.documentElement.scrollTop + rowRect.top;
                }
                else if (rowRect.bottom > windowHeight) {
                    document.documentElement.scrollTop = document.documentElement.scrollTop + rowRect.bottom - windowHeight;
                }
            }
        }
        /** Returns a promise with the list of the rows to render on one page.
         * The list contains pageSize+1 row to make it possible
         * to render the totals row (if it appears to be on the edge between pages)
         */
        getRowsToRender() {
            if (this.options.paging.enabled === false) {
                return Promise.resolve(this.dataTable.getCachedRows());
            }
            return this.dataTable.getRows({
                offset: (this.pagination.page - 1) * this.pagination.pageSize,
                limit: this.pagination.pageSize + 1
            })
                .catch(error => {
                console.error(error);
                return [];
            });
        }
        renderFooter() {
            this.footerDiv = domel$1('div')
                .addClass(`${this.cssPrefix}-footer`)
                .toDOM();
            if (this.rowsOnPagePromise) {
                this.rowsOnPagePromise.then(count => {
                    this.footerDiv.innerHTML = '';
                    this.footerPaginateDiv = this.renderPageNavigator();
                    this.footerDiv.appendChild(this.footerPaginateDiv);
                    const pageInfoBlock = this.renderPageInfoBlock(count);
                    this.footerDiv.appendChild(pageInfoBlock);
                });
            }
        }
        renderPageInfoBlock(count) {
            const pageInfoDiv = domel$1('div')
                .addClass(`${this.cssPrefix}-page-info`)
                .toDOM();
            const rowCount = this.dataTable.getTotal();
            if (rowCount > 0) {
                const fistPageRecordNum = count
                    ? (this.pagination.page - 1) * this.pagination.pageSize + 1
                    : 0;
                const lastPageRecordNum = count
                    ? fistPageRecordNum + count - 1
                    : 0;
                let totalStr = this.dataTable.getTotal().toString();
                if (this.dataTable.elasticChunks) {
                    const count = this.dataTable.getCachedCount();
                    const total = this.dataTable.getTotal();
                    if (count !== total)
                        totalStr = '?';
                }
                pageInfoDiv.innerHTML = i18n$2.getText('GridPageInfo')
                    .replace('{FirstPageRecordNum}', `<span>${fistPageRecordNum.toString()}</span>`)
                    .replace('{LastPageRecordNum}', `<span>${lastPageRecordNum.toString()}</span>`)
                    .replace('{Total}', `<span>${totalStr}</span>`);
            }
            return pageInfoDiv;
        }
        showProgress() {
        }
        hideProgress() {
        }
        getLocalIndexByGlobal(index) {
            if (this.pagination) {
                return index % this.pagination.pageSize;
            }
            else {
                return index;
            }
        }
        getGlobalIndexByLocal(index) {
            if (this.pagination) {
                return (this.pagination.page - 1) * this.pagination.pageSize + index;
            }
            else {
                return index;
            }
        }
        renderRow(row, index) {
            let indexGlobal = this.getGlobalIndexByLocal(index);
            let rowBuilder = domel$1('div')
                .addClass(`${this.cssPrefix}-row`)
                .addClass(`${this.cssPrefix}-row-${index % 2 == 1 ? 'odd' : 'even'}`)
                .data('row-idx', `${indexGlobal}`)
                .attr('tabindex', '-1')
                .on('click', (ev) => {
                this.activeRowIndex = index;
                this.fireEvent({
                    type: 'rowClick',
                    row: row,
                    rowIndex: index,
                    sourceEvent: ev
                });
            })
                .on('dblclick', (ev) => {
                this.fireEvent({
                    type: 'rowDbClick',
                    row: row,
                    rowIndex: index,
                    sourceEvent: ev
                });
            });
            if (index == 0) {
                rowBuilder.addClass(`${this.cssPrefix}-row-first`);
            }
            let rowElement = rowBuilder.toDOM();
            if (this.options.showActiveRow && index == this.activeRowIndex) {
                rowBuilder.addClass(`${this.cssPrefix}-row-active`);
            }
            this.columns.getItems().forEach((column, index) => {
                if (!column.isVisible) {
                    return;
                }
                const colindex = column.isRowNum ? -1 : this.dataTable.columns.getIndex(column.dataColumn.id);
                let val = column.isRowNum ? indexGlobal + 1 : row.getValue(colindex);
                rowElement.appendChild(this.renderCell(column, index, val, rowElement));
            });
            return rowElement;
        }
        renderCell(column, colIndex, value, rowElement) {
            const builder = domel$1('div')
                .addClass(`${this.cssPrefix}-cell`)
                .data('col-idx', `${colIndex}`)
                .attr('tabindex', '-1')
                .setStyle('width', `${column.width}px`);
            if (column.align == GridColumnAlign$1.LEFT) {
                builder.addClass(`${this.cssPrefix}-cell-align-left`);
            }
            else if (column.align == GridColumnAlign$1.RIGHT) {
                builder.addClass(`${this.cssPrefix}-cell-align-right`);
            }
            else if (column.align == GridColumnAlign$1.CENTER) {
                builder.addClass(`${this.cssPrefix}-cell-align-center`);
            }
            const cellElement = builder.toDOM();
            const valueCell = cellElement.appendChild(domel$1('div')
                .addClass(`${this.cssPrefix}-cell-value`)
                .toDOM());
            const cellRenderer = this.getCellRenderer(column);
            if (cellRenderer) {
                cellRenderer(value, column, valueCell, rowElement);
            }
            return cellElement;
        }
        getCellRenderer(column) {
            let cellRenderer;
            if (column.isRowNum) {
                cellRenderer = this.cellRendererStore.getDefaultRendererByType(CellRendererType$1.NUMBER);
            }
            else {
                cellRenderer = this.cellRendererStore.getDefaultRenderer(column.type);
            }
            if (this.options && this.options.onGetCellRenderer) {
                cellRenderer = this.options.onGetCellRenderer(column, cellRenderer) || cellRenderer;
            }
            return cellRenderer;
        }
        /** Sets current grid pages (if paging is used) */
        setPage(page) {
            this.pagination.page = page;
            this.fireEvent({ type: "pageChanged", page: page });
            this.refresh();
            this.bodyViewportDiv.focus();
        }
        renderPageNavigator() {
            let paginateDiv = document.createElement('div');
            paginateDiv.className = `${this.cssPrefix}-pagination-wrapper`;
            const rowCount = this.dataTable.getTotal();
            if (this.options.paging && this.options.paging.enabled && rowCount > 0) {
                const prefix = this.paginationOptions.useBootstrap ? '' : `${this.cssPrefix}-`;
                const buttonClickHandler = (ev) => {
                    const element = ev.target;
                    if (element.hasAttribute('data-page')) {
                        const page = parseInt(element.getAttribute('data-page'));
                        this.setPage(page);
                    }
                };
                const renderPageCell = (pageIndex, content, disabled, extreme, active) => {
                    const li = document.createElement('li');
                    li.className = `${prefix}page-item`;
                    if (!extreme) {
                        if (active) {
                            li.className += ' active';
                        }
                        const a = document.createElement('a');
                        a.setAttribute('href', 'javascript:void(0)');
                        a.innerHTML = content || pageIndex.toString();
                        a.setAttribute("data-page", `${pageIndex}`);
                        a.className = `${prefix}page-link`;
                        a.addEventListener("click", buttonClickHandler);
                        li.appendChild(a);
                        return li;
                    }
                    let a = document.createElement('span');
                    a.setAttribute('aria-hidden', 'true');
                    a.className = `${prefix}page-link`;
                    if (disabled) {
                        li.className += ' disabled';
                    }
                    else {
                        if (this.paginationOptions.useBootstrap) {
                            a = document.createElement('a');
                            a.setAttribute('href', 'javascript:void(0)');
                            a.setAttribute("data-page", `${pageIndex}`);
                        }
                        else {
                            let newA = document.createElement('a');
                            newA.setAttribute('href', 'javascript:void(0)');
                            newA.setAttribute('data-page', `${pageIndex}`);
                            a = newA;
                        }
                        a.className = `${prefix}page-link`;
                        a.addEventListener("click", buttonClickHandler);
                    }
                    a.innerHTML = content;
                    li.appendChild(a);
                    return li;
                };
                if (this.dataTable.elasticChunks) {
                    const pageIndex = this.pagination.page || 1;
                    let ul = document.createElement('ul');
                    ul.className = `${prefix}pagination`;
                    let cell = renderPageCell(pageIndex - 1, '&laquo;', pageIndex == 1, true, false);
                    ul.appendChild(cell);
                    cell = renderPageCell(pageIndex + 1, '&raquo;', this.isLastPage(), true, false);
                    ul.appendChild(cell);
                    paginateDiv.appendChild(ul);
                }
                else {
                    if (this.pagination.total > this.pagination.pageSize) {
                        const pageIndex = this.pagination.page || 1;
                        const pageCount = Math.ceil(this.pagination.total / this.pagination.pageSize) || 1;
                        const maxButtonCount = this.paginationOptions.maxButtonCount || 10;
                        const zeroBasedIndex = pageIndex - 1;
                        let firstPageIndex = zeroBasedIndex - (zeroBasedIndex % maxButtonCount) + 1;
                        let lastPageIndex = firstPageIndex + maxButtonCount - 1;
                        if (lastPageIndex > pageCount) {
                            lastPageIndex = pageCount;
                        }
                        let ul = document.createElement('ul');
                        ul.className = `${prefix}pagination`;
                        let cell = renderPageCell(firstPageIndex - 1, '&laquo;', firstPageIndex == 1, true, false);
                        ul.appendChild(cell);
                        for (let i = firstPageIndex; i <= lastPageIndex; i++) {
                            cell = renderPageCell(i, i.toString(), false, false, i == pageIndex);
                            ul.appendChild(cell);
                        }
                        cell = renderPageCell(lastPageIndex + 1, '&raquo;', lastPageIndex == pageCount, true, false);
                        ul.appendChild(cell);
                        paginateDiv.appendChild(ul);
                    }
                }
                if (this.options.paging.allowPageSizeChange) {
                    const selectChangeHandler = (ev) => {
                        const newValue = parseInt(ev.target.value);
                        this.pagination.pageSize = newValue;
                        this.pagination.page = 1;
                        this.refresh();
                    };
                    const pageSizes = document.createElement('div');
                    pageSizes.className = `${this.cssPrefix}-page-sizes`;
                    const selectSize = document.createElement('div');
                    selectSize.className = `kfrm-select ${this.cssPrefix}-page-sizes-select`;
                    pageSizes.appendChild(selectSize);
                    const sel = document.createElement('select');
                    const selOptions = this.options.paging.pageSizeItems || [];
                    const selSet = new Set(selOptions);
                    selSet.add(this.options.paging.pageSize || 20);
                    Array.from(selSet).forEach(el => {
                        const option = document.createElement("option");
                        option.value = el.toString();
                        option.text = el.toString();
                        sel.appendChild(option);
                    });
                    sel.value = (this.pagination.pageSize || 20).toString();
                    selectSize.appendChild(sel);
                    sel.addEventListener('change', selectChangeHandler);
                    const labelDiv = document.createElement('div');
                    labelDiv.className = `${this.cssPrefix}-page-sizes-label`;
                    pageSizes.appendChild(labelDiv);
                    const label = document.createElement('span');
                    label.innerText = i18n$2.getText('GridItemsPerPage');
                    labelDiv.appendChild(label);
                    paginateDiv.appendChild(pageSizes);
                }
            }
            return paginateDiv;
        }
        addEventListener(eventType, handler) {
            return this.eventEmitter.subscribe(eventType, event => handler(event.data));
        }
        removeEventListener(eventType, handlerId) {
            this.eventEmitter.unsubscribe(eventType, handlerId);
        }
        renderHeaderButtons() {
            if (this.options.showPlusButton) {
                return domel$1('div')
                    .addClass(`${this.cssPrefix}-header-btn-plus`)
                    .title(this.options.plusButtonTitle || 'Add')
                    .addChild('a', builder => builder
                    .attr('href', 'javascript:void(0)')
                    .on('click', (e) => {
                    e.preventDefault();
                    this.fireEvent({
                        type: 'plusButtonClick',
                        sourceEvent: e
                    });
                }))
                    .toDOM();
            }
            return domel$1('span')
                .addText('#')
                .toDOM();
        }
        showLandingSlot(pageX, pageY) {
            const colElems = this.headerRowDiv.querySelectorAll(`[class*=${this.cssPrefix}-table-col]`);
            const cols = [];
            for (let i = 1; i < colElems.length; i++) {
                const rowElem = colElems[i];
                if (rowElem.style.display === 'none')
                    continue;
                cols.push(rowElem);
            }
            if (cols.length === 0) {
                this.landingIndex = 0;
                this.headerRowDiv.appendChild(this.landingSlot);
                return;
            }
            const landingPos = getElementAbsolutePos$1(this.landingSlot);
            if (pageX >= landingPos.x && pageX <= landingPos.x + this.landingSlot.offsetWidth) {
                return;
            }
            let newLandingIndex = this.landingIndex;
            for (let col of cols) {
                const colPos = getElementAbsolutePos$1(col);
                const width = col.offsetWidth;
                if (pageX > colPos.x && pageX < colPos.x + width) {
                    // -1 as we don't need to count add button here
                    newLandingIndex = parseInt(col.getAttribute('data-col-idx')) - 1;
                }
            }
            if (newLandingIndex != this.landingIndex) {
                this.landingIndex = newLandingIndex;
                if (this.landingIndex < cols.length) {
                    this.headerRowDiv.insertBefore(this.landingSlot, cols[this.landingIndex]);
                }
                else {
                    this.headerRowDiv.appendChild(this.landingSlot);
                }
            }
        }
        hideLandingSlot() {
            this.landingIndex = -1;
            setTimeout(() => {
                if (this.landingSlot.parentElement) {
                    this.landingSlot.parentElement.removeChild(this.landingSlot);
                }
            }, 10);
        }
        get activeRowIndex() {
            return this._activeRowIndex;
        }
        set activeRowIndex(value) {
            if (value !== this._activeRowIndex) {
                const oldValue = this._activeRowIndex;
                this._activeRowIndex = value;
                this.updateActiveRow();
                this.fireEvent({
                    type: 'activeRowChanged',
                    oldValue,
                    newValue: this.activeRowIndex,
                    rowIndex: this.getGlobalIndexByLocal(this.activeRowIndex)
                });
            }
        }
        updateActiveRow() {
            if (this.options.showActiveRow) {
                const rows = this.bodyCellContainerDiv.querySelectorAll(`[class*=${this.cssPrefix}-row-active]`);
                rows.forEach(el => { el.classList.remove(`${this.cssPrefix}-row-active`); });
                const activeRow = this.getActiveRow();
                if (activeRow) {
                    activeRow.classList.add(`${this.cssPrefix}-row-active`);
                    this.ensureRowVisibility(this.activeRowIndex);
                }
            }
        }
        getActiveRow() {
            return this.getDataRow(this.activeRowIndex);
        }
        getDataRow(index) {
            const rows = Array.from(this.bodyCellContainerDiv.querySelectorAll(`.${this.cssPrefix}-row:not(.${this.cssPrefix}-row-totals)`));
            if (index >= 0 && index < rows.length)
                return rows[index];
            return null;
        }
        /** Makes the grid focused for keyboard events */
        focus() {
            this.bodyViewportDiv.focus();
        }
        /** Resizes columns according to the data they represent */
        resizeColumns() {
            if (this.options.columnWidths.autoResize === AutoResizeColumns$1.Never)
                return;
            const containerWidth = this.bodyCellContainerDiv.style.width;
            this.bodyCellContainerDiv.style.visibility = 'hidden';
            this.bodyCellContainerDiv.style.width = '1px';
            //this.headerRowDiv.style.visibility = 'hidden';
            this.headerRowDiv.style.width = '1px';
            let sumWidth = 0;
            const columns = this.columns.getItems();
            const headerCells = this.headerCellContainerDiv.querySelectorAll(`.${this.cssPrefix}-header-cell`);
            let headerIdx = 0;
            for (let idx = 0; idx < this.columns.count; idx++) {
                const column = columns[idx];
                if (!column.isVisible)
                    continue;
                const calculatedWidth = this.options.columnWidths.autoResize !== AutoResizeColumns$1.Always && column.dataColumn
                    ? column.dataColumn.calculatedWidth
                    : 0;
                const cellValues = this.bodyCellContainerDiv.querySelectorAll(`.${this.cssPrefix}-cell[data-col-idx="${idx}"] > .${this.cssPrefix}-cell-value`);
                let maxWidth = 0;
                if (calculatedWidth > 0) {
                    sumWidth += calculatedWidth;
                    column.width = calculatedWidth;
                    cellValues.forEach(value => {
                        value.parentElement.style.width = `${calculatedWidth}px`;
                    });
                    headerCells[headerIdx].style.width = `${calculatedWidth}px`;
                }
                else {
                    if (cellValues.length == 0) {
                        headerCells[headerIdx].style.width = null;
                        headerCells[headerIdx].style.whiteSpace = 'nowrap';
                    }
                    maxWidth = headerCells[headerIdx].offsetWidth;
                    if (cellValues.length > 0) {
                        cellValues.forEach(value => {
                            value.parentElement.style.width = null;
                            const width = value.parentElement.offsetWidth;
                            if (width > maxWidth) {
                                maxWidth = width;
                            }
                        });
                        maxWidth += 3;
                        const maxOption = column.isRowNum
                            ? this.options.columnWidths.rowNumColumn.max || 500
                            : this.options.columnWidths[column.dataColumn.type].max || 2000;
                        const minOption = column.isRowNum
                            ? this.options.columnWidths.rowNumColumn.min || 0
                            : this.options.columnWidths[column.dataColumn.type].min || 20;
                        if (maxWidth > maxOption) {
                            maxWidth = maxOption;
                        }
                        if (maxWidth < minOption) {
                            maxWidth = minOption;
                        }
                        if (utils$2.isNumericType(column.type)) {
                            //increase the calculated width in 1.3 times for numeric columns
                            maxWidth = Math.round(maxWidth * 1.3);
                        }
                        sumWidth += maxWidth;
                        column.width = maxWidth;
                        cellValues.forEach(value => {
                            value.parentElement.style.width = `${maxWidth}px`;
                        });
                        headerCells[headerIdx].style.width = `${maxWidth}px`;
                        if (column.dataColumn) {
                            column.dataColumn.calculatedWidth = maxWidth;
                        }
                    }
                    else {
                        sumWidth += maxWidth;
                    }
                }
                headerIdx++;
            }
            if (sumWidth > 0) {
                this.bodyCellContainerDiv.style.width = `${sumWidth}px`;
                this.headerCellContainerDiv.style.width = `${sumWidth}px`;
            }
            else {
                this.bodyCellContainerDiv.style.width = containerWidth;
                this.headerCellContainerDiv.style.width = containerWidth;
            }
            this.bodyCellContainerDiv.style.visibility = null;
            this.headerRowDiv.removeAttribute('style');
        }
    };

    let Calendar$1 = class Calendar {
        get cssPrefix() {
            return 'kdtp-cal';
        }
        constructor(slot, options) {
            this.slot = slot;
            this.options = options || {};
            if (!this.options.yearRange) {
                this.options.yearRange = 'c-10:c+10';
            }
        }
        setDate(date) {
            this.currentDate = new Date(date);
        }
        getDate() {
            return new Date(this.currentDate);
        }
        dateChanged(apply) {
            if (this.options.onDateChanged) {
                this.options.onDateChanged(this.currentDate, apply);
            }
        }
    };

    let DateTimePicker$1 = class DateTimePicker {
        get cssPrefix() {
            return 'kdtp';
        }
        constructor(options) {
            this.calendar = null;
            this.timePicker = null;
            this.options = options;
            this.render();
        }
        setDateTime(dateTime) {
            this.currentDateTime = new Date(dateTime);
            if (this.calendar) {
                this.calendar.setDate(this.currentDateTime);
            }
            if (this.timePicker) {
                this.timePicker.setTime(this.currentDateTime);
            }
        }
        getDateTime() {
            return new Date(this.currentDateTime);
        }
        render() {
            if (this.options.showCalendar) {
                this.calendar = this.createCalendar({
                    yearRange: this.options.yearRange,
                    showDateTimeInput: this.options.showDateTimeInput,
                    timePickerIsUsed: this.options.showTimePicker,
                    oneClickDateSelection: this.options.oneClickDateSelection,
                    onDateChanged: (date, apply) => {
                        this.currentDateTime = date;
                        if (this.timePicker) {
                            this.timePicker.setTime(this.currentDateTime);
                        }
                        if (this.options.showTimePicker) {
                            this.dateTimeChanged();
                        }
                        if (apply) {
                            this.apply(this.currentDateTime);
                        }
                    }
                });
                if (this.calendar)
                    this.calendar.render();
            }
            if (this.options.showTimePicker) {
                this.timePicker = this.createTimePicker({
                    onTimeChanged: (time) => {
                        this.currentDateTime.setHours(time.getHours());
                        this.currentDateTime.setMinutes(time.getMinutes());
                        if (this.calendar) {
                            this.calendar.setDate(this.currentDateTime);
                        }
                        this.dateTimeChanged();
                    }
                });
                if (this.timePicker)
                    this.timePicker.render();
            }
            this.setDateTime(new Date());
        }
        createCalendar(options) {
            return null;
        }
        createTimePicker(options) {
            return null;
        }
        show(anchor) {
            if (this.options.beforeShow) {
                this.options.beforeShow();
            }
            const pos = getElementAbsolutePos$1(anchor || document.body);
            this.slot.style.top = pos.y + anchor.clientHeight + 'px';
            this.slot.style.left = pos.x + 'px';
        }
        apply(date) {
            if (this.options.onApply) {
                this.options.onApply(date);
            }
            this.destroy();
        }
        cancel() {
            if (this.options.onCancel) {
                this.options.onCancel();
            }
            this.destroy();
        }
        destroy() {
            if (this.slot && this.slot.parentElement) {
                this.slot.parentElement.removeChild(this.slot);
            }
        }
        dateTimeChanged() {
            if (this.options.onDateTimeChanged) {
                this.options.onDateTimeChanged(this.currentDateTime);
            }
        }
    };

    let DefaultCalendar$1 = class DefaultCalendar extends Calendar$1 {
        constructor(slot, options) {
            super(slot, options);
            this.daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            this.months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            this.calendarBody = null;
            this.isManualInputChanging = false;
            for (let i = 0; i < this.daysOfWeek.length; i++) {
                this.daysOfWeek[i] = i18n$2.getShortWeekDayName(i + 1);
            }
            for (let i = 0; i < this.months.length; i++) {
                this.months[i] = i18n$2.getLongMonthName(i + 1);
            }
        }
        setDate(date) {
            super.setDate(date);
            this.selectedMonth = this.currentDate.getMonth();
            this.selectedYear = this.currentDate.getFullYear();
            this.rerenderMonth();
        }
        render() {
            const header = domel$1('div', this.slot)
                .addClass(`${this.cssPrefix}-header`);
            if (this.options.showDateTimeInput) {
                header
                    .addChildElement(this.renderManualDateInput());
            }
            else {
                header
                    .addChild('span', builder => this.headerTextElem = builder.toDOM());
            }
            domel$1(this.slot)
                .addChildElement(this.renderCalendarButtons());
            this.calendarBody = domel$1('div', this.slot)
                .addClass(`${this.cssPrefix}-body`)
                .toDOM();
        }
        getInputDateFormat() {
            const settings = i18n$2.getLocaleSettings();
            return (this.options.timePickerIsUsed)
                ? `${settings.editDateFormat} ${settings.editTimeFormat}`
                : settings.editDateFormat;
        }
        renderManualDateInput() {
            const format = this.getInputDateFormat();
            const builder = domel$1('input')
                .attr('placeholder', format)
                .addClass(`${this.cssPrefix}-header-input`);
            builder
                .mask(format.replace('yyyy', '9999')
                .replace('MM', '99')
                .replace('dd', '99')
                .replace('HH', '99')
                .replace('mm', '99')
                .replace('ss', '99'))
                .on('input', ev => {
                builder.removeClass('error');
                try {
                    this.isManualInputChanging = true;
                    const newDate = utils$2.strToDateTime(this.manualInputElem.value, format);
                    this.currentDate = newDate;
                    this.jump(this.currentDate.getFullYear(), this.currentDate.getMonth());
                    this.dateChanged(false);
                }
                catch (e) {
                    builder.addClass('error');
                }
                finally {
                    this.isManualInputChanging = false;
                }
            })
                .on('keydown', (ev) => {
                if (ev.keyCode === 13) {
                    ev.preventDefault();
                    ev.stopPropagation();
                    if (this.manualInputElem.className.indexOf('error') < 0
                        && !this.isManualInputChanging)
                        this.dateChanged(true);
                }
            })
                .on('focus', () => {
                setTimeout(() => {
                    this.manualInputElem.selectionStart = 0;
                    this.manualInputElem.selectionEnd = 0;
                }, 50);
            });
            this.manualInputElem = builder.toDOM();
            return this.manualInputElem;
        }
        updateDisplayedDateValue() {
            if (this.manualInputElem) {
                if (!this.isManualInputChanging) {
                    const format = this.getInputDateFormat();
                    this.manualInputElem.value = i18n$2.dateTimeToStr(this.currentDate, format);
                    this.manualInputElem.focus();
                }
            }
            else if (this.headerTextElem) {
                const locale = i18n$2.getCurrentLocale();
                this.headerTextElem.innerText = this.currentDate.toLocaleString(locale == 'en' ? undefined : locale, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                });
            }
        }
        renderCalendarButtons() {
            const builder = domel$1('nav')
                .addClass(`${this.cssPrefix}-nav`)
                .addChild('div', builder => builder
                .addClass(`${this.cssPrefix}-nav-prev`)
                .on('click', () => {
                this.prev();
            })
                .addChild('span', builder => builder.html('&lsaquo;')))
                .addChild('div', builder => builder
                .addClass(`${this.cssPrefix}-nav-selectors`)
                .addChild('div', builder => builder
                .addClass(`${this.cssPrefix}-nav-month`)
                .addChild('select', builder => {
                builder
                    .on('change', () => {
                    this.jump(this.selectedYear, parseInt(this.selectMonthElem.value));
                });
                for (let i = 0; i < this.months.length; i++) {
                    builder.addChild('option', builder => builder
                        .attr('value', i.toString())
                        .text(this.months[i]));
                }
                this.selectMonthElem = builder.toDOM();
            }))
                .addChild('div', builder => builder
                .addClass(`${this.cssPrefix}-nav-year`)
                .addChild('select', builder => this.selectYearElem = builder
                .on('change', () => {
                this.jump(parseInt(this.selectYearElem.value), this.selectedMonth);
            })
                .toDOM())))
                .addChild('div', builder => builder
                .addClass(`${this.cssPrefix}-nav-next`)
                .on('click', () => {
                this.next();
            })
                .addChild('span', builder => builder.html('&rsaquo;')));
            return builder.toDOM();
        }
        prev() {
            this.selectedYear = (this.selectedMonth === 0) ? this.selectedYear - 1 : this.selectedYear;
            this.selectedMonth = (this.selectedMonth === 0) ? 11 : this.selectedMonth - 1;
            this.rerenderMonth();
        }
        next() {
            this.selectedYear = (this.selectedMonth === 11) ? this.selectedYear + 1 : this.selectedYear;
            this.selectedMonth = (this.selectedMonth + 1) % 12;
            this.rerenderMonth();
        }
        rerenderSelectYear() {
            const match = /c-(\d*):c\+(\d*)/g.exec(this.options.yearRange);
            let minusYear = 0;
            let plusYear = 1;
            if (match !== null) {
                minusYear = parseInt(match[1]);
                plusYear = parseInt(match[2]);
            }
            this.selectYearElem.innerHTML = '';
            for (let i = 0; i <= minusYear + plusYear; i++) {
                let op = document.createElement("option");
                let year = this.selectedYear - minusYear + i;
                op.value = year.toString();
                op.innerText = year.toString();
                this.selectYearElem.appendChild(op);
            }
        }
        jump(year, month) {
            this.selectedYear = year;
            this.selectedMonth = month;
            this.rerenderMonth();
        }
        rerenderMonth() {
            //header text
            this.updateDisplayedDateValue();
            this.rerenderSelectYear();
            let firstDay = (new Date(this.selectedYear, this.selectedMonth)).getDay();
            let daysInMonth = new Date(this.selectedYear, this.selectedMonth + 1, 0).getDate();
            this.calendarBody.innerHTML = "";
            this.selectYearElem.value = this.selectedYear.toString();
            this.selectMonthElem.value = this.selectedMonth.toString();
            this.daysOfWeek.forEach((day, idx) => {
                domel$1('div', this.calendarBody)
                    .addClass(`${this.cssPrefix}-weekday`)
                    .addClass(idx == 0 || idx == 6 ? `${this.cssPrefix}-weekend` : '')
                    .text(day);
            });
            // Add empty cells before first day
            for (let i = 0; i < firstDay; i++) {
                domel$1('div', this.calendarBody)
                    .addClass(`${this.cssPrefix}-day-empty`);
            }
            // Add all month days
            const today = new Date();
            for (let day = 1; day <= daysInMonth; day++) {
                const builder = domel$1('div', this.calendarBody)
                    .addClass(`${this.cssPrefix}-day`)
                    .attr('data-date', day.toString())
                    .text(day.toString())
                    .on('click', (e) => {
                    this.currentDate.setFullYear(this.selectedYear);
                    this.currentDate.setMonth(this.selectedMonth);
                    this.currentDate.setDate(parseInt(e.target.getAttribute('data-date')));
                    this.dateChanged(this.options.oneClickDateSelection);
                });
                if (day === today.getDate() && this.selectedYear === today.getFullYear() && this.selectedMonth === today.getMonth()) {
                    builder.addClass(`${this.cssPrefix}-day-current`);
                }
                if (day === this.currentDate.getDate() && this.selectedYear === this.currentDate.getFullYear() && this.selectedMonth === this.currentDate.getMonth()) {
                    builder.addClass(`${this.cssPrefix}-day-selected`);
                }
                const dayOfWeek = (firstDay + day - 1) % 7;
                if (dayOfWeek == 0 || dayOfWeek == 6) {
                    builder.addClass(`${this.cssPrefix}-weekend`);
                }
                if (typeof this.options.onDrawDay === "function") {
                    this.options.onDrawDay.apply(builder.toDOM(), [
                        builder.toDOM(),
                        new Date(this.selectedYear, this.selectedMonth, day)
                    ]);
                }
            }
            // Add empty cells after last day
            const cellsDrawnInLastRow = (firstDay + daysInMonth) % 7;
            const cellsToDraw = cellsDrawnInLastRow == 0 ? 0 : 7 - cellsDrawnInLastRow;
            for (let i = 0; i < cellsToDraw; i++) {
                domel$1('div', this.calendarBody)
                    .addClass(`${this.cssPrefix}-day-empty`);
            }
        }
        dateChanged(apply) {
            super.dateChanged(apply);
            this.rerenderMonth();
        }
    };

    let TimePicker$1 = class TimePicker {
        get cssPrefix() {
            return 'kdtp-tp';
        }
        constructor(slot, options) {
            this.slot = slot;
            this.options = options || {};
        }
        setTime(time) {
            this.currentTime = new Date(time);
        }
        getTime() {
            return new Date(this.currentTime);
        }
        timeChanged() {
            if (this.options.onTimeChanged) {
                this.options.onTimeChanged(this.currentTime);
            }
        }
    };

    let DefaultTimePicker$1 = class DefaultTimePicker extends TimePicker$1 {
        setTime(time) {
            super.setTime(time);
            this.updateDisplayedTime();
            this.hoursInput.valueAsNumber = time.getHours();
            this.minutesInput.valueAsNumber = time.getMinutes();
        }
        render() {
            domel$1('div', this.slot)
                .addClass(`${this.cssPrefix}-time`)
                .addChild('span', builder => this.timeText = builder.toDOM())
                .toDOM();
            const slidersBuilder = domel$1('div', this.slot)
                .addClass(`${this.cssPrefix}-sliders`);
            slidersBuilder
                .addChild('div', builder => builder
                .addClass(`${this.cssPrefix}-time-row`)
                .title('Hours')
                .addChild('input', builder => this.hoursInput = builder
                .addClass(`${this.cssPrefix}-input-hours`)
                .type('range')
                .attr('min', '0')
                .attr('max', '23')
                .attr('step', '1')
                .on('input', (e) => {
                this.currentTime.setHours(this.hoursInput.valueAsNumber);
                this.updateDisplayedTime();
                this.timeChanged();
            })
                .toDOM()));
            slidersBuilder
                .addChild('div', builder => builder
                .addClass(`${this.cssPrefix}-time-row`)
                .title('Minutes')
                .addChild('input', builder => this.minutesInput = builder
                .addClass(`${this.cssPrefix}-input-minutes`)
                .type('range')
                .attr('min', '0')
                .attr('max', '59')
                .attr('step', '1')
                .on('input', (e) => {
                this.currentTime.setMinutes(this.minutesInput.valueAsNumber);
                this.updateDisplayedTime();
                this.timeChanged();
            })
                .toDOM()));
            return this.slot;
        }
        updateDisplayedTime() {
            const locale = i18n$2.getCurrentLocale();
            const timeToDraw = this.currentTime.toLocaleString(locale == 'en' ? undefined : locale, {
                hour: "numeric",
                minute: "numeric"
            });
            this.timeText.innerText = timeToDraw;
        }
    };

    let DefaultDateTimePicker$1 = class DefaultDateTimePicker extends DateTimePicker$1 {
        render() {
            const sb = domel$1('div', document.body)
                .addClass(`${this.cssPrefix}`)
                .attr('tabIndex', '0')
                .setStyle('position', 'absolute')
                .setStyle('top', '-1000px')
                .setStyle('left', '-1000px')
                .on('keydown', (ev) => {
                if (ev.keyCode === 27) { // ESC is pressed
                    this.cancel();
                }
                else if (ev.keyCode === 13) { // Enter is pressed
                    this.apply(this.getDateTime());
                }
                return false;
            });
            if (this.options.zIndex) {
                sb.setStyle('z-index', `${this.options.zIndex}`);
            }
            this.slot = sb.toDOM();
            super.render();
            this.renderButtons();
            this.globalMouseDownHandler = (e) => {
                let event = window.event || e;
                event.srcElement || event.target;
                let isOutside = !this.slot.contains(event.target);
                if (isOutside) {
                    document.removeEventListener('mousedown', this.globalMouseDownHandler, true);
                    this.cancel();
                }
                return true;
            };
        }
        renderButtons() {
            const builder = domel$1('div', this.slot)
                .addClass(`${this.cssPrefix}-buttons`)
                .addChild('button', b => this.nowButton = b
                .addClass(`${this.cssPrefix}-button ${this.cssPrefix}-button-now`)
                .text(i18n$2.getText('ButtonNow'))
                .on('click', () => {
                this.setDateTime(new Date());
                this.dateTimeChanged();
                return false;
            })
                .toDOM());
            if (this.options.showTimePicker || !this.options.oneClickDateSelection) {
                builder.addChild('button', b => this.submitButton = b
                    .addClass(`${this.cssPrefix}-button ${this.cssPrefix}-button-apply`)
                    .text(i18n$2.getText('ButtonApply'))
                    .on('click', () => {
                    this.apply(this.getDateTime());
                    return false;
                })
                    .toDOM());
            }
            builder.addChild('button', b => this.submitButton = b
                .addClass(`${this.cssPrefix}-button ${this.cssPrefix}-button-cancel`)
                .text(i18n$2.getText('ButtonCancel'))
                .on('click', () => {
                this.cancel();
                return false;
            })
                .toDOM());
        }
        createCalendar(options) {
            this.calendarSlot =
                domel$1('div', this.slot)
                    .addClass(`${this.cssPrefix}-cal`)
                    .toDOM();
            return new DefaultCalendar$1(this.calendarSlot, options);
        }
        createTimePicker(options) {
            this.timePickerSlot =
                domel$1('div', this.slot)
                    .addClass(`${this.cssPrefix}-tp`)
                    .toDOM();
            return new DefaultTimePicker$1(this.timePickerSlot, options);
        }
        show(anchor) {
            if (this.options.showDateTimeInput) {
                if (this.options.beforeShow) {
                    this.options.beforeShow();
                }
                const anchorPos = getElementAbsolutePos$1(anchor || document.body);
                const parentPos = getElementAbsolutePos$1(anchor ? anchor.parentElement || anchor : document.body);
                this.slot.style.top = parentPos.y + 'px';
                this.slot.style.left = anchorPos.x + 'px';
            }
            else {
                super.show(anchor);
                this.slot.focus();
            }
            setTimeout(() => {
                document.addEventListener('mousedown', this.globalMouseDownHandler, true);
            }, 1);
        }
    };

    var DialogFooterAlignment$1;
    (function (DialogFooterAlignment) {
        DialogFooterAlignment[DialogFooterAlignment["Left"] = 1] = "Left";
        DialogFooterAlignment[DialogFooterAlignment["Center"] = 2] = "Center";
        DialogFooterAlignment[DialogFooterAlignment["Right"] = 3] = "Right";
    })(DialogFooterAlignment$1 || (DialogFooterAlignment$1 = {}));

    const cssPrefix$2 = "kdlg";
    let DefaultDialogService$1 = class DefaultDialogService {
        openConfirm(title, content, callback) {
            const template = `<div id="${cssPrefix$2}-dialog-confirm">${content}</div>`;
            const options = {
                title: title,
                closable: false,
                submitable: true,
                cancelable: true,
                body: template
            };
            if (callback) {
                options.onSubmit = () => {
                    callback(true);
                };
                options.onCancel = () => {
                    callback(false);
                };
                this.open(options);
                return;
            }
            return new Promise((resolve) => {
                options.onSubmit = () => {
                    resolve(true);
                };
                options.onCancel = () => {
                    resolve(false);
                };
                this.open(options);
            });
        }
        openPrompt(title, content, defVal, callback) {
            const template = `<div id="${cssPrefix$2}-dialog-form" class="kfrm-form">
            <div class="kfrm-fields label-above">
                <label for="${cssPrefix$2}-dialog-form-input" id="${cssPrefix$2}-dialog-form-content">${content}</label>
                <input type="text" name="${cssPrefix$2}-dialog-form-input" id="${cssPrefix$2}-dialog-form-input" />
            </div>
        </div>`;
            const options = {
                title: title,
                submitable: true,
                closable: true,
                cancelable: true,
                submitOnEnter: true,
                body: template,
                arrangeParents: false,
                beforeOpen: () => {
                    const input = document.getElementById(`${cssPrefix$2}-dialog-form-input`);
                    if (defVal) {
                        input.value = defVal;
                    }
                    input.focus();
                }
            };
            const processInput = (callback) => {
                const input = document.getElementById(`${cssPrefix$2}-dialog-form-input`);
                const result = input.value;
                if (result && result.replace(/\s/g, '').length > 0) {
                    callback(result);
                    return true;
                }
                input.classList.add('eqjs-invalid');
                return false;
            };
            if (callback) {
                options.onSubmit = () => {
                    return processInput(callback);
                };
                options.onCancel = () => {
                    callback("");
                };
                this.open(options);
                return;
            }
            return new Promise((resolve) => {
                options.onSubmit = () => {
                    return processInput(resolve);
                };
                options.onCancel = () => {
                    resolve("");
                };
                this.open(options);
            });
        }
        open(options, data) {
            const dialog = new DefaultDialog$1(options, data);
            const onDestroy = options.onDestroy;
            options.onDestroy = (dlg) => {
                this.untrack(dlg);
                onDestroy && onDestroy(dlg);
            };
            dialog.open();
            this.track(dialog);
            return dialog;
        }
        createSet(options) {
            return new DefaultDialogSet$1(options, this);
        }
        untrack(dlg) {
            const index = DefaultDialogService.openDialogs.indexOf(dlg);
            if (index >= 0) {
                DefaultDialogService.openDialogs.splice(index, 1);
            }
        }
        track(dlg) {
            DefaultDialogService.openDialogs.push(dlg);
        }
        openProgress(options) {
            const dialog = new DefaultProgressDialog$1(options);
            const onDestroy = options.onDestroy;
            options.onDestroy = (dlg) => {
                this.untrack(dlg);
                onDestroy && onDestroy(dlg);
            };
            dialog.open();
            this.track(dialog);
            return dialog;
        }
        getAllDialogs() {
            return Array.from(DefaultDialogService.openDialogs);
        }
        closeAllDialogs() {
            for (const dialog of Array.from(DefaultDialogService.openDialogs)) {
                dialog.close();
            }
        }
    };
    DefaultDialogService$1.openDialogs = [];
    let DefaultDialog$1 = class DefaultDialog {
        constructor(options, data) {
            this.options = options;
            this.submitHandler = (token) => {
                if (this.options.onSubmit && this.options.onSubmit(this, token) === false) {
                    return false;
                }
                this.destroy();
                return true;
            };
            this.cancelHandler = () => {
                if (this.options.onCancel) {
                    this.options.onCancel(this);
                }
                this.destroy();
            };
            this.keydownHandler = (ev) => {
                if (ev.keyCode == 13 && this.isActiveDialog()) {
                    ev.preventDefault();
                    ev.stopPropagation();
                    if (this.submitHandler()) {
                        window.removeEventListener('keydown', this.keydownHandler, false);
                        return false;
                    }
                }
                return true;
            };
            this.dialogId = utils$2.generateId('dlg');
            this.data = data;
            this.slot =
                domel$1('div', document.body)
                    .attr('tab-index', '-1')
                    .data('dialog-id', this.dialogId)
                    .addClass(`${cssPrefix$2}-modal`, 'is-active')
                    .focus()
                    .addChild('div', b => b
                    .addClass('kdlg-modal-background'))
                    .addChild('div', b => this.windowElement = b
                    .addClass(`${cssPrefix$2}-modal-window`)
                    .addChild('header', b => {
                    this.headerElement = b
                        .addClass(`${cssPrefix$2}-header`)
                        .addChild('p', b => b
                        .addClass(`${cssPrefix$2}-header-title`)
                        .addText(options.title))
                        .toDOM();
                    if (options.closable !== false)
                        b.addChild('button', b => b
                            .addClass(`${cssPrefix$2}-modal-close`)
                            .on('click', () => {
                            this.cancelHandler();
                        })
                            .focus());
                })
                    .addChild('div', b => {
                    b.addClass(`${cssPrefix$2}-alert-container`);
                    this.alertElement = b.toDOM();
                })
                    .addChild('section', b => {
                    this.bodyElement = b
                        .addClass(`${cssPrefix$2}-body`)
                        .toDOM();
                    if (typeof options.body === 'string') {
                        const html = liquid$2.renderLiquidTemplate(options.body, data);
                        b.addHtml(html);
                    }
                    else {
                        b.addChildElement(options.body);
                    }
                })
                    .addChild('footer', b => {
                    let alignClass = null;
                    if (options.footerAlignment && options.footerAlignment == DialogFooterAlignment$1.Center) {
                        alignClass = 'align-center';
                    }
                    else {
                        alignClass = 'align-right';
                    }
                    this.footerElement = b
                        .addClass(`${cssPrefix$2}-footer`)
                        .toDOM();
                    b.addClass(alignClass);
                    if (options.submitable === false)
                        return;
                    b.addChild('button', bb => {
                        bb.id(this.dialogId + '-btn-submit')
                            .addClass('kfrm-button', 'is-info')
                            .addText(options.submitButtonText || i18n$2.getText('ButtonOK'));
                        if (options.recaptchaSiteKey) {
                            bb.data('sitekey', options.recaptchaSiteKey);
                            bb.addClass('g-recaptcha');
                            bb.on('click', (e) => {
                                if (grecaptcha) {
                                    grecaptcha.ready(() => {
                                        grecaptcha.execute(options.recaptchaSiteKey, { action: 'submit' })
                                            .then((token) => {
                                            this.submitHandler(token);
                                        });
                                    });
                                }
                                else {
                                    this.submitHandler();
                                }
                            });
                        }
                        else {
                            bb.on('click', (e) => {
                                this.submitHandler();
                            });
                        }
                        bb.focus();
                    });
                    if (options.cancelable !== false)
                        b.addChild('button', bb => bb
                            .id(this.dialogId + '-btn-cancel')
                            .addClass('kfrm-button')
                            .addText(options.cancelButtonText || i18n$2.getText('ButtonCancel'))
                            .on('click', (e) => {
                            this.cancelHandler();
                        }));
                })
                    .toDOM())
                    .toDOM();
        }
        getData() {
            return this.data;
        }
        getRootElement() {
            return this.slot;
        }
        getSubmitButtonElement() {
            return document.getElementById(this.dialogId + '-btn-submit');
        }
        getCancelButtonElement() {
            return document.getElementById(this.dialogId + '-btn-cancel');
        }
        open() {
            if (this.options.beforeOpen) {
                this.options.beforeOpen(this);
            }
            domel$1(this.slot).show();
            if (this.options.arrangeParents) {
                this.arrangeParents(true);
            }
            const windowDiv = this.slot
                .querySelector(`.${cssPrefix$2}-modal-window`);
            if (this.options.height) {
                windowDiv.style.height = typeof this.options.height === 'string'
                    ? this.options.height
                    : `${this.options.height}px`;
            }
            if (this.options.width) {
                windowDiv.style.width = typeof this.options.width === 'string'
                    ? this.options.width
                    : `${this.options.width}px`;
            }
            if (this.options.submitOnEnter) {
                window.addEventListener('keydown', this.keydownHandler, false);
            }
            //clear alert on change in any input element 
            this.slot.querySelectorAll('input')
                .forEach(element => element.addEventListener('input', () => {
                this.clearAlert();
                if (this.options.onInput) {
                    this.options.onInput(this);
                }
            }));
            if (this.options.onShow) {
                this.options.onShow(this);
            }
        }
        submit() {
            this.submitHandler();
        }
        cancel() {
            this.cancelHandler();
        }
        close() {
            this.destroy();
        }
        disableButtons() {
            const buttons = this.slot.querySelectorAll('button');
            buttons.forEach(button => button.disabled = true);
        }
        enableButtons() {
            const buttons = this.slot.querySelectorAll('button');
            buttons.forEach(button => button.disabled = false);
        }
        showAlert(text, reason, replace) {
            let alert = domel$1('div')
                .addClass(`${cssPrefix$2}-alert ${reason || ''}`)
                .addChild('span', b => b
                .addClass(`${cssPrefix$2}-alert-closebtn`)
                .text('×')
                .on('click', (ev) => {
                const alert = ev.target.parentElement;
                alert.parentElement.removeChild(alert);
            }))
                .addText(text)
                .toDOM();
            if (replace === true) {
                this.clearAlert();
            }
            this.alertElement.appendChild(alert);
        }
        clearAlert() {
            this.alertElement.innerHTML = '';
        }
        destroy() {
            const elem = document.querySelectorAll(`[data-dialog-id="${this.dialogId}"]`);
            if (elem.length <= 0)
                return;
            if (this.options.arrangeParents) {
                this.arrangeParents(false);
            }
            document.body.removeChild(this.slot);
            if (this.options.submitOnEnter) {
                window.removeEventListener('keydown', this.keydownHandler, false);
            }
            if (this.options.onDestroy) {
                this.options.onDestroy(this);
            }
        }
        isActiveDialog() {
            const windowDivs = document.documentElement.querySelectorAll('.kdlg-modal');
            return windowDivs[windowDivs.length - 1] === this.slot;
        }
        arrangeParents(turnOn) {
            const windowDivs = document.documentElement.querySelectorAll('.kdlg-modal-window');
            for (let i = 0; i < windowDivs.length - 1; i++) {
                if (turnOn) {
                    const offset = i == 0 ? 20 : i * 40 + 20;
                    domel$1(windowDivs[i])
                        .setStyle('margin-top', `${offset}px`)
                        .setStyle('margin-left', `${offset}px`);
                }
                else {
                    domel$1(windowDivs[i])
                        .removeStyle('margin-top')
                        .removeStyle('margin-left');
                }
            }
        }
    };
    let DefaultProgressDialog$1 = class DefaultProgressDialog extends DefaultDialog$1 {
        constructor(options, data) {
            let contentElement;
            let progressElement;
            const body = domel$1('div')
                .addChild('div', b => contentElement = b
                .text(options.content || '')
                .toDOM())
                .addChild('div', b => {
                b
                    .addClass(`${cssPrefix$2}-progress-line`)
                    .addChild('div', b => {
                    progressElement = b
                        .addClass('fill')
                        .toDOM();
                    if (options.determinated) {
                        b.setStyle('width', '0%');
                    }
                    else {
                        b.addClass('indeterminate');
                    }
                });
            })
                .toDOM();
            super({
                title: options.title,
                body: body,
                beforeOpen: options.beforeOpen,
                onSubmit: options.onSubmit,
                width: options.width,
                height: options.height,
                submitable: false,
                cancelable: false,
                closable: false,
                onDestroy: options.onDestroy
            }, data);
            this.contentElement = contentElement;
            this.progressElement = progressElement;
        }
        updateContent(content) {
            this.contentElement.innerText = content;
        }
        updateProgress(progress) {
            progress = this.in01(progress);
            this.progressElement.style.width = `${progress * 100}%`;
            if (progress === 1) {
                // postpone for 0.5s for smooth closing
                setTimeout(() => {
                    this.submit();
                }, 500);
            }
        }
        in01(num) {
            if (num > 1)
                return 1;
            if (num < 0)
                return 0;
            return num;
        }
    };
    let DefaultDialogSet$1 = class DefaultDialogSet {
        constructor(options, dialogService) {
            this.options = options;
            this.dialogService = dialogService;
            this.currentDialog = null;
            this.currentIndex = 0;
            this.options = options;
            this.dialogService = dialogService;
        }
        getCurrent() {
            return this.currentDialog;
        }
        openNext(data) {
            return this.open(this.currentIndex + 1, data);
        }
        openPrev(data) {
            return this.open(this.currentIndex - 1, data);
        }
        open(page, data) {
            if (page < 0) {
                this.currentIndex = 0;
            }
            else if (page >= this.options.length) {
                this.currentIndex = this.options.length - 1;
            }
            else {
                this.currentIndex = page;
            }
            if (this.currentDialog) {
                try {
                    this.currentDialog.close();
                }
                catch (e) { }
            }
            const dlgOptions = this.options[this.currentIndex];
            this.currentDialog = this.dialogService.open(dlgOptions, data);
            return this.currentDialog;
        }
        close() {
            if (this.currentDialog) {
                this.currentDialog.close();
                this.currentDialog = null;
            }
        }
    };

    function addEasyDataUITexts$1() {
        i18n$2.updateDefaultTexts({
            GridPageInfo: '{FirstPageRecordNum} - {LastPageRecordNum} of {Total} records',
            GridItemsPerPage: 'items per page',
            ButtonOK: "OK",
            ButtonCancel: "Cancel",
            ButtonApply: 'Apply',
            ButtonNow: 'Now',
            LblTotal: 'Total'
        });
    }
    addEasyDataUITexts$1();

    var PRE_SELECT$1;
    (function (PRE_SELECT) {
        PRE_SELECT[PRE_SELECT["THIS_WEEK"] = 0] = "THIS_WEEK";
        PRE_SELECT[PRE_SELECT["LAST_WEEK"] = 1] = "LAST_WEEK";
        PRE_SELECT[PRE_SELECT["THIS_MONTH"] = 2] = "THIS_MONTH";
        PRE_SELECT[PRE_SELECT["FIRST_MONTH"] = 3] = "FIRST_MONTH";
        PRE_SELECT[PRE_SELECT["LAST_MONTH"] = 4] = "LAST_MONTH";
        PRE_SELECT[PRE_SELECT["THIS_YEAR"] = 5] = "THIS_YEAR";
        PRE_SELECT[PRE_SELECT["QUARTER_1"] = 6] = "QUARTER_1";
        PRE_SELECT[PRE_SELECT["QUARTER_2"] = 7] = "QUARTER_2";
        PRE_SELECT[PRE_SELECT["QUARTER_3"] = 8] = "QUARTER_3";
        PRE_SELECT[PRE_SELECT["QUARTER_4"] = 9] = "QUARTER_4";
    })(PRE_SELECT$1 || (PRE_SELECT$1 = {}));
    var JUMP_TO$1;
    (function (JUMP_TO) {
        JUMP_TO["UNDEF"] = "-1";
        JUMP_TO["TODAY"] = "1";
        JUMP_TO["YESTERDAY"] = "2";
        JUMP_TO["TOMORROW"] = "3";
        JUMP_TO["WEEK_START"] = "4";
        JUMP_TO["WEEK_END"] = "5";
        JUMP_TO["MONTH_START"] = "6";
        JUMP_TO["MONTH_END"] = "7";
        JUMP_TO["YEAR_START"] = "8";
        JUMP_TO["YEAR_END"] = "9";
    })(JUMP_TO$1 || (JUMP_TO$1 = {}));
    const DEFAULT_WEEK_START = 0;
    class TimeSpanPicker extends DefaultDialog$1 {
        constructor(options) {
            super({
                title: options.title || `Select a period`,
                body: "",
                submitButtonText: options.submitButtonText || `OK`,
                cancelButtonText: options.cancelButtonText || `Cancel`,
                submitable: true,
                closable: true,
                cancelable: true,
                beforeOpen: (dlg) => {
                    this.setupDialog();
                },
                onSubmit: (dlg) => {
                    if (typeof options.onSubmit === "function") {
                        options.onSubmit.apply(dlg, [this.result(this.from), this.result(this.to)]);
                    }
                }
            });
            this.yearRange = options.yearRange;
            this.weekStart = options.weekStart || DEFAULT_WEEK_START;
            this.bodyElement.append(this.drawDialog());
            this.calendar1.render();
            this.calendar2.render();
            this.from = this.alignDate(options.start ? options.start : new Date());
            this.to = this.alignDate(options.finish && this.alignDate(options.finish) > this.from ? options.finish : new Date(this.from.getFullYear(), this.from.getMonth(), this.from.getDate() + 1));
            this.represent();
        }
        alignDate(date) {
            date.setHours(0);
            date.setMinutes(0);
            date.setSeconds(0);
            date.setMilliseconds(0);
            return date;
        }
        drawDialog() {
            const body = domel$1('div')
                .addClass('tsp__container')
                .addChild('div', b => {
                b
                    .addClass('tsp__intervals')
                    .addChild('button', b => b.addClass('tsp__button').addText('This Week').on('click', () => { this.select(PRE_SELECT$1.THIS_WEEK); }))
                    .addChild('button', b => b.addClass('tsp__button').addText('Last Week').on('click', () => { this.select(PRE_SELECT$1.LAST_WEEK); }))
                    .addChild('button', b => b.addClass('tsp__button').addText('This Month').on('click', () => { this.select(PRE_SELECT$1.THIS_MONTH); }))
                    .addChild('button', b => b.addClass('tsp__button').addText('First Month').on('click', () => { this.select(PRE_SELECT$1.FIRST_MONTH); }))
                    .addChild('button', b => b.addClass('tsp__button').addText('Last Month').on('click', () => { this.select(PRE_SELECT$1.LAST_MONTH); }))
                    .addChild('button', b => b.addClass('tsp__button').addText('This Year').on('click', () => { this.select(PRE_SELECT$1.THIS_YEAR); }))
                    .addChild('button', b => b.addClass('tsp__button').addText('Quarter 1').on('click', () => { this.select(PRE_SELECT$1.QUARTER_1); }))
                    .addChild('button', b => b.addClass('tsp__button').addText('Quarter 2').on('click', () => { this.select(PRE_SELECT$1.QUARTER_2); }))
                    .addChild('button', b => b.addClass('tsp__button').addText('Quarter 3').on('click', () => { this.select(PRE_SELECT$1.QUARTER_3); }))
                    .addChild('button', b => b.addClass('tsp__button').addText('Quarter 4').on('click', () => { this.select(PRE_SELECT$1.QUARTER_4); }));
            })
                .addChild('div', b => {
                b
                    .addClass('tsp__form')
                    .addChild('div', b => {
                    b
                        .addClass('tsp__date')
                        .addChild('div', b => {
                        b
                            .addClass('tsp__label')
                            .addChild('label', b => {
                            b.addText('Start');
                        })
                            .addChild('select', b => {
                            b
                                .addOption({ value: JUMP_TO$1.UNDEF, title: 'Jump To' })
                                .addOption({ value: JUMP_TO$1.TODAY, title: 'Today' })
                                .addOption({ value: JUMP_TO$1.YESTERDAY, title: 'Yesterday' })
                                .addOption({ value: JUMP_TO$1.TOMORROW, title: 'Tomorrow' })
                                .addOption({ value: JUMP_TO$1.WEEK_START, title: 'Week Start' })
                                .addOption({ value: JUMP_TO$1.WEEK_END, title: 'Week End' })
                                .addOption({ value: JUMP_TO$1.MONTH_START, title: 'Month Start' })
                                .addOption({ value: JUMP_TO$1.MONTH_END, title: 'Month End' })
                                .addOption({ value: JUMP_TO$1.YEAR_START, title: 'Year Start' })
                                .addOption({ value: JUMP_TO$1.YEAR_END, title: 'Year End' });
                            b.on('change', (event) => {
                                // @ts-ignore
                                this.jump(1, event.target.value, event.target);
                            });
                        });
                    })
                        .addChild('div', b => {
                        b.addClass('tsp__calendar');
                        this.calendar1 = new DefaultCalendar$1(b.toDOM(), {
                            yearRange: this.yearRange,
                            showDateTimeInput: true,
                            onDateChanged: (date) => {
                                this.from = this.alignDate(date);
                                this.calendar1.setDate(this.from);
                                if (this.to < this.from) {
                                    this.to = this.from;
                                }
                                this.represent();
                            },
                            onDrawDay: (cell, date) => {
                                if (this.alignDate(date) >= this.from && this.alignDate(date) <= this.to) {
                                    cell.classList.add("day-in-range");
                                }
                                else {
                                    cell.classList.remove("day-in-range");
                                }
                            }
                        });
                    });
                })
                    .addChild('div', b => {
                    b
                        .addClass('tsp__date')
                        .addChild('div', b => {
                        b
                            .addClass('tsp__label')
                            .addChild('label', b => {
                            b.addText('Finish');
                        })
                            .addChild('select', b => {
                            b
                                .addOption({ value: JUMP_TO$1.UNDEF, title: 'Jump To' })
                                .addOption({ value: JUMP_TO$1.TODAY, title: 'Today' })
                                .addOption({ value: JUMP_TO$1.YESTERDAY, title: 'Yesterday' })
                                .addOption({ value: JUMP_TO$1.TOMORROW, title: 'Tomorrow' })
                                .addOption({ value: JUMP_TO$1.WEEK_START, title: 'Week Start' })
                                .addOption({ value: JUMP_TO$1.WEEK_END, title: 'Week End' })
                                .addOption({ value: JUMP_TO$1.MONTH_START, title: 'Month Start' })
                                .addOption({ value: JUMP_TO$1.MONTH_END, title: 'Month End' })
                                .addOption({ value: JUMP_TO$1.YEAR_START, title: 'Year Start' })
                                .addOption({ value: JUMP_TO$1.YEAR_END, title: 'Year End' });
                            b.on('change', (event) => {
                                // @ts-ignore
                                this.jump(2, event.target.value, event.target);
                            });
                        });
                    })
                        .addChild('div', b => {
                        b.addClass('tsp__calendar');
                        this.calendar2 = new DefaultCalendar$1(b.toDOM(), {
                            yearRange: this.yearRange,
                            showDateTimeInput: true,
                            onDateChanged: (date) => {
                                if (this.alignDate(date) >= this.from) {
                                    this.to = this.alignDate(date);
                                }
                                else {
                                    this.calendar2.setDate(this.to);
                                }
                                this.represent();
                            },
                            onDrawDay: (cell, date) => {
                                if (this.alignDate(date) >= this.from && this.alignDate(date) <= this.to) {
                                    cell.classList.add("day-in-range");
                                }
                                else {
                                    cell.classList.remove("day-in-range");
                                }
                            }
                        });
                    });
                });
            })
                .toDOM();
            return body;
        }
        setupDialog() {
        }
        jump(cal, to, select) {
            let target = cal === 1 ? 'from' : 'to';
            let jumpTo;
            const curr = new Date();
            switch (to) {
                case JUMP_TO$1.TODAY: {
                    jumpTo = curr;
                    break;
                }
                case JUMP_TO$1.YESTERDAY: {
                    jumpTo = new Date(curr.getFullYear(), curr.getMonth(), curr.getDate() - 1);
                    break;
                }
                case JUMP_TO$1.TOMORROW: {
                    jumpTo = new Date(curr.getFullYear(), curr.getMonth(), curr.getDate() + 1);
                    break;
                }
                case JUMP_TO$1.WEEK_START: {
                    jumpTo = new Date(curr.setDate(curr.getDate() - curr.getDay() + this.weekStart));
                    break;
                }
                case JUMP_TO$1.WEEK_END: {
                    jumpTo = new Date(curr.setDate(curr.getDate() - curr.getDay() + 6 + this.weekStart));
                    break;
                }
                case JUMP_TO$1.MONTH_START: {
                    jumpTo = new Date(curr.getFullYear(), curr.getMonth(), 1);
                    break;
                }
                case JUMP_TO$1.MONTH_END: {
                    jumpTo = new Date(curr.getFullYear(), curr.getMonth() + 1, 0);
                    break;
                }
                case JUMP_TO$1.YEAR_START: {
                    jumpTo = new Date(curr.getFullYear(), 0, 1);
                    break;
                }
                case JUMP_TO$1.YEAR_END: {
                    jumpTo = new Date(curr.getFullYear(), 12, 0);
                    break;
                }
            }
            jumpTo = this.alignDate(jumpTo);
            select.value = JUMP_TO$1.UNDEF;
            if (target === "from") {
                this.from = jumpTo;
                if (this.to < this.from) {
                    this.to = this.from;
                }
            }
            else {
                if (jumpTo >= this.from) {
                    this[target] = jumpTo;
                }
            }
            this.represent();
        }
        represent() {
            this.calendar1.setDate(this.from);
            this.calendar2.setDate(this.to);
        }
        select(interval) {
            switch (interval) {
                case PRE_SELECT$1.THIS_WEEK: {
                    const curr = new Date();
                    this.from = new Date(curr.getFullYear(), curr.getMonth(), curr.getDate() - curr.getDay());
                    this.to = new Date(this.from.getFullYear(), this.from.getMonth(), this.from.getDate() + 6);
                    break;
                }
                case PRE_SELECT$1.LAST_WEEK: {
                    const curr = new Date();
                    this.from = new Date(curr.getFullYear(), curr.getMonth(), curr.getDate() - curr.getDay() - 7);
                    this.to = new Date(this.from.getFullYear(), this.from.getMonth(), this.from.getDate() + 6);
                    break;
                }
                case PRE_SELECT$1.THIS_MONTH: {
                    const curr = new Date();
                    this.from = new Date(curr.getFullYear(), curr.getMonth(), 1);
                    this.to = new Date(curr.getFullYear(), curr.getMonth() + 1, 0);
                    break;
                }
                case PRE_SELECT$1.FIRST_MONTH: {
                    const curr = new Date();
                    this.from = new Date(curr.getFullYear(), 0, 1);
                    this.to = new Date(curr.getFullYear(), 1, 0);
                    break;
                }
                case PRE_SELECT$1.LAST_MONTH: {
                    const curr = new Date();
                    this.from = new Date(curr.getFullYear(), curr.getMonth() - 1, 1);
                    this.to = new Date(curr.getFullYear(), curr.getMonth(), 0);
                    break;
                }
                case PRE_SELECT$1.THIS_YEAR: {
                    const curr = new Date();
                    this.from = new Date(curr.getFullYear(), 0, 1);
                    this.to = new Date(curr.getFullYear(), 12, 0);
                    break;
                }
                case PRE_SELECT$1.QUARTER_1: {
                    const curr = new Date();
                    this.from = new Date(curr.getFullYear(), 0, 1);
                    this.to = new Date(curr.getFullYear(), 3, 0);
                    break;
                }
                case PRE_SELECT$1.QUARTER_2: {
                    const curr = new Date();
                    this.from = new Date(curr.getFullYear(), 3, 1);
                    this.to = new Date(curr.getFullYear(), 6, 0);
                    break;
                }
                case PRE_SELECT$1.QUARTER_3: {
                    const curr = new Date();
                    this.from = new Date(curr.getFullYear(), 6, 1);
                    this.to = new Date(curr.getFullYear(), 9, 0);
                    break;
                }
                case PRE_SELECT$1.QUARTER_4: {
                    const curr = new Date();
                    this.from = new Date(curr.getFullYear(), 9, 1);
                    this.to = new Date(curr.getFullYear(), 12, 0);
                    break;
                }
            }
            this.represent();
        }
        result(date) {
            const curr = this.alignDate(new Date());
            const constants = {
                "Today": this.alignDate(new Date()),
                "Yesterday": this.alignDate(new Date(curr.getFullYear(), curr.getMonth(), curr.getDate() - 1)),
                "Tomorrow": this.alignDate(new Date(curr.getFullYear(), curr.getMonth(), curr.getDate() + 1)),
                "FirstDayOfMonth": this.alignDate(new Date(curr.getFullYear(), curr.getMonth(), 1)),
                "LastDayOfMonth": this.alignDate(new Date(curr.getFullYear(), curr.getMonth() + 1, 0)),
                "FirstDayOfWeek": this.alignDate(new Date(curr.setDate(curr.getDate() - curr.getDay() + this.weekStart))),
                "FirstDayOfYear": this.alignDate(new Date(curr.getFullYear(), 0, 1)),
                "FirstDayOfNextWeek": this.alignDate(new Date(curr.setDate(curr.getDate() - curr.getDay() + this.weekStart + 7))),
                "FirstDayOfNextMonth": this.alignDate(new Date(curr.getFullYear(), curr.getMonth() + 1, 1)),
                "FirstDayOfNextYear": this.alignDate(new Date(curr.getFullYear() + 1, 0, 1)),
            };
            for (let k in constants) {
                console.log(constants[k], date);
                if (constants[k].getTime() === date.getTime()) {
                    return `\${{${k}}}`;
                }
            }
            return i18n$2.dateTimeToStr(date, i18n$2.getLocaleSettings().editDateFormat);
        }
    }
    const showTimeSpanPicker = (options) => new TimeSpanPicker(options).open();

    // grid
    // export dialogs to use outside of context as global
    const dialogs = new DefaultDialogService$1();

    var easydata_ui_es = /*#__PURE__*/Object.freeze({
        __proto__: null,
        get AutoResizeColumns () { return AutoResizeColumns$1; },
        Calendar: Calendar$1,
        get CellRendererType () { return CellRendererType$1; },
        DFMT_REGEX: DFMT_REGEX$1,
        DateTimePicker: DateTimePicker$1,
        DefaultCalendar: DefaultCalendar$1,
        DefaultDateTimePicker: DefaultDateTimePicker$1,
        DefaultDialog: DefaultDialog$1,
        DefaultDialogService: DefaultDialogService$1,
        DefaultDialogSet: DefaultDialogSet$1,
        DefaultProgressDialog: DefaultProgressDialog$1,
        DefaultTimePicker: DefaultTimePicker$1,
        get DialogFooterAlignment () { return DialogFooterAlignment$1; },
        DomElementBuilder: DomElementBuilder$1,
        DomInputElementBuilder: DomInputElementBuilder$1,
        DomSelectElementBuilder: DomSelectElementBuilder$1,
        DomTextAreaElementBuilder: DomTextAreaElementBuilder$1,
        DragManager: DragManager$1,
        get DropEffect () { return DropEffect$1; },
        EasyGrid: EasyGrid$1,
        EqDragEvent: EqDragEvent$1,
        GridCellRendererStore: GridCellRendererStore$1,
        GridColumn: GridColumn$1,
        get GridColumnAlign () { return GridColumnAlign$1; },
        GridColumnList: GridColumnList$1,
        get JUMP_TO () { return JUMP_TO$1; },
        get PRE_SELECT () { return PRE_SELECT$1; },
        TimePicker: TimePicker$1,
        TimeSpanPicker: TimeSpanPicker,
        addCssClass: addCssClass,
        addElement: addElement,
        get browserUtils () { return browserUtils$1; },
        createBrowserEvent: createBrowserEvent,
        dialogs: dialogs,
        domel: domel$1,
        eqCssMobile: eqCssMobile,
        eqCssPrefix: eqCssPrefix$1,
        eqDragManager: eqDragManager$1,
        getDocSize: getDocSize,
        getElementAbsolutePos: getElementAbsolutePos$1,
        getScrollPos: getScrollPos$1,
        getViewportSize: getViewportSize,
        getWinSize: getWinSize,
        hideElement: hideElement,
        isVisible: isVisible,
        mask: mask$1,
        showElement: showElement,
        showTimeSpanPicker: showTimeSpanPicker,
        slideDown: slideDown,
        slideUp: slideUp,
        toggleVisibility: toggleVisibility,
        wrapInner: wrapInner
    });

    /*!
     * EasyData.JS CRUD v1.4.20
     * Copyright 2023 Korzh.com
     * Licensed under MIT
     */

    /*!
     * EasyData.JS Core v1.4.20
     * Copyright 2023 Korzh.com
     * Licensed under MIT
     */

    /** Represents the common types of the data. */
    var DataType$1;
    (function (DataType) {
        /** Unknown type value*/
        DataType[DataType["Unknown"] = 0] = "Unknown";
        /** String value*/
        DataType[DataType["String"] = 1] = "String";
        /** 8-bit integer value */
        DataType[DataType["Byte"] = 2] = "Byte";
        /** 16-bit integer value */
        DataType[DataType["Word"] = 3] = "Word";
        /** 32-bit integer value */
        DataType[DataType["Int32"] = 4] = "Int32";
        /** 64-bit integer value */
        DataType[DataType["Int64"] = 5] = "Int64";
        /** Boolean value */
        DataType[DataType["Bool"] = 6] = "Bool";
        /** Floating-point numeric value */
        DataType[DataType["Float"] = 7] = "Float";
        /** Money value */
        DataType[DataType["Currency"] = 8] = "Currency";
        /** Binary-coded decimal value */
        DataType[DataType["BCD"] = 9] = "BCD";
        /** Date value */
        DataType[DataType["Date"] = 10] = "Date";
        /** Time value */
        DataType[DataType["Time"] = 11] = "Time";
        /** Date and time value */
        DataType[DataType["DateTime"] = 12] = "DateTime";
        /** Autoincrement 32-bit integer value */
        DataType[DataType["Autoinc"] = 13] = "Autoinc";
        /** MEMO value (text with unlimited length) */
        DataType[DataType["Memo"] = 14] = "Memo";
        /** BLOB value (any data with unlimited length) */
        DataType[DataType["Blob"] = 15] = "Blob";
        /** Fixed character value */
        DataType[DataType["FixedChar"] = 16] = "FixedChar";
        /** The unique identifier */
        DataType[DataType["Guid"] = 17] = "Guid";
        /*-------- Spatial data types ----------*/
        /** Any geometry data */
        DataType[DataType["Geometry"] = 18] = "Geometry";
        /** Any data that represents some geography objects</summary> */
        DataType[DataType["Geography"] = 19] = "Geography";
    })(DataType$1 || (DataType$1 = {}));

    var EntityAttrKind$1;
    (function (EntityAttrKind) {
        EntityAttrKind[EntityAttrKind["Data"] = 0] = "Data";
        EntityAttrKind[EntityAttrKind["Virtual"] = 1] = "Virtual";
        EntityAttrKind[EntityAttrKind["Lookup"] = 2] = "Lookup";
    })(EntityAttrKind$1 || (EntityAttrKind$1 = {}));

    const EditorTag = {
        /** Unknown tag value */
        Unknown: "Unknown",
        /** Edit tag value */
        Edit: "EDIT",
        /** DateTime tag value  */
        DateTime: "DATETIME",
        /** List tag value */
        List: "LIST",
        /** CustomList tag value */
        CustomList: "CUSTOMLIST",
        /** File tag value */
        File: "FILE"
    };

    var HttpMethod$1;
    (function (HttpMethod) {
        HttpMethod["Trace"] = "TRACE";
        HttpMethod["Options"] = "OPTIONS";
        HttpMethod["Get"] = "GET";
        HttpMethod["Put"] = "PUT";
        HttpMethod["Post"] = "POST";
        HttpMethod["Delete"] = "DELETE";
    })(HttpMethod$1 || (HttpMethod$1 = {}));

    class HttpRequest {
        constructor(xhr, descriptor) {
            this.xhr = xhr;
            this.method = descriptor.method;
            this.url = descriptor.url;
            this.headers = descriptor.headers;
            this.queryParams = descriptor.queryParams;
            this.data = descriptor.data;
        }
        setHeader(name, value) {
            this.headers[name] = value;
        }
        setQueryParam(name, value) {
            this.queryParams[name] = value;
        }
        getXMLHttpRequest() {
            return this.xhr;
        }
        getResponseHeaders() {
            if (this.xhr.readyState == this.xhr.HEADERS_RECEIVED) {
                const headers = this.xhr.getAllResponseHeaders();
                const arr = headers.trim().split(/[\r\n]+/);
                // Create a map of header names to values
                const headerMap = {};
                for (const line of arr) {
                    const parts = line.split(': ');
                    const header = parts.shift();
                    const value = parts.join(': ');
                    headerMap[header] = value;
                }
                return headerMap;
            }
            return {};
        }
        open() {
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
        abort() {
            this.xhr.abort();
        }
    }

    var utils$1;
    (function (utils) {
        function getAllDataTypes() {
            return Object.values(DataType$1).filter(item => typeof item === "number");
        }
        utils.getAllDataTypes = getAllDataTypes;
        function getDateDataTypes() {
            return [DataType$1.Time, DataType$1.Date, DataType$1.DateTime];
        }
        utils.getDateDataTypes = getDateDataTypes;
        function getStringDataTypes() {
            return [DataType$1.String, DataType$1.Memo, DataType$1.FixedChar];
        }
        utils.getStringDataTypes = getStringDataTypes;
        const _numericTypes = [DataType$1.Byte, DataType$1.Word, DataType$1.Int32,
            DataType$1.Int64, DataType$1.Float, DataType$1.Currency, DataType$1.Autoinc];
        function getNumericDataTypes() {
            return _numericTypes;
        }
        utils.getNumericDataTypes = getNumericDataTypes;
        const _intTypes = [DataType$1.Byte, DataType$1.Word, DataType$1.Int32, DataType$1.Int64, DataType$1.Autoinc];
        //-------------- object functions -------------------
        /**
         * Copy the content of all objests passed in `args` parameters into `target`
         * and returns the result
         * NB: This function copies only the first level properties.
         * For a deep copy please use `assignDeep`
         * @param target - the target object
         * @param args  - an array of the source objects
         */
        function assign(target, ...args) {
            for (let i = 0; i < args.length; i++) {
                let source = args[i];
                if (source) {
                    for (let key in source) {
                        if (source.hasOwnProperty(key)) {
                            target[key] = source[key];
                        }
                    }
                }
            }
            return target;
        }
        utils.assign = assign;
        /**
         * Copy the content of all objests passed in `args` parameters into `target`
         * and returns the result
         * NB: This function make a deep copy -
         * so `assignDeep` will be called recursively for all object properties
         * on the first level.
         * @param target - the target object
         * @param sources  - an array of the source objects
         */
        function assignDeep(target, ...sources) {
            return assignDeepCore(new WeakMap(), target, sources);
        }
        utils.assignDeep = assignDeep;
        function assignDeepCore(hashSet, target, sources) {
            if (!target) {
                target = {};
            }
            for (let source of sources) {
                if (source) {
                    for (let key in source) {
                        if (source.hasOwnProperty(key)) {
                            let sourceVal = source[key];
                            if (sourceVal !== null && typeof sourceVal === 'object') {
                                if (hashSet.has(sourceVal)) {
                                    target[key] = hashSet.get(sourceVal);
                                }
                                else {
                                    if (Array.isArray(sourceVal)) {
                                        target[key] = createArrayFrom(sourceVal);
                                        hashSet.set(sourceVal, target[key]);
                                    }
                                    else {
                                        if (typeof target[key] == 'undefined' || target[key] == null) {
                                            target[key] = Object.create(Object.getPrototypeOf(sourceVal));
                                        }
                                        hashSet.set(sourceVal, target[key]);
                                        assignDeepCore(hashSet, target[key], [sourceVal]);
                                    }
                                }
                            }
                            else {
                                target[key] = sourceVal;
                            }
                        }
                    }
                }
            }
            return target;
        }
        function getIfDefined(value, defaultValue) {
            return (typeof value !== 'undefined') ? value : defaultValue;
        }
        utils.getIfDefined = getIfDefined;
        function IsDefinedAndNotNull(value) {
            return typeof value !== 'undefined' && value !== null;
        }
        utils.IsDefinedAndNotNull = IsDefinedAndNotNull;
        function copyArrayTo(collection1, collection2) {
            const len1 = collection1.length;
            const len2 = collection2.length;
            for (let i = 0; i < len1 && i < len2; i++) {
                collection2[i] = collection1[i];
            }
        }
        utils.copyArrayTo = copyArrayTo;
        function createArrayFrom(collection) {
            let result = [];
            for (let item of collection) {
                result.push(item);
            }
            return result;
        }
        utils.createArrayFrom = createArrayFrom;
        /**
         * Searches an array of the objects which implement ItemWithId by ID
         * Returs the found object or null.
         * @param array
         * @param id
         */
        function findItemById(array, id) {
            var arrLength = array.length;
            for (var idx = 0; idx < arrLength; idx++) {
                if (array[idx].id === id)
                    return array[idx];
            }
            return null;
        }
        utils.findItemById = findItemById;
        function findItemIndexById(array, id) {
            var arrLength = array.length;
            for (var idx = 0; idx < arrLength; idx++) {
                if (array[idx].id === id)
                    return idx;
            }
            return -1;
        }
        utils.findItemIndexById = findItemIndexById;
        /**
         * Searches an array of the objects which implement ItemWithId by ID
         * Returs the index of the found element, or -1 if nothing was found.
         * @param array
         * @param id
         */
        function indexOfArrayItem(arr, item) {
            if (arr.indexOf) {
                return arr.indexOf(item);
            }
            else {
                let len = arr.length;
                for (let i = 0; i < len; i++) {
                    if (item == arr[i]) {
                        return i;
                    }
                }
                return -1;
            }
        }
        utils.indexOfArrayItem = indexOfArrayItem;
        /**
         * Moves an item in some array to a new position
         * @param array
         * @param index1
         * @param index2
         */
        function moveArrayItem(array, index1, index2) {
            if (index1 >= array.length) {
                throw 'Index out of bounds: ' + index1;
            }
            if (index2 >= array.length) {
                index2 = array.length - 1;
            }
            let item = array.splice(index1, 1)[0];
            array.splice(index2, 0, item);
        }
        utils.moveArrayItem = moveArrayItem;
        /**
         * Searches for a particular item in the array are removes that item if found.
         * @param arr
         * @param value
         */
        function removeArrayItem(arr, value) {
            let index = arr.indexOf(value);
            if (index != -1) {
                return arr.splice(index, 1)[0];
            }
        }
        utils.removeArrayItem = removeArrayItem;
        function insertArrayItem(arr, index, value) {
            arr.splice(index, 0, value);
        }
        utils.insertArrayItem = insertArrayItem;
        function fillArray(arr, value, start = 0, end) {
            let len = arr.length >>> 0;
            var relativeStart = start >> 0;
            var k = relativeStart < 0 ?
                Math.max(len + relativeStart, 0) :
                Math.min(relativeStart, len);
            var relativeEnd = end === undefined ?
                len : end >> 0;
            let final = relativeEnd < 0 ?
                Math.max(len + relativeEnd, 0) :
                Math.min(relativeEnd, len);
            while (k < final) {
                arr[k] = value;
                k++;
            }
            return arr;
        }
        utils.fillArray = fillArray;
        //------------ DOM utils ------------
        /**
         * Calculates the shift on which we need to move our element horizontally
         * to find current window
         * @param absLeft
         * @param width
         */
        function shiftToFitWindow(absLeft, width) {
            let body = document.getElementsByTagName('body')[0];
            let winWidth = window.innerWidth || document.documentElement.clientWidth || body.clientWidth;
            var absRight = absLeft + width;
            let shift = 0;
            if (absRight > winWidth) {
                shift = winWidth - absRight - 10;
                if (absLeft + shift < 0) {
                    shift = 10 - absLeft;
                }
            }
            return shift;
        }
        utils.shiftToFitWindow = shiftToFitWindow;
        /**
         * Returns `true` if the value passed in the parameter is an object
         * @param val
         */
        function isObject(val) {
            if (val === null) {
                return false;
            }
            return ((typeof val === 'function') || (typeof val === 'object'));
        }
        utils.isObject = isObject;
        /**
         * Returns `true` if the `DataType` value passed in the parameter
         * represents some numeric type
         * @param dtype
         */
        function isNumericType(dtype) {
            const index = _numericTypes.indexOf(dtype);
            return (index >= 0);
        }
        utils.isNumericType = isNumericType;
        /**
         * Returns `true` if the `DataType` value passed in the parameter
         * represents some numeric type
         * @param dtype
         */
        function isIntType(dtype) {
            const index = _intTypes.indexOf(dtype);
            return (index >= 0);
        }
        utils.isIntType = isIntType;
        /**
         * Returns `true` if the value passed in the parameter is an a numeric value
         * @param val
         */
        function isNumeric(val) {
            return !isNaN(parseFloat(val)) && isFinite(val);
        }
        utils.isNumeric = isNumeric;
        /**
         * Returns `true` if two data types  passed in parameters
         * are compatible - so it's safe to copy the values between
         * two expressions with these two types
         * @param type1
         * @param type2
         */
        function areCompatibleDataTypes(type1, type2) {
            return typeof type1 == "undefined" || typeof type2 == "undefined" || type1 == DataType$1.Unknown || type2 == DataType$1.Unknown
                || (type1 == type2) || (type1 == DataType$1.Date && type2 == DataType$1.DateTime)
                || (type1 == DataType$1.DateTime && type2 == DataType$1.Date);
        }
        utils.areCompatibleDataTypes = areCompatibleDataTypes;
        /**
         * Returns `true` if the property with named `propName`
         * in the object `obj` has some value
         * @param obj
         * @param propName
         */
        function isPropSet(obj, propName) {
            return obj[propName] || obj[propName.toLowerCase()] || obj[propName.toUpperCase()];
        }
        utils.isPropSet = isPropSet;
        //-------------- ID generator -----------
        const prefixIdLen = 4;
        const symbols = "0123456789abcdefghijklmnopqrstuvwxyz";
        const magicTicks = 636712160627685350;
        /**
         * Generates an unique ID
         */
        function generateId(prefix) {
            if (!prefix) {
                prefix = 'easy';
            }
            let prfx = (prefix.length > prefixIdLen) ? squeezeMoniker(prefix, prefixIdLen) : prefix;
            if (prfx && prfx.length > 0) {
                prfx += "-";
            }
            //adding 3 random symbols
            var randCharPart = symbols[getRandomInt(0, symbols.length)] +
                symbols[getRandomInt(0, symbols.length)] +
                symbols[getRandomInt(0, symbols.length)];
            var randInt = getRandomInt(0, 10000);
            //generating main ID part 
            //it's a 36-base representation of some random number based on current value of ticks
            let ticksNum36 = intToNumBase(getNowTicks() - magicTicks - randInt);
            return prfx + randCharPart + ticksNum36;
        }
        utils.generateId = generateId;
        function intToNumBase(value, targetBase = 36) {
            var buffer = '';
            var rest = value;
            do {
                buffer = symbols[rest % targetBase] + buffer;
                rest = Math.floor(rest /= targetBase);
            } while (rest > 0);
            return buffer;
        }
        function squeezeMoniker(str, maxlen) {
            let parts = str.split('-');
            let pml = 1;
            let ptt = maxlen;
            if (parts.length < maxlen) {
                pml = maxlen / parts.length;
                ptt = parts.length;
            }
            let result = "";
            for (let i = 0; i < ptt; i++) {
                result += squeeze(parts[i], pml);
            }
            return result;
        }
        function squeeze(str, maxlen) {
            const len = str.length;
            if (len > maxlen) {
                let step = len / maxlen;
                let result = "";
                result += str[0];
                let nextIndex = step;
                let ch;
                for (let i = 1; i < len; i++) {
                    ch = str[i];
                    if (i + 1 > nextIndex) {
                        result += ch;
                        nextIndex += step;
                    }
                }
                return result;
            }
            else {
                return str;
            }
        }
        function getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min)) + min;
        }
        function getNowTicks() {
            return (621355968e9 + (new Date()).getTime() * 1e4);
        }
        function safeParseInt(str) {
            const res = parseInt(str);
            if (isNaN(res))
                throw `"${str}" is not a valid number`;
            return res;
        }
        function getDaysInMonth(month, year) {
            return new Date(year, month + 1, 0).getDate();
        }
        // ------------- date/time functions -------------------
        // TO DO: improve to process all datetime cases
        function strToDateTime(value, format) {
            if (!value || value.length == 0)
                return new Date();
            const normalizedValue = value.replace(/[^a-zA-Z0-9_]/g, '-');
            const normalizedFormat = format.replace(/[^a-zA-Z0-9_]/g, '-');
            const formatItems = normalizedFormat.split('-');
            const dateItems = normalizedValue.split('-');
            const monthIndex = formatItems.indexOf("MM");
            const dayIndex = formatItems.indexOf("dd");
            const yearIndex = formatItems.indexOf("yyyy");
            const hourIndex = formatItems.indexOf("HH");
            const minutesIndex = formatItems.indexOf("mm");
            const secondsIndex = formatItems.indexOf("ss");
            const today = new Date();
            try {
                const year = yearIndex > -1 && yearIndex < dateItems.length
                    ? safeParseInt(dateItems[yearIndex])
                    : today.getFullYear();
                const month = monthIndex > -1 && monthIndex < dateItems.length
                    ? safeParseInt(dateItems[monthIndex]) - 1
                    : today.getMonth() - 1;
                if (month > 11)
                    throw '';
                const day = dayIndex > -1 && dayIndex < dateItems.length
                    ? safeParseInt(dateItems[dayIndex])
                    : today.getDate();
                if (day > getDaysInMonth(month, year))
                    throw '';
                const hour = hourIndex > -1 && hourIndex < dateItems.length
                    ? safeParseInt(dateItems[hourIndex])
                    : 0;
                if (hour > 23)
                    throw '';
                const minute = minutesIndex > -1 && minutesIndex < dateItems.length
                    ? safeParseInt(dateItems[minutesIndex])
                    : 0;
                if (minute > 59)
                    throw '';
                const second = secondsIndex > -1 && secondsIndex < dateItems.length
                    ? safeParseInt(dateItems[secondsIndex])
                    : 0;
                if (second > 59)
                    throw '';
                return new Date(year, month, day, hour, minute, second);
            }
            catch (_a) {
                throw `${value} is not a valid date.`;
            }
        }
        utils.strToDateTime = strToDateTime;
        function strToTime(str) {
            const timeItems = str.split(':');
            try {
                const hour = timeItems.length > 0 ? safeParseInt(timeItems[0]) : 0;
                if (hour > 23)
                    throw '';
                const minute = timeItems.length > 1 ? safeParseInt(timeItems[1]) : 0;
                if (minute > 59)
                    throw '';
                const second = timeItems.length > 1 ? safeParseInt(timeItems[1]) : 0;
                if (second > 59)
                    throw '';
                return new Date(0, 0, 0, hour, minute, second);
            }
            catch (_a) {
                throw `${str} is not a valid time.`;
            }
        }
        utils.strToTime = strToTime;
    })(utils$1 || (utils$1 = {}));

    class HttpActionResult {
        constructor(request, promise) {
            this.request = request;
            this.promise = promise;
        }
        getPromise() {
            return this.promise;
        }
        getRequest() {
            return this.request;
        }
        then(onfulfilled, onrejected) {
            return this.promise.then(onfulfilled, onrejected);
        }
        catch(onrejected) {
            return this.promise.catch(onrejected);
        }
        finally(onfinally) {
            return this.promise.finally(onfinally);
        }
    }

    class HttpResponseError extends Error {
        constructor(status, message) {
            super(message);
            this.status = status;
        }
    }
    class HttpClient {
        /** Gets the response body for the latest request  */
        get responseBody() {
            return this._responseBody;
        }
        constructor() {
            this.defaultHeaders = {};
            this.customPayload = undefined;
        }
        get(url, options) {
            return this.send(HttpMethod$1.Get, url, null, options);
        }
        post(url, data, options) {
            return this.send(HttpMethod$1.Post, url, data, options);
        }
        put(url, data, options) {
            return this.send(HttpMethod$1.Put, url, data, options);
        }
        delete(url, data, options) {
            return this.send(HttpMethod$1.Delete, url, data, options);
        }
        send(method, url, data, options) {
            options = options || {};
            const dataType = options.dataType || 'json';
            const contentType = options.contentType || (dataType !== 'form-data')
                ? 'application/json'
                : null;
            if (data && dataType != 'form-data' && this.customPayload) {
                data.data = utils$1.assignDeep(data.data || {}, this.customPayload);
            }
            const XHR = ('onload' in new XMLHttpRequest())
                ? XMLHttpRequest
                : window["XDomainRequest"]; //IE support
            const xhr = new XHR();
            const desc = {
                method: method,
                url: url,
                headers: Object.assign(Object.assign({}, this.defaultHeaders), options.headers || {}),
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
            return new HttpActionResult(request, new Promise((resolve, reject) => {
                if (options.responseType)
                    xhr.responseType = options.responseType;
                xhr.onerror = (error) => {
                    reject(new HttpResponseError(xhr.status, xhr.responseText));
                };
                xhr.onreadystatechange = () => {
                    if (xhr.readyState != 4)
                        return; //we process only the state change to DONE(4)
                    const responseContentType = xhr.getResponseHeader('Content-Type') || '';
                    const status = xhr.status;
                    if (status === 0) {
                        reject(new HttpResponseError(status, "Network error or the request was aborted"));
                    }
                    else if (status >= 200 && status < 400) {
                        //Success
                        const responseObj = (xhr.responseType === 'arraybuffer' || xhr.responseType === 'blob')
                            ? xhr.response
                            : (responseContentType.indexOf('application/json') == 0
                                ? JSON.parse(xhr.responseText)
                                : xhr.responseText);
                        this._responseBody = responseObj;
                        if (this.onResponse) {
                            this.onResponse(xhr);
                        }
                        resolve(responseObj);
                    }
                    else {
                        //Error
                        const rtPromise = (xhr.responseType === 'arraybuffer' || xhr.responseType === 'blob')
                            ? HttpClient.decodeArrayBuffer(xhr.response)
                            : Promise.resolve(xhr.responseText);
                        rtPromise.then(responseText => {
                            const responseObj = (responseContentType.indexOf('application/json') == 0)
                                ? JSON.parse(responseText)
                                : responseText;
                            this._responseBody = responseObj;
                            const message = responseObj.message ||
                                (status == 404
                                    ? `No such endpoint: ${url}`
                                    : responseObj);
                            reject(new HttpResponseError(status, message));
                        });
                    }
                };
                xhr.send(dataToSend);
            }));
        }
        static decodeArrayBuffer(uintArray) {
            var reader = new FileReader();
            return new Promise((resolve) => {
                reader.onloadend = function () {
                    if (reader.readyState == FileReader.DONE) {
                        resolve(reader.result);
                    }
                };
                reader.readAsText(new Blob([uintArray]));
            });
        }
    }

    /**
     * Contains internatialization functionality.
     */
    var i18n$1;
    (function (i18n) {
        let englishUSLocaleSettings = {
            shortDateFormat: 'MM/dd/yyyy',
            longDateFormat: 'dd MMM, yyyy',
            editDateFormat: 'MM/dd/yyyy',
            shortTimeFormat: 'HH:mm',
            editTimeFormat: 'HH:mm',
            longTimeFormat: 'HH:mm:ss',
            shortMonthNames: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            longMonthNames: ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'],
            shortWeekDayNames: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            longWeekDayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            decimalSeparator: '.',
            currency: 'USD'
        };
        let defaultLocale = {
            localeId: 'en-US',
            englishName: 'English',
            displayName: 'English',
            texts: {
                ButtonOK: 'OK',
                ButtonCancel: 'Cancel',
                Yes: 'Yes',
                No: 'No',
                True: 'True',
                False: 'False'
            },
            settings: englishUSLocaleSettings
        };
        let allLocales = {
            'en-US': defaultLocale
        };
        let currentLocale;
        const mappers = [];
        function mapInfo(info) {
            for (const mapper of mappers) {
                mapper(info);
            }
        }
        function addMapper(mapper) {
            mappers.push(mapper);
        }
        i18n.addMapper = addMapper;
        /**
         * Gets added locales with their names.
         * @returns  The locales.
         */
        function getLocales() {
            let result = [];
            for (let locale in allLocales) {
                result.push({
                    locale: locale,
                    englishName: allLocales[locale].englishName,
                    displayName: allLocales[locale].displayName
                });
            }
            return result.sort((a, b) => {
                if (a.englishName > b.englishName) {
                    return 1;
                }
                else if (a.englishName === b.englishName) {
                    return 0;
                }
                return -1;
            });
        }
        i18n.getLocales = getLocales;
        /**
         * Gets the current locale ID.
         * @returns The locale.
         */
        function getCurrentLocale() {
            return currentLocale.localeId;
        }
        i18n.getCurrentLocale = getCurrentLocale;
        /**
        * Sets the curent locale.
        * @deprecated Use setCurrentLocale instead
        * @param l The locale.
        */
        function setLocale(l) {
            console.warn('This method is deprecated. Use setCurrentLocale instead');
            setCurrentLocale(l);
        }
        i18n.setLocale = setLocale;
        /**
         * Sets the curent locale.
         * @param localeId The locale.
         */
        function setCurrentLocale(localeId) {
            const newLocale = allLocales[localeId];
            if (newLocale) {
                utils$1.assignDeep(currentLocale, newLocale);
            }
            else {
                currentLocale.englishName = localeId;
                currentLocale.displayName = localeId;
                currentLocale.texts = utils$1.assignDeep({}, defaultLocale.texts);
            }
            currentLocale.localeId = localeId;
        }
        i18n.setCurrentLocale = setCurrentLocale;
        /**
         * Returns localized text by the key defined in parameter.
         * Here we get the text of the resource string assigned to CmdClickToAddCondition key:
         *
         ```
           const text = i18n.getText('CmdClickToAddCondition')
         ```
         * @param args The keys of the resource string.
         * @returns Text of the resource defined by key or null if the key is not found
         *
         */
        function getText(...args) {
            let textsObj = currentLocale.texts;
            let resText = '';
            if (args && args.length) {
                const argLength = args.length;
                for (let i = 0; i < argLength; i++) {
                    resText = textsObj[args[i]];
                    if (typeof resText === 'object') {
                        textsObj = resText;
                    }
                    else {
                        break;
                    }
                }
            }
            return resText;
        }
        i18n.getText = getText;
        function getLocaleSettings() {
            return currentLocale.settings;
        }
        i18n.getLocaleSettings = getLocaleSettings;
        function getOneLocaleSetting(key) {
            return currentLocale.settings[key];
        }
        i18n.getOneLocaleSetting = getOneLocaleSetting;
        function getShortMonthName(monthNum) {
            const settings = getLocaleSettings();
            if (monthNum > 0 && monthNum < 13) {
                return settings.shortMonthNames[monthNum - 1];
            }
            else {
                throw 'Wrong month number: ' + monthNum;
            }
        }
        i18n.getShortMonthName = getShortMonthName;
        function getLongMonthName(monthNum) {
            const settings = getLocaleSettings();
            if (monthNum > 0 && monthNum < 13) {
                return settings.longMonthNames[monthNum - 1];
            }
            else {
                throw 'Wrong month number: ' + monthNum;
            }
        }
        i18n.getLongMonthName = getLongMonthName;
        function getShortWeekDayName(dayNum) {
            const settings = getLocaleSettings();
            if (dayNum > 0 && dayNum < 8) {
                return settings.shortWeekDayNames.length >= dayNum
                    ? settings.shortWeekDayNames[dayNum - 1]
                    : dayNum.toString();
            }
            else {
                throw 'Wrong month number: ' + dayNum;
            }
        }
        i18n.getShortWeekDayName = getShortWeekDayName;
        function getLongWeekDayName(dayNum) {
            const settings = getLocaleSettings();
            if (dayNum > 0 && dayNum < 8) {
                return settings.longWeekDayNames.length >= dayNum
                    ? settings.longWeekDayNames[dayNum - 1]
                    : dayNum.toString();
            }
            else {
                throw 'Wrong month number: ' + dayNum;
            }
        }
        i18n.getLongWeekDayName = getLongWeekDayName;
        /**
         * Updates the locale settings (date/time formats, separators, etc) for the specified locale.
         * @param settingsToUpdate a LocaleSettings object
         */
        function updateLocaleSettings(settingsToUpdate) {
            if (!currentLocale.settings) {
                currentLocale.settings = utils$1.assignDeep({}, englishUSLocaleSettings);
            }
            currentLocale.settings = utils$1.assignDeep(currentLocale.settings, settingsToUpdate);
        }
        i18n.updateLocaleSettings = updateLocaleSettings;
        /**
         * Updates the texts for the current locale
         * @param texts A plain JS object that contains textual resources
         */
        function updateLocaleTexts(texts) {
            if (typeof texts !== 'object') {
                console.error('Wrong parameter type in updateLocaleTexts function call.' +
                    'The first parameter (localeId) is not necessary. Use updateLocaleTexts(texts) instead');
                return;
            }
            mapInfo({ localeId: currentLocale.localeId, texts: texts });
            utils$1.assignDeep(currentLocale.texts, texts);
        }
        i18n.updateLocaleTexts = updateLocaleTexts;
        function updateDefaultTexts(texts) {
            for (let localeId in allLocales) {
                let locale = allLocales[localeId];
                locale.texts = utils$1.assignDeep({}, texts, locale.texts);
            }
            currentLocale.texts = utils$1.assignDeep({}, texts, currentLocale.texts);
        }
        i18n.updateDefaultTexts = updateDefaultTexts;
        /**
         * Updates the information for the specified locale.
         * @param localeId The locale ID (like 'en', 'de', 'uk', etc).
         * If the locale does exist yet - it will be added
         * @param localeInfo  a LocaleInfo object that contains the locale settings and textual resources
         */
        function updateLocaleInfo(localeId, localeData) {
            mapInfo(localeData);
            let localeInfoToUpdate = currentLocale;
            if (localeId) {
                if (!localeData.localeId) {
                    localeData.localeId = localeId;
                }
                localeInfoToUpdate = allLocales[localeId];
                if (!localeInfoToUpdate) {
                    localeInfoToUpdate = utils$1.assignDeep({}, defaultLocale);
                    allLocales[localeId] = localeInfoToUpdate;
                }
            }
            utils$1.assignDeep(localeInfoToUpdate, localeData);
        }
        i18n.updateLocaleInfo = updateLocaleInfo;
        /**
         * Adds the locale.
         * @param localeId The locale ID (like 'en', 'de', 'uk', etc).
         * If the locale does exist yet - it will be created
         * @param localeInfo - a LocaleInfo object that contains the locale settings and textual resources
         */
        function addLocale(localeId, localeInfo) {
            updateLocaleInfo(localeId, localeInfo);
        }
        i18n.addLocale = addLocale;
        /**
         * Overwrites some locale settings (date/time formats) with the formats used in browser's current language
         */
        function determineSettingsByLocale(localeId) {
            const now = new Date(2020, 5, 7, 19, 34, 56, 88);
            const dateOptions = { year: 'numeric', month: 'numeric', day: 'numeric' };
            const timeOptions = { hour: 'numeric', minute: 'numeric', second: 'numeric' };
            const dateStr = now.toLocaleDateString(localeId, dateOptions);
            const timeStr = now.toLocaleTimeString(localeId, timeOptions);
            let dateFormat = dateStr
                .replace('07', 'dd')
                .replace('7', 'd')
                .replace('06', 'MM')
                .replace('6', 'M')
                .replace('2020', 'yyyy')
                .replace('20', 'yy');
            let timeFormat = timeStr
                .replace('19', 'HH')
                .replace('07', 'hh')
                .replace('7', 'h')
                .replace('34', 'mm')
                .replace('56', 'ss')
                .replace('PM', 'tt');
            if (!currentLocale.settings) {
                currentLocale.settings = {};
            }
            const localeSettings = {
                shortDateFormat: dateFormat,
                shortTimeFormat: timeFormat
            };
            updateLocaleSettings(localeSettings);
        }
        function loadBrowserLocaleSettings() {
            const lang = typeof navigator === 'object' ? navigator.language : undefined;
            determineSettingsByLocale(lang);
        }
        function resetLocales() {
            if (!currentLocale) {
                currentLocale = utils$1.assignDeep({}, defaultLocale);
                loadBrowserLocaleSettings();
            }
        }
        i18n.resetLocales = resetLocales;
        const DT_FORMAT_RGEX = /\[([^\]]+)]|y{2,4}|M{1,4}|d{1,2}|H{1,2}|h{1,2}|m{2}|s{2}|t{2}/g;
        /**
         * Returns string representation of the date/time value according to the custom format (second parameter)
         * The format is compatible with the one used in .NET: https://docs.microsoft.com/en-us/dotnet/standard/base-types/custom-date-and-time-format-strings
         * @param date
         * @param format
         */
        function dateTimeToStr(date, format) {
            const year = date.getFullYear();
            const yearStr = year.toString();
            const month = date.getMonth() + 1;
            const day = date.getDate();
            const hour = date.getHours();
            const minute = date.getMinutes();
            const second = date.getSeconds();
            const hour12 = hour % 12 || 12; //the remainder of the division by 12. Or 12 if it's 0
            const isPm = hour > 11;
            const matches = {
                yyyy: yearStr,
                yy: yearStr.substring(yearStr.length - 2),
                MMMM: i18n.getLongMonthName(month),
                MMM: i18n.getShortMonthName(month),
                MM: (month < 10) ? '0' + month : month.toString(),
                M: month.toString(),
                dd: (day < 10) ? '0' + day : day.toString(),
                d: day.toString(),
                HH: (hour < 10) ? '0' + hour : hour.toString(),
                H: hour.toString(),
                hh: (hour12 < 10) ? '0' + hour12 : hour12.toString(),
                h: hour12.toString(),
                tt: isPm ? 'PM' : 'AM',
                mm: (minute < 10) ? '0' + minute : minute.toString(),
                ss: (second < 10) ? '0' + second : second.toString()
            };
            return format.replace(DT_FORMAT_RGEX, (match, $1) => {
                return $1 || matches[match];
            });
        }
        i18n.dateTimeToStr = dateTimeToStr;
        function dateTimeToStrEx(dateTime, dataType, format) {
            if (format) {
                if (format == 'd') {
                    format = buildShortDateTimeFormat(DataType$1.Date);
                }
                else if (format == 'D') {
                    format = buildLongDateTimeFormat(DataType$1.Date);
                }
                else if (format == 'f') {
                    format = buildShortDateTimeFormat(DataType$1.DateTime);
                }
                else if (format == 'F') {
                    format = buildLongDateTimeFormat(DataType$1.DateTime);
                }
            }
            else {
                format = buildShortDateTimeFormat(dataType);
            }
            return dateTimeToStr(dateTime, format);
        }
        i18n.dateTimeToStrEx = dateTimeToStrEx;
        function buildShortDateTimeFormat(dataType) {
            const localeSettings = getLocaleSettings();
            let format;
            switch (dataType) {
                case DataType$1.Date:
                    format = localeSettings.shortDateFormat;
                    break;
                case DataType$1.Time:
                    format = localeSettings.shortTimeFormat;
                    break;
                default:
                    format = localeSettings.shortDateFormat + ' ' + localeSettings.shortTimeFormat;
                    break;
            }
            return format;
        }
        function buildLongDateTimeFormat(dataType) {
            const localeSettings = getLocaleSettings();
            let format;
            switch (dataType) {
                case DataType$1.Date:
                    format = localeSettings.longDateFormat;
                    break;
                case DataType$1.Time:
                    format = localeSettings.longTimeFormat;
                    break;
                default:
                    format = localeSettings.longDateFormat + ' ' + localeSettings.longTimeFormat;
                    break;
            }
            return format;
        }
        /**
        * Converts a numeric value to the string taking into the account the decimal separator
        * @param value - the number to convert
        * @param format - the format of the number representation (D - decimal, F - float, C - currency)
        * @param decimalSeparator - the symbol that represents decimal separator. If not specified the function gets the one from the current locale settings.
        */
        function numberToStr(number, format, decimalSeparator) {
            if (format && format.length > 0) {
                const type = format.charAt(0).toUpperCase();
                if (type === 'S') {
                    return formatWithSequence(number, format.slice(1));
                }
                else if (['D', 'F', 'C'].indexOf(type) >= 0) {
                    const locale = getCurrentLocale();
                    return number.toLocaleString(locale, getNumberFormatOptions(format));
                }
                else {
                    return convertWithMask(Math.trunc(number), format);
                }
            }
            const localeSettings = getLocaleSettings();
            decimalSeparator = decimalSeparator || localeSettings.decimalSeparator;
            return number.toString().replace('.', decimalSeparator);
        }
        i18n.numberToStr = numberToStr;
        function booleanToStr(bool, format) {
            if (format && format.length > 0) {
                const type = format.charAt(0).toUpperCase();
                if (type === 'S') {
                    const values = format.slice(1).split('|');
                    if (values.length > 1) {
                        const value = values[(bool) ? 1 : 0];
                        return i18n.getText(value) || value;
                    }
                }
            }
            return `${bool}`;
        }
        i18n.booleanToStr = booleanToStr;
        const cachedSequenceFormats = {};
        function formatWithSequence(number, format) {
            if (!cachedSequenceFormats[format]) {
                // parse and save in cache format values 
                const values = format.split('|')
                    .filter(v => v.length > 0)
                    .map(v => v.split('='));
                cachedSequenceFormats[format] = {};
                if (values.length > 0) {
                    if (values[0].length > 1) {
                        for (const value of values) {
                            cachedSequenceFormats[format][Number.parseInt(value[1])] = value[0];
                        }
                    }
                    else {
                        values.forEach((value, index) => {
                            cachedSequenceFormats[format][index] = value[0];
                        });
                    }
                }
            }
            const values = cachedSequenceFormats[format];
            if (values[number] !== undefined) {
                const value = values[number];
                return i18n.getText(value) || value;
            }
            return number.toString();
        }
        function convertWithMask(number, mask) {
            let value = number.toString();
            let result = '';
            let index = value.length - 1;
            for (let i = mask.length - 1; i >= 0; i--) {
                const ch = mask.charAt(i);
                if (ch === '#' || ch === '0') {
                    if (index >= 0) {
                        result += value.charAt(index);
                        index--;
                    }
                    else {
                        if (ch === '0') {
                            result += 0;
                        }
                    }
                }
                else {
                    result += ch;
                }
            }
            return result.split('').reverse().join('');
        }
        function getNumberFormatOptions(format) {
            const localeSettings = getLocaleSettings();
            const type = format[0].toUpperCase();
            const digits = (format.length > 1)
                ? Number.parseInt(format.slice(1))
                : type == 'D' ? 1 : 2;
            switch (type) {
                case 'D':
                    return {
                        style: 'decimal',
                        useGrouping: false,
                        minimumIntegerDigits: digits
                    };
                case 'C':
                    return {
                        style: 'currency',
                        currency: localeSettings.currency,
                        minimumFractionDigits: digits
                    };
                default:
                    return {
                        style: 'decimal',
                        minimumFractionDigits: digits,
                        maximumFractionDigits: digits
                    };
            }
        }
    })(i18n$1 || (i18n$1 = {}));

    /**
     * Represents one entity.
     */
    class MetaEntity {
        /** The default constructor. */
        constructor(parent) {
            /** Returns false if this entity is read-only */
            this.isEditable = true;
            this.name = "";
            this.caption = "";
            this.description = "";
            this.parent = parent;
            this.attributes = new Array();
            this.subEntities = new Array();
        }
        /**
        * Loads entity from its JSON representation object.
        * @param model The Data Model.
        * @param dto The JSON representation object.
        */
        loadFromData(model, dto) {
            if (dto) {
                this.id = dto.id;
                this.name = dto.name;
                this.captionPlural = dto.namePlur;
                this.caption = dto.name;
                this.description = dto.desc;
                if (typeof (dto.ied) !== 'undefined')
                    this.isEditable = dto.ied;
                this.subEntities = new Array();
                if (dto.ents) {
                    for (let i = 0; i < dto.ents.length; i++) {
                        let newEntity = model.createEntity(this);
                        newEntity.loadFromData(model, dto.ents[i]);
                        this.subEntities.push(newEntity);
                    }
                }
                this.attributes = new Array();
                if (dto.attrs) {
                    for (let i = 0; i < dto.attrs.length; i++) {
                        let newAttr = model.createEntityAttr(this);
                        newAttr.loadFromData(model, dto.attrs[i]);
                        this.attributes.push(newAttr);
                    }
                }
            }
        }
        scan(processAttribute, processEntity) {
            let opts = { stop: false };
            let internalProcessEntity = (entity) => {
                if (processEntity)
                    processEntity(entity, opts);
                if (entity.attributes) {
                    let attrCount = entity.attributes.length;
                    for (let i = 0; (i < attrCount) && !opts.stop; i++) {
                        let attr = entity.attributes[i];
                        if (processAttribute) {
                            processAttribute(attr, opts);
                        }
                        if (opts.stop)
                            return;
                    }
                }
                if (entity.subEntities) {
                    let subEntityCount = entity.subEntities.length;
                    for (let i = 0; (i < subEntityCount) && !opts.stop; i++) {
                        internalProcessEntity(entity.subEntities[i]);
                    }
                }
            };
            internalProcessEntity(this);
        }
        getFirstPrimaryAttr() {
            return this.getPrimaryAttrs()[0];
        }
        getPrimaryAttrs() {
            return this.attributes.filter(attr => attr.isPrimaryKey);
        }
    }
    class MetaEntityAttr {
        /** The default constructor. */
        constructor(entity) {
            this.id = "";
            this.caption = "{Unrecognized attribute}";
            this.dataType = DataType$1.String;
            this.size = 0;
            this.isPrimaryKey = false;
            this.isForeignKey = false;
            this.isNullable = true;
            this.showOnView = true;
            this.isEditable = true;
            this.showOnCreate = true;
            this.showOnEdit = true;
            this.showInLookup = false;
            this.lookupAttr = "";
            this.expr = "";
            this.entity = entity;
            this.kind = EntityAttrKind$1.Data;
        }
        /**
         * Loads entity attribute from JSON representation object.
         * @param model The Data Model.
         * @param dto The JSON representation object.
         */
        loadFromData(model, dto) {
            if (dto) {
                this.id = dto.id;
                this.description = dto.desc;
                this.caption = dto.cptn;
                this.dataType = dto.dtype;
                this.isPrimaryKey = dto.ipk;
                this.isForeignKey = dto.ifk;
                this.size = dto.size;
                this.lookupAttr = dto.lattr;
                this.lookupEntity = dto.lent;
                this.dataAttr = dto.dattr;
                this.lookupDataAttr = dto.ldattr;
                const isDataType = utils$1.getDateDataTypes().indexOf(this.dataType);
                this.defaultValue = dto.defVal && isDataType ? new Date(dto.defVal) : dto.defVal;
                this.isNullable = utils$1.getIfDefined(dto.nul, this.isNullable);
                this.isEditable = utils$1.getIfDefined(dto.ied, this.isEditable);
                this.showOnView = utils$1.getIfDefined(dto.ivis || dto.sov, this.showOnView);
                this.showOnCreate = utils$1.getIfDefined(dto.soc, this.showOnCreate);
                this.showOnEdit = utils$1.getIfDefined(dto.soe, this.showOnEdit);
                this.showInLookup = utils$1.getIfDefined(dto.sil, this.showInLookup);
                this.kind = dto.kind;
                this.displayFormat = dto.dfmt;
                if (dto.udata)
                    this.userData = dto.udata;
                if (dto.edtr) {
                    this.defaultEditor = model.getEditorById(dto.edtr) || model.createValueEditor();
                }
            }
        }
    }

    /**
     * Represents a value editor.
     */
    class ValueEditor {
        /** The default constructor. */
        constructor() {
            this.id = "";
            this.tag = EditorTag.Unknown;
            this.resType = DataType$1.Unknown;
            this.defValue = "";
        }
        /**
         * Loads value editor from its JSON representation object.
         * @param data The JSON representation object.
         */
        loadFromData(data) {
            if (data) {
                this.id = data.id;
                this.tag = data.tag;
                this.defValue = data.defval;
                this.resType = data.rtype;
                this.accept = data.accept;
                this.multiline = data.multiline;
                if (data.subType) {
                    this.resType = data.subType;
                }
                if (data.name) {
                    this.name = data.name;
                }
                if (data.values) {
                    this.values = data.values;
                }
            }
        }
        getValueText(value) {
            let result = "";
            if (!this.values)
                return result;
            if (Array.isArray(value)) {
                for (let item of this.values) {
                    if (value.indexOf(item.id) >= 0) {
                        result += item.text + ',';
                    }
                }
            }
            else {
                for (let item of this.values) {
                    if (item.id === value) {
                        result += item.text + ',';
                    }
                }
            }
            if (result) {
                result = result.substring(0, result.length - 1);
            }
            return result;
        }
    }

    /**
     * Represents a data model
     */
    class MetaData {
        /** The default constructor. */
        constructor() {
            this.mainEntity = null;
            this.id = '__none';
            this.name = 'Empty model';
            this.rootEntity = this.createEntity();
            this.displayFormats = new Map();
        }
        /**
         * Gets the main entity of model
         * @return The main entity.
         */
        getMainEntity() {
            return this.mainEntity;
        }
        createEntity(parent) {
            return new MetaEntity(parent);
        }
        createEntityAttr(parent) {
            return new MetaEntityAttr(parent);
        }
        createValueEditor() {
            return new ValueEditor();
        }
        /**
         * Loads data model from JSON.
         * @param stringJson The JSON string.
         */
        loadFromJSON(stringJson) {
            let model = JSON.parse(stringJson);
            this.loadFromData(model);
        }
        /**
         * Loads data model from its JSON representation object.
         * @param data The JSON representation object.
         */
        loadFromData(data) {
            this.id = data.id;
            this.name = data.name;
            this.version = data.vers;
            //Editors
            this.editors = new Array();
            if (data.editors) {
                for (let i = 0; i < data.editors.length; i++) {
                    let newEditor = this.createValueEditor();
                    newEditor.loadFromData(data.editors[i]);
                    this.editors.push(newEditor);
                }
            }
            //rootEntity
            this.rootEntity.loadFromData(this, data.entroot);
            //DataFormats
            this.displayFormats = new Map();
            if (data.displayFormats) {
                for (const dtypeStr in data.displayFormats) {
                    const dtype = DataType$1[dtypeStr];
                    const formats = data.displayFormats[dtypeStr] || new Array();
                    this.displayFormats.set(dtype, formats);
                }
            }
        }
        /**
         * Gets the display formats.
         * @returns The display formats.
         */
        getDisplayFormats() {
            return this.displayFormats;
        }
        /**
         * Gets the display formats for type
         * @param type The type
         * @returns An array of display formats
         */
        getDisplayFormatsForType(type) {
            if (this.displayFormats.has(type)) {
                return this.displayFormats.get(type);
            }
            return [];
        }
        /**
         * Gets the default display format for the provided type
         * @param type The type
         * @returns The default type format or null
         */
        getDefaultFormat(type) {
            if (this.displayFormats.has(type)) {
                return this.displayFormats.get(type).filter(f => f.isdef)[0];
            }
            return null;
        }
        /**
         * Sets data to data model.
         * @param model Its JSON representation object or JSON string.
         */
        setData(model) {
            if (typeof model === 'string') {
                this.loadFromJSON(model);
            }
            else {
                this.loadFromData(model);
            }
        }
        /**
         * Checks wether the data model is empty.
         * @returns `true` if the data model is empty, otherwise `false`.
         */
        isEmpty() {
            return this.rootEntity.subEntities.length === 0 && this.rootEntity.attributes.length === 0;
        }
        /**
         * Gets ID of the data model.
         * @returns The ID.
         */
        getId() {
            return this.id;
        }
        /**
         * Gets name of the data model.
         * @returns The name.
         */
        getName() {
            return this.name;
        }
        /**
         * Gets root entity of the data model.
         * @returns The root entity.
         */
        getRootEntity() {
            return this.rootEntity;
        }
        /**
         * Finds editor by its ID.
         * @param editorId The editor ID.
         * @returns The value editor or `null`.
         */
        getEditorById(editorId) {
            for (let editor of this.editors) {
                if (editor.id === editorId) {
                    return editor;
                }
            }
            return null;
        }
        /**
         * Gets entity attribute by its ID.
         * This function runs through all attributes inside specified model (it's root entity and all its sub-entities).
         * @param attrId The attribute ID.
         * @returns The attribute or `null`.
         */
        getAttributeById(attrId) {
            let attr = this.getEntityAttrById(this.getRootEntity(), attrId);
            if (!attr) {
                return null;
            }
            return attr;
        }
        /**
         * Checks wether attribute contains such property.
         * @param attrId The attribute ID.
         * @param propName The property name.
         * @returns `true` if the attribute contains the property, otherwise `false`.
         */
        checkAttrProperty(attrId, propName) {
            let attribute = this.getAttributeById(attrId);
            if (attribute) {
                if (typeof attribute[propName] === 'undefined') {
                    throw 'No such property: ' + propName;
                }
                if (attribute[propName]) {
                    return true;
                }
                else if (attribute.lookupAttr) {
                    attrId = attribute.lookupAttr;
                    attribute = this.getAttributeById(attrId);
                    return attribute && attribute[propName];
                }
                else {
                    return false;
                }
            }
            else
                return false;
        }
        /**
         * Gets entity attribute by its ID.
         * This function runs through all attributes inside specified entity and all its sub-entities.
         * @param entity
         * @param attrId
         * @returns The attribute or `null`.
         */
        getEntityAttrById(entity, attrId) {
            let idx;
            if (entity.attributes) {
                let attrCount = entity.attributes.length;
                for (idx = 0; idx < attrCount; idx++) {
                    if (entity.attributes[idx].id == attrId) {
                        return entity.attributes[idx];
                    }
                }
            }
            let res;
            if (entity.subEntities) {
                let subEntityCount = entity.subEntities.length;
                for (idx = 0; idx < subEntityCount; idx++) {
                    res = this.getEntityAttrById(entity.subEntities[idx], attrId);
                    if (res)
                        return res;
                }
            }
            return null;
        }
        listByEntityWithFilter(entity, filterFunc) {
            let result = new Array();
            let caption;
            let ent = null;
            if (entity.subEntities) {
                let subEntityCount = entity.subEntities.length;
                for (let entIdx = 0; entIdx < subEntityCount; entIdx++) {
                    ent = entity.subEntities[entIdx];
                    if (!filterFunc || filterFunc(ent, null)) {
                        caption = i18n$1.getText('Entities', ent.name);
                        if (!caption) {
                            caption = ent.caption;
                        }
                        let newEnt = utils$1.assign(this.createEntity(), { id: ent.name, text: caption, items: [], isEntity: true });
                        newEnt.items = this.listByEntityWithFilter(ent, filterFunc);
                        if (newEnt.items.length > 0)
                            result.push(newEnt);
                    }
                }
            }
            let attr = null;
            if (entity.attributes) {
                let attrCount = entity.attributes.length;
                for (let attrIdx = 0; attrIdx < attrCount; attrIdx++) {
                    attr = entity.attributes[attrIdx];
                    if (!filterFunc || filterFunc(entity, attr)) {
                        caption = i18n$1.getText('Attributes', attr.id);
                        if (!caption)
                            caption = attr.caption;
                        let newEnt = utils$1.assign(this.createEntity(), { id: attr.id, text: caption, dataType: attr.dataType });
                        result.push(newEnt);
                    }
                }
            }
            return result;
        }
        listByEntity(entity, opts, filterFunc) {
            opts = opts || {};
            let resultEntities = [];
            let resultAttributes = [];
            let caption;
            let ent = null;
            if (entity.subEntities) {
                let subEntityCount = entity.subEntities.length;
                for (let entIdx = 0; entIdx < subEntityCount; entIdx++) {
                    ent = entity.subEntities[entIdx];
                    if (!filterFunc || filterFunc(ent, null)) {
                        caption = i18n$1.getText('Entities', ent.name) || ent.caption;
                        let newEnt = utils$1.assign(this.createEntity(), {
                            id: ent.name,
                            text: caption,
                            items: [],
                            isEntity: true,
                            description: ent.description
                        });
                        let newOpts = utils$1.assign({}, opts);
                        newOpts.includeRootData = false;
                        newEnt.items = this.listByEntity(ent, newOpts, filterFunc);
                        if (newEnt.items.length > 0) {
                            resultEntities.push(newEnt);
                        }
                    }
                }
            }
            let attr = null;
            if (entity.attributes) {
                let attrCount = entity.attributes.length;
                for (let attrIdx = 0; attrIdx < attrCount; attrIdx++) {
                    attr = entity.attributes[attrIdx];
                    if (!filterFunc || filterFunc(entity, attr)) {
                        caption = i18n$1.getText('Attributes', attr.id) || attr.caption;
                        resultAttributes.push(utils$1.assign(this.createEntityAttr(entity), {
                            id: attr.id, text: caption,
                            dataType: attr.dataType, lookupAttr: attr.lookupAttr,
                            description: attr.description
                        }));
                    }
                }
            }
            let sortCheck = (a, b) => {
                if (a.text.toLowerCase() == b.text.toLowerCase()) {
                    return 0;
                }
                if (a.text.toLowerCase() > b.text.toLowerCase()) {
                    return 1;
                }
                return -1;
            };
            if (opts.sortEntities) {
                resultEntities.sort(sortCheck);
                resultAttributes.sort(sortCheck);
            }
            let result;
            if (!opts.attrPlacement || opts.attrPlacement == 0) {
                result = resultEntities.concat(resultAttributes);
            }
            else {
                result = resultAttributes.concat(resultEntities);
            }
            if (opts.attrPlacement == 2) {
                result.sort(sortCheck);
            }
            if (opts.includeRootData) {
                caption = i18n$1.getText('Entities', entity.name);
                if (!caption)
                    caption = entity.caption;
                return { id: entity.name, text: caption, items: result };
            }
            else {
                return result;
            }
        }
        /**
         * Clears data model.
         */
        clear() {
            this.rootEntity = this.createEntity();
            this.editors = [];
            this.version = '';
        }
        /**
         * Add default value editors.
         */
        addDefaultValueEditors() {
            let ve;
            ve = this.addOrUpdateValueEditor('_DTE', EditorTag.Edit, DataType$1.String);
            ve.defValue = '';
            this.addOrUpdateValueEditor('_DPDE', EditorTag.DateTime, DataType$1.DateTime);
            this.addOrUpdateValueEditor('_DPTE', EditorTag.DateTime, DataType$1.DateTime);
        }
        /**
        * Add or update a value editor.
        * @param id The id.
        * @param tag The tag.
        * @param resType The result type.
        * @returns The value editor.
        */
        addOrUpdateValueEditor(id, tag, resType) {
            let ve = utils$1.findItemById(this.editors, id);
            if (!ve) {
                ve = this.createValueEditor();
                ve.id = id;
                this.editors.push(ve);
            }
            ve.tag = tag;
            ve.resType = resType;
            return ve;
        }
        /**
         * Gets entities tree.
         * @param opts The options.
         * @param filterFunc The filter function.
         * Takes two parameters, Entity and EntityAttr (second parameter will be null for entities), and returns boolean (true if the corresponding entity or attribute).
         * @returns The tree of the entities and their attributes according to options and the filter function
         */
        getEntitiesTree(opts, filterFunc) {
            return this.listByEntity(this.getRootEntity(), opts, filterFunc);
        }
        /**
         * Gets entities tree due to filter.
         * @param filterFunc The filter function.
         * Takes two parameters, Entity and EntityAttr (second parameter will be null for entities), and returns boolean (true if the corresponding entity or attribute).
         * @returns The tree of the entities and their attributes according to the filter function
         */
        getEntitiesTreeWithFilter(filterFunc) {
            return this.listByEntityWithFilter(this.getRootEntity(), filterFunc);
        }
        /**
         * Finds full entity path by attribute
         * @param attrId The attribute id.
         * @param sep The separator.
         * @returns The path.
         */
        getFullEntityPathByAttr(attrId, sep) {
            sep = sep || ' ';
            return this.getEntityPathByAttr(this.getRootEntity(), attrId, sep, true);
        }
        /**
        * Finds entity path by attribute
        * @param entity The entity.
        * @param attrId The attribute id.
        * @param sep The separator.
        * @param root The root option.
        * @returns The path.
        */
        getEntityPathByAttr(entity, attrId, sep, root) {
            if (!entity)
                return '';
            sep = sep || ' ';
            let entityCaption = '';
            if (entity.caption && !root) {
                let entityText = i18n$1.getText('Entities', entity.caption);
                entityCaption = entityText ? entityText : entity.caption;
            }
            if (entity.attributes) {
                let attrCount = entity.attributes.length;
                for (let i = 0; i < attrCount; i++) {
                    if (entity.attributes[i].id == attrId) {
                        return entityCaption;
                    }
                }
            }
            if (entity.subEntities) {
                let subEntityCount = entity.subEntities.length;
                for (let i = 0; i < subEntityCount; i++) {
                    let ent = entity.subEntities[i];
                    let res = this.getEntityPathByAttr(ent, attrId, sep, false);
                    if (res !== '') {
                        if (entityCaption !== '')
                            res = entityCaption + sep + res;
                        return res;
                    }
                }
            }
            return '';
        }
        /**
         * Gets the attribute text.
         * @param attr The attribute.
         * @param format The format.
         * @returns Formatted text.
         */
        getAttributeText(attr, format) {
            let attrText = i18n$1.getText('Attributes', attr.id);
            if (!attrText) {
                attrText = attr.caption;
            }
            if (!format) {
                return attrText;
            }
            let result = '';
            let entityPath = this.getFullEntityPathByAttr(attr.id, ' ');
            if (entityPath) {
                result = format.replace(new RegExp('{attr}', 'g'), attrText);
                result = result.replace(new RegExp('{entity}', 'g'), entityPath);
            }
            else {
                result = attrText;
            }
            return result.trim();
        }
        /**
         * Scans model's entity tree and calls the callback functions for each attribute and entity.
         * @param processAttribute The callback function which is called for each attribute in model's entity tree.
         * The processed attribute is passed in the first function parameter.
         * @param processEntity The callback function which is called for each entity in tree.
         * The processed entity is passed in the first function parameter.
         */
        runThroughEntities(processAttribute, processEntity) {
            this.getRootEntity().scan(processAttribute, processEntity);
        }
        /**
         * Finds first attribute by filter.
         * @param filterFunc The filter function. Takes EntityAttr object in parameter and returns boolean
         */
        getFirstAttributeByFilter(filterFunc) {
            let res = null;
            this.runThroughEntities(function (attr, opts) {
                if (filterFunc(attr)) {
                    opts.stop = true;
                    res = attr;
                }
            }, null);
            return res;
        }
    }

    var ColumnAlignment$1;
    (function (ColumnAlignment) {
        ColumnAlignment[ColumnAlignment["None"] = 0] = "None";
        ColumnAlignment[ColumnAlignment["Left"] = 1] = "Left";
        ColumnAlignment[ColumnAlignment["Center"] = 2] = "Center";
        ColumnAlignment[ColumnAlignment["Right"] = 3] = "Right";
    })(ColumnAlignment$1 || (ColumnAlignment$1 = {}));
    class DataColumn {
        constructor(desc) {
            if (!desc)
                throw Error("Options are required");
            if (!desc.id)
                throw Error("Field Id is required");
            if (!desc.label)
                throw Error("Label is required");
            this.id = desc.id;
            this.type = utils$1.getIfDefined(desc.type, DataType$1.String);
            this.label = desc.label;
            this.originAttrId = desc.originAttrId;
            this.isAggr = desc.isAggr || false;
            this.displayFormat = desc.dfmt;
            this.groupFooterColumnTemplate = desc.gfct;
            this.style = desc.style || {};
            this.description = desc.description;
            this.calculatedWidth = 0;
        }
    }
    class DataColumnList {
        constructor() {
            this.items = [];
            this.mapper = {};
            this._dateColumnIdx = [];
        }
        get count() {
            return this.items.length;
        }
        add(colOrDesc) {
            let col;
            if (colOrDesc instanceof DataColumn) {
                col = colOrDesc;
            }
            else {
                col = new DataColumn(colOrDesc);
            }
            const index = this.items.length;
            this.items.push(col);
            this.mapper[col.id] = index;
            if ([DataType$1.Date, DataType$1.DateTime, DataType$1.Time].indexOf(col.type) >= 0) {
                this._dateColumnIdx.push(index);
            }
            return index;
        }
        updateDateColumnIdx() {
            this._dateColumnIdx = this.getItems()
                .filter(col => [DataType$1.Date, DataType$1.DateTime, DataType$1.Time].indexOf(col.type) >= 0)
                .map((col, index) => index);
        }
        put(index, col) {
            if (index >= 0 && index < this.count) {
                this.items[index] = col;
                this.updateDateColumnIdx();
            }
        }
        move(col, newIndex) {
            let oldIndex = this.items.indexOf(col);
            if (oldIndex >= 0 && oldIndex != newIndex) {
                utils$1.moveArrayItem(this.items, oldIndex, newIndex);
                this.updateDateColumnIdx();
            }
        }
        get(index) {
            if (index >= 0 && index < this.count) {
                return this.items[index];
            }
            else {
                return null;
            }
        }
        getIndex(id) {
            return this.mapper[id];
        }
        getItems() {
            return this.items;
        }
        getDateColumnIndexes() {
            return this._dateColumnIdx;
        }
        removeAt(index) {
            const col = this.get(index);
            this.items.splice(index, 1);
            const removeDate = this._dateColumnIdx.indexOf(index);
            if (removeDate >= 0) {
                this._dateColumnIdx.splice(removeDate, 1);
            }
            delete this.mapper[col.id];
        }
        clear() {
            this.items = [];
            this._dateColumnIdx = [];
            this.mapper = {};
        }
    }

    let DataRow$1 = class DataRow {
        constructor(columns, values) {
            this.columns = columns;
            this.values = values;
        }
        toArray() {
            return Array.from(this.values);
        }
        size() {
            return this.values.length;
        }
        getValue(colIdOrIndex) {
            let index;
            if (typeof colIdOrIndex === "string") {
                index = this.columns.getIndex(colIdOrIndex);
                if (index === undefined) {
                    throw new RangeError(`No column with id '${colIdOrIndex}'`);
                }
            }
            else {
                index = colIdOrIndex;
            }
            if (index >= this.values.length)
                throw new RangeError("Out of range: " + index);
            return this.values[index];
        }
        setValue(colIdOrIndex, value) {
            let index;
            if (typeof colIdOrIndex === "string") {
                index = this.columns.getIndex(colIdOrIndex);
                if (index === undefined) {
                    throw new RangeError(`No column with id '${colIdOrIndex}'`);
                }
            }
            else {
                index = colIdOrIndex;
            }
            if (index >= this.values.length)
                throw new RangeError("Out of range: " + index);
            this.values[index] = value;
        }
    };

    class EasyDataTable {
        constructor(options) {
            this._chunkSize = 1000;
            this._elasticChunks = false;
            this.cachedRows = [];
            this.total = 0;
            this.loader = null;
            this.needTotal = true;
            this.isInMemory = false;
            options = options || {};
            this._chunkSize = options.chunkSize || this._chunkSize;
            this._elasticChunks = options.elasticChunks || this._elasticChunks;
            this.loader = options.loader;
            if (typeof options.inMemory !== 'undefined') {
                this.isInMemory = options.inMemory;
            }
            if (this.isInMemory) {
                this.needTotal = false;
            }
            this._columns = new DataColumnList();
            this.onUpdate = options.onUpdate;
            if (options.columns) {
                for (const colDesc of options.columns) {
                    this._columns.add(colDesc);
                }
            }
            if (options.rows) {
                for (const rowData of options.rows) {
                    const row = this.createRow(rowData);
                    this.addRow(row);
                }
            }
            this.needTotal = !this._elasticChunks;
        }
        get columns() {
            return this._columns;
        }
        get chunkSize() {
            return this._chunkSize;
        }
        set chunkSize(value) {
            this._chunkSize = value;
            this.total = 0;
            this.needTotal = !this.elasticChunks;
            this.cachedRows = [];
        }
        get elasticChunks() {
            return this._elasticChunks;
        }
        set elasticChunks(value) {
            this._elasticChunks = value;
            this.total = 0;
            this.needTotal = !this.elasticChunks;
            this.cachedRows = [];
        }
        getRows(params) {
            let fromIndex = 0, count = this._chunkSize;
            if (params) {
                if ('page' in params) {
                    fromIndex = params.pageSize * (params.page - 1);
                    count = params.pageSize;
                }
                else {
                    fromIndex = params.offset;
                    count = params.limit;
                }
            }
            let endIndex = fromIndex + count; //the first index of the next page
            //if we don't calculate total on this request
            if (!this.needTotal && !this.elasticChunks) {
                if (fromIndex >= this.total) {
                    return Promise.resolve([]);
                }
                if (endIndex > this.total) {
                    endIndex = this.total;
                }
            }
            if (this.isInMemory && endIndex > this.cachedRows.length) {
                endIndex = this.cachedRows.length;
            }
            let allChunksCached = endIndex <= this.cachedRows.length;
            if (allChunksCached) {
                return Promise.resolve(this.cachedRows.slice(fromIndex, endIndex));
            }
            //if loader is not defined
            if (!this.loader) {
                throw `Loader is not defined. Can't get the rows from ${fromIndex} to ${endIndex}`;
            }
            // we need total only for the first request
            const needTotal = this.needTotal;
            if (this.needTotal) {
                this.needTotal = false;
            }
            let offset = this.cachedRows.length;
            let limit = endIndex - offset;
            if (limit < this._chunkSize) {
                limit = this._chunkSize;
            }
            const resultPromise = this.loader.loadChunk({
                offset: offset,
                limit: limit,
                needTotal: needTotal
            })
                .then(result => {
                if (needTotal) {
                    this.total = result.total;
                }
                Array.prototype.push.apply(this.cachedRows, result.table.getCachedRows());
                if (endIndex > this.cachedRows.length) {
                    endIndex = this.cachedRows.length;
                }
                if (this.elasticChunks) {
                    const count = result.table.getCachedCount();
                    if (count < limit) {
                        this.total = this.cachedRows.length;
                    }
                }
                this.fireUpdated();
                return this.cachedRows.slice(fromIndex, endIndex);
            });
            return resultPromise;
        }
        getRow(index) {
            return this.getRows({ offset: index, limit: 1 })
                .then(rows => rows.length > 0 ? rows[0] : null);
        }
        getTotal() {
            return this.total;
        }
        setTotal(total) {
            this.total = total;
            this.needTotal = false;
        }
        getCachedCount() {
            return this.cachedRows.length;
        }
        clear() {
            this.columns.clear();
            this.cachedRows = [];
            this.total = 0;
            this.needTotal = !this._elasticChunks;
            this.fireUpdated();
        }
        createRow(dataOrRow) {
            const dateIdx = this._columns.getDateColumnIndexes();
            const values = new Array(this._columns.count);
            const getValue = dataOrRow instanceof DataRow$1
                ? (colId) => dataOrRow.getValue(colId)
                : (colId) => dataOrRow[colId];
            if (dataOrRow) {
                this.columns.getItems().forEach((column) => {
                    const value = getValue(column.id);
                    const index = this.columns.getIndex(column.id);
                    values[index] = (dateIdx.indexOf(index) >= 0)
                        ? this.mapDate(value, column.type)
                        : value;
                });
            }
            return new DataRow$1(this._columns, values);
        }
        mapDate(value, dtype) {
            if (value) {
                let result = new Date(value);
                if (isNaN(result.getTime())
                    && dtype == DataType$1.Time) {
                    result = utils$1.strToTime(value);
                }
                return result;
            }
            return null;
        }
        addRow(rowOrValues) {
            let newRow;
            if (Array.isArray(rowOrValues)) {
                let values = rowOrValues;
                const dateIdx = this._columns.getDateColumnIndexes();
                if (dateIdx.length > 0) {
                    for (const idx of dateIdx) {
                        if (values[idx]) {
                            values[idx] = this.mapDate(values[idx], this._columns.get(idx).type);
                        }
                    }
                }
                newRow = new DataRow$1(this._columns, values);
            }
            else {
                newRow = this.createRow(rowOrValues);
            }
            this.cachedRows.push(newRow);
            const cachedTotal = this.getCachedCount();
            if (cachedTotal > this.total) {
                this.total = cachedTotal;
            }
            return newRow;
        }
        getCachedRows() {
            return this.cachedRows;
        }
        totalIsKnown() {
            if (this.elasticChunks) {
                const count = this.getCachedCount();
                return count === this.total;
            }
            return !this.needTotal;
        }
        fireUpdated() {
            if (this.onUpdate) {
                this.onUpdate(this);
            }
        }
    }
    /**
     * Adds two paths and returns the result
     * Correctly processes leading and trailing slashes
     * @param path1
     * @param path2
     */
    function combinePath(path1, path2) {
        let result = path1;
        if (result != null && result.length > 0) {
            if (result.charAt(result.length - 1) != '/')
                result += "/";
            result += path2;
        }
        else {
            result = path2;
        }
        return result;
    }

    var liquid$1;
    (function (liquid) {
        function renderLiquidTemplate(template, vars) {
            let result = template;
            if (vars) {
                for (let v in vars) {
                    const liquidVarRegexp = new RegExp('\{\{' + v + '\}\}', 'g');
                    result = result.replace(liquidVarRegexp, vars[v]);
                }
            }
            return result;
        }
        liquid.renderLiquidTemplate = renderLiquidTemplate;
    })(liquid$1 || (liquid$1 = {}));

    i18n$1.resetLocales();

    //types
    if (typeof Object.values !== 'function') {
        Object.values = function (obj) {
            return Object.keys(obj).map(key => obj[key]);
        };
    }
    if (typeof Math.trunc !== 'function') {
        Math.trunc = function (x) {
            if (isNaN(x)) {
                return NaN;
            }
            if (x > 0) {
                return Math.floor(x);
            }
            return Math.ceil(x);
        };
    }

    class TextDataFilter {
        constructor(loader, sourceTable, sourceId, isLookup = false) {
            this.loader = loader;
            this.sourceTable = sourceTable;
            this.sourceId = sourceId;
            this.isLookup = isLookup;
            this.filterValue = '';
            //turns off client-side search
            //for test purposes
            this.justServerSide = false;
        }
        getValue() {
            return this.filterValue;
        }
        apply(value) {
            this.filterValue = value;
            if (this.filterValue) {
                return this.applyCore();
            }
            else {
                return this.clear();
            }
        }
        clear() {
            this.filterValue = '';
            return Promise.resolve(this.sourceTable);
        }
        applyCore() {
            if (this.sourceTable.getTotal() == this.sourceTable.getCachedCount() && !this.justServerSide) {
                return this.applyInMemoryFilter();
            }
            else {
                const filters = [
                    { class: "__substring", value: this.filterValue }
                ];
                return this.loader.loadChunk({
                    offset: 0,
                    limit: this.sourceTable.chunkSize,
                    needTotal: true,
                    filters: filters,
                    sourceId: this.sourceId,
                    lookup: this.isLookup
                })
                    .then(data => {
                    const filteredTable = new EasyDataTable({
                        chunkSize: this.sourceTable.chunkSize,
                        loader: {
                            loadChunk: (params) => this.loader
                                .loadChunk(Object.assign(Object.assign({}, params), { filters: filters, sourceId: this.sourceId, lookup: this.isLookup }))
                        }
                    });
                    for (const col of this.sourceTable.columns.getItems()) {
                        filteredTable.columns.add(col);
                    }
                    filteredTable.setTotal(data.total);
                    for (const row of data.table.getCachedRows()) {
                        filteredTable.addRow(row);
                    }
                    return filteredTable;
                });
            }
        }
        applyInMemoryFilter() {
            return new Promise((resolve, reject) => {
                const filteredTable = new EasyDataTable({
                    chunkSize: this.sourceTable.chunkSize,
                    inMemory: true
                });
                for (const col of this.sourceTable.columns.getItems()) {
                    filteredTable.columns.add(col);
                }
                const words = this.filterValue.split('||').map(w => w.trim().toLowerCase());
                const suitableColumns = this.sourceTable.columns.getItems()
                    .filter(col => utils$1.isNumericType(col.type)
                    || utils$1.getStringDataTypes().indexOf(col.type) >= 0);
                const hasEnterance = (row) => {
                    for (const col of suitableColumns) {
                        const value = row.getValue(col.id);
                        if (value) {
                            const normalized = value.toString().toLowerCase();
                            for (const word of words) {
                                if (normalized.indexOf(word) >= 0) {
                                    return true;
                                }
                            }
                        }
                    }
                    return false;
                };
                for (const row of this.sourceTable.getCachedRows()) {
                    if (hasEnterance(row)) {
                        filteredTable.addRow(row);
                    }
                }
                filteredTable.setTotal(filteredTable.getCachedCount());
                resolve(filteredTable);
            });
        }
    }

    /*!
     * EasyData.JS UI v1.4.20
     * Copyright 2023 Korzh.com
     * Licensed under MIT
     */

    /*!
     * EasyData.JS Core v1.4.20
     * Copyright 2023 Korzh.com
     * Licensed under MIT
     */

    /** Represents the common types of the data. */
    var DataType;
    (function (DataType) {
        /** Unknown type value*/
        DataType[DataType["Unknown"] = 0] = "Unknown";
        /** String value*/
        DataType[DataType["String"] = 1] = "String";
        /** 8-bit integer value */
        DataType[DataType["Byte"] = 2] = "Byte";
        /** 16-bit integer value */
        DataType[DataType["Word"] = 3] = "Word";
        /** 32-bit integer value */
        DataType[DataType["Int32"] = 4] = "Int32";
        /** 64-bit integer value */
        DataType[DataType["Int64"] = 5] = "Int64";
        /** Boolean value */
        DataType[DataType["Bool"] = 6] = "Bool";
        /** Floating-point numeric value */
        DataType[DataType["Float"] = 7] = "Float";
        /** Money value */
        DataType[DataType["Currency"] = 8] = "Currency";
        /** Binary-coded decimal value */
        DataType[DataType["BCD"] = 9] = "BCD";
        /** Date value */
        DataType[DataType["Date"] = 10] = "Date";
        /** Time value */
        DataType[DataType["Time"] = 11] = "Time";
        /** Date and time value */
        DataType[DataType["DateTime"] = 12] = "DateTime";
        /** Autoincrement 32-bit integer value */
        DataType[DataType["Autoinc"] = 13] = "Autoinc";
        /** MEMO value (text with unlimited length) */
        DataType[DataType["Memo"] = 14] = "Memo";
        /** BLOB value (any data with unlimited length) */
        DataType[DataType["Blob"] = 15] = "Blob";
        /** Fixed character value */
        DataType[DataType["FixedChar"] = 16] = "FixedChar";
        /** The unique identifier */
        DataType[DataType["Guid"] = 17] = "Guid";
        /*-------- Spatial data types ----------*/
        /** Any geometry data */
        DataType[DataType["Geometry"] = 18] = "Geometry";
        /** Any data that represents some geography objects</summary> */
        DataType[DataType["Geography"] = 19] = "Geography";
    })(DataType || (DataType = {}));

    var EntityAttrKind;
    (function (EntityAttrKind) {
        EntityAttrKind[EntityAttrKind["Data"] = 0] = "Data";
        EntityAttrKind[EntityAttrKind["Virtual"] = 1] = "Virtual";
        EntityAttrKind[EntityAttrKind["Lookup"] = 2] = "Lookup";
    })(EntityAttrKind || (EntityAttrKind = {}));

    var HttpMethod;
    (function (HttpMethod) {
        HttpMethod["Trace"] = "TRACE";
        HttpMethod["Options"] = "OPTIONS";
        HttpMethod["Get"] = "GET";
        HttpMethod["Put"] = "PUT";
        HttpMethod["Post"] = "POST";
        HttpMethod["Delete"] = "DELETE";
    })(HttpMethod || (HttpMethod = {}));

    var utils;
    (function (utils) {
        function getAllDataTypes() {
            return Object.values(DataType).filter(item => typeof item === "number");
        }
        utils.getAllDataTypes = getAllDataTypes;
        function getDateDataTypes() {
            return [DataType.Time, DataType.Date, DataType.DateTime];
        }
        utils.getDateDataTypes = getDateDataTypes;
        function getStringDataTypes() {
            return [DataType.String, DataType.Memo, DataType.FixedChar];
        }
        utils.getStringDataTypes = getStringDataTypes;
        const _numericTypes = [DataType.Byte, DataType.Word, DataType.Int32,
            DataType.Int64, DataType.Float, DataType.Currency, DataType.Autoinc];
        function getNumericDataTypes() {
            return _numericTypes;
        }
        utils.getNumericDataTypes = getNumericDataTypes;
        const _intTypes = [DataType.Byte, DataType.Word, DataType.Int32, DataType.Int64, DataType.Autoinc];
        //-------------- object functions -------------------
        /**
         * Copy the content of all objests passed in `args` parameters into `target`
         * and returns the result
         * NB: This function copies only the first level properties.
         * For a deep copy please use `assignDeep`
         * @param target - the target object
         * @param args  - an array of the source objects
         */
        function assign(target, ...args) {
            for (let i = 0; i < args.length; i++) {
                let source = args[i];
                if (source) {
                    for (let key in source) {
                        if (source.hasOwnProperty(key)) {
                            target[key] = source[key];
                        }
                    }
                }
            }
            return target;
        }
        utils.assign = assign;
        /**
         * Copy the content of all objests passed in `args` parameters into `target`
         * and returns the result
         * NB: This function make a deep copy -
         * so `assignDeep` will be called recursively for all object properties
         * on the first level.
         * @param target - the target object
         * @param sources  - an array of the source objects
         */
        function assignDeep(target, ...sources) {
            return assignDeepCore(new WeakMap(), target, sources);
        }
        utils.assignDeep = assignDeep;
        function assignDeepCore(hashSet, target, sources) {
            if (!target) {
                target = {};
            }
            for (let source of sources) {
                if (source) {
                    for (let key in source) {
                        if (source.hasOwnProperty(key)) {
                            let sourceVal = source[key];
                            if (sourceVal !== null && typeof sourceVal === 'object') {
                                if (hashSet.has(sourceVal)) {
                                    target[key] = hashSet.get(sourceVal);
                                }
                                else {
                                    if (Array.isArray(sourceVal)) {
                                        target[key] = createArrayFrom(sourceVal);
                                        hashSet.set(sourceVal, target[key]);
                                    }
                                    else {
                                        if (typeof target[key] == 'undefined' || target[key] == null) {
                                            target[key] = Object.create(Object.getPrototypeOf(sourceVal));
                                        }
                                        hashSet.set(sourceVal, target[key]);
                                        assignDeepCore(hashSet, target[key], [sourceVal]);
                                    }
                                }
                            }
                            else {
                                target[key] = sourceVal;
                            }
                        }
                    }
                }
            }
            return target;
        }
        function getIfDefined(value, defaultValue) {
            return (typeof value !== 'undefined') ? value : defaultValue;
        }
        utils.getIfDefined = getIfDefined;
        function IsDefinedAndNotNull(value) {
            return typeof value !== 'undefined' && value !== null;
        }
        utils.IsDefinedAndNotNull = IsDefinedAndNotNull;
        function copyArrayTo(collection1, collection2) {
            const len1 = collection1.length;
            const len2 = collection2.length;
            for (let i = 0; i < len1 && i < len2; i++) {
                collection2[i] = collection1[i];
            }
        }
        utils.copyArrayTo = copyArrayTo;
        function createArrayFrom(collection) {
            let result = [];
            for (let item of collection) {
                result.push(item);
            }
            return result;
        }
        utils.createArrayFrom = createArrayFrom;
        /**
         * Searches an array of the objects which implement ItemWithId by ID
         * Returs the found object or null.
         * @param array
         * @param id
         */
        function findItemById(array, id) {
            var arrLength = array.length;
            for (var idx = 0; idx < arrLength; idx++) {
                if (array[idx].id === id)
                    return array[idx];
            }
            return null;
        }
        utils.findItemById = findItemById;
        function findItemIndexById(array, id) {
            var arrLength = array.length;
            for (var idx = 0; idx < arrLength; idx++) {
                if (array[idx].id === id)
                    return idx;
            }
            return -1;
        }
        utils.findItemIndexById = findItemIndexById;
        /**
         * Searches an array of the objects which implement ItemWithId by ID
         * Returs the index of the found element, or -1 if nothing was found.
         * @param array
         * @param id
         */
        function indexOfArrayItem(arr, item) {
            if (arr.indexOf) {
                return arr.indexOf(item);
            }
            else {
                let len = arr.length;
                for (let i = 0; i < len; i++) {
                    if (item == arr[i]) {
                        return i;
                    }
                }
                return -1;
            }
        }
        utils.indexOfArrayItem = indexOfArrayItem;
        /**
         * Moves an item in some array to a new position
         * @param array
         * @param index1
         * @param index2
         */
        function moveArrayItem(array, index1, index2) {
            if (index1 >= array.length) {
                throw 'Index out of bounds: ' + index1;
            }
            if (index2 >= array.length) {
                index2 = array.length - 1;
            }
            let item = array.splice(index1, 1)[0];
            array.splice(index2, 0, item);
        }
        utils.moveArrayItem = moveArrayItem;
        /**
         * Searches for a particular item in the array are removes that item if found.
         * @param arr
         * @param value
         */
        function removeArrayItem(arr, value) {
            let index = arr.indexOf(value);
            if (index != -1) {
                return arr.splice(index, 1)[0];
            }
        }
        utils.removeArrayItem = removeArrayItem;
        function insertArrayItem(arr, index, value) {
            arr.splice(index, 0, value);
        }
        utils.insertArrayItem = insertArrayItem;
        function fillArray(arr, value, start = 0, end) {
            let len = arr.length >>> 0;
            var relativeStart = start >> 0;
            var k = relativeStart < 0 ?
                Math.max(len + relativeStart, 0) :
                Math.min(relativeStart, len);
            var relativeEnd = end === undefined ?
                len : end >> 0;
            let final = relativeEnd < 0 ?
                Math.max(len + relativeEnd, 0) :
                Math.min(relativeEnd, len);
            while (k < final) {
                arr[k] = value;
                k++;
            }
            return arr;
        }
        utils.fillArray = fillArray;
        //------------ DOM utils ------------
        /**
         * Calculates the shift on which we need to move our element horizontally
         * to find current window
         * @param absLeft
         * @param width
         */
        function shiftToFitWindow(absLeft, width) {
            let body = document.getElementsByTagName('body')[0];
            let winWidth = window.innerWidth || document.documentElement.clientWidth || body.clientWidth;
            var absRight = absLeft + width;
            let shift = 0;
            if (absRight > winWidth) {
                shift = winWidth - absRight - 10;
                if (absLeft + shift < 0) {
                    shift = 10 - absLeft;
                }
            }
            return shift;
        }
        utils.shiftToFitWindow = shiftToFitWindow;
        /**
         * Returns `true` if the value passed in the parameter is an object
         * @param val
         */
        function isObject(val) {
            if (val === null) {
                return false;
            }
            return ((typeof val === 'function') || (typeof val === 'object'));
        }
        utils.isObject = isObject;
        /**
         * Returns `true` if the `DataType` value passed in the parameter
         * represents some numeric type
         * @param dtype
         */
        function isNumericType(dtype) {
            const index = _numericTypes.indexOf(dtype);
            return (index >= 0);
        }
        utils.isNumericType = isNumericType;
        /**
         * Returns `true` if the `DataType` value passed in the parameter
         * represents some numeric type
         * @param dtype
         */
        function isIntType(dtype) {
            const index = _intTypes.indexOf(dtype);
            return (index >= 0);
        }
        utils.isIntType = isIntType;
        /**
         * Returns `true` if the value passed in the parameter is an a numeric value
         * @param val
         */
        function isNumeric(val) {
            return !isNaN(parseFloat(val)) && isFinite(val);
        }
        utils.isNumeric = isNumeric;
        /**
         * Returns `true` if two data types  passed in parameters
         * are compatible - so it's safe to copy the values between
         * two expressions with these two types
         * @param type1
         * @param type2
         */
        function areCompatibleDataTypes(type1, type2) {
            return typeof type1 == "undefined" || typeof type2 == "undefined" || type1 == DataType.Unknown || type2 == DataType.Unknown
                || (type1 == type2) || (type1 == DataType.Date && type2 == DataType.DateTime)
                || (type1 == DataType.DateTime && type2 == DataType.Date);
        }
        utils.areCompatibleDataTypes = areCompatibleDataTypes;
        /**
         * Returns `true` if the property with named `propName`
         * in the object `obj` has some value
         * @param obj
         * @param propName
         */
        function isPropSet(obj, propName) {
            return obj[propName] || obj[propName.toLowerCase()] || obj[propName.toUpperCase()];
        }
        utils.isPropSet = isPropSet;
        //-------------- ID generator -----------
        const prefixIdLen = 4;
        const symbols = "0123456789abcdefghijklmnopqrstuvwxyz";
        const magicTicks = 636712160627685350;
        /**
         * Generates an unique ID
         */
        function generateId(prefix) {
            if (!prefix) {
                prefix = 'easy';
            }
            let prfx = (prefix.length > prefixIdLen) ? squeezeMoniker(prefix, prefixIdLen) : prefix;
            if (prfx && prfx.length > 0) {
                prfx += "-";
            }
            //adding 3 random symbols
            var randCharPart = symbols[getRandomInt(0, symbols.length)] +
                symbols[getRandomInt(0, symbols.length)] +
                symbols[getRandomInt(0, symbols.length)];
            var randInt = getRandomInt(0, 10000);
            //generating main ID part 
            //it's a 36-base representation of some random number based on current value of ticks
            let ticksNum36 = intToNumBase(getNowTicks() - magicTicks - randInt);
            return prfx + randCharPart + ticksNum36;
        }
        utils.generateId = generateId;
        function intToNumBase(value, targetBase = 36) {
            var buffer = '';
            var rest = value;
            do {
                buffer = symbols[rest % targetBase] + buffer;
                rest = Math.floor(rest /= targetBase);
            } while (rest > 0);
            return buffer;
        }
        function squeezeMoniker(str, maxlen) {
            let parts = str.split('-');
            let pml = 1;
            let ptt = maxlen;
            if (parts.length < maxlen) {
                pml = maxlen / parts.length;
                ptt = parts.length;
            }
            let result = "";
            for (let i = 0; i < ptt; i++) {
                result += squeeze(parts[i], pml);
            }
            return result;
        }
        function squeeze(str, maxlen) {
            const len = str.length;
            if (len > maxlen) {
                let step = len / maxlen;
                let result = "";
                result += str[0];
                let nextIndex = step;
                let ch;
                for (let i = 1; i < len; i++) {
                    ch = str[i];
                    if (i + 1 > nextIndex) {
                        result += ch;
                        nextIndex += step;
                    }
                }
                return result;
            }
            else {
                return str;
            }
        }
        function getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min)) + min;
        }
        function getNowTicks() {
            return (621355968e9 + (new Date()).getTime() * 1e4);
        }
        function safeParseInt(str) {
            const res = parseInt(str);
            if (isNaN(res))
                throw `"${str}" is not a valid number`;
            return res;
        }
        function getDaysInMonth(month, year) {
            return new Date(year, month + 1, 0).getDate();
        }
        // ------------- date/time functions -------------------
        // TO DO: improve to process all datetime cases
        function strToDateTime(value, format) {
            if (!value || value.length == 0)
                return new Date();
            const normalizedValue = value.replace(/[^a-zA-Z0-9_]/g, '-');
            const normalizedFormat = format.replace(/[^a-zA-Z0-9_]/g, '-');
            const formatItems = normalizedFormat.split('-');
            const dateItems = normalizedValue.split('-');
            const monthIndex = formatItems.indexOf("MM");
            const dayIndex = formatItems.indexOf("dd");
            const yearIndex = formatItems.indexOf("yyyy");
            const hourIndex = formatItems.indexOf("HH");
            const minutesIndex = formatItems.indexOf("mm");
            const secondsIndex = formatItems.indexOf("ss");
            const today = new Date();
            try {
                const year = yearIndex > -1 && yearIndex < dateItems.length
                    ? safeParseInt(dateItems[yearIndex])
                    : today.getFullYear();
                const month = monthIndex > -1 && monthIndex < dateItems.length
                    ? safeParseInt(dateItems[monthIndex]) - 1
                    : today.getMonth() - 1;
                if (month > 11)
                    throw '';
                const day = dayIndex > -1 && dayIndex < dateItems.length
                    ? safeParseInt(dateItems[dayIndex])
                    : today.getDate();
                if (day > getDaysInMonth(month, year))
                    throw '';
                const hour = hourIndex > -1 && hourIndex < dateItems.length
                    ? safeParseInt(dateItems[hourIndex])
                    : 0;
                if (hour > 23)
                    throw '';
                const minute = minutesIndex > -1 && minutesIndex < dateItems.length
                    ? safeParseInt(dateItems[minutesIndex])
                    : 0;
                if (minute > 59)
                    throw '';
                const second = secondsIndex > -1 && secondsIndex < dateItems.length
                    ? safeParseInt(dateItems[secondsIndex])
                    : 0;
                if (second > 59)
                    throw '';
                return new Date(year, month, day, hour, minute, second);
            }
            catch (_a) {
                throw `${value} is not a valid date.`;
            }
        }
        utils.strToDateTime = strToDateTime;
        function strToTime(str) {
            const timeItems = str.split(':');
            try {
                const hour = timeItems.length > 0 ? safeParseInt(timeItems[0]) : 0;
                if (hour > 23)
                    throw '';
                const minute = timeItems.length > 1 ? safeParseInt(timeItems[1]) : 0;
                if (minute > 59)
                    throw '';
                const second = timeItems.length > 1 ? safeParseInt(timeItems[1]) : 0;
                if (second > 59)
                    throw '';
                return new Date(0, 0, 0, hour, minute, second);
            }
            catch (_a) {
                throw `${str} is not a valid time.`;
            }
        }
        utils.strToTime = strToTime;
    })(utils || (utils = {}));

    /**
     * Contains internatialization functionality.
     */
    var i18n;
    (function (i18n) {
        let englishUSLocaleSettings = {
            shortDateFormat: 'MM/dd/yyyy',
            longDateFormat: 'dd MMM, yyyy',
            editDateFormat: 'MM/dd/yyyy',
            shortTimeFormat: 'HH:mm',
            editTimeFormat: 'HH:mm',
            longTimeFormat: 'HH:mm:ss',
            shortMonthNames: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            longMonthNames: ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'],
            shortWeekDayNames: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            longWeekDayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            decimalSeparator: '.',
            currency: 'USD'
        };
        let defaultLocale = {
            localeId: 'en-US',
            englishName: 'English',
            displayName: 'English',
            texts: {
                ButtonOK: 'OK',
                ButtonCancel: 'Cancel',
                Yes: 'Yes',
                No: 'No',
                True: 'True',
                False: 'False'
            },
            settings: englishUSLocaleSettings
        };
        let allLocales = {
            'en-US': defaultLocale
        };
        let currentLocale;
        const mappers = [];
        function mapInfo(info) {
            for (const mapper of mappers) {
                mapper(info);
            }
        }
        function addMapper(mapper) {
            mappers.push(mapper);
        }
        i18n.addMapper = addMapper;
        /**
         * Gets added locales with their names.
         * @returns  The locales.
         */
        function getLocales() {
            let result = [];
            for (let locale in allLocales) {
                result.push({
                    locale: locale,
                    englishName: allLocales[locale].englishName,
                    displayName: allLocales[locale].displayName
                });
            }
            return result.sort((a, b) => {
                if (a.englishName > b.englishName) {
                    return 1;
                }
                else if (a.englishName === b.englishName) {
                    return 0;
                }
                return -1;
            });
        }
        i18n.getLocales = getLocales;
        /**
         * Gets the current locale ID.
         * @returns The locale.
         */
        function getCurrentLocale() {
            return currentLocale.localeId;
        }
        i18n.getCurrentLocale = getCurrentLocale;
        /**
        * Sets the curent locale.
        * @deprecated Use setCurrentLocale instead
        * @param l The locale.
        */
        function setLocale(l) {
            console.warn('This method is deprecated. Use setCurrentLocale instead');
            setCurrentLocale(l);
        }
        i18n.setLocale = setLocale;
        /**
         * Sets the curent locale.
         * @param localeId The locale.
         */
        function setCurrentLocale(localeId) {
            const newLocale = allLocales[localeId];
            if (newLocale) {
                utils.assignDeep(currentLocale, newLocale);
            }
            else {
                currentLocale.englishName = localeId;
                currentLocale.displayName = localeId;
                currentLocale.texts = utils.assignDeep({}, defaultLocale.texts);
            }
            currentLocale.localeId = localeId;
        }
        i18n.setCurrentLocale = setCurrentLocale;
        /**
         * Returns localized text by the key defined in parameter.
         * Here we get the text of the resource string assigned to CmdClickToAddCondition key:
         *
         ```
           const text = i18n.getText('CmdClickToAddCondition')
         ```
         * @param args The keys of the resource string.
         * @returns Text of the resource defined by key or null if the key is not found
         *
         */
        function getText(...args) {
            let textsObj = currentLocale.texts;
            let resText = '';
            if (args && args.length) {
                const argLength = args.length;
                for (let i = 0; i < argLength; i++) {
                    resText = textsObj[args[i]];
                    if (typeof resText === 'object') {
                        textsObj = resText;
                    }
                    else {
                        break;
                    }
                }
            }
            return resText;
        }
        i18n.getText = getText;
        function getLocaleSettings() {
            return currentLocale.settings;
        }
        i18n.getLocaleSettings = getLocaleSettings;
        function getOneLocaleSetting(key) {
            return currentLocale.settings[key];
        }
        i18n.getOneLocaleSetting = getOneLocaleSetting;
        function getShortMonthName(monthNum) {
            const settings = getLocaleSettings();
            if (monthNum > 0 && monthNum < 13) {
                return settings.shortMonthNames[monthNum - 1];
            }
            else {
                throw 'Wrong month number: ' + monthNum;
            }
        }
        i18n.getShortMonthName = getShortMonthName;
        function getLongMonthName(monthNum) {
            const settings = getLocaleSettings();
            if (monthNum > 0 && monthNum < 13) {
                return settings.longMonthNames[monthNum - 1];
            }
            else {
                throw 'Wrong month number: ' + monthNum;
            }
        }
        i18n.getLongMonthName = getLongMonthName;
        function getShortWeekDayName(dayNum) {
            const settings = getLocaleSettings();
            if (dayNum > 0 && dayNum < 8) {
                return settings.shortWeekDayNames.length >= dayNum
                    ? settings.shortWeekDayNames[dayNum - 1]
                    : dayNum.toString();
            }
            else {
                throw 'Wrong month number: ' + dayNum;
            }
        }
        i18n.getShortWeekDayName = getShortWeekDayName;
        function getLongWeekDayName(dayNum) {
            const settings = getLocaleSettings();
            if (dayNum > 0 && dayNum < 8) {
                return settings.longWeekDayNames.length >= dayNum
                    ? settings.longWeekDayNames[dayNum - 1]
                    : dayNum.toString();
            }
            else {
                throw 'Wrong month number: ' + dayNum;
            }
        }
        i18n.getLongWeekDayName = getLongWeekDayName;
        /**
         * Updates the locale settings (date/time formats, separators, etc) for the specified locale.
         * @param settingsToUpdate a LocaleSettings object
         */
        function updateLocaleSettings(settingsToUpdate) {
            if (!currentLocale.settings) {
                currentLocale.settings = utils.assignDeep({}, englishUSLocaleSettings);
            }
            currentLocale.settings = utils.assignDeep(currentLocale.settings, settingsToUpdate);
        }
        i18n.updateLocaleSettings = updateLocaleSettings;
        /**
         * Updates the texts for the current locale
         * @param texts A plain JS object that contains textual resources
         */
        function updateLocaleTexts(texts) {
            if (typeof texts !== 'object') {
                console.error('Wrong parameter type in updateLocaleTexts function call.' +
                    'The first parameter (localeId) is not necessary. Use updateLocaleTexts(texts) instead');
                return;
            }
            mapInfo({ localeId: currentLocale.localeId, texts: texts });
            utils.assignDeep(currentLocale.texts, texts);
        }
        i18n.updateLocaleTexts = updateLocaleTexts;
        function updateDefaultTexts(texts) {
            for (let localeId in allLocales) {
                let locale = allLocales[localeId];
                locale.texts = utils.assignDeep({}, texts, locale.texts);
            }
            currentLocale.texts = utils.assignDeep({}, texts, currentLocale.texts);
        }
        i18n.updateDefaultTexts = updateDefaultTexts;
        /**
         * Updates the information for the specified locale.
         * @param localeId The locale ID (like 'en', 'de', 'uk', etc).
         * If the locale does exist yet - it will be added
         * @param localeInfo  a LocaleInfo object that contains the locale settings and textual resources
         */
        function updateLocaleInfo(localeId, localeData) {
            mapInfo(localeData);
            let localeInfoToUpdate = currentLocale;
            if (localeId) {
                if (!localeData.localeId) {
                    localeData.localeId = localeId;
                }
                localeInfoToUpdate = allLocales[localeId];
                if (!localeInfoToUpdate) {
                    localeInfoToUpdate = utils.assignDeep({}, defaultLocale);
                    allLocales[localeId] = localeInfoToUpdate;
                }
            }
            utils.assignDeep(localeInfoToUpdate, localeData);
        }
        i18n.updateLocaleInfo = updateLocaleInfo;
        /**
         * Adds the locale.
         * @param localeId The locale ID (like 'en', 'de', 'uk', etc).
         * If the locale does exist yet - it will be created
         * @param localeInfo - a LocaleInfo object that contains the locale settings and textual resources
         */
        function addLocale(localeId, localeInfo) {
            updateLocaleInfo(localeId, localeInfo);
        }
        i18n.addLocale = addLocale;
        /**
         * Overwrites some locale settings (date/time formats) with the formats used in browser's current language
         */
        function determineSettingsByLocale(localeId) {
            const now = new Date(2020, 5, 7, 19, 34, 56, 88);
            const dateOptions = { year: 'numeric', month: 'numeric', day: 'numeric' };
            const timeOptions = { hour: 'numeric', minute: 'numeric', second: 'numeric' };
            const dateStr = now.toLocaleDateString(localeId, dateOptions);
            const timeStr = now.toLocaleTimeString(localeId, timeOptions);
            let dateFormat = dateStr
                .replace('07', 'dd')
                .replace('7', 'd')
                .replace('06', 'MM')
                .replace('6', 'M')
                .replace('2020', 'yyyy')
                .replace('20', 'yy');
            let timeFormat = timeStr
                .replace('19', 'HH')
                .replace('07', 'hh')
                .replace('7', 'h')
                .replace('34', 'mm')
                .replace('56', 'ss')
                .replace('PM', 'tt');
            if (!currentLocale.settings) {
                currentLocale.settings = {};
            }
            const localeSettings = {
                shortDateFormat: dateFormat,
                shortTimeFormat: timeFormat
            };
            updateLocaleSettings(localeSettings);
        }
        function loadBrowserLocaleSettings() {
            const lang = typeof navigator === 'object' ? navigator.language : undefined;
            determineSettingsByLocale(lang);
        }
        function resetLocales() {
            if (!currentLocale) {
                currentLocale = utils.assignDeep({}, defaultLocale);
                loadBrowserLocaleSettings();
            }
        }
        i18n.resetLocales = resetLocales;
        const DT_FORMAT_RGEX = /\[([^\]]+)]|y{2,4}|M{1,4}|d{1,2}|H{1,2}|h{1,2}|m{2}|s{2}|t{2}/g;
        /**
         * Returns string representation of the date/time value according to the custom format (second parameter)
         * The format is compatible with the one used in .NET: https://docs.microsoft.com/en-us/dotnet/standard/base-types/custom-date-and-time-format-strings
         * @param date
         * @param format
         */
        function dateTimeToStr(date, format) {
            const year = date.getFullYear();
            const yearStr = year.toString();
            const month = date.getMonth() + 1;
            const day = date.getDate();
            const hour = date.getHours();
            const minute = date.getMinutes();
            const second = date.getSeconds();
            const hour12 = hour % 12 || 12; //the remainder of the division by 12. Or 12 if it's 0
            const isPm = hour > 11;
            const matches = {
                yyyy: yearStr,
                yy: yearStr.substring(yearStr.length - 2),
                MMMM: i18n.getLongMonthName(month),
                MMM: i18n.getShortMonthName(month),
                MM: (month < 10) ? '0' + month : month.toString(),
                M: month.toString(),
                dd: (day < 10) ? '0' + day : day.toString(),
                d: day.toString(),
                HH: (hour < 10) ? '0' + hour : hour.toString(),
                H: hour.toString(),
                hh: (hour12 < 10) ? '0' + hour12 : hour12.toString(),
                h: hour12.toString(),
                tt: isPm ? 'PM' : 'AM',
                mm: (minute < 10) ? '0' + minute : minute.toString(),
                ss: (second < 10) ? '0' + second : second.toString()
            };
            return format.replace(DT_FORMAT_RGEX, (match, $1) => {
                return $1 || matches[match];
            });
        }
        i18n.dateTimeToStr = dateTimeToStr;
        function dateTimeToStrEx(dateTime, dataType, format) {
            if (format) {
                if (format == 'd') {
                    format = buildShortDateTimeFormat(DataType.Date);
                }
                else if (format == 'D') {
                    format = buildLongDateTimeFormat(DataType.Date);
                }
                else if (format == 'f') {
                    format = buildShortDateTimeFormat(DataType.DateTime);
                }
                else if (format == 'F') {
                    format = buildLongDateTimeFormat(DataType.DateTime);
                }
            }
            else {
                format = buildShortDateTimeFormat(dataType);
            }
            return dateTimeToStr(dateTime, format);
        }
        i18n.dateTimeToStrEx = dateTimeToStrEx;
        function buildShortDateTimeFormat(dataType) {
            const localeSettings = getLocaleSettings();
            let format;
            switch (dataType) {
                case DataType.Date:
                    format = localeSettings.shortDateFormat;
                    break;
                case DataType.Time:
                    format = localeSettings.shortTimeFormat;
                    break;
                default:
                    format = localeSettings.shortDateFormat + ' ' + localeSettings.shortTimeFormat;
                    break;
            }
            return format;
        }
        function buildLongDateTimeFormat(dataType) {
            const localeSettings = getLocaleSettings();
            let format;
            switch (dataType) {
                case DataType.Date:
                    format = localeSettings.longDateFormat;
                    break;
                case DataType.Time:
                    format = localeSettings.longTimeFormat;
                    break;
                default:
                    format = localeSettings.longDateFormat + ' ' + localeSettings.longTimeFormat;
                    break;
            }
            return format;
        }
        /**
        * Converts a numeric value to the string taking into the account the decimal separator
        * @param value - the number to convert
        * @param format - the format of the number representation (D - decimal, F - float, C - currency)
        * @param decimalSeparator - the symbol that represents decimal separator. If not specified the function gets the one from the current locale settings.
        */
        function numberToStr(number, format, decimalSeparator) {
            if (format && format.length > 0) {
                const type = format.charAt(0).toUpperCase();
                if (type === 'S') {
                    return formatWithSequence(number, format.slice(1));
                }
                else if (['D', 'F', 'C'].indexOf(type) >= 0) {
                    const locale = getCurrentLocale();
                    return number.toLocaleString(locale, getNumberFormatOptions(format));
                }
                else {
                    return convertWithMask(Math.trunc(number), format);
                }
            }
            const localeSettings = getLocaleSettings();
            decimalSeparator = decimalSeparator || localeSettings.decimalSeparator;
            return number.toString().replace('.', decimalSeparator);
        }
        i18n.numberToStr = numberToStr;
        function booleanToStr(bool, format) {
            if (format && format.length > 0) {
                const type = format.charAt(0).toUpperCase();
                if (type === 'S') {
                    const values = format.slice(1).split('|');
                    if (values.length > 1) {
                        const value = values[(bool) ? 1 : 0];
                        return i18n.getText(value) || value;
                    }
                }
            }
            return `${bool}`;
        }
        i18n.booleanToStr = booleanToStr;
        const cachedSequenceFormats = {};
        function formatWithSequence(number, format) {
            if (!cachedSequenceFormats[format]) {
                // parse and save in cache format values 
                const values = format.split('|')
                    .filter(v => v.length > 0)
                    .map(v => v.split('='));
                cachedSequenceFormats[format] = {};
                if (values.length > 0) {
                    if (values[0].length > 1) {
                        for (const value of values) {
                            cachedSequenceFormats[format][Number.parseInt(value[1])] = value[0];
                        }
                    }
                    else {
                        values.forEach((value, index) => {
                            cachedSequenceFormats[format][index] = value[0];
                        });
                    }
                }
            }
            const values = cachedSequenceFormats[format];
            if (values[number] !== undefined) {
                const value = values[number];
                return i18n.getText(value) || value;
            }
            return number.toString();
        }
        function convertWithMask(number, mask) {
            let value = number.toString();
            let result = '';
            let index = value.length - 1;
            for (let i = mask.length - 1; i >= 0; i--) {
                const ch = mask.charAt(i);
                if (ch === '#' || ch === '0') {
                    if (index >= 0) {
                        result += value.charAt(index);
                        index--;
                    }
                    else {
                        if (ch === '0') {
                            result += 0;
                        }
                    }
                }
                else {
                    result += ch;
                }
            }
            return result.split('').reverse().join('');
        }
        function getNumberFormatOptions(format) {
            const localeSettings = getLocaleSettings();
            const type = format[0].toUpperCase();
            const digits = (format.length > 1)
                ? Number.parseInt(format.slice(1))
                : type == 'D' ? 1 : 2;
            switch (type) {
                case 'D':
                    return {
                        style: 'decimal',
                        useGrouping: false,
                        minimumIntegerDigits: digits
                    };
                case 'C':
                    return {
                        style: 'currency',
                        currency: localeSettings.currency,
                        minimumFractionDigits: digits
                    };
                default:
                    return {
                        style: 'decimal',
                        minimumFractionDigits: digits,
                        maximumFractionDigits: digits
                    };
            }
        }
    })(i18n || (i18n = {}));

    var ColumnAlignment;
    (function (ColumnAlignment) {
        ColumnAlignment[ColumnAlignment["None"] = 0] = "None";
        ColumnAlignment[ColumnAlignment["Left"] = 1] = "Left";
        ColumnAlignment[ColumnAlignment["Center"] = 2] = "Center";
        ColumnAlignment[ColumnAlignment["Right"] = 3] = "Right";
    })(ColumnAlignment || (ColumnAlignment = {}));

    class DataRow {
        constructor(columns, values) {
            this.columns = columns;
            this.values = values;
        }
        toArray() {
            return Array.from(this.values);
        }
        size() {
            return this.values.length;
        }
        getValue(colIdOrIndex) {
            let index;
            if (typeof colIdOrIndex === "string") {
                index = this.columns.getIndex(colIdOrIndex);
                if (index === undefined) {
                    throw new RangeError(`No column with id '${colIdOrIndex}'`);
                }
            }
            else {
                index = colIdOrIndex;
            }
            if (index >= this.values.length)
                throw new RangeError("Out of range: " + index);
            return this.values[index];
        }
        setValue(colIdOrIndex, value) {
            let index;
            if (typeof colIdOrIndex === "string") {
                index = this.columns.getIndex(colIdOrIndex);
                if (index === undefined) {
                    throw new RangeError(`No column with id '${colIdOrIndex}'`);
                }
            }
            else {
                index = colIdOrIndex;
            }
            if (index >= this.values.length)
                throw new RangeError("Out of range: " + index);
            this.values[index] = value;
        }
    }

    /**
     * EasyData representation of GUID.
     */
    class EasyGuid {
        /**
         * Generates new GUID.
         * @returns The string representation of GUID.
         */
        static newGuid() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }
    }

    /**
     * The representation of event emitter.
     */
    class EventEmitter {
        /**
         * The default constructor.
         * @param source The source.
         */
        constructor(source) {
            this.silentMode = 0;
            this.events = new Array();
            this.source = source;
        }
        /**
         * Subscries to the event.
         * @param eventType The event type.
         * @param callback The callback.
         * @returns The subscribtion ID.
         */
        subscribe(eventType, callback) {
            let event = this.getEventRecByType(eventType);
            const eventCallback = {
                id: EasyGuid.newGuid(),
                callback: callback
            };
            if (event) {
                event.eventCallbacks.push(eventCallback);
            }
            else {
                event = {
                    type: eventType,
                    eventCallbacks: new Array(eventCallback)
                };
                this.events.push(event);
            }
            return eventCallback.id;
        }
        /**
         * Unsubsribes from the event.
         * @param eventType The event type.
         * @param callbackId The subscribtion ID.
         */
        unsubscribe(eventType, callbackId) {
            let event = this.getEventRecByType(eventType);
            if (event) {
                let index = -1;
                for (index = 0; index < event.eventCallbacks.length; index++) {
                    if (event.eventCallbacks[index].id === callbackId) {
                        break;
                    }
                }
                if (index >= 0) {
                    event.eventCallbacks.splice(index, 1);
                }
            }
        }
        /**
         * Fires the event.
         * @param eventType The event type.
         * @param data The event data.
         * @param postpone  The postpone.
         * @param force To fire force. If value is `true`, ignores silent mode.
         */
        fire(eventType, data, postpone = 0, force = false) {
            if (this.silentMode && !force) {
                return;
            }
            let eventRec = this.getEventRecByType(eventType);
            if (eventRec) {
                const eqevent = {
                    type: eventType,
                    source: this.source,
                    data: data
                };
                let emitAllFunc = () => {
                    for (let callback of eventRec.eventCallbacks) {
                        callback.callback(eqevent);
                    }
                };
                if (postpone > 0) {
                    setTimeout(emitAllFunc, postpone);
                }
                else {
                    emitAllFunc();
                }
            }
        }
        /**
         * Enters to silent mode.
         */
        enterSilentMode() {
            this.silentMode++;
        }
        /**
         * Exits from silent mode.
         */
        exitSilentMode() {
            if (this.silentMode) {
                this.silentMode--;
            }
        }
        /**
         * Checks if emitter is in silent mode.
         * @return `true`, if silent mode is enable.
         */
        isSilent() {
            return this.silentMode > 0;
        }
        getEventRecByType(eventType) {
            for (let event of this.events) {
                if (event.type == eventType) {
                    return event;
                }
            }
            return null;
        }
    }

    var liquid;
    (function (liquid) {
        function renderLiquidTemplate(template, vars) {
            let result = template;
            if (vars) {
                for (let v in vars) {
                    const liquidVarRegexp = new RegExp('\{\{' + v + '\}\}', 'g');
                    result = result.replace(liquidVarRegexp, vars[v]);
                }
            }
            return result;
        }
        liquid.renderLiquidTemplate = renderLiquidTemplate;
    })(liquid || (liquid = {}));

    i18n.resetLocales();

    //types
    if (typeof Object.values !== 'function') {
        Object.values = function (obj) {
            return Object.keys(obj).map(key => obj[key]);
        };
    }
    if (typeof Math.trunc !== 'function') {
        Math.trunc = function (x) {
            if (isNaN(x)) {
                return NaN;
            }
            if (x > 0) {
                return Math.floor(x);
            }
            return Math.ceil(x);
        };
    }

    var browserUtils;
    (function (browserUtils) {
        let _isFirefox = null;
        let _isIE = null;
        function IsIE() {
            if (_isIE === null) {
                const ua = navigator.userAgent;
                /* MSIE used to detect old browsers and Trident used to newer ones*/
                _isIE = ua.indexOf("MSIE ") > -1 || ua.indexOf("Trident/") > -1;
            }
            return _isIE;
        }
        browserUtils.IsIE = IsIE;
        function IsEdge() {
            const ua = window.navigator.userAgent;
            return !IsIE() && ua.includes('Edge/');
        }
        browserUtils.IsEdge = IsEdge;
        function IsFirefox() {
            if (_isFirefox === null) {
                const ua = navigator.userAgent;
                _isFirefox = ua.toLowerCase().indexOf('firefox') > -1;
            }
            return _isFirefox;
        }
        browserUtils.IsFirefox = IsFirefox;
        let _detectedIsMobileMode = false;
        let _isMobileMode = undefined;
        let detectIsMobileMode = () => {
            const oldValue = isMobileMode();
            _detectedIsMobileMode = window.matchMedia('only screen and (max-width: 840px)').matches
                || window.matchMedia('only screen and (max-height: 420px)').matches;
            const newValue = isMobileMode();
            if (newValue !== oldValue && mobileModeChangeHandler) {
                mobileModeChangeHandler(newValue);
            }
        };
        detectIsMobileMode();
        window.addEventListener('resize', () => detectIsMobileMode());
        function isMobileMode() {
            if (_isMobileMode !== undefined) {
                return _isMobileMode;
            }
            else {
                return _detectedIsMobileMode;
            }
        }
        browserUtils.isMobileMode = isMobileMode;
        function setIsMobileMode(value) {
            const oldValue = isMobileMode();
            _isMobileMode = value;
            const newValue = isMobileMode();
            if (newValue !== oldValue && mobileModeChangeHandler) {
                mobileModeChangeHandler(newValue);
            }
        }
        browserUtils.setIsMobileMode = setIsMobileMode;
        let mobileModeChangeHandler;
        function onMobileModeChanged(callback) {
            mobileModeChangeHandler = callback;
        }
        browserUtils.onMobileModeChanged = onMobileModeChanged;
        function getMobileCssClass() {
            return isMobileMode() ? 'k-mobile' : null;
        }
        browserUtils.getMobileCssClass = getMobileCssClass;
    })(browserUtils || (browserUtils = {}));
    function getScrollPos() {
        const body = document.body;
        const docElem = document.documentElement;
        return {
            top: window.pageYOffset || docElem.scrollTop || body.scrollTop,
            left: window.pageXOffset || docElem.scrollLeft || body.scrollLeft
        };
    }
    function getElementAbsolutePos(element) {
        let res = { x: 0, y: 0 };
        if (element !== null) {
            const position = offset(element);
            res = { x: position.left, y: position.top };
        }
        return res;
    }
    function offset(element) {
        const defaultBoundingClientRect = { top: 0, right: 0, bottom: 0, left: 0, width: 0, height: 0 };
        let box;
        try {
            box = element.getBoundingClientRect();
        }
        catch (_a) {
            box = defaultBoundingClientRect;
        }
        const body = document.body;
        const docElem = document.documentElement;
        const scollPos = getScrollPos();
        const scrollTop = scollPos.top;
        const scrollLeft = scollPos.left;
        const clientTop = docElem.clientTop || body.clientTop || 0;
        const clientLeft = docElem.clientLeft || body.clientLeft || 0;
        const top = box.top + scrollTop - clientTop;
        const left = box.left + scrollLeft - clientLeft;
        return { top: Math.round(top), left: Math.round(left) };
    }
    const eqCssPrefix = 'eqjs';

    function mask(input, maskPattern) {
        const d = { 9: '[0-9]', a: '[a-z]' };
        const mask = maskPattern.split('');
        const keyDownHandler = (e) => {
            // backspace key or delete key
            if (e.keyCode === 8 || e.keyCode === 46) {
                e.preventDefault();
                let mskd = [];
                let startSelection = input.selectionStart;
                if (startSelection == 0)
                    return;
                let selection = startSelection;
                let onlyLodash = true;
                for (let index = mask.length - 1; index >= 0; index--) {
                    const el = mask[index];
                    if (d[el]) {
                        let t = new RegExp(d[el], 'i').test(input.value.charAt(index));
                        if (t && index != startSelection - 1) {
                            onlyLodash = false;
                        }
                        if (index === startSelection - 1)
                            selection--;
                        mskd.push(t && index != startSelection - 1
                            ? input.value.charAt(index)
                            : '_');
                    }
                    else {
                        if (index === selection - 1)
                            selection--;
                        if (startSelection - 1 === index)
                            startSelection--;
                        mskd.push(el);
                    }
                }
                input.value = !onlyLodash ? mskd.reverse().join('') : '';
                input.selectionStart = input.selectionEnd = selection < 0 ? 0 : selection;
                const event = document.createEvent('Event');
                event.initEvent('input', true, true);
                input.dispatchEvent(event);
            }
        };
        const keyPressHandler = (e) => {
            const char = String.fromCharCode(e.charCode);
            if (char) {
                e.preventDefault();
                let mskd = [];
                let selectionStart = input.selectionStart;
                let selection = selectionStart;
                mask.forEach((el, index) => {
                    if (d[el]) {
                        const ch = (index != selectionStart)
                            ? input.value.charAt(index)
                            : char;
                        let t = new RegExp(d[el], 'i').test(ch);
                        mskd.push(t ? ch : '_');
                        if (t && selectionStart === index)
                            selection++;
                    }
                    else {
                        mskd.push(el);
                        if (selection === index)
                            selection++;
                        if (selectionStart === index)
                            selectionStart++;
                    }
                });
                input.value = mskd.join('');
                input.selectionStart = input.selectionEnd = selection;
                const event = document.createEvent('Event');
                event.initEvent('input', true, true);
                input.dispatchEvent(event);
            }
        };
        const inputHandler = (e) => {
            if (e.type === 'focus' && input.value !== '')
                return;
            let mskd = [];
            let startSelection = input.selectionStart;
            mask.forEach((el, index) => {
                if (d[el]) {
                    let t = new RegExp(d[el], 'i').test(input.value.charAt(index));
                    mskd.push(t ? input.value.charAt(index) : '_');
                }
                else {
                    mskd.push(el);
                }
            });
            input.value = mskd.join('');
            input.selectionStart = input.selectionEnd = startSelection;
        };
        input.addEventListener('keydown', keyDownHandler);
        input.addEventListener('keypress', keyPressHandler);
        input.addEventListener('input', inputHandler);
        input.addEventListener('focus', inputHandler);
    }

    class DomElementBuilder {
        constructor(tag, parent) {
            if (typeof tag === "string") {
                this.element = document.createElement(tag);
            }
            else {
                this.element = tag;
            }
            if (parent && this.element.parentElement !== parent) {
                parent.appendChild(this.element);
            }
        }
        addChild(tag, childBuilder) {
            const builder = domel(tag, this.element);
            if (childBuilder) {
                childBuilder(builder);
            }
            return this;
        }
        addChildElement(element) {
            if (element) {
                this.element.appendChild(element);
            }
            return this;
        }
        attr(attrId, attrValue) {
            this.element.setAttribute(attrId, attrValue);
            return this;
        }
        id(value) {
            return this.attr("id", value);
        }
        focus() {
            this.element.focus();
            return this;
        }
        title(value) {
            return this.attr('title', value);
        }
        data(dataId, dataValue = null) {
            if (dataValue === null) {
                this.element.removeAttribute('data-' + dataId);
                return this;
            }
            else {
                return this.attr('data-' + dataId, dataValue);
            }
        }
        show() {
            return this.removeStyle('display');
        }
        hide(toHide = true) {
            return (toHide) ? this.setStyle('display', 'none') : this;
        }
        visible(isVisible = true) {
            return isVisible ? this.setStyle('visibility', 'visible') : this.setStyle('visibility', 'hidden');
        }
        isVisible() {
            return !!(this.element.offsetWidth || this.element.offsetHeight || this.element.getClientRects().length);
        }
        addClass(className, ...classNames) {
            if (className) {
                const fullList = [...className.trim().split(" "), ...classNames];
                for (let i = 0; i < fullList.length; i++)
                    this.element.classList.add(fullList[i]);
            }
            return this;
        }
        removeClass(className, ...classNames) {
            if (className) {
                const fullList = [...className.trim().split(" "), ...classNames];
                for (let i = 0; i < fullList.length; i++)
                    this.element.classList.remove(fullList[i]);
            }
            return this;
        }
        toggleClass(className, force = undefined) {
            if (className) {
                this.element.classList.toggle(className, force);
            }
            return this;
        }
        on(eventType, listener) {
            const eventTypes = eventType.split(' ');
            for (let i = 0; i < eventTypes.length; i++) {
                this.element.addEventListener(eventTypes[i], listener);
            }
            return this;
        }
        off(eventType, listener) {
            const eventTypes = eventType.split(' ');
            for (let i = 0; i < eventTypes.length; i++) {
                this.element.removeEventListener(eventTypes[i], listener);
            }
            return this;
        }
        setStyle(styleId, styleValue) {
            this.element.style.setProperty(styleId, styleValue);
            return this;
        }
        removeStyle(styleId) {
            this.element.style.removeProperty(styleId);
            return this;
        }
        text(text) {
            this.element.innerText = text;
            return this;
        }
        html(html) {
            this.element.innerHTML = html;
            return this;
        }
        clear() {
            const oldElem = this.element;
            this.element = document.createElement(this.element.tagName);
            oldElem.replaceWith(this.element);
        }
        addText(text) {
            const textEl = document.createTextNode(text);
            this.element.appendChild(textEl);
            return this;
        }
        addHtml(html) {
            this.element.innerHTML += html;
            return this;
        }
        toDOM() {
            return this.element;
        }
        appendTo(parent) {
            if (parent) {
                parent.appendChild(this.element);
            }
            return this;
        }
    }
    class DomTextAreaElementBuilder extends DomElementBuilder {
        constructor(element, parent) {
            if (element) {
                super(element, parent);
            }
            else {
                super("textarea", parent);
            }
        }
        name(value) {
            this.element.name = value;
            return this;
        }
        rows(rows) {
            this.element.rows = rows;
            return this;
        }
        cols(cols) {
            this.element.cols = cols;
            return this;
        }
        value(value) {
            this.element.value = value;
            return this;
        }
    }
    class DomInputElementBuilder extends DomElementBuilder {
        constructor(element, parent) {
            if (element) {
                super(element, parent);
            }
            else {
                super("input", parent);
            }
        }
        name(value) {
            this.element.name = value;
            return this;
        }
        type(value) {
            this.element.type = value;
            return this;
        }
        size(value) {
            this.element.size = value;
            return this;
        }
        value(value) {
            if (value instanceof Date) {
                this.element.valueAsDate = value;
            }
            else if (typeof value === "number") {
                this.element.valueAsNumber = value;
            }
            else {
                this.element.value = value;
            }
            return this;
        }
        mask(maskPattern) {
            mask(this.element, maskPattern);
            return this;
        }
    }
    class DomSelectElementBuilder extends DomElementBuilder {
        constructor(element, parent) {
            if (element) {
                super(element, parent);
            }
            else {
                super("select", parent);
            }
        }
        addOption(value) {
            const option = document.createElement('option');
            if (typeof value === "string") {
                option.value = value;
                option.innerHTML = value;
            }
            else {
                option.value = value.value;
                option.innerHTML = value.title || value.value;
                option.selected = value.selected || false;
            }
            this.element.appendChild(option);
            return this;
        }
        value(value) {
            this.element.value = value;
            return this;
        }
    }
    function domel(tag, parent) {
        if (tag === "div" || tag instanceof HTMLDivElement) {
            return new DomElementBuilder(tag, parent);
        }
        if (tag === "span" || tag instanceof HTMLSpanElement) {
            return new DomElementBuilder(tag, parent);
        }
        else if (tag === "a" || tag instanceof HTMLAnchorElement) {
            return new DomElementBuilder(tag, parent);
        }
        else if (tag === "button" || tag instanceof HTMLButtonElement) {
            return new DomElementBuilder(tag, parent);
        }
        else if (tag === "img" || tag instanceof HTMLImageElement) {
            return new DomElementBuilder(tag, parent);
        }
        else if (tag === "input" || tag instanceof HTMLInputElement) {
            return new DomInputElementBuilder(tag instanceof HTMLInputElement ? tag : null, parent);
        }
        else if (tag === "textarea" || tag instanceof HTMLTextAreaElement) {
            return new DomTextAreaElementBuilder(tag instanceof HTMLTextAreaElement ? tag : null, parent);
        }
        else if (tag === "select" || tag instanceof HTMLSelectElement) {
            return new DomSelectElementBuilder(tag instanceof HTMLSelectElement ? tag : null, parent);
        }
        return new DomElementBuilder(tag, parent);
    }

    const touchEventIsDefined = typeof TouchEvent !== 'undefined';
    var DropEffect;
    (function (DropEffect) {
        DropEffect["None"] = "none";
        DropEffect["Allow"] = "allow";
        DropEffect["Forbid"] = "forbid";
    })(DropEffect || (DropEffect = {}));
    class EqDragEvent {
        constructor(item, dragImage, sourceEvent) {
            this.dropEffect = DropEffect.Allow;
            this.pageX = 0;
            this.pageY = 0;
            this.item = item;
            this.dragImage = dragImage;
            this.data = item.data;
            this.sourceEvent = sourceEvent;
            if (sourceEvent && sourceEvent instanceof MouseEvent) {
                this.pageX = sourceEvent.pageX,
                    this.pageY = sourceEvent.pageY;
            }
            if (sourceEvent && touchEventIsDefined && sourceEvent instanceof TouchEvent
                && sourceEvent.touches[0]) {
                this.pageX = sourceEvent.touches[0].pageX,
                    this.pageY = sourceEvent.touches[0].pageY;
            }
        }
    }
    class Position {
        constructor(ev) {
            if (ev && ev instanceof MouseEvent) {
                this.x = ev.pageX,
                    this.y = ev.pageY;
            }
            if (ev && touchEventIsDefined && ev instanceof TouchEvent && ev.touches[0]) {
                this.x = ev.touches[0].pageX,
                    this.y = ev.touches[0].pageY;
            }
        }
    }
    class DragManager {
        constructor() {
            this.delta = 5;
            this.draggableItem = null;
            this.dragImage = null;
            this.finishedSuccessfully = false;
            this.mouseDownPosition = null;
            this.containerDescriptors = [];
            this.containerDescriptorIndex = -1;
            this.dropEffect = DropEffect.None;
            this.classPrefix = 'eqjs-drop';
            this.DRAG_DISABLED_ATTR = 'drag-disabled';
        }
        registerDraggableItem(descriptor) {
            const element = descriptor.element;
            if (!element) {
                throw Error("Element in draggle item is null or undefined");
            }
            element.ondragstart = function () {
                return false;
            };
            const detectDragging = (ev) => {
                if (element.hasAttribute(this.DRAG_DISABLED_ATTR)) {
                    return;
                }
                ev.preventDefault();
                if (ev instanceof MouseEvent) {
                    ev.stopPropagation();
                }
                const cursorPosition = new Position(ev);
                if (Math.abs(cursorPosition.x - this.mouseDownPosition.x) > this.delta
                    || Math.abs(cursorPosition.y - this.mouseDownPosition.y) > this.delta) {
                    startDragging(ev);
                }
            };
            const mouseMoveEventListener = (ev) => {
                this.mouseMoveDragListener(ev);
            };
            const startDragging = (ev) => {
                ev.preventDefault();
                ev.stopPropagation();
                element.removeEventListener('mousemove', detectDragging);
                element.removeEventListener('touchmove', detectDragging);
                this.finishedSuccessfully = false;
                if (descriptor.beforeDragStart)
                    descriptor.beforeDragStart();
                this.dragImage = domel('div')
                    .setStyle('position', 'absolute')
                    .setStyle('z-index', '65530')
                    .toDOM();
                document.body.appendChild(this.dragImage);
                this.dragImage.appendChild(element.cloneNode(true));
                if (descriptor.renderer) {
                    descriptor.renderer(this.dragImage);
                }
                this.dropEffect = DropEffect.None;
                this.updateCusror(this.dropEffect);
                this.updateImageClass(this.dropEffect);
                this.draggableItem = {
                    element: element,
                    scope: descriptor.scope,
                    data: descriptor.data
                };
                this.updateDragItemPosition(ev);
                const event = new EqDragEvent(this.draggableItem, this.dragImage, ev);
                event.dropEffect = this.dropEffect;
                if (descriptor.onDragStart) {
                    descriptor.onDragStart(event);
                }
                if (this.dropEffect !== event.dropEffect) {
                    this.dropEffect = event.dropEffect;
                    this.updateImageClass(this.dropEffect);
                }
                document.addEventListener('mousemove', mouseMoveEventListener, true);
                document.addEventListener('touchmove', mouseMoveEventListener, true);
            };
            const mouseDownListener = (ev) => {
                if (touchEventIsDefined && ev instanceof TouchEvent) {
                    ev.preventDefault();
                }
                this.mouseDownPosition = new Position(ev);
                element.addEventListener('mousemove', detectDragging);
                element.addEventListener('touchmove', detectDragging);
                document.addEventListener('mouseup', mouseUpListener);
                document.addEventListener('touchend', mouseUpListener);
            };
            element.addEventListener('mousedown', mouseDownListener);
            element.addEventListener('touchstart', mouseDownListener);
            const mouseUpListener = (ev) => {
                this.mouseDownPosition = null;
                element.removeEventListener('mousemove', detectDragging);
                element.removeEventListener('touchmove', detectDragging);
                document.removeEventListener('mousemove', mouseMoveEventListener, true);
                document.removeEventListener('touchmove', mouseMoveEventListener, true);
                if (this.draggableItem) {
                    endDraggind(ev);
                }
            };
            const endDraggind = (ev) => {
                try {
                    if (this.containerDescriptorIndex >= 0) {
                        const dropContDesc = this.containerDescriptors[this.containerDescriptorIndex];
                        const container = {
                            element: dropContDesc.element,
                            scopes: dropContDesc.scopes,
                            data: dropContDesc.data
                        };
                        const event = new EqDragEvent(this.draggableItem, this.dragImage, ev);
                        try {
                            if (container.scopes.indexOf(this.draggableItem.scope) >= 0
                                && this.dropEffect === DropEffect.Allow) {
                                this.finishedSuccessfully = true;
                                if (dropContDesc.onDrop) {
                                    dropContDesc.onDrop(container, event);
                                }
                            }
                        }
                        finally {
                            if (dropContDesc.onDragLeave) {
                                dropContDesc.onDragLeave(container, event);
                            }
                        }
                    }
                }
                finally {
                    try {
                        const event = new EqDragEvent(this.draggableItem, this.dragImage, ev);
                        event.data.finishedSuccessfully = this.finishedSuccessfully;
                        if (descriptor.onDragEnd) {
                            descriptor.onDragEnd(event);
                        }
                    }
                    finally {
                        this.draggableItem = null;
                        if (this.dragImage && this.dragImage.parentElement) {
                            this.dragImage.parentElement.removeChild(this.dragImage);
                        }
                        this.dragImage = null;
                        this.finishedSuccessfully = false;
                        document.removeEventListener('mouseup', mouseUpListener);
                        document.removeEventListener('touchend', mouseUpListener);
                    }
                }
            };
        }
        registerDropContainer(descriptor) {
            const element = descriptor.element;
            if (!element) {
                throw Error("Element in drop container is null or undefined");
            }
            this.containerDescriptors.push(descriptor);
        }
        removeDropContainer(descriptorOrSlot) {
            const descs = this.containerDescriptors
                .filter(desc => desc === descriptorOrSlot
                || desc.element == descriptorOrSlot);
            if (descs) {
                for (const desc of descs) {
                    utils.removeArrayItem(this.containerDescriptors, desc);
                }
            }
        }
        mouseMoveDragListener(ev) {
            if (ev instanceof MouseEvent) {
                ev.preventDefault();
            }
            ev.stopPropagation();
            this.updateDragItemPosition(ev);
            if (this.containerDescriptorIndex == -1) {
                for (let i = 0; i < this.containerDescriptors.length; i++) {
                    const descriptor = this.containerDescriptors[i];
                    if (this.detectDragEnterEvent(descriptor.element, ev)) {
                        this.containerDescriptorIndex = i;
                        break;
                    }
                }
                if (this.containerDescriptorIndex >= 0) {
                    this.dragEnterEvent(ev);
                }
            }
            else {
                const descriptor = this.containerDescriptors[this.containerDescriptorIndex];
                if (this.detectDragLeaveEvent(descriptor.element, ev)) {
                    this.dragLeaveEvent(ev);
                    this.containerDescriptorIndex = -1;
                }
            }
            if (this.containerDescriptorIndex >= 0) {
                const descriptor = this.containerDescriptors[this.containerDescriptorIndex];
                const container = {
                    element: descriptor.element,
                    scopes: descriptor.scopes,
                    data: descriptor.data
                };
                if (container.scopes.indexOf(this.draggableItem.scope) >= 0) {
                    const event = new EqDragEvent(this.draggableItem, this.dragImage, ev);
                    event.dropEffect = this.dropEffect;
                    if (descriptor.onDragOver) {
                        descriptor.onDragOver(container, event);
                    }
                }
            }
        }
        updateCusror(dropEffect) {
            switch (dropEffect) {
                case DropEffect.Allow:
                    this.setCursorStyle(this.dragImage, 'grabbing');
                    break;
                case DropEffect.Forbid:
                    this.setCursorStyle(this.dragImage, 'no-drop');
                    break;
                default:
                    this.setCursorStyle(this.dragImage, 'grabbing');
                    break;
            }
        }
        updateImageClass(dropEffect) {
            this.dragImage.classList.remove(`${this.classPrefix}-allow`);
            this.dragImage.classList.remove(`${this.classPrefix}-forbid`);
            this.dragImage.classList.remove(`${this.classPrefix}-none`);
            switch (dropEffect) {
                case DropEffect.Allow:
                    this.dragImage.classList.add(`${this.classPrefix}-allow`);
                    break;
                case DropEffect.None:
                    this.dragImage.classList.add(`${this.classPrefix}-none`);
                    break;
                case DropEffect.Forbid:
                    this.dragImage.classList.add(`${this.classPrefix}-forbid`);
                    break;
                default:
                    this.dragImage.classList.add(`${this.classPrefix}-none`);
                    break;
            }
        }
        setCursorStyle(element, cursor) {
            if (element) {
                element.style.cursor = cursor;
                for (let i = 0; i < element.children.length; i++) {
                    this.setCursorStyle(element.children[i], cursor);
                }
            }
        }
        updateDragItemPosition(ev) {
            if (this.dragImage) {
                const pos = new Position(ev);
                this.dragImage.style.top = (pos.y - this.dragImage.offsetHeight / 2) + 'px';
                this.dragImage.style.left = (pos.x - this.dragImage.offsetWidth / 2) + 'px';
            }
        }
        dragEnterEvent(ev) {
            const descriptor = this.containerDescriptors[this.containerDescriptorIndex];
            const container = {
                element: descriptor.element,
                scopes: descriptor.scopes,
                data: descriptor.data
            };
            if (container.scopes.indexOf(this.draggableItem.scope) >= 0) {
                const event = new EqDragEvent(this.draggableItem, this.dragImage, ev);
                event.dropEffect = DropEffect.Allow;
                if (descriptor.onDragEnter) {
                    descriptor.onDragEnter(container, event);
                }
                this.dropEffect = event.dropEffect;
                this.updateCusror(this.dropEffect);
                this.updateImageClass(this.dropEffect);
            }
            else {
                if (this.dropEffect !== DropEffect.Forbid) {
                    this.dropEffect = DropEffect.None;
                    this.updateCusror(this.dropEffect);
                    this.updateImageClass(this.dropEffect);
                }
            }
        }
        dragLeaveEvent(ev) {
            const descriptor = this.containerDescriptors[this.containerDescriptorIndex];
            const container = {
                element: descriptor.element,
                scopes: descriptor.scopes,
                data: descriptor.data
            };
            if (container.scopes.indexOf(this.draggableItem.scope) >= 0) {
                const event = new EqDragEvent(this.draggableItem, this.dragImage, ev);
                event.dropEffect = DropEffect.None;
                if (descriptor.onDragLeave) {
                    descriptor.onDragLeave(container, event);
                }
                this.dropEffect = event.dropEffect;
                this.updateCusror(this.dropEffect);
                this.updateImageClass(this.dropEffect);
            }
        }
        detectDragEnterEvent(container, ev) {
            const containerPos = getElementAbsolutePos(container);
            const pos = new Position(ev);
            if (pos.y < containerPos.y || pos.y > containerPos.y + container.offsetHeight) {
                return false;
            }
            if (pos.x < containerPos.x || pos.x > containerPos.x + container.offsetWidth) {
                return false;
            }
            return true;
        }
        detectDragLeaveEvent(container, ev) {
            const containerPos = getElementAbsolutePos(container);
            const pos = new Position(ev);
            if (pos.y > containerPos.y && pos.y < containerPos.y + container.offsetHeight
                && pos.x > containerPos.x && pos.x < containerPos.x + container.offsetWidth) {
                return false;
            }
            return true;
        }
    }
    //global variable
    const eqDragManager = new DragManager();

    var AutoResizeColumns;
    (function (AutoResizeColumns) {
        AutoResizeColumns[AutoResizeColumns["Always"] = 0] = "Always";
        AutoResizeColumns[AutoResizeColumns["Once"] = 1] = "Once";
        AutoResizeColumns[AutoResizeColumns["Never"] = 2] = "Never";
    })(AutoResizeColumns || (AutoResizeColumns = {}));

    //import { CellRendererType } from "./easy_grid_cell_renderer";
    //import { GridCellRenderer } from './easy_grid_cell_renderer';
    const DEFAULT_WIDTH_STRING = 250;
    const ROW_NUM_WIDTH = 60;
    var GridColumnAlign;
    (function (GridColumnAlign) {
        GridColumnAlign[GridColumnAlign["NONE"] = 1] = "NONE";
        GridColumnAlign[GridColumnAlign["LEFT"] = 2] = "LEFT";
        GridColumnAlign[GridColumnAlign["CENTER"] = 3] = "CENTER";
        GridColumnAlign[GridColumnAlign["RIGHT"] = 4] = "RIGHT";
    })(GridColumnAlign || (GridColumnAlign = {}));
    function MapAlignment(alignment) {
        switch (alignment) {
            case ColumnAlignment.Left:
                return GridColumnAlign.LEFT;
            case ColumnAlignment.Center:
                return GridColumnAlign.CENTER;
            case ColumnAlignment.Right:
                return GridColumnAlign.RIGHT;
            default:
                return GridColumnAlign.NONE;
        }
    }
    class GridColumn {
        constructor(column, grid, isRowNum = false) {
            this._label = null;
            this._description = null;
            //public left: number;
            this.align = GridColumnAlign.NONE;
            this.isVisible = true;
            this.isRowNum = false;
            this.dataColumn = column;
            this.grid = grid;
            const widthOptions = grid.options.columnWidths || {};
            if (column) {
                if (column.style.alignment) {
                    this.align = MapAlignment(column.style.alignment);
                }
                this.width = (widthOptions && widthOptions[this.type]) ? widthOptions[this.type].default : DEFAULT_WIDTH_STRING;
                this._description = column.description;
            }
            else if (isRowNum) {
                this.isRowNum = true;
                this.width = (widthOptions && widthOptions.rowNumColumn) ? widthOptions.rowNumColumn.default : ROW_NUM_WIDTH;
                this._label = '';
            }
        }
        get label() {
            return this._label ? this._label : this.isRowNum ? '' : this.dataColumn.label;
        }
        ;
        set label(value) {
            this._label = this.label;
        }
        /** Get column description. */
        get description() {
            return this._description;
        }
        get type() {
            return this.dataColumn ? this.dataColumn.type : null;
        }
    }
    class GridColumnList {
        constructor(columnList, grid) {
            this.items = [];
            this.grid = grid;
            this.sync(columnList);
        }
        sync(columnList, hasRowNumCol = true) {
            this.clear();
            const rowNumCol = new GridColumn(null, this.grid, true);
            this.add(rowNumCol);
            if (!hasRowNumCol) {
                rowNumCol.isVisible = false;
            }
            if (columnList) {
                for (let column of columnList.getItems()) {
                    const col = new GridColumn(column, this.grid);
                    if (this.grid.options.onSyncGridColumn) {
                        this.grid.options.onSyncGridColumn(col);
                    }
                    this.add(col);
                }
            }
        }
        get count() {
            return this.items.length;
        }
        add(col) {
            const index = this.items.length;
            this.items.push(col);
            return index;
        }
        put(index, col) {
            if (index >= 0 && index < this.items.length) {
                this.items[index] = col;
            }
        }
        move(col, newIndex) {
            let oldIndex = this.items.indexOf(col);
            if (oldIndex >= 0 && oldIndex != newIndex)
                utils.moveArrayItem(this.items, oldIndex, newIndex);
        }
        get(index) {
            if (index >= 0 && index < this.items.length) {
                return this.items[index];
            }
            else {
                return null;
            }
        }
        //    public getIndex(name: string) : number {
        //        return this.mapper[name];
        //    }
        getItems() {
            return this.items;
        }
        removeAt(index) {
            this.get(index);
            this.items.splice(index, 1);
            //delete this.mapper[col.name];
        }
        clear() {
            this.items = [];
            //this.mapper = {};
        }
    }

    const cssPrefix$1 = "keg";
    const DFMT_REGEX = /{0:(.*?)}/g;
    var CellRendererType;
    (function (CellRendererType) {
        CellRendererType[CellRendererType["STRING"] = 1] = "STRING";
        CellRendererType[CellRendererType["NUMBER"] = 2] = "NUMBER";
        CellRendererType[CellRendererType["DATETIME"] = 3] = "DATETIME";
        CellRendererType[CellRendererType["BOOL"] = 4] = "BOOL";
    })(CellRendererType || (CellRendererType = {}));
    const StringCellRendererDefault = (value, column, cellValueElement, rowElement) => {
        const text = value ? value.toString().replace(/\n/g, '\u21B5 ') : '';
        cellValueElement.innerText = text;
        cellValueElement.title = text;
        if (column.align == GridColumnAlign.NONE) {
            cellValueElement.classList.add(`${cssPrefix$1}-cell-value-align-left`);
        }
    };
    const NumberCellRendererDefault = (value, column, cellValueElement, rowElement) => {
        let strValue = (value || '').toString();
        if (typeof value == 'number') {
            if (column.dataColumn && column.dataColumn.displayFormat
                && DFMT_REGEX.test(column.dataColumn.displayFormat)) {
                strValue = column.dataColumn.displayFormat.replace(DFMT_REGEX, (_, $1) => {
                    return i18n.numberToStr(value, $1);
                });
            }
            else {
                strValue = value.toLocaleString();
            }
        }
        cellValueElement.innerText = strValue;
        cellValueElement.title = strValue;
        if (column.align == GridColumnAlign.NONE) {
            cellValueElement.classList.add(`${cssPrefix$1}-cell-value-align-right`);
        }
    };
    const DateTimeCellRendererDefault = (value, column, cellValueElement, rowElement) => {
        const isDate = Object.prototype.toString.call(value) === '[object Date]';
        let strValue = (value || '').toString();
        if (isDate) {
            if (column.dataColumn && column.dataColumn.displayFormat
                && DFMT_REGEX.test(column.dataColumn.displayFormat)) {
                strValue = column.dataColumn.displayFormat.replace(DFMT_REGEX, (_, $1) => {
                    return i18n.dateTimeToStrEx(value, column.type, $1);
                });
            }
            else {
                const locale = i18n.getCurrentLocale();
                const timeOptions = { hour: 'numeric', minute: 'numeric', second: 'numeric' };
                switch (column.type) {
                    case DataType.Date:
                        strValue = value.toLocaleDateString(locale);
                        break;
                    case DataType.Time:
                        strValue = value.toLocaleTimeString(locale, timeOptions);
                        break;
                    case DataType.DateTime:
                        strValue = `${value.toLocaleDateString(locale)} ${value.toLocaleTimeString(locale, timeOptions)}`;
                        break;
                }
            }
        }
        cellValueElement.innerText = strValue;
        cellValueElement.title = strValue;
        if (column.align == GridColumnAlign.NONE) {
            cellValueElement.classList.add(`${cssPrefix$1}-cell-value-align-right`);
        }
    };
    const BoolCellRendererDefault = (value, column, cellValueElement, rowElement) => {
        if (column.dataColumn && column.dataColumn.displayFormat
            && DFMT_REGEX.test(column.dataColumn.displayFormat)) {
            const strValue = column.dataColumn.displayFormat.replace(DFMT_REGEX, (_, $1) => {
                return i18n.booleanToStr(value, $1);
            });
            return StringCellRendererDefault(strValue, column, cellValueElement);
        }
        else {
            cellValueElement.classList.add(`${cssPrefix$1}-cell-value-bool`);
            cellValueElement.classList.add(`${cssPrefix$1}-${value ? 'cell-value-true' : 'cell-value-false'}`);
        }
    };
    class GridCellRendererStore {
        constructor(options) {
            this.renderers = {};
            this.defaultRenderers = {};
            this.registerRenderer('StringDefault', StringCellRendererDefault);
            this.setDefaultRenderer(CellRendererType.STRING, StringCellRendererDefault);
            this.registerRenderer('NumberDefault', NumberCellRendererDefault);
            this.setDefaultRenderer(CellRendererType.NUMBER, NumberCellRendererDefault);
            this.registerRenderer('DateTimeDefault', DateTimeCellRendererDefault);
            this.setDefaultRenderer(CellRendererType.DATETIME, DateTimeCellRendererDefault);
            this.registerRenderer('BoolDefault', BoolCellRendererDefault);
            this.setDefaultRenderer(CellRendererType.BOOL, BoolCellRendererDefault);
        }
        getDefaultRenderer(columnType) {
            const cellType = this.getCellType(columnType);
            return this.defaultRenderers[CellRendererType[cellType]];
        }
        getDefaultRendererByType(rendererType) {
            return this.defaultRenderers[CellRendererType[rendererType]];
        }
        setDefaultRenderer(cellType, renderer) {
            if (renderer) {
                this.defaultRenderers[CellRendererType[cellType]] = renderer;
            }
        }
        getRenderer(name) {
            return this.renderers[name];
        }
        registerRenderer(name, renderer) {
            this.renderers[name] = renderer;
        }
        getCellType(dataType) {
            switch (dataType) {
                case DataType.Autoinc:
                case DataType.Byte:
                case DataType.Word:
                case DataType.Currency:
                case DataType.Float:
                case DataType.Int32:
                case DataType.Int64:
                    return CellRendererType.NUMBER;
                case DataType.Date:
                case DataType.DateTime:
                case DataType.Time:
                    return CellRendererType.DATETIME;
                case DataType.Bool:
                    return CellRendererType.BOOL;
                default:
                    return CellRendererType.STRING;
            }
        }
    }

    const DEFAULT_ROW_HEIGHT = 36;
    /** Represents a grid widget with columns rows, paging, custom rendering and more */
    class EasyGrid {
        /** Creates and initializes all internal properties of the grid object */
        constructor(options) {
            this.cssPrefix = "keg";
            this.pagination = { page: 1, pageSize: 30, total: 0 };
            this.paginationOptions = {
                maxButtonCount: 10,
                useBootstrap: false //true
            };
            this.defaultDataGridOptions = {
                slot: null,
                dataTable: null,
                fixHeightOnFirstRender: false,
                syncGridColumns: true,
                useRowNumeration: true,
                allowDragDrop: false,
                aggregates: {
                    settings: null,
                    calculator: null
                },
                paging: {
                    enabled: true,
                    pageSize: 30,
                    pageSizeItems: [20, 30, 50, 100, 200]
                },
                columnWidths: {
                    autoResize: AutoResizeColumns.Always,
                    stringColumns: {
                        min: 100,
                        max: 500,
                        default: 250
                    },
                    numberColumns: {
                        min: 60,
                        default: 120
                    },
                    boolColumns: {
                        min: 50,
                        default: 80
                    },
                    dateColumns: {
                        min: 80,
                        default: 200
                    },
                    otherColumns: {
                        min: 100,
                        max: 500,
                        default: 250
                    },
                    rowNumColumn: {
                        min: 40,
                        default: 60
                    }
                },
                showPlusButton: false,
                viewportRowsCount: null,
                showActiveRow: true
            };
            this.rowsOnPagePromise = null;
            this.containerInitialHeight = 0;
            this.firstRender = true;
            this.prevRowTotals = null;
            this.landingIndex = -1;
            this.landingSlot = domel('div')
                .addClass(`${this.cssPrefix}-col-landing-slot`)
                .addChildElement(domel('div')
                .toDOM())
                .toDOM();
            this._activeRowIndex = -1;
            if (options && options.paging) {
                options.paging = utils.assign(this.defaultDataGridOptions.paging, options.paging);
            }
            this.options = this.mergeOptions(options);
            this.processColumnWidthsOptions();
            if (!this.options.slot)
                throw Error('"slot" parameter is required to initialize EasyDataGrid');
            if (!this.options.dataTable)
                throw Error('"dataTable" parameter is required to initialize EasyDataGrid');
            this.dataTable = options.dataTable;
            this.eventEmitter = new EventEmitter(this);
            this.cellRendererStore = new GridCellRendererStore(options);
            this.columns = new GridColumnList(this.dataTable.columns, this);
            this.setSlot(this.options.slot);
            this.init(this.options);
        }
        mergeOptions(options) {
            const colWidthOptions = utils.assignDeep({}, this.defaultDataGridOptions.columnWidths, options.columnWidths);
            const pagingOptions = utils.assignDeep({}, this.defaultDataGridOptions.paging, options.paging);
            const result = utils.assign({}, this.defaultDataGridOptions, options);
            result.columnWidths = colWidthOptions;
            result.paging = pagingOptions;
            return result;
        }
        processColumnWidthsOptions() {
            const widthOptions = this.options.columnWidths;
            if (!widthOptions)
                return;
            //string columns
            utils.getStringDataTypes().forEach(dataType => {
                widthOptions[dataType] = Object.assign(Object.assign({}, widthOptions.stringColumns), widthOptions[dataType]);
            });
            //numeric columns
            utils.getNumericDataTypes().forEach(dataType => {
                widthOptions[dataType] = Object.assign(Object.assign({}, widthOptions.numberColumns), widthOptions[dataType]);
            });
            //bool columns
            widthOptions[DataType.Bool] = Object.assign(Object.assign({}, widthOptions.boolColumns), widthOptions[DataType.Bool]);
            //date columns
            utils.getDateDataTypes().forEach(dataType => {
                widthOptions[dataType] = Object.assign(Object.assign({}, widthOptions.dateColumns), widthOptions[dataType]);
            });
            //other columns
            const knownTypes = [
                ...utils.getStringDataTypes(),
                ...utils.getNumericDataTypes(),
                ...utils.getDateDataTypes(),
                DataType.Bool
            ];
            utils.getAllDataTypes().forEach(dataType => {
                if (!(dataType in knownTypes)) {
                    widthOptions[dataType] = Object.assign(Object.assign({}, widthOptions.otherColumns), widthOptions[dataType]);
                }
            });
            widthOptions[DataType.Unknown] = widthOptions.otherColumns;
        }
        setSlot(slot) {
            if (typeof slot === 'string') {
                if (slot.length) {
                    if (slot[0] === '#') {
                        this.slot = document.getElementById(slot.substring(1));
                    }
                    else if (slot[0] === '.') {
                        const result = document.getElementsByClassName(slot.substring(1));
                        if (result.length)
                            this.slot = result[0];
                    }
                    else {
                        throw Error('Unrecognized slot parameter ' +
                            '(Must be id, class or HTMLElement): ' + slot);
                    }
                }
            }
            else {
                this.slot = slot;
            }
        }
        /** Initializes grid widget according to the options passed in the parameter */
        init(options) {
            if (options.onInit) {
                this.addEventListener('init', options.onInit);
            }
            if (options.onRowClick) {
                this.addEventListener('rowClick', options.onRowClick);
            }
            if (options.onRowDbClick) {
                this.addEventListener('rowDbClick', options.onRowDbClick);
            }
            if (options.onPlusButtonClick) {
                this.addEventListener('plusButtonClick', options.onPlusButtonClick);
            }
            if (options.onColumnChanged) {
                this.addEventListener('columnChanged', options.onColumnChanged);
            }
            if (options.onColumnDeleted) {
                this.addEventListener('columnDeleted', options.onColumnDeleted);
            }
            if (options.onColumnMoved) {
                this.addEventListener('columnMoved', options.onColumnMoved);
            }
            if (options.onPageChanged) {
                this.addEventListener('pageChanged', options.onPageChanged);
            }
            if (options.onActiveRowChanged) {
                this.addEventListener('activeRowChanged', options.onActiveRowChanged);
            }
            this.addEventListener('pageChanged', ev => this.activeRowIndex = -1);
            utils.assignDeep(this.paginationOptions, options.pagination);
            this.pagination.pageSize = this.options.paging.pageSize
                || this.pagination.pageSize;
            if (this.options.allowDragDrop) {
                eqDragManager.registerDropContainer({
                    element: this.slot,
                    scopes: ["gridColumnMove"],
                    onDragEnter: (_, ev) => {
                        this.slot.classList.add(`${eqCssPrefix}-drophover`);
                        this.showLandingSlot(ev.pageX, ev.pageY);
                    },
                    onDragOver: (_, ev) => {
                        this.showLandingSlot(ev.pageX, ev.pageY);
                    },
                    onDragLeave: (_, ev) => {
                        ev.dropEffect = DropEffect.Forbid;
                        this.slot.classList.remove(`${eqCssPrefix}-drophover`);
                        this.hideLandingSlot();
                    },
                    onDrop: (_, ev) => {
                        this.dataTable.columns.move(ev.data.column, this.landingIndex);
                        this.refresh();
                        this.fireEvent({
                            type: 'columnMoved',
                            columnId: ev.data.column.id,
                            newIndex: this.landingIndex
                        });
                    }
                });
            }
            this.refresh();
            this.fireEvent('init');
        }
        /** Fires a grid event. You can pass either an event type
         * (like 'init', 'rowClick', 'pageChanged', etc )
         * or a ready-to-use grid event object
         * */
        fireEvent(event) {
            if (typeof event === "string") {
                this.eventEmitter.fire(event);
            }
            else {
                this.eventEmitter.fire(event.type, event);
            }
        }
        /** Allows to set the data (represented by a EasyDataTable object)
         *  or to replace the existing one associated with the grid */
        setData(data) {
            this.dataTable = data;
            this.clear();
            this.refresh();
        }
        /** Returns the EasyDataTable object associated with the grid via `setData()` call */
        getData() {
            return this.dataTable;
        }
        /** Gets the list of grid columns */
        getColumns() {
            return this.columns;
        }
        /** This function is called when the grid is destroyed */
        destroy() {
            this.slot.innerHTML = "";
        }
        /** Clears the current DOM object and re-renders everything from the scratch */
        refresh() {
            this.clearDOM();
            this.render();
        }
        clearDOM() {
            this.slot.innerHTML = '';
        }
        /** Clears all DOM object in the grid and return it to its initial state */
        clear() {
            this.pagination.page = 1;
            this.clearDOM();
        }
        /** Renders the grid */
        render() {
            if (!this.hasData() && !this.options.showPlusButton)
                return;
            this.containerInitialHeight = this.slot.clientHeight;
            this.rootDiv = document.createElement('div');
            this.rootDiv.style.width = '100%';
            this.rootDiv.classList.add(`${this.cssPrefix}-root`);
            this.columns.sync(this.dataTable.columns, this.options.useRowNumeration);
            this.renderHeader();
            this.rootDiv.appendChild(this.headerDiv);
            this.renderBody();
            this.rootDiv.appendChild(this.bodyDiv);
            this.renderFooter();
            this.rootDiv.appendChild(this.footerDiv);
            let gridContainer = document.createElement('div');
            gridContainer.classList.add(`${this.cssPrefix}-container`);
            gridContainer.appendChild(this.rootDiv);
            this.slot.appendChild(gridContainer);
            const needAutoResize = this.options.columnWidths.autoResize !== AutoResizeColumns.Never;
            if (this.rowsOnPagePromise) {
                this.rowsOnPagePromise
                    .then(() => this.updateHeight())
                    .then(() => {
                    this.firstRender = false;
                    this.rowsOnPagePromise = null;
                });
            }
            else {
                setTimeout(() => {
                    this.updateHeight()
                        .then(() => {
                        this.firstRender = false;
                        if (needAutoResize) {
                            this.resizeColumns();
                        }
                    });
                }, 100);
            }
        }
        updateHeight() {
            return new Promise((resolve) => {
                if (this.options.viewportRowsCount) {
                    const firstRow = this.bodyCellContainerDiv.firstElementChild;
                    const rowHeight = firstRow ? firstRow.offsetHeight : DEFAULT_ROW_HEIGHT;
                    const rowCount = this.options.viewportRowsCount; // || DEFAULT_ROW_COUNT;
                    let viewportHeight = rowHeight * rowCount;
                    domel(this.bodyViewportDiv)
                        .setStyle('height', `${viewportHeight}px`);
                    setTimeout(() => {
                        const sbHeight = this.bodyViewportDiv.offsetHeight - this.bodyViewportDiv.clientHeight;
                        viewportHeight = viewportHeight + sbHeight;
                        domel(this.bodyViewportDiv)
                            .setStyle('height', `${viewportHeight}px`);
                        resolve();
                    }, 100);
                    return;
                }
                else if (this.containerInitialHeight > 0) ;
                resolve();
            })
                .then(() => {
                if (this.options.fixHeightOnFirstRender && this.firstRender) {
                    this.slot.style.height = `${this.slot.offsetHeight}px`;
                }
            });
        }
        getContainerWidth() {
            return this.columns.getItems()
                .filter(col => col.isVisible)
                .map(col => col.width)
                .reduce((sum, current) => { return sum + current; });
        }
        renderHeader() {
            this.headerDiv = domel('div')
                .addClass(`${this.cssPrefix}-header`)
                .toDOM();
            this.headerViewportDiv = domel('div', this.headerDiv)
                .addClass(`${this.cssPrefix}-header-viewport`)
                .toDOM();
            this.headerCellContainerDiv = domel('div', this.headerViewportDiv)
                .addClass(`${this.cssPrefix}-header-cell-container`)
                .toDOM();
            this.headerRowDiv = domel('div', this.headerCellContainerDiv)
                .addClass(`${this.cssPrefix}-header-row`)
                .toDOM();
            this.columns.getItems().forEach((column, index) => {
                if (!column.isVisible) {
                    return;
                }
                let hd = this.renderColumnHeader(column, index);
                this.headerRowDiv.appendChild(hd);
                if (column.isRowNum) {
                    domel(hd)
                        .addChildElement(this.renderHeaderButtons());
                }
            });
            const containerWidth = this.getContainerWidth();
            domel(this.headerCellContainerDiv)
                .setStyle('width', `${containerWidth}px`);
        }
        hasData() {
            return this.dataTable.columns.count > 0;
        }
        renderColumnHeader(column, index) {
            let colBuilder = domel('div')
                .addClass(`${this.cssPrefix}-header-cell`)
                .data('col-idx', `${index}`)
                .setStyle('width', `${column.width}px`);
            if (column.dataColumn) {
                colBuilder
                    .data('col-id', `${column.dataColumn.id}`);
            }
            let colDiv = colBuilder.toDOM();
            domel('div', colDiv)
                .addClass(`${this.cssPrefix}-header-cell-resize`);
            if (!column.isRowNum) {
                domel('div', colDiv)
                    .addClass(`${this.cssPrefix}-header-cell-label`)
                    .text(column.label);
            }
            if (column.description) {
                domel('div', colDiv)
                    .addClass('question-mark')
                    .title(column.description);
            }
            if (this.options.allowDragDrop) {
                eqDragManager.registerDraggableItem({
                    element: colDiv,
                    scope: "gridColumnMove",
                    data: { column: column },
                    renderer: (dragImage) => {
                        dragImage.innerHTML = '';
                        const attrLabel = document.createElement('div');
                        attrLabel.innerText = column.label;
                        dragImage.classList.add(`${this.cssPrefix}-sortable-helper`);
                        dragImage.appendChild(attrLabel);
                    },
                    onDragStart: (ev) => {
                        ev.dropEffect = DropEffect.Allow;
                    }
                });
            }
            return colDiv;
        }
        renderBody() {
            this.bodyDiv = domel('div')
                .addClass(`${this.cssPrefix}-body`)
                .toDOM();
            this.bodyViewportDiv = domel('div', this.bodyDiv)
                .addClass(`${this.cssPrefix}-body-viewport`)
                .attr('tabIndex', '0')
                .toDOM();
            this.bodyCellContainerDiv = domel('div', this.bodyViewportDiv)
                .addClass(`${this.cssPrefix}-cell-container`)
                .toDOM();
            const showAggrs = this.canShowAggregates();
            if (this.dataTable) {
                this.showProgress();
                this.rowsOnPagePromise = this.getRowsToRender()
                    .then((rows) => {
                    this.pagination.total = this.dataTable.getTotal();
                    this.hideProgress();
                    //prevent double rendering (bad solution, we have to figure out how to avoid this behavior properly)
                    this.bodyCellContainerDiv.innerHTML = '';
                    this.prevRowTotals = null;
                    let rowsToRender = 0;
                    if (rows.length) {
                        const groups = showAggrs
                            ? this.options.aggregates.settings.getGroups()
                            : [];
                        rowsToRender = (rows.length < this.pagination.pageSize)
                            ? rows.length
                            : this.pagination.pageSize;
                        rows.forEach((row, index) => {
                            if (showAggrs)
                                this.updateTotalsState(groups, row);
                            //we don't actually render the last row
                            if (index < rowsToRender) {
                                const tr = this.renderRow(row, index);
                                this.bodyCellContainerDiv.appendChild(tr);
                            }
                        });
                        const showGrandTotalsOnEachPage = this.options.aggregates && this.options.aggregates.showGrandTotalsOnEachPage;
                        if (showAggrs && (this.isLastPage() || showGrandTotalsOnEachPage)) {
                            const row = new DataRow(this.dataTable.columns, new Array(this.dataTable.columns.count));
                            this.updateTotalsState(groups, row, true);
                        }
                    }
                    const needAutoResize = this.options.columnWidths.autoResize !== AutoResizeColumns.Never;
                    if (needAutoResize) {
                        this.resizeColumns();
                    }
                    else {
                        const containerWidth = this.getContainerWidth();
                        domel(this.bodyCellContainerDiv)
                            .setStyle('width', `${containerWidth}px`);
                    }
                    return rowsToRender;
                })
                    .catch(error => { console.error(error); return 0; });
            }
            this.bodyViewportDiv.addEventListener('scroll', ev => {
                domel(this.headerViewportDiv)
                    .setStyle('margin-left', `-${this.bodyViewportDiv.scrollLeft}px`);
            });
            this.bodyViewportDiv.addEventListener('keydown', this.onViewportKeydown.bind(this));
        }
        isLastPage() {
            if (this.dataTable.elasticChunks) {
                return this.dataTable.totalIsKnown()
                    && (this.pagination.page * this.pagination.pageSize) >= this.pagination.total;
            }
            return this.pagination.page * this.pagination.pageSize >= this.pagination.total;
        }
        canShowAggregates() {
            if (!this.options || !this.options.aggregates || !this.options.aggregates.settings)
                return false;
            const aggrSettings = this.options.aggregates.settings;
            const result = (aggrSettings.hasAggregates() || aggrSettings.hasRecordCount())
                && (aggrSettings.hasGroups() || aggrSettings.hasGrandTotals());
            return result;
        }
        updateTotalsState(groups, newRow, isLast = false) {
            const aggrSettings = this.options.aggregates.settings;
            if (this.prevRowTotals && aggrSettings.hasGroups()) {
                let changeLevel = -1;
                for (let level = 1; level <= groups.length; level++) {
                    const group = groups[level - 1];
                    for (const col of group.columns) {
                        if (!aggrSettings.compareValues(this.prevRowTotals.getValue(col), newRow.getValue(col))) {
                            changeLevel = level;
                            break;
                        }
                    }
                    if (changeLevel !== -1)
                        break;
                }
                if (changeLevel !== -1) {
                    for (let level = groups.length; level >= changeLevel; level--) {
                        const row = new DataRow(this.dataTable.columns, this.prevRowTotals.toArray());
                        const tr = this.renderTotalsRow(level, row);
                        this.bodyCellContainerDiv.appendChild(tr);
                    }
                }
            }
            if (isLast && aggrSettings.hasGrandTotals() && aggrSettings.hasAggregates()) {
                const tr = this.renderTotalsRow(0, newRow);
                this.bodyCellContainerDiv.appendChild(tr);
            }
            this.prevRowTotals = newRow;
        }
        applyGroupColumnTemplate(template, value, count) {
            let result = template.replace(/{{\s*GroupValue\s*}}/g, value ? `${value}` : '-');
            result = result.replace(/{{\s*GroupCount\s*}}/g, count ? `${count}` : '-');
            return result;
        }
        renderTotalsRow(level, row) {
            const aggrSettings = this.options.aggregates.settings;
            const group = (level > 0)
                ? aggrSettings.getGroups()[level - 1]
                : { columns: [], aggregates: aggrSettings.getAggregates() };
            const rowBuilder = domel('div')
                .addClass(`${this.cssPrefix}-row`)
                .addClass(`${this.cssPrefix}-row-totals`)
                .addClass(`${this.cssPrefix}-totals-lv${level}`)
                .data('totals-level', `${level}`)
                .attr('tabindex', '-1');
            const rowElement = rowBuilder.toDOM();
            this.columns.getItems().forEach((column, index) => {
                if (!column.isVisible) {
                    return;
                }
                let val = '';
                const colIndex = !column.isRowNum
                    ? this.dataTable.columns.getIndex(column.dataColumn.id)
                    : -1;
                if (!column.isRowNum && column.dataColumn) {
                    if (group.columns.indexOf(column.dataColumn.id) >= 0) {
                        val = row.getValue(colIndex);
                    }
                }
                if (colIndex == this.dataTable.columns.count - 1) {
                    val = '.  .  .  .  .  .';
                }
                rowElement.appendChild(this.renderCell(column, index, val, rowElement));
            });
            const aggrContainer = this.options.aggregates.calculator.getAggrContainer();
            const aggrCols = aggrSettings.getAggregates().map(c => c.colId);
            const key = aggrSettings.buildGroupKey(group, row);
            aggrContainer.getAggregateData(level, key)
                .then((values) => {
                for (const aggrColId of aggrCols) {
                    row.setValue(aggrColId, values[aggrColId]);
                }
                rowElement.innerHTML = '';
                this.columns.getItems().forEach((column, index) => {
                    if (!column.isVisible) {
                        return;
                    }
                    let val = '';
                    const colIndex = !column.isRowNum
                        ? this.dataTable.columns.getIndex(column.dataColumn.id)
                        : -1;
                    if (!column.isRowNum) {
                        let isLastGroupColumn = false;
                        if (column.dataColumn) {
                            const groupColIndex = group.columns.indexOf(column.dataColumn.id);
                            const aggrColIndex = aggrCols.indexOf(column.dataColumn.id);
                            if (level > 0) {
                                isLastGroupColumn = groupColIndex == group.columns.length - 1;
                            }
                            else {
                                //if it's a grand total row consider first column as the last group column
                                isLastGroupColumn = colIndex == 0;
                            }
                            if (groupColIndex >= 0 || aggrColIndex >= 0) {
                                val = row.getValue(colIndex);
                            }
                        }
                        let groupFooterTemplate = '';
                        if (level > 0) {
                            groupFooterTemplate = column.dataColumn.groupFooterColumnTemplate;
                            //set the default template for the last grouping column
                            if (!groupFooterTemplate && aggrSettings.hasRecordCount() && isLastGroupColumn) {
                                groupFooterTemplate = '{{GroupValue}} ({{GroupCount}})';
                            }
                        }
                        if (groupFooterTemplate) {
                            const cellDiv = this.renderCell(column, index, val, rowElement);
                            const innerCell = cellDiv.firstChild;
                            val = innerCell.innerHTML;
                            val = this.applyGroupColumnTemplate(groupFooterTemplate, val, values[aggrSettings.COUNT_FIELD_NAME]);
                        }
                    }
                    const cellDiv = this.renderCell(column, index, val, rowElement);
                    rowElement.appendChild(cellDiv);
                });
            })
                .catch((error) => console.error(error));
            return rowElement;
        }
        onViewportKeydown(ev) {
            if (this.options.showActiveRow) {
                const rowCount = this.bodyCellContainerDiv.querySelectorAll(`.${this.cssPrefix}-row`).length;
                let newValue;
                switch (ev.key) {
                    case 'ArrowLeft':
                        break;
                    case 'ArrowRight':
                        break;
                    case 'ArrowUp':
                        ev.preventDefault();
                        newValue = this.activeRowIndex < 0 || this.activeRowIndex >= rowCount ? rowCount - 1 : this.activeRowIndex - 1;
                        this.activeRowIndex = newValue >= 0 ? newValue : 0;
                        break;
                    case 'ArrowDown':
                        ev.preventDefault();
                        newValue = this.activeRowIndex < 0 || this.activeRowIndex >= rowCount ? 0 : this.activeRowIndex + 1;
                        this.activeRowIndex = newValue < rowCount ? newValue : rowCount - 1;
                        break;
                }
            }
        }
        ensureRowVisibility(rowOrIndex) {
            const row = typeof rowOrIndex === 'number'
                ? this.getDataRow(rowOrIndex)
                : rowOrIndex;
            if (row) {
                let rowRect = row.getBoundingClientRect();
                const viewportRect = this.bodyViewportDiv.getBoundingClientRect();
                const rowTop = rowRect.top - viewportRect.top;
                const rowBottom = rowRect.bottom - viewportRect.top;
                const viewportHeight = this.bodyViewportDiv.clientHeight;
                const windowHeight = window.innerHeight || document.documentElement.clientHeight;
                if (rowTop > 0 &&
                    rowBottom <= viewportHeight &&
                    rowRect.top > 0 &&
                    rowRect.bottom < windowHeight) {
                    return;
                }
                if (rowTop < 0) {
                    this.bodyViewportDiv.scrollTop = this.bodyViewportDiv.scrollTop + rowTop;
                }
                else if (rowBottom > viewportHeight) {
                    this.bodyViewportDiv.scrollTop = this.bodyViewportDiv.scrollTop + rowBottom - viewportHeight;
                }
                rowRect = row.getBoundingClientRect();
                if (rowRect.top < 0) {
                    document.documentElement.scrollTop = document.documentElement.scrollTop + rowRect.top;
                }
                else if (rowRect.bottom > windowHeight) {
                    document.documentElement.scrollTop = document.documentElement.scrollTop + rowRect.bottom - windowHeight;
                }
            }
        }
        /** Returns a promise with the list of the rows to render on one page.
         * The list contains pageSize+1 row to make it possible
         * to render the totals row (if it appears to be on the edge between pages)
         */
        getRowsToRender() {
            if (this.options.paging.enabled === false) {
                return Promise.resolve(this.dataTable.getCachedRows());
            }
            return this.dataTable.getRows({
                offset: (this.pagination.page - 1) * this.pagination.pageSize,
                limit: this.pagination.pageSize + 1
            })
                .catch(error => {
                console.error(error);
                return [];
            });
        }
        renderFooter() {
            this.footerDiv = domel('div')
                .addClass(`${this.cssPrefix}-footer`)
                .toDOM();
            if (this.rowsOnPagePromise) {
                this.rowsOnPagePromise.then(count => {
                    this.footerDiv.innerHTML = '';
                    this.footerPaginateDiv = this.renderPageNavigator();
                    this.footerDiv.appendChild(this.footerPaginateDiv);
                    const pageInfoBlock = this.renderPageInfoBlock(count);
                    this.footerDiv.appendChild(pageInfoBlock);
                });
            }
        }
        renderPageInfoBlock(count) {
            const pageInfoDiv = domel('div')
                .addClass(`${this.cssPrefix}-page-info`)
                .toDOM();
            const rowCount = this.dataTable.getTotal();
            if (rowCount > 0) {
                const fistPageRecordNum = count
                    ? (this.pagination.page - 1) * this.pagination.pageSize + 1
                    : 0;
                const lastPageRecordNum = count
                    ? fistPageRecordNum + count - 1
                    : 0;
                let totalStr = this.dataTable.getTotal().toString();
                if (this.dataTable.elasticChunks) {
                    const count = this.dataTable.getCachedCount();
                    const total = this.dataTable.getTotal();
                    if (count !== total)
                        totalStr = '?';
                }
                pageInfoDiv.innerHTML = i18n.getText('GridPageInfo')
                    .replace('{FirstPageRecordNum}', `<span>${fistPageRecordNum.toString()}</span>`)
                    .replace('{LastPageRecordNum}', `<span>${lastPageRecordNum.toString()}</span>`)
                    .replace('{Total}', `<span>${totalStr}</span>`);
            }
            return pageInfoDiv;
        }
        showProgress() {
        }
        hideProgress() {
        }
        getLocalIndexByGlobal(index) {
            if (this.pagination) {
                return index % this.pagination.pageSize;
            }
            else {
                return index;
            }
        }
        getGlobalIndexByLocal(index) {
            if (this.pagination) {
                return (this.pagination.page - 1) * this.pagination.pageSize + index;
            }
            else {
                return index;
            }
        }
        renderRow(row, index) {
            let indexGlobal = this.getGlobalIndexByLocal(index);
            let rowBuilder = domel('div')
                .addClass(`${this.cssPrefix}-row`)
                .addClass(`${this.cssPrefix}-row-${index % 2 == 1 ? 'odd' : 'even'}`)
                .data('row-idx', `${indexGlobal}`)
                .attr('tabindex', '-1')
                .on('click', (ev) => {
                this.activeRowIndex = index;
                this.fireEvent({
                    type: 'rowClick',
                    row: row,
                    rowIndex: index,
                    sourceEvent: ev
                });
            })
                .on('dblclick', (ev) => {
                this.fireEvent({
                    type: 'rowDbClick',
                    row: row,
                    rowIndex: index,
                    sourceEvent: ev
                });
            });
            if (index == 0) {
                rowBuilder.addClass(`${this.cssPrefix}-row-first`);
            }
            let rowElement = rowBuilder.toDOM();
            if (this.options.showActiveRow && index == this.activeRowIndex) {
                rowBuilder.addClass(`${this.cssPrefix}-row-active`);
            }
            this.columns.getItems().forEach((column, index) => {
                if (!column.isVisible) {
                    return;
                }
                const colindex = column.isRowNum ? -1 : this.dataTable.columns.getIndex(column.dataColumn.id);
                let val = column.isRowNum ? indexGlobal + 1 : row.getValue(colindex);
                rowElement.appendChild(this.renderCell(column, index, val, rowElement));
            });
            return rowElement;
        }
        renderCell(column, colIndex, value, rowElement) {
            const builder = domel('div')
                .addClass(`${this.cssPrefix}-cell`)
                .data('col-idx', `${colIndex}`)
                .attr('tabindex', '-1')
                .setStyle('width', `${column.width}px`);
            if (column.align == GridColumnAlign.LEFT) {
                builder.addClass(`${this.cssPrefix}-cell-align-left`);
            }
            else if (column.align == GridColumnAlign.RIGHT) {
                builder.addClass(`${this.cssPrefix}-cell-align-right`);
            }
            else if (column.align == GridColumnAlign.CENTER) {
                builder.addClass(`${this.cssPrefix}-cell-align-center`);
            }
            const cellElement = builder.toDOM();
            const valueCell = cellElement.appendChild(domel('div')
                .addClass(`${this.cssPrefix}-cell-value`)
                .toDOM());
            const cellRenderer = this.getCellRenderer(column);
            if (cellRenderer) {
                cellRenderer(value, column, valueCell, rowElement);
            }
            return cellElement;
        }
        getCellRenderer(column) {
            let cellRenderer;
            if (column.isRowNum) {
                cellRenderer = this.cellRendererStore.getDefaultRendererByType(CellRendererType.NUMBER);
            }
            else {
                cellRenderer = this.cellRendererStore.getDefaultRenderer(column.type);
            }
            if (this.options && this.options.onGetCellRenderer) {
                cellRenderer = this.options.onGetCellRenderer(column, cellRenderer) || cellRenderer;
            }
            return cellRenderer;
        }
        /** Sets current grid pages (if paging is used) */
        setPage(page) {
            this.pagination.page = page;
            this.fireEvent({ type: "pageChanged", page: page });
            this.refresh();
            this.bodyViewportDiv.focus();
        }
        renderPageNavigator() {
            let paginateDiv = document.createElement('div');
            paginateDiv.className = `${this.cssPrefix}-pagination-wrapper`;
            const rowCount = this.dataTable.getTotal();
            if (this.options.paging && this.options.paging.enabled && rowCount > 0) {
                const prefix = this.paginationOptions.useBootstrap ? '' : `${this.cssPrefix}-`;
                const buttonClickHandler = (ev) => {
                    const element = ev.target;
                    if (element.hasAttribute('data-page')) {
                        const page = parseInt(element.getAttribute('data-page'));
                        this.setPage(page);
                    }
                };
                const renderPageCell = (pageIndex, content, disabled, extreme, active) => {
                    const li = document.createElement('li');
                    li.className = `${prefix}page-item`;
                    if (!extreme) {
                        if (active) {
                            li.className += ' active';
                        }
                        const a = document.createElement('a');
                        a.setAttribute('href', 'javascript:void(0)');
                        a.innerHTML = content || pageIndex.toString();
                        a.setAttribute("data-page", `${pageIndex}`);
                        a.className = `${prefix}page-link`;
                        a.addEventListener("click", buttonClickHandler);
                        li.appendChild(a);
                        return li;
                    }
                    let a = document.createElement('span');
                    a.setAttribute('aria-hidden', 'true');
                    a.className = `${prefix}page-link`;
                    if (disabled) {
                        li.className += ' disabled';
                    }
                    else {
                        if (this.paginationOptions.useBootstrap) {
                            a = document.createElement('a');
                            a.setAttribute('href', 'javascript:void(0)');
                            a.setAttribute("data-page", `${pageIndex}`);
                        }
                        else {
                            let newA = document.createElement('a');
                            newA.setAttribute('href', 'javascript:void(0)');
                            newA.setAttribute('data-page', `${pageIndex}`);
                            a = newA;
                        }
                        a.className = `${prefix}page-link`;
                        a.addEventListener("click", buttonClickHandler);
                    }
                    a.innerHTML = content;
                    li.appendChild(a);
                    return li;
                };
                if (this.dataTable.elasticChunks) {
                    const pageIndex = this.pagination.page || 1;
                    let ul = document.createElement('ul');
                    ul.className = `${prefix}pagination`;
                    let cell = renderPageCell(pageIndex - 1, '&laquo;', pageIndex == 1, true, false);
                    ul.appendChild(cell);
                    cell = renderPageCell(pageIndex + 1, '&raquo;', this.isLastPage(), true, false);
                    ul.appendChild(cell);
                    paginateDiv.appendChild(ul);
                }
                else {
                    if (this.pagination.total > this.pagination.pageSize) {
                        const pageIndex = this.pagination.page || 1;
                        const pageCount = Math.ceil(this.pagination.total / this.pagination.pageSize) || 1;
                        const maxButtonCount = this.paginationOptions.maxButtonCount || 10;
                        const zeroBasedIndex = pageIndex - 1;
                        let firstPageIndex = zeroBasedIndex - (zeroBasedIndex % maxButtonCount) + 1;
                        let lastPageIndex = firstPageIndex + maxButtonCount - 1;
                        if (lastPageIndex > pageCount) {
                            lastPageIndex = pageCount;
                        }
                        let ul = document.createElement('ul');
                        ul.className = `${prefix}pagination`;
                        let cell = renderPageCell(firstPageIndex - 1, '&laquo;', firstPageIndex == 1, true, false);
                        ul.appendChild(cell);
                        for (let i = firstPageIndex; i <= lastPageIndex; i++) {
                            cell = renderPageCell(i, i.toString(), false, false, i == pageIndex);
                            ul.appendChild(cell);
                        }
                        cell = renderPageCell(lastPageIndex + 1, '&raquo;', lastPageIndex == pageCount, true, false);
                        ul.appendChild(cell);
                        paginateDiv.appendChild(ul);
                    }
                }
                if (this.options.paging.allowPageSizeChange) {
                    const selectChangeHandler = (ev) => {
                        const newValue = parseInt(ev.target.value);
                        this.pagination.pageSize = newValue;
                        this.pagination.page = 1;
                        this.refresh();
                    };
                    const pageSizes = document.createElement('div');
                    pageSizes.className = `${this.cssPrefix}-page-sizes`;
                    const selectSize = document.createElement('div');
                    selectSize.className = `kfrm-select ${this.cssPrefix}-page-sizes-select`;
                    pageSizes.appendChild(selectSize);
                    const sel = document.createElement('select');
                    const selOptions = this.options.paging.pageSizeItems || [];
                    const selSet = new Set(selOptions);
                    selSet.add(this.options.paging.pageSize || 20);
                    Array.from(selSet).forEach(el => {
                        const option = document.createElement("option");
                        option.value = el.toString();
                        option.text = el.toString();
                        sel.appendChild(option);
                    });
                    sel.value = (this.pagination.pageSize || 20).toString();
                    selectSize.appendChild(sel);
                    sel.addEventListener('change', selectChangeHandler);
                    const labelDiv = document.createElement('div');
                    labelDiv.className = `${this.cssPrefix}-page-sizes-label`;
                    pageSizes.appendChild(labelDiv);
                    const label = document.createElement('span');
                    label.innerText = i18n.getText('GridItemsPerPage');
                    labelDiv.appendChild(label);
                    paginateDiv.appendChild(pageSizes);
                }
            }
            return paginateDiv;
        }
        addEventListener(eventType, handler) {
            return this.eventEmitter.subscribe(eventType, event => handler(event.data));
        }
        removeEventListener(eventType, handlerId) {
            this.eventEmitter.unsubscribe(eventType, handlerId);
        }
        renderHeaderButtons() {
            if (this.options.showPlusButton) {
                return domel('div')
                    .addClass(`${this.cssPrefix}-header-btn-plus`)
                    .title(this.options.plusButtonTitle || 'Add')
                    .addChild('a', builder => builder
                    .attr('href', 'javascript:void(0)')
                    .on('click', (e) => {
                    e.preventDefault();
                    this.fireEvent({
                        type: 'plusButtonClick',
                        sourceEvent: e
                    });
                }))
                    .toDOM();
            }
            return domel('span')
                .addText('#')
                .toDOM();
        }
        showLandingSlot(pageX, pageY) {
            const colElems = this.headerRowDiv.querySelectorAll(`[class*=${this.cssPrefix}-table-col]`);
            const cols = [];
            for (let i = 1; i < colElems.length; i++) {
                const rowElem = colElems[i];
                if (rowElem.style.display === 'none')
                    continue;
                cols.push(rowElem);
            }
            if (cols.length === 0) {
                this.landingIndex = 0;
                this.headerRowDiv.appendChild(this.landingSlot);
                return;
            }
            const landingPos = getElementAbsolutePos(this.landingSlot);
            if (pageX >= landingPos.x && pageX <= landingPos.x + this.landingSlot.offsetWidth) {
                return;
            }
            let newLandingIndex = this.landingIndex;
            for (let col of cols) {
                const colPos = getElementAbsolutePos(col);
                const width = col.offsetWidth;
                if (pageX > colPos.x && pageX < colPos.x + width) {
                    // -1 as we don't need to count add button here
                    newLandingIndex = parseInt(col.getAttribute('data-col-idx')) - 1;
                }
            }
            if (newLandingIndex != this.landingIndex) {
                this.landingIndex = newLandingIndex;
                if (this.landingIndex < cols.length) {
                    this.headerRowDiv.insertBefore(this.landingSlot, cols[this.landingIndex]);
                }
                else {
                    this.headerRowDiv.appendChild(this.landingSlot);
                }
            }
        }
        hideLandingSlot() {
            this.landingIndex = -1;
            setTimeout(() => {
                if (this.landingSlot.parentElement) {
                    this.landingSlot.parentElement.removeChild(this.landingSlot);
                }
            }, 10);
        }
        get activeRowIndex() {
            return this._activeRowIndex;
        }
        set activeRowIndex(value) {
            if (value !== this._activeRowIndex) {
                const oldValue = this._activeRowIndex;
                this._activeRowIndex = value;
                this.updateActiveRow();
                this.fireEvent({
                    type: 'activeRowChanged',
                    oldValue,
                    newValue: this.activeRowIndex,
                    rowIndex: this.getGlobalIndexByLocal(this.activeRowIndex)
                });
            }
        }
        updateActiveRow() {
            if (this.options.showActiveRow) {
                const rows = this.bodyCellContainerDiv.querySelectorAll(`[class*=${this.cssPrefix}-row-active]`);
                rows.forEach(el => { el.classList.remove(`${this.cssPrefix}-row-active`); });
                const activeRow = this.getActiveRow();
                if (activeRow) {
                    activeRow.classList.add(`${this.cssPrefix}-row-active`);
                    this.ensureRowVisibility(this.activeRowIndex);
                }
            }
        }
        getActiveRow() {
            return this.getDataRow(this.activeRowIndex);
        }
        getDataRow(index) {
            const rows = Array.from(this.bodyCellContainerDiv.querySelectorAll(`.${this.cssPrefix}-row:not(.${this.cssPrefix}-row-totals)`));
            if (index >= 0 && index < rows.length)
                return rows[index];
            return null;
        }
        /** Makes the grid focused for keyboard events */
        focus() {
            this.bodyViewportDiv.focus();
        }
        /** Resizes columns according to the data they represent */
        resizeColumns() {
            if (this.options.columnWidths.autoResize === AutoResizeColumns.Never)
                return;
            const containerWidth = this.bodyCellContainerDiv.style.width;
            this.bodyCellContainerDiv.style.visibility = 'hidden';
            this.bodyCellContainerDiv.style.width = '1px';
            //this.headerRowDiv.style.visibility = 'hidden';
            this.headerRowDiv.style.width = '1px';
            let sumWidth = 0;
            const columns = this.columns.getItems();
            const headerCells = this.headerCellContainerDiv.querySelectorAll(`.${this.cssPrefix}-header-cell`);
            let headerIdx = 0;
            for (let idx = 0; idx < this.columns.count; idx++) {
                const column = columns[idx];
                if (!column.isVisible)
                    continue;
                const calculatedWidth = this.options.columnWidths.autoResize !== AutoResizeColumns.Always && column.dataColumn
                    ? column.dataColumn.calculatedWidth
                    : 0;
                const cellValues = this.bodyCellContainerDiv.querySelectorAll(`.${this.cssPrefix}-cell[data-col-idx="${idx}"] > .${this.cssPrefix}-cell-value`);
                let maxWidth = 0;
                if (calculatedWidth > 0) {
                    sumWidth += calculatedWidth;
                    column.width = calculatedWidth;
                    cellValues.forEach(value => {
                        value.parentElement.style.width = `${calculatedWidth}px`;
                    });
                    headerCells[headerIdx].style.width = `${calculatedWidth}px`;
                }
                else {
                    if (cellValues.length == 0) {
                        headerCells[headerIdx].style.width = null;
                        headerCells[headerIdx].style.whiteSpace = 'nowrap';
                    }
                    maxWidth = headerCells[headerIdx].offsetWidth;
                    if (cellValues.length > 0) {
                        cellValues.forEach(value => {
                            value.parentElement.style.width = null;
                            const width = value.parentElement.offsetWidth;
                            if (width > maxWidth) {
                                maxWidth = width;
                            }
                        });
                        maxWidth += 3;
                        const maxOption = column.isRowNum
                            ? this.options.columnWidths.rowNumColumn.max || 500
                            : this.options.columnWidths[column.dataColumn.type].max || 2000;
                        const minOption = column.isRowNum
                            ? this.options.columnWidths.rowNumColumn.min || 0
                            : this.options.columnWidths[column.dataColumn.type].min || 20;
                        if (maxWidth > maxOption) {
                            maxWidth = maxOption;
                        }
                        if (maxWidth < minOption) {
                            maxWidth = minOption;
                        }
                        if (utils.isNumericType(column.type)) {
                            //increase the calculated width in 1.3 times for numeric columns
                            maxWidth = Math.round(maxWidth * 1.3);
                        }
                        sumWidth += maxWidth;
                        column.width = maxWidth;
                        cellValues.forEach(value => {
                            value.parentElement.style.width = `${maxWidth}px`;
                        });
                        headerCells[headerIdx].style.width = `${maxWidth}px`;
                        if (column.dataColumn) {
                            column.dataColumn.calculatedWidth = maxWidth;
                        }
                    }
                    else {
                        sumWidth += maxWidth;
                    }
                }
                headerIdx++;
            }
            if (sumWidth > 0) {
                this.bodyCellContainerDiv.style.width = `${sumWidth}px`;
                this.headerCellContainerDiv.style.width = `${sumWidth}px`;
            }
            else {
                this.bodyCellContainerDiv.style.width = containerWidth;
                this.headerCellContainerDiv.style.width = containerWidth;
            }
            this.bodyCellContainerDiv.style.visibility = null;
            this.headerRowDiv.removeAttribute('style');
        }
    }

    class Calendar {
        get cssPrefix() {
            return 'kdtp-cal';
        }
        constructor(slot, options) {
            this.slot = slot;
            this.options = options || {};
            if (!this.options.yearRange) {
                this.options.yearRange = 'c-10:c+10';
            }
        }
        setDate(date) {
            this.currentDate = new Date(date);
        }
        getDate() {
            return new Date(this.currentDate);
        }
        dateChanged(apply) {
            if (this.options.onDateChanged) {
                this.options.onDateChanged(this.currentDate, apply);
            }
        }
    }

    class DateTimePicker {
        get cssPrefix() {
            return 'kdtp';
        }
        constructor(options) {
            this.calendar = null;
            this.timePicker = null;
            this.options = options;
            this.render();
        }
        setDateTime(dateTime) {
            this.currentDateTime = new Date(dateTime);
            if (this.calendar) {
                this.calendar.setDate(this.currentDateTime);
            }
            if (this.timePicker) {
                this.timePicker.setTime(this.currentDateTime);
            }
        }
        getDateTime() {
            return new Date(this.currentDateTime);
        }
        render() {
            if (this.options.showCalendar) {
                this.calendar = this.createCalendar({
                    yearRange: this.options.yearRange,
                    showDateTimeInput: this.options.showDateTimeInput,
                    timePickerIsUsed: this.options.showTimePicker,
                    oneClickDateSelection: this.options.oneClickDateSelection,
                    onDateChanged: (date, apply) => {
                        this.currentDateTime = date;
                        if (this.timePicker) {
                            this.timePicker.setTime(this.currentDateTime);
                        }
                        if (this.options.showTimePicker) {
                            this.dateTimeChanged();
                        }
                        if (apply) {
                            this.apply(this.currentDateTime);
                        }
                    }
                });
                if (this.calendar)
                    this.calendar.render();
            }
            if (this.options.showTimePicker) {
                this.timePicker = this.createTimePicker({
                    onTimeChanged: (time) => {
                        this.currentDateTime.setHours(time.getHours());
                        this.currentDateTime.setMinutes(time.getMinutes());
                        if (this.calendar) {
                            this.calendar.setDate(this.currentDateTime);
                        }
                        this.dateTimeChanged();
                    }
                });
                if (this.timePicker)
                    this.timePicker.render();
            }
            this.setDateTime(new Date());
        }
        createCalendar(options) {
            return null;
        }
        createTimePicker(options) {
            return null;
        }
        show(anchor) {
            if (this.options.beforeShow) {
                this.options.beforeShow();
            }
            const pos = getElementAbsolutePos(anchor || document.body);
            this.slot.style.top = pos.y + anchor.clientHeight + 'px';
            this.slot.style.left = pos.x + 'px';
        }
        apply(date) {
            if (this.options.onApply) {
                this.options.onApply(date);
            }
            this.destroy();
        }
        cancel() {
            if (this.options.onCancel) {
                this.options.onCancel();
            }
            this.destroy();
        }
        destroy() {
            if (this.slot && this.slot.parentElement) {
                this.slot.parentElement.removeChild(this.slot);
            }
        }
        dateTimeChanged() {
            if (this.options.onDateTimeChanged) {
                this.options.onDateTimeChanged(this.currentDateTime);
            }
        }
    }

    class DefaultCalendar extends Calendar {
        constructor(slot, options) {
            super(slot, options);
            this.daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            this.months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            this.calendarBody = null;
            this.isManualInputChanging = false;
            for (let i = 0; i < this.daysOfWeek.length; i++) {
                this.daysOfWeek[i] = i18n.getShortWeekDayName(i + 1);
            }
            for (let i = 0; i < this.months.length; i++) {
                this.months[i] = i18n.getLongMonthName(i + 1);
            }
        }
        setDate(date) {
            super.setDate(date);
            this.selectedMonth = this.currentDate.getMonth();
            this.selectedYear = this.currentDate.getFullYear();
            this.rerenderMonth();
        }
        render() {
            const header = domel('div', this.slot)
                .addClass(`${this.cssPrefix}-header`);
            if (this.options.showDateTimeInput) {
                header
                    .addChildElement(this.renderManualDateInput());
            }
            else {
                header
                    .addChild('span', builder => this.headerTextElem = builder.toDOM());
            }
            domel(this.slot)
                .addChildElement(this.renderCalendarButtons());
            this.calendarBody = domel('div', this.slot)
                .addClass(`${this.cssPrefix}-body`)
                .toDOM();
        }
        getInputDateFormat() {
            const settings = i18n.getLocaleSettings();
            return (this.options.timePickerIsUsed)
                ? `${settings.editDateFormat} ${settings.editTimeFormat}`
                : settings.editDateFormat;
        }
        renderManualDateInput() {
            const format = this.getInputDateFormat();
            const builder = domel('input')
                .attr('placeholder', format)
                .addClass(`${this.cssPrefix}-header-input`);
            builder
                .mask(format.replace('yyyy', '9999')
                .replace('MM', '99')
                .replace('dd', '99')
                .replace('HH', '99')
                .replace('mm', '99')
                .replace('ss', '99'))
                .on('input', ev => {
                builder.removeClass('error');
                try {
                    this.isManualInputChanging = true;
                    const newDate = utils.strToDateTime(this.manualInputElem.value, format);
                    this.currentDate = newDate;
                    this.jump(this.currentDate.getFullYear(), this.currentDate.getMonth());
                    this.dateChanged(false);
                }
                catch (e) {
                    builder.addClass('error');
                }
                finally {
                    this.isManualInputChanging = false;
                }
            })
                .on('keydown', (ev) => {
                if (ev.keyCode === 13) {
                    ev.preventDefault();
                    ev.stopPropagation();
                    if (this.manualInputElem.className.indexOf('error') < 0
                        && !this.isManualInputChanging)
                        this.dateChanged(true);
                }
            })
                .on('focus', () => {
                setTimeout(() => {
                    this.manualInputElem.selectionStart = 0;
                    this.manualInputElem.selectionEnd = 0;
                }, 50);
            });
            this.manualInputElem = builder.toDOM();
            return this.manualInputElem;
        }
        updateDisplayedDateValue() {
            if (this.manualInputElem) {
                if (!this.isManualInputChanging) {
                    const format = this.getInputDateFormat();
                    this.manualInputElem.value = i18n.dateTimeToStr(this.currentDate, format);
                    this.manualInputElem.focus();
                }
            }
            else if (this.headerTextElem) {
                const locale = i18n.getCurrentLocale();
                this.headerTextElem.innerText = this.currentDate.toLocaleString(locale == 'en' ? undefined : locale, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                });
            }
        }
        renderCalendarButtons() {
            const builder = domel('nav')
                .addClass(`${this.cssPrefix}-nav`)
                .addChild('div', builder => builder
                .addClass(`${this.cssPrefix}-nav-prev`)
                .on('click', () => {
                this.prev();
            })
                .addChild('span', builder => builder.html('&lsaquo;')))
                .addChild('div', builder => builder
                .addClass(`${this.cssPrefix}-nav-selectors`)
                .addChild('div', builder => builder
                .addClass(`${this.cssPrefix}-nav-month`)
                .addChild('select', builder => {
                builder
                    .on('change', () => {
                    this.jump(this.selectedYear, parseInt(this.selectMonthElem.value));
                });
                for (let i = 0; i < this.months.length; i++) {
                    builder.addChild('option', builder => builder
                        .attr('value', i.toString())
                        .text(this.months[i]));
                }
                this.selectMonthElem = builder.toDOM();
            }))
                .addChild('div', builder => builder
                .addClass(`${this.cssPrefix}-nav-year`)
                .addChild('select', builder => this.selectYearElem = builder
                .on('change', () => {
                this.jump(parseInt(this.selectYearElem.value), this.selectedMonth);
            })
                .toDOM())))
                .addChild('div', builder => builder
                .addClass(`${this.cssPrefix}-nav-next`)
                .on('click', () => {
                this.next();
            })
                .addChild('span', builder => builder.html('&rsaquo;')));
            return builder.toDOM();
        }
        prev() {
            this.selectedYear = (this.selectedMonth === 0) ? this.selectedYear - 1 : this.selectedYear;
            this.selectedMonth = (this.selectedMonth === 0) ? 11 : this.selectedMonth - 1;
            this.rerenderMonth();
        }
        next() {
            this.selectedYear = (this.selectedMonth === 11) ? this.selectedYear + 1 : this.selectedYear;
            this.selectedMonth = (this.selectedMonth + 1) % 12;
            this.rerenderMonth();
        }
        rerenderSelectYear() {
            const match = /c-(\d*):c\+(\d*)/g.exec(this.options.yearRange);
            let minusYear = 0;
            let plusYear = 1;
            if (match !== null) {
                minusYear = parseInt(match[1]);
                plusYear = parseInt(match[2]);
            }
            this.selectYearElem.innerHTML = '';
            for (let i = 0; i <= minusYear + plusYear; i++) {
                let op = document.createElement("option");
                let year = this.selectedYear - minusYear + i;
                op.value = year.toString();
                op.innerText = year.toString();
                this.selectYearElem.appendChild(op);
            }
        }
        jump(year, month) {
            this.selectedYear = year;
            this.selectedMonth = month;
            this.rerenderMonth();
        }
        rerenderMonth() {
            //header text
            this.updateDisplayedDateValue();
            this.rerenderSelectYear();
            let firstDay = (new Date(this.selectedYear, this.selectedMonth)).getDay();
            let daysInMonth = new Date(this.selectedYear, this.selectedMonth + 1, 0).getDate();
            this.calendarBody.innerHTML = "";
            this.selectYearElem.value = this.selectedYear.toString();
            this.selectMonthElem.value = this.selectedMonth.toString();
            this.daysOfWeek.forEach((day, idx) => {
                domel('div', this.calendarBody)
                    .addClass(`${this.cssPrefix}-weekday`)
                    .addClass(idx == 0 || idx == 6 ? `${this.cssPrefix}-weekend` : '')
                    .text(day);
            });
            // Add empty cells before first day
            for (let i = 0; i < firstDay; i++) {
                domel('div', this.calendarBody)
                    .addClass(`${this.cssPrefix}-day-empty`);
            }
            // Add all month days
            const today = new Date();
            for (let day = 1; day <= daysInMonth; day++) {
                const builder = domel('div', this.calendarBody)
                    .addClass(`${this.cssPrefix}-day`)
                    .attr('data-date', day.toString())
                    .text(day.toString())
                    .on('click', (e) => {
                    this.currentDate.setFullYear(this.selectedYear);
                    this.currentDate.setMonth(this.selectedMonth);
                    this.currentDate.setDate(parseInt(e.target.getAttribute('data-date')));
                    this.dateChanged(this.options.oneClickDateSelection);
                });
                if (day === today.getDate() && this.selectedYear === today.getFullYear() && this.selectedMonth === today.getMonth()) {
                    builder.addClass(`${this.cssPrefix}-day-current`);
                }
                if (day === this.currentDate.getDate() && this.selectedYear === this.currentDate.getFullYear() && this.selectedMonth === this.currentDate.getMonth()) {
                    builder.addClass(`${this.cssPrefix}-day-selected`);
                }
                const dayOfWeek = (firstDay + day - 1) % 7;
                if (dayOfWeek == 0 || dayOfWeek == 6) {
                    builder.addClass(`${this.cssPrefix}-weekend`);
                }
                if (typeof this.options.onDrawDay === "function") {
                    this.options.onDrawDay.apply(builder.toDOM(), [
                        builder.toDOM(),
                        new Date(this.selectedYear, this.selectedMonth, day)
                    ]);
                }
            }
            // Add empty cells after last day
            const cellsDrawnInLastRow = (firstDay + daysInMonth) % 7;
            const cellsToDraw = cellsDrawnInLastRow == 0 ? 0 : 7 - cellsDrawnInLastRow;
            for (let i = 0; i < cellsToDraw; i++) {
                domel('div', this.calendarBody)
                    .addClass(`${this.cssPrefix}-day-empty`);
            }
        }
        dateChanged(apply) {
            super.dateChanged(apply);
            this.rerenderMonth();
        }
    }

    class TimePicker {
        get cssPrefix() {
            return 'kdtp-tp';
        }
        constructor(slot, options) {
            this.slot = slot;
            this.options = options || {};
        }
        setTime(time) {
            this.currentTime = new Date(time);
        }
        getTime() {
            return new Date(this.currentTime);
        }
        timeChanged() {
            if (this.options.onTimeChanged) {
                this.options.onTimeChanged(this.currentTime);
            }
        }
    }

    class DefaultTimePicker extends TimePicker {
        setTime(time) {
            super.setTime(time);
            this.updateDisplayedTime();
            this.hoursInput.valueAsNumber = time.getHours();
            this.minutesInput.valueAsNumber = time.getMinutes();
        }
        render() {
            domel('div', this.slot)
                .addClass(`${this.cssPrefix}-time`)
                .addChild('span', builder => this.timeText = builder.toDOM())
                .toDOM();
            const slidersBuilder = domel('div', this.slot)
                .addClass(`${this.cssPrefix}-sliders`);
            slidersBuilder
                .addChild('div', builder => builder
                .addClass(`${this.cssPrefix}-time-row`)
                .title('Hours')
                .addChild('input', builder => this.hoursInput = builder
                .addClass(`${this.cssPrefix}-input-hours`)
                .type('range')
                .attr('min', '0')
                .attr('max', '23')
                .attr('step', '1')
                .on('input', (e) => {
                this.currentTime.setHours(this.hoursInput.valueAsNumber);
                this.updateDisplayedTime();
                this.timeChanged();
            })
                .toDOM()));
            slidersBuilder
                .addChild('div', builder => builder
                .addClass(`${this.cssPrefix}-time-row`)
                .title('Minutes')
                .addChild('input', builder => this.minutesInput = builder
                .addClass(`${this.cssPrefix}-input-minutes`)
                .type('range')
                .attr('min', '0')
                .attr('max', '59')
                .attr('step', '1')
                .on('input', (e) => {
                this.currentTime.setMinutes(this.minutesInput.valueAsNumber);
                this.updateDisplayedTime();
                this.timeChanged();
            })
                .toDOM()));
            return this.slot;
        }
        updateDisplayedTime() {
            const locale = i18n.getCurrentLocale();
            const timeToDraw = this.currentTime.toLocaleString(locale == 'en' ? undefined : locale, {
                hour: "numeric",
                minute: "numeric"
            });
            this.timeText.innerText = timeToDraw;
        }
    }

    class DefaultDateTimePicker extends DateTimePicker {
        render() {
            const sb = domel('div', document.body)
                .addClass(`${this.cssPrefix}`)
                .attr('tabIndex', '0')
                .setStyle('position', 'absolute')
                .setStyle('top', '-1000px')
                .setStyle('left', '-1000px')
                .on('keydown', (ev) => {
                if (ev.keyCode === 27) { // ESC is pressed
                    this.cancel();
                }
                else if (ev.keyCode === 13) { // Enter is pressed
                    this.apply(this.getDateTime());
                }
                return false;
            });
            if (this.options.zIndex) {
                sb.setStyle('z-index', `${this.options.zIndex}`);
            }
            this.slot = sb.toDOM();
            super.render();
            this.renderButtons();
            this.globalMouseDownHandler = (e) => {
                let event = window.event || e;
                event.srcElement || event.target;
                let isOutside = !this.slot.contains(event.target);
                if (isOutside) {
                    document.removeEventListener('mousedown', this.globalMouseDownHandler, true);
                    this.cancel();
                }
                return true;
            };
        }
        renderButtons() {
            const builder = domel('div', this.slot)
                .addClass(`${this.cssPrefix}-buttons`)
                .addChild('button', b => this.nowButton = b
                .addClass(`${this.cssPrefix}-button ${this.cssPrefix}-button-now`)
                .text(i18n.getText('ButtonNow'))
                .on('click', () => {
                this.setDateTime(new Date());
                this.dateTimeChanged();
                return false;
            })
                .toDOM());
            if (this.options.showTimePicker || !this.options.oneClickDateSelection) {
                builder.addChild('button', b => this.submitButton = b
                    .addClass(`${this.cssPrefix}-button ${this.cssPrefix}-button-apply`)
                    .text(i18n.getText('ButtonApply'))
                    .on('click', () => {
                    this.apply(this.getDateTime());
                    return false;
                })
                    .toDOM());
            }
            builder.addChild('button', b => this.submitButton = b
                .addClass(`${this.cssPrefix}-button ${this.cssPrefix}-button-cancel`)
                .text(i18n.getText('ButtonCancel'))
                .on('click', () => {
                this.cancel();
                return false;
            })
                .toDOM());
        }
        createCalendar(options) {
            this.calendarSlot =
                domel('div', this.slot)
                    .addClass(`${this.cssPrefix}-cal`)
                    .toDOM();
            return new DefaultCalendar(this.calendarSlot, options);
        }
        createTimePicker(options) {
            this.timePickerSlot =
                domel('div', this.slot)
                    .addClass(`${this.cssPrefix}-tp`)
                    .toDOM();
            return new DefaultTimePicker(this.timePickerSlot, options);
        }
        show(anchor) {
            if (this.options.showDateTimeInput) {
                if (this.options.beforeShow) {
                    this.options.beforeShow();
                }
                const anchorPos = getElementAbsolutePos(anchor || document.body);
                const parentPos = getElementAbsolutePos(anchor ? anchor.parentElement || anchor : document.body);
                this.slot.style.top = parentPos.y + 'px';
                this.slot.style.left = anchorPos.x + 'px';
            }
            else {
                super.show(anchor);
                this.slot.focus();
            }
            setTimeout(() => {
                document.addEventListener('mousedown', this.globalMouseDownHandler, true);
            }, 1);
        }
    }

    var DialogFooterAlignment;
    (function (DialogFooterAlignment) {
        DialogFooterAlignment[DialogFooterAlignment["Left"] = 1] = "Left";
        DialogFooterAlignment[DialogFooterAlignment["Center"] = 2] = "Center";
        DialogFooterAlignment[DialogFooterAlignment["Right"] = 3] = "Right";
    })(DialogFooterAlignment || (DialogFooterAlignment = {}));

    const cssPrefix = "kdlg";
    class DefaultDialogService {
        openConfirm(title, content, callback) {
            const template = `<div id="${cssPrefix}-dialog-confirm">${content}</div>`;
            const options = {
                title: title,
                closable: false,
                submitable: true,
                cancelable: true,
                body: template
            };
            if (callback) {
                options.onSubmit = () => {
                    callback(true);
                };
                options.onCancel = () => {
                    callback(false);
                };
                this.open(options);
                return;
            }
            return new Promise((resolve) => {
                options.onSubmit = () => {
                    resolve(true);
                };
                options.onCancel = () => {
                    resolve(false);
                };
                this.open(options);
            });
        }
        openPrompt(title, content, defVal, callback) {
            const template = `<div id="${cssPrefix}-dialog-form" class="kfrm-form">
            <div class="kfrm-fields label-above">
                <label for="${cssPrefix}-dialog-form-input" id="${cssPrefix}-dialog-form-content">${content}</label>
                <input type="text" name="${cssPrefix}-dialog-form-input" id="${cssPrefix}-dialog-form-input" />
            </div>
        </div>`;
            const options = {
                title: title,
                submitable: true,
                closable: true,
                cancelable: true,
                submitOnEnter: true,
                body: template,
                arrangeParents: false,
                beforeOpen: () => {
                    const input = document.getElementById(`${cssPrefix}-dialog-form-input`);
                    if (defVal) {
                        input.value = defVal;
                    }
                    input.focus();
                }
            };
            const processInput = (callback) => {
                const input = document.getElementById(`${cssPrefix}-dialog-form-input`);
                const result = input.value;
                if (result && result.replace(/\s/g, '').length > 0) {
                    callback(result);
                    return true;
                }
                input.classList.add('eqjs-invalid');
                return false;
            };
            if (callback) {
                options.onSubmit = () => {
                    return processInput(callback);
                };
                options.onCancel = () => {
                    callback("");
                };
                this.open(options);
                return;
            }
            return new Promise((resolve) => {
                options.onSubmit = () => {
                    return processInput(resolve);
                };
                options.onCancel = () => {
                    resolve("");
                };
                this.open(options);
            });
        }
        open(options, data) {
            const dialog = new DefaultDialog(options, data);
            const onDestroy = options.onDestroy;
            options.onDestroy = (dlg) => {
                this.untrack(dlg);
                onDestroy && onDestroy(dlg);
            };
            dialog.open();
            this.track(dialog);
            return dialog;
        }
        createSet(options) {
            return new DefaultDialogSet(options, this);
        }
        untrack(dlg) {
            const index = DefaultDialogService.openDialogs.indexOf(dlg);
            if (index >= 0) {
                DefaultDialogService.openDialogs.splice(index, 1);
            }
        }
        track(dlg) {
            DefaultDialogService.openDialogs.push(dlg);
        }
        openProgress(options) {
            const dialog = new DefaultProgressDialog(options);
            const onDestroy = options.onDestroy;
            options.onDestroy = (dlg) => {
                this.untrack(dlg);
                onDestroy && onDestroy(dlg);
            };
            dialog.open();
            this.track(dialog);
            return dialog;
        }
        getAllDialogs() {
            return Array.from(DefaultDialogService.openDialogs);
        }
        closeAllDialogs() {
            for (const dialog of Array.from(DefaultDialogService.openDialogs)) {
                dialog.close();
            }
        }
    }
    DefaultDialogService.openDialogs = [];
    class DefaultDialog {
        constructor(options, data) {
            this.options = options;
            this.submitHandler = (token) => {
                if (this.options.onSubmit && this.options.onSubmit(this, token) === false) {
                    return false;
                }
                this.destroy();
                return true;
            };
            this.cancelHandler = () => {
                if (this.options.onCancel) {
                    this.options.onCancel(this);
                }
                this.destroy();
            };
            this.keydownHandler = (ev) => {
                if (ev.keyCode == 13 && this.isActiveDialog()) {
                    ev.preventDefault();
                    ev.stopPropagation();
                    if (this.submitHandler()) {
                        window.removeEventListener('keydown', this.keydownHandler, false);
                        return false;
                    }
                }
                return true;
            };
            this.dialogId = utils.generateId('dlg');
            this.data = data;
            this.slot =
                domel('div', document.body)
                    .attr('tab-index', '-1')
                    .data('dialog-id', this.dialogId)
                    .addClass(`${cssPrefix}-modal`, 'is-active')
                    .focus()
                    .addChild('div', b => b
                    .addClass('kdlg-modal-background'))
                    .addChild('div', b => this.windowElement = b
                    .addClass(`${cssPrefix}-modal-window`)
                    .addChild('header', b => {
                    this.headerElement = b
                        .addClass(`${cssPrefix}-header`)
                        .addChild('p', b => b
                        .addClass(`${cssPrefix}-header-title`)
                        .addText(options.title))
                        .toDOM();
                    if (options.closable !== false)
                        b.addChild('button', b => b
                            .addClass(`${cssPrefix}-modal-close`)
                            .on('click', () => {
                            this.cancelHandler();
                        })
                            .focus());
                })
                    .addChild('div', b => {
                    b.addClass(`${cssPrefix}-alert-container`);
                    this.alertElement = b.toDOM();
                })
                    .addChild('section', b => {
                    this.bodyElement = b
                        .addClass(`${cssPrefix}-body`)
                        .toDOM();
                    if (typeof options.body === 'string') {
                        const html = liquid.renderLiquidTemplate(options.body, data);
                        b.addHtml(html);
                    }
                    else {
                        b.addChildElement(options.body);
                    }
                })
                    .addChild('footer', b => {
                    let alignClass = null;
                    if (options.footerAlignment && options.footerAlignment == DialogFooterAlignment.Center) {
                        alignClass = 'align-center';
                    }
                    else {
                        alignClass = 'align-right';
                    }
                    this.footerElement = b
                        .addClass(`${cssPrefix}-footer`)
                        .toDOM();
                    b.addClass(alignClass);
                    if (options.submitable === false)
                        return;
                    b.addChild('button', bb => {
                        bb.id(this.dialogId + '-btn-submit')
                            .addClass('kfrm-button', 'is-info')
                            .addText(options.submitButtonText || i18n.getText('ButtonOK'));
                        if (options.recaptchaSiteKey) {
                            bb.data('sitekey', options.recaptchaSiteKey);
                            bb.addClass('g-recaptcha');
                            bb.on('click', (e) => {
                                if (grecaptcha) {
                                    grecaptcha.ready(() => {
                                        grecaptcha.execute(options.recaptchaSiteKey, { action: 'submit' })
                                            .then((token) => {
                                            this.submitHandler(token);
                                        });
                                    });
                                }
                                else {
                                    this.submitHandler();
                                }
                            });
                        }
                        else {
                            bb.on('click', (e) => {
                                this.submitHandler();
                            });
                        }
                        bb.focus();
                    });
                    if (options.cancelable !== false)
                        b.addChild('button', bb => bb
                            .id(this.dialogId + '-btn-cancel')
                            .addClass('kfrm-button')
                            .addText(options.cancelButtonText || i18n.getText('ButtonCancel'))
                            .on('click', (e) => {
                            this.cancelHandler();
                        }));
                })
                    .toDOM())
                    .toDOM();
        }
        getData() {
            return this.data;
        }
        getRootElement() {
            return this.slot;
        }
        getSubmitButtonElement() {
            return document.getElementById(this.dialogId + '-btn-submit');
        }
        getCancelButtonElement() {
            return document.getElementById(this.dialogId + '-btn-cancel');
        }
        open() {
            if (this.options.beforeOpen) {
                this.options.beforeOpen(this);
            }
            domel(this.slot).show();
            if (this.options.arrangeParents) {
                this.arrangeParents(true);
            }
            const windowDiv = this.slot
                .querySelector(`.${cssPrefix}-modal-window`);
            if (this.options.height) {
                windowDiv.style.height = typeof this.options.height === 'string'
                    ? this.options.height
                    : `${this.options.height}px`;
            }
            if (this.options.width) {
                windowDiv.style.width = typeof this.options.width === 'string'
                    ? this.options.width
                    : `${this.options.width}px`;
            }
            if (this.options.submitOnEnter) {
                window.addEventListener('keydown', this.keydownHandler, false);
            }
            //clear alert on change in any input element 
            this.slot.querySelectorAll('input')
                .forEach(element => element.addEventListener('input', () => {
                this.clearAlert();
                if (this.options.onInput) {
                    this.options.onInput(this);
                }
            }));
            if (this.options.onShow) {
                this.options.onShow(this);
            }
        }
        submit() {
            this.submitHandler();
        }
        cancel() {
            this.cancelHandler();
        }
        close() {
            this.destroy();
        }
        disableButtons() {
            const buttons = this.slot.querySelectorAll('button');
            buttons.forEach(button => button.disabled = true);
        }
        enableButtons() {
            const buttons = this.slot.querySelectorAll('button');
            buttons.forEach(button => button.disabled = false);
        }
        showAlert(text, reason, replace) {
            let alert = domel('div')
                .addClass(`${cssPrefix}-alert ${reason || ''}`)
                .addChild('span', b => b
                .addClass(`${cssPrefix}-alert-closebtn`)
                .text('×')
                .on('click', (ev) => {
                const alert = ev.target.parentElement;
                alert.parentElement.removeChild(alert);
            }))
                .addText(text)
                .toDOM();
            if (replace === true) {
                this.clearAlert();
            }
            this.alertElement.appendChild(alert);
        }
        clearAlert() {
            this.alertElement.innerHTML = '';
        }
        destroy() {
            const elem = document.querySelectorAll(`[data-dialog-id="${this.dialogId}"]`);
            if (elem.length <= 0)
                return;
            if (this.options.arrangeParents) {
                this.arrangeParents(false);
            }
            document.body.removeChild(this.slot);
            if (this.options.submitOnEnter) {
                window.removeEventListener('keydown', this.keydownHandler, false);
            }
            if (this.options.onDestroy) {
                this.options.onDestroy(this);
            }
        }
        isActiveDialog() {
            const windowDivs = document.documentElement.querySelectorAll('.kdlg-modal');
            return windowDivs[windowDivs.length - 1] === this.slot;
        }
        arrangeParents(turnOn) {
            const windowDivs = document.documentElement.querySelectorAll('.kdlg-modal-window');
            for (let i = 0; i < windowDivs.length - 1; i++) {
                if (turnOn) {
                    const offset = i == 0 ? 20 : i * 40 + 20;
                    domel(windowDivs[i])
                        .setStyle('margin-top', `${offset}px`)
                        .setStyle('margin-left', `${offset}px`);
                }
                else {
                    domel(windowDivs[i])
                        .removeStyle('margin-top')
                        .removeStyle('margin-left');
                }
            }
        }
    }
    class DefaultProgressDialog extends DefaultDialog {
        constructor(options, data) {
            let contentElement;
            let progressElement;
            const body = domel('div')
                .addChild('div', b => contentElement = b
                .text(options.content || '')
                .toDOM())
                .addChild('div', b => {
                b
                    .addClass(`${cssPrefix}-progress-line`)
                    .addChild('div', b => {
                    progressElement = b
                        .addClass('fill')
                        .toDOM();
                    if (options.determinated) {
                        b.setStyle('width', '0%');
                    }
                    else {
                        b.addClass('indeterminate');
                    }
                });
            })
                .toDOM();
            super({
                title: options.title,
                body: body,
                beforeOpen: options.beforeOpen,
                onSubmit: options.onSubmit,
                width: options.width,
                height: options.height,
                submitable: false,
                cancelable: false,
                closable: false,
                onDestroy: options.onDestroy
            }, data);
            this.contentElement = contentElement;
            this.progressElement = progressElement;
        }
        updateContent(content) {
            this.contentElement.innerText = content;
        }
        updateProgress(progress) {
            progress = this.in01(progress);
            this.progressElement.style.width = `${progress * 100}%`;
            if (progress === 1) {
                // postpone for 0.5s for smooth closing
                setTimeout(() => {
                    this.submit();
                }, 500);
            }
        }
        in01(num) {
            if (num > 1)
                return 1;
            if (num < 0)
                return 0;
            return num;
        }
    }
    class DefaultDialogSet {
        constructor(options, dialogService) {
            this.options = options;
            this.dialogService = dialogService;
            this.currentDialog = null;
            this.currentIndex = 0;
            this.options = options;
            this.dialogService = dialogService;
        }
        getCurrent() {
            return this.currentDialog;
        }
        openNext(data) {
            return this.open(this.currentIndex + 1, data);
        }
        openPrev(data) {
            return this.open(this.currentIndex - 1, data);
        }
        open(page, data) {
            if (page < 0) {
                this.currentIndex = 0;
            }
            else if (page >= this.options.length) {
                this.currentIndex = this.options.length - 1;
            }
            else {
                this.currentIndex = page;
            }
            if (this.currentDialog) {
                try {
                    this.currentDialog.close();
                }
                catch (e) { }
            }
            const dlgOptions = this.options[this.currentIndex];
            this.currentDialog = this.dialogService.open(dlgOptions, data);
            return this.currentDialog;
        }
        close() {
            if (this.currentDialog) {
                this.currentDialog.close();
                this.currentDialog = null;
            }
        }
    }

    function addEasyDataUITexts() {
        i18n.updateDefaultTexts({
            GridPageInfo: '{FirstPageRecordNum} - {LastPageRecordNum} of {Total} records',
            GridItemsPerPage: 'items per page',
            ButtonOK: "OK",
            ButtonCancel: "Cancel",
            ButtonApply: 'Apply',
            ButtonNow: 'Now',
            LblTotal: 'Total'
        });
    }
    addEasyDataUITexts();

    var PRE_SELECT;
    (function (PRE_SELECT) {
        PRE_SELECT[PRE_SELECT["THIS_WEEK"] = 0] = "THIS_WEEK";
        PRE_SELECT[PRE_SELECT["LAST_WEEK"] = 1] = "LAST_WEEK";
        PRE_SELECT[PRE_SELECT["THIS_MONTH"] = 2] = "THIS_MONTH";
        PRE_SELECT[PRE_SELECT["FIRST_MONTH"] = 3] = "FIRST_MONTH";
        PRE_SELECT[PRE_SELECT["LAST_MONTH"] = 4] = "LAST_MONTH";
        PRE_SELECT[PRE_SELECT["THIS_YEAR"] = 5] = "THIS_YEAR";
        PRE_SELECT[PRE_SELECT["QUARTER_1"] = 6] = "QUARTER_1";
        PRE_SELECT[PRE_SELECT["QUARTER_2"] = 7] = "QUARTER_2";
        PRE_SELECT[PRE_SELECT["QUARTER_3"] = 8] = "QUARTER_3";
        PRE_SELECT[PRE_SELECT["QUARTER_4"] = 9] = "QUARTER_4";
    })(PRE_SELECT || (PRE_SELECT = {}));
    var JUMP_TO;
    (function (JUMP_TO) {
        JUMP_TO["UNDEF"] = "-1";
        JUMP_TO["TODAY"] = "1";
        JUMP_TO["YESTERDAY"] = "2";
        JUMP_TO["TOMORROW"] = "3";
        JUMP_TO["WEEK_START"] = "4";
        JUMP_TO["WEEK_END"] = "5";
        JUMP_TO["MONTH_START"] = "6";
        JUMP_TO["MONTH_END"] = "7";
        JUMP_TO["YEAR_START"] = "8";
        JUMP_TO["YEAR_END"] = "9";
    })(JUMP_TO || (JUMP_TO = {}));

    const internalDateFormat = 'yyyy-MM-dd';
    const internalTimeFormat = 'HH:mm';
    const getInternalDateTimeFormat = (dtype) => {
        if (dtype == DataType$1.Date)
            return internalDateFormat;
        if (dtype == DataType$1.Time)
            return internalTimeFormat;
        return `${internalDateFormat}T${internalTimeFormat}`;
    };
    const getEditDateTimeFormat = (dtype) => {
        const settings = i18n$1.getLocaleSettings();
        if (dtype == DataType$1.Date)
            return settings.editDateFormat;
        if (dtype == DataType$1.Time)
            return settings.editTimeFormat;
        return `${settings.editDateFormat} ${settings.editTimeFormat}`;
    };
    const setLocation = (path) => {
        const state = window.history.state;
        history.pushState(state, document.title, path);
        window.dispatchEvent(new Event('ed_set_location'));
    };

    class Validator {
    }

    class DateTimeValidator extends Validator {
        constructor() {
            super();
            this.name = 'DateTime';
        }
        validate(attr, value) {
            if (!utils$1.IsDefinedAndNotNull(value) || value == '')
                return { successed: true };
            if (utils$1.getDateDataTypes().indexOf(attr.dataType) >= 0) {
                try {
                    const editFormat = getEditDateTimeFormat(attr.dataType);
                    const newDate = utils$1.strToDateTime(value, editFormat);
                }
                catch (_a) {
                    return {
                        successed: false,
                        messages: [i18n$1.getText('DateTimeError')]
                    };
                }
            }
            return { successed: true };
        }
    }

    class EntityEditForm {
        constructor(context) {
            this.context = context;
            this.validators = [new DateTimeValidator()];
        }
        getHtml() {
            return this.html;
        }
        setHtmlInt(html) {
            this.html = html;
            this.errorsDiv = this.html.querySelector('.errors-block');
        }
        validate() {
            this.clearErrors();
            const inputs = Array.from(this.html.querySelectorAll('input, select'));
            let isValid = true;
            for (const input of inputs) {
                const attr = this.context.getMetaData().getAttributeById(input.name);
                if (input.type === 'checkbox')
                    continue;
                const result = this.validateValue(attr, input.value);
                if (!result.successed) {
                    if (isValid) {
                        domel(this.errorsDiv)
                            .addChild('ul');
                    }
                    isValid = false;
                    for (const message of result.messages) {
                        this.errorsDiv.firstElementChild.innerHTML += `<li>${attr.caption}: ${message}</li>`;
                    }
                }
                this.markInputValid(input, result.successed);
            }
            return isValid;
        }
        getData() {
            return new Promise((resolve, reject) => {
                const filePromises = [];
                const inputs = Array.from(this.html
                    .querySelectorAll('input, select, textarea'));
                let obj = {};
                for (const input of inputs) {
                    const property = input.name.substring(input.name.lastIndexOf('.') + 1);
                    const attr = this.context.getMetaData().getAttributeById(input.name);
                    if (input.type === 'checkbox') {
                        obj[property] = input.checked;
                    }
                    else if (input.type === 'file') {
                        filePromises.push(this.fileToBase64(input.files[0])
                            .then(content => obj[property] = content));
                    }
                    else {
                        obj[property] = this.mapValue(attr.dataType, input.value);
                    }
                }
                Promise.all(filePromises)
                    .then(() => resolve(obj))
                    .catch((e) => reject(e));
            });
        }
        fileToBase64(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => {
                    const result = reader.result.toString();
                    resolve(result.substring(result.indexOf(',') + 1));
                };
                reader.onerror = error => reject(error);
            });
        }
        useValidator(...validator) {
            this.useValidators(validator);
        }
        useValidators(validators) {
            this.validators = this.validators.concat(validators);
        }
        mapValue(type, value) {
            if (utils$1.getDateDataTypes().indexOf(type) >= 0) {
                if (type !== DataType$1.Time && value && value.length) {
                    const editFormat = getEditDateTimeFormat(type);
                    const internalFormat = getInternalDateTimeFormat(type);
                    const date = utils$1.strToDateTime(value, editFormat);
                    return i18n$1.dateTimeToStr(date, internalFormat);
                }
                return value && value.length ? value : null;
            }
            if (utils$1.isIntType(type))
                return parseInt(value);
            if (utils$1.isNumericType(type))
                return parseFloat(value);
            return value;
        }
        clearErrors() {
            this.errorsDiv.innerHTML = '';
            this.html.querySelectorAll('input, select').forEach(el => {
                el.classList.remove('is-valid');
                el.classList.remove('is-invalid');
            });
        }
        markInputValid(input, valid) {
            input.classList.add(valid ? 'is-valid' : 'is-invalid');
        }
        validateValue(attr, value) {
            const result = { successed: true, messages: [] };
            for (const validator of this.validators) {
                const res = validator.validate(attr, value);
                if (!res.successed) {
                    result.successed = false;
                    result.messages = result.messages.concat(res.messages);
                }
            }
            return result;
        }
    }

    class TextFilterWidget {
        constructor(slot, grid, filter, options) {
            this.slot = slot;
            this.grid = grid;
            this.filter = filter;
            this.options = {
                focus: false,
                instantMode: false,
                instantTimeout: 1000
            };
            this.options = utils$1.assignDeep(this.options, options || {});
            const stringDefRenderer = this.grid.cellRendererStore
                .getDefaultRendererByType(CellRendererType.STRING);
            this.grid.cellRendererStore
                .setDefaultRenderer(CellRendererType.STRING, (value, column, cellElement, rowElement) => this.highlightCellRenderer(stringDefRenderer, value, column, cellElement, rowElement));
            const numDefRenderer = this.grid.cellRendererStore
                .getDefaultRendererByType(CellRendererType.NUMBER);
            this.grid.cellRendererStore
                .setDefaultRenderer(CellRendererType.NUMBER, (value, column, cellElement, rowElement) => this.highlightCellRenderer(numDefRenderer, value, column, cellElement, rowElement));
            this.render();
        }
        render() {
            const horizClass = browserUtils.IsIE()
                ? 'kfrm-fields-ie is-horizontal'
                : 'kfrm-fields is-horizontal';
            const isEdgeOrIE = browserUtils.IsIE() || browserUtils.IsEdge();
            domel(this.slot)
                .addClass(horizClass)
                .addChild('div', b => {
                b
                    .addClass('control')
                    .addChild('input', b => {
                    this.filterInput = b.toDOM();
                    b
                        .attr('placeholder', i18n$1.getText('SearchInputPlaceholder'))
                        .type('text');
                    b.on('keydown', this.inputKeydownHandler.bind(this));
                    if (this.options.instantMode) {
                        b.on('keyup', this.inputKeyupHandler.bind(this));
                    }
                });
                if (!isEdgeOrIE) {
                    b
                        .addClass('has-icons-right')
                        .addChild('span', b => {
                        b
                            .addClass('icon')
                            .addClass('is-right')
                            .addClass('is-clickable')
                            .html('&#x1F5D9;')
                            .on('click', this.clearButtonClickHander.bind(this));
                    });
                }
            });
            if (!this.options.instantMode) {
                domel(this.slot)
                    .addChild('button', b => b
                    .addClass('kfrm-button')
                    .addText(i18n$1.getText('SearchBtn'))
                    .on('click', this.searchButtonClickHandler.bind(this)));
            }
            if (this.options.focus) {
                this.filterInput.focus();
            }
        }
        inputKeydownHandler(ev) {
            if (ev.keyCode == 13) {
                this.applyFilter(true);
            }
        }
        inputKeyupHandler() {
            if (this.applyFilterTimeout) {
                clearTimeout(this.applyFilterTimeout);
            }
            this.applyFilterTimeout = setTimeout(() => {
                this.applyFilter(true);
            }, this.options.instantTimeout);
        }
        clearButtonClickHander() {
            this.filterInput.value = '';
            this.filterInput.focus();
            this.applyFilter(true);
        }
        searchButtonClickHandler() {
            this.applyFilter(true);
        }
        applyFilter(checkChange) {
            if (this.applyFilterTimeout) {
                clearTimeout(this.applyFilterTimeout);
            }
            const filterValue = this.filter.getValue();
            if (!checkChange || filterValue != this.filterInput.value) {
                this.filter.apply(this.filterInput.value)
                    .then(data => {
                    this.grid.setData(data);
                });
                return true;
            }
            return false;
        }
        highlightCellRenderer(defaultRenderer, value, column, cellElement, rowElement) {
            if (utils$1.isNumericType(column.type)
                || utils$1.getStringDataTypes().indexOf(column.type) >= 0) {
                if (value) {
                    if (column.dataColumn && column.dataColumn.displayFormat
                        && DFMT_REGEX.test(column.dataColumn.displayFormat)) {
                        value = column.dataColumn.displayFormat.replace(DFMT_REGEX, (_, $1) => {
                            return i18n$1.numberToStr(value, $1);
                        });
                    }
                    else {
                        value = value.toLocaleString();
                    }
                    const result = this.highlightText(value.toString());
                    if (result instanceof HTMLElement) {
                        cellElement.title = value;
                        cellElement.appendChild(result);
                        return;
                    }
                }
            }
            defaultRenderer(value, column, cellElement, rowElement);
        }
        highlightText(content) {
            const normalizedContent = content.toLowerCase();
            const filterValue = this.filter.getValue().toString();
            if (filterValue && filterValue.length > 0 && content && content.length > 0) {
                const indexInMas = [];
                const words = filterValue.split('||').map(w => w.trim().toLowerCase());
                for (let i = 0; i < words.length; i++) {
                    let pos = 0;
                    const lowerWord = words[i];
                    if (!lowerWord.length)
                        continue;
                    if (lowerWord === normalizedContent) {
                        const highlightSpan = document.createElement('span');
                        highlightSpan.style.backgroundColor = 'yellow';
                        highlightSpan.innerText = content;
                        return highlightSpan;
                    }
                    while (pos < content.length - 1) {
                        const index = normalizedContent.indexOf(lowerWord, pos);
                        if (index >= 0) {
                            indexInMas.push({ index: index, length: words[i].length });
                            pos = index + lowerWord.length;
                        }
                        else {
                            pos++;
                        }
                    }
                }
                if (indexInMas.length > 0) {
                    //sort array item by index
                    indexInMas.sort((item1, item2) => {
                        if (item1.index > item2.index) {
                            return 1;
                        }
                        else if (item1.index == item2.index2) {
                            return 0;
                        }
                        else {
                            return -1;
                        }
                    });
                    //remove intersecting gaps
                    for (let i = 0; i < indexInMas.length - 1;) {
                        const delta = indexInMas[i + 1].index - (indexInMas[i].index + indexInMas[i].length);
                        if (delta < 0) {
                            const addDelta = indexInMas[i + 1].length + delta;
                            if (addDelta > 0) {
                                indexInMas[i].length += addDelta;
                            }
                            indexInMas.splice(i + 1, 1);
                        }
                        else {
                            i++;
                        }
                    }
                    const div = document.createElement('div');
                    for (let i = 0; i < indexInMas.length; i++) {
                        if (i === 0) {
                            const text = document.createTextNode(content.substring(0, indexInMas[i].index));
                            div.appendChild(text);
                        }
                        const highlightSpan = document.createElement('span');
                        highlightSpan.style.backgroundColor = 'yellow';
                        highlightSpan.innerText = content.substring(indexInMas[i].index, indexInMas[i].index + indexInMas[i].length);
                        div.appendChild(highlightSpan);
                        const text = (i < indexInMas.length - 1)
                            ? document.createTextNode(content.substring(indexInMas[i].index
                                + indexInMas[i].length, indexInMas[i + 1].index))
                            : document.createTextNode(content.substring(indexInMas[i].index
                                + indexInMas[i].length));
                        div.appendChild(text);
                    }
                    return div;
                }
            }
            return content;
        }
    }

    const isIE = browserUtils.IsIE();
    class EntityEditFormBuilder {
        constructor(context, params) {
            this.context = context;
            this.params = params;
            this.params = params || {};
            this.reset();
        }
        reset() {
            this.form = new EntityEditForm(this.context);
        }
        setupLookupField(parent, attr, readOnly, value) {
            const lookupEntity = this.context.getMetaData().getRootEntity()
                .subEntities.filter(ent => ent.id == attr.lookupEntity)[0];
            const dataAttr = this.context.getMetaData().getAttributeById(attr.dataAttr);
            if (!dataAttr)
                return;
            readOnly = readOnly || !dataAttr.isEditable;
            value = this.params.values
                ? this.params.values.getValue(dataAttr.id)
                : undefined;
            const horizClass = isIE
                ? 'kfrm-fields-ie is-horizontal'
                : 'kfrm-fields is-horizontal';
            let inputEl;
            domel(parent)
                .addChild('div', b => {
                b
                    .addClass(horizClass)
                    .addChild('input', b => {
                    inputEl = b.toDOM();
                    b.attr('readonly', '');
                    b.name(dataAttr.id);
                    b.type(this.resolveInputType(dataAttr.dataType));
                    b.value(utils$1.IsDefinedAndNotNull(value)
                        ? value.toString() : '');
                });
                if (!readOnly)
                    b.addChild('button', b => b
                        .addClass('kfrm-button')
                        .attr('title', i18n$1.getText('NavigationBtnTitle'))
                        .addText('...')
                        .on('click', (ev) => {
                        const lookupTable = new EasyDataTable({
                            loader: {
                                loadChunk: (chunkParams) => this.context.getDataLoader()
                                    .loadChunk(Object.assign(Object.assign({}, chunkParams), { id: lookupEntity.id }))
                            }
                        });
                        this.context.getDataLoader()
                            .loadChunk({ offset: 0, limit: 1000, needTotal: true, sourceId: lookupEntity.id })
                            .then(data => {
                            for (const col of data.table.columns.getItems()) {
                                const attrs = lookupEntity.attributes.filter(attr => attr.id == col.id && (attr.isPrimaryKey || attr.showInLookup));
                                if (attrs.length) {
                                    lookupTable.columns.add(col);
                                }
                            }
                            lookupTable.setTotal(data.total);
                            for (const row of data.table.getCachedRows()) {
                                lookupTable.addRow(row);
                            }
                            const ds = new DefaultDialogService();
                            let gridSlot = null;
                            let selectedSlot = null;
                            let widgetSlot;
                            const slot = domel('div')
                                .addClass(`kfrm-form`)
                                .addChild('div', b => b
                                .addClass(`kfrm-field`)
                                .addChild('label', b => b
                                .addText(i18n$1.getText('LookupSelectedItem'))
                                .toDOM())
                                .addChild('div', b => selectedSlot = b
                                .addText('None')
                                .toDOM()))
                                .addChild('div', b => widgetSlot = b.toDOM())
                                .addChild('div', b => b
                                .addClass('kfrm-control')
                                .addChild('div', b => gridSlot = b.toDOM()))
                                .toDOM();
                            let selectedValue = inputEl.value;
                            const getValue = (row, colId) => {
                                if (row instanceof DataRow$1) {
                                    return row.getValue(colId);
                                }
                                const property = colId.substring(colId.lastIndexOf('.') + 1);
                                return row[property];
                            };
                            const updateSelectedValue = (row) => {
                                selectedSlot.innerHTML = lookupTable.columns
                                    .getItems()
                                    .map(col => {
                                    return `<b>${col.label}:</b> ${getValue(row, col.id)}`;
                                })
                                    .join(', ');
                            };
                            if (selectedValue) {
                                const attr = lookupEntity.getFirstPrimaryAttr();
                                const key = attr.id.substring(attr.id.lastIndexOf('.') + 1);
                                this.context.fetchRecord({ [key]: selectedValue }, lookupEntity.id)
                                    .then(data => {
                                    if (data.entity) {
                                        updateSelectedValue(data.entity);
                                    }
                                })
                                    .catch(error => {
                                    console.error(error);
                                });
                            }
                            const lookupGrid = new EasyGrid({
                                slot: gridSlot,
                                dataTable: lookupTable,
                                fixHeightOnFirstRender: true,
                                paging: {
                                    pageSize: 10
                                },
                                onActiveRowChanged: (ev) => {
                                    lookupGrid.getData().getRow(ev.rowIndex)
                                        .then((row) => {
                                        selectedValue = row.getValue(attr.lookupDataAttr);
                                        updateSelectedValue(row);
                                    });
                                }
                            });
                            ds.open({
                                title: i18n$1.getText('LookupDlgCaption')
                                    .replace('{entity}', lookupEntity.caption),
                                body: slot,
                                arrangeParents: true,
                                beforeOpen: () => {
                                    const dataFilter = this.context.createFilter(lookupEntity.id, lookupGrid.getData(), true);
                                    new TextFilterWidget(widgetSlot, lookupGrid, dataFilter, { instantMode: true, focus: true });
                                },
                                onSubmit: () => {
                                    inputEl.value = selectedValue;
                                    return true;
                                },
                                onDestroy: () => {
                                    lookupGrid.destroy();
                                    // return focus on button
                                    b.toDOM().focus();
                                }
                            });
                        });
                    }));
            });
        }
        setupDateTimeField(parent, attr, value, readOnly, hidden) {
            const horizClass = isIE
                ? 'kfrm-fields-ie is-horizontal'
                : 'kfrm-fields is-horizontal';
            const editFormat = getEditDateTimeFormat(attr.dataType);
            let inputEl;
            const mask = editFormat
                .replace('yyyy', '9999')
                .replace('MM', '99')
                .replace('dd', '99')
                .replace('HH', '99')
                .replace('mm', '99')
                .replace('ss', '99');
            domel(parent)
                .addChild('div', b => {
                b
                    .addClass(horizClass)
                    .addChild('input', b => {
                    inputEl = b.toDOM();
                    b.name(attr.id);
                    b.type(hidden ? 'hidden' : this.resolveInputType(attr.dataType));
                    if (readOnly) {
                        b.attr('readonly', '');
                    }
                    else {
                        b.mask(mask);
                        b.on('keypress', (ev) => this.applySumbit(ev))
                            .on('input', ev => {
                            b.removeClass('is-invalid');
                            try {
                                const newDate = utils$1.strToDateTime(inputEl.value, editFormat);
                            }
                            catch (e) {
                                b.addClass('is-invalid');
                            }
                            finally {
                            }
                        })
                            .on('blur', ev => {
                            if (inputEl.value === mask.replace(/[9]/g, '_')) {
                                inputEl.value = '';
                            }
                        });
                    }
                    b.value((utils$1.IsDefinedAndNotNull(value)
                        ? i18n$1.dateTimeToStr(value, editFormat)
                        : ''));
                });
                if (!readOnly)
                    b.addChild('button', b => b
                        .addClass('kfrm-button')
                        .attr('title', i18n$1.getText(attr.dataType !== DataType$1.Time
                        ? 'CalendarBtnTitle'
                        : 'TimerBtnTitle'))
                        .addChild('i', b => b.addClass(attr.dataType !== DataType$1.Time
                        ? 'ed-calendar-icon'
                        : 'ed-timer-icon'))
                        .on('click', (ev) => {
                        let value;
                        try {
                            value = inputEl.value.length
                                ? attr.dataType !== DataType$1.Time
                                    ? utils$1.strToDateTime(inputEl.value, editFormat)
                                    : utils$1.strToTime(inputEl.value)
                                : new Date(new Date().setSeconds(0));
                        }
                        catch (_a) {
                            value = new Date(new Date().setSeconds(0));
                        }
                        const pickerOptions = {
                            zIndex: 9999999999,
                            showCalendar: attr.dataType !== DataType$1.Time,
                            showTimePicker: attr.dataType !== DataType$1.Date,
                            onApply: (dateTime) => {
                                dateTime.setSeconds(0);
                                dateTime.setMilliseconds(0);
                                inputEl.value = i18n$1.dateTimeToStr(dateTime, editFormat);
                            }
                        };
                        const dtp = new DefaultDateTimePicker(pickerOptions);
                        dtp.setDateTime(value);
                        dtp.show(ev.target);
                    }).toDOM());
            });
        }
        setupListField(parent, attr, value, values, readOnly) {
            domel(parent)
                .addChild('div', b => b
                .addClass('kfrm-select full-width')
                .addChild('select', b => {
                if (readOnly)
                    b.attr('readonly', '');
                b.attr('name', attr.id);
                b.on('keypress', (ev) => this.applySumbit(ev));
                if (values) {
                    for (let i = 0; i < values.length; i++) {
                        const val = values[i];
                        b.addOption({
                            value: val.id,
                            title: val.text,
                            selected: i === 0
                        });
                    }
                }
                b.value(value);
            }));
        }
        setupFileField(parent, attr, readOnly, accept) {
            domel(parent)
                .addChild('input', b => {
                if (readOnly)
                    b.attr('readonly', '');
                b.name(attr.id)
                    .type(this.resolveInputType(attr.dataType));
                b.attr('accept', accept);
            });
        }
        setupTextField(parent, attr, value, readOnly, hidden) {
            domel(parent)
                .addChild('input', b => {
                if (readOnly) {
                    b.attr('readonly', '');
                }
                b.type(hidden ? 'hidden' : this.resolveInputType(attr.dataType));
                b.name(attr.id)
                    .type(this.resolveInputType(attr.dataType));
                if (attr.dataType == DataType$1.Bool) {
                    if (value)
                        b.attr('checked', '');
                }
                else {
                    b.on('keypress', (ev) => this.applySumbit(ev))
                        .value(utils$1.IsDefinedAndNotNull(value)
                        ? value.toString()
                        : '');
                }
            });
        }
        setupTextArea(parent, attr, value, readOnly) {
            // feature: modify size in value editor ??
            domel(parent)
                .addChild('textarea', b => {
                if (readOnly)
                    b.attr('readonly', '');
                b.attr('name', attr.id);
                b.setStyle('height', `120px`);
                b.value(utils$1.IsDefinedAndNotNull(value)
                    ? value.toString()
                    : '');
            });
        }
        addFormField(parent, attr) {
            const value = (this.params.values && attr.kind !== EntityAttrKind$1.Lookup)
                ? this.params.values.getValue(attr.id)
                : !this.params.isEditForm
                    ? attr.defaultValue
                    : undefined;
            const editor = this.resolveEditor(attr);
            const readOnly = this.params.isEditForm && (attr.isPrimaryKey || !attr.isEditable);
            const required = !attr.isNullable;
            if (isIE) {
                parent = domel('div', parent)
                    .addClass('kfrm-field-ie')
                    .toDOM();
            }
            domel(parent)
                .addChild('label', b => {
                b.attr('for', attr.id);
                b.addHtml(`${attr.caption} ${required ? '<sup style="color: red">*</sup>' : ''}: `);
                if (attr.description) {
                    b.addChild('div', b => b
                        .attr('title', attr.description)
                        .addClass('question-mark')
                        .setStyle('vertical-align', 'middle')
                        .setStyle('display', 'inline-block'));
                }
            });
            const hidden = attr.isPrimaryKey;
            if (attr.kind === EntityAttrKind$1.Lookup) {
                this.setupLookupField(parent, attr, readOnly, value);
                return;
            }
            switch (editor.tag) {
                case EditorTag.DateTime:
                    this.setupDateTimeField(parent, attr, value, readOnly, hidden);
                    break;
                case EditorTag.List:
                    this.setupListField(parent, attr, value, editor.values, readOnly);
                    break;
                case EditorTag.File:
                    this.setupFileField(parent, attr, readOnly, editor.accept);
                    break;
                case EditorTag.Edit:
                default:
                    if (editor.multiline) {
                        this.setupTextArea(parent, attr, value, readOnly);
                    }
                    else {
                        this.setupTextField(parent, attr, value, readOnly, hidden);
                    }
                    break;
            }
        }
        resolveInputType(dataType) {
            if (dataType === DataType$1.Bool)
                return 'checkbox';
            if (dataType === DataType$1.Blob)
                return 'file';
            return 'text';
        }
        resolveEditor(attr) {
            let editor = attr.defaultEditor || new ValueEditor();
            if (editor.tag == EditorTag.Unknown) {
                if (utils$1.getDateDataTypes().indexOf(attr.dataType) >= 0) {
                    editor.tag = EditorTag.DateTime;
                }
                else {
                    editor.tag = EditorTag.Edit;
                }
            }
            return editor;
        }
        applySumbit(ev) {
            if (ev.keyCode === 13) {
                this.sumbitCallback && this.sumbitCallback();
                return false;
            }
            return false;
        }
        onSubmit(sumbitCallback) {
            this.sumbitCallback = sumbitCallback;
            return this;
        }
        build() {
            let fb;
            const formHtml = domel('div')
                .addClass('kfrm-form')
                .addChild('div', b => b
                .addClass(`errors-block`)
                .toDOM())
                .addChild('div', b => {
                b.addClass(`${isIE
                ? 'kfrm-fields-ie col-ie-1-4 label-align-right'
                : 'kfrm-fields col-a-1 label-align-right'}`);
                fb = b;
            })
                .toDOM();
            this.form['setHtmlInt'](formHtml);
            for (const attr of this.context.getActiveEntity().attributes) {
                if (!this.params.isEditForm && !attr.showOnCreate)
                    continue;
                if (!attr.isPrimaryKey && this.params.isEditForm && !attr.showOnEdit) {
                    continue;
                }
                this.addFormField(fb.toDOM(), attr);
            }
            return this.form;
        }
    }

    class ProgressBar {
        constructor(slot) {
            this.slot = slot;
            this.hide();
            this.slot.classList.add('ed-progress-bar');
        }
        show() {
            this.slot.style.removeProperty('display');
        }
        hide() {
            this.slot.style.display = 'none';
        }
    }

    class EasyDataServerLoader {
        constructor(context) {
            this.context = context;
        }
        loadChunk(params) {
            const url = this.context.resolveEndpoint('FetchDataset', { sourceId: params.sourceId || this.context.getActiveEntity().id });
            delete params.sourceId;
            this.context.startProcess();
            const http = this.context.getHttpClient();
            return http.post(url, params)
                .then((result) => {
                const dataTable = new EasyDataTable({
                    chunkSize: 1000
                });
                const resultSet = result.resultSet;
                for (const col of resultSet.cols) {
                    dataTable.columns.add(col);
                }
                for (const row of resultSet.rows) {
                    dataTable.addRow(row);
                }
                let totalRecords = 0;
                if (result.meta && result.meta.totalRecords) {
                    totalRecords = result.meta.totalRecords;
                }
                return {
                    table: dataTable,
                    total: totalRecords,
                    hasNext: !params.needTotal
                        || params.offset + params.limit < totalRecords
                };
            })
                .finally(() => {
                this.context.endProcess();
            });
        }
    }

    class DataContext {
        constructor(options) {
            this.endpoints = new Map();
            this.endpointVarsRegex = /\{.*?\}/g;
            this.options = options || {};
            this.http = new HttpClient();
            this.model = new MetaData();
            this.model.id = options.metaDataId || '__default';
            this.dataLoader = new EasyDataServerLoader(this);
            const dataTableOptions = Object.assign({ loader: this.dataLoader }, options.dataTable);
            this.data = new EasyDataTable(dataTableOptions);
            this.setDefaultEndpoints(this.options.endpoint || '/api/easydata');
        }
        getActiveEntity() {
            return this.activeEntity;
        }
        setActiveSource(entityId) {
            this.activeEntity = this.model.getRootEntity().subEntities
                .filter(e => e.id == entityId)[0];
        }
        getMetaData() {
            return this.model;
        }
        getData() {
            return this.data;
        }
        getDataLoader() {
            return this.dataLoader;
        }
        createFilter(sourceId, data, isLookup) {
            return new TextDataFilter(this.dataLoader, data || this.getData(), sourceId || this.activeEntity.id, isLookup);
        }
        loadMetaData() {
            const url = this.resolveEndpoint('GetMetaData');
            this.startProcess();
            return this.http.get(url)
                .then(result => {
                if (result.model) {
                    this.model.loadFromData(result.model);
                }
                return this.model;
            })
                .catch(error => {
                console.error(`Error: ${error.message}. Source: ${error.sourceError}`);
                return null;
            })
                .finally(() => {
                this.endProcess();
            });
        }
        getHttpClient() {
            return this.http;
        }
        fetchDataset() {
            this.data.clear();
            return this.dataLoader.loadChunk({ offset: 0, limit: this.data.chunkSize, needTotal: true })
                .then(result => {
                for (const col of result.table.columns.getItems()) {
                    this.data.columns.add(col);
                }
                this.data.setTotal(result.total);
                for (const row of result.table.getCachedRows()) {
                    this.data.addRow(row);
                }
                return this.data;
            });
        }
        fetchRecord(keys, sourceId) {
            const url = this.resolveEndpoint('FetchRecord', { sourceId: sourceId || this.activeEntity.id });
            this.startProcess();
            return this.http.get(url, { queryParams: keys })
                .finally(() => this.endProcess());
        }
        createRecord(obj, sourceId) {
            const url = this.resolveEndpoint('CreateRecord', { sourceId: sourceId || this.activeEntity.id });
            this.startProcess();
            return this.http.post(url, obj, { dataType: 'json' })
                .finally(() => this.endProcess());
        }
        updateRecord(obj, sourceId) {
            const url = this.resolveEndpoint('UpdateRecord', { sourceId: sourceId || this.activeEntity.id });
            this.startProcess();
            return this.http.post(url, obj, { dataType: 'json' })
                .finally(() => this.endProcess());
        }
        deleteRecord(obj, sourceId) {
            const url = this.resolveEndpoint('DeleteRecord', { sourceId: sourceId || this.activeEntity.id });
            this.startProcess();
            return this.http.post(url, obj, { dataType: 'json' })
                .finally(() => this.endProcess());
        }
        setEndpoint(key, value) {
            this.endpoints.set(key, value);
        }
        setEnpointIfNotExist(key, value) {
            if (!this.endpoints.has(key))
                this.endpoints.set(key, value);
        }
        resolveEndpoint(endpointKey, options) {
            options = options || {};
            let result = this.endpoints.get(endpointKey);
            if (!result) {
                throw endpointKey + ' endpoint is not defined';
            }
            let matches = result.match(this.endpointVarsRegex);
            if (matches) {
                for (let match of matches) {
                    let opt = match.substring(1, match.length - 1);
                    let optVal = options[opt];
                    if (!optVal) {
                        if (opt == 'modelId') {
                            optVal = this.model.getId();
                        }
                        else if (opt == 'sourceId') {
                            optVal = this.activeEntity.id;
                        }
                        else {
                            throw `Parameter [${opt}] is not defined`;
                        }
                    }
                    result = result.replace(match, optVal);
                }
            }
            return result;
        }
        startProcess() {
            if (this.options.onProcessStart)
                this.options.onProcessStart();
        }
        endProcess() {
            if (this.options.onProcessEnd)
                this.options.onProcessEnd();
        }
        setDefaultEndpoints(endpointBase) {
            this.setEnpointIfNotExist('GetMetaData', combinePath(endpointBase, 'models/{modelId}'));
            this.setEnpointIfNotExist('FetchDataset', combinePath(endpointBase, 'models/{modelId}/sources/{sourceId}/fetch'));
            this.setEnpointIfNotExist('FetchRecord', combinePath(endpointBase, 'models/{modelId}/sources/{sourceId}/fetch'));
            this.setEnpointIfNotExist('CreateRecord', combinePath(endpointBase, 'models/{modelId}/sources/{sourceId}/create'));
            this.setEnpointIfNotExist('UpdateRecord', combinePath(endpointBase, 'models/{modelId}/sources/{sourceId}/update'));
            this.setEnpointIfNotExist('DeleteRecord', combinePath(endpointBase, 'models/{modelId}/sources/{sourceId}/delete'));
        }
    }

    class TypeValidator extends Validator {
        constructor() {
            super();
            this.name = 'Type';
        }
        validate(attr, value) {
            if (!utils$1.IsDefinedAndNotNull(value) || value == '')
                return { successed: true };
            if (utils$1.isNumericType(attr.dataType)) {
                if (!utils$1.isNumeric(value))
                    return {
                        successed: false,
                        messages: [i18n$1.getText('NumberError')]
                    };
                if (utils$1.isIntType(attr.dataType)
                    && !Number.isInteger(Number.parseFloat(value))) {
                    return {
                        successed: false,
                        messages: [i18n$1.getText('IntNumberError')]
                    };
                }
            }
            return { successed: true };
        }
    }

    class RequiredValidator extends Validator {
        constructor() {
            super();
            this.name = 'Required';
        }
        validate(attr, value) {
            if (!attr.isNullable && (!utils$1.IsDefinedAndNotNull(value)
                || value === ''))
                return {
                    successed: false,
                    messages: [i18n$1.getText('RequiredError')]
                };
            return { successed: true };
        }
    }

    class EntityDataView {
        constructor(slot, context, basePath, options) {
            this.slot = slot;
            this.context = context;
            this.basePath = basePath;
            this.options = {
                showFilterBox: true,
                showBackToEntities: true
            };
            this.defaultValidators = [new RequiredValidator(), new TypeValidator()];
            this.options = utils$1.assignDeep(this.options, options || {});
            this.dlg = new DefaultDialogService();
            const ent = this.context.getActiveEntity();
            if (!ent) {
                throw "Can't find active entity for " + window.location.pathname;
            }
            this.slot.innerHTML += `<h1>${ent.captionPlural || ent.caption}</h1>`;
            if (this.options.showBackToEntities) {
                domel(this.slot)
                    .addChild('a', b => b
                    .attr('href', 'javascript:void(0)')
                    .text(`← ${i18n$1.getText('BackToEntities')}`)
                    .on('click', (e) => {
                    e.preventDefault();
                    setLocation(this.basePath);
                }));
            }
            this.renderGrid();
        }
        syncGridColumnHandler(column) {
            if (column.dataColumn) {
                const attr = this.context.getMetaData().getAttributeById(column.dataColumn.id);
                if (attr) {
                    column.isVisible = attr.showOnView;
                }
            }
        }
        renderGrid() {
            this.context.fetchDataset()
                .then(result => {
                const gridSlot = document.createElement('div');
                this.slot.appendChild(gridSlot);
                gridSlot.id = 'Grid';
                this.grid = new EasyGrid(utils$1.assignDeep({
                    slot: gridSlot,
                    dataTable: result,
                    paging: {
                        pageSize: 15,
                        allowPageSizeChange: true,
                        pageSizeItems: [15, 30, 50, 100, 200]
                    },
                    showPlusButton: this.context.getActiveEntity().isEditable,
                    plusButtonTitle: i18n$1.getText('AddRecordBtnTitle'),
                    showActiveRow: false,
                    onPlusButtonClick: this.addClickHandler.bind(this),
                    onGetCellRenderer: this.manageCellRenderer.bind(this),
                    onRowDbClick: this.rowDbClickHandler.bind(this),
                    onSyncGridColumn: this.syncGridColumnHandler.bind(this)
                }, this.options.grid || {}));
                if (this.options.showFilterBox) {
                    let filterWidgetSlot;
                    const filterBarDiv = domel('div')
                        .addClass(`kfrm-form`)
                        .setStyle('margin', '10px 0px')
                        .addChild('div', b => filterWidgetSlot = b.toDOM()).toDOM();
                    this.slot.insertBefore(filterBarDiv, gridSlot);
                    const dataFilter = this.context.createFilter();
                    this.filterWidget = new TextFilterWidget(filterWidgetSlot, this.grid, dataFilter);
                }
            });
        }
        manageCellRenderer(column, defaultRenderer) {
            if (column.isRowNum) {
                column.width = 110;
                return (value, column, cell, rowEl) => {
                    const b = domel('div', cell)
                        .addClass(`keg-cell-value`);
                    if (this.context.getActiveEntity().isEditable) {
                        b.addChild('a', b => b
                            .attr('href', 'javascript:void(0)')
                            .text(i18n$1.getText('EditBtn'))
                            .on('click', (ev) => this.editClickHandler(ev, parseInt(rowEl.getAttribute('data-row-idx')))))
                            .addChild('span', b => b.text(' | '))
                            .addChild('a', b => b
                            .attr('href', 'javascript:void(0)')
                            .text(i18n$1.getText('DeleteBtn'))
                            .on('click', (ev) => this.deleteClickHandler(ev, parseInt(rowEl.getAttribute('data-row-idx')))));
                    }
                };
            }
        }
        addClickHandler() {
            const activeEntity = this.context.getActiveEntity();
            const form = new EntityEditFormBuilder(this.context)
                .onSubmit(() => dlg.submit())
                .build();
            form.useValidators(this.defaultValidators);
            const dlg = this.dlg.open({
                title: i18n$1.getText('AddDlgCaption')
                    .replace('{entity}', activeEntity.caption),
                body: form.getHtml(),
                onSubmit: () => {
                    if (!form.validate())
                        return false;
                    form.getData()
                        .then(obj => this.context.createRecord(obj))
                        .then(() => {
                        return this.refreshData();
                    })
                        .catch((error) => {
                        this.processError(error);
                    });
                }
            });
        }
        editClickHandler(ev, rowIndex) {
            this.grid.getData().getRow(rowIndex)
                .then(row => {
                if (row) {
                    this.showEditForm(row);
                }
            });
        }
        showEditForm(row) {
            const activeEntity = this.context.getActiveEntity();
            const form = new EntityEditFormBuilder(this.context, { isEditForm: true, values: row })
                .onSubmit(() => dlg.submit())
                .build();
            form.useValidators(this.defaultValidators);
            const dlg = this.dlg.open({
                title: i18n$1.getText('EditDlgCaption')
                    .replace('{entity}', activeEntity.caption),
                body: form.getHtml(),
                onSubmit: () => {
                    if (!form.validate())
                        return false;
                    form.getData()
                        .then(obj => this.context.updateRecord(obj))
                        .then(() => {
                        return this.refreshData();
                    })
                        .catch((error) => {
                        this.processError(error);
                    });
                }
            });
        }
        rowDbClickHandler(ev) {
            if (this.context.getActiveEntity().isEditable) {
                this.showEditForm(ev.row);
            }
        }
        deleteClickHandler(ev, rowIndex) {
            this.grid.getData().getRow(rowIndex)
                .then(row => {
                if (row) {
                    const activeEntity = this.context.getActiveEntity();
                    const keyAttrs = activeEntity.getPrimaryAttrs();
                    const keyVals = keyAttrs.map(attr => row.getValue(attr.id));
                    const keys = keyAttrs.reduce((val, attr, index) => {
                        const property = attr.id.substring(attr.id.lastIndexOf('.') + 1);
                        val[property] = keyVals[index];
                        return val;
                    }, {});
                    this.dlg.openConfirm(i18n$1.getText('DeleteDlgCaption')
                        .replace('{entity}', activeEntity.caption), i18n$1.getText('DeleteDlgMessage')
                        .replace('{recordId}', Object.keys(keys)
                        .map(key => `${key}:${keys[key]}`).join(';')))
                        .then((result) => {
                        if (result) {
                            this.context.deleteRecord(keys)
                                .then(() => {
                                return this.refreshData();
                            })
                                .catch((error) => {
                                this.processError(error);
                            });
                        }
                    });
                }
            });
        }
        processError(error) {
            this.dlg.open({
                title: 'Ooops, something went wrong',
                body: error.message,
                closable: true,
                cancelable: false
            });
        }
        refreshData() {
            return this.context.fetchDataset()
                .then(() => {
                let processed = false;
                if (this.filterWidget) {
                    processed = this.filterWidget.applyFilter(false);
                }
                if (!processed) {
                    this.grid.refresh();
                }
            });
        }
    }

    class RootDataView {
        constructor(slot, context, basePath) {
            this.slot = slot;
            this.context = context;
            this.basePath = basePath;
            this.metaData = this.context.getMetaData();
            this.slot.innerHTML += `<h1>${i18n$1.getText('RootViewTitle')}</h1>`;
            this.renderEntitySelector();
        }
        renderEntitySelector() {
            const entities = this.metaData.getRootEntity().subEntities;
            if (this.slot) {
                domel(this.slot)
                    .addChild('div', b => b
                    .addClass('ed-root')
                    .addChild('div', b => b
                    .addClass('ed-menu-description')
                    .addText(i18n$1.getText(!this.metaData.isEmpty() ? 'EntityMenuDesc' : 'ModelIsEmpty')))
                    .addChild('ul', b => {
                    b.addClass('ed-entity-menu');
                    entities.forEach(ent => {
                        b.addChild('li', b => {
                            b.addClass('ed-entity-item')
                                .on('click', () => {
                                setLocation(`${this.basePath}/${decodeURIComponent(ent.id)}`);
                            })
                                .addChild('div', b => {
                                b.addClass('ed-entity-item-caption')
                                    .addText(ent.captionPlural || ent.caption);
                            });
                            if (ent.description) {
                                b.addChild('div', b => {
                                    b.addClass('ed-entity-item-descr')
                                        .addText(`${ent.description}`);
                                });
                            }
                        });
                    });
                }));
            }
        }
    }

    class EasyDataViewDispatcher {
        constructor(options) {
            this.options = {
                container: '#EasyDataContainer',
                basePath: 'easydata'
            };
            this.onSetLocation = () => {
                this.setActiveView();
            };
            this.attach = () => {
                window.addEventListener('ed_set_location', this.onSetLocation);
                window.addEventListener('popstate', this.onSetLocation);
            };
            this.options = utils$1.assign(this.options, options || {});
            if (this.options.rootEntity) {
                this.options.showBackToEntities = false;
                this.basePath = '/';
            }
            else {
                this.basePath = this.normalizeBasePath(this.options.basePath);
            }
            this.setContainer(this.options.container);
            const progressBarSlot = document.createElement('div');
            const bar = new ProgressBar(progressBarSlot);
            const parent = this.container.parentElement;
            parent.insertBefore(progressBarSlot, parent.firstElementChild);
            this.context = new DataContext({
                endpoint: this.options.endpoint,
                dataTable: this.options.dataTable,
                onProcessStart: () => bar.show(),
                onProcessEnd: () => bar.hide()
            });
        }
        normalizeBasePath(basePath) {
            basePath = this.trimSlashes(basePath);
            const fullPath = decodeURIComponent(window.location.pathname);
            const idx = fullPath.toLocaleLowerCase().indexOf(basePath);
            return idx >= 0 ? fullPath.substring(0, idx + basePath.length) : '/';
        }
        trimSlashes(path) {
            return path.replace(/^\/|\/$/g, '');
        }
        setContainer(container) {
            if (!container) {
                throw 'Container is undefined';
            }
            if (typeof container === 'string') {
                if (container.length) {
                    if (container[0] === '.') {
                        const result = document.getElementsByClassName(container.substring(1));
                        if (result.length)
                            this.container = result[0];
                    }
                    else {
                        if (container[0] === '#') {
                            container = container.substring(1);
                        }
                        this.container = document.getElementById(container);
                    }
                    if (!this.container) {
                        throw Error('Unrecognized `container` parameter: ' + container + '\n'
                            + 'It must be an element ID, a class name (starting with .) or an HTMLElement object itself.');
                    }
                }
            }
            else {
                this.container = container;
            }
        }
        getActiveSourceId() {
            if (this.options.rootEntity)
                return this.options.rootEntity;
            const path = decodeURIComponent(window.location.pathname);
            const idIndex = this.basePath.length + 1;
            return idIndex < path.length ? path.substring(idIndex) : null;
        }
        run() {
            this.attach();
            return this.context.loadMetaData()
                .then(() => {
                this.setActiveView();
            })
                .catch(error => console.error(error));
        }
        setActiveView() {
            this.clear();
            const sourceId = this.getActiveSourceId();
            if (sourceId) {
                this.context.setActiveSource(sourceId);
                window['EDView'] = new EntityDataView(this.container, this.context, this.basePath, this.options);
            }
            else {
                window['EDView'] = new RootDataView(this.container, this.context, this.basePath);
            }
        }
        clear() {
            this.container.innerHTML = '';
            this.context.getData().clear();
        }
        detach() {
            window.removeEventListener('ed_set_location', this.onSetLocation);
            window.removeEventListener('popstate', this.onSetLocation);
        }
    }

    function addEasyDataCRUDTexts() {
        i18n$1.updateDefaultTexts({
            RequiredError: 'Value is required.',
            NumberError: 'Value should be a number',
            IntNumberError: 'Value should be an integer number',
            DateTimeError: 'Invalid date or time value',
            LookupSelectedItem: 'Selected item: ',
            LookupDlgCaption: 'Select {entity}',
            None: 'None',
            NavigationBtnTitle: 'Navigation values',
            CalendarBtnTitle: 'Open calendar',
            TimerBtnTitle: 'Open timer',
            AddBtnTitle: 'Add',
            AddRecordBtnTitle: 'Add record',
            EditBtn: 'Edit',
            DeleteBtn: 'Delete',
            SelectLink: '[ select ]',
            AddDlgCaption: 'Create {entity}',
            EditDlgCaption: 'Edit {entity}',
            DeleteDlgCaption: 'Delete {entity}',
            DeleteDlgMessage: 'Are you sure you want to remove this record: {{recordId}}?',
            EntityMenuDesc: 'Click on an entity to view/edit its content',
            BackToEntities: 'Back to entities',
            SearchBtn: 'Search',
            SearchInputPlaceholder: 'Search...',
            RootViewTitle: 'Entities',
            ModelIsEmpty: 'No entity was found.'
        });
    }
    addEasyDataCRUDTexts();

    var easydata_crud_es = /*#__PURE__*/Object.freeze({
        __proto__: null,
        DataContext: DataContext,
        EasyDataServerLoader: EasyDataServerLoader,
        EasyDataViewDispatcher: EasyDataViewDispatcher,
        EntityDataView: EntityDataView,
        EntityEditForm: EntityEditForm,
        EntityEditFormBuilder: EntityEditFormBuilder,
        ProgressBar: ProgressBar,
        RequiredValidator: RequiredValidator,
        RootDataView: RootDataView,
        TextDataFilter: TextDataFilter,
        TextFilterWidget: TextFilterWidget,
        TypeValidator: TypeValidator,
        Validator: Validator
    });

    exports.core = easydata_core_es;
    exports.crud = easydata_crud_es;
    exports.ui = easydata_ui_es;

    return exports;

})({});
