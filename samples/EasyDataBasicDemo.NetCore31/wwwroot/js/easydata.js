var easydata =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ({

/***/ "../../easydata.js/packs/core/dist/lib/data/data_column.js":
/*!********************************************************************************!*\
  !*** c:/projects/easydata/easydata.js/packs/core/dist/lib/data/data_column.js ***!
  \********************************************************************************/
/*! exports provided: DataColumn, DataColumnList */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DataColumn", function() { return DataColumn; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DataColumnList", function() { return DataColumnList; });
/* harmony import */ var _types_data_type__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../types/data_type */ "../../easydata.js/packs/core/dist/lib/types/data_type.js");
/* harmony import */ var _utils_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/utils */ "../../easydata.js/packs/core/dist/lib/utils/utils.js");


var DataColumn = /** @class */ (function () {
    function DataColumn(desc) {
        if (!desc)
            throw Error("Options are required");
        if (!desc.id)
            throw Error("Field Id is required");
        if (!desc.label)
            throw Error("Label is required");
        this.id = desc.id;
        this.type = _utils_utils__WEBPACK_IMPORTED_MODULE_1__["utils"].getIfDefined(desc.type, _types_data_type__WEBPACK_IMPORTED_MODULE_0__["DataType"].String);
        this.label = desc.label;
    }
    return DataColumn;
}());

var DataColumnList = /** @class */ (function () {
    function DataColumnList() {
        this.items = [];
        this.mapper = {};
        this._dateColumnIdx = [];
    }
    Object.defineProperty(DataColumnList.prototype, "count", {
        get: function () {
            return this.items.length;
        },
        enumerable: true,
        configurable: true
    });
    DataColumnList.prototype.add = function (colOrDesc) {
        var col;
        if (colOrDesc instanceof DataColumn) {
            col = colOrDesc;
        }
        else {
            col = new DataColumn(colOrDesc);
        }
        var index = this.items.length;
        this.items.push(col);
        this.mapper[col.id] = index;
        if ([_types_data_type__WEBPACK_IMPORTED_MODULE_0__["DataType"].Date, _types_data_type__WEBPACK_IMPORTED_MODULE_0__["DataType"].DateTime, _types_data_type__WEBPACK_IMPORTED_MODULE_0__["DataType"].Time].indexOf(col.type) >= 0) {
            this._dateColumnIdx.push(index);
        }
        return index;
    };
    DataColumnList.prototype.updateDateColumnIdx = function () {
        this._dateColumnIdx = this.getItems()
            .filter(function (col) { return [_types_data_type__WEBPACK_IMPORTED_MODULE_0__["DataType"].Date, _types_data_type__WEBPACK_IMPORTED_MODULE_0__["DataType"].DateTime, _types_data_type__WEBPACK_IMPORTED_MODULE_0__["DataType"].Time].indexOf(col.type) >= 0; })
            .map(function (col, index) { return index; });
    };
    DataColumnList.prototype.put = function (index, col) {
        //!!!!!!!!!check on "out of index"
        this.items[index] = col;
        this.updateDateColumnIdx();
    };
    DataColumnList.prototype.move = function (col, newIndex) {
        var oldIndex = this.items.indexOf(col);
        if (oldIndex >= 0 && oldIndex != newIndex) {
            _utils_utils__WEBPACK_IMPORTED_MODULE_1__["utils"].moveArrayItem(this.items, oldIndex, newIndex);
            this.updateDateColumnIdx();
        }
    };
    DataColumnList.prototype.get = function (index) {
        //!!!!!!!!!check on "out of index"
        return this.items[index];
    };
    DataColumnList.prototype.getIndex = function (id) {
        return this.mapper[id];
    };
    DataColumnList.prototype.getItems = function () {
        return this.items;
    };
    DataColumnList.prototype.getDateColumnIndexes = function () {
        return this._dateColumnIdx;
    };
    DataColumnList.prototype.removeAt = function (index) {
        var col = this.get(index);
        this.items.splice(index, 1);
        var removeDate = this._dateColumnIdx.indexOf(index);
        if (removeDate >= 0) {
            this._dateColumnIdx.splice(removeDate, 1);
        }
        delete this.mapper[col.id];
    };
    DataColumnList.prototype.clear = function () {
        this.items = [];
        this._dateColumnIdx = [];
        this.mapper = {};
    };
    return DataColumnList;
}());

//# sourceMappingURL=data_column.js.map

/***/ }),

/***/ "../../easydata.js/packs/core/dist/lib/data/data_row.js":
/*!*****************************************************************************!*\
  !*** c:/projects/easydata/easydata.js/packs/core/dist/lib/data/data_row.js ***!
  \*****************************************************************************/
/*! exports provided: DataRow */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DataRow", function() { return DataRow; });
var DataRow = /** @class */ (function () {
    function DataRow(columns, values) {
        this.columns = columns;
        this.values = values;
    }
    DataRow.prototype.size = function () {
        return this.values.length;
    };
    DataRow.prototype.getValue = function (colIdOrIndex) {
        var index;
        if (typeof colIdOrIndex === "string") {
            index = this.columns.getIndex(colIdOrIndex);
            if (index === undefined) {
                throw new RangeError("No column with id '" + colIdOrIndex + "'");
            }
        }
        else {
            index = colIdOrIndex;
        }
        if (index >= this.values.length)
            throw new RangeError("Out of range: " + index);
        return this.values[index];
    };
    return DataRow;
}());

//# sourceMappingURL=data_row.js.map

/***/ }),

/***/ "../../easydata.js/packs/core/dist/lib/data/easy_data_table.js":
/*!************************************************************************************!*\
  !*** c:/projects/easydata/easydata.js/packs/core/dist/lib/data/easy_data_table.js ***!
  \************************************************************************************/
/*! exports provided: EasyDataTable */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* WEBPACK VAR INJECTION */(function(Promise) {/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "EasyDataTable", function() { return EasyDataTable; });
/* harmony import */ var _data_column__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./data_column */ "../../easydata.js/packs/core/dist/lib/data/data_column.js");
/* harmony import */ var _data_row__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./data_row */ "../../easydata.js/packs/core/dist/lib/data/data_row.js");


var EasyDataTable = /** @class */ (function () {
    function EasyDataTable(options) {
        this._chunkSize = 1000;
        // object keeps number keys sorted
        this.chunkMap = {};
        this.total = 0;
        this.loader = null;
        this.needTotal = true;
        options = options || {};
        this._chunkSize = options.chunkSize || this._chunkSize;
        this.loader = options.loader;
        this._columns = new _data_column__WEBPACK_IMPORTED_MODULE_0__["DataColumnList"]();
        if (options.columns) {
            for (var _i = 0, _a = options.columns; _i < _a.length; _i++) {
                var colDesc = _a[_i];
                this._columns.add(colDesc);
            }
        }
        if (options.rows) {
            for (var _b = 0, _c = options.rows; _b < _c.length; _b++) {
                var rowData = _c[_b];
                var row = this.createRow(rowData);
                this.addRow(row);
            }
        }
    }
    Object.defineProperty(EasyDataTable.prototype, "columns", {
        get: function () {
            return this._columns;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EasyDataTable.prototype, "chunkSize", {
        get: function () {
            return this._chunkSize;
        },
        set: function (value) {
            this._chunkSize = value;
            this.total = 0;
            this.needTotal = true;
            this.chunkMap = {};
        },
        enumerable: true,
        configurable: true
    });
    EasyDataTable.prototype.getRows = function (params) {
        var _this = this;
        var fromIndex = 0, count = this._chunkSize;
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
        if (fromIndex >= this.total) {
            return Promise.resolve([]);
        }
        var endIndex = fromIndex + count;
        if (endIndex >= this.total) {
            endIndex = this.total;
        }
        var lbChunk = Math.trunc(fromIndex / this._chunkSize);
        var upChunk = Math.trunc(endIndex / this._chunkSize);
        var allChunksCached = true;
        for (var i = lbChunk; i <= upChunk; i++) {
            if (!this.chunkMap[i]) {
                allChunksCached = false;
                break;
            }
        }
        if (allChunksCached) {
            var resultArr = [];
            for (var i = lbChunk; i <= upChunk; i++) {
                resultArr = resultArr.concat(this.chunkMap[i].rows);
            }
            return Promise.resolve(resultArr.slice(fromIndex - this.chunkMap[lbChunk].offset, endIndex - this.chunkMap[lbChunk].offset));
        }
        //if loader is not defined
        if (!this.loader) {
            throw "Loader is not defined. Can't get the rows from " + fromIndex + " to " + endIndex;
        }
        // we need total only fo first request
        var needTotal = this.needTotal;
        if (this.needTotal) {
            this.needTotal = false;
        }
        return this.loader.loadChunk({
            offset: lbChunk * this._chunkSize,
            limit: this._chunkSize * (upChunk - lbChunk + 1),
            needTotal: needTotal
        })
            .then(function (result) {
            var chunks = result.table.getCachedChunks();
            if (needTotal) {
                _this.total = result.total;
            }
            var index = lbChunk;
            for (var _i = 0, chunks_1 = chunks; _i < chunks_1.length; _i++) {
                var chunk = chunks_1[_i];
                _this.chunkMap[index] = {
                    offset: index * _this._chunkSize,
                    rows: chunk.rows
                };
                index++;
            }
            var resultArr = [];
            for (var i = lbChunk; i <= upChunk; i++) {
                resultArr = resultArr.concat(_this.chunkMap[i].rows);
            }
            return resultArr.slice(fromIndex - _this.chunkMap[lbChunk].offset, endIndex - _this.chunkMap[lbChunk].offset);
        });
    };
    EasyDataTable.prototype.getRow = function (index) {
        return this.getRows({ offset: index, limit: 1 })
            .then(function (rows) { return rows.length > 0 ? rows[0] : null; });
    };
    EasyDataTable.prototype.getTotal = function () {
        return this.total;
    };
    EasyDataTable.prototype.setTotal = function (total) {
        this.total = total;
        this.needTotal = false;
        this.chunkMap = {};
    };
    EasyDataTable.prototype.getCachedCount = function () {
        return this.getCachedRows().length;
    };
    EasyDataTable.prototype.clear = function () {
        this.columns.clear();
        this.chunkMap = {};
        this.total = 0;
        this.needTotal = true;
    };
    EasyDataTable.prototype.createRow = function (dataOrRow) {
        var _this = this;
        var dateIdx = this._columns.getDateColumnIndexes();
        var values = new Array(this._columns.count);
        var getValue = dataOrRow instanceof _data_row__WEBPACK_IMPORTED_MODULE_1__["DataRow"]
            ? function (colId) { return dataOrRow.getValue(colId); }
            : function (colId) { return dataOrRow[colId]; };
        if (dataOrRow) {
            this.columns.getItems().forEach(function (column) {
                var value = getValue(column.id);
                var index = _this.columns.getIndex(column.id);
                values[index] = (dateIdx.indexOf(index) >= 0)
                    ? new Date(value)
                    : value;
            });
        }
        return new _data_row__WEBPACK_IMPORTED_MODULE_1__["DataRow"](this._columns, values);
    };
    EasyDataTable.prototype.addRow = function (rowOrValue) {
        var newRow;
        if (Array.isArray(rowOrValue)) {
            var dateIdx = this._columns.getDateColumnIndexes();
            if (dateIdx.length > 0) {
                for (var _i = 0, dateIdx_1 = dateIdx; _i < dateIdx_1.length; _i++) {
                    var idx = dateIdx_1[_i];
                    rowOrValue[idx] = new Date(rowOrValue[idx]);
                }
            }
            newRow = new _data_row__WEBPACK_IMPORTED_MODULE_1__["DataRow"](this._columns, rowOrValue);
        }
        else {
            newRow = this.createRow(rowOrValue);
        }
        var lastChunk = this.getLastChunk();
        if (!lastChunk || lastChunk.rows.length >= this._chunkSize) {
            lastChunk = this.createChunk();
        }
        lastChunk.rows.push(newRow);
        var cachedTotal = this.getCachedCount();
        if (cachedTotal > this.total) {
            this.total = cachedTotal;
        }
        return newRow;
    };
    EasyDataTable.prototype.createChunk = function (index) {
        if (typeof index == 'undefined') {
            index = this.getLastChunkIndex() + 1;
        }
        var chunk = { offset: index * this._chunkSize, rows: [] };
        this.chunkMap[index] = chunk;
        return chunk;
    };
    EasyDataTable.prototype.getLastChunkIndex = function () {
        var keys = Object.keys(this.chunkMap);
        return keys.length > 0
            ? parseInt(keys[keys.length - 1])
            : -1;
    };
    EasyDataTable.prototype.getLastChunk = function () {
        var index = this.getLastChunkIndex();
        return index > -1
            ? this.chunkMap[index]
            : null;
    };
    EasyDataTable.prototype.getCachedRows = function () {
        return this.getCachedChunks()
            .reduce(function (acc, v) { return acc.concat(v.rows); }, []);
    };
    EasyDataTable.prototype.getCachedChunks = function () {
        return Object.values(this.chunkMap);
    };
    return EasyDataTable;
}());

//# sourceMappingURL=easy_data_table.js.map
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! es6-promise */ "../../easydata.js/packs/core/node_modules/es6-promise/dist/es6-promise.js")["Promise"]))

/***/ }),

/***/ "../../easydata.js/packs/core/dist/lib/event/event_emitter.js":
/*!***********************************************************************************!*\
  !*** c:/projects/easydata/easydata.js/packs/core/dist/lib/event/event_emitter.js ***!
  \***********************************************************************************/
/*! exports provided: EventEmitter */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "EventEmitter", function() { return EventEmitter; });
/* harmony import */ var _utils_easy_guid__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/easy_guid */ "../../easydata.js/packs/core/dist/lib/utils/easy_guid.js");

/**
 * The representation of event emitter.
 */
var EventEmitter = /** @class */ (function () {
    /**
     * The default constructor.
     * @param source The source.
     */
    function EventEmitter(source) {
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
    EventEmitter.prototype.subscribe = function (eventType, callback) {
        var event = this.getEventRecByType(eventType);
        var eventCallback = {
            id: _utils_easy_guid__WEBPACK_IMPORTED_MODULE_0__["EasyGuid"].newGuid(),
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
    };
    /**
     * Unsubsribes from the event.
     * @param eventType The event type.
     * @param callbackId The subscribtion ID.
     */
    EventEmitter.prototype.unsubscribe = function (eventType, callbackId) {
        var event = this.getEventRecByType(eventType);
        if (event) {
            var index = -1;
            for (index = 0; index < event.eventCallbacks.length; index++) {
                if (event.eventCallbacks[index].id === callbackId) {
                    break;
                }
            }
            if (index >= 0) {
                event.eventCallbacks.splice(index, 1);
            }
        }
    };
    /**
     * Fires the event.
     * @param eventType The event type.
     * @param data The event data.
     * @param postpone  The postpone.
     * @param force To fire force. If value is `true`, ignores silent mode.
     */
    EventEmitter.prototype.fire = function (eventType, data, postpone, force) {
        if (postpone === void 0) { postpone = 0; }
        if (force === void 0) { force = false; }
        if (this.silentMode && !force) {
            return;
        }
        var eventRec = this.getEventRecByType(eventType);
        if (eventRec) {
            var eqevent_1 = {
                type: eventType,
                source: this.source,
                data: data
            };
            var emitAllFunc = function () {
                for (var _i = 0, _a = eventRec.eventCallbacks; _i < _a.length; _i++) {
                    var callback = _a[_i];
                    callback.callback(eqevent_1);
                }
            };
            if (postpone > 0) {
                setTimeout(emitAllFunc, postpone);
            }
            else {
                emitAllFunc();
            }
        }
    };
    /**
     * Enters to silent mode.
     */
    EventEmitter.prototype.enterSilentMode = function () {
        this.silentMode++;
    };
    /**
     * Exits from silent mode.
     */
    EventEmitter.prototype.exitSilentMode = function () {
        if (this.silentMode) {
            this.silentMode--;
        }
    };
    /**
     * Checks if emitter is in silent mode.
     * @return `true`, if silent mode is enable.
     */
    EventEmitter.prototype.isSilent = function () {
        return this.silentMode > 0;
    };
    EventEmitter.prototype.getEventRecByType = function (eventType) {
        for (var _i = 0, _a = this.events; _i < _a.length; _i++) {
            var event_1 = _a[_i];
            if (event_1.type == eventType) {
                return event_1;
            }
        }
        return null;
    };
    return EventEmitter;
}());

//# sourceMappingURL=event_emitter.js.map

/***/ }),

/***/ "../../easydata.js/packs/core/dist/lib/http/http_client.js":
/*!********************************************************************************!*\
  !*** c:/projects/easydata/easydata.js/packs/core/dist/lib/http/http_client.js ***!
  \********************************************************************************/
/*! exports provided: HttpActionResult, HttpResponseError, HttpClient */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* WEBPACK VAR INJECTION */(function(Promise) {/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "HttpActionResult", function() { return HttpActionResult; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "HttpResponseError", function() { return HttpResponseError; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "HttpClient", function() { return HttpClient; });
/* harmony import */ var _utils_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/utils */ "../../easydata.js/packs/core/dist/lib/utils/utils.js");
/* harmony import */ var _http_method__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./http_method */ "../../easydata.js/packs/core/dist/lib/http/http_method.js");
/* harmony import */ var _http_request__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./http_request */ "../../easydata.js/packs/core/dist/lib/http/http_request.js");
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();



var HttpActionResult = /** @class */ (function () {
    function HttpActionResult(request, promise) {
        this.request = request;
        this.promise = promise;
    }
    HttpActionResult.prototype.getPromise = function () {
        return this.promise;
    };
    HttpActionResult.prototype.getRequest = function () {
        return this.request;
    };
    HttpActionResult.prototype.then = function (onfulfilled, onrejected) {
        return this.promise.then(onfulfilled, onrejected);
    };
    HttpActionResult.prototype.catch = function (onrejected) {
        return this.promise.catch(onrejected);
    };
    HttpActionResult.prototype.finally = function (onfinally) {
        return this.promise.finally(onfinally);
    };
    return HttpActionResult;
}());

var HttpResponseError = /** @class */ (function (_super) {
    __extends(HttpResponseError, _super);
    function HttpResponseError(status, message) {
        var _this = _super.call(this, message) || this;
        _this.status = status;
        return _this;
    }
    return HttpResponseError;
}(Error));

var HttpClient = /** @class */ (function () {
    function HttpClient() {
        this.defaultHeaders = {};
        this.customPayload = undefined;
    }
    HttpClient.prototype.get = function (url, options) {
        return this.send(_http_method__WEBPACK_IMPORTED_MODULE_1__["HttpMethod"].Get, url, null, options);
    };
    HttpClient.prototype.post = function (url, data, options) {
        return this.send(_http_method__WEBPACK_IMPORTED_MODULE_1__["HttpMethod"].Post, url, data, options);
    };
    HttpClient.prototype.put = function (url, data, options) {
        return this.send(_http_method__WEBPACK_IMPORTED_MODULE_1__["HttpMethod"].Put, url, data, options);
    };
    HttpClient.prototype.delete = function (url, data, options) {
        return this.send(_http_method__WEBPACK_IMPORTED_MODULE_1__["HttpMethod"].Delete, url, data, options);
    };
    HttpClient.prototype.send = function (method, url, data, options) {
        options = options || {};
        var dataType = options.dataType || 'json';
        var contentType = options.contentType || (dataType !== 'form-data') ? 'application/json' : null;
        if (data && dataType != 'form-data' && this.customPayload) {
            data.data = _utils_utils__WEBPACK_IMPORTED_MODULE_0__["utils"].assignDeep(data.data || {}, this.customPayload);
        }
        var XDomainRequest = window["XDomainRequest"];
        var XHR = ("onload" in new XMLHttpRequest()) ? XMLHttpRequest : XDomainRequest; //IE support
        var xhr = new XHR();
        if (options.queryParams && Object.keys(options.queryParams)) {
            url += encodeURI('?' + Object.keys(options.queryParams)
                .map(function (name) { return name + '=' + options.queryParams[name]; })
                .join('&'));
        }
        xhr.open(method, url, true);
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        for (var header in this.defaultHeaders) {
            xhr.setRequestHeader(header, this.defaultHeaders[header]);
        }
        if (options.headers) {
            for (var header in options.headers) {
                xhr.setRequestHeader(header, options.headers[header]);
            }
        }
        if (contentType)
            xhr.setRequestHeader('Content-Type', contentType);
        var request = new _http_request__WEBPACK_IMPORTED_MODULE_2__["HttpRequest"](xhr, data);
        if (this.beforeEachRequest) {
            this.beforeEachRequest(request);
        }
        var dataToSend;
        if (data && typeof data !== "string" && dataType == 'json') {
            dataToSend = JSON.stringify(request.getData());
        }
        else {
            dataToSend = request.getData();
        }
        return new HttpActionResult(request, new Promise(function (resolve, reject) {
            xhr.onreadystatechange = function () {
                if (xhr.readyState != 4) {
                    return;
                }
                var responseContentType = xhr.getResponseHeader('Content-Type') || '';
                var responseObj = (responseContentType.indexOf('application/json') == 0)
                    ? JSON.parse(xhr.responseText)
                    : xhr.responseText;
                var status = parseInt(xhr.status.toString());
                if (status >= 300 || status < 200) {
                    var message = responseObj.message ||
                        (status == 404
                            ? "No such endpoint: " + url
                            : responseObj);
                    reject(new HttpResponseError(status, message));
                    return;
                }
                resolve(responseObj);
            };
            xhr.send(dataToSend);
        }));
    };
    return HttpClient;
}());

//# sourceMappingURL=http_client.js.map
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! es6-promise */ "../../easydata.js/packs/core/node_modules/es6-promise/dist/es6-promise.js")["Promise"]))

/***/ }),

/***/ "../../easydata.js/packs/core/dist/lib/http/http_method.js":
/*!********************************************************************************!*\
  !*** c:/projects/easydata/easydata.js/packs/core/dist/lib/http/http_method.js ***!
  \********************************************************************************/
/*! exports provided: HttpMethod */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "HttpMethod", function() { return HttpMethod; });
var HttpMethod;
(function (HttpMethod) {
    HttpMethod["Trace"] = "TRACE";
    HttpMethod["Options"] = "OPTIONS";
    HttpMethod["Get"] = "GET";
    HttpMethod["Put"] = "PUT";
    HttpMethod["Post"] = "POST";
    HttpMethod["Delete"] = "DELETE";
})(HttpMethod || (HttpMethod = {}));
//# sourceMappingURL=http_method.js.map

/***/ }),

/***/ "../../easydata.js/packs/core/dist/lib/http/http_request.js":
/*!*********************************************************************************!*\
  !*** c:/projects/easydata/easydata.js/packs/core/dist/lib/http/http_request.js ***!
  \*********************************************************************************/
/*! exports provided: HttpRequest */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "HttpRequest", function() { return HttpRequest; });
var HttpRequest = /** @class */ (function () {
    function HttpRequest(xhr, data) {
        this.xhr = xhr;
        this.data = data;
    }
    HttpRequest.prototype.getXMLHttpRequest = function () {
        return this.xhr;
    };
    HttpRequest.prototype.getData = function () {
        return this.data;
    };
    HttpRequest.prototype.setHeader = function (name, value) {
        this.xhr.setRequestHeader(name, value);
    };
    HttpRequest.prototype.abort = function () {
        this.xhr.abort();
    };
    return HttpRequest;
}());

//# sourceMappingURL=http_request.js.map

/***/ }),

/***/ "../../easydata.js/packs/core/dist/lib/i18n/i18n.js":
/*!*************************************************************************!*\
  !*** c:/projects/easydata/easydata.js/packs/core/dist/lib/i18n/i18n.js ***!
  \*************************************************************************/
/*! exports provided: i18n */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "i18n", function() { return i18n; });
/* harmony import */ var _utils_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/utils */ "../../easydata.js/packs/core/dist/lib/utils/utils.js");

/**
 * Contains internatialization functionality.
 */
var i18n;
(function (i18n) {
    var defaultTexts = {
        ButtonOK: 'OK',
        ButtonCancel: 'Cancel'
    };
    var englishUSLocaleSettings = {
        shortDateFormat: 'MM/dd/yyyy',
        longDateFormat: 'dd MMM, yyyy',
        editDateFormat: 'MM/dd/yyyy',
        shortTimeFormat: 'HH:mm',
        editTimeFormat: 'HH:mm',
        longTimeFormat: 'HH:mm:ss',
        shortMonthNames: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        longMonthNames: ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'],
        shortWeekDayNames: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        longWeekDayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        decimalSeparator: '.'
    };
    var allLocales = {
        'en-US': {
            localeId: 'en-US',
            englishName: 'English',
            displayName: 'English',
            texts: defaultTexts,
            settings: englishUSLocaleSettings
        }
    };
    //let currentLocale = undefined; //default
    var defaultLocale = {
        localeId: 'en-US',
        englishName: 'English',
        displayName: 'English',
        texts: defaultTexts,
        settings: englishUSLocaleSettings
    };
    var currentLocale = defaultLocale;
    var mappers = [];
    function mapInfo(info) {
        for (var _i = 0, mappers_1 = mappers; _i < mappers_1.length; _i++) {
            var mapper = mappers_1[_i];
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
        var result = [];
        for (var locale in allLocales) {
            result.push({
                locale: locale,
                englishName: allLocales[locale].englishName,
                displayName: allLocales[locale].displayName
            });
        }
        return result.sort(function (a, b) {
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
        console.warn("This method is deprecated. Use setCurrentLocale instead");
        setCurrentLocale(l);
    }
    i18n.setLocale = setLocale;
    /**
     * Sets the curent locale.
     * @param localeId The locale.
     */
    function setCurrentLocale(localeId) {
        var newLocale = allLocales[localeId];
        if (!newLocale) {
            throw "Locale " + localeId + " is not installed";
        }
        currentLocale = newLocale;
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
    function getText() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var textsObj = currentLocale.texts;
        var resText = '';
        if (args && args.length) {
            var notFound = false;
            var argLength = args.length;
            for (var i = 0; i < argLength; i++) {
                resText = textsObj[args[i]];
                if (!resText) {
                    notFound = true;
                    break;
                }
                else {
                    textsObj = resText;
                }
            }
            //remove after refactoring. 
            //The texts object in locale must be merged with the default texts.
            //So if we don't have some key - we don't have a string at all.
            if (notFound) {
                for (var i = 0; i < argLength; i++) {
                    resText = defaultTexts[args[i]];
                    if (!resText) {
                        return null;
                    }
                    else {
                        textsObj = resText;
                    }
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
        var settings = getLocaleSettings();
        if (monthNum > 0 && monthNum < 13) {
            return settings.shortMonthNames[monthNum - 1];
        }
        else {
            throw 'Wrong month number: ' + monthNum;
        }
    }
    i18n.getShortMonthName = getShortMonthName;
    function getLongMonthName(monthNum) {
        var settings = getLocaleSettings();
        if (monthNum > 0 && monthNum < 13) {
            return settings.longMonthNames[monthNum - 1];
        }
        else {
            throw 'Wrong month number: ' + monthNum;
        }
    }
    i18n.getLongMonthName = getLongMonthName;
    function getShortWeekDayName(dayNum) {
        var settings = getLocaleSettings();
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
        var settings = getLocaleSettings();
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
     * @param locale The locale ID (like 'en', 'de', 'uk', etc).
     * If not specified - the function will update the settings for the current locale
     */
    function updateLocaleSettings(settingsToUpdate) {
        _utils_utils__WEBPACK_IMPORTED_MODULE_0__["utils"].assignDeep(currentLocale.settings, settingsToUpdate);
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
        _utils_utils__WEBPACK_IMPORTED_MODULE_0__["utils"].assignDeep(currentLocale.texts, texts);
    }
    i18n.updateLocaleTexts = updateLocaleTexts;
    /**
     * Updates the information for the specified locale.
     * @param localeId The locale ID (like 'en', 'de', 'uk', etc).
     * If the locale does exist yet - it will be added
     * @param localeInfo  a LocaleInfo object that contains the locale settings and textual resources
     */
    function updateLocaleInfo(localeId, localeData) {
        mapInfo(localeData);
        if (!localeData.localeId) {
            localeData.localeId = localeId;
        }
        var localeInfoToUpdate = allLocales[localeId] || defaultLocale;
        _utils_utils__WEBPACK_IMPORTED_MODULE_0__["utils"].assignDeep(localeInfoToUpdate, localeData);
        allLocales[localeId] = localeInfoToUpdate;
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
    function loadSystemLocaleSettings() {
        var lang = typeof navigator === 'object' ? navigator.language : undefined;
        var now = new Date('2020-11-21');
        var options = { year: 'numeric', month: 'numeric', day: 'numeric' };
        var nowStr = now.toLocaleDateString(lang, options);
        var format = nowStr
            .replace('21', 'dd')
            .replace('11', 'MM')
            .replace('2020', 'yyyy');
        currentLocale.settings.shortDateFormat = format;
        currentLocale.settings.editDateFormat = format;
    }
    i18n.loadSystemLocaleSettings = loadSystemLocaleSettings;
})(i18n || (i18n = {}));
//# sourceMappingURL=i18n.js.map

/***/ }),

/***/ "../../easydata.js/packs/core/dist/lib/i18n/load_default_locale_settings.js":
/*!*************************************************************************************************!*\
  !*** c:/projects/easydata/easydata.js/packs/core/dist/lib/i18n/load_default_locale_settings.js ***!
  \*************************************************************************************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _i18n__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./i18n */ "../../easydata.js/packs/core/dist/lib/i18n/i18n.js");

_i18n__WEBPACK_IMPORTED_MODULE_0__["i18n"].loadSystemLocaleSettings();
//# sourceMappingURL=load_default_locale_settings.js.map

/***/ }),

/***/ "../../easydata.js/packs/core/dist/lib/meta/meta_data.js":
/*!******************************************************************************!*\
  !*** c:/projects/easydata/easydata.js/packs/core/dist/lib/meta/meta_data.js ***!
  \******************************************************************************/
/*! exports provided: MetaData */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MetaData", function() { return MetaData; });
/* harmony import */ var _i18n_i18n__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../i18n/i18n */ "../../easydata.js/packs/core/dist/lib/i18n/i18n.js");
/* harmony import */ var _utils_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/utils */ "../../easydata.js/packs/core/dist/lib/utils/utils.js");
/* harmony import */ var _types_meta_editor_tag__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../types/meta_editor_tag */ "../../easydata.js/packs/core/dist/lib/types/meta_editor_tag.js");
/* harmony import */ var _types_data_type__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../types/data_type */ "../../easydata.js/packs/core/dist/lib/types/data_type.js");
/* harmony import */ var _meta_entity__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./meta_entity */ "../../easydata.js/packs/core/dist/lib/meta/meta_entity.js");
/* harmony import */ var _meta_value_editor__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./meta_value_editor */ "../../easydata.js/packs/core/dist/lib/meta/meta_value_editor.js");






/**
 * Represents a data model
 */
var MetaData = /** @class */ (function () {
    /** The default constructor. */
    function MetaData() {
        this.mainEntity = null;
        this.id = '__none';
        this.name = 'Empty model';
        this.rootEntity = this.createEntity();
    }
    /**
     * Gets the main entity of model
     * @return The main entity.
     */
    MetaData.prototype.getMainEntity = function () {
        return this.mainEntity;
    };
    MetaData.prototype.createEntity = function (parent) {
        return new _meta_entity__WEBPACK_IMPORTED_MODULE_4__["MetaEntity"](parent);
    };
    MetaData.prototype.createEntityAttr = function (parent) {
        return new _meta_entity__WEBPACK_IMPORTED_MODULE_4__["MetaEntityAttr"](parent);
    };
    MetaData.prototype.createValueEditor = function () {
        return new _meta_value_editor__WEBPACK_IMPORTED_MODULE_5__["MetaValueEditor"]();
    };
    /**
     * Loads data model from JSON.
     * @param stringJson The JSON string.
     */
    MetaData.prototype.loadFromJSON = function (stringJson) {
        var model = JSON.parse(stringJson);
        this.loadFromData(model);
    };
    /**
     * Loads data model from its JSON representation object.
     * @param data The JSON representation object.
     */
    MetaData.prototype.loadFromData = function (data) {
        this.id = data.id;
        this.name = data.name;
        this.version = data.vers;
        //Editors
        this.editors = new Array();
        if (data.editors) {
            for (var i = 0; i < data.editors.length; i++) {
                var newEditor = this.createValueEditor();
                newEditor.loadFromData(data.editors[i]);
                this.editors.push(newEditor);
            }
        }
        //rootEntity
        this.rootEntity.loadFromData(this, data.entroot);
    };
    /**
     * Sets data to data model.
     * @param model Its JSON representation object or JSON string.
     */
    MetaData.prototype.setData = function (model) {
        if (typeof model === 'string') {
            this.loadFromJSON(model);
        }
        else {
            this.loadFromData(model);
        }
    };
    /**
     * Checks wether the data model is empty.
     * @returns `true` if the data model is empty, otherwise `false`.
     */
    MetaData.prototype.isEmpty = function () {
        return this.rootEntity.subEntities.length === 0 && this.rootEntity.attributes.length === 0;
    };
    /**
     * Gets ID of the data model.
     * @returns The ID.
     */
    MetaData.prototype.getId = function () {
        return this.id;
    };
    /**
     * Gets name of the data model.
     * @returns The name.
     */
    MetaData.prototype.getName = function () {
        return this.name;
    };
    /**
     * Gets root entity of the data model.
     * @returns The root entity.
     */
    MetaData.prototype.getRootEntity = function () {
        return this.rootEntity;
    };
    /**
     * Finds editor by its ID.
     * @param editorId The editor ID.
     * @returns The value editor or `null`.
     */
    MetaData.prototype.getEditorById = function (editorId) {
        for (var _i = 0, _a = this.editors; _i < _a.length; _i++) {
            var editor = _a[_i];
            if (editor.id === editorId) {
                return editor;
            }
        }
        return null;
    };
    /**
     * Gets entity attribute by its ID.
     * This function runs through all attributes inside specified model (it's root entity and all its sub-entities).
     * @param attrId The attribute ID.
     * @returns The attribute or `null`.
     */
    MetaData.prototype.getAttributeById = function (attrId) {
        var attr = this.getEntityAttrById(this.getRootEntity(), attrId);
        if (!attr) {
            return null;
        }
        return attr;
    };
    /**
     * Checks wether attribute contains such property.
     * @param attrId The attribute ID.
     * @param propName The property name.
     * @returns `true` if the attribute contains the property, otherwise `false`.
     */
    MetaData.prototype.checkAttrProperty = function (attrId, propName) {
        var attribute = this.getAttributeById(attrId);
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
    };
    /**
     * Gets entity attribute by its ID.
     * This function runs through all attributes inside specified entity and all its sub-entities.
     * @param entity
     * @param attrId
     * @returns The attribute or `null`.
     */
    MetaData.prototype.getEntityAttrById = function (entity, attrId) {
        var idx;
        if (entity.attributes) {
            var attrCount = entity.attributes.length;
            for (idx = 0; idx < attrCount; idx++) {
                if (entity.attributes[idx].id == attrId) {
                    return entity.attributes[idx];
                }
            }
        }
        var res;
        if (entity.subEntities) {
            var subEntityCount = entity.subEntities.length;
            for (idx = 0; idx < subEntityCount; idx++) {
                res = this.getEntityAttrById(entity.subEntities[idx], attrId);
                if (res)
                    return res;
            }
        }
        return null;
    };
    MetaData.prototype.listByEntityWithFilter = function (entity, filterFunc) {
        var result = new Array();
        var caption;
        var ent = null;
        if (entity.subEntities) {
            var subEntityCount = entity.subEntities.length;
            for (var entIdx = 0; entIdx < subEntityCount; entIdx++) {
                ent = entity.subEntities[entIdx];
                if (!filterFunc || filterFunc(ent, null)) {
                    caption = _i18n_i18n__WEBPACK_IMPORTED_MODULE_0__["i18n"].getText('Entities', ent.name);
                    if (!caption) {
                        caption = ent.caption;
                    }
                    var newEnt = _utils_utils__WEBPACK_IMPORTED_MODULE_1__["utils"].assign(this.createEntity(), { id: ent.name, text: caption, items: [], isEntity: true });
                    newEnt.items = this.listByEntityWithFilter(ent, filterFunc);
                    if (newEnt.items.length > 0)
                        result.push(newEnt);
                }
            }
        }
        var attr = null;
        if (entity.attributes) {
            var attrCount = entity.attributes.length;
            for (var attrIdx = 0; attrIdx < attrCount; attrIdx++) {
                attr = entity.attributes[attrIdx];
                if (!filterFunc || filterFunc(entity, attr)) {
                    caption = _i18n_i18n__WEBPACK_IMPORTED_MODULE_0__["i18n"].getText('Attributes', attr.id);
                    if (!caption)
                        caption = attr.caption;
                    var newEnt = _utils_utils__WEBPACK_IMPORTED_MODULE_1__["utils"].assign(this.createEntity(), { id: attr.id, text: caption, dataType: attr.dataType });
                    result.push(newEnt);
                }
            }
        }
        return result;
    };
    MetaData.prototype.listByEntity = function (entity, opts, filterFunc) {
        opts = opts || {};
        var resultEntities = [];
        var resultAttributes = [];
        var caption;
        var ent = null;
        if (entity.subEntities) {
            var subEntityCount = entity.subEntities.length;
            for (var entIdx = 0; entIdx < subEntityCount; entIdx++) {
                ent = entity.subEntities[entIdx];
                if (!filterFunc || filterFunc(ent, null)) {
                    caption = _i18n_i18n__WEBPACK_IMPORTED_MODULE_0__["i18n"].getText('Entities', ent.name) || ent.caption;
                    var newEnt = _utils_utils__WEBPACK_IMPORTED_MODULE_1__["utils"].assign(this.createEntity(), {
                        id: ent.name,
                        text: caption,
                        items: [],
                        isEntity: true,
                        description: ent.description
                    });
                    var newOpts = _utils_utils__WEBPACK_IMPORTED_MODULE_1__["utils"].assign({}, opts);
                    newOpts.includeRootData = false;
                    newEnt.items = this.listByEntity(ent, newOpts, filterFunc);
                    if (newEnt.items.length > 0) {
                        resultEntities.push(newEnt);
                    }
                }
            }
        }
        var attr = null;
        if (entity.attributes) {
            var attrCount = entity.attributes.length;
            for (var attrIdx = 0; attrIdx < attrCount; attrIdx++) {
                attr = entity.attributes[attrIdx];
                if (!filterFunc || filterFunc(entity, attr)) {
                    caption = _i18n_i18n__WEBPACK_IMPORTED_MODULE_0__["i18n"].getText('Attributes', attr.id) || attr.caption;
                    resultAttributes.push(_utils_utils__WEBPACK_IMPORTED_MODULE_1__["utils"].assign(this.createEntityAttr(entity), {
                        id: attr.id, text: caption,
                        dataType: attr.dataType, lookupAttr: attr.lookupAttr,
                        description: attr.description
                    }));
                }
            }
        }
        var sortCheck = function (a, b) {
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
        var result;
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
            caption = _i18n_i18n__WEBPACK_IMPORTED_MODULE_0__["i18n"].getText('Entities', entity.name);
            if (!caption)
                caption = entity.caption;
            return { id: entity.name, text: caption, items: result };
        }
        else {
            return result;
        }
    };
    /**
     * Clears data model.
     */
    MetaData.prototype.clear = function () {
        this.rootEntity = this.createEntity();
        this.editors = [];
        this.version = '';
    };
    /**
     * Add default value editors.
     */
    MetaData.prototype.addDefaultValueEditors = function () {
        var ve;
        ve = this.addOrUpdateValueEditor('_DTE', _types_meta_editor_tag__WEBPACK_IMPORTED_MODULE_2__["MetaEditorTag"].Edit, _types_data_type__WEBPACK_IMPORTED_MODULE_3__["DataType"].String);
        ve.defValue = '';
        this.addOrUpdateValueEditor('_DPDE', _types_meta_editor_tag__WEBPACK_IMPORTED_MODULE_2__["MetaEditorTag"].DateTime, _types_data_type__WEBPACK_IMPORTED_MODULE_3__["DataType"].DateTime);
        this.addOrUpdateValueEditor('_DPTE', _types_meta_editor_tag__WEBPACK_IMPORTED_MODULE_2__["MetaEditorTag"].DateTime, _types_data_type__WEBPACK_IMPORTED_MODULE_3__["DataType"].DateTime);
    };
    /**
    * Add or update a value editor.
    * @param id The id.
    * @param tag The tag.
    * @param resType The result type.
    * @returns The value editor.
    */
    MetaData.prototype.addOrUpdateValueEditor = function (id, tag, resType) {
        var ve = _utils_utils__WEBPACK_IMPORTED_MODULE_1__["utils"].findItemById(this.editors, id);
        if (!ve) {
            ve = this.createValueEditor();
            ve.id = id;
            this.editors.push(ve);
        }
        ve.tag = tag;
        ve.resType = resType;
        return ve;
    };
    /**
     * Gets entities tree.
     * @param opts The options.
     * @param filterFunc The filter function.
     * Takes two parameters, Entity and EntityAttr (second parameter will be null for entities), and returns boolean (true if the corresponding entity or attribute).
     * @returns The tree of the entities and their attributes according to options and the filter function
     */
    MetaData.prototype.getEntitiesTree = function (opts, filterFunc) {
        return this.listByEntity(this.getRootEntity(), opts, filterFunc);
    };
    /**
     * Gets entities tree due to filter.
     * @param filterFunc The filter function.
     * Takes two parameters, Entity and EntityAttr (second parameter will be null for entities), and returns boolean (true if the corresponding entity or attribute).
     * @returns The tree of the entities and their attributes according to the filter function
     */
    MetaData.prototype.getEntitiesTreeWithFilter = function (filterFunc) {
        return this.listByEntityWithFilter(this.getRootEntity(), filterFunc);
    };
    /**
     * Finds full entity path by attribute
     * @param attrId The attribute id.
     * @param sep The separator.
     * @returns The path.
     */
    MetaData.prototype.getFullEntityPathByAttr = function (attrId, sep) {
        sep = sep || ' ';
        return this.getEntityPathByAttr(this.getRootEntity(), attrId, sep, true);
    };
    /**
    * Finds entity path by attribute
    * @param entity The entity.
    * @param attrId The attribute id.
    * @param sep The separator.
    * @param root The root option.
    * @returns The path.
    */
    MetaData.prototype.getEntityPathByAttr = function (entity, attrId, sep, root) {
        if (!entity)
            return '';
        sep = sep || ' ';
        var entityCaption = '';
        if (entity.caption && !root) {
            var entityText = _i18n_i18n__WEBPACK_IMPORTED_MODULE_0__["i18n"].getText('Entities', entity.caption);
            entityCaption = entityText ? entityText : entity.caption;
        }
        if (entity.attributes) {
            var attrCount = entity.attributes.length;
            for (var i = 0; i < attrCount; i++) {
                if (entity.attributes[i].id == attrId) {
                    return entityCaption;
                }
            }
        }
        if (entity.subEntities) {
            var subEntityCount = entity.subEntities.length;
            for (var i = 0; i < subEntityCount; i++) {
                var ent = entity.subEntities[i];
                var res = this.getEntityPathByAttr(ent, attrId, sep, false);
                if (res !== '') {
                    if (entityCaption !== '')
                        res = entityCaption + sep + res;
                    return res;
                }
            }
        }
        return '';
    };
    /**
     * Gets the attribute text.
     * @param attr The attribute.
     * @param format The format.
     * @returns Formatted text.
     */
    MetaData.prototype.getAttributeText = function (attr, format) {
        var attrText = _i18n_i18n__WEBPACK_IMPORTED_MODULE_0__["i18n"].getText('Attributes', attr.id);
        if (!attrText) {
            attrText = attr.caption;
        }
        if (!format) {
            return attrText;
        }
        var result = '';
        var entityPath = this.getFullEntityPathByAttr(attr.id, ' ');
        if (entityPath) {
            result = format.replace(new RegExp('{attr}', 'g'), attrText);
            result = result.replace(new RegExp('{entity}', 'g'), entityPath);
        }
        else {
            result = attrText;
        }
        return result.trim();
    };
    /**
     * Scans model's entity tree and calls the callback functions for each attribute and entity.
     * @param processAttribute The callback function which is called for each attribute in model's entity tree.
     * The processed attribute is passed in the first function parameter.
     * @param processEntity The callback function which is called for each entity in tree.
     * The processed entity is passed in the first function parameter.
     */
    MetaData.prototype.runThroughEntities = function (processAttribute, processEntity) {
        this.getRootEntity().scan(processAttribute, processEntity);
    };
    /**
     * Finds first attribute by filter.
     * @param filterFunc The filter function. Takes EntityAttr object in parameter and returns boolean
     */
    MetaData.prototype.getFirstAttributeByFilter = function (filterFunc) {
        var res = null;
        this.runThroughEntities(function (attr, opts) {
            if (filterFunc(attr)) {
                opts.stop = true;
                res = attr;
            }
        }, null);
        return res;
    };
    return MetaData;
}());

//# sourceMappingURL=meta_data.js.map

/***/ }),

/***/ "../../easydata.js/packs/core/dist/lib/meta/meta_entity.js":
/*!********************************************************************************!*\
  !*** c:/projects/easydata/easydata.js/packs/core/dist/lib/meta/meta_entity.js ***!
  \********************************************************************************/
/*! exports provided: MetaEntity, MetaEntityAttr */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MetaEntity", function() { return MetaEntity; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MetaEntityAttr", function() { return MetaEntityAttr; });
/* harmony import */ var _types_data_type__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../types/data_type */ "../../easydata.js/packs/core/dist/lib/types/data_type.js");
/* harmony import */ var _types_entity_attr_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../types/entity_attr_kind */ "../../easydata.js/packs/core/dist/lib/types/entity_attr_kind.js");
/* harmony import */ var _utils_utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/utils */ "../../easydata.js/packs/core/dist/lib/utils/utils.js");



/**
 * Represents one entity.
 */
var MetaEntity = /** @class */ (function () {
    /** The default constructor. */
    function MetaEntity(parent) {
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
    MetaEntity.prototype.loadFromData = function (model, dto) {
        if (dto) {
            this.id = dto.id;
            this.name = dto.name;
            this.captionPlural = dto.namePlur;
            this.caption = dto.name;
            this.description = dto.desc;
            this.subEntities = new Array();
            if (dto.ents) {
                for (var i = 0; i < dto.ents.length; i++) {
                    var newEntity = new MetaEntity(this);
                    newEntity.loadFromData(model, dto.ents[i]);
                    this.subEntities.push(newEntity);
                }
            }
            this.attributes = new Array();
            if (dto.attrs) {
                for (var i = 0; i < dto.attrs.length; i++) {
                    var newAttr = new MetaEntityAttr(this);
                    newAttr.loadFromData(model, dto.attrs[i]);
                    this.attributes.push(newAttr);
                }
            }
        }
    };
    MetaEntity.prototype.scan = function (processAttribute, processEntity) {
        var opts = { stop: false };
        var internalProcessEntity = function (entity) {
            if (processEntity)
                processEntity(entity, opts);
            if (entity.attributes) {
                var attrCount = entity.attributes.length;
                for (var i = 0; (i < attrCount) && !opts.stop; i++) {
                    var attr = entity.attributes[i];
                    if (processAttribute) {
                        processAttribute(attr, opts);
                    }
                    if (opts.stop)
                        return;
                }
            }
            if (entity.subEntities) {
                var subEntityCount = entity.subEntities.length;
                for (var i = 0; (i < subEntityCount) && !opts.stop; i++) {
                    internalProcessEntity(entity.subEntities[i]);
                }
            }
        };
        internalProcessEntity(this);
    };
    return MetaEntity;
}());

var MetaEntityAttr = /** @class */ (function () {
    /** The default constructor. */
    function MetaEntityAttr(entity) {
        this.id = "";
        this.caption = "{Unrecognized attribute}";
        this.dataType = _types_data_type__WEBPACK_IMPORTED_MODULE_0__["DataType"].String;
        this.size = 0;
        this.isPrimaryKey = false;
        this.isForeignKey = false;
        this.isNullable = true;
        this.isVisible = true;
        this.isEditable = true;
        this.showInLookup = false;
        this.lookupAttr = "";
        this.expr = "";
        this.entity = entity;
        this.kind = _types_entity_attr_kind__WEBPACK_IMPORTED_MODULE_1__["EntityAttrKind"].Data;
    }
    /**
     * Loads entity attribute from JSON representation object.
     * @param model The Data Model.
     * @param dto The JSON representation object.
     */
    MetaEntityAttr.prototype.loadFromData = function (model, dto) {
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
            this.isNullable = _utils_utils__WEBPACK_IMPORTED_MODULE_2__["utils"].getIfDefined(dto.nul, this.isNullable);
            this.isEditable = _utils_utils__WEBPACK_IMPORTED_MODULE_2__["utils"].getIfDefined(dto.ied, this.isEditable);
            this.isVisible = _utils_utils__WEBPACK_IMPORTED_MODULE_2__["utils"].getIfDefined(dto.ivis, this.isVisible);
            this.showInLookup = _utils_utils__WEBPACK_IMPORTED_MODULE_2__["utils"].getIfDefined(dto.sil, this.showInLookup);
            this.kind = dto.kind;
            if (dto.udata)
                this.userData = dto.udata;
            if (dto.edtr) {
                this.defaultEditor = model.getEditorById(dto.edtr) || model.createValueEditor();
            }
        }
    };
    return MetaEntityAttr;
}());

//# sourceMappingURL=meta_entity.js.map

/***/ }),

/***/ "../../easydata.js/packs/core/dist/lib/meta/meta_value_editor.js":
/*!**************************************************************************************!*\
  !*** c:/projects/easydata/easydata.js/packs/core/dist/lib/meta/meta_value_editor.js ***!
  \**************************************************************************************/
/*! exports provided: MetaValueEditor */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MetaValueEditor", function() { return MetaValueEditor; });
/* harmony import */ var _types_meta_editor_tag__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../types/meta_editor_tag */ "../../easydata.js/packs/core/dist/lib/types/meta_editor_tag.js");
/* harmony import */ var _types_data_type__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../types/data_type */ "../../easydata.js/packs/core/dist/lib/types/data_type.js");


/**
 * Represents a value editor.
 */
var MetaValueEditor = /** @class */ (function () {
    /** The default constructor. */
    function MetaValueEditor() {
        this.id = "";
        this.tag = _types_meta_editor_tag__WEBPACK_IMPORTED_MODULE_0__["MetaEditorTag"].Unknown;
        this.resType = _types_data_type__WEBPACK_IMPORTED_MODULE_1__["DataType"].Unknown;
        this.defValue = "";
    }
    /**
     * Loads value editor from its JSON representation object.
     * @param data The JSON representation object.
     */
    MetaValueEditor.prototype.loadFromData = function (data) {
        if (data) {
            this.id = data.id;
            this.tag = data.tag;
            this.defValue = data.defval;
            this.resType = data.rtype;
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
    };
    MetaValueEditor.prototype.getValueText = function (value) {
        var result = "";
        if (!this.values)
            return result;
        if (Array.isArray(value)) {
            for (var _i = 0, _a = this.values; _i < _a.length; _i++) {
                var item = _a[_i];
                if (value.indexOf(item.id) >= 0) {
                    result += item.text + ',';
                }
            }
        }
        else {
            for (var _b = 0, _c = this.values; _b < _c.length; _b++) {
                var item = _c[_b];
                if (item.id === value) {
                    result += item.text + ',';
                }
            }
        }
        if (result) {
            result = result.substring(0, result.length - 1);
        }
        return result;
    };
    return MetaValueEditor;
}());

//# sourceMappingURL=meta_value_editor.js.map

/***/ }),

/***/ "../../easydata.js/packs/core/dist/lib/public_api.js":
/*!**************************************************************************!*\
  !*** c:/projects/easydata/easydata.js/packs/core/dist/lib/public_api.js ***!
  \**************************************************************************/
/*! exports provided: DataType, EntityAttrKind, MetaEditorTag, HttpMethod, HttpRequest, HttpActionResult, HttpResponseError, HttpClient, MetaData, MetaEntity, MetaEntityAttr, MetaValueEditor, DataColumn, DataColumnList, DataRow, EasyDataTable, EventEmitter, i18n, EasyGuid, repeatString, reverseString, strEndsWith, combinePath, utils */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _types_data_type__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./types/data_type */ "../../easydata.js/packs/core/dist/lib/types/data_type.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "DataType", function() { return _types_data_type__WEBPACK_IMPORTED_MODULE_0__["DataType"]; });

/* harmony import */ var _types_entity_attr_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./types/entity_attr_kind */ "../../easydata.js/packs/core/dist/lib/types/entity_attr_kind.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "EntityAttrKind", function() { return _types_entity_attr_kind__WEBPACK_IMPORTED_MODULE_1__["EntityAttrKind"]; });

/* harmony import */ var _types_meta_editor_tag__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./types/meta_editor_tag */ "../../easydata.js/packs/core/dist/lib/types/meta_editor_tag.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "MetaEditorTag", function() { return _types_meta_editor_tag__WEBPACK_IMPORTED_MODULE_2__["MetaEditorTag"]; });

/* harmony import */ var _http_http_method__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./http/http_method */ "../../easydata.js/packs/core/dist/lib/http/http_method.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "HttpMethod", function() { return _http_http_method__WEBPACK_IMPORTED_MODULE_3__["HttpMethod"]; });

/* harmony import */ var _http_http_request__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./http/http_request */ "../../easydata.js/packs/core/dist/lib/http/http_request.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "HttpRequest", function() { return _http_http_request__WEBPACK_IMPORTED_MODULE_4__["HttpRequest"]; });

/* harmony import */ var _http_http_client__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./http/http_client */ "../../easydata.js/packs/core/dist/lib/http/http_client.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "HttpActionResult", function() { return _http_http_client__WEBPACK_IMPORTED_MODULE_5__["HttpActionResult"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "HttpResponseError", function() { return _http_http_client__WEBPACK_IMPORTED_MODULE_5__["HttpResponseError"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "HttpClient", function() { return _http_http_client__WEBPACK_IMPORTED_MODULE_5__["HttpClient"]; });

/* harmony import */ var _meta_meta_data__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./meta/meta_data */ "../../easydata.js/packs/core/dist/lib/meta/meta_data.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "MetaData", function() { return _meta_meta_data__WEBPACK_IMPORTED_MODULE_6__["MetaData"]; });

/* harmony import */ var _meta_meta_entity__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./meta/meta_entity */ "../../easydata.js/packs/core/dist/lib/meta/meta_entity.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "MetaEntity", function() { return _meta_meta_entity__WEBPACK_IMPORTED_MODULE_7__["MetaEntity"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "MetaEntityAttr", function() { return _meta_meta_entity__WEBPACK_IMPORTED_MODULE_7__["MetaEntityAttr"]; });

/* harmony import */ var _meta_meta_value_editor__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./meta/meta_value_editor */ "../../easydata.js/packs/core/dist/lib/meta/meta_value_editor.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "MetaValueEditor", function() { return _meta_meta_value_editor__WEBPACK_IMPORTED_MODULE_8__["MetaValueEditor"]; });

/* harmony import */ var _data_data_column__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./data/data_column */ "../../easydata.js/packs/core/dist/lib/data/data_column.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "DataColumn", function() { return _data_data_column__WEBPACK_IMPORTED_MODULE_9__["DataColumn"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "DataColumnList", function() { return _data_data_column__WEBPACK_IMPORTED_MODULE_9__["DataColumnList"]; });

/* harmony import */ var _data_data_row__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./data/data_row */ "../../easydata.js/packs/core/dist/lib/data/data_row.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "DataRow", function() { return _data_data_row__WEBPACK_IMPORTED_MODULE_10__["DataRow"]; });

/* harmony import */ var _data_easy_data_table__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./data/easy_data_table */ "../../easydata.js/packs/core/dist/lib/data/easy_data_table.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "EasyDataTable", function() { return _data_easy_data_table__WEBPACK_IMPORTED_MODULE_11__["EasyDataTable"]; });

/* harmony import */ var _event_event_emitter__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./event/event_emitter */ "../../easydata.js/packs/core/dist/lib/event/event_emitter.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "EventEmitter", function() { return _event_event_emitter__WEBPACK_IMPORTED_MODULE_12__["EventEmitter"]; });

/* harmony import */ var _i18n_i18n__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./i18n/i18n */ "../../easydata.js/packs/core/dist/lib/i18n/i18n.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "i18n", function() { return _i18n_i18n__WEBPACK_IMPORTED_MODULE_13__["i18n"]; });

/* harmony import */ var _utils_easy_guid__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./utils/easy_guid */ "../../easydata.js/packs/core/dist/lib/utils/easy_guid.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "EasyGuid", function() { return _utils_easy_guid__WEBPACK_IMPORTED_MODULE_14__["EasyGuid"]; });

/* harmony import */ var _utils_string_utils__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./utils/string_utils */ "../../easydata.js/packs/core/dist/lib/utils/string_utils.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "repeatString", function() { return _utils_string_utils__WEBPACK_IMPORTED_MODULE_15__["repeatString"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "reverseString", function() { return _utils_string_utils__WEBPACK_IMPORTED_MODULE_15__["reverseString"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "strEndsWith", function() { return _utils_string_utils__WEBPACK_IMPORTED_MODULE_15__["strEndsWith"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "combinePath", function() { return _utils_string_utils__WEBPACK_IMPORTED_MODULE_15__["combinePath"]; });

/* harmony import */ var _utils_utils__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./utils/utils */ "../../easydata.js/packs/core/dist/lib/utils/utils.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "utils", function() { return _utils_utils__WEBPACK_IMPORTED_MODULE_16__["utils"]; });

/* harmony import */ var _i18n_load_default_locale_settings__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ./i18n/load_default_locale_settings */ "../../easydata.js/packs/core/dist/lib/i18n/load_default_locale_settings.js");
//types



//http



//meta data



//data



//event

//i18n

//utils




if (typeof Object.values !== 'function') {
    Object.values = function (obj) {
        return Object.keys(obj).map(function (key) { return obj[key]; });
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
//# sourceMappingURL=public_api.js.map

/***/ }),

/***/ "../../easydata.js/packs/core/dist/lib/types/data_type.js":
/*!*******************************************************************************!*\
  !*** c:/projects/easydata/easydata.js/packs/core/dist/lib/types/data_type.js ***!
  \*******************************************************************************/
/*! exports provided: DataType */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DataType", function() { return DataType; });
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
//# sourceMappingURL=data_type.js.map

/***/ }),

/***/ "../../easydata.js/packs/core/dist/lib/types/entity_attr_kind.js":
/*!**************************************************************************************!*\
  !*** c:/projects/easydata/easydata.js/packs/core/dist/lib/types/entity_attr_kind.js ***!
  \**************************************************************************************/
/*! exports provided: EntityAttrKind */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "EntityAttrKind", function() { return EntityAttrKind; });
var EntityAttrKind;
(function (EntityAttrKind) {
    EntityAttrKind[EntityAttrKind["Data"] = 0] = "Data";
    EntityAttrKind[EntityAttrKind["Virtual"] = 1] = "Virtual";
    EntityAttrKind[EntityAttrKind["Lookup"] = 2] = "Lookup";
})(EntityAttrKind || (EntityAttrKind = {}));
//# sourceMappingURL=entity_attr_kind.js.map

/***/ }),

/***/ "../../easydata.js/packs/core/dist/lib/types/meta_editor_tag.js":
/*!*************************************************************************************!*\
  !*** c:/projects/easydata/easydata.js/packs/core/dist/lib/types/meta_editor_tag.js ***!
  \*************************************************************************************/
/*! exports provided: MetaEditorTag */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MetaEditorTag", function() { return MetaEditorTag; });
/** Represents editor tags*/
var MetaEditorTag;
(function (MetaEditorTag) {
    /** Unknown tag value */
    MetaEditorTag["Unknown"] = "Unknown";
    /** Edit tag value */
    MetaEditorTag["Edit"] = "EDIT";
    /** DateTime tag value  */
    MetaEditorTag["DateTime"] = "DATETIME";
    /** List tag value */
    MetaEditorTag["List"] = "LIST";
    /** CustomList tag value */
    MetaEditorTag["CustomList"] = "CUSTOMLIST";
})(MetaEditorTag || (MetaEditorTag = {}));
//# sourceMappingURL=meta_editor_tag.js.map

/***/ }),

/***/ "../../easydata.js/packs/core/dist/lib/utils/easy_guid.js":
/*!*******************************************************************************!*\
  !*** c:/projects/easydata/easydata.js/packs/core/dist/lib/utils/easy_guid.js ***!
  \*******************************************************************************/
/*! exports provided: EasyGuid */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "EasyGuid", function() { return EasyGuid; });
/**
 * EasyData representation of GUID.
 */
var EasyGuid = /** @class */ (function () {
    function EasyGuid() {
    }
    /**
     * Generates new GUID.
     * @returns The string representation of GUID.
     */
    EasyGuid.newGuid = function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };
    return EasyGuid;
}());

//# sourceMappingURL=easy_guid.js.map

/***/ }),

/***/ "../../easydata.js/packs/core/dist/lib/utils/string_utils.js":
/*!**********************************************************************************!*\
  !*** c:/projects/easydata/easydata.js/packs/core/dist/lib/utils/string_utils.js ***!
  \**********************************************************************************/
/*! exports provided: repeatString, reverseString, strEndsWith, combinePath */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "repeatString", function() { return repeatString; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "reverseString", function() { return reverseString; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "strEndsWith", function() { return strEndsWith; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "combinePath", function() { return combinePath; });
function repeatString(str, times) {
    var result = "";
    for (var i = 0; i < times; i++) {
        result += str;
    }
    return result;
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
function combinePath(path1, path2) {
    var result = path1;
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
//# sourceMappingURL=string_utils.js.map

/***/ }),

/***/ "../../easydata.js/packs/core/dist/lib/utils/utils.js":
/*!***************************************************************************!*\
  !*** c:/projects/easydata/easydata.js/packs/core/dist/lib/utils/utils.js ***!
  \***************************************************************************/
/*! exports provided: utils */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "utils", function() { return utils; });
/* harmony import */ var _string_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./string_utils */ "../../easydata.js/packs/core/dist/lib/utils/string_utils.js");
/* harmony import */ var _types_data_type__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../types/data_type */ "../../easydata.js/packs/core/dist/lib/types/data_type.js");
/* harmony import */ var _i18n_i18n__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../i18n/i18n */ "../../easydata.js/packs/core/dist/lib/i18n/i18n.js");



var utils;
(function (utils) {
    function getAllDataTypes() {
        return Object.values(_types_data_type__WEBPACK_IMPORTED_MODULE_1__["DataType"]);
    }
    utils.getAllDataTypes = getAllDataTypes;
    function getDateDataTypes() {
        return [_types_data_type__WEBPACK_IMPORTED_MODULE_1__["DataType"].Time, _types_data_type__WEBPACK_IMPORTED_MODULE_1__["DataType"].Date, _types_data_type__WEBPACK_IMPORTED_MODULE_1__["DataType"].DateTime];
    }
    utils.getDateDataTypes = getDateDataTypes;
    function getStringDataTypes() {
        return [_types_data_type__WEBPACK_IMPORTED_MODULE_1__["DataType"].String, _types_data_type__WEBPACK_IMPORTED_MODULE_1__["DataType"].Memo];
    }
    utils.getStringDataTypes = getStringDataTypes;
    var _numericTypes = [_types_data_type__WEBPACK_IMPORTED_MODULE_1__["DataType"].Byte, _types_data_type__WEBPACK_IMPORTED_MODULE_1__["DataType"].Word, _types_data_type__WEBPACK_IMPORTED_MODULE_1__["DataType"].Int32,
        _types_data_type__WEBPACK_IMPORTED_MODULE_1__["DataType"].Int64, _types_data_type__WEBPACK_IMPORTED_MODULE_1__["DataType"].Float, _types_data_type__WEBPACK_IMPORTED_MODULE_1__["DataType"].Currency];
    var _intTypes = [_types_data_type__WEBPACK_IMPORTED_MODULE_1__["DataType"].Byte, _types_data_type__WEBPACK_IMPORTED_MODULE_1__["DataType"].Word, _types_data_type__WEBPACK_IMPORTED_MODULE_1__["DataType"].Int32, _types_data_type__WEBPACK_IMPORTED_MODULE_1__["DataType"].Int64];
    //-------------- object functions -------------------
    /**
     * Copy the content of all objests passed in `args` parameters into `target`
     * and returns the result
     * NB: This function copies only the first level properties.
     * For a deep copy please use `assignDeep`
     * @param target - the target object
     * @param args  - an array of the source objects
     */
    function assign(target) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        for (var i = 0; i < args.length; i++) {
            var source = args[i];
            if (source) {
                for (var key in source) {
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
    function assignDeep(target) {
        var sources = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            sources[_i - 1] = arguments[_i];
        }
        return assignDeepCore(new WeakMap(), target, sources);
    }
    utils.assignDeep = assignDeep;
    function assignDeepCore(hashSet, target, sources) {
        if (!target) {
            target = {};
        }
        for (var _i = 0, sources_1 = sources; _i < sources_1.length; _i++) {
            var source = sources_1[_i];
            if (source) {
                for (var key in source) {
                    if (source.hasOwnProperty(key)) {
                        var sourceVal = source[key];
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
                                    if (typeof target[key] == 'undefined') {
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
        var len1 = collection1.length;
        var len2 = collection2.length;
        for (var i = 0; i < len1 && i < len2; i++) {
            collection2[i] = collection1[i];
        }
    }
    utils.copyArrayTo = copyArrayTo;
    function createArrayFrom(collection) {
        var result = [];
        for (var _i = 0, collection_1 = collection; _i < collection_1.length; _i++) {
            var item = collection_1[_i];
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
            var len = arr.length;
            for (var i = 0; i < len; i++) {
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
        var item = array.splice(index1, 1)[0];
        array.splice(index2, 0, item);
    }
    utils.moveArrayItem = moveArrayItem;
    /**
     * Searches for a particular item in the array are removes that item if found.
     * @param arr
     * @param value
     */
    function removeArrayItem(arr, value) {
        var index = arr.indexOf(value);
        if (index != -1) {
            return arr.splice(index, 1)[0];
        }
    }
    utils.removeArrayItem = removeArrayItem;
    function insertArrayItem(arr, index, value) {
        arr.splice(index, 0, value);
    }
    utils.insertArrayItem = insertArrayItem;
    function fillArray(arr, value, start, end) {
        if (start === void 0) { start = 0; }
        var len = arr.length >>> 0;
        var relativeStart = start >> 0;
        var k = relativeStart < 0 ?
            Math.max(len + relativeStart, 0) :
            Math.min(relativeStart, len);
        var relativeEnd = end === undefined ?
            len : end >> 0;
        var final = relativeEnd < 0 ?
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
        var body = document.getElementsByTagName('body')[0];
        var winWidth = window.innerWidth || document.documentElement.clientWidth || body.clientWidth;
        var absRight = absLeft + width;
        var shift = 0;
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
        var index = _numericTypes.indexOf(dtype);
        return (index >= 0);
    }
    utils.isNumericType = isNumericType;
    /**
     * Returns `true` if the `DataType` value passed in the parameter
     * represents some numeric type
     * @param dtype
     */
    function isIntType(dtype) {
        var index = _intTypes.indexOf(dtype);
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
        return typeof type1 == "undefined" || typeof type2 == "undefined" || type1 == _types_data_type__WEBPACK_IMPORTED_MODULE_1__["DataType"].Unknown || type2 == _types_data_type__WEBPACK_IMPORTED_MODULE_1__["DataType"].Unknown
            || (type1 == type2) || (type1 == _types_data_type__WEBPACK_IMPORTED_MODULE_1__["DataType"].Date && type2 == _types_data_type__WEBPACK_IMPORTED_MODULE_1__["DataType"].DateTime)
            || (type1 == _types_data_type__WEBPACK_IMPORTED_MODULE_1__["DataType"].DateTime && type2 == _types_data_type__WEBPACK_IMPORTED_MODULE_1__["DataType"].Date);
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
    var prefixIdLen = 4;
    var symbols = "0123456789abcdefghijklmnopqrstuvwxyz";
    var magicTicks = 636712160627685350;
    /**
     * Generates an unique ID
     */
    function generateId(prefix) {
        if (!prefix) {
            prefix = 'easy';
        }
        var prfx = (prefix.length > prefixIdLen) ? squeezeMoniker(prefix, prefixIdLen) : prefix;
        if (prfx && prfx.length > 0) {
            prfx += "-";
        }
        //adding 2 random symbols
        var randValue = _string_utils__WEBPACK_IMPORTED_MODULE_0__["repeatString"]("", 2);
        ;
        var maxSymbolIndex = symbols.length - 1;
        randValue = replaceAtString(randValue, 0, symbols[getRandomInt(0, maxSymbolIndex)]);
        randValue = replaceAtString(randValue, 1, symbols[getRandomInt(0, maxSymbolIndex)]);
        //generating main ID part (64-base representation of the current value of the time ticks)
        var ticksNum64 = intToNum36(getNowTicks() - magicTicks);
        return prfx + randValue + ticksNum64;
    }
    utils.generateId = generateId;
    function intToNum36(value) {
        var targetBase = 36;
        var i = 14;
        var buffer = _string_utils__WEBPACK_IMPORTED_MODULE_0__["repeatString"]("", i);
        var rest = value;
        do {
            buffer = replaceAtString(buffer, i--, symbols[rest % targetBase]);
            rest = Math.floor(rest /= targetBase);
        } while (rest > 0);
        return _string_utils__WEBPACK_IMPORTED_MODULE_0__["reverseString"](buffer.trim());
    }
    function squeezeMoniker(str, maxlen) {
        var parts = str.split('-');
        var pml = 1;
        var ptt = maxlen;
        if (parts.length < maxlen) {
            pml = maxlen / parts.length;
            ptt = parts.length;
        }
        var result = "";
        for (var i = 0; i < ptt; i++) {
            result += squeeze(parts[i], pml);
        }
        return result;
    }
    function squeeze(str, maxlen) {
        var len = str.length;
        if (len > maxlen) {
            var step = len / maxlen;
            var result = "";
            result += str[0];
            var nextIndex = step;
            var ch = void 0;
            for (var i = 1; i < len; i++) {
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
    function replaceAtString(str, index, value) {
        return str.substr(0, index) + value + str.substr(index + value.length);
    }
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }
    function getNowTicks() {
        return (621355968e9 + (new Date()).getTime() * 1e4);
    }
    function safeParseInt(str) {
        var isnum = /^\d+$/.test(str);
        if (!isnum)
            throw "Is not a valid number";
        return parseInt(str);
    }
    function getDaysInMonth(month, year) {
        return new Date(year, month + 1, 0).getDate();
    }
    // ------------- date/time functions -------------------
    function strToDateTime(value, format) {
        if (!value || value.length == 0)
            return new Date();
        var normalized = value.replace(/[^a-zA-Z0-9_]/g, '-');
        var normalizedFormat = format.replace(/[^a-zA-Z0-9_]/g, '-');
        var formatItems = normalizedFormat.split('-');
        var dateItems = normalized.split('-');
        var monthIndex = formatItems.indexOf("MM");
        var dayIndex = formatItems.indexOf("dd");
        var yearIndex = formatItems.indexOf("yyyy");
        var hourIndex = formatItems.indexOf("HH");
        var minutesIndex = formatItems.indexOf("mm");
        var secondsIndex = formatItems.indexOf("ss");
        var today = new Date();
        try {
            var year = yearIndex > -1 && yearIndex < dateItems.length ? safeParseInt(dateItems[yearIndex]) : today.getFullYear();
            var month = monthIndex > -1 && monthIndex < dateItems.length ? safeParseInt(dateItems[monthIndex]) - 1 : today.getMonth() - 1;
            if (month > 11)
                throw '';
            var day = dayIndex > -1 && dayIndex < dateItems.length ? safeParseInt(dateItems[dayIndex]) : today.getDate();
            if (day > getDaysInMonth(month, year))
                throw '';
            var hour = hourIndex > -1 && hourIndex < dateItems.length ? safeParseInt(dateItems[hourIndex]) : 0;
            if (hour > 23)
                throw '';
            var minute = minutesIndex > -1 && minutesIndex < dateItems.length ? safeParseInt(dateItems[minutesIndex]) : 0;
            if (minute > 59)
                throw '';
            var second = secondsIndex > -1 && secondsIndex < dateItems.length ? safeParseInt(dateItems[secondsIndex]) : 0;
            if (second > 59)
                throw '';
            return new Date(year, month, day, hour, minute, second);
        }
        catch (_a) {
            throw "Is not a valid date time.";
        }
    }
    utils.strToDateTime = strToDateTime;
    /**
     * Returns string representation of the date/time value according to the custom format (second parameter)
     * The format is compatible with the one used in .NET: https://docs.microsoft.com/en-us/dotnet/standard/base-types/custom-date-and-time-format-strings
     * @param date
     * @param format
     */
    function dateTimeToStr(date, format) {
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var day = date.getDate();
        var hour = date.getHours();
        var minute = date.getMinutes();
        var second = date.getSeconds();
        var hour12 = hour % 12 || 12; //the remainder of the division by 12. Or 12 if it's 0
        var isPm = hour > 11;
        return format.replace('yyyy', year.toString())
            .replace('MMMM', _i18n_i18n__WEBPACK_IMPORTED_MODULE_2__["i18n"].getLongMonthName(month))
            .replace('MMM', _i18n_i18n__WEBPACK_IMPORTED_MODULE_2__["i18n"].getShortMonthName(month))
            .replace('MM', (month < 10) ? '0' + month : month.toString())
            .replace('M', month.toString())
            .replace('dd', (day < 10) ? '0' + day : day.toString())
            .replace('d', day.toString())
            .replace('HH', (hour < 10) ? '0' + hour : hour.toString())
            .replace('H', hour.toString())
            .replace('hh', (hour12 < 10) ? '0' + hour12 : hour12.toString())
            .replace('h', hour12.toString())
            .replace('tt', isPm ? 'PM' : 'AM')
            .replace('mm', (minute < 10) ? '0' + minute : minute.toString())
            .replace('ss', (second < 10) ? '0' + second : second.toString());
    }
    utils.dateTimeToStr = dateTimeToStr;
})(utils || (utils = {}));
//# sourceMappingURL=utils.js.map

/***/ }),

/***/ "../../easydata.js/packs/core/node_modules/es6-promise/dist/es6-promise.js":
/*!************************************************************************************************!*\
  !*** c:/projects/easydata/easydata.js/packs/core/node_modules/es6-promise/dist/es6-promise.js ***!
  \************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process, global) {/*!
 * @overview es6-promise - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/stefanpenner/es6-promise/master/LICENSE
 * @version   v4.2.8+1e68dce6
 */

(function (global, factory) {
	 true ? module.exports = factory() :
	undefined;
}(this, (function () { 'use strict';

function objectOrFunction(x) {
  var type = typeof x;
  return x !== null && (type === 'object' || type === 'function');
}

function isFunction(x) {
  return typeof x === 'function';
}



var _isArray = void 0;
if (Array.isArray) {
  _isArray = Array.isArray;
} else {
  _isArray = function (x) {
    return Object.prototype.toString.call(x) === '[object Array]';
  };
}

var isArray = _isArray;

var len = 0;
var vertxNext = void 0;
var customSchedulerFn = void 0;

var asap = function asap(callback, arg) {
  queue[len] = callback;
  queue[len + 1] = arg;
  len += 2;
  if (len === 2) {
    // If len is 2, that means that we need to schedule an async flush.
    // If additional callbacks are queued before the queue is flushed, they
    // will be processed by this flush that we are scheduling.
    if (customSchedulerFn) {
      customSchedulerFn(flush);
    } else {
      scheduleFlush();
    }
  }
};

function setScheduler(scheduleFn) {
  customSchedulerFn = scheduleFn;
}

function setAsap(asapFn) {
  asap = asapFn;
}

var browserWindow = typeof window !== 'undefined' ? window : undefined;
var browserGlobal = browserWindow || {};
var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
var isNode = typeof self === 'undefined' && typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';

// test for web worker but not in IE10
var isWorker = typeof Uint8ClampedArray !== 'undefined' && typeof importScripts !== 'undefined' && typeof MessageChannel !== 'undefined';

// node
function useNextTick() {
  // node version 0.10.x displays a deprecation warning when nextTick is used recursively
  // see https://github.com/cujojs/when/issues/410 for details
  return function () {
    return process.nextTick(flush);
  };
}

// vertx
function useVertxTimer() {
  if (typeof vertxNext !== 'undefined') {
    return function () {
      vertxNext(flush);
    };
  }

  return useSetTimeout();
}

function useMutationObserver() {
  var iterations = 0;
  var observer = new BrowserMutationObserver(flush);
  var node = document.createTextNode('');
  observer.observe(node, { characterData: true });

  return function () {
    node.data = iterations = ++iterations % 2;
  };
}

// web worker
function useMessageChannel() {
  var channel = new MessageChannel();
  channel.port1.onmessage = flush;
  return function () {
    return channel.port2.postMessage(0);
  };
}

function useSetTimeout() {
  // Store setTimeout reference so es6-promise will be unaffected by
  // other code modifying setTimeout (like sinon.useFakeTimers())
  var globalSetTimeout = setTimeout;
  return function () {
    return globalSetTimeout(flush, 1);
  };
}

var queue = new Array(1000);
function flush() {
  for (var i = 0; i < len; i += 2) {
    var callback = queue[i];
    var arg = queue[i + 1];

    callback(arg);

    queue[i] = undefined;
    queue[i + 1] = undefined;
  }

  len = 0;
}

function attemptVertx() {
  try {
    var vertx = Function('return this')().require('vertx');
    vertxNext = vertx.runOnLoop || vertx.runOnContext;
    return useVertxTimer();
  } catch (e) {
    return useSetTimeout();
  }
}

var scheduleFlush = void 0;
// Decide what async method to use to triggering processing of queued callbacks:
if (isNode) {
  scheduleFlush = useNextTick();
} else if (BrowserMutationObserver) {
  scheduleFlush = useMutationObserver();
} else if (isWorker) {
  scheduleFlush = useMessageChannel();
} else if (browserWindow === undefined && "function" === 'function') {
  scheduleFlush = attemptVertx();
} else {
  scheduleFlush = useSetTimeout();
}

function then(onFulfillment, onRejection) {
  var parent = this;

  var child = new this.constructor(noop);

  if (child[PROMISE_ID] === undefined) {
    makePromise(child);
  }

  var _state = parent._state;


  if (_state) {
    var callback = arguments[_state - 1];
    asap(function () {
      return invokeCallback(_state, child, callback, parent._result);
    });
  } else {
    subscribe(parent, child, onFulfillment, onRejection);
  }

  return child;
}

/**
  `Promise.resolve` returns a promise that will become resolved with the
  passed `value`. It is shorthand for the following:

  ```javascript
  let promise = new Promise(function(resolve, reject){
    resolve(1);
  });

  promise.then(function(value){
    // value === 1
  });
  ```

  Instead of writing the above, your code now simply becomes the following:

  ```javascript
  let promise = Promise.resolve(1);

  promise.then(function(value){
    // value === 1
  });
  ```

  @method resolve
  @static
  @param {Any} value value that the returned promise will be resolved with
  Useful for tooling.
  @return {Promise} a promise that will become fulfilled with the given
  `value`
*/
function resolve$1(object) {
  /*jshint validthis:true */
  var Constructor = this;

  if (object && typeof object === 'object' && object.constructor === Constructor) {
    return object;
  }

  var promise = new Constructor(noop);
  resolve(promise, object);
  return promise;
}

var PROMISE_ID = Math.random().toString(36).substring(2);

function noop() {}

var PENDING = void 0;
var FULFILLED = 1;
var REJECTED = 2;

function selfFulfillment() {
  return new TypeError("You cannot resolve a promise with itself");
}

function cannotReturnOwn() {
  return new TypeError('A promises callback cannot return that same promise.');
}

function tryThen(then$$1, value, fulfillmentHandler, rejectionHandler) {
  try {
    then$$1.call(value, fulfillmentHandler, rejectionHandler);
  } catch (e) {
    return e;
  }
}

function handleForeignThenable(promise, thenable, then$$1) {
  asap(function (promise) {
    var sealed = false;
    var error = tryThen(then$$1, thenable, function (value) {
      if (sealed) {
        return;
      }
      sealed = true;
      if (thenable !== value) {
        resolve(promise, value);
      } else {
        fulfill(promise, value);
      }
    }, function (reason) {
      if (sealed) {
        return;
      }
      sealed = true;

      reject(promise, reason);
    }, 'Settle: ' + (promise._label || ' unknown promise'));

    if (!sealed && error) {
      sealed = true;
      reject(promise, error);
    }
  }, promise);
}

function handleOwnThenable(promise, thenable) {
  if (thenable._state === FULFILLED) {
    fulfill(promise, thenable._result);
  } else if (thenable._state === REJECTED) {
    reject(promise, thenable._result);
  } else {
    subscribe(thenable, undefined, function (value) {
      return resolve(promise, value);
    }, function (reason) {
      return reject(promise, reason);
    });
  }
}

function handleMaybeThenable(promise, maybeThenable, then$$1) {
  if (maybeThenable.constructor === promise.constructor && then$$1 === then && maybeThenable.constructor.resolve === resolve$1) {
    handleOwnThenable(promise, maybeThenable);
  } else {
    if (then$$1 === undefined) {
      fulfill(promise, maybeThenable);
    } else if (isFunction(then$$1)) {
      handleForeignThenable(promise, maybeThenable, then$$1);
    } else {
      fulfill(promise, maybeThenable);
    }
  }
}

function resolve(promise, value) {
  if (promise === value) {
    reject(promise, selfFulfillment());
  } else if (objectOrFunction(value)) {
    var then$$1 = void 0;
    try {
      then$$1 = value.then;
    } catch (error) {
      reject(promise, error);
      return;
    }
    handleMaybeThenable(promise, value, then$$1);
  } else {
    fulfill(promise, value);
  }
}

function publishRejection(promise) {
  if (promise._onerror) {
    promise._onerror(promise._result);
  }

  publish(promise);
}

function fulfill(promise, value) {
  if (promise._state !== PENDING) {
    return;
  }

  promise._result = value;
  promise._state = FULFILLED;

  if (promise._subscribers.length !== 0) {
    asap(publish, promise);
  }
}

function reject(promise, reason) {
  if (promise._state !== PENDING) {
    return;
  }
  promise._state = REJECTED;
  promise._result = reason;

  asap(publishRejection, promise);
}

function subscribe(parent, child, onFulfillment, onRejection) {
  var _subscribers = parent._subscribers;
  var length = _subscribers.length;


  parent._onerror = null;

  _subscribers[length] = child;
  _subscribers[length + FULFILLED] = onFulfillment;
  _subscribers[length + REJECTED] = onRejection;

  if (length === 0 && parent._state) {
    asap(publish, parent);
  }
}

function publish(promise) {
  var subscribers = promise._subscribers;
  var settled = promise._state;

  if (subscribers.length === 0) {
    return;
  }

  var child = void 0,
      callback = void 0,
      detail = promise._result;

  for (var i = 0; i < subscribers.length; i += 3) {
    child = subscribers[i];
    callback = subscribers[i + settled];

    if (child) {
      invokeCallback(settled, child, callback, detail);
    } else {
      callback(detail);
    }
  }

  promise._subscribers.length = 0;
}

function invokeCallback(settled, promise, callback, detail) {
  var hasCallback = isFunction(callback),
      value = void 0,
      error = void 0,
      succeeded = true;

  if (hasCallback) {
    try {
      value = callback(detail);
    } catch (e) {
      succeeded = false;
      error = e;
    }

    if (promise === value) {
      reject(promise, cannotReturnOwn());
      return;
    }
  } else {
    value = detail;
  }

  if (promise._state !== PENDING) {
    // noop
  } else if (hasCallback && succeeded) {
    resolve(promise, value);
  } else if (succeeded === false) {
    reject(promise, error);
  } else if (settled === FULFILLED) {
    fulfill(promise, value);
  } else if (settled === REJECTED) {
    reject(promise, value);
  }
}

function initializePromise(promise, resolver) {
  try {
    resolver(function resolvePromise(value) {
      resolve(promise, value);
    }, function rejectPromise(reason) {
      reject(promise, reason);
    });
  } catch (e) {
    reject(promise, e);
  }
}

var id = 0;
function nextId() {
  return id++;
}

function makePromise(promise) {
  promise[PROMISE_ID] = id++;
  promise._state = undefined;
  promise._result = undefined;
  promise._subscribers = [];
}

function validationError() {
  return new Error('Array Methods must be provided an Array');
}

var Enumerator = function () {
  function Enumerator(Constructor, input) {
    this._instanceConstructor = Constructor;
    this.promise = new Constructor(noop);

    if (!this.promise[PROMISE_ID]) {
      makePromise(this.promise);
    }

    if (isArray(input)) {
      this.length = input.length;
      this._remaining = input.length;

      this._result = new Array(this.length);

      if (this.length === 0) {
        fulfill(this.promise, this._result);
      } else {
        this.length = this.length || 0;
        this._enumerate(input);
        if (this._remaining === 0) {
          fulfill(this.promise, this._result);
        }
      }
    } else {
      reject(this.promise, validationError());
    }
  }

  Enumerator.prototype._enumerate = function _enumerate(input) {
    for (var i = 0; this._state === PENDING && i < input.length; i++) {
      this._eachEntry(input[i], i);
    }
  };

  Enumerator.prototype._eachEntry = function _eachEntry(entry, i) {
    var c = this._instanceConstructor;
    var resolve$$1 = c.resolve;


    if (resolve$$1 === resolve$1) {
      var _then = void 0;
      var error = void 0;
      var didError = false;
      try {
        _then = entry.then;
      } catch (e) {
        didError = true;
        error = e;
      }

      if (_then === then && entry._state !== PENDING) {
        this._settledAt(entry._state, i, entry._result);
      } else if (typeof _then !== 'function') {
        this._remaining--;
        this._result[i] = entry;
      } else if (c === Promise$1) {
        var promise = new c(noop);
        if (didError) {
          reject(promise, error);
        } else {
          handleMaybeThenable(promise, entry, _then);
        }
        this._willSettleAt(promise, i);
      } else {
        this._willSettleAt(new c(function (resolve$$1) {
          return resolve$$1(entry);
        }), i);
      }
    } else {
      this._willSettleAt(resolve$$1(entry), i);
    }
  };

  Enumerator.prototype._settledAt = function _settledAt(state, i, value) {
    var promise = this.promise;


    if (promise._state === PENDING) {
      this._remaining--;

      if (state === REJECTED) {
        reject(promise, value);
      } else {
        this._result[i] = value;
      }
    }

    if (this._remaining === 0) {
      fulfill(promise, this._result);
    }
  };

  Enumerator.prototype._willSettleAt = function _willSettleAt(promise, i) {
    var enumerator = this;

    subscribe(promise, undefined, function (value) {
      return enumerator._settledAt(FULFILLED, i, value);
    }, function (reason) {
      return enumerator._settledAt(REJECTED, i, reason);
    });
  };

  return Enumerator;
}();

/**
  `Promise.all` accepts an array of promises, and returns a new promise which
  is fulfilled with an array of fulfillment values for the passed promises, or
  rejected with the reason of the first passed promise to be rejected. It casts all
  elements of the passed iterable to promises as it runs this algorithm.

  Example:

  ```javascript
  let promise1 = resolve(1);
  let promise2 = resolve(2);
  let promise3 = resolve(3);
  let promises = [ promise1, promise2, promise3 ];

  Promise.all(promises).then(function(array){
    // The array here would be [ 1, 2, 3 ];
  });
  ```

  If any of the `promises` given to `all` are rejected, the first promise
  that is rejected will be given as an argument to the returned promises's
  rejection handler. For example:

  Example:

  ```javascript
  let promise1 = resolve(1);
  let promise2 = reject(new Error("2"));
  let promise3 = reject(new Error("3"));
  let promises = [ promise1, promise2, promise3 ];

  Promise.all(promises).then(function(array){
    // Code here never runs because there are rejected promises!
  }, function(error) {
    // error.message === "2"
  });
  ```

  @method all
  @static
  @param {Array} entries array of promises
  @param {String} label optional string for labeling the promise.
  Useful for tooling.
  @return {Promise} promise that is fulfilled when all `promises` have been
  fulfilled, or rejected if any of them become rejected.
  @static
*/
function all(entries) {
  return new Enumerator(this, entries).promise;
}

/**
  `Promise.race` returns a new promise which is settled in the same way as the
  first passed promise to settle.

  Example:

  ```javascript
  let promise1 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 1');
    }, 200);
  });

  let promise2 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 2');
    }, 100);
  });

  Promise.race([promise1, promise2]).then(function(result){
    // result === 'promise 2' because it was resolved before promise1
    // was resolved.
  });
  ```

  `Promise.race` is deterministic in that only the state of the first
  settled promise matters. For example, even if other promises given to the
  `promises` array argument are resolved, but the first settled promise has
  become rejected before the other promises became fulfilled, the returned
  promise will become rejected:

  ```javascript
  let promise1 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 1');
    }, 200);
  });

  let promise2 = new Promise(function(resolve, reject){
    setTimeout(function(){
      reject(new Error('promise 2'));
    }, 100);
  });

  Promise.race([promise1, promise2]).then(function(result){
    // Code here never runs
  }, function(reason){
    // reason.message === 'promise 2' because promise 2 became rejected before
    // promise 1 became fulfilled
  });
  ```

  An example real-world use case is implementing timeouts:

  ```javascript
  Promise.race([ajax('foo.json'), timeout(5000)])
  ```

  @method race
  @static
  @param {Array} promises array of promises to observe
  Useful for tooling.
  @return {Promise} a promise which settles in the same way as the first passed
  promise to settle.
*/
function race(entries) {
  /*jshint validthis:true */
  var Constructor = this;

  if (!isArray(entries)) {
    return new Constructor(function (_, reject) {
      return reject(new TypeError('You must pass an array to race.'));
    });
  } else {
    return new Constructor(function (resolve, reject) {
      var length = entries.length;
      for (var i = 0; i < length; i++) {
        Constructor.resolve(entries[i]).then(resolve, reject);
      }
    });
  }
}

/**
  `Promise.reject` returns a promise rejected with the passed `reason`.
  It is shorthand for the following:

  ```javascript
  let promise = new Promise(function(resolve, reject){
    reject(new Error('WHOOPS'));
  });

  promise.then(function(value){
    // Code here doesn't run because the promise is rejected!
  }, function(reason){
    // reason.message === 'WHOOPS'
  });
  ```

  Instead of writing the above, your code now simply becomes the following:

  ```javascript
  let promise = Promise.reject(new Error('WHOOPS'));

  promise.then(function(value){
    // Code here doesn't run because the promise is rejected!
  }, function(reason){
    // reason.message === 'WHOOPS'
  });
  ```

  @method reject
  @static
  @param {Any} reason value that the returned promise will be rejected with.
  Useful for tooling.
  @return {Promise} a promise rejected with the given `reason`.
*/
function reject$1(reason) {
  /*jshint validthis:true */
  var Constructor = this;
  var promise = new Constructor(noop);
  reject(promise, reason);
  return promise;
}

function needsResolver() {
  throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
}

function needsNew() {
  throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
}

/**
  Promise objects represent the eventual result of an asynchronous operation. The
  primary way of interacting with a promise is through its `then` method, which
  registers callbacks to receive either a promise's eventual value or the reason
  why the promise cannot be fulfilled.

  Terminology
  -----------

  - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
  - `thenable` is an object or function that defines a `then` method.
  - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
  - `exception` is a value that is thrown using the throw statement.
  - `reason` is a value that indicates why a promise was rejected.
  - `settled` the final resting state of a promise, fulfilled or rejected.

  A promise can be in one of three states: pending, fulfilled, or rejected.

  Promises that are fulfilled have a fulfillment value and are in the fulfilled
  state.  Promises that are rejected have a rejection reason and are in the
  rejected state.  A fulfillment value is never a thenable.

  Promises can also be said to *resolve* a value.  If this value is also a
  promise, then the original promise's settled state will match the value's
  settled state.  So a promise that *resolves* a promise that rejects will
  itself reject, and a promise that *resolves* a promise that fulfills will
  itself fulfill.


  Basic Usage:
  ------------

  ```js
  let promise = new Promise(function(resolve, reject) {
    // on success
    resolve(value);

    // on failure
    reject(reason);
  });

  promise.then(function(value) {
    // on fulfillment
  }, function(reason) {
    // on rejection
  });
  ```

  Advanced Usage:
  ---------------

  Promises shine when abstracting away asynchronous interactions such as
  `XMLHttpRequest`s.

  ```js
  function getJSON(url) {
    return new Promise(function(resolve, reject){
      let xhr = new XMLHttpRequest();

      xhr.open('GET', url);
      xhr.onreadystatechange = handler;
      xhr.responseType = 'json';
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.send();

      function handler() {
        if (this.readyState === this.DONE) {
          if (this.status === 200) {
            resolve(this.response);
          } else {
            reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
          }
        }
      };
    });
  }

  getJSON('/posts.json').then(function(json) {
    // on fulfillment
  }, function(reason) {
    // on rejection
  });
  ```

  Unlike callbacks, promises are great composable primitives.

  ```js
  Promise.all([
    getJSON('/posts'),
    getJSON('/comments')
  ]).then(function(values){
    values[0] // => postsJSON
    values[1] // => commentsJSON

    return values;
  });
  ```

  @class Promise
  @param {Function} resolver
  Useful for tooling.
  @constructor
*/

var Promise$1 = function () {
  function Promise(resolver) {
    this[PROMISE_ID] = nextId();
    this._result = this._state = undefined;
    this._subscribers = [];

    if (noop !== resolver) {
      typeof resolver !== 'function' && needsResolver();
      this instanceof Promise ? initializePromise(this, resolver) : needsNew();
    }
  }

  /**
  The primary way of interacting with a promise is through its `then` method,
  which registers callbacks to receive either a promise's eventual value or the
  reason why the promise cannot be fulfilled.
   ```js
  findUser().then(function(user){
    // user is available
  }, function(reason){
    // user is unavailable, and you are given the reason why
  });
  ```
   Chaining
  --------
   The return value of `then` is itself a promise.  This second, 'downstream'
  promise is resolved with the return value of the first promise's fulfillment
  or rejection handler, or rejected if the handler throws an exception.
   ```js
  findUser().then(function (user) {
    return user.name;
  }, function (reason) {
    return 'default name';
  }).then(function (userName) {
    // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
    // will be `'default name'`
  });
   findUser().then(function (user) {
    throw new Error('Found user, but still unhappy');
  }, function (reason) {
    throw new Error('`findUser` rejected and we're unhappy');
  }).then(function (value) {
    // never reached
  }, function (reason) {
    // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
    // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
  });
  ```
  If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.
   ```js
  findUser().then(function (user) {
    throw new PedagogicalException('Upstream error');
  }).then(function (value) {
    // never reached
  }).then(function (value) {
    // never reached
  }, function (reason) {
    // The `PedgagocialException` is propagated all the way down to here
  });
  ```
   Assimilation
  ------------
   Sometimes the value you want to propagate to a downstream promise can only be
  retrieved asynchronously. This can be achieved by returning a promise in the
  fulfillment or rejection handler. The downstream promise will then be pending
  until the returned promise is settled. This is called *assimilation*.
   ```js
  findUser().then(function (user) {
    return findCommentsByAuthor(user);
  }).then(function (comments) {
    // The user's comments are now available
  });
  ```
   If the assimliated promise rejects, then the downstream promise will also reject.
   ```js
  findUser().then(function (user) {
    return findCommentsByAuthor(user);
  }).then(function (comments) {
    // If `findCommentsByAuthor` fulfills, we'll have the value here
  }, function (reason) {
    // If `findCommentsByAuthor` rejects, we'll have the reason here
  });
  ```
   Simple Example
  --------------
   Synchronous Example
   ```javascript
  let result;
   try {
    result = findResult();
    // success
  } catch(reason) {
    // failure
  }
  ```
   Errback Example
   ```js
  findResult(function(result, err){
    if (err) {
      // failure
    } else {
      // success
    }
  });
  ```
   Promise Example;
   ```javascript
  findResult().then(function(result){
    // success
  }, function(reason){
    // failure
  });
  ```
   Advanced Example
  --------------
   Synchronous Example
   ```javascript
  let author, books;
   try {
    author = findAuthor();
    books  = findBooksByAuthor(author);
    // success
  } catch(reason) {
    // failure
  }
  ```
   Errback Example
   ```js
   function foundBooks(books) {
   }
   function failure(reason) {
   }
   findAuthor(function(author, err){
    if (err) {
      failure(err);
      // failure
    } else {
      try {
        findBoooksByAuthor(author, function(books, err) {
          if (err) {
            failure(err);
          } else {
            try {
              foundBooks(books);
            } catch(reason) {
              failure(reason);
            }
          }
        });
      } catch(error) {
        failure(err);
      }
      // success
    }
  });
  ```
   Promise Example;
   ```javascript
  findAuthor().
    then(findBooksByAuthor).
    then(function(books){
      // found books
  }).catch(function(reason){
    // something went wrong
  });
  ```
   @method then
  @param {Function} onFulfilled
  @param {Function} onRejected
  Useful for tooling.
  @return {Promise}
  */

  /**
  `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
  as the catch block of a try/catch statement.
  ```js
  function findAuthor(){
  throw new Error('couldn't find that author');
  }
  // synchronous
  try {
  findAuthor();
  } catch(reason) {
  // something went wrong
  }
  // async with promises
  findAuthor().catch(function(reason){
  // something went wrong
  });
  ```
  @method catch
  @param {Function} onRejection
  Useful for tooling.
  @return {Promise}
  */


  Promise.prototype.catch = function _catch(onRejection) {
    return this.then(null, onRejection);
  };

  /**
    `finally` will be invoked regardless of the promise's fate just as native
    try/catch/finally behaves
  
    Synchronous example:
  
    ```js
    findAuthor() {
      if (Math.random() > 0.5) {
        throw new Error();
      }
      return new Author();
    }
  
    try {
      return findAuthor(); // succeed or fail
    } catch(error) {
      return findOtherAuther();
    } finally {
      // always runs
      // doesn't affect the return value
    }
    ```
  
    Asynchronous example:
  
    ```js
    findAuthor().catch(function(reason){
      return findOtherAuther();
    }).finally(function(){
      // author was either found, or not
    });
    ```
  
    @method finally
    @param {Function} callback
    @return {Promise}
  */


  Promise.prototype.finally = function _finally(callback) {
    var promise = this;
    var constructor = promise.constructor;

    if (isFunction(callback)) {
      return promise.then(function (value) {
        return constructor.resolve(callback()).then(function () {
          return value;
        });
      }, function (reason) {
        return constructor.resolve(callback()).then(function () {
          throw reason;
        });
      });
    }

    return promise.then(callback, callback);
  };

  return Promise;
}();

Promise$1.prototype.then = then;
Promise$1.all = all;
Promise$1.race = race;
Promise$1.resolve = resolve$1;
Promise$1.reject = reject$1;
Promise$1._setScheduler = setScheduler;
Promise$1._setAsap = setAsap;
Promise$1._asap = asap;

/*global self*/
function polyfill() {
  var local = void 0;

  if (typeof global !== 'undefined') {
    local = global;
  } else if (typeof self !== 'undefined') {
    local = self;
  } else {
    try {
      local = Function('return this')();
    } catch (e) {
      throw new Error('polyfill failed because global object is unavailable in this environment');
    }
  }

  var P = local.Promise;

  if (P) {
    var promiseToString = null;
    try {
      promiseToString = Object.prototype.toString.call(P.resolve());
    } catch (e) {
      // silently ignored
    }

    if (promiseToString === '[object Promise]' && !P.cast) {
      return;
    }
  }

  local.Promise = Promise$1;
}

// Strange compat..
Promise$1.polyfill = polyfill;
Promise$1.Promise = Promise$1;

return Promise$1;

})));



//# sourceMappingURL=es6-promise.map

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../../../../../samples/EasyDataBasicDemo.NetCore31/node_modules/process/browser.js */ "./node_modules/process/browser.js"), __webpack_require__(/*! ./../../../../../../samples/EasyDataBasicDemo.NetCore31/node_modules/webpack/buildin/global.js */ "./node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "../../easydata.js/packs/crud/dist/assets/css/ed-view.css":
/*!*******************************************************************************!*\
  !*** c:/projects/easydata/easydata.js/packs/crud/dist/assets/css/ed-view.css ***!
  \*******************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


var content = __webpack_require__(/*! !../../../../../../samples/EasyDataBasicDemo.NetCore31/node_modules/css-loader/dist/cjs.js??ref--6!./ed-view.css */ "./node_modules/css-loader/dist/cjs.js?!../../easydata.js/packs/crud/dist/assets/css/ed-view.css");

if(typeof content === 'string') content = [[module.i, content, '']];

var transform;
var insertInto;



var options = {"hmr":true}

options.transform = transform
options.insertInto = undefined;

var update = __webpack_require__(/*! ../../../../../../samples/EasyDataBasicDemo.NetCore31/node_modules/style-loader/lib/addStyles.js */ "./node_modules/style-loader/lib/addStyles.js")(content, options);

if(content.locals) module.exports = content.locals;

if(false) {}

/***/ }),

/***/ "../../easydata.js/packs/crud/dist/lib/filter/text_data_filter.js":
/*!***************************************************************************************!*\
  !*** c:/projects/easydata/easydata.js/packs/crud/dist/lib/filter/text_data_filter.js ***!
  \***************************************************************************************/
/*! exports provided: TextDataFilter */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* WEBPACK VAR INJECTION */(function(Promise) {/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TextDataFilter", function() { return TextDataFilter; });
/* harmony import */ var _easydata_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @easydata/core */ "../../easydata.js/packs/core/dist/lib/public_api.js");
var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

var TextDataFilter = /** @class */ (function () {
    function TextDataFilter(loader, sourceTable, entityId, isLookup) {
        if (isLookup === void 0) { isLookup = false; }
        this.loader = loader;
        this.sourceTable = sourceTable;
        this.entityId = entityId;
        this.isLookup = isLookup;
        this.filterValue = '';
        //turns off client-side search
        //for test purposes
        this.justServerSide = false;
    }
    TextDataFilter.prototype.getValue = function () {
        return this.filterValue;
    };
    TextDataFilter.prototype.apply = function (value) {
        this.filterValue = value;
        if (this.filterValue) {
            return this.applyCore();
        }
        else {
            return this.clear();
        }
    };
    TextDataFilter.prototype.clear = function () {
        this.filterValue = '';
        return Promise.resolve(this.sourceTable);
    };
    TextDataFilter.prototype.applyCore = function () {
        var _this = this;
        if (this.sourceTable.getTotal() == this.sourceTable.getCachedCount() && !this.justServerSide) {
            return this.applyInMemoryFilter();
        }
        else {
            return this.loader.loadChunk({
                offset: 0,
                limit: this.sourceTable.chunkSize,
                needTotal: true,
                filter: this.filterValue,
                entityId: this.entityId,
                lookup: this.isLookup
            })
                .then(function (data) {
                var filteredTable = new _easydata_core__WEBPACK_IMPORTED_MODULE_0__["EasyDataTable"]({
                    chunkSize: _this.sourceTable.chunkSize,
                    loader: {
                        loadChunk: function (params) { return _this.loader
                            .loadChunk(__assign({}, params, { filter: _this.filterValue, entityId: _this.entityId, lookup: _this.isLookup })); }
                    }
                });
                for (var _i = 0, _a = _this.sourceTable.columns.getItems(); _i < _a.length; _i++) {
                    var col = _a[_i];
                    filteredTable.columns.add(col);
                }
                filteredTable.setTotal(data.total);
                for (var _b = 0, _c = data.table.getCachedRows(); _b < _c.length; _b++) {
                    var row = _c[_b];
                    filteredTable.addRow(row);
                }
                return filteredTable;
            });
        }
    };
    TextDataFilter.prototype.applyInMemoryFilter = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var filteredTable = new _easydata_core__WEBPACK_IMPORTED_MODULE_0__["EasyDataTable"]({
                chunkSize: _this.sourceTable.chunkSize,
            });
            for (var _i = 0, _a = _this.sourceTable.columns.getItems(); _i < _a.length; _i++) {
                var col = _a[_i];
                filteredTable.columns.add(col);
            }
            var words = _this.filterValue.split('||').map(function (w) { return w.trim().toLowerCase(); });
            var hasEnterance = function (row) {
                for (var _i = 0, _a = _this.sourceTable.columns.getItems(); _i < _a.length; _i++) {
                    var col = _a[_i];
                    if (_easydata_core__WEBPACK_IMPORTED_MODULE_0__["utils"].isIntType(col.type)
                        || _easydata_core__WEBPACK_IMPORTED_MODULE_0__["utils"].getStringDataTypes().indexOf(col.type) >= 0) {
                        var value = row.getValue(col.id);
                        if (value) {
                            var normalized = value.toString()
                                .toLowerCase();
                            for (var _b = 0, words_1 = words; _b < words_1.length; _b++) {
                                var word = words_1[_b];
                                if (normalized.indexOf(word) >= 0) {
                                    return true;
                                }
                            }
                        }
                    }
                }
                return false;
            };
            for (var _b = 0, _c = _this.sourceTable.getCachedRows(); _b < _c.length; _b++) {
                var row = _c[_b];
                if (hasEnterance(row)) {
                    filteredTable.addRow(row);
                }
            }
            if (filteredTable.getCachedCount() == 0)
                filteredTable.setTotal(0);
            resolve(filteredTable);
        });
    };
    return TextDataFilter;
}());

//# sourceMappingURL=text_data_filter.js.map
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! es6-promise */ "../../easydata.js/packs/crud/node_modules/es6-promise/dist/es6-promise.js")["Promise"]))

/***/ }),

/***/ "../../easydata.js/packs/crud/dist/lib/form/entity_edit_form.js":
/*!*************************************************************************************!*\
  !*** c:/projects/easydata/easydata.js/packs/crud/dist/lib/form/entity_edit_form.js ***!
  \*************************************************************************************/
/*! exports provided: EntityEditForm */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "EntityEditForm", function() { return EntityEditForm; });
/* harmony import */ var _easydata_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @easydata/core */ "../../easydata.js/packs/core/dist/lib/public_api.js");
/* harmony import */ var _easydata_ui__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @easydata/ui */ "../../easydata.js/packs/ui/dist/lib/public_api.js");
/* harmony import */ var _widgets_text_filter_widget__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../widgets/text_filter_widget */ "../../easydata.js/packs/crud/dist/lib/widgets/text_filter_widget.js");
var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};



var isIE = _easydata_ui__WEBPACK_IMPORTED_MODULE_1__["browserUtils"].IsIE();
var EntityEditForm = /** @class */ (function () {
    function EntityEditForm(context, html) {
        this.context = context;
        this.html = html;
        this.validators = [];
        this.errorsDiv = html.querySelector('.errors-block');
    }
    EntityEditForm.prototype.getHtml = function () {
        return this.html;
    };
    EntityEditForm.prototype.validate = function () {
        this.clearErrors();
        var inputs = Array.from(this.html.querySelectorAll('input, select'));
        var isValid = true;
        for (var _i = 0, inputs_1 = inputs; _i < inputs_1.length; _i++) {
            var input = inputs_1[_i];
            var attr = this.context.getMetaData().getAttributeById(input.name);
            if (input.type === 'checkbox')
                continue;
            var result = this.validateValue(attr, input.value);
            if (!result.successed) {
                if (isValid) {
                    Object(_easydata_ui__WEBPACK_IMPORTED_MODULE_1__["domel"])(this.errorsDiv)
                        .addChild('ul');
                }
                isValid = false;
                for (var _a = 0, _b = result.messages; _a < _b.length; _a++) {
                    var message = _b[_a];
                    this.errorsDiv.firstElementChild.innerHTML += "<li>" + attr.caption + ": " + message + "</li>";
                }
            }
            this.markInputValid(input, result.successed);
        }
        return isValid;
    };
    EntityEditForm.prototype.getData = function () {
        var inputs = Array.from(this.html
            .querySelectorAll('input, select'));
        var obj = {};
        for (var _i = 0, inputs_2 = inputs; _i < inputs_2.length; _i++) {
            var input = inputs_2[_i];
            var property = input.name.substring(input.name.lastIndexOf('.') + 1);
            var attr = this.context.getMetaData().getAttributeById(input.name);
            obj[property] = input.type !== 'checkbox'
                ? this.mapValue(attr.dataType, input.value)
                : input.checked;
        }
        return obj;
    };
    EntityEditForm.prototype.useValidator = function () {
        var validator = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            validator[_i] = arguments[_i];
        }
        this.useValidators(validator);
    };
    EntityEditForm.prototype.useValidators = function (validators) {
        this.validators = this.validators.concat(validators);
    };
    EntityEditForm.prototype.mapValue = function (type, value) {
        if (_easydata_core__WEBPACK_IMPORTED_MODULE_0__["utils"].getDateDataTypes().indexOf(type) >= 0)
            return new Date(value);
        if (_easydata_core__WEBPACK_IMPORTED_MODULE_0__["utils"].isIntType(type))
            return parseInt(value);
        if (_easydata_core__WEBPACK_IMPORTED_MODULE_0__["utils"].isNumericType(type))
            return parseFloat(value);
        return value;
    };
    EntityEditForm.prototype.clearErrors = function () {
        this.errorsDiv.innerHTML = '';
        this.html.querySelectorAll('input, select').forEach(function (el) {
            el.classList.remove('is-valid');
            el.classList.remove('is-invalid');
        });
    };
    EntityEditForm.prototype.markInputValid = function (input, valid) {
        input.classList.add(valid ? 'is-valid' : 'is-invalid');
    };
    EntityEditForm.prototype.validateValue = function (attr, value) {
        var result = { successed: true, messages: [] };
        for (var _i = 0, _a = this.validators; _i < _a.length; _i++) {
            var validator = _a[_i];
            var res = validator.validate(attr, value);
            if (!res.successed) {
                result.successed = false;
                result.messages = result.messages.concat(res.messages);
            }
        }
        return result;
    };
    EntityEditForm.build = function (context, params) {
        params = params || {};
        var fb;
        var formHtml = Object(_easydata_ui__WEBPACK_IMPORTED_MODULE_1__["domel"])('div')
            .addClass('kfrm-form')
            .addChild('div', function (b) { return b
            .addClass("errors-block")
            .toDOM(); })
            .addChild('div', function (b) {
            b.addClass("" + (isIE
                ? 'kfrm-fields-ie col-ie-1-4 label-align-right'
                : 'kfrm-fields col-a-1 label-align-right'));
            fb = b;
        })
            .toDOM();
        var getInputType = function (dataType) {
            if (dataType == _easydata_core__WEBPACK_IMPORTED_MODULE_0__["DataType"].Bool) {
                return 'checkbox';
            }
            return 'text';
        };
        var getEditor = function (attr) {
            return attr.defaultEditor || new _easydata_core__WEBPACK_IMPORTED_MODULE_0__["MetaValueEditor"]();
        };
        var addFormField = function (parent, attr) {
            var value = params.values && attr.kind !== _easydata_core__WEBPACK_IMPORTED_MODULE_0__["EntityAttrKind"].Lookup
                ? params.values.getValue(attr.id)
                : undefined;
            var editor = getEditor(attr);
            if (editor.tag == _easydata_core__WEBPACK_IMPORTED_MODULE_0__["MetaEditorTag"].Unknown) {
                if (_easydata_core__WEBPACK_IMPORTED_MODULE_0__["utils"].getDateDataTypes().indexOf(attr.dataType) >= 0) {
                    editor.tag = _easydata_core__WEBPACK_IMPORTED_MODULE_0__["MetaEditorTag"].DateTime;
                }
                else {
                    editor.tag = _easydata_core__WEBPACK_IMPORTED_MODULE_0__["MetaEditorTag"].Edit;
                }
            }
            var readOnly = params.isEditForm && (attr.isPrimaryKey || !attr.isEditable);
            var required = !attr.isNullable;
            if (isIE) {
                parent = Object(_easydata_ui__WEBPACK_IMPORTED_MODULE_1__["domel"])('div', parent)
                    .addClass('kfrm-field-ie')
                    .toDOM();
            }
            Object(_easydata_ui__WEBPACK_IMPORTED_MODULE_1__["domel"])(parent)
                .addChild('label', function (b) { return b
                .attr('for', attr.id)
                .addHtml(attr.caption + " " + (required ? '<sup style="color: red">*</sup>' : '') + ": "); });
            if (attr.kind === _easydata_core__WEBPACK_IMPORTED_MODULE_0__["EntityAttrKind"].Lookup) {
                var lookupEntity_1 = context.getMetaData().getRootEntity()
                    .subEntities.filter(function (ent) { return ent.id == attr.lookupEntity; })[0];
                var dataAttr_1 = context.getMetaData().getAttributeById(attr.dataAttr);
                readOnly = readOnly && dataAttr_1.isEditable;
                value = params.values
                    ? params.values.getValue(dataAttr_1.id)
                    : undefined;
                var horizClass_1 = isIE
                    ? 'kfrm-fields-ie is-horizontal'
                    : 'kfrm-fields is-horizontal';
                var inputEl_1;
                Object(_easydata_ui__WEBPACK_IMPORTED_MODULE_1__["domel"])(parent)
                    .addChild('div', function (b) {
                    b
                        .addClass(horizClass_1)
                        .addChild('input', function (b) {
                        inputEl_1 = b.toDOM();
                        b.attr('readonly', '');
                        b.name(dataAttr_1.id);
                        b.type(getInputType(dataAttr_1.dataType));
                        b.value(_easydata_core__WEBPACK_IMPORTED_MODULE_0__["utils"].IsDefinedAndNotNull(value)
                            ? value.toString() : '');
                    });
                    if (!readOnly)
                        b.addChild('button', function (b) { return b
                            .addClass('kfrm-button')
                            .attr('title', _easydata_core__WEBPACK_IMPORTED_MODULE_0__["i18n"].getText('NavigationBtnTitle'))
                            .addText('...')
                            .on('click', function (ev) {
                            var lookupTable = new _easydata_core__WEBPACK_IMPORTED_MODULE_0__["EasyDataTable"]({
                                loader: {
                                    loadChunk: function (chunkParams) { return context.getDataLoader()
                                        .loadChunk(__assign({}, chunkParams, { id: lookupEntity_1.id })); }
                                }
                            });
                            context.getDataLoader()
                                .loadChunk({ offset: 0, limit: 1000, needTotal: true, entityId: lookupEntity_1.id })
                                .then(function (data) {
                                var _loop_1 = function (col) {
                                    var attrs = lookupEntity_1.attributes.filter(function (attr) {
                                        return attr.id == col.id && (attr.isPrimaryKey || attr.showInLookup);
                                    });
                                    if (attrs.length) {
                                        lookupTable.columns.add(col);
                                    }
                                };
                                for (var _i = 0, _a = data.table.columns.getItems(); _i < _a.length; _i++) {
                                    var col = _a[_i];
                                    _loop_1(col);
                                }
                                lookupTable.setTotal(data.total);
                                for (var _b = 0, _c = data.table.getCachedRows(); _b < _c.length; _b++) {
                                    var row = _c[_b];
                                    lookupTable.addRow(row);
                                }
                                var ds = new _easydata_ui__WEBPACK_IMPORTED_MODULE_1__["DefaultDialogService"]();
                                var gridSlot = null;
                                var selectedSlot = null;
                                var widgetSlot;
                                var slot = Object(_easydata_ui__WEBPACK_IMPORTED_MODULE_1__["domel"])('div')
                                    .addClass("kfrm-form")
                                    .addChild('div', function (b) { return b
                                    .addClass("kfrm-field")
                                    .addChild('label', function (b) { return b
                                    .addText(_easydata_core__WEBPACK_IMPORTED_MODULE_0__["i18n"].getText('LookupSelectedItem'))
                                    .toDOM(); })
                                    .addChild('div', function (b) { return selectedSlot = b
                                    .addText('None')
                                    .toDOM(); }); })
                                    .addChild('div', function (b) { return widgetSlot = b.toDOM(); })
                                    .addChild('div', function (b) { return b
                                    .addClass('kfrm-control')
                                    .addChild('div', function (b) { return gridSlot = b.toDOM(); }); })
                                    .toDOM();
                                var selectedValue = inputEl_1.value;
                                var getValue = function (row, colId) {
                                    if (row instanceof _easydata_core__WEBPACK_IMPORTED_MODULE_0__["DataRow"]) {
                                        return row.getValue(colId);
                                    }
                                    var property = colId.substring(colId.lastIndexOf('.') + 1);
                                    return row[property];
                                };
                                var updateSelectedValue = function (row) {
                                    selectedSlot.innerHTML = lookupTable.columns
                                        .getItems()
                                        .map(function (col) {
                                        return "<b>" + col.label + ":</b> " + getValue(row, col.id);
                                    })
                                        .join(', ');
                                };
                                context.getEntity(selectedValue, lookupEntity_1.id)
                                    .then(function (data) {
                                    if (data.entity) {
                                        updateSelectedValue(data.entity);
                                    }
                                });
                                var lookupGrid = new _easydata_ui__WEBPACK_IMPORTED_MODULE_1__["EasyGrid"]({
                                    slot: gridSlot,
                                    dataTable: lookupTable,
                                    fixHeightOnFirstRender: true,
                                    paging: {
                                        pageSize: 10
                                    },
                                    onActiveRowChanged: function (ev) {
                                        lookupGrid.getData().getRow(ev.rowIndex)
                                            .then(function (row) {
                                            selectedValue = row.getValue(attr.lookupDataAttr);
                                            updateSelectedValue(row);
                                        });
                                    }
                                });
                                ds.open({
                                    title: _easydata_core__WEBPACK_IMPORTED_MODULE_0__["i18n"].getText('LookupDlgCaption')
                                        .replace('{entity}', lookupEntity_1.caption),
                                    body: slot,
                                    arrangeParents: true,
                                    beforeOpen: function () {
                                        var dataFilter = context.createFilter(lookupEntity_1.id, lookupGrid.getData(), true);
                                        new _widgets_text_filter_widget__WEBPACK_IMPORTED_MODULE_2__["TextFilterWidget"](widgetSlot, lookupGrid, dataFilter, { instantMode: true, focus: true });
                                    },
                                    onSubmit: function () {
                                        inputEl_1.value = selectedValue;
                                        return true;
                                    },
                                    onDestroy: function () {
                                        lookupGrid.destroy();
                                    }
                                });
                            });
                        }); });
                });
                return;
            }
            switch (editor.tag) {
                case _easydata_core__WEBPACK_IMPORTED_MODULE_0__["MetaEditorTag"].DateTime:
                    Object(_easydata_ui__WEBPACK_IMPORTED_MODULE_1__["domel"])(parent)
                        .addChild('input', function (b) {
                        if (readOnly)
                            b.attr('readonly', '');
                        b.name(attr.id);
                        b.value(_easydata_core__WEBPACK_IMPORTED_MODULE_0__["utils"].IsDefinedAndNotNull(value)
                            ? new Date(value).toUTCString()
                            : '');
                        if (!readOnly)
                            b.on('focus', function (ev) {
                                var inputEl = ev.target;
                                var oldValue = inputEl.value ? new Date(inputEl.value) : new Date();
                                var pickerOptions = {
                                    showCalendar: attr.dataType !== _easydata_core__WEBPACK_IMPORTED_MODULE_0__["DataType"].Time,
                                    showTimePicker: attr.dataType !== _easydata_core__WEBPACK_IMPORTED_MODULE_0__["DataType"].Date,
                                    onApply: function (dateTime) {
                                        inputEl.value = dateTime.toUTCString();
                                    },
                                    onCancel: function () {
                                        inputEl.value = oldValue.toUTCString();
                                    },
                                    onDateTimeChanged: function (dateTime) {
                                        inputEl.value = dateTime.toUTCString();
                                    }
                                };
                                var dtp = new _easydata_ui__WEBPACK_IMPORTED_MODULE_1__["DefaultDateTimePicker"](pickerOptions);
                                dtp.setDateTime(oldValue);
                                dtp.show(inputEl);
                            });
                    });
                    break;
                case _easydata_core__WEBPACK_IMPORTED_MODULE_0__["MetaEditorTag"].List:
                    Object(_easydata_ui__WEBPACK_IMPORTED_MODULE_1__["domel"])(parent)
                        .addChild('select', function (b) {
                        if (readOnly)
                            b.attr('readonly', '');
                        b
                            .attr('name', attr.id);
                        if (editor.values) {
                            for (var i = 0; i < editor.values.length; i++) {
                                b.addOption({
                                    value: value.id,
                                    title: value.text,
                                    selected: i === 0
                                });
                            }
                        }
                    });
                case _easydata_core__WEBPACK_IMPORTED_MODULE_0__["MetaEditorTag"].Edit:
                default:
                    Object(_easydata_ui__WEBPACK_IMPORTED_MODULE_1__["domel"])(parent)
                        .addChild('input', function (b) {
                        if (readOnly)
                            b.attr('readonly', '');
                        b
                            .name(attr.id)
                            .type(getInputType(attr.dataType));
                        if (attr.dataType == _easydata_core__WEBPACK_IMPORTED_MODULE_0__["DataType"].Bool) {
                            if (value)
                                b.attr('checked', '');
                        }
                        else {
                            b.value(_easydata_core__WEBPACK_IMPORTED_MODULE_0__["utils"].IsDefinedAndNotNull(value)
                                ? value.toString()
                                : '');
                        }
                    });
                    break;
            }
        };
        for (var _i = 0, _a = context.getActiveEntity().attributes; _i < _a.length; _i++) {
            var attr = _a[_i];
            if (attr.isForeignKey)
                continue;
            addFormField(fb.toDOM(), attr);
        }
        return new EntityEditForm(context, formHtml);
    };
    return EntityEditForm;
}());

//# sourceMappingURL=entity_edit_form.js.map

/***/ }),

/***/ "../../easydata.js/packs/crud/dist/lib/i18n/text_resources.js":
/*!***********************************************************************************!*\
  !*** c:/projects/easydata/easydata.js/packs/crud/dist/lib/i18n/text_resources.js ***!
  \***********************************************************************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _easydata_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @easydata/core */ "../../easydata.js/packs/core/dist/lib/public_api.js");

function addEasyDataCRUDTexts() {
    _easydata_core__WEBPACK_IMPORTED_MODULE_0__["i18n"].updateLocaleTexts({
        RequiredError: 'Value is required.',
        NumberError: 'Value should be a number',
        IntNumberError: 'Value should be an integer number',
        LookupSelectedItem: 'Selected item: ',
        LookupDlgCaption: 'Create {entity}',
        None: 'None',
        NavigationBtnTitle: 'Navigation values',
        EditBtn: 'Edit',
        DeleteBtn: 'Delete',
        AddDlgCaption: 'Create {entity}',
        EditDlgCaption: 'Edit {entity}',
        DeleteDlgCaption: 'Delete {entity}',
        DeleteDlgMessage: 'Are you shure about removing this entity: [{entityId}]?',
        EntityMenuDesc: 'Click on an entity to view/edit its content',
        BackToEntities: 'Back to entities',
        SearchBtn: 'Search',
        SearchInputPlaceholder: 'Search...'
    });
}
addEasyDataCRUDTexts();
//# sourceMappingURL=text_resources.js.map

/***/ }),

/***/ "../../easydata.js/packs/crud/dist/lib/main/data_context.js":
/*!*********************************************************************************!*\
  !*** c:/projects/easydata/easydata.js/packs/crud/dist/lib/main/data_context.js ***!
  \*********************************************************************************/
/*! exports provided: DataContext */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DataContext", function() { return DataContext; });
/* harmony import */ var _easydata_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @easydata/core */ "../../easydata.js/packs/core/dist/lib/public_api.js");
/* harmony import */ var _filter_text_data_filter__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../filter/text_data_filter */ "../../easydata.js/packs/crud/dist/lib/filter/text_data_filter.js");
/* harmony import */ var _easy_data_server_loader__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./easy_data_server_loader */ "../../easydata.js/packs/crud/dist/lib/main/easy_data_server_loader.js");



var DataContext = /** @class */ (function () {
    function DataContext(options) {
        this.endpoints = new Map();
        this.endpointVarsRegex = /\{.*?\}/g;
        this.options = options || {};
        this.http = new _easydata_core__WEBPACK_IMPORTED_MODULE_0__["HttpClient"]();
        this.model = new _easydata_core__WEBPACK_IMPORTED_MODULE_0__["MetaData"]();
        this.model.id = options.metaDataId || '__default';
        this.dataLoader = new _easy_data_server_loader__WEBPACK_IMPORTED_MODULE_2__["EasyDataServerLoader"](this);
        this.data = new _easydata_core__WEBPACK_IMPORTED_MODULE_0__["EasyDataTable"]({
            loader: this.dataLoader
        });
        this.setDefaultEndpoints(this.options.endpoint || '/api/easydata');
    }
    DataContext.prototype.setActiveEntity = function (entityId) {
        this.activeEntity = this.model.getRootEntity().subEntities
            .filter(function (e) { return e.id == entityId; })[0];
    };
    DataContext.prototype.getMetaData = function () {
        return this.model;
    };
    DataContext.prototype.getData = function () {
        return this.data;
    };
    DataContext.prototype.getDataLoader = function () {
        return this.dataLoader;
    };
    DataContext.prototype.createFilter = function (entityId, data, isLookup) {
        return new _filter_text_data_filter__WEBPACK_IMPORTED_MODULE_1__["TextDataFilter"](this.dataLoader, data || this.getData(), entityId || this.activeEntity.id, isLookup);
    };
    DataContext.prototype.loadMetaData = function () {
        var _this = this;
        var url = this.resolveEndpoint('GetMetaData');
        this.startProcess();
        return this.http.get(url)
            .then(function (result) {
            if (result.model) {
                _this.model.loadFromData(result.model);
            }
            return _this.model;
        })
            .catch(function (error) {
            console.error("Error: " + error.message + ". Source: " + error.sourceError);
            return null;
        })
            .finally(function () {
            _this.endProcess();
        });
    };
    DataContext.prototype.getActiveEntity = function () {
        return this.activeEntity;
    };
    DataContext.prototype.getHttpClient = function () {
        return this.http;
    };
    DataContext.prototype.getEntities = function () {
        var _this = this;
        return this.dataLoader.loadChunk({ offset: 0, limit: this.data.chunkSize, needTotal: true })
            .then(function (result) {
            for (var _i = 0, _a = result.table.columns.getItems(); _i < _a.length; _i++) {
                var col = _a[_i];
                _this.data.columns.add(col);
            }
            _this.data.setTotal(result.total);
            for (var _b = 0, _c = result.table.getCachedRows(); _b < _c.length; _b++) {
                var row = _c[_b];
                _this.data.addRow(row);
            }
            return _this.data;
        });
    };
    DataContext.prototype.getEntity = function (id, entityId) {
        var _this = this;
        var url = this.resolveEndpoint('GetEntity', { id: id,
            entityId: entityId || this.activeEntity.id });
        this.startProcess();
        return this.http.get(url).getPromise()
            .finally(function () { return _this.endProcess(); });
    };
    DataContext.prototype.createEntity = function (obj, entityId) {
        var _this = this;
        var url = this.resolveEndpoint('CreateEntity', { entityId: entityId || this.activeEntity.id });
        this.startProcess();
        return this.http.post(url, obj, { dataType: 'json' }).getPromise().finally(function () { return _this.endProcess(); });
    };
    DataContext.prototype.updateEntity = function (id, obj, entityId) {
        var _this = this;
        var url = this.resolveEndpoint('UpdateEntity', { id: id,
            entityId: entityId || this.activeEntity.id });
        this.startProcess();
        return this.http.put(url, obj, { dataType: 'json' }).getPromise().finally(function () { return _this.endProcess(); });
    };
    DataContext.prototype.deleteEntity = function (id, entityId) {
        var _this = this;
        var url = this.resolveEndpoint('DeleteEntity', { id: id,
            entityId: entityId || this.activeEntity.id });
        this.startProcess();
        return this.http.delete(url).getPromise().finally(function () { return _this.endProcess(); });
    };
    DataContext.prototype.setEndpoint = function (key, value) {
        this.endpoints.set(key, value);
    };
    DataContext.prototype.setEnpointIfNotExist = function (key, value) {
        if (!this.endpoints.has(key))
            this.endpoints.set(key, value);
    };
    DataContext.prototype.resolveEndpoint = function (endpointKey, options) {
        options = options || {};
        var result = this.endpoints.get(endpointKey);
        if (!result) {
            throw endpointKey + ' endpoint is not defined';
        }
        var matches = result.match(this.endpointVarsRegex);
        if (matches) {
            for (var _i = 0, matches_1 = matches; _i < matches_1.length; _i++) {
                var match = matches_1[_i];
                var opt = match.substring(1, match.length - 1);
                var optVal = options[opt];
                if (!optVal) {
                    if (opt == 'modelId') {
                        optVal = this.model.getId();
                    }
                    else if (opt == 'entityId') {
                        optVal = this.activeEntity.id;
                    }
                    else {
                        throw "Parameter [" + opt + "] is not defined";
                    }
                }
                result = result.replace(match, optVal);
            }
        }
        return result;
    };
    DataContext.prototype.startProcess = function () {
        if (this.options.onProcessStart)
            this.options.onProcessStart();
    };
    DataContext.prototype.endProcess = function () {
        if (this.options.onProcessEnd)
            this.options.onProcessEnd();
    };
    DataContext.prototype.setDefaultEndpoints = function (endpointBase) {
        this.setEnpointIfNotExist('GetMetaData', Object(_easydata_core__WEBPACK_IMPORTED_MODULE_0__["combinePath"])(endpointBase, 'models/{modelId}'));
        this.setEnpointIfNotExist('GetEntities', Object(_easydata_core__WEBPACK_IMPORTED_MODULE_0__["combinePath"])(endpointBase, 'models/{modelId}/crud/{entityId}'));
        this.setEnpointIfNotExist('GetEntity', Object(_easydata_core__WEBPACK_IMPORTED_MODULE_0__["combinePath"])(endpointBase, 'models/{modelId}/crud/{entityId}/{id}'));
        this.setEnpointIfNotExist('CreateEntity', Object(_easydata_core__WEBPACK_IMPORTED_MODULE_0__["combinePath"])(endpointBase, 'models/{modelId}/crud/{entityId}'));
        this.setEnpointIfNotExist('UpdateEntity', Object(_easydata_core__WEBPACK_IMPORTED_MODULE_0__["combinePath"])(endpointBase, 'models/{modelId}/crud/{entityId}/{id}'));
        this.setEnpointIfNotExist('DeleteEntity', Object(_easydata_core__WEBPACK_IMPORTED_MODULE_0__["combinePath"])(endpointBase, 'models/{modelId}/crud/{entityId}/{id}'));
    };
    return DataContext;
}());

//# sourceMappingURL=data_context.js.map

/***/ }),

/***/ "../../easydata.js/packs/crud/dist/lib/main/easy_data_server_loader.js":
/*!********************************************************************************************!*\
  !*** c:/projects/easydata/easydata.js/packs/crud/dist/lib/main/easy_data_server_loader.js ***!
  \********************************************************************************************/
/*! exports provided: EasyDataServerLoader */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "EasyDataServerLoader", function() { return EasyDataServerLoader; });
/* harmony import */ var _easydata_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @easydata/core */ "../../easydata.js/packs/core/dist/lib/public_api.js");

var EasyDataServerLoader = /** @class */ (function () {
    function EasyDataServerLoader(context) {
        this.context = context;
    }
    EasyDataServerLoader.prototype.loadChunk = function (params) {
        var _this = this;
        var url = this.context.resolveEndpoint('GetEntities', { entityId: params.entityId || this.context.getActiveEntity().id });
        delete params.entityId;
        this.context.startProcess();
        var http = this.context.getHttpClient();
        return http.get(url, { queryParams: params })
            .then(function (result) {
            var dataTable = new _easydata_core__WEBPACK_IMPORTED_MODULE_0__["EasyDataTable"]({
                chunkSize: 1000
            });
            var resultSet = result.resultSet;
            for (var _i = 0, _a = resultSet.cols; _i < _a.length; _i++) {
                var col = _a[_i];
                dataTable.columns.add(col);
            }
            for (var _b = 0, _c = resultSet.rows; _b < _c.length; _b++) {
                var row = _c[_b];
                dataTable.addRow(row);
            }
            var totalRecords = 0;
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
            .finally(function () {
            _this.context.endProcess();
        });
    };
    return EasyDataServerLoader;
}());

//# sourceMappingURL=easy_data_server_loader.js.map

/***/ }),

/***/ "../../easydata.js/packs/crud/dist/lib/public_api.js":
/*!**************************************************************************!*\
  !*** c:/projects/easydata/easydata.js/packs/crud/dist/lib/public_api.js ***!
  \**************************************************************************/
/*! exports provided: TextDataFilter, EntityEditForm, TextFilterWidget, ProgressBar, DataContext, EasyDataServerLoader, Validator, TypeValidator, RequiredValidator, EasyDataViewDispatcher, RootDataView, EntityDataView */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _filter_text_data_filter__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./filter/text_data_filter */ "../../easydata.js/packs/crud/dist/lib/filter/text_data_filter.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "TextDataFilter", function() { return _filter_text_data_filter__WEBPACK_IMPORTED_MODULE_0__["TextDataFilter"]; });

/* harmony import */ var _form_entity_edit_form__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./form/entity_edit_form */ "../../easydata.js/packs/crud/dist/lib/form/entity_edit_form.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "EntityEditForm", function() { return _form_entity_edit_form__WEBPACK_IMPORTED_MODULE_1__["EntityEditForm"]; });

/* harmony import */ var _widgets_text_filter_widget__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./widgets/text_filter_widget */ "../../easydata.js/packs/crud/dist/lib/widgets/text_filter_widget.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "TextFilterWidget", function() { return _widgets_text_filter_widget__WEBPACK_IMPORTED_MODULE_2__["TextFilterWidget"]; });

/* harmony import */ var _widgets_progress_bar__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./widgets/progress_bar */ "../../easydata.js/packs/crud/dist/lib/widgets/progress_bar.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ProgressBar", function() { return _widgets_progress_bar__WEBPACK_IMPORTED_MODULE_3__["ProgressBar"]; });

/* harmony import */ var _main_data_context__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./main/data_context */ "../../easydata.js/packs/crud/dist/lib/main/data_context.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "DataContext", function() { return _main_data_context__WEBPACK_IMPORTED_MODULE_4__["DataContext"]; });

/* harmony import */ var _main_easy_data_server_loader__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./main/easy_data_server_loader */ "../../easydata.js/packs/crud/dist/lib/main/easy_data_server_loader.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "EasyDataServerLoader", function() { return _main_easy_data_server_loader__WEBPACK_IMPORTED_MODULE_5__["EasyDataServerLoader"]; });

/* harmony import */ var _validators_validator__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./validators/validator */ "../../easydata.js/packs/crud/dist/lib/validators/validator.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Validator", function() { return _validators_validator__WEBPACK_IMPORTED_MODULE_6__["Validator"]; });

/* harmony import */ var _validators_type_validator__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./validators/type_validator */ "../../easydata.js/packs/crud/dist/lib/validators/type_validator.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "TypeValidator", function() { return _validators_type_validator__WEBPACK_IMPORTED_MODULE_7__["TypeValidator"]; });

/* harmony import */ var _validators_required_validator__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./validators/required_validator */ "../../easydata.js/packs/crud/dist/lib/validators/required_validator.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "RequiredValidator", function() { return _validators_required_validator__WEBPACK_IMPORTED_MODULE_8__["RequiredValidator"]; });

/* harmony import */ var _views_easy_data_view_dispatcher__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./views/easy_data_view_dispatcher */ "../../easydata.js/packs/crud/dist/lib/views/easy_data_view_dispatcher.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "EasyDataViewDispatcher", function() { return _views_easy_data_view_dispatcher__WEBPACK_IMPORTED_MODULE_9__["EasyDataViewDispatcher"]; });

/* harmony import */ var _views_root_data_view__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./views/root_data_view */ "../../easydata.js/packs/crud/dist/lib/views/root_data_view.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "RootDataView", function() { return _views_root_data_view__WEBPACK_IMPORTED_MODULE_10__["RootDataView"]; });

/* harmony import */ var _views_entity_data_view__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./views/entity_data_view */ "../../easydata.js/packs/crud/dist/lib/views/entity_data_view.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "EntityDataView", function() { return _views_entity_data_view__WEBPACK_IMPORTED_MODULE_11__["EntityDataView"]; });

/* harmony import */ var _i18n_text_resources__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./i18n/text_resources */ "../../easydata.js/packs/crud/dist/lib/i18n/text_resources.js");













//# sourceMappingURL=public_api.js.map

/***/ }),

/***/ "../../easydata.js/packs/crud/dist/lib/validators/required_validator.js":
/*!*********************************************************************************************!*\
  !*** c:/projects/easydata/easydata.js/packs/crud/dist/lib/validators/required_validator.js ***!
  \*********************************************************************************************/
/*! exports provided: RequiredValidator */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RequiredValidator", function() { return RequiredValidator; });
/* harmony import */ var _easydata_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @easydata/core */ "../../easydata.js/packs/core/dist/lib/public_api.js");
/* harmony import */ var _validator__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./validator */ "../../easydata.js/packs/crud/dist/lib/validators/validator.js");
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();


var RequiredValidator = /** @class */ (function (_super) {
    __extends(RequiredValidator, _super);
    function RequiredValidator() {
        var _this = _super.call(this) || this;
        _this.name = 'Required';
        return _this;
    }
    RequiredValidator.prototype.validate = function (attr, value) {
        if (!attr.isNullable && (!_easydata_core__WEBPACK_IMPORTED_MODULE_0__["utils"].IsDefinedAndNotNull(value)
            || value === ''))
            return {
                successed: false,
                messages: [_easydata_core__WEBPACK_IMPORTED_MODULE_0__["i18n"].getText('RequiredError')]
            };
        return { successed: true };
    };
    return RequiredValidator;
}(_validator__WEBPACK_IMPORTED_MODULE_1__["Validator"]));

//# sourceMappingURL=required_validator.js.map

/***/ }),

/***/ "../../easydata.js/packs/crud/dist/lib/validators/type_validator.js":
/*!*****************************************************************************************!*\
  !*** c:/projects/easydata/easydata.js/packs/crud/dist/lib/validators/type_validator.js ***!
  \*****************************************************************************************/
/*! exports provided: TypeValidator */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TypeValidator", function() { return TypeValidator; });
/* harmony import */ var _easydata_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @easydata/core */ "../../easydata.js/packs/core/dist/lib/public_api.js");
/* harmony import */ var _validator__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./validator */ "../../easydata.js/packs/crud/dist/lib/validators/validator.js");
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();


var TypeValidator = /** @class */ (function (_super) {
    __extends(TypeValidator, _super);
    function TypeValidator() {
        var _this = _super.call(this) || this;
        _this.name = 'Type';
        return _this;
    }
    TypeValidator.prototype.validate = function (attr, value) {
        if (!_easydata_core__WEBPACK_IMPORTED_MODULE_0__["utils"].IsDefinedAndNotNull(value) || value == '')
            return { successed: true };
        if (_easydata_core__WEBPACK_IMPORTED_MODULE_0__["utils"].isNumericType(attr.dataType)) {
            if (!_easydata_core__WEBPACK_IMPORTED_MODULE_0__["utils"].isNumeric(value))
                return {
                    successed: false,
                    messages: [_easydata_core__WEBPACK_IMPORTED_MODULE_0__["i18n"].getText('NumberError')]
                };
            if (_easydata_core__WEBPACK_IMPORTED_MODULE_0__["utils"].isIntType(attr.dataType)
                && !Number.isInteger(Number.parseFloat(value))) {
                return {
                    successed: false,
                    messages: [_easydata_core__WEBPACK_IMPORTED_MODULE_0__["i18n"].getText('IntNumberError')]
                };
            }
        }
        return { successed: true };
    };
    return TypeValidator;
}(_validator__WEBPACK_IMPORTED_MODULE_1__["Validator"]));

//# sourceMappingURL=type_validator.js.map

/***/ }),

/***/ "../../easydata.js/packs/crud/dist/lib/validators/validator.js":
/*!************************************************************************************!*\
  !*** c:/projects/easydata/easydata.js/packs/crud/dist/lib/validators/validator.js ***!
  \************************************************************************************/
/*! exports provided: Validator */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Validator", function() { return Validator; });
var Validator = /** @class */ (function () {
    function Validator() {
    }
    return Validator;
}());

//# sourceMappingURL=validator.js.map

/***/ }),

/***/ "../../easydata.js/packs/crud/dist/lib/views/easy_data_view_dispatcher.js":
/*!***********************************************************************************************!*\
  !*** c:/projects/easydata/easydata.js/packs/crud/dist/lib/views/easy_data_view_dispatcher.js ***!
  \***********************************************************************************************/
/*! exports provided: EasyDataViewDispatcher */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "EasyDataViewDispatcher", function() { return EasyDataViewDispatcher; });
/* harmony import */ var _widgets_progress_bar__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../widgets/progress_bar */ "../../easydata.js/packs/crud/dist/lib/widgets/progress_bar.js");
/* harmony import */ var _main_data_context__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../main/data_context */ "../../easydata.js/packs/crud/dist/lib/main/data_context.js");
/* harmony import */ var _entity_data_view__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./entity_data_view */ "../../easydata.js/packs/crud/dist/lib/views/entity_data_view.js");
/* harmony import */ var _root_data_view__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./root_data_view */ "../../easydata.js/packs/crud/dist/lib/views/root_data_view.js");




var EasyDataViewDispatcher = /** @class */ (function () {
    function EasyDataViewDispatcher(options) {
        this.options = options;
        options = options || {};
        this.setContainer(options.container);
        var progressBarSlot = document.createElement('div');
        var bar = new _widgets_progress_bar__WEBPACK_IMPORTED_MODULE_0__["ProgressBar"](progressBarSlot);
        var parent = this.container.parentElement;
        parent.insertBefore(progressBarSlot, parent.firstElementChild);
        this.context = new _main_data_context__WEBPACK_IMPORTED_MODULE_1__["DataContext"]({
            onProcessStart: function () { return bar.show(); },
            onProcessEnd: function () { return bar.hide(); }
        });
        this.basePath = this.getBasePath();
    }
    EasyDataViewDispatcher.prototype.setContainer = function (container) {
        if (!container) {
            this.container = document.getElementById('EasyDataContainer');
            return;
        }
        if (typeof container === 'string') {
            if (container.length) {
                if (container[0] === '#') {
                    this.container = document.getElementById(container.substring(1));
                }
                else if (container[0] === '.') {
                    var result = document.getElementsByClassName(container.substring(1));
                    if (result.length)
                        this.container = result[0];
                }
                else {
                    throw Error('Unrecognized container parameter ' +
                        '(Must be id, class or HTMLElement): ' + container);
                }
            }
        }
        else {
            this.container = container;
        }
    };
    EasyDataViewDispatcher.prototype.getActiveEntityId = function () {
        var decodedUrl = decodeURIComponent(window.location.href);
        var splitIndex = decodedUrl.lastIndexOf('/');
        var typeName = decodedUrl.substring(splitIndex + 1);
        return typeName && typeName.toLocaleLowerCase() !== 'easydata'
            ? typeName
            : null;
    };
    EasyDataViewDispatcher.prototype.getBasePath = function () {
        var decodedUrl = decodeURIComponent(window.location.href);
        var easyDataIndex = decodedUrl.indexOf('easydata');
        return decodedUrl.substring(0, easyDataIndex + 'easydata'.length);
    };
    EasyDataViewDispatcher.prototype.run = function () {
        var _this = this;
        return this.context.loadMetaData()
            .then(function (metaData) {
            var activeEntityId = _this.getActiveEntityId();
            if (activeEntityId) {
                _this.context.setActiveEntity(activeEntityId);
                new _entity_data_view__WEBPACK_IMPORTED_MODULE_2__["EntityDataView"](_this.container, _this.context, _this.basePath, _this.options);
            }
            else {
                new _root_data_view__WEBPACK_IMPORTED_MODULE_3__["RootDataView"](_this.container, _this.context, _this.basePath);
            }
        });
    };
    return EasyDataViewDispatcher;
}());

//# sourceMappingURL=easy_data_view_dispatcher.js.map

/***/ }),

/***/ "../../easydata.js/packs/crud/dist/lib/views/entity_data_view.js":
/*!**************************************************************************************!*\
  !*** c:/projects/easydata/easydata.js/packs/crud/dist/lib/views/entity_data_view.js ***!
  \**************************************************************************************/
/*! exports provided: EntityDataView */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "EntityDataView", function() { return EntityDataView; });
/* harmony import */ var _easydata_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @easydata/core */ "../../easydata.js/packs/core/dist/lib/public_api.js");
/* harmony import */ var _easydata_ui__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @easydata/ui */ "../../easydata.js/packs/ui/dist/lib/public_api.js");
/* harmony import */ var _form_entity_edit_form__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../form/entity_edit_form */ "../../easydata.js/packs/crud/dist/lib/form/entity_edit_form.js");
/* harmony import */ var _widgets_text_filter_widget__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../widgets/text_filter_widget */ "../../easydata.js/packs/crud/dist/lib/widgets/text_filter_widget.js");
/* harmony import */ var _validators_required_validator__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../validators/required_validator */ "../../easydata.js/packs/crud/dist/lib/validators/required_validator.js");
/* harmony import */ var _validators_type_validator__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../validators/type_validator */ "../../easydata.js/packs/crud/dist/lib/validators/type_validator.js");






var EntityDataView = /** @class */ (function () {
    function EntityDataView(slot, context, basePath, options) {
        this.slot = slot;
        this.context = context;
        this.basePath = basePath;
        this.options = {
            showBackToEntities: true
        };
        this.defaultValidators = [new _validators_required_validator__WEBPACK_IMPORTED_MODULE_4__["RequiredValidator"](), new _validators_type_validator__WEBPACK_IMPORTED_MODULE_5__["TypeValidator"]()];
        options = options || {};
        this.options = _easydata_core__WEBPACK_IMPORTED_MODULE_0__["utils"].assignDeep(this.options, options || {});
        this.dlg = new _easydata_ui__WEBPACK_IMPORTED_MODULE_1__["DefaultDialogService"]();
        var ent = this.context.getActiveEntity();
        this.slot.innerHTML += "<h1>" + (ent.captionPlural || ent.caption) + "</h1>";
        if (this.options.showBackToEntities) {
            this.slot.innerHTML += "<a href=\"" + this.basePath + "\"> \u2190 " + _easydata_core__WEBPACK_IMPORTED_MODULE_0__["i18n"].getText('BackToEntities') + "</a>";
        }
        this.renderGrid();
    }
    EntityDataView.prototype.syncGridColumnHandler = function (column) {
        if (column.dataColumn) {
            var attr = this.context.getMetaData().getAttributeById(column.dataColumn.id);
            if (attr) {
                column.isVisible = attr.isVisible;
            }
        }
    };
    EntityDataView.prototype.renderGrid = function () {
        var _this = this;
        this.context.getEntities()
            .then(function (result) {
            console.log("Result", result);
            var gridSlot = document.createElement('div');
            _this.slot.appendChild(gridSlot);
            gridSlot.id = 'Grid';
            console.log(gridSlot);
            _this.grid = new _easydata_ui__WEBPACK_IMPORTED_MODULE_1__["EasyGrid"]({
                slot: gridSlot,
                dataTable: result,
                paging: {
                    pageSize: 15,
                },
                addColumns: true,
                showActiveRow: false,
                onAddColumnClick: _this.addClickHandler.bind(_this),
                onGetCellRenderer: _this.manageCellRenderer.bind(_this),
                onRowDbClick: _this.rowDbClickHandler.bind(_this),
                onSyncGridColumn: _this.syncGridColumnHandler.bind(_this)
            });
            var widgetSlot;
            var filterBar = Object(_easydata_ui__WEBPACK_IMPORTED_MODULE_1__["domel"])('div')
                .addClass("kfrm-form")
                .setStyle('margin', '10px 0px')
                .addChild('div', function (b) {
                return widgetSlot = b.toDOM();
            }).toDOM();
            _this.slot.insertBefore(filterBar, gridSlot);
            var dataFilter = _this.context.createFilter();
            new _widgets_text_filter_widget__WEBPACK_IMPORTED_MODULE_3__["TextFilterWidget"](widgetSlot, _this.grid, dataFilter);
        });
    };
    EntityDataView.prototype.manageCellRenderer = function (column, defaultRenderer) {
        var _this = this;
        if (column.isRowNum) {
            column.width = 110;
            return function (value, column, cell, rowEl) {
                Object(_easydata_ui__WEBPACK_IMPORTED_MODULE_1__["domel"])('div', cell)
                    .addClass("keg-cell-value")
                    .addChild('a', function (b) { return b
                    .attr('href', 'javascript:void(0)')
                    .text(_easydata_core__WEBPACK_IMPORTED_MODULE_0__["i18n"].getText('EditBtn'))
                    .on('click', function (ev) { return _this.editClickHandler(ev, parseInt(rowEl.getAttribute('data-row-idx'))); }); })
                    .addChild('span', function (b) { return b.text(' | '); })
                    .addChild('a', function (b) { return b
                    .attr('href', 'javascript:void(0)')
                    .text(_easydata_core__WEBPACK_IMPORTED_MODULE_0__["i18n"].getText('DeleteBtn'))
                    .on('click', function (ev) {
                    return _this.deleteClickHandler(ev, parseInt(rowEl.getAttribute('data-row-idx')));
                }); });
            };
        }
    };
    EntityDataView.prototype.addClickHandler = function () {
        var _this = this;
        var activeEntity = this.context.getActiveEntity();
        var form = _form_entity_edit_form__WEBPACK_IMPORTED_MODULE_2__["EntityEditForm"].build(this.context);
        form.useValidators(this.defaultValidators);
        this.dlg.open({
            title: _easydata_core__WEBPACK_IMPORTED_MODULE_0__["i18n"].getText('AddDlgCaption')
                .replace('{entity}', activeEntity.caption),
            body: form.getHtml(),
            onSubmit: function () {
                if (!form.validate())
                    return false;
                var obj = form.getData();
                _this.context.createEntity(obj)
                    .then(function () {
                    window.location.reload();
                })
                    .catch(function (error) {
                    _this.processError(error);
                });
            }
        });
    };
    EntityDataView.prototype.editClickHandler = function (ev, rowIndex) {
        var _this = this;
        this.context.getData().getRow(rowIndex)
            .then(function (row) {
            if (row) {
                _this.showEditForm(row);
            }
        });
    };
    EntityDataView.prototype.showEditForm = function (row) {
        var _this = this;
        var activeEntity = this.context.getActiveEntity();
        var form = _form_entity_edit_form__WEBPACK_IMPORTED_MODULE_2__["EntityEditForm"].build(this.context, { isEditForm: true, values: row });
        form.useValidators(this.defaultValidators);
        this.dlg.open({
            title: _easydata_core__WEBPACK_IMPORTED_MODULE_0__["i18n"].getText('EditDlgCaption')
                .replace('{entity}', activeEntity.caption),
            body: form.getHtml(),
            onSubmit: function () {
                var keyAttrs = activeEntity.attributes.filter(function (attr) { return attr.isPrimaryKey; });
                var keys = keyAttrs.map(function (attr) { return row.getValue(attr.id); });
                if (!form.validate())
                    return false;
                var obj = form.getData();
                _this.context.updateEntity(keys.join(':'), obj)
                    .then(function () {
                    window.location.reload();
                })
                    .catch(function (error) {
                    _this.processError(error);
                });
            }
        });
    };
    EntityDataView.prototype.rowDbClickHandler = function (ev) {
        this.showEditForm(ev.row);
    };
    EntityDataView.prototype.deleteClickHandler = function (ev, rowIndex) {
        var _this = this;
        this.context.getData().getRow(rowIndex)
            .then(function (row) {
            if (row) {
                var activeEntity = _this.context.getActiveEntity();
                var keyAttrs = activeEntity.attributes.filter(function (attr) { return attr.isPrimaryKey; });
                var keys_1 = keyAttrs.map(function (attr) { return row.getValue(attr.id); });
                var entityId = keyAttrs.map(function (attr, index) { return attr.id + ":" + keys_1[index]; }).join(';');
                _this.dlg.openConfirm(_easydata_core__WEBPACK_IMPORTED_MODULE_0__["i18n"].getText('DeleteDlgCaption')
                    .replace('{entity}', activeEntity.caption), _easydata_core__WEBPACK_IMPORTED_MODULE_0__["i18n"].getText('DeleteDlgMessage')
                    .replace('{entityId}', entityId))
                    .then(function (result) {
                    if (result) {
                        //pass entityId in future
                        _this.context.deleteEntity(keys_1.join(':'))
                            .then(function () {
                            window.location.reload();
                        })
                            .catch(function (error) {
                            _this.processError(error);
                        });
                    }
                });
            }
        });
    };
    EntityDataView.prototype.processError = function (error) {
        this.dlg.open({
            title: 'Ooops, smth went wrong',
            body: error.message,
            closable: true,
            cancelable: false
        });
    };
    return EntityDataView;
}());

//# sourceMappingURL=entity_data_view.js.map

/***/ }),

/***/ "../../easydata.js/packs/crud/dist/lib/views/root_data_view.js":
/*!************************************************************************************!*\
  !*** c:/projects/easydata/easydata.js/packs/crud/dist/lib/views/root_data_view.js ***!
  \************************************************************************************/
/*! exports provided: RootDataView */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RootDataView", function() { return RootDataView; });
/* harmony import */ var _easydata_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @easydata/core */ "../../easydata.js/packs/core/dist/lib/public_api.js");
/* harmony import */ var _easydata_ui__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @easydata/ui */ "../../easydata.js/packs/ui/dist/lib/public_api.js");


var RootDataView = /** @class */ (function () {
    function RootDataView(slot, context, basePath) {
        this.slot = slot;
        this.context = context;
        this.basePath = basePath;
        this.metaData = this.context.getMetaData();
        this.slot.innerHTML = "<h1>" + this.metaData.getId() + "</h1>";
        this.renderEntitySelector();
    }
    RootDataView.prototype.renderEntitySelector = function () {
        var _this = this;
        var entities = this.metaData.getRootEntity().subEntities;
        if (this.slot) {
            Object(_easydata_ui__WEBPACK_IMPORTED_MODULE_1__["domel"])(this.slot)
                .addChild('div', function (b) { return b
                .addClass('ed-root')
                .addChild('div', function (b) { return b
                .addClass('ed-menu-description')
                .addText(_easydata_core__WEBPACK_IMPORTED_MODULE_0__["i18n"].getText('EntityMenuDesc')); })
                .addChild('ul', function (b) {
                b.addClass('ed-entity-menu');
                entities.forEach(function (ent) {
                    b.addChild('li', function (b) {
                        b.addClass('ed-entity-item')
                            .on('click', function () {
                            _this.context.startProcess();
                            window.location.href = _this.basePath + "/" + ent.id;
                        })
                            .addChild('div', function (b) {
                            b.addClass('ed-entity-item-caption')
                                .addText(ent.captionPlural || ent.caption);
                        });
                        if (ent.description) {
                            b.addChild('div', function (b) {
                                b.addClass('ed-entity-item-descr')
                                    .addText("*&nbsp;" + ent.description);
                            });
                        }
                    });
                });
            }); });
        }
    };
    return RootDataView;
}());

//# sourceMappingURL=root_data_view.js.map

/***/ }),

/***/ "../../easydata.js/packs/crud/dist/lib/widgets/progress_bar.js":
/*!************************************************************************************!*\
  !*** c:/projects/easydata/easydata.js/packs/crud/dist/lib/widgets/progress_bar.js ***!
  \************************************************************************************/
/*! exports provided: ProgressBar */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ProgressBar", function() { return ProgressBar; });
var ProgressBar = /** @class */ (function () {
    function ProgressBar(slot) {
        this.slot = slot;
        this.hide();
        this.slot.classList.add('ed-progress-bar');
    }
    ProgressBar.prototype.show = function () {
        this.slot.style.removeProperty('display');
    };
    ProgressBar.prototype.hide = function () {
        this.slot.style.display = 'none';
    };
    return ProgressBar;
}());

//# sourceMappingURL=progress_bar.js.map

/***/ }),

/***/ "../../easydata.js/packs/crud/dist/lib/widgets/text_filter_widget.js":
/*!******************************************************************************************!*\
  !*** c:/projects/easydata/easydata.js/packs/crud/dist/lib/widgets/text_filter_widget.js ***!
  \******************************************************************************************/
/*! exports provided: TextFilterWidget */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TextFilterWidget", function() { return TextFilterWidget; });
/* harmony import */ var _easydata_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @easydata/core */ "../../easydata.js/packs/core/dist/lib/public_api.js");
/* harmony import */ var _easydata_ui__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @easydata/ui */ "../../easydata.js/packs/ui/dist/lib/public_api.js");


var TextFilterWidget = /** @class */ (function () {
    function TextFilterWidget(slot, grid, filter, options) {
        var _this = this;
        this.slot = slot;
        this.grid = grid;
        this.filter = filter;
        this.options = {
            focus: false,
            instantMode: false,
            instantTimeout: 1000
        };
        this.options = _easydata_core__WEBPACK_IMPORTED_MODULE_0__["utils"].assignDeep(this.options, options || {});
        var stringDefRenderer = this.grid.cellRendererStore
            .getDefaultRendererByType(_easydata_ui__WEBPACK_IMPORTED_MODULE_1__["CellRendererType"].STRING);
        this.grid.cellRendererStore
            .setDefaultRenderer(_easydata_ui__WEBPACK_IMPORTED_MODULE_1__["CellRendererType"].STRING, function (value, column, cellElement, rowElement) {
            return _this.highlightCellRenderer(stringDefRenderer, value, column, cellElement, rowElement);
        });
        var numDefRenderer = this.grid.cellRendererStore
            .getDefaultRendererByType(_easydata_ui__WEBPACK_IMPORTED_MODULE_1__["CellRendererType"].NUMBER);
        this.grid.cellRendererStore
            .setDefaultRenderer(_easydata_ui__WEBPACK_IMPORTED_MODULE_1__["CellRendererType"].NUMBER, function (value, column, cellElement, rowElement) {
            return _this.highlightCellRenderer(numDefRenderer, value, column, cellElement, rowElement);
        });
        this.render();
    }
    TextFilterWidget.prototype.render = function () {
        var _this = this;
        var horizClass = _easydata_ui__WEBPACK_IMPORTED_MODULE_1__["browserUtils"].IsIE()
            ? 'kfrm-fields-ie is-horizontal'
            : 'kfrm-fields is-horizontal';
        var isEdgeOrIE = _easydata_ui__WEBPACK_IMPORTED_MODULE_1__["browserUtils"].IsIE() || _easydata_ui__WEBPACK_IMPORTED_MODULE_1__["browserUtils"].IsEdge();
        Object(_easydata_ui__WEBPACK_IMPORTED_MODULE_1__["domel"])(this.slot)
            .addClass(horizClass)
            .addChild('div', function (b) {
            b
                .addClass('control')
                .addChild('input', function (b) {
                _this.filterInput = b.toDOM();
                b
                    .attr('placeholder', _easydata_core__WEBPACK_IMPORTED_MODULE_0__["i18n"].getText('SearchInputPlaceholder'))
                    .type('text');
                b.on('keydown', _this.inputKeydownHandler.bind(_this));
                if (_this.options.instantMode) {
                    b.on('keyup', _this.inputKeyupHandler.bind(_this));
                }
            });
            if (!isEdgeOrIE) {
                b
                    .addClass('has-icons-right')
                    .addChild('span', function (b) {
                    b
                        .addClass('icon')
                        .addClass('is-right')
                        .addClass('is-clickable')
                        .html('&#x1F5D9;')
                        .on('click', _this.clearButtonClickHander.bind(_this));
                });
            }
        });
        if (!this.options.instantMode) {
            Object(_easydata_ui__WEBPACK_IMPORTED_MODULE_1__["domel"])(this.slot)
                .addChild('button', function (b) { return b
                .addClass('kfrm-button')
                .addText(_easydata_core__WEBPACK_IMPORTED_MODULE_0__["i18n"].getText('SearchBtn'))
                .on('click', _this.searchButtonClickHandler.bind(_this)); });
        }
        if (this.options.focus) {
            this.filterInput.focus();
        }
    };
    TextFilterWidget.prototype.inputKeydownHandler = function (ev) {
        if (ev.keyCode == 13) {
            this.applyFilter();
        }
    };
    TextFilterWidget.prototype.inputKeyupHandler = function () {
        var _this = this;
        if (this.applyFilterTimeout) {
            clearTimeout(this.applyFilterTimeout);
        }
        this.applyFilterTimeout = setTimeout(function () {
            _this.applyFilter();
        }, this.options.instantTimeout);
    };
    TextFilterWidget.prototype.clearButtonClickHander = function () {
        this.filterInput.value = '';
        this.filterInput.focus();
        this.applyFilter();
    };
    TextFilterWidget.prototype.searchButtonClickHandler = function () {
        this.applyFilter();
    };
    TextFilterWidget.prototype.applyFilter = function () {
        var _this = this;
        if (this.applyFilterTimeout) {
            clearTimeout(this.applyFilterTimeout);
        }
        var filterValue = this.filter.getValue();
        if (filterValue != this.filterInput.value) {
            this.filter.apply(this.filterInput.value)
                .then(function (data) {
                _this.grid.setData(data);
            });
        }
    };
    TextFilterWidget.prototype.highlightCellRenderer = function (defaultRenderer, value, column, cellElement, rowElement) {
        if (_easydata_core__WEBPACK_IMPORTED_MODULE_0__["utils"].isIntType(column.type)
            || _easydata_core__WEBPACK_IMPORTED_MODULE_0__["utils"].getStringDataTypes().indexOf(column.type) >= 0) {
            if (value) {
                if (typeof value == 'number') {
                    value = value.toLocaleString();
                }
                value = this.highlightText(value.toString());
            }
        }
        defaultRenderer(value, column, cellElement, rowElement);
    };
    TextFilterWidget.prototype.highlightText = function (content) {
        var normalizedContent = content.toLowerCase();
        var filterValue = this.filter.getValue().toString();
        if (filterValue && filterValue.length > 0 && content && content.length > 0) {
            var insertValue1 = "<span style='background-color: yellow'>";
            var insertValue2 = "</span>";
            var indexInMas = [];
            var words = filterValue.split('||').map(function (w) { return w.trim().toLowerCase(); });
            for (var i = 0; i < words.length; i++) {
                var pos = 0;
                var lowerWord = words[i];
                if (!lowerWord.length)
                    continue;
                if (lowerWord === normalizedContent) {
                    return insertValue1 + content + insertValue2;
                }
                while (pos < content.length - 1) {
                    var index = normalizedContent.indexOf(lowerWord, pos);
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
                indexInMas.sort(function (item1, item2) {
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
                for (var i = 0; i < indexInMas.length - 1;) {
                    var delta = indexInMas[i + 1].index - (indexInMas[i].index + indexInMas[i].length);
                    if (delta < 0) {
                        var addDelta = indexInMas[i + 1].length + delta;
                        if (addDelta > 0) {
                            indexInMas[i].length += addDelta;
                        }
                        indexInMas.splice(i + 1, 1);
                    }
                    else {
                        i++;
                    }
                }
                var result = '';
                for (var i = 0; i < indexInMas.length; i++) {
                    if (i === 0) {
                        result += content.substring(0, indexInMas[i].index);
                    }
                    result += insertValue1
                        + content.substring(indexInMas[i].index, indexInMas[i].index + indexInMas[i].length)
                        + insertValue2;
                    if (i < indexInMas.length - 1) {
                        result += content.substring(indexInMas[i].index
                            + indexInMas[i].length, indexInMas[i + 1].index);
                    }
                    else {
                        result += content.substring(indexInMas[i].index
                            + indexInMas[i].length);
                    }
                }
                content = result;
            }
        }
        return content;
    };
    return TextFilterWidget;
}());

//# sourceMappingURL=text_filter_widget.js.map

/***/ }),

/***/ "../../easydata.js/packs/crud/node_modules/es6-promise/dist/es6-promise.js":
/*!************************************************************************************************!*\
  !*** c:/projects/easydata/easydata.js/packs/crud/node_modules/es6-promise/dist/es6-promise.js ***!
  \************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process, global) {/*!
 * @overview es6-promise - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/stefanpenner/es6-promise/master/LICENSE
 * @version   v4.2.8+1e68dce6
 */

(function (global, factory) {
	 true ? module.exports = factory() :
	undefined;
}(this, (function () { 'use strict';

function objectOrFunction(x) {
  var type = typeof x;
  return x !== null && (type === 'object' || type === 'function');
}

function isFunction(x) {
  return typeof x === 'function';
}



var _isArray = void 0;
if (Array.isArray) {
  _isArray = Array.isArray;
} else {
  _isArray = function (x) {
    return Object.prototype.toString.call(x) === '[object Array]';
  };
}

var isArray = _isArray;

var len = 0;
var vertxNext = void 0;
var customSchedulerFn = void 0;

var asap = function asap(callback, arg) {
  queue[len] = callback;
  queue[len + 1] = arg;
  len += 2;
  if (len === 2) {
    // If len is 2, that means that we need to schedule an async flush.
    // If additional callbacks are queued before the queue is flushed, they
    // will be processed by this flush that we are scheduling.
    if (customSchedulerFn) {
      customSchedulerFn(flush);
    } else {
      scheduleFlush();
    }
  }
};

function setScheduler(scheduleFn) {
  customSchedulerFn = scheduleFn;
}

function setAsap(asapFn) {
  asap = asapFn;
}

var browserWindow = typeof window !== 'undefined' ? window : undefined;
var browserGlobal = browserWindow || {};
var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
var isNode = typeof self === 'undefined' && typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';

// test for web worker but not in IE10
var isWorker = typeof Uint8ClampedArray !== 'undefined' && typeof importScripts !== 'undefined' && typeof MessageChannel !== 'undefined';

// node
function useNextTick() {
  // node version 0.10.x displays a deprecation warning when nextTick is used recursively
  // see https://github.com/cujojs/when/issues/410 for details
  return function () {
    return process.nextTick(flush);
  };
}

// vertx
function useVertxTimer() {
  if (typeof vertxNext !== 'undefined') {
    return function () {
      vertxNext(flush);
    };
  }

  return useSetTimeout();
}

function useMutationObserver() {
  var iterations = 0;
  var observer = new BrowserMutationObserver(flush);
  var node = document.createTextNode('');
  observer.observe(node, { characterData: true });

  return function () {
    node.data = iterations = ++iterations % 2;
  };
}

// web worker
function useMessageChannel() {
  var channel = new MessageChannel();
  channel.port1.onmessage = flush;
  return function () {
    return channel.port2.postMessage(0);
  };
}

function useSetTimeout() {
  // Store setTimeout reference so es6-promise will be unaffected by
  // other code modifying setTimeout (like sinon.useFakeTimers())
  var globalSetTimeout = setTimeout;
  return function () {
    return globalSetTimeout(flush, 1);
  };
}

var queue = new Array(1000);
function flush() {
  for (var i = 0; i < len; i += 2) {
    var callback = queue[i];
    var arg = queue[i + 1];

    callback(arg);

    queue[i] = undefined;
    queue[i + 1] = undefined;
  }

  len = 0;
}

function attemptVertx() {
  try {
    var vertx = Function('return this')().require('vertx');
    vertxNext = vertx.runOnLoop || vertx.runOnContext;
    return useVertxTimer();
  } catch (e) {
    return useSetTimeout();
  }
}

var scheduleFlush = void 0;
// Decide what async method to use to triggering processing of queued callbacks:
if (isNode) {
  scheduleFlush = useNextTick();
} else if (BrowserMutationObserver) {
  scheduleFlush = useMutationObserver();
} else if (isWorker) {
  scheduleFlush = useMessageChannel();
} else if (browserWindow === undefined && "function" === 'function') {
  scheduleFlush = attemptVertx();
} else {
  scheduleFlush = useSetTimeout();
}

function then(onFulfillment, onRejection) {
  var parent = this;

  var child = new this.constructor(noop);

  if (child[PROMISE_ID] === undefined) {
    makePromise(child);
  }

  var _state = parent._state;


  if (_state) {
    var callback = arguments[_state - 1];
    asap(function () {
      return invokeCallback(_state, child, callback, parent._result);
    });
  } else {
    subscribe(parent, child, onFulfillment, onRejection);
  }

  return child;
}

/**
  `Promise.resolve` returns a promise that will become resolved with the
  passed `value`. It is shorthand for the following:

  ```javascript
  let promise = new Promise(function(resolve, reject){
    resolve(1);
  });

  promise.then(function(value){
    // value === 1
  });
  ```

  Instead of writing the above, your code now simply becomes the following:

  ```javascript
  let promise = Promise.resolve(1);

  promise.then(function(value){
    // value === 1
  });
  ```

  @method resolve
  @static
  @param {Any} value value that the returned promise will be resolved with
  Useful for tooling.
  @return {Promise} a promise that will become fulfilled with the given
  `value`
*/
function resolve$1(object) {
  /*jshint validthis:true */
  var Constructor = this;

  if (object && typeof object === 'object' && object.constructor === Constructor) {
    return object;
  }

  var promise = new Constructor(noop);
  resolve(promise, object);
  return promise;
}

var PROMISE_ID = Math.random().toString(36).substring(2);

function noop() {}

var PENDING = void 0;
var FULFILLED = 1;
var REJECTED = 2;

function selfFulfillment() {
  return new TypeError("You cannot resolve a promise with itself");
}

function cannotReturnOwn() {
  return new TypeError('A promises callback cannot return that same promise.');
}

function tryThen(then$$1, value, fulfillmentHandler, rejectionHandler) {
  try {
    then$$1.call(value, fulfillmentHandler, rejectionHandler);
  } catch (e) {
    return e;
  }
}

function handleForeignThenable(promise, thenable, then$$1) {
  asap(function (promise) {
    var sealed = false;
    var error = tryThen(then$$1, thenable, function (value) {
      if (sealed) {
        return;
      }
      sealed = true;
      if (thenable !== value) {
        resolve(promise, value);
      } else {
        fulfill(promise, value);
      }
    }, function (reason) {
      if (sealed) {
        return;
      }
      sealed = true;

      reject(promise, reason);
    }, 'Settle: ' + (promise._label || ' unknown promise'));

    if (!sealed && error) {
      sealed = true;
      reject(promise, error);
    }
  }, promise);
}

function handleOwnThenable(promise, thenable) {
  if (thenable._state === FULFILLED) {
    fulfill(promise, thenable._result);
  } else if (thenable._state === REJECTED) {
    reject(promise, thenable._result);
  } else {
    subscribe(thenable, undefined, function (value) {
      return resolve(promise, value);
    }, function (reason) {
      return reject(promise, reason);
    });
  }
}

function handleMaybeThenable(promise, maybeThenable, then$$1) {
  if (maybeThenable.constructor === promise.constructor && then$$1 === then && maybeThenable.constructor.resolve === resolve$1) {
    handleOwnThenable(promise, maybeThenable);
  } else {
    if (then$$1 === undefined) {
      fulfill(promise, maybeThenable);
    } else if (isFunction(then$$1)) {
      handleForeignThenable(promise, maybeThenable, then$$1);
    } else {
      fulfill(promise, maybeThenable);
    }
  }
}

function resolve(promise, value) {
  if (promise === value) {
    reject(promise, selfFulfillment());
  } else if (objectOrFunction(value)) {
    var then$$1 = void 0;
    try {
      then$$1 = value.then;
    } catch (error) {
      reject(promise, error);
      return;
    }
    handleMaybeThenable(promise, value, then$$1);
  } else {
    fulfill(promise, value);
  }
}

function publishRejection(promise) {
  if (promise._onerror) {
    promise._onerror(promise._result);
  }

  publish(promise);
}

function fulfill(promise, value) {
  if (promise._state !== PENDING) {
    return;
  }

  promise._result = value;
  promise._state = FULFILLED;

  if (promise._subscribers.length !== 0) {
    asap(publish, promise);
  }
}

function reject(promise, reason) {
  if (promise._state !== PENDING) {
    return;
  }
  promise._state = REJECTED;
  promise._result = reason;

  asap(publishRejection, promise);
}

function subscribe(parent, child, onFulfillment, onRejection) {
  var _subscribers = parent._subscribers;
  var length = _subscribers.length;


  parent._onerror = null;

  _subscribers[length] = child;
  _subscribers[length + FULFILLED] = onFulfillment;
  _subscribers[length + REJECTED] = onRejection;

  if (length === 0 && parent._state) {
    asap(publish, parent);
  }
}

function publish(promise) {
  var subscribers = promise._subscribers;
  var settled = promise._state;

  if (subscribers.length === 0) {
    return;
  }

  var child = void 0,
      callback = void 0,
      detail = promise._result;

  for (var i = 0; i < subscribers.length; i += 3) {
    child = subscribers[i];
    callback = subscribers[i + settled];

    if (child) {
      invokeCallback(settled, child, callback, detail);
    } else {
      callback(detail);
    }
  }

  promise._subscribers.length = 0;
}

function invokeCallback(settled, promise, callback, detail) {
  var hasCallback = isFunction(callback),
      value = void 0,
      error = void 0,
      succeeded = true;

  if (hasCallback) {
    try {
      value = callback(detail);
    } catch (e) {
      succeeded = false;
      error = e;
    }

    if (promise === value) {
      reject(promise, cannotReturnOwn());
      return;
    }
  } else {
    value = detail;
  }

  if (promise._state !== PENDING) {
    // noop
  } else if (hasCallback && succeeded) {
    resolve(promise, value);
  } else if (succeeded === false) {
    reject(promise, error);
  } else if (settled === FULFILLED) {
    fulfill(promise, value);
  } else if (settled === REJECTED) {
    reject(promise, value);
  }
}

function initializePromise(promise, resolver) {
  try {
    resolver(function resolvePromise(value) {
      resolve(promise, value);
    }, function rejectPromise(reason) {
      reject(promise, reason);
    });
  } catch (e) {
    reject(promise, e);
  }
}

var id = 0;
function nextId() {
  return id++;
}

function makePromise(promise) {
  promise[PROMISE_ID] = id++;
  promise._state = undefined;
  promise._result = undefined;
  promise._subscribers = [];
}

function validationError() {
  return new Error('Array Methods must be provided an Array');
}

var Enumerator = function () {
  function Enumerator(Constructor, input) {
    this._instanceConstructor = Constructor;
    this.promise = new Constructor(noop);

    if (!this.promise[PROMISE_ID]) {
      makePromise(this.promise);
    }

    if (isArray(input)) {
      this.length = input.length;
      this._remaining = input.length;

      this._result = new Array(this.length);

      if (this.length === 0) {
        fulfill(this.promise, this._result);
      } else {
        this.length = this.length || 0;
        this._enumerate(input);
        if (this._remaining === 0) {
          fulfill(this.promise, this._result);
        }
      }
    } else {
      reject(this.promise, validationError());
    }
  }

  Enumerator.prototype._enumerate = function _enumerate(input) {
    for (var i = 0; this._state === PENDING && i < input.length; i++) {
      this._eachEntry(input[i], i);
    }
  };

  Enumerator.prototype._eachEntry = function _eachEntry(entry, i) {
    var c = this._instanceConstructor;
    var resolve$$1 = c.resolve;


    if (resolve$$1 === resolve$1) {
      var _then = void 0;
      var error = void 0;
      var didError = false;
      try {
        _then = entry.then;
      } catch (e) {
        didError = true;
        error = e;
      }

      if (_then === then && entry._state !== PENDING) {
        this._settledAt(entry._state, i, entry._result);
      } else if (typeof _then !== 'function') {
        this._remaining--;
        this._result[i] = entry;
      } else if (c === Promise$1) {
        var promise = new c(noop);
        if (didError) {
          reject(promise, error);
        } else {
          handleMaybeThenable(promise, entry, _then);
        }
        this._willSettleAt(promise, i);
      } else {
        this._willSettleAt(new c(function (resolve$$1) {
          return resolve$$1(entry);
        }), i);
      }
    } else {
      this._willSettleAt(resolve$$1(entry), i);
    }
  };

  Enumerator.prototype._settledAt = function _settledAt(state, i, value) {
    var promise = this.promise;


    if (promise._state === PENDING) {
      this._remaining--;

      if (state === REJECTED) {
        reject(promise, value);
      } else {
        this._result[i] = value;
      }
    }

    if (this._remaining === 0) {
      fulfill(promise, this._result);
    }
  };

  Enumerator.prototype._willSettleAt = function _willSettleAt(promise, i) {
    var enumerator = this;

    subscribe(promise, undefined, function (value) {
      return enumerator._settledAt(FULFILLED, i, value);
    }, function (reason) {
      return enumerator._settledAt(REJECTED, i, reason);
    });
  };

  return Enumerator;
}();

/**
  `Promise.all` accepts an array of promises, and returns a new promise which
  is fulfilled with an array of fulfillment values for the passed promises, or
  rejected with the reason of the first passed promise to be rejected. It casts all
  elements of the passed iterable to promises as it runs this algorithm.

  Example:

  ```javascript
  let promise1 = resolve(1);
  let promise2 = resolve(2);
  let promise3 = resolve(3);
  let promises = [ promise1, promise2, promise3 ];

  Promise.all(promises).then(function(array){
    // The array here would be [ 1, 2, 3 ];
  });
  ```

  If any of the `promises` given to `all` are rejected, the first promise
  that is rejected will be given as an argument to the returned promises's
  rejection handler. For example:

  Example:

  ```javascript
  let promise1 = resolve(1);
  let promise2 = reject(new Error("2"));
  let promise3 = reject(new Error("3"));
  let promises = [ promise1, promise2, promise3 ];

  Promise.all(promises).then(function(array){
    // Code here never runs because there are rejected promises!
  }, function(error) {
    // error.message === "2"
  });
  ```

  @method all
  @static
  @param {Array} entries array of promises
  @param {String} label optional string for labeling the promise.
  Useful for tooling.
  @return {Promise} promise that is fulfilled when all `promises` have been
  fulfilled, or rejected if any of them become rejected.
  @static
*/
function all(entries) {
  return new Enumerator(this, entries).promise;
}

/**
  `Promise.race` returns a new promise which is settled in the same way as the
  first passed promise to settle.

  Example:

  ```javascript
  let promise1 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 1');
    }, 200);
  });

  let promise2 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 2');
    }, 100);
  });

  Promise.race([promise1, promise2]).then(function(result){
    // result === 'promise 2' because it was resolved before promise1
    // was resolved.
  });
  ```

  `Promise.race` is deterministic in that only the state of the first
  settled promise matters. For example, even if other promises given to the
  `promises` array argument are resolved, but the first settled promise has
  become rejected before the other promises became fulfilled, the returned
  promise will become rejected:

  ```javascript
  let promise1 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 1');
    }, 200);
  });

  let promise2 = new Promise(function(resolve, reject){
    setTimeout(function(){
      reject(new Error('promise 2'));
    }, 100);
  });

  Promise.race([promise1, promise2]).then(function(result){
    // Code here never runs
  }, function(reason){
    // reason.message === 'promise 2' because promise 2 became rejected before
    // promise 1 became fulfilled
  });
  ```

  An example real-world use case is implementing timeouts:

  ```javascript
  Promise.race([ajax('foo.json'), timeout(5000)])
  ```

  @method race
  @static
  @param {Array} promises array of promises to observe
  Useful for tooling.
  @return {Promise} a promise which settles in the same way as the first passed
  promise to settle.
*/
function race(entries) {
  /*jshint validthis:true */
  var Constructor = this;

  if (!isArray(entries)) {
    return new Constructor(function (_, reject) {
      return reject(new TypeError('You must pass an array to race.'));
    });
  } else {
    return new Constructor(function (resolve, reject) {
      var length = entries.length;
      for (var i = 0; i < length; i++) {
        Constructor.resolve(entries[i]).then(resolve, reject);
      }
    });
  }
}

/**
  `Promise.reject` returns a promise rejected with the passed `reason`.
  It is shorthand for the following:

  ```javascript
  let promise = new Promise(function(resolve, reject){
    reject(new Error('WHOOPS'));
  });

  promise.then(function(value){
    // Code here doesn't run because the promise is rejected!
  }, function(reason){
    // reason.message === 'WHOOPS'
  });
  ```

  Instead of writing the above, your code now simply becomes the following:

  ```javascript
  let promise = Promise.reject(new Error('WHOOPS'));

  promise.then(function(value){
    // Code here doesn't run because the promise is rejected!
  }, function(reason){
    // reason.message === 'WHOOPS'
  });
  ```

  @method reject
  @static
  @param {Any} reason value that the returned promise will be rejected with.
  Useful for tooling.
  @return {Promise} a promise rejected with the given `reason`.
*/
function reject$1(reason) {
  /*jshint validthis:true */
  var Constructor = this;
  var promise = new Constructor(noop);
  reject(promise, reason);
  return promise;
}

function needsResolver() {
  throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
}

function needsNew() {
  throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
}

/**
  Promise objects represent the eventual result of an asynchronous operation. The
  primary way of interacting with a promise is through its `then` method, which
  registers callbacks to receive either a promise's eventual value or the reason
  why the promise cannot be fulfilled.

  Terminology
  -----------

  - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
  - `thenable` is an object or function that defines a `then` method.
  - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
  - `exception` is a value that is thrown using the throw statement.
  - `reason` is a value that indicates why a promise was rejected.
  - `settled` the final resting state of a promise, fulfilled or rejected.

  A promise can be in one of three states: pending, fulfilled, or rejected.

  Promises that are fulfilled have a fulfillment value and are in the fulfilled
  state.  Promises that are rejected have a rejection reason and are in the
  rejected state.  A fulfillment value is never a thenable.

  Promises can also be said to *resolve* a value.  If this value is also a
  promise, then the original promise's settled state will match the value's
  settled state.  So a promise that *resolves* a promise that rejects will
  itself reject, and a promise that *resolves* a promise that fulfills will
  itself fulfill.


  Basic Usage:
  ------------

  ```js
  let promise = new Promise(function(resolve, reject) {
    // on success
    resolve(value);

    // on failure
    reject(reason);
  });

  promise.then(function(value) {
    // on fulfillment
  }, function(reason) {
    // on rejection
  });
  ```

  Advanced Usage:
  ---------------

  Promises shine when abstracting away asynchronous interactions such as
  `XMLHttpRequest`s.

  ```js
  function getJSON(url) {
    return new Promise(function(resolve, reject){
      let xhr = new XMLHttpRequest();

      xhr.open('GET', url);
      xhr.onreadystatechange = handler;
      xhr.responseType = 'json';
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.send();

      function handler() {
        if (this.readyState === this.DONE) {
          if (this.status === 200) {
            resolve(this.response);
          } else {
            reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
          }
        }
      };
    });
  }

  getJSON('/posts.json').then(function(json) {
    // on fulfillment
  }, function(reason) {
    // on rejection
  });
  ```

  Unlike callbacks, promises are great composable primitives.

  ```js
  Promise.all([
    getJSON('/posts'),
    getJSON('/comments')
  ]).then(function(values){
    values[0] // => postsJSON
    values[1] // => commentsJSON

    return values;
  });
  ```

  @class Promise
  @param {Function} resolver
  Useful for tooling.
  @constructor
*/

var Promise$1 = function () {
  function Promise(resolver) {
    this[PROMISE_ID] = nextId();
    this._result = this._state = undefined;
    this._subscribers = [];

    if (noop !== resolver) {
      typeof resolver !== 'function' && needsResolver();
      this instanceof Promise ? initializePromise(this, resolver) : needsNew();
    }
  }

  /**
  The primary way of interacting with a promise is through its `then` method,
  which registers callbacks to receive either a promise's eventual value or the
  reason why the promise cannot be fulfilled.
   ```js
  findUser().then(function(user){
    // user is available
  }, function(reason){
    // user is unavailable, and you are given the reason why
  });
  ```
   Chaining
  --------
   The return value of `then` is itself a promise.  This second, 'downstream'
  promise is resolved with the return value of the first promise's fulfillment
  or rejection handler, or rejected if the handler throws an exception.
   ```js
  findUser().then(function (user) {
    return user.name;
  }, function (reason) {
    return 'default name';
  }).then(function (userName) {
    // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
    // will be `'default name'`
  });
   findUser().then(function (user) {
    throw new Error('Found user, but still unhappy');
  }, function (reason) {
    throw new Error('`findUser` rejected and we're unhappy');
  }).then(function (value) {
    // never reached
  }, function (reason) {
    // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
    // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
  });
  ```
  If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.
   ```js
  findUser().then(function (user) {
    throw new PedagogicalException('Upstream error');
  }).then(function (value) {
    // never reached
  }).then(function (value) {
    // never reached
  }, function (reason) {
    // The `PedgagocialException` is propagated all the way down to here
  });
  ```
   Assimilation
  ------------
   Sometimes the value you want to propagate to a downstream promise can only be
  retrieved asynchronously. This can be achieved by returning a promise in the
  fulfillment or rejection handler. The downstream promise will then be pending
  until the returned promise is settled. This is called *assimilation*.
   ```js
  findUser().then(function (user) {
    return findCommentsByAuthor(user);
  }).then(function (comments) {
    // The user's comments are now available
  });
  ```
   If the assimliated promise rejects, then the downstream promise will also reject.
   ```js
  findUser().then(function (user) {
    return findCommentsByAuthor(user);
  }).then(function (comments) {
    // If `findCommentsByAuthor` fulfills, we'll have the value here
  }, function (reason) {
    // If `findCommentsByAuthor` rejects, we'll have the reason here
  });
  ```
   Simple Example
  --------------
   Synchronous Example
   ```javascript
  let result;
   try {
    result = findResult();
    // success
  } catch(reason) {
    // failure
  }
  ```
   Errback Example
   ```js
  findResult(function(result, err){
    if (err) {
      // failure
    } else {
      // success
    }
  });
  ```
   Promise Example;
   ```javascript
  findResult().then(function(result){
    // success
  }, function(reason){
    // failure
  });
  ```
   Advanced Example
  --------------
   Synchronous Example
   ```javascript
  let author, books;
   try {
    author = findAuthor();
    books  = findBooksByAuthor(author);
    // success
  } catch(reason) {
    // failure
  }
  ```
   Errback Example
   ```js
   function foundBooks(books) {
   }
   function failure(reason) {
   }
   findAuthor(function(author, err){
    if (err) {
      failure(err);
      // failure
    } else {
      try {
        findBoooksByAuthor(author, function(books, err) {
          if (err) {
            failure(err);
          } else {
            try {
              foundBooks(books);
            } catch(reason) {
              failure(reason);
            }
          }
        });
      } catch(error) {
        failure(err);
      }
      // success
    }
  });
  ```
   Promise Example;
   ```javascript
  findAuthor().
    then(findBooksByAuthor).
    then(function(books){
      // found books
  }).catch(function(reason){
    // something went wrong
  });
  ```
   @method then
  @param {Function} onFulfilled
  @param {Function} onRejected
  Useful for tooling.
  @return {Promise}
  */

  /**
  `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
  as the catch block of a try/catch statement.
  ```js
  function findAuthor(){
  throw new Error('couldn't find that author');
  }
  // synchronous
  try {
  findAuthor();
  } catch(reason) {
  // something went wrong
  }
  // async with promises
  findAuthor().catch(function(reason){
  // something went wrong
  });
  ```
  @method catch
  @param {Function} onRejection
  Useful for tooling.
  @return {Promise}
  */


  Promise.prototype.catch = function _catch(onRejection) {
    return this.then(null, onRejection);
  };

  /**
    `finally` will be invoked regardless of the promise's fate just as native
    try/catch/finally behaves
  
    Synchronous example:
  
    ```js
    findAuthor() {
      if (Math.random() > 0.5) {
        throw new Error();
      }
      return new Author();
    }
  
    try {
      return findAuthor(); // succeed or fail
    } catch(error) {
      return findOtherAuther();
    } finally {
      // always runs
      // doesn't affect the return value
    }
    ```
  
    Asynchronous example:
  
    ```js
    findAuthor().catch(function(reason){
      return findOtherAuther();
    }).finally(function(){
      // author was either found, or not
    });
    ```
  
    @method finally
    @param {Function} callback
    @return {Promise}
  */


  Promise.prototype.finally = function _finally(callback) {
    var promise = this;
    var constructor = promise.constructor;

    if (isFunction(callback)) {
      return promise.then(function (value) {
        return constructor.resolve(callback()).then(function () {
          return value;
        });
      }, function (reason) {
        return constructor.resolve(callback()).then(function () {
          throw reason;
        });
      });
    }

    return promise.then(callback, callback);
  };

  return Promise;
}();

Promise$1.prototype.then = then;
Promise$1.all = all;
Promise$1.race = race;
Promise$1.resolve = resolve$1;
Promise$1.reject = reject$1;
Promise$1._setScheduler = setScheduler;
Promise$1._setAsap = setAsap;
Promise$1._asap = asap;

/*global self*/
function polyfill() {
  var local = void 0;

  if (typeof global !== 'undefined') {
    local = global;
  } else if (typeof self !== 'undefined') {
    local = self;
  } else {
    try {
      local = Function('return this')();
    } catch (e) {
      throw new Error('polyfill failed because global object is unavailable in this environment');
    }
  }

  var P = local.Promise;

  if (P) {
    var promiseToString = null;
    try {
      promiseToString = Object.prototype.toString.call(P.resolve());
    } catch (e) {
      // silently ignored
    }

    if (promiseToString === '[object Promise]' && !P.cast) {
      return;
    }
  }

  local.Promise = Promise$1;
}

// Strange compat..
Promise$1.polyfill = polyfill;
Promise$1.Promise = Promise$1;

return Promise$1;

})));



//# sourceMappingURL=es6-promise.map

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../../../../../samples/EasyDataBasicDemo.NetCore31/node_modules/process/browser.js */ "./node_modules/process/browser.js"), __webpack_require__(/*! ./../../../../../../samples/EasyDataBasicDemo.NetCore31/node_modules/webpack/buildin/global.js */ "./node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "../../easydata.js/packs/ui/dist/assets/css/easy-dialog.css":
/*!*********************************************************************************!*\
  !*** c:/projects/easydata/easydata.js/packs/ui/dist/assets/css/easy-dialog.css ***!
  \*********************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


var content = __webpack_require__(/*! !../../../../../../samples/EasyDataBasicDemo.NetCore31/node_modules/css-loader/dist/cjs.js??ref--6!./easy-dialog.css */ "./node_modules/css-loader/dist/cjs.js?!../../easydata.js/packs/ui/dist/assets/css/easy-dialog.css");

if(typeof content === 'string') content = [[module.i, content, '']];

var transform;
var insertInto;



var options = {"hmr":true}

options.transform = transform
options.insertInto = undefined;

var update = __webpack_require__(/*! ../../../../../../samples/EasyDataBasicDemo.NetCore31/node_modules/style-loader/lib/addStyles.js */ "./node_modules/style-loader/lib/addStyles.js")(content, options);

if(content.locals) module.exports = content.locals;

if(false) {}

/***/ }),

/***/ "../../easydata.js/packs/ui/dist/assets/css/easy-forms.css":
/*!********************************************************************************!*\
  !*** c:/projects/easydata/easydata.js/packs/ui/dist/assets/css/easy-forms.css ***!
  \********************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


var content = __webpack_require__(/*! !../../../../../../samples/EasyDataBasicDemo.NetCore31/node_modules/css-loader/dist/cjs.js??ref--6!./easy-forms.css */ "./node_modules/css-loader/dist/cjs.js?!../../easydata.js/packs/ui/dist/assets/css/easy-forms.css");

if(typeof content === 'string') content = [[module.i, content, '']];

var transform;
var insertInto;



var options = {"hmr":true}

options.transform = transform
options.insertInto = undefined;

var update = __webpack_require__(/*! ../../../../../../samples/EasyDataBasicDemo.NetCore31/node_modules/style-loader/lib/addStyles.js */ "./node_modules/style-loader/lib/addStyles.js")(content, options);

if(content.locals) module.exports = content.locals;

if(false) {}

/***/ }),

/***/ "../../easydata.js/packs/ui/dist/assets/css/easy-grid.css":
/*!*******************************************************************************!*\
  !*** c:/projects/easydata/easydata.js/packs/ui/dist/assets/css/easy-grid.css ***!
  \*******************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


var content = __webpack_require__(/*! !../../../../../../samples/EasyDataBasicDemo.NetCore31/node_modules/css-loader/dist/cjs.js??ref--6!./easy-grid.css */ "./node_modules/css-loader/dist/cjs.js?!../../easydata.js/packs/ui/dist/assets/css/easy-grid.css");

if(typeof content === 'string') content = [[module.i, content, '']];

var transform;
var insertInto;



var options = {"hmr":true}

options.transform = transform
options.insertInto = undefined;

var update = __webpack_require__(/*! ../../../../../../samples/EasyDataBasicDemo.NetCore31/node_modules/style-loader/lib/addStyles.js */ "./node_modules/style-loader/lib/addStyles.js")(content, options);

if(content.locals) module.exports = content.locals;

if(false) {}

/***/ }),

/***/ "../../easydata.js/packs/ui/dist/lib/datetimepicker/calendar.js":
/*!*************************************************************************************!*\
  !*** c:/projects/easydata/easydata.js/packs/ui/dist/lib/datetimepicker/calendar.js ***!
  \*************************************************************************************/
/*! exports provided: Calendar */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Calendar", function() { return Calendar; });
var Calendar = /** @class */ (function () {
    function Calendar(slot, options) {
        this.slot = slot;
        this.options = options || {};
        if (!this.options.yearRange) {
            this.options.yearRange = 'c-10:c+10';
        }
    }
    Object.defineProperty(Calendar.prototype, "cssPrefix", {
        get: function () {
            return 'kdtp-cal';
        },
        enumerable: true,
        configurable: true
    });
    Calendar.prototype.setDate = function (date) {
        this.currentDate = new Date(date);
    };
    Calendar.prototype.getDate = function () {
        return new Date(this.currentDate);
    };
    Calendar.prototype.dateChanged = function (apply) {
        if (this.options.onDateChanged) {
            this.options.onDateChanged(this.currentDate, apply);
        }
    };
    return Calendar;
}());

//# sourceMappingURL=calendar.js.map

/***/ }),

/***/ "../../easydata.js/packs/ui/dist/lib/datetimepicker/date_time_picker.js":
/*!*********************************************************************************************!*\
  !*** c:/projects/easydata/easydata.js/packs/ui/dist/lib/datetimepicker/date_time_picker.js ***!
  \*********************************************************************************************/
/*! exports provided: DateTimePicker */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DateTimePicker", function() { return DateTimePicker; });
/* harmony import */ var _utils_ui_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/ui-utils */ "../../easydata.js/packs/ui/dist/lib/utils/ui-utils.js");

var DateTimePicker = /** @class */ (function () {
    function DateTimePicker(options) {
        this.calendar = null;
        this.timePicker = null;
        this.options = options;
        this.render();
    }
    Object.defineProperty(DateTimePicker.prototype, "cssPrefix", {
        get: function () {
            return 'kdtp';
        },
        enumerable: true,
        configurable: true
    });
    DateTimePicker.prototype.setDateTime = function (dateTime) {
        this.currentDateTime = new Date(dateTime);
        if (this.calendar) {
            this.calendar.setDate(this.currentDateTime);
        }
        if (this.timePicker) {
            this.timePicker.setTime(this.currentDateTime);
        }
    };
    DateTimePicker.prototype.getDateTime = function () {
        return new Date(this.currentDateTime);
    };
    DateTimePicker.prototype.render = function () {
        var _this = this;
        if (this.options.showCalendar) {
            this.calendar = this.createCalendar({
                yearRange: this.options.yearRange,
                showDateTimeInput: this.options.showDateTimeInput,
                timePickerIsUsed: this.options.showTimePicker,
                oneClickDateSelection: this.options.oneClickDateSelection,
                onDateChanged: function (date, apply) {
                    _this.currentDateTime = date;
                    if (_this.timePicker) {
                        _this.timePicker.setTime(_this.currentDateTime);
                    }
                    if (_this.options.showTimePicker) {
                        _this.dateTimeChanged();
                    }
                    if (apply) {
                        _this.apply(_this.currentDateTime);
                    }
                }
            });
            if (this.calendar)
                this.calendar.render();
        }
        if (this.options.showTimePicker) {
            this.timePicker = this.createTimePicker({
                onTimeChanged: function (time) {
                    _this.currentDateTime.setHours(time.getHours());
                    _this.currentDateTime.setMinutes(time.getMinutes());
                    if (_this.calendar) {
                        _this.calendar.setDate(_this.currentDateTime);
                    }
                    _this.dateTimeChanged();
                }
            });
            if (this.timePicker)
                this.timePicker.render();
        }
        this.setDateTime(new Date());
    };
    DateTimePicker.prototype.createCalendar = function (options) {
        return null;
    };
    DateTimePicker.prototype.createTimePicker = function (options) {
        return null;
    };
    DateTimePicker.prototype.show = function (anchor) {
        if (this.options.beforeShow) {
            this.options.beforeShow();
        }
        var pos = Object(_utils_ui_utils__WEBPACK_IMPORTED_MODULE_0__["getElementAbsolutePos"])(anchor || document.body);
        this.slot.style.top = pos.y + anchor.clientHeight + 'px';
        this.slot.style.left = pos.x + 'px';
    };
    DateTimePicker.prototype.apply = function (date) {
        if (this.options.onApply) {
            this.options.onApply(date);
        }
        this.destroy();
    };
    DateTimePicker.prototype.cancel = function () {
        if (this.options.onCancel) {
            this.options.onCancel();
        }
        this.destroy();
    };
    DateTimePicker.prototype.destroy = function () {
        if (this.slot && this.slot.parentElement) {
            this.slot.parentElement.removeChild(this.slot);
        }
    };
    DateTimePicker.prototype.dateTimeChanged = function () {
        if (this.options.onDateTimeChanged) {
            this.options.onDateTimeChanged(this.currentDateTime);
        }
    };
    return DateTimePicker;
}());

//# sourceMappingURL=date_time_picker.js.map

/***/ }),

/***/ "../../easydata.js/packs/ui/dist/lib/datetimepicker/default_calendar.js":
/*!*********************************************************************************************!*\
  !*** c:/projects/easydata/easydata.js/packs/ui/dist/lib/datetimepicker/default_calendar.js ***!
  \*********************************************************************************************/
/*! exports provided: DefaultCalendar */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DefaultCalendar", function() { return DefaultCalendar; });
/* harmony import */ var _easydata_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @easydata/core */ "../../easydata.js/packs/core/dist/lib/public_api.js");
/* harmony import */ var _utils_dom_elem_builder__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/dom_elem_builder */ "../../easydata.js/packs/ui/dist/lib/utils/dom_elem_builder.js");
/* harmony import */ var _calendar__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./calendar */ "../../easydata.js/packs/ui/dist/lib/datetimepicker/calendar.js");
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();



var DefaultCalendar = /** @class */ (function (_super) {
    __extends(DefaultCalendar, _super);
    function DefaultCalendar(slot, options) {
        var _this = _super.call(this, slot, options) || this;
        _this.daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        _this.months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        _this.calendarBody = null;
        _this.isManualInputChanging = false;
        for (var i = 0; i < _this.daysOfWeek.length; i++) {
            _this.daysOfWeek[i] = _easydata_core__WEBPACK_IMPORTED_MODULE_0__["i18n"].getShortWeekDayName(i + 1);
        }
        for (var i = 0; i < _this.months.length; i++) {
            _this.months[i] = _easydata_core__WEBPACK_IMPORTED_MODULE_0__["i18n"].getLongMonthName(i + 1);
        }
        return _this;
    }
    DefaultCalendar.prototype.setDate = function (date) {
        _super.prototype.setDate.call(this, date);
        this.selectedMonth = this.currentDate.getMonth();
        this.selectedYear = this.currentDate.getFullYear();
        this.rerenderMonth();
    };
    DefaultCalendar.prototype.render = function () {
        var _this = this;
        var header = Object(_utils_dom_elem_builder__WEBPACK_IMPORTED_MODULE_1__["domel"])('div', this.slot)
            .addClass(this.cssPrefix + "-header");
        if (this.options.showDateTimeInput) {
            header
                .addChildElement(this.renderManualDateInput());
        }
        else {
            header
                .addChild('span', function (builder) { return _this.headerTextElem = builder.toDOM(); });
        }
        Object(_utils_dom_elem_builder__WEBPACK_IMPORTED_MODULE_1__["domel"])(this.slot)
            .addChildElement(this.renderCalendarButtons());
        this.calendarBody = Object(_utils_dom_elem_builder__WEBPACK_IMPORTED_MODULE_1__["domel"])('div', this.slot)
            .addClass(this.cssPrefix + "-body")
            .toDOM();
    };
    DefaultCalendar.prototype.getInputDateFormat = function () {
        var settings = _easydata_core__WEBPACK_IMPORTED_MODULE_0__["i18n"].getLocaleSettings();
        return (this.options.timePickerIsUsed)
            ? settings.editDateFormat + " " + settings.editTimeFormat
            : settings.editDateFormat;
    };
    DefaultCalendar.prototype.renderManualDateInput = function () {
        var _this = this;
        var format = this.getInputDateFormat();
        var builder = Object(_utils_dom_elem_builder__WEBPACK_IMPORTED_MODULE_1__["domel"])('input')
            .attr('placeholder', format)
            .addClass(this.cssPrefix + "-header-input");
        builder
            .mask(format.replace('yyyy', '9999')
            .replace('MM', '99')
            .replace('dd', '99')
            .replace('HH', '99')
            .replace('mm', '99')
            .replace('ss', '99'))
            .on('input', function (ev) {
            builder.removeClass('error');
            try {
                _this.isManualInputChanging = true;
                var newDate = _easydata_core__WEBPACK_IMPORTED_MODULE_0__["utils"].strToDateTime(_this.manualInputElem.value, format);
                _this.currentDate = newDate;
                _this.jump(_this.currentDate.getFullYear(), _this.currentDate.getMonth());
                _this.dateChanged(false);
            }
            catch (e) {
                builder.addClass('error');
            }
            finally {
                _this.isManualInputChanging = false;
            }
        })
            .on('keydown', function (ev) {
            if (ev.keyCode === 13) {
                ev.preventDefault();
                ev.stopPropagation();
                if (_this.manualInputElem.className.indexOf('error') < 0
                    && !_this.isManualInputChanging)
                    _this.dateChanged(true);
            }
        })
            .on('focus', function () {
            setTimeout(function () {
                _this.manualInputElem.selectionStart = 0;
                _this.manualInputElem.selectionEnd = 0;
            }, 50);
        });
        this.manualInputElem = builder.toDOM();
        return this.manualInputElem;
    };
    DefaultCalendar.prototype.updateDisplayedDateValue = function () {
        if (this.manualInputElem) {
            if (!this.isManualInputChanging) {
                var format = this.getInputDateFormat();
                this.manualInputElem.value = _easydata_core__WEBPACK_IMPORTED_MODULE_0__["utils"].dateTimeToStr(this.currentDate, format);
                this.manualInputElem.focus();
            }
        }
        else if (this.headerTextElem) {
            var locale = _easydata_core__WEBPACK_IMPORTED_MODULE_0__["i18n"].getCurrentLocale();
            this.headerTextElem.innerText = this.currentDate.toLocaleString(locale == 'en' ? undefined : locale, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        }
    };
    DefaultCalendar.prototype.renderCalendarButtons = function () {
        var _this = this;
        var builder = Object(_utils_dom_elem_builder__WEBPACK_IMPORTED_MODULE_1__["domel"])('nav')
            .addClass(this.cssPrefix + "-nav")
            .addChild('div', function (builder) { return builder
            .addClass(_this.cssPrefix + "-nav-prev")
            .on('click', function () {
            _this.prev();
        })
            .addChild('span', function (builder) { return builder.html('&lsaquo;'); }); })
            .addChild('div', function (builder) { return builder
            .addClass(_this.cssPrefix + "-nav-selectors")
            .addChild('div', function (builder) { return builder
            .addClass(_this.cssPrefix + "-nav-month")
            .addChild('select', function (builder) {
            builder
                .on('change', function () {
                _this.jump(_this.selectedYear, parseInt(_this.selectMonthElem.value));
            });
            var _loop_1 = function (i) {
                builder.addChild('option', function (builder) { return builder
                    .attr('value', i.toString())
                    .text(_this.months[i]); });
            };
            for (var i = 0; i < _this.months.length; i++) {
                _loop_1(i);
            }
            _this.selectMonthElem = builder.toDOM();
        }); })
            .addChild('div', function (builder) { return builder
            .addClass(_this.cssPrefix + "-nav-year")
            .addChild('select', function (builder) { return _this.selectYearElem = builder
            .on('change', function () {
            _this.jump(parseInt(_this.selectYearElem.value), _this.selectedMonth);
        })
            .toDOM(); }); }); })
            .addChild('div', function (builder) { return builder
            .addClass(_this.cssPrefix + "-nav-next")
            .on('click', function () {
            _this.next();
        })
            .addChild('span', function (builder) { return builder.html('&rsaquo;'); }); });
        return builder.toDOM();
    };
    DefaultCalendar.prototype.prev = function () {
        this.selectedYear = (this.selectedMonth === 0) ? this.selectedYear - 1 : this.selectedYear;
        this.selectedMonth = (this.selectedMonth === 0) ? 11 : this.selectedMonth - 1;
        this.rerenderMonth();
    };
    DefaultCalendar.prototype.next = function () {
        this.selectedYear = (this.selectedMonth === 11) ? this.selectedYear + 1 : this.selectedYear;
        this.selectedMonth = (this.selectedMonth + 1) % 12;
        this.rerenderMonth();
    };
    DefaultCalendar.prototype.rerenderSelectYear = function () {
        var match = /c-(\d*):c\+(\d*)/g.exec(this.options.yearRange);
        var minusYear = 0;
        var plusYear = 1;
        if (match !== null) {
            minusYear = parseInt(match[1]);
            plusYear = parseInt(match[2]);
        }
        this.selectYearElem.innerHTML = '';
        for (var i = 0; i <= minusYear + plusYear; i++) {
            var op = document.createElement("option");
            var year = this.selectedYear - minusYear + i;
            op.value = year.toString();
            op.innerText = year.toString();
            this.selectYearElem.appendChild(op);
        }
    };
    DefaultCalendar.prototype.jump = function (year, month) {
        this.selectedYear = year;
        this.selectedMonth = month;
        this.rerenderMonth();
    };
    DefaultCalendar.prototype.rerenderMonth = function () {
        var _this = this;
        //header text
        this.updateDisplayedDateValue();
        this.rerenderSelectYear();
        var firstDay = (new Date(this.selectedYear, this.selectedMonth)).getDay();
        var daysInMonth = new Date(this.selectedYear, this.selectedMonth + 1, 0).getDate();
        this.calendarBody.innerHTML = "";
        this.selectYearElem.value = this.selectedYear.toString();
        this.selectMonthElem.value = this.selectedMonth.toString();
        this.daysOfWeek.forEach(function (day, idx) {
            Object(_utils_dom_elem_builder__WEBPACK_IMPORTED_MODULE_1__["domel"])('div', _this.calendarBody)
                .addClass(_this.cssPrefix + "-weekday")
                .addClass(idx == 0 || idx == 6 ? _this.cssPrefix + "-weekend" : '')
                .text(day);
        });
        // Add empty cells before first day
        for (var i = 0; i < firstDay; i++) {
            Object(_utils_dom_elem_builder__WEBPACK_IMPORTED_MODULE_1__["domel"])('div', this.calendarBody)
                .addClass(this.cssPrefix + "-day-empty");
        }
        // Add all month days
        var today = new Date();
        for (var day = 1; day <= daysInMonth; day++) {
            var builder = Object(_utils_dom_elem_builder__WEBPACK_IMPORTED_MODULE_1__["domel"])('div', this.calendarBody)
                .addClass(this.cssPrefix + "-day")
                .attr('data-date', day.toString())
                .text(day.toString())
                .on('click', function (e) {
                _this.currentDate.setFullYear(_this.selectedYear);
                _this.currentDate.setMonth(_this.selectedMonth);
                _this.currentDate.setDate(parseInt(e.target.getAttribute('data-date')));
                _this.dateChanged(_this.options.oneClickDateSelection);
            });
            if (day === today.getDate() && this.selectedYear === today.getFullYear() && this.selectedMonth === today.getMonth()) {
                builder.addClass(this.cssPrefix + "-day-current");
            }
            if (day === this.currentDate.getDate() && this.selectedYear === this.currentDate.getFullYear() && this.selectedMonth === this.currentDate.getMonth()) {
                builder.addClass(this.cssPrefix + "-day-selected");
            }
            var dayOfWeek = (firstDay + day - 1) % 7;
            if (dayOfWeek == 0 || dayOfWeek == 6) {
                builder.addClass(this.cssPrefix + "-weekend");
            }
        }
        // Add empty cells after last day
        var cellsDrawnInLastRow = (firstDay + daysInMonth) % 7;
        var cellsToDraw = cellsDrawnInLastRow == 0 ? 0 : 7 - cellsDrawnInLastRow;
        for (var i = 0; i < cellsToDraw; i++) {
            Object(_utils_dom_elem_builder__WEBPACK_IMPORTED_MODULE_1__["domel"])('div', this.calendarBody)
                .addClass(this.cssPrefix + "-day-empty");
        }
    };
    DefaultCalendar.prototype.dateChanged = function (apply) {
        _super.prototype.dateChanged.call(this, apply);
        this.rerenderMonth();
    };
    return DefaultCalendar;
}(_calendar__WEBPACK_IMPORTED_MODULE_2__["Calendar"]));

//# sourceMappingURL=default_calendar.js.map

/***/ }),

/***/ "../../easydata.js/packs/ui/dist/lib/datetimepicker/default_date_time_picker.js":
/*!*****************************************************************************************************!*\
  !*** c:/projects/easydata/easydata.js/packs/ui/dist/lib/datetimepicker/default_date_time_picker.js ***!
  \*****************************************************************************************************/
/*! exports provided: DefaultDateTimePicker */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DefaultDateTimePicker", function() { return DefaultDateTimePicker; });
/* harmony import */ var _easydata_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @easydata/core */ "../../easydata.js/packs/core/dist/lib/public_api.js");
/* harmony import */ var _utils_dom_elem_builder__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/dom_elem_builder */ "../../easydata.js/packs/ui/dist/lib/utils/dom_elem_builder.js");
/* harmony import */ var _date_time_picker__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./date_time_picker */ "../../easydata.js/packs/ui/dist/lib/datetimepicker/date_time_picker.js");
/* harmony import */ var _default_calendar__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./default_calendar */ "../../easydata.js/packs/ui/dist/lib/datetimepicker/default_calendar.js");
/* harmony import */ var _default_time_picker__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./default_time_picker */ "../../easydata.js/packs/ui/dist/lib/datetimepicker/default_time_picker.js");
/* harmony import */ var _utils_ui_utils__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../utils/ui-utils */ "../../easydata.js/packs/ui/dist/lib/utils/ui-utils.js");
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();






var DefaultDateTimePicker = /** @class */ (function (_super) {
    __extends(DefaultDateTimePicker, _super);
    function DefaultDateTimePicker() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DefaultDateTimePicker.prototype.render = function () {
        var _this = this;
        this.slot = Object(_utils_dom_elem_builder__WEBPACK_IMPORTED_MODULE_1__["domel"])('div', document.body)
            .addClass("" + this.cssPrefix)
            .attr('tabIndex', '0')
            .setStyle('position', 'absolute')
            .setStyle('top', '-1000px')
            .setStyle('left', '-1000px')
            .on('keydown', function (ev) {
            if (ev.keyCode === 27) { // ESC is pressed
                _this.cancel();
            }
            else if (ev.keyCode === 13) { // Enter is pressed
                _this.apply(_this.getDateTime());
            }
            return false;
        })
            .toDOM();
        _super.prototype.render.call(this);
        this.renderButtons();
        this.globalMouseDownHandler = function (e) {
            var event = window.event || e;
            var o = event.srcElement || event.target;
            var isOutside = !_this.slot.contains(event.target);
            if (isOutside) {
                document.removeEventListener('mousedown', _this.globalMouseDownHandler, true);
                _this.cancel();
            }
            return true;
        };
    };
    DefaultDateTimePicker.prototype.renderButtons = function () {
        var _this = this;
        var builder = Object(_utils_dom_elem_builder__WEBPACK_IMPORTED_MODULE_1__["domel"])('div', this.slot)
            .addClass(this.cssPrefix + "-buttons")
            .addChild('button', function (b) { return _this.nowButton = b
            .addClass(_this.cssPrefix + "-button " + _this.cssPrefix + "-button-now")
            .text(_easydata_core__WEBPACK_IMPORTED_MODULE_0__["i18n"].getText('ButtonNow'))
            .on('click', function () {
            _this.setDateTime(new Date());
            _this.dateTimeChanged();
            return false;
        })
            .toDOM(); });
        if (this.options.showTimePicker || !this.options.oneClickDateSelection) {
            builder.addChild('button', function (b) { return _this.submitButton = b
                .addClass(_this.cssPrefix + "-button " + _this.cssPrefix + "-button-apply")
                .text(_easydata_core__WEBPACK_IMPORTED_MODULE_0__["i18n"].getText('ButtonApply'))
                .on('click', function () {
                _this.apply(_this.getDateTime());
                return false;
            })
                .toDOM(); });
        }
        builder.addChild('button', function (b) { return _this.submitButton = b
            .addClass(_this.cssPrefix + "-button " + _this.cssPrefix + "-button-cancel")
            .text(_easydata_core__WEBPACK_IMPORTED_MODULE_0__["i18n"].getText('ButtonCancel'))
            .on('click', function () {
            _this.cancel();
            return false;
        })
            .toDOM(); });
    };
    DefaultDateTimePicker.prototype.createCalendar = function (options) {
        this.calendarSlot =
            Object(_utils_dom_elem_builder__WEBPACK_IMPORTED_MODULE_1__["domel"])('div', this.slot)
                .addClass(this.cssPrefix + "-cal")
                .toDOM();
        return new _default_calendar__WEBPACK_IMPORTED_MODULE_3__["DefaultCalendar"](this.calendarSlot, options);
    };
    DefaultDateTimePicker.prototype.createTimePicker = function (options) {
        this.timePickerSlot =
            Object(_utils_dom_elem_builder__WEBPACK_IMPORTED_MODULE_1__["domel"])('div', this.slot)
                .addClass(this.cssPrefix + "-tp")
                .toDOM();
        return new _default_time_picker__WEBPACK_IMPORTED_MODULE_4__["DefaultTimePicker"](this.timePickerSlot, options);
    };
    DefaultDateTimePicker.prototype.show = function (anchor) {
        var _this = this;
        if (this.options.showDateTimeInput) {
            if (this.options.beforeShow) {
                this.options.beforeShow();
            }
            var anchorPos = Object(_utils_ui_utils__WEBPACK_IMPORTED_MODULE_5__["getElementAbsolutePos"])(anchor || document.body);
            var parentPos = Object(_utils_ui_utils__WEBPACK_IMPORTED_MODULE_5__["getElementAbsolutePos"])(anchor ? anchor.parentElement || anchor : document.body);
            this.slot.style.top = parentPos.y + 'px';
            this.slot.style.left = anchorPos.x + 'px';
        }
        else {
            _super.prototype.show.call(this, anchor);
            this.slot.focus();
        }
        setTimeout(function () {
            document.addEventListener('mousedown', _this.globalMouseDownHandler, true);
        }, 1);
    };
    return DefaultDateTimePicker;
}(_date_time_picker__WEBPACK_IMPORTED_MODULE_2__["DateTimePicker"]));

//# sourceMappingURL=default_date_time_picker.js.map

/***/ }),

/***/ "../../easydata.js/packs/ui/dist/lib/datetimepicker/default_time_picker.js":
/*!************************************************************************************************!*\
  !*** c:/projects/easydata/easydata.js/packs/ui/dist/lib/datetimepicker/default_time_picker.js ***!
  \************************************************************************************************/
/*! exports provided: DefaultTimePicker */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DefaultTimePicker", function() { return DefaultTimePicker; });
/* harmony import */ var _easydata_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @easydata/core */ "../../easydata.js/packs/core/dist/lib/public_api.js");
/* harmony import */ var _utils_dom_elem_builder__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/dom_elem_builder */ "../../easydata.js/packs/ui/dist/lib/utils/dom_elem_builder.js");
/* harmony import */ var _time_picker__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./time_picker */ "../../easydata.js/packs/ui/dist/lib/datetimepicker/time_picker.js");
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();



var DefaultTimePicker = /** @class */ (function (_super) {
    __extends(DefaultTimePicker, _super);
    function DefaultTimePicker() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DefaultTimePicker.prototype.setTime = function (time) {
        _super.prototype.setTime.call(this, time);
        this.updateDisplayedTime();
        this.hoursInput.valueAsNumber = time.getHours();
        this.minutesInput.valueAsNumber = time.getMinutes();
    };
    DefaultTimePicker.prototype.render = function () {
        var _this = this;
        Object(_utils_dom_elem_builder__WEBPACK_IMPORTED_MODULE_1__["domel"])('div', this.slot)
            .addClass(this.cssPrefix + "-time")
            .addChild('span', function (builder) { return _this.timeText = builder.toDOM(); })
            .toDOM();
        var slidersBuilder = Object(_utils_dom_elem_builder__WEBPACK_IMPORTED_MODULE_1__["domel"])('div', this.slot)
            .addClass(this.cssPrefix + "-sliders");
        slidersBuilder
            .addChild('div', function (builder) { return builder
            .addClass(_this.cssPrefix + "-time-row")
            .title('Hours')
            .addChild('input', function (builder) { return _this.hoursInput = builder
            .addClass(_this.cssPrefix + "-input-hours")
            .type('range')
            .attr('min', '0')
            .attr('max', '23')
            .attr('step', '1')
            .on('input', function (e) {
            _this.currentTime.setHours(_this.hoursInput.valueAsNumber);
            _this.updateDisplayedTime();
            _this.timeChanged();
        })
            .toDOM(); }); });
        slidersBuilder
            .addChild('div', function (builder) { return builder
            .addClass(_this.cssPrefix + "-time-row")
            .title('Minutes')
            .addChild('input', function (builder) { return _this.minutesInput = builder
            .addClass(_this.cssPrefix + "-input-minutes")
            .type('range')
            .attr('min', '0')
            .attr('max', '59')
            .attr('step', '1')
            .on('input', function (e) {
            _this.currentTime.setMinutes(_this.minutesInput.valueAsNumber);
            _this.updateDisplayedTime();
            _this.timeChanged();
        })
            .toDOM(); }); });
        return this.slot;
    };
    DefaultTimePicker.prototype.updateDisplayedTime = function () {
        var locale = _easydata_core__WEBPACK_IMPORTED_MODULE_0__["i18n"].getCurrentLocale();
        var timeToDraw = this.currentTime.toLocaleString(locale == 'en' ? undefined : locale, {
            hour: "numeric",
            minute: "numeric"
        });
        this.timeText.innerText = timeToDraw;
    };
    return DefaultTimePicker;
}(_time_picker__WEBPACK_IMPORTED_MODULE_2__["TimePicker"]));

//# sourceMappingURL=default_time_picker.js.map

/***/ }),

/***/ "../../easydata.js/packs/ui/dist/lib/datetimepicker/time_picker.js":
/*!****************************************************************************************!*\
  !*** c:/projects/easydata/easydata.js/packs/ui/dist/lib/datetimepicker/time_picker.js ***!
  \****************************************************************************************/
/*! exports provided: TimePicker */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TimePicker", function() { return TimePicker; });
var TimePicker = /** @class */ (function () {
    function TimePicker(slot, options) {
        this.slot = slot;
        this.options = options || {};
    }
    Object.defineProperty(TimePicker.prototype, "cssPrefix", {
        get: function () {
            return 'kdtp-tp';
        },
        enumerable: true,
        configurable: true
    });
    TimePicker.prototype.setTime = function (time) {
        this.currentTime = new Date(time);
    };
    TimePicker.prototype.getTime = function () {
        return new Date(this.currentTime);
    };
    TimePicker.prototype.timeChanged = function () {
        if (this.options.onTimeChanged) {
            this.options.onTimeChanged(this.currentTime);
        }
    };
    return TimePicker;
}());

//# sourceMappingURL=time_picker.js.map

/***/ }),

/***/ "../../easydata.js/packs/ui/dist/lib/dialogs/default_dialog_service.js":
/*!********************************************************************************************!*\
  !*** c:/projects/easydata/easydata.js/packs/ui/dist/lib/dialogs/default_dialog_service.js ***!
  \********************************************************************************************/
/*! exports provided: DefaultDialogService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* WEBPACK VAR INJECTION */(function(Promise) {/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DefaultDialogService", function() { return DefaultDialogService; });
/* harmony import */ var _easydata_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @easydata/core */ "../../easydata.js/packs/core/dist/lib/public_api.js");
/* harmony import */ var _utils_dom_elem_builder__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/dom_elem_builder */ "../../easydata.js/packs/ui/dist/lib/utils/dom_elem_builder.js");


var cssPrefix = "kdlg";
var DefaultDialogService = /** @class */ (function () {
    function DefaultDialogService() {
    }
    DefaultDialogService.prototype.openConfirm = function (title, content, callback) {
        var _this = this;
        var template = "<div id=\"" + cssPrefix + "-dialog-confirm\">" + content + "</div>";
        var options = {
            title: title,
            closable: false,
            cancelable: true,
            body: template
        };
        if (callback) {
            options.onSubmit = function () {
                callback(true);
            };
            options.onCancel = function () {
                callback(false);
            };
            this.open(options);
            return;
        }
        return new Promise(function (resolve) {
            options.onSubmit = function () {
                resolve(true);
            };
            options.onCancel = function () {
                resolve(false);
            };
            _this.open(options);
        });
    };
    DefaultDialogService.prototype.openPrompt = function (title, content, defVal, callback) {
        var _this = this;
        var template = "<div id=\"" + cssPrefix + "-dialog-form\">\n            <label for=\"name\" id=\"" + cssPrefix + "-dialog-form-content\">" + content + "</label>\n            <input type=\"text\" name=\"name\" id=\"" + cssPrefix + "-dialog-form-input\"\" />\n        </div>";
        var options = {
            title: title,
            closable: true,
            cancelable: true,
            body: template,
            arrangeParents: false,
            beforeOpen: function () {
                var input = document.getElementById(cssPrefix + "-dialog-form-input");
                if (defVal) {
                    input.value = defVal;
                }
            }
        };
        var processInput = function (callback) {
            var input = document.getElementById(cssPrefix + "-dialog-form-input");
            var result = input.value;
            if (result && result.replace(/\s/g, '').length > 0) {
                callback(result);
                return true;
            }
            input.classList.add('eqjs-invalid');
            return false;
        };
        if (callback) {
            options.onSubmit = function () {
                return processInput(callback);
            };
            options.onCancel = function () {
                callback("");
            };
            this.open(options);
            return;
        }
        return new Promise(function (resolve) {
            options.onSubmit = function () {
                return processInput(resolve);
            };
            options.onCancel = function () {
                resolve("");
            };
            _this.open(options);
        });
    };
    DefaultDialogService.prototype.open = function (options) {
        var _this = this;
        var destroy = function () {
            if (options.arrangeParents) {
                _this.arrangeParents(false);
            }
            document.body.removeChild(builder.show().toDOM());
            if (options.onDestroy) {
                options.onDestroy();
            }
        };
        var cancelHandler = function () {
            if (options.onCancel) {
                options.onCancel();
            }
            destroy();
        };
        var submitHandler = function () {
            if (options.onSubmit && options.onSubmit() === false) {
                return;
            }
            destroy();
        };
        var builder = Object(_utils_dom_elem_builder__WEBPACK_IMPORTED_MODULE_1__["domel"])('div', document.body)
            .addClass('kdlg-modal', 'is-active')
            .addChild('div', function (b) { return b
            .addClass('kdlg-modal-background'); })
            .addChild('div', function (b) { return b
            .addClass('kdlg-modal-window')
            //.addClass(browserUtils.getMobileCssClass())
            .addChild('header', function (b) {
            b
                .addClass('kdlg-header')
                .addChild('p', function (b) { return b
                .addClass('kdlg-header-title')
                .addText(options.title); });
            if (options.closable !== false)
                b.addChild('button', function (b) { return b
                    .addClass('kdlg-modal-close')
                    .on('click', function () {
                    cancelHandler();
                }); });
        })
            .addChild('section', function (b) {
            b
                .addClass('kdlg-body');
            if (typeof options.body === 'string') {
                b.addHtml(options.body);
            }
            else {
                b.addChildElement(options.body);
            }
        })
            .addChild('footer', function (b) {
            b
                .addClass('kdlg-footer', 'align-right')
                .addChild('button', function (b) { return b
                .addClass('kfrm-button', 'is-info')
                .addText(_easydata_core__WEBPACK_IMPORTED_MODULE_0__["i18n"].getText('ButtonOK'))
                .on('click', function (e) {
                submitHandler();
            }); });
            if (options.cancelable !== false)
                b
                    .addChild('button', function (builder) { return builder
                    .addClass('kfrm-button')
                    .addText(_easydata_core__WEBPACK_IMPORTED_MODULE_0__["i18n"].getText('ButtonCancel'))
                    .on('click', function (e) {
                    cancelHandler();
                }); });
        }); });
        if (options.beforeOpen) {
            options.beforeOpen();
        }
        builder.show();
        var windowDiv = builder.toDOM()
            .querySelector('.kdlg-modal-window');
        if (options.height) {
            windowDiv.style.height = typeof options.height === 'string'
                ? options.height
                : options.height + "px";
        }
        if (options.width) {
            windowDiv.style.width = typeof options.width === 'string'
                ? options.width
                : options.width + "px";
        }
        if (options.arrangeParents) {
            this.arrangeParents(true);
        }
    };
    DefaultDialogService.prototype.arrangeParents = function (turnOn) {
        var windowDivs = document.documentElement.querySelectorAll('.kdlg-modal-window');
        for (var i = 0; i < windowDivs.length - 1; i++) {
            if (turnOn) {
                var offset = i == 0 ? 20 : i * 40 + 20;
                Object(_utils_dom_elem_builder__WEBPACK_IMPORTED_MODULE_1__["domel"])(windowDivs[i])
                    .setStyle('margin-top', offset + "px")
                    .setStyle('margin-left', offset + "px");
            }
            else {
                Object(_utils_dom_elem_builder__WEBPACK_IMPORTED_MODULE_1__["domel"])(windowDivs[i])
                    .removeStyle('margin-top')
                    .removeStyle('margin-left');
            }
        }
    };
    return DefaultDialogService;
}());

//# sourceMappingURL=default_dialog_service.js.map
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! es6-promise */ "../../easydata.js/packs/ui/node_modules/es6-promise/dist/es6-promise.js")["Promise"]))

/***/ }),

/***/ "../../easydata.js/packs/ui/dist/lib/grid/easy_grid.js":
/*!****************************************************************************!*\
  !*** c:/projects/easydata/easydata.js/packs/ui/dist/lib/grid/easy_grid.js ***!
  \****************************************************************************/
/*! exports provided: EasyGrid */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* WEBPACK VAR INJECTION */(function(Promise) {/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "EasyGrid", function() { return EasyGrid; });
/* harmony import */ var _easydata_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @easydata/core */ "../../easydata.js/packs/core/dist/lib/public_api.js");
/* harmony import */ var _utils_drag_manager__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/drag_manager */ "../../easydata.js/packs/ui/dist/lib/utils/drag_manager.js");
/* harmony import */ var _utils_dom_elem_builder__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/dom_elem_builder */ "../../easydata.js/packs/ui/dist/lib/utils/dom_elem_builder.js");
/* harmony import */ var _utils_ui_utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils/ui-utils */ "../../easydata.js/packs/ui/dist/lib/utils/ui-utils.js");
/* harmony import */ var _easy_grid_columns__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./easy_grid_columns */ "../../easydata.js/packs/ui/dist/lib/grid/easy_grid_columns.js");
/* harmony import */ var _easy_grid_cell_renderer__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./easy_grid_cell_renderer */ "../../easydata.js/packs/ui/dist/lib/grid/easy_grid_cell_renderer.js");
var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};






var DEFAULT_ROW_HEIGHT = 36;
var DEFAULT_ROW_COUNT = 15;
var EasyGrid = /** @class */ (function () {
    function EasyGrid(options) {
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
            paging: {
                enabled: true,
                pageSize: 30
            },
            addColumns: false,
            viewportRowsCount: null,
            showActiveRow: true
        };
        this.rowsOnPagePromise = null;
        this.containerInitialHeight = 0;
        this.firstRender = true;
        this.landingIndex = -1;
        this.landingSlot = Object(_utils_dom_elem_builder__WEBPACK_IMPORTED_MODULE_2__["domel"])('div')
            .addClass(this.cssPrefix + "-col-landing-slot")
            .addChildElement(Object(_utils_dom_elem_builder__WEBPACK_IMPORTED_MODULE_2__["domel"])('div')
            .toDOM())
            .toDOM();
        this._activeRowIndex = -1;
        if (options && options.paging) {
            options.paging = _easydata_core__WEBPACK_IMPORTED_MODULE_0__["utils"].assign(this.defaultDataGridOptions.paging, options.paging);
        }
        this.options = __assign({}, this.defaultDataGridOptions, options);
        if (!this.options.slot)
            throw Error('"slot" parameter is required to initialize EasyDataGrid');
        if (!this.options.dataTable)
            throw Error('"dataTable" parameter is required to initialize EasyDataGrid');
        this.dataTable = options.dataTable;
        this.eventEmitter = new _easydata_core__WEBPACK_IMPORTED_MODULE_0__["EventEmitter"](this);
        this.cellRendererStore = new _easy_grid_cell_renderer__WEBPACK_IMPORTED_MODULE_5__["GridCellRendererStore"](options);
        this.columns = new _easy_grid_columns__WEBPACK_IMPORTED_MODULE_4__["GridColumnList"](this.dataTable.columns, this);
        this.setSlot(this.options.slot);
        this.init(this.options);
    }
    EasyGrid.prototype.setSlot = function (slot) {
        if (typeof slot === 'string') {
            if (slot.length) {
                if (slot[0] === '#') {
                    this.slot = document.getElementById(slot.substring(1));
                }
                else if (slot[0] === '.') {
                    var result = document.getElementsByClassName(slot.substring(1));
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
    };
    EasyGrid.prototype.init = function (options) {
        var _this = this;
        if (options.onInit) {
            this.addEventListener('init', options.onInit);
        }
        if (options.onRowClick) {
            this.addEventListener('rowClick', options.onRowClick);
        }
        if (options.onRowDbClick) {
            this.addEventListener('rowDbClick', options.onRowDbClick);
        }
        if (options.onAddColumnClick) {
            this.addEventListener('addColumnClick', options.onAddColumnClick);
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
        this.addEventListener('pageChanged', function (ev) { return _this.activeRowIndex = -1; });
        _easydata_core__WEBPACK_IMPORTED_MODULE_0__["utils"].assignDeep(this.paginationOptions, options.pagination);
        this.pagination.pageSize = this.options.paging.pageSize
            || this.pagination.pageSize;
        if (this.options.allowDragDrop) {
            _utils_drag_manager__WEBPACK_IMPORTED_MODULE_1__["eqDragManager"].registerDropContainer({
                element: this.slot,
                scopes: ["gridColumnMove"],
                onDragEnter: function (_, ev) {
                    _this.slot.classList.add(_utils_ui_utils__WEBPACK_IMPORTED_MODULE_3__["eqCssPrefix"] + "-drophover");
                    _this.showLandingSlot(ev.pageX, ev.pageY);
                },
                onDragOver: function (_, ev) {
                    _this.showLandingSlot(ev.pageX, ev.pageY);
                },
                onDragLeave: function (_, ev) {
                    ev.dropEffect = _utils_drag_manager__WEBPACK_IMPORTED_MODULE_1__["DropEffect"].Forbid;
                    _this.slot.classList.remove(_utils_ui_utils__WEBPACK_IMPORTED_MODULE_3__["eqCssPrefix"] + "-drophover");
                    _this.hideLandingSlot();
                },
                onDrop: function (_, ev) {
                    _this.dataTable.columns.move(ev.data.column, _this.landingIndex);
                    _this.refresh();
                    _this.fireEvent({
                        type: 'columnMoved',
                        columnId: ev.data.column.id,
                        newIndex: _this.landingIndex
                    });
                }
            });
        }
        this.refresh();
        this.fireEvent('init');
    };
    EasyGrid.prototype.fireEvent = function (event) {
        if (typeof event === "string") {
            this.eventEmitter.fire(event);
        }
        else {
            this.eventEmitter.fire(event.type, event);
        }
    };
    EasyGrid.prototype.setData = function (data) {
        this.dataTable = data;
        this.clear();
        this.refresh();
    };
    EasyGrid.prototype.getData = function () {
        return this.dataTable;
    };
    EasyGrid.prototype.getColumns = function () {
        return this.columns;
    };
    EasyGrid.prototype.destroy = function () {
        this.slot.innerHTML = "";
    };
    EasyGrid.prototype.refresh = function () {
        this.clearDOM();
        this.render();
    };
    EasyGrid.prototype.clearDOM = function () {
        this.slot.innerHTML = '';
    };
    EasyGrid.prototype.clear = function () {
        this.pagination.page = 1;
        this.clearDOM();
    };
    EasyGrid.prototype.render = function () {
        var _this = this;
        if (!this.hasData() && !this.options.addColumns)
            return;
        this.containerInitialHeight = this.slot.clientHeight;
        this.rootDiv = document.createElement('div');
        this.rootDiv.style.width = '100%';
        this.rootDiv.classList.add(this.cssPrefix + "-root");
        this.columns.sync(this.dataTable.columns, this.options.useRowNumeration);
        this.renderHeader();
        this.rootDiv.appendChild(this.headerDiv);
        this.renderBody();
        this.rootDiv.appendChild(this.bodyDiv);
        this.renderFooter();
        this.rootDiv.appendChild(this.footerDiv);
        var gridContainer = document.createElement('div');
        gridContainer.classList.add(this.cssPrefix + "-container");
        gridContainer.appendChild(this.rootDiv);
        this.slot.appendChild(gridContainer);
        if (this.rowsOnPagePromise) {
            this.rowsOnPagePromise
                .then(function () { return _this.updateHeight(); })
                .then(function () {
                _this.firstRender = false;
                _this.rowsOnPagePromise = null;
            });
        }
        else {
            setTimeout(function () {
                _this.updateHeight();
                _this.firstRender = false;
            }, 100);
        }
    };
    EasyGrid.prototype.updateHeight = function () {
        var _this = this;
        return new Promise(function (resolve) {
            if (_this.options.viewportRowsCount) {
                var firstRow = _this.bodyCellContainerDiv.firstElementChild;
                var rowHeight = firstRow ? firstRow.offsetHeight : DEFAULT_ROW_HEIGHT;
                var rowCount = _this.options.viewportRowsCount; // || DEFAULT_ROW_COUNT;
                var bodyHeight_1 = rowHeight * rowCount;
                Object(_utils_dom_elem_builder__WEBPACK_IMPORTED_MODULE_2__["domel"])(_this.bodyDiv)
                    .setStyle('height', bodyHeight_1 + "px");
                setTimeout(function () {
                    var sbHeight = _this.bodyViewportDiv.offsetHeight - _this.bodyViewportDiv.clientHeight;
                    bodyHeight_1 = bodyHeight_1 + sbHeight;
                    Object(_utils_dom_elem_builder__WEBPACK_IMPORTED_MODULE_2__["domel"])(_this.bodyDiv)
                        .setStyle('height', bodyHeight_1 + "px");
                    resolve();
                }, 100);
                return;
            }
            else if (_this.containerInitialHeight > 0) {
                var bodyHeight = _this.containerInitialHeight - _this.headerDiv.offsetHeight - _this.footerDiv.offsetHeight;
                Object(_utils_dom_elem_builder__WEBPACK_IMPORTED_MODULE_2__["domel"])(_this.bodyDiv)
                    .setStyle('height', bodyHeight + "px");
            }
            resolve();
        })
            .then(function () {
            if (_this.options.fixHeightOnFirstRender && _this.firstRender) {
                _this.slot.style.height = _this.slot.offsetHeight + "px";
            }
        });
    };
    EasyGrid.prototype.renderHeader = function () {
        var _this = this;
        this.headerDiv = Object(_utils_dom_elem_builder__WEBPACK_IMPORTED_MODULE_2__["domel"])('div')
            .addClass(this.cssPrefix + "-header")
            .toDOM();
        this.headerViewportDiv = Object(_utils_dom_elem_builder__WEBPACK_IMPORTED_MODULE_2__["domel"])('div', this.headerDiv)
            .addClass(this.cssPrefix + "-header-viewport")
            .toDOM();
        this.headerCellContainerDiv = Object(_utils_dom_elem_builder__WEBPACK_IMPORTED_MODULE_2__["domel"])('div', this.headerViewportDiv)
            .addClass(this.cssPrefix + "-header-cell-container")
            .toDOM();
        this.headerRowDiv = Object(_utils_dom_elem_builder__WEBPACK_IMPORTED_MODULE_2__["domel"])('div', this.headerCellContainerDiv)
            .addClass(this.cssPrefix + "-header-row")
            .toDOM();
        this.columns.getItems().forEach(function (column, index) {
            if (!column.isVisible) {
                return;
            }
            var hd = _this.renderColumnHeader(column, index);
            _this.headerRowDiv.appendChild(hd);
            if (column.isRowNum) {
                Object(_utils_dom_elem_builder__WEBPACK_IMPORTED_MODULE_2__["domel"])(hd)
                    .addChildElement(_this.renderAddColumnButton());
            }
        });
        var containerWidth = this.columns.getItems().map(function (column) { return column.width; }).reduce(function (sum, current) { return sum + current; });
        Object(_utils_dom_elem_builder__WEBPACK_IMPORTED_MODULE_2__["domel"])(this.headerCellContainerDiv)
            .setStyle('width', containerWidth + "px");
    };
    EasyGrid.prototype.hasData = function () {
        return this.dataTable.columns.count > 0;
    };
    EasyGrid.prototype.renderColumnHeader = function (column, index) {
        var colBuilder = Object(_utils_dom_elem_builder__WEBPACK_IMPORTED_MODULE_2__["domel"])('div')
            .addClass(this.cssPrefix + "-header-cell")
            .data('col-idx', "" + (index + 1))
            .setStyle('width', column.width + "px");
        if (column.dataColumn) {
            colBuilder
                .data('col-id', "" + column.dataColumn.id);
        }
        var colDiv = colBuilder.toDOM();
        var resizeBuilder = Object(_utils_dom_elem_builder__WEBPACK_IMPORTED_MODULE_2__["domel"])('div', colDiv)
            .addClass(this.cssPrefix + "-header-cell-resize");
        if (!column.isRowNum) {
            var valBuilder = Object(_utils_dom_elem_builder__WEBPACK_IMPORTED_MODULE_2__["domel"])('div', colDiv)
                .addClass(this.cssPrefix + "-header-cell-label")
                .text(column.label);
        }
        if (this.options.allowDragDrop) {
            _utils_drag_manager__WEBPACK_IMPORTED_MODULE_1__["eqDragManager"].registerDraggableItem({
                element: colDiv,
                scope: "gridColumnMove",
                data: { column: column },
                renderer: function (dragImage) {
                    dragImage.innerHTML = '';
                    var attrLabel = document.createElement('div');
                    attrLabel.innerText = column.label;
                    dragImage.classList.add('ui-sortable-helper');
                    dragImage.appendChild(attrLabel);
                },
                onDragStart: function (ev) {
                    ev.dropEffect = _utils_drag_manager__WEBPACK_IMPORTED_MODULE_1__["DropEffect"].Allow;
                }
            });
        }
        return colDiv;
    };
    EasyGrid.prototype.renderBody = function () {
        var _this = this;
        this.bodyDiv = Object(_utils_dom_elem_builder__WEBPACK_IMPORTED_MODULE_2__["domel"])('div')
            .addClass(this.cssPrefix + "-body")
            .toDOM();
        this.bodyViewportDiv = Object(_utils_dom_elem_builder__WEBPACK_IMPORTED_MODULE_2__["domel"])('div', this.bodyDiv)
            .addClass(this.cssPrefix + "-body-viewport")
            .attr('tabIndex', '0')
            .toDOM();
        this.bodyCellContainerDiv = Object(_utils_dom_elem_builder__WEBPACK_IMPORTED_MODULE_2__["domel"])('div', this.bodyViewportDiv)
            .addClass(this.cssPrefix + "-cell-container")
            .toDOM();
        if (this.dataTable) {
            this.showProgress();
            this.rowsOnPagePromise = this.getRowsToRender()
                .then(function (rows) {
                _this.hideProgress();
                //prevent double rendering (bad solution, we have to figure out how to avoid this behavior properly)
                _this.bodyCellContainerDiv.innerHTML = '';
                rows.forEach(function (row, index) {
                    var tr = _this.renderRow(row, index);
                    _this.bodyCellContainerDiv.appendChild(tr);
                });
                var containerWidth = _this.columns.getItems().map(function (column) { return column.width; }).reduce(function (sum, current) { return sum + current; });
                Object(_utils_dom_elem_builder__WEBPACK_IMPORTED_MODULE_2__["domel"])(_this.bodyCellContainerDiv)
                    .setStyle('width', containerWidth + "px");
                return rows.length;
            })
                .catch(function (error) { console.error(error); return 0; });
        }
        this.bodyViewportDiv.addEventListener('scroll', function (ev) {
            Object(_utils_dom_elem_builder__WEBPACK_IMPORTED_MODULE_2__["domel"])(_this.headerViewportDiv)
                .setStyle('margin-left', "-" + _this.bodyViewportDiv.scrollLeft + "px");
        });
        this.bodyViewportDiv.addEventListener('keydown', this.onVieportKeydown.bind(this));
    };
    EasyGrid.prototype.onVieportKeydown = function (ev) {
        if (this.options.showActiveRow) {
            var rowCount = this.bodyCellContainerDiv.querySelectorAll("." + this.cssPrefix + "-row").length;
            var newValue = void 0;
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
    };
    EasyGrid.prototype.ensureRowVisibility = function (index) {
        var row = this.bodyCellContainerDiv.querySelector("." + this.cssPrefix + "-row:nth-child(" + (index + 1) + ")");
        if (row) {
            var rowRect = row.getBoundingClientRect();
            var viewportRect = this.bodyViewportDiv.getBoundingClientRect();
            var rowTop = rowRect.top - viewportRect.top;
            var rowBottom = rowRect.bottom - viewportRect.top;
            var viewportHeight = this.bodyViewportDiv.clientHeight;
            var windowHeight = window.innerHeight || document.documentElement.clientHeight;
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
    };
    EasyGrid.prototype.getRowsToRender = function () {
        if (this.options.paging.enabled === false) {
            return Promise.resolve(this.dataTable.getCachedRows());
        }
        return this.dataTable.getRows({
            page: this.pagination.page,
            pageSize: this.pagination.pageSize
        })
            .catch(function (error) {
            console.error(error);
            return [];
        });
        ;
    };
    EasyGrid.prototype.renderFooter = function () {
        this.footerDiv = Object(_utils_dom_elem_builder__WEBPACK_IMPORTED_MODULE_2__["domel"])('div')
            .addClass(this.cssPrefix + "-footer")
            .toDOM();
        this.footerPaginateDiv = this.renderPageNavigator();
        this.footerDiv.appendChild(this.footerPaginateDiv);
        var pageInfoBlock = this.renderPageInfoBlock();
        this.footerDiv.appendChild(pageInfoBlock);
    };
    EasyGrid.prototype.renderPageInfoBlock = function () {
        var _this = this;
        var pageInfoDiv = Object(_utils_dom_elem_builder__WEBPACK_IMPORTED_MODULE_2__["domel"])('div')
            .addClass(this.cssPrefix + "-page-info")
            .toDOM();
        if (this.rowsOnPagePromise) {
            this.rowsOnPagePromise.then(function (count) {
                var fistPageRecordNum = count ? (_this.pagination.page - 1) * _this.pagination.pageSize + 1 : 0;
                var lastPageRecordNum = count ? fistPageRecordNum + count - 1 : 0;
                var total = _this.dataTable.getTotal();
                pageInfoDiv.innerHTML = _easydata_core__WEBPACK_IMPORTED_MODULE_0__["i18n"].getText('GridPageInfo')
                    .replace('{FirstPageRecordNum}', "<span>" + fistPageRecordNum.toString() + "</span>")
                    .replace('{LastPageRecordNum}', "<span>" + lastPageRecordNum.toString() + "</span>")
                    .replace('{Total}', "<span>" + total.toString() + "</span>");
            });
        }
        return pageInfoDiv;
    };
    EasyGrid.prototype.showProgress = function () {
    };
    EasyGrid.prototype.hideProgress = function () {
    };
    EasyGrid.prototype.getLocalIndexByGlobal = function (index) {
        if (this.pagination) {
            return index % this.pagination.pageSize;
        }
        else {
            return index;
        }
    };
    EasyGrid.prototype.getGlobalIndexByLocal = function (index) {
        if (this.pagination) {
            return (this.pagination.page - 1) * this.pagination.pageSize + index;
        }
        else {
            return index;
        }
    };
    EasyGrid.prototype.renderRow = function (row, index) {
        var _this = this;
        var indexGlobal = this.getGlobalIndexByLocal(index);
        var rowBuilder = Object(_utils_dom_elem_builder__WEBPACK_IMPORTED_MODULE_2__["domel"])('div')
            .addClass(this.cssPrefix + "-row")
            .addClass(this.cssPrefix + "-row-" + (index % 2 == 1 ? 'odd' : 'even'))
            .data('row-idx', "" + indexGlobal)
            .attr('tabindex', '-1')
            .on('click', function (ev) {
            _this.activeRowIndex = index;
            _this.fireEvent({
                type: 'rowClick',
                row: row,
                rowIndex: index,
                sourceEvent: ev
            });
        })
            .on('dblclick', function (ev) {
            _this.fireEvent({
                type: 'rowDbClick',
                row: row,
                rowIndex: index,
                sourceEvent: ev
            });
        });
        if (index == 0) {
            rowBuilder.addClass(this.cssPrefix + "-row-first");
        }
        var rowElement = rowBuilder.toDOM();
        if (this.options.showActiveRow && index == this.activeRowIndex) {
            rowBuilder.addClass(this.cssPrefix + "-row-active");
        }
        this.columns.getItems().forEach(function (column) {
            if (!column.isVisible) {
                return;
            }
            var colindex = column.isRowNum ? -1 : _this.dataTable.columns.getIndex(column.dataColumn.id);
            var val = column.isRowNum ? indexGlobal + 1 : row.getValue(colindex);
            rowElement.appendChild(_this.renderCell(column, colindex, val, rowElement));
        });
        return rowElement;
    };
    EasyGrid.prototype.renderCell = function (column, colIndex, value, rowElement) {
        var builder = Object(_utils_dom_elem_builder__WEBPACK_IMPORTED_MODULE_2__["domel"])('div')
            .addClass(this.cssPrefix + "-cell")
            .data('col-idx', "" + colIndex)
            .attr('tabindex', '-1')
            .setStyle('width', column.width + "px");
        if (column.align == _easy_grid_columns__WEBPACK_IMPORTED_MODULE_4__["GridColumnAlign"].LEFT) {
            builder.addClass(this.cssPrefix + "-cell-align-left");
        }
        else if (column.align == _easy_grid_columns__WEBPACK_IMPORTED_MODULE_4__["GridColumnAlign"].RIGHT) {
            builder.addClass(this.cssPrefix + "-cell-align-right");
        }
        else if (column.align == _easy_grid_columns__WEBPACK_IMPORTED_MODULE_4__["GridColumnAlign"].CENTER) {
            builder.addClass(this.cssPrefix + "-cell-align-center");
        }
        if (column.cellRenderer) {
            column.cellRenderer(value, column, builder.toDOM(), rowElement);
        }
        return builder.toDOM();
    };
    EasyGrid.prototype.renderPageNavigator = function () {
        var _this = this;
        var paginateDiv = document.createElement('div');
        paginateDiv.className = this.cssPrefix + "-pagination-wrapper";
        this.pagination.total = this.dataTable.getTotal();
        if (this.options.paging && this.options.paging.enabled
            && this.pagination.total > this.pagination.pageSize) {
            var prefix = this.paginationOptions.useBootstrap ? '' : this.cssPrefix + "-";
            paginateDiv.innerHTML = "";
            var pageIndex = this.pagination.page || 1;
            var pageCount = Math.ceil(this.pagination.total / this.pagination.pageSize) || 1;
            var buttonClickHandler = function (ev) {
                var element = ev.target;
                if (element.hasAttribute('data-page')) {
                    var page = parseInt(element.getAttribute('data-page'));
                    _this.pagination.page = page;
                    _this.fireEvent({ type: "pageChanged", page: page });
                    _this.refresh();
                    _this.bodyViewportDiv.focus();
                }
            };
            var maxButtonCount = this.paginationOptions.maxButtonCount || 10;
            var zeroBasedIndex = pageIndex - 1;
            var firstPageIndex = zeroBasedIndex - (zeroBasedIndex % maxButtonCount) + 1;
            var lastPageIndex = firstPageIndex + maxButtonCount - 1;
            if (lastPageIndex > pageCount) {
                lastPageIndex = pageCount;
            }
            var ul = document.createElement('ul');
            ul.className = prefix + "pagination";
            var li = document.createElement('li');
            li.className = prefix + "page-item";
            var a = document.createElement('span');
            a.setAttribute("aria-hidden", 'true');
            a.className = prefix + "page-link";
            if (firstPageIndex == 1) {
                li.className += " disabled";
            }
            else {
                if (this.paginationOptions.useBootstrap) {
                    a = document.createElement('a');
                    a.setAttribute('href', 'javascript:void(0)');
                    a.setAttribute("data-page", "" + (firstPageIndex - 1));
                }
                else {
                    var newA = document.createElement('a');
                    newA.setAttribute('href', 'javascript:void(0)');
                    newA.setAttribute("data-page", "" + (firstPageIndex - 1));
                    a = newA;
                }
                a.className = prefix + "page-link";
                a.addEventListener("click", buttonClickHandler);
            }
            a.innerHTML = "&laquo;";
            li.appendChild(a);
            ul.appendChild(li);
            for (var i = firstPageIndex; i <= lastPageIndex; i++) {
                li = document.createElement('li');
                li.className = prefix + "page-item";
                if (i == pageIndex)
                    li.className += " active";
                a = document.createElement('a');
                a.setAttribute('href', 'javascript:void(0)');
                a.innerHTML = i.toString();
                a.setAttribute('data-page', i.toString());
                a.className = prefix + "page-link";
                a.addEventListener("click", buttonClickHandler);
                li.appendChild(a);
                ul.appendChild(li);
            }
            li = document.createElement('li');
            li.className = prefix + "page-item";
            a = document.createElement("span");
            a.setAttribute('aria-hidden', 'true');
            a.className = prefix + "page-link";
            if (lastPageIndex == pageCount) {
                li.className += " disabled";
            }
            else {
                if (this.paginationOptions.useBootstrap) {
                    a = document.createElement('a');
                    a.setAttribute('href', 'javascript:void(0)');
                    a.setAttribute("data-page", "" + (lastPageIndex + 1));
                }
                else {
                    var newA = document.createElement('a');
                    newA.setAttribute('href', 'javascript:void(0)');
                    newA.setAttribute("data-page", "" + (lastPageIndex + 1));
                    a = newA;
                }
                a.className = prefix + "page-link";
                a.addEventListener("click", buttonClickHandler);
            }
            a.innerHTML = "&raquo;";
            li.appendChild(a);
            ul.appendChild(li);
            paginateDiv.appendChild(ul);
        }
        return paginateDiv;
    };
    EasyGrid.prototype.addEventListener = function (eventType, handler) {
        return this.eventEmitter.subscribe(eventType, function (event) { return handler(event.data); });
    };
    EasyGrid.prototype.removeEventListener = function (eventType, handlerId) {
        this.eventEmitter.unsubscribe(eventType, handlerId);
    };
    EasyGrid.prototype.renderAddColumnButton = function () {
        var _this = this;
        if (this.options.addColumns) {
            return Object(_utils_dom_elem_builder__WEBPACK_IMPORTED_MODULE_2__["domel"])('div')
                .addClass(this.cssPrefix + "-addrow")
                .title('Add column')
                .addChild('a', function (builder) { return builder
                .attr('href', 'javascript:void(0)')
                .on('click', function (e) {
                e.preventDefault();
                _this.fireEvent({
                    type: 'addColumnClick',
                    sourceEvent: e
                });
            }); })
                .toDOM();
        }
        return Object(_utils_dom_elem_builder__WEBPACK_IMPORTED_MODULE_2__["domel"])('span')
            .addText('#')
            .toDOM();
    };
    EasyGrid.prototype.showLandingSlot = function (pageX, pageY) {
        var colElems = this.headerRowDiv.querySelectorAll("[class*=" + this.cssPrefix + "-table-col]");
        var cols = [];
        for (var i = 1; i < colElems.length; i++) {
            var rowElem = colElems[i];
            if (rowElem.style.display === 'none')
                continue;
            cols.push(rowElem);
        }
        if (cols.length === 0) {
            this.landingIndex = 0;
            this.headerRowDiv.appendChild(this.landingSlot);
            return;
        }
        var landingPos = Object(_utils_ui_utils__WEBPACK_IMPORTED_MODULE_3__["getElementAbsolutePos"])(this.landingSlot);
        if (pageX >= landingPos.x && pageX <= landingPos.x + this.landingSlot.offsetWidth) {
            return;
        }
        var newLandingIndex = this.landingIndex;
        for (var _i = 0, cols_1 = cols; _i < cols_1.length; _i++) {
            var col = cols_1[_i];
            var colPos = Object(_utils_ui_utils__WEBPACK_IMPORTED_MODULE_3__["getElementAbsolutePos"])(col);
            var width = col.offsetWidth;
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
    };
    EasyGrid.prototype.hideLandingSlot = function () {
        var _this = this;
        this.landingIndex = -1;
        setTimeout(function () {
            if (_this.landingSlot.parentElement) {
                _this.landingSlot.parentElement.removeChild(_this.landingSlot);
            }
        }, 10);
    };
    Object.defineProperty(EasyGrid.prototype, "activeRowIndex", {
        get: function () {
            return this._activeRowIndex;
        },
        set: function (value) {
            if (value !== this._activeRowIndex) {
                var oldValue = this._activeRowIndex;
                this._activeRowIndex = value;
                this.updateActiveRow();
                this.fireEvent({
                    type: 'activeRowChanged',
                    oldValue: oldValue,
                    newValue: this.activeRowIndex,
                    rowIndex: this.getGlobalIndexByLocal(this.activeRowIndex)
                });
            }
        },
        enumerable: true,
        configurable: true
    });
    EasyGrid.prototype.updateActiveRow = function () {
        var _this = this;
        if (this.options.showActiveRow) {
            var rows = this.bodyCellContainerDiv.querySelectorAll("[class*=" + this.cssPrefix + "-row-active]");
            rows.forEach(function (el) { el.classList.remove(_this.cssPrefix + "-row-active"); });
            var activeRow = this.bodyCellContainerDiv.querySelector("." + this.cssPrefix + "-row:nth-child(" + (this.activeRowIndex + 1) + ")");
            if (activeRow) {
                activeRow.classList.add(this.cssPrefix + "-row-active");
                this.ensureRowVisibility(this.activeRowIndex);
            }
        }
    };
    EasyGrid.prototype.focus = function () {
        this.bodyViewportDiv.focus();
    };
    return EasyGrid;
}());

//# sourceMappingURL=easy_grid.js.map
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! es6-promise */ "../../easydata.js/packs/ui/node_modules/es6-promise/dist/es6-promise.js")["Promise"]))

/***/ }),

/***/ "../../easydata.js/packs/ui/dist/lib/grid/easy_grid_cell_renderer.js":
/*!******************************************************************************************!*\
  !*** c:/projects/easydata/easydata.js/packs/ui/dist/lib/grid/easy_grid_cell_renderer.js ***!
  \******************************************************************************************/
/*! exports provided: CellRendererType, GridCellRendererStore */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CellRendererType", function() { return CellRendererType; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "GridCellRendererStore", function() { return GridCellRendererStore; });
/* harmony import */ var _easydata_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @easydata/core */ "../../easydata.js/packs/core/dist/lib/public_api.js");
/* harmony import */ var _easy_grid_columns__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./easy_grid_columns */ "../../easydata.js/packs/ui/dist/lib/grid/easy_grid_columns.js");
/* harmony import */ var _utils_dom_elem_builder__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/dom_elem_builder */ "../../easydata.js/packs/ui/dist/lib/utils/dom_elem_builder.js");




var cssPrefix = "keg";
var CellRendererType;
(function (CellRendererType) {
    CellRendererType[CellRendererType["STRING"] = 1] = "STRING";
    CellRendererType[CellRendererType["NUMBER"] = 2] = "NUMBER";
    CellRendererType[CellRendererType["DATETIME"] = 3] = "DATETIME";
    CellRendererType[CellRendererType["BOOL"] = 4] = "BOOL";
})(CellRendererType || (CellRendererType = {}));
var StringCellRendererDefault = function (value, column, cellElement, rowElement) {
    var text = value ? value.toString().replace(/\n/g, '\u21B5 ') : '';
    Object(_utils_dom_elem_builder__WEBPACK_IMPORTED_MODULE_2__["domel"])('div', cellElement)
        .addClass(cssPrefix + "-cell-value")
        .addHtml(text)
        .title(value || '');
};
var NumberCellRendererDefault = function (value, column, cellElement, rowElement) {
    var strValue = (value || '').toString();
    if (typeof value == 'number') {
        strValue = value.toLocaleString();
    }
    var builder = Object(_utils_dom_elem_builder__WEBPACK_IMPORTED_MODULE_2__["domel"])('div', cellElement)
        .addClass(cssPrefix + "-cell-value")
        .addHtml(strValue)
        .title(strValue);
    if (column.align == _easy_grid_columns__WEBPACK_IMPORTED_MODULE_1__["GridColumnAlign"].NONE) {
        builder.addClass(cssPrefix + "-cell-value-align-right");
    }
};
var DateTimeCellRendererDefault = function (value, column, cellElement, rowElement) {
    var isDate = Object.prototype.toString.call(value) === '[object Date]';
    var strValue = (value || '').toString();
    if (isDate) {
        var locale = _easydata_core__WEBPACK_IMPORTED_MODULE_0__["i18n"].getCurrentLocale();
        switch (column.type) {
            case _easydata_core__WEBPACK_IMPORTED_MODULE_0__["DataType"].Date:
                strValue = value.toLocaleDateString(locale);
                break;
            case _easydata_core__WEBPACK_IMPORTED_MODULE_0__["DataType"].Time:
                strValue = value.toLocaleTimeString(locale, { hour: 'numeric', minute: 'numeric', second: 'numeric' });
                break;
            case _easydata_core__WEBPACK_IMPORTED_MODULE_0__["DataType"].DateTime:
                strValue = value.toLocaleDateString(locale) + " " + value.toLocaleTimeString(locale, { hour: 'numeric', minute: 'numeric', second: 'numeric' });
                break;
        }
    }
    var builder = Object(_utils_dom_elem_builder__WEBPACK_IMPORTED_MODULE_2__["domel"])('div', cellElement)
        .addClass(cssPrefix + "-cell-value")
        .addHtml(strValue)
        .title(strValue);
    if (column.align == _easy_grid_columns__WEBPACK_IMPORTED_MODULE_1__["GridColumnAlign"].NONE) {
        builder.addClass(cssPrefix + "-cell-value-align-right");
    }
};
var BoolCellRendererDefault = function (value, column, cellElement, rowElement) {
    Object(_utils_dom_elem_builder__WEBPACK_IMPORTED_MODULE_2__["domel"])('div', cellElement)
        .addClass(cssPrefix + "-cell-value")
        .addClass(cssPrefix + "-cell-value-bool")
        .addClass(cssPrefix + "-" + (value ? 'cell-value-true' : 'cell-value-false'));
};
var GridCellRendererStore = /** @class */ (function () {
    function GridCellRendererStore(options) {
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
    GridCellRendererStore.prototype.getDefaultRenderer = function (columnType) {
        var cellType = this.getCellType(columnType);
        return this.defaultRenderers[CellRendererType[cellType]];
    };
    GridCellRendererStore.prototype.getDefaultRendererByType = function (rendererType) {
        return this.defaultRenderers[CellRendererType[rendererType]];
    };
    GridCellRendererStore.prototype.setDefaultRenderer = function (cellType, renderer) {
        if (renderer) {
            this.defaultRenderers[CellRendererType[cellType]] = renderer;
        }
    };
    GridCellRendererStore.prototype.getRenderer = function (name) {
        return this.renderers[name];
    };
    GridCellRendererStore.prototype.registerRenderer = function (name, renderer) {
        this.renderers[name] = renderer;
    };
    GridCellRendererStore.prototype.getCellType = function (dataType) {
        switch (dataType) {
            case _easydata_core__WEBPACK_IMPORTED_MODULE_0__["DataType"].Autoinc:
            case _easydata_core__WEBPACK_IMPORTED_MODULE_0__["DataType"].Byte:
            case _easydata_core__WEBPACK_IMPORTED_MODULE_0__["DataType"].Word:
            case _easydata_core__WEBPACK_IMPORTED_MODULE_0__["DataType"].Currency:
            case _easydata_core__WEBPACK_IMPORTED_MODULE_0__["DataType"].Float:
            case _easydata_core__WEBPACK_IMPORTED_MODULE_0__["DataType"].Int32:
            case _easydata_core__WEBPACK_IMPORTED_MODULE_0__["DataType"].Int64:
                return CellRendererType.NUMBER;
            case _easydata_core__WEBPACK_IMPORTED_MODULE_0__["DataType"].Date:
            case _easydata_core__WEBPACK_IMPORTED_MODULE_0__["DataType"].DateTime:
            case _easydata_core__WEBPACK_IMPORTED_MODULE_0__["DataType"].Time:
                return CellRendererType.DATETIME;
            case _easydata_core__WEBPACK_IMPORTED_MODULE_0__["DataType"].Bool:
                return CellRendererType.BOOL;
            default:
                return CellRendererType.STRING;
        }
    };
    return GridCellRendererStore;
}());

//# sourceMappingURL=easy_grid_cell_renderer.js.map

/***/ }),

/***/ "../../easydata.js/packs/ui/dist/lib/grid/easy_grid_columns.js":
/*!************************************************************************************!*\
  !*** c:/projects/easydata/easydata.js/packs/ui/dist/lib/grid/easy_grid_columns.js ***!
  \************************************************************************************/
/*! exports provided: GridColumnAlign, GridColumn, GridColumnList */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "GridColumnAlign", function() { return GridColumnAlign; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "GridColumn", function() { return GridColumn; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "GridColumnList", function() { return GridColumnList; });
/* harmony import */ var _easydata_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @easydata/core */ "../../easydata.js/packs/core/dist/lib/public_api.js");
/* harmony import */ var _easy_grid_cell_renderer__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./easy_grid_cell_renderer */ "../../easydata.js/packs/ui/dist/lib/grid/easy_grid_cell_renderer.js");


var DEFAULT_WIDTH = 150;
var DEFAULT_WIDTH_NUMBER = 120;
var DEFAULT_WIDTH_DATE = 200;
var DEFAULT_WIDTH_BOOL = 80;
var DEFAULT_WIDTH_STRING = 250;
var MIN_WIDTH_STRING = 100;
var MAX_WIDTH_STRING = 500;
var ROW_NUM_WIDTH = 60;
var GridColumnAlign;
(function (GridColumnAlign) {
    GridColumnAlign[GridColumnAlign["NONE"] = 1] = "NONE";
    GridColumnAlign[GridColumnAlign["LEFT"] = 2] = "LEFT";
    GridColumnAlign[GridColumnAlign["CENTER"] = 3] = "CENTER";
    GridColumnAlign[GridColumnAlign["RIGHT"] = 4] = "RIGHT";
})(GridColumnAlign || (GridColumnAlign = {}));
var GridColumn = /** @class */ (function () {
    function GridColumn(column, grid, isRowNum) {
        if (isRowNum === void 0) { isRowNum = false; }
        this._label = null;
        //public left: number;
        this.align = GridColumnAlign.NONE;
        this.isVisible = true;
        this.isRowNum = false;
        this.dataColumn = column;
        this.grid = grid;
        if (column) {
            var coltype = column.type;
            var cellType = this.grid.cellRendererStore.getCellType(coltype);
            switch (cellType) {
                case _easy_grid_cell_renderer__WEBPACK_IMPORTED_MODULE_1__["CellRendererType"].NUMBER:
                    this.width = DEFAULT_WIDTH_NUMBER;
                    break;
                case _easy_grid_cell_renderer__WEBPACK_IMPORTED_MODULE_1__["CellRendererType"].DATETIME:
                    this.width = DEFAULT_WIDTH_DATE;
                    break;
                case _easy_grid_cell_renderer__WEBPACK_IMPORTED_MODULE_1__["CellRendererType"].BOOL:
                    this.width = DEFAULT_WIDTH_BOOL;
                    break;
                default:
                    this.width = DEFAULT_WIDTH_STRING;
            }
            this.cellRenderer = this.grid.cellRendererStore.getDefaultRenderer(column.type);
        }
        else if (isRowNum) {
            this.isRowNum = true;
            this.width = ROW_NUM_WIDTH;
            this._label = '';
            this.cellRenderer = this.grid.cellRendererStore.getDefaultRendererByType(_easy_grid_cell_renderer__WEBPACK_IMPORTED_MODULE_1__["CellRendererType"].NUMBER);
        }
        if (grid && grid.options && grid.options.onGetCellRenderer) {
            this.cellRenderer = grid.options.onGetCellRenderer(this, this.cellRenderer) || this.cellRenderer;
        }
    }
    Object.defineProperty(GridColumn.prototype, "label", {
        get: function () {
            return this._label ? this._label : this.isRowNum ? '' : this.dataColumn.label;
        },
        set: function (value) {
            this._label = this.label;
        },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(GridColumn.prototype, "type", {
        get: function () {
            return this.dataColumn ? this.dataColumn.type : null;
        },
        enumerable: true,
        configurable: true
    });
    return GridColumn;
}());

var GridColumnList = /** @class */ (function () {
    function GridColumnList(columnList, grid) {
        this.items = [];
        this.grid = grid;
        this.sync(columnList);
    }
    GridColumnList.prototype.sync = function (columnList, hasRowNumCol) {
        if (hasRowNumCol === void 0) { hasRowNumCol = true; }
        this.clear();
        if (hasRowNumCol) {
            var rowNumCol = new GridColumn(null, this.grid, true);
            this.add(rowNumCol);
        }
        if (columnList) {
            for (var _i = 0, _a = columnList.getItems(); _i < _a.length; _i++) {
                var column = _a[_i];
                var col = new GridColumn(column, this.grid);
                if (this.grid.options.onSyncGridColumn) {
                    this.grid.options.onSyncGridColumn(col);
                }
                this.add(col);
            }
        }
    };
    Object.defineProperty(GridColumnList.prototype, "count", {
        get: function () {
            return this.items.length;
        },
        enumerable: true,
        configurable: true
    });
    GridColumnList.prototype.add = function (col) {
        var index = this.items.length;
        this.items.push(col);
        return index;
    };
    GridColumnList.prototype.put = function (index, col) {
        if (index >= 0 && index < this.items.length) {
            this.items[index] = col;
        }
    };
    GridColumnList.prototype.move = function (col, newIndex) {
        var oldIndex = this.items.indexOf(col);
        if (oldIndex >= 0 && oldIndex != newIndex)
            _easydata_core__WEBPACK_IMPORTED_MODULE_0__["utils"].moveArrayItem(this.items, oldIndex, newIndex);
    };
    GridColumnList.prototype.get = function (index) {
        if (index >= 0 && index < this.items.length) {
            return this.items[index];
        }
        else {
            return null;
        }
    };
    //    public getIndex(name: string) : number {
    //        return this.mapper[name];
    //    }
    GridColumnList.prototype.getItems = function () {
        return this.items;
    };
    GridColumnList.prototype.removeAt = function (index) {
        var col = this.get(index);
        this.items.splice(index, 1);
        //delete this.mapper[col.name];
    };
    GridColumnList.prototype.clear = function () {
        this.items = [];
        //this.mapper = {};
    };
    return GridColumnList;
}());

//# sourceMappingURL=easy_grid_columns.js.map

/***/ }),

/***/ "../../easydata.js/packs/ui/dist/lib/i18n/text_resources.js":
/*!*********************************************************************************!*\
  !*** c:/projects/easydata/easydata.js/packs/ui/dist/lib/i18n/text_resources.js ***!
  \*********************************************************************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _easydata_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @easydata/core */ "../../easydata.js/packs/core/dist/lib/public_api.js");

function addEasyDataUITexts() {
    _easydata_core__WEBPACK_IMPORTED_MODULE_0__["i18n"].updateLocaleTexts({
        GridPageInfo: '{FirstPageRecordNum} - {LastPageRecordNum} of {Total} records',
        ButtonApply: 'Apply',
        ButtonNow: 'Now'
    });
}
addEasyDataUITexts();
//# sourceMappingURL=text_resources.js.map

/***/ }),

/***/ "../../easydata.js/packs/ui/dist/lib/public_api.js":
/*!************************************************************************!*\
  !*** c:/projects/easydata/easydata.js/packs/ui/dist/lib/public_api.js ***!
  \************************************************************************/
/*! exports provided: EasyGrid, GridColumnAlign, GridColumn, GridColumnList, CellRendererType, GridCellRendererStore, Calendar, DateTimePicker, DefaultCalendar, DefaultDateTimePicker, DefaultTimePicker, TimePicker, browserUtils, DomElementBuilder, DomInputElementBuilder, DomSelectElementBuilder, domel, DropEffect, EqDragEvent, DragManager, eqDragManager, mask, wrapInner, addElement, addCssClass, hideElement, showElement, toggleVisibility, isVisible, createBrowserEvent, getViewportSize, getDocSize, getScrollPos, getElementAbsolutePos, getWinSize, slideDown, slideUp, eqCssPrefix, eqCssMobile, DefaultDialogService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _grid_easy_grid__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./grid/easy_grid */ "../../easydata.js/packs/ui/dist/lib/grid/easy_grid.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "EasyGrid", function() { return _grid_easy_grid__WEBPACK_IMPORTED_MODULE_0__["EasyGrid"]; });

/* harmony import */ var _grid_easy_grid_columns__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./grid/easy_grid_columns */ "../../easydata.js/packs/ui/dist/lib/grid/easy_grid_columns.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "GridColumnAlign", function() { return _grid_easy_grid_columns__WEBPACK_IMPORTED_MODULE_1__["GridColumnAlign"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "GridColumn", function() { return _grid_easy_grid_columns__WEBPACK_IMPORTED_MODULE_1__["GridColumn"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "GridColumnList", function() { return _grid_easy_grid_columns__WEBPACK_IMPORTED_MODULE_1__["GridColumnList"]; });

/* harmony import */ var _grid_easy_grid_cell_renderer__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./grid/easy_grid_cell_renderer */ "../../easydata.js/packs/ui/dist/lib/grid/easy_grid_cell_renderer.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "CellRendererType", function() { return _grid_easy_grid_cell_renderer__WEBPACK_IMPORTED_MODULE_2__["CellRendererType"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "GridCellRendererStore", function() { return _grid_easy_grid_cell_renderer__WEBPACK_IMPORTED_MODULE_2__["GridCellRendererStore"]; });

/* harmony import */ var _datetimepicker_calendar__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./datetimepicker/calendar */ "../../easydata.js/packs/ui/dist/lib/datetimepicker/calendar.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Calendar", function() { return _datetimepicker_calendar__WEBPACK_IMPORTED_MODULE_3__["Calendar"]; });

/* harmony import */ var _datetimepicker_date_time_picker__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./datetimepicker/date_time_picker */ "../../easydata.js/packs/ui/dist/lib/datetimepicker/date_time_picker.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "DateTimePicker", function() { return _datetimepicker_date_time_picker__WEBPACK_IMPORTED_MODULE_4__["DateTimePicker"]; });

/* harmony import */ var _datetimepicker_default_calendar__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./datetimepicker/default_calendar */ "../../easydata.js/packs/ui/dist/lib/datetimepicker/default_calendar.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "DefaultCalendar", function() { return _datetimepicker_default_calendar__WEBPACK_IMPORTED_MODULE_5__["DefaultCalendar"]; });

/* harmony import */ var _datetimepicker_default_date_time_picker__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./datetimepicker/default_date_time_picker */ "../../easydata.js/packs/ui/dist/lib/datetimepicker/default_date_time_picker.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "DefaultDateTimePicker", function() { return _datetimepicker_default_date_time_picker__WEBPACK_IMPORTED_MODULE_6__["DefaultDateTimePicker"]; });

/* harmony import */ var _datetimepicker_default_time_picker__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./datetimepicker/default_time_picker */ "../../easydata.js/packs/ui/dist/lib/datetimepicker/default_time_picker.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "DefaultTimePicker", function() { return _datetimepicker_default_time_picker__WEBPACK_IMPORTED_MODULE_7__["DefaultTimePicker"]; });

/* harmony import */ var _datetimepicker_time_picker__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./datetimepicker/time_picker */ "../../easydata.js/packs/ui/dist/lib/datetimepicker/time_picker.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "TimePicker", function() { return _datetimepicker_time_picker__WEBPACK_IMPORTED_MODULE_8__["TimePicker"]; });

/* harmony import */ var _utils_browser_utils__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./utils/browser_utils */ "../../easydata.js/packs/ui/dist/lib/utils/browser_utils.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "browserUtils", function() { return _utils_browser_utils__WEBPACK_IMPORTED_MODULE_9__["browserUtils"]; });

/* harmony import */ var _utils_dom_elem_builder__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./utils/dom_elem_builder */ "../../easydata.js/packs/ui/dist/lib/utils/dom_elem_builder.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "DomElementBuilder", function() { return _utils_dom_elem_builder__WEBPACK_IMPORTED_MODULE_10__["DomElementBuilder"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "DomInputElementBuilder", function() { return _utils_dom_elem_builder__WEBPACK_IMPORTED_MODULE_10__["DomInputElementBuilder"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "DomSelectElementBuilder", function() { return _utils_dom_elem_builder__WEBPACK_IMPORTED_MODULE_10__["DomSelectElementBuilder"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "domel", function() { return _utils_dom_elem_builder__WEBPACK_IMPORTED_MODULE_10__["domel"]; });

/* harmony import */ var _utils_drag_manager__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./utils/drag_manager */ "../../easydata.js/packs/ui/dist/lib/utils/drag_manager.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "DropEffect", function() { return _utils_drag_manager__WEBPACK_IMPORTED_MODULE_11__["DropEffect"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "EqDragEvent", function() { return _utils_drag_manager__WEBPACK_IMPORTED_MODULE_11__["EqDragEvent"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "DragManager", function() { return _utils_drag_manager__WEBPACK_IMPORTED_MODULE_11__["DragManager"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "eqDragManager", function() { return _utils_drag_manager__WEBPACK_IMPORTED_MODULE_11__["eqDragManager"]; });

/* harmony import */ var _utils_mask__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./utils/mask */ "../../easydata.js/packs/ui/dist/lib/utils/mask.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "mask", function() { return _utils_mask__WEBPACK_IMPORTED_MODULE_12__["mask"]; });

/* harmony import */ var _utils_ui_utils__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./utils/ui-utils */ "../../easydata.js/packs/ui/dist/lib/utils/ui-utils.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "wrapInner", function() { return _utils_ui_utils__WEBPACK_IMPORTED_MODULE_13__["wrapInner"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "addElement", function() { return _utils_ui_utils__WEBPACK_IMPORTED_MODULE_13__["addElement"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "addCssClass", function() { return _utils_ui_utils__WEBPACK_IMPORTED_MODULE_13__["addCssClass"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "hideElement", function() { return _utils_ui_utils__WEBPACK_IMPORTED_MODULE_13__["hideElement"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "showElement", function() { return _utils_ui_utils__WEBPACK_IMPORTED_MODULE_13__["showElement"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "toggleVisibility", function() { return _utils_ui_utils__WEBPACK_IMPORTED_MODULE_13__["toggleVisibility"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "isVisible", function() { return _utils_ui_utils__WEBPACK_IMPORTED_MODULE_13__["isVisible"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "createBrowserEvent", function() { return _utils_ui_utils__WEBPACK_IMPORTED_MODULE_13__["createBrowserEvent"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getViewportSize", function() { return _utils_ui_utils__WEBPACK_IMPORTED_MODULE_13__["getViewportSize"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getDocSize", function() { return _utils_ui_utils__WEBPACK_IMPORTED_MODULE_13__["getDocSize"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getScrollPos", function() { return _utils_ui_utils__WEBPACK_IMPORTED_MODULE_13__["getScrollPos"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getElementAbsolutePos", function() { return _utils_ui_utils__WEBPACK_IMPORTED_MODULE_13__["getElementAbsolutePos"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getWinSize", function() { return _utils_ui_utils__WEBPACK_IMPORTED_MODULE_13__["getWinSize"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "slideDown", function() { return _utils_ui_utils__WEBPACK_IMPORTED_MODULE_13__["slideDown"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "slideUp", function() { return _utils_ui_utils__WEBPACK_IMPORTED_MODULE_13__["slideUp"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "eqCssPrefix", function() { return _utils_ui_utils__WEBPACK_IMPORTED_MODULE_13__["eqCssPrefix"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "eqCssMobile", function() { return _utils_ui_utils__WEBPACK_IMPORTED_MODULE_13__["eqCssMobile"]; });

/* harmony import */ var _dialogs_default_dialog_service__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./dialogs/default_dialog_service */ "../../easydata.js/packs/ui/dist/lib/dialogs/default_dialog_service.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "DefaultDialogService", function() { return _dialogs_default_dialog_service__WEBPACK_IMPORTED_MODULE_14__["DefaultDialogService"]; });

/* harmony import */ var _i18n_text_resources__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./i18n/text_resources */ "../../easydata.js/packs/ui/dist/lib/i18n/text_resources.js");
// grid



//datetimepicker






// utils





//dialogs


//# sourceMappingURL=public_api.js.map

/***/ }),

/***/ "../../easydata.js/packs/ui/dist/lib/utils/browser_utils.js":
/*!*********************************************************************************!*\
  !*** c:/projects/easydata/easydata.js/packs/ui/dist/lib/utils/browser_utils.js ***!
  \*********************************************************************************/
/*! exports provided: browserUtils */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "browserUtils", function() { return browserUtils; });
var browserUtils;
(function (browserUtils) {
    var _isFirefox = null;
    var _isIE = null;
    function IsIE() {
        // return eval('/*@cc_on!@*/false || !!document.documentMode');
        if (_isIE === null) {
            var ua = navigator.userAgent;
            /* MSIE used to detect old browsers and Trident used to newer ones*/
            _isIE = ua.indexOf("MSIE ") > -1 || ua.indexOf("Trident/") > -1;
        }
        return _isIE;
    }
    browserUtils.IsIE = IsIE;
    function IsEdge() {
        return !IsIE() && eval('!!window.StyleMedia');
    }
    browserUtils.IsEdge = IsEdge;
    function IsFirefox() {
        if (_isFirefox === null) {
            var ua = navigator.userAgent;
            _isFirefox = ua.toLowerCase().indexOf('firefox') > -1;
        }
        return _isFirefox;
    }
    browserUtils.IsFirefox = IsFirefox;
    var _detectedIsMobileMode = false;
    var _isMobileMode = undefined;
    var detectIsMobileMode = function () {
        var oldValue = isMobileMode();
        _detectedIsMobileMode = window.matchMedia('only screen and (max-width: 840px)').matches
            || window.matchMedia('only screen and (max-height: 420px)').matches;
        var newValue = isMobileMode();
        if (newValue !== oldValue && mobileModeChangeHandler) {
            mobileModeChangeHandler(newValue);
        }
    };
    detectIsMobileMode();
    window.addEventListener('resize', function () { return detectIsMobileMode(); });
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
        var oldValue = isMobileMode();
        _isMobileMode = value;
        var newValue = isMobileMode();
        if (newValue !== oldValue && mobileModeChangeHandler) {
            mobileModeChangeHandler(newValue);
        }
    }
    browserUtils.setIsMobileMode = setIsMobileMode;
    var mobileModeChangeHandler;
    function onMobileModeChanged(callback) {
        mobileModeChangeHandler = callback;
    }
    browserUtils.onMobileModeChanged = onMobileModeChanged;
    function getMobileCssClass() {
        return isMobileMode() ? 'k-mobile' : null;
    }
    browserUtils.getMobileCssClass = getMobileCssClass;
})(browserUtils || (browserUtils = {}));
//# sourceMappingURL=browser_utils.js.map

/***/ }),

/***/ "../../easydata.js/packs/ui/dist/lib/utils/dom_elem_builder.js":
/*!************************************************************************************!*\
  !*** c:/projects/easydata/easydata.js/packs/ui/dist/lib/utils/dom_elem_builder.js ***!
  \************************************************************************************/
/*! exports provided: DomElementBuilder, DomInputElementBuilder, DomSelectElementBuilder, domel */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DomElementBuilder", function() { return DomElementBuilder; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DomInputElementBuilder", function() { return DomInputElementBuilder; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DomSelectElementBuilder", function() { return DomSelectElementBuilder; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "domel", function() { return domel; });
/* harmony import */ var _mask__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./mask */ "../../easydata.js/packs/ui/dist/lib/utils/mask.js");
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();

var DomElementBuilder = /** @class */ (function () {
    function DomElementBuilder(tag, parent) {
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
    DomElementBuilder.prototype.addChild = function (tag, childBuilder) {
        var builder = domel(tag, this.element);
        if (childBuilder) {
            childBuilder(builder);
        }
        return this;
    };
    DomElementBuilder.prototype.addChildElement = function (element) {
        if (element) {
            this.element.appendChild(element);
        }
        return this;
    };
    DomElementBuilder.prototype.attr = function (attrId, attrValue) {
        this.element.setAttribute(attrId, attrValue);
        return this;
    };
    DomElementBuilder.prototype.id = function (value) {
        return this.attr("id", value);
    };
    DomElementBuilder.prototype.title = function (value) {
        return this.attr('title', value);
    };
    DomElementBuilder.prototype.data = function (dataId, dataValue) {
        if (dataValue === void 0) { dataValue = null; }
        if (dataValue === null) {
            this.element.removeAttribute('data-' + dataId);
            return this;
        }
        else {
            return this.attr('data-' + dataId, dataValue);
        }
    };
    DomElementBuilder.prototype.show = function () {
        return this.removeStyle('display');
    };
    DomElementBuilder.prototype.hide = function (toHide) {
        if (toHide === void 0) { toHide = true; }
        return (toHide) ? this.setStyle('display', 'none') : this;
    };
    DomElementBuilder.prototype.visible = function (isVisible) {
        if (isVisible === void 0) { isVisible = true; }
        return isVisible ? this.setStyle('visibility', 'visible') : this.setStyle('visibility', 'hidden');
    };
    DomElementBuilder.prototype.isVisible = function () {
        return !!(this.element.offsetWidth || this.element.offsetHeight || this.element.getClientRects().length);
    };
    DomElementBuilder.prototype.addClass = function (className) {
        var classNames = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            classNames[_i - 1] = arguments[_i];
        }
        if (className) {
            var fullList = className.trim().split(" ").concat(classNames);
            for (var i = 0; i < fullList.length; i++)
                this.element.classList.add(fullList[i]);
        }
        return this;
    };
    DomElementBuilder.prototype.removeClass = function (className) {
        var classNames = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            classNames[_i - 1] = arguments[_i];
        }
        if (className) {
            var fullList = className.trim().split(" ").concat(classNames);
            for (var i = 0; i < fullList.length; i++)
                this.element.classList.remove(fullList[i]);
        }
        return this;
    };
    DomElementBuilder.prototype.toggleClass = function (className, force) {
        if (force === void 0) { force = undefined; }
        if (className) {
            this.element.classList.toggle(className, force);
        }
        return this;
    };
    DomElementBuilder.prototype.on = function (eventType, listener) {
        var eventTypes = eventType.split(' ');
        for (var i = 0; i < eventTypes.length; i++) {
            this.element.addEventListener(eventTypes[i], listener);
        }
        return this;
    };
    DomElementBuilder.prototype.off = function (eventType, listener) {
        var eventTypes = eventType.split(' ');
        for (var i = 0; i < eventTypes.length; i++) {
            this.element.removeEventListener(eventTypes[i], listener);
        }
        return this;
    };
    DomElementBuilder.prototype.setStyle = function (styleId, styleValue) {
        this.element.style.setProperty(styleId, styleValue);
        return this;
    };
    DomElementBuilder.prototype.removeStyle = function (styleId) {
        this.element.style.removeProperty(styleId);
        return this;
    };
    DomElementBuilder.prototype.text = function (text) {
        this.element.innerText = text;
        return this;
    };
    DomElementBuilder.prototype.html = function (html) {
        this.element.innerHTML = html;
        return this;
    };
    DomElementBuilder.prototype.clear = function () {
        var oldElem = this.element;
        this.element = document.createElement(this.element.tagName);
        oldElem.replaceWith(this.element);
    };
    DomElementBuilder.prototype.addText = function (text) {
        var textEl = document.createTextNode(text);
        this.element.appendChild(textEl);
        return this;
    };
    DomElementBuilder.prototype.addHtml = function (html) {
        this.element.innerHTML += html;
        return this;
    };
    DomElementBuilder.prototype.toDOM = function () {
        return this.element;
    };
    DomElementBuilder.prototype.appendTo = function (parent) {
        if (parent) {
            parent.appendChild(this.element);
        }
        return this;
    };
    return DomElementBuilder;
}());

var DomInputElementBuilder = /** @class */ (function (_super) {
    __extends(DomInputElementBuilder, _super);
    function DomInputElementBuilder(element, parent) {
        var _this = this;
        if (element) {
            _this = _super.call(this, element, parent) || this;
        }
        else {
            _this = _super.call(this, "input", parent) || this;
        }
        return _this;
    }
    DomInputElementBuilder.prototype.name = function (value) {
        this.element.name = value;
        return this;
    };
    DomInputElementBuilder.prototype.type = function (value) {
        this.element.type = value;
        return this;
    };
    DomInputElementBuilder.prototype.size = function (value) {
        this.element.size = value;
        return this;
    };
    DomInputElementBuilder.prototype.value = function (value) {
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
    };
    DomInputElementBuilder.prototype.mask = function (maskPattern) {
        Object(_mask__WEBPACK_IMPORTED_MODULE_0__["mask"])(this.element, maskPattern);
        return this;
    };
    return DomInputElementBuilder;
}(DomElementBuilder));

var DomSelectElementBuilder = /** @class */ (function (_super) {
    __extends(DomSelectElementBuilder, _super);
    function DomSelectElementBuilder(element, parent) {
        var _this = this;
        if (element) {
            _this = _super.call(this, element, parent) || this;
        }
        else {
            _this = _super.call(this, "select", parent) || this;
        }
        return _this;
    }
    DomSelectElementBuilder.prototype.addOption = function (value) {
        var option = document.createElement('option');
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
    };
    return DomSelectElementBuilder;
}(DomElementBuilder));

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
    else if (tag === "select" || tag instanceof HTMLSelectElement) {
        return new DomSelectElementBuilder(tag instanceof HTMLSelectElement ? tag : null, parent);
    }
    return new DomElementBuilder(tag, parent);
}
//# sourceMappingURL=dom_elem_builder.js.map

/***/ }),

/***/ "../../easydata.js/packs/ui/dist/lib/utils/drag_manager.js":
/*!********************************************************************************!*\
  !*** c:/projects/easydata/easydata.js/packs/ui/dist/lib/utils/drag_manager.js ***!
  \********************************************************************************/
/*! exports provided: DropEffect, EqDragEvent, DragManager, eqDragManager */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DropEffect", function() { return DropEffect; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "EqDragEvent", function() { return EqDragEvent; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DragManager", function() { return DragManager; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "eqDragManager", function() { return eqDragManager; });
/* harmony import */ var _easydata_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @easydata/core */ "../../easydata.js/packs/core/dist/lib/public_api.js");
/* harmony import */ var _ui_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ui-utils */ "../../easydata.js/packs/ui/dist/lib/utils/ui-utils.js");
/* harmony import */ var _utils_dom_elem_builder__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/dom_elem_builder */ "../../easydata.js/packs/ui/dist/lib/utils/dom_elem_builder.js");



var touchEventIsDefined = typeof TouchEvent !== 'undefined';
var DropEffect;
(function (DropEffect) {
    DropEffect["None"] = "none";
    DropEffect["Allow"] = "allow";
    DropEffect["Forbid"] = "forbid";
})(DropEffect || (DropEffect = {}));
var EqDragEvent = /** @class */ (function () {
    function EqDragEvent(item, dragImage, sourceEvent) {
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
    return EqDragEvent;
}());

var Position = /** @class */ (function () {
    function Position(ev) {
        if (ev && ev instanceof MouseEvent) {
            this.x = ev.pageX,
                this.y = ev.pageY;
        }
        if (ev && touchEventIsDefined && ev instanceof TouchEvent && ev.touches[0]) {
            this.x = ev.touches[0].pageX,
                this.y = ev.touches[0].pageY;
        }
    }
    return Position;
}());
var DragManager = /** @class */ (function () {
    function DragManager() {
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
    DragManager.prototype.registerDraggableItem = function (descriptor) {
        var _this = this;
        var element = descriptor.element;
        if (!element) {
            throw Error("Element in draggle item is null or undefined");
        }
        element.ondragstart = function () {
            return false;
        };
        var detectDragging = function (ev) {
            if (element.hasAttribute(_this.DRAG_DISABLED_ATTR)) {
                return;
            }
            ev.preventDefault();
            if (ev instanceof MouseEvent) {
                ev.stopPropagation();
            }
            var cursorPosition = new Position(ev);
            if (Math.abs(cursorPosition.x - _this.mouseDownPosition.x) > _this.delta
                || Math.abs(cursorPosition.y - _this.mouseDownPosition.y) > _this.delta) {
                startDragging(ev);
            }
        };
        var mouseMoveEventListener = function (ev) {
            _this.mouseMoveDragListener(ev);
        };
        var startDragging = function (ev) {
            ev.preventDefault();
            ev.stopPropagation();
            element.removeEventListener('mousemove', detectDragging);
            element.removeEventListener('touchmove', detectDragging);
            _this.finishedSuccessfully = false;
            if (descriptor.beforeDragStart)
                descriptor.beforeDragStart();
            _this.dragImage = Object(_utils_dom_elem_builder__WEBPACK_IMPORTED_MODULE_2__["domel"])('div')
                .setStyle('position', 'absolute')
                .setStyle('z-index', '65530')
                .toDOM();
            document.body.appendChild(_this.dragImage);
            _this.dragImage.appendChild(element.cloneNode(true));
            if (descriptor.renderer) {
                descriptor.renderer(_this.dragImage);
            }
            _this.dropEffect = DropEffect.None;
            _this.updateCusror(_this.dropEffect);
            _this.updateImageClass(_this.dropEffect);
            _this.draggableItem = {
                element: element,
                scope: descriptor.scope,
                data: descriptor.data
            };
            _this.updateDragItemPosition(ev);
            var event = new EqDragEvent(_this.draggableItem, _this.dragImage, ev);
            event.dropEffect = _this.dropEffect;
            if (descriptor.onDragStart) {
                descriptor.onDragStart(event);
            }
            if (_this.dropEffect !== event.dropEffect) {
                _this.dropEffect = event.dropEffect;
                _this.updateImageClass(_this.dropEffect);
            }
            document.addEventListener('mousemove', mouseMoveEventListener, true);
            document.addEventListener('touchmove', mouseMoveEventListener, true);
        };
        var mouseDownListener = function (ev) {
            if (touchEventIsDefined && ev instanceof TouchEvent) {
                ev.preventDefault();
            }
            _this.mouseDownPosition = new Position(ev);
            element.addEventListener('mousemove', detectDragging);
            element.addEventListener('touchmove', detectDragging);
            document.addEventListener('mouseup', mouseUpListener);
            document.addEventListener('touchend', mouseUpListener);
        };
        element.addEventListener('mousedown', mouseDownListener);
        element.addEventListener('touchstart', mouseDownListener);
        var mouseUpListener = function (ev) {
            _this.mouseDownPosition = null;
            element.removeEventListener('mousemove', detectDragging);
            element.removeEventListener('touchmove', detectDragging);
            document.removeEventListener('mousemove', mouseMoveEventListener, true);
            document.removeEventListener('touchmove', mouseMoveEventListener, true);
            if (_this.draggableItem) {
                endDraggind(ev);
            }
        };
        var endDraggind = function (ev) {
            try {
                if (_this.containerDescriptorIndex >= 0) {
                    var dropContDesc = _this.containerDescriptors[_this.containerDescriptorIndex];
                    var container = {
                        element: dropContDesc.element,
                        scopes: dropContDesc.scopes,
                        data: dropContDesc.data
                    };
                    var event_1 = new EqDragEvent(_this.draggableItem, _this.dragImage, ev);
                    try {
                        if (container.scopes.indexOf(_this.draggableItem.scope) >= 0
                            && _this.dropEffect === DropEffect.Allow) {
                            _this.finishedSuccessfully = true;
                            if (dropContDesc.onDrop) {
                                dropContDesc.onDrop(container, event_1);
                            }
                        }
                    }
                    finally {
                        if (dropContDesc.onDragLeave) {
                            dropContDesc.onDragLeave(container, event_1);
                        }
                    }
                }
            }
            finally {
                try {
                    var event_2 = new EqDragEvent(_this.draggableItem, _this.dragImage, ev);
                    event_2.data.finishedSuccessfully = _this.finishedSuccessfully;
                    if (descriptor.onDragEnd) {
                        descriptor.onDragEnd(event_2);
                    }
                }
                finally {
                    _this.draggableItem = null;
                    if (_this.dragImage && _this.dragImage.parentElement) {
                        _this.dragImage.parentElement.removeChild(_this.dragImage);
                    }
                    _this.dragImage = null;
                    _this.finishedSuccessfully = false;
                    document.removeEventListener('mouseup', mouseUpListener);
                    document.removeEventListener('touchend', mouseUpListener);
                }
            }
        };
    };
    DragManager.prototype.registerDropContainer = function (descriptor) {
        var element = descriptor.element;
        if (!element) {
            throw Error("Element in drop container is null or undefined");
        }
        this.containerDescriptors.push(descriptor);
    };
    DragManager.prototype.removeDropContainer = function (descriptorOrSlot) {
        var descs = this.containerDescriptors
            .filter(function (desc) { return desc === descriptorOrSlot
            || desc.element == descriptorOrSlot; });
        if (descs) {
            for (var _i = 0, descs_1 = descs; _i < descs_1.length; _i++) {
                var desc = descs_1[_i];
                _easydata_core__WEBPACK_IMPORTED_MODULE_0__["utils"].removeArrayItem(this.containerDescriptors, desc);
            }
        }
    };
    DragManager.prototype.mouseMoveDragListener = function (ev) {
        if (ev instanceof MouseEvent) {
            ev.preventDefault();
        }
        ev.stopPropagation();
        this.updateDragItemPosition(ev);
        if (this.containerDescriptorIndex == -1) {
            for (var i = 0; i < this.containerDescriptors.length; i++) {
                var descriptor = this.containerDescriptors[i];
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
            var descriptor = this.containerDescriptors[this.containerDescriptorIndex];
            if (this.detectDragLeaveEvent(descriptor.element, ev)) {
                this.dragLeaveEvent(ev);
                this.containerDescriptorIndex = -1;
            }
        }
        if (this.containerDescriptorIndex >= 0) {
            var descriptor = this.containerDescriptors[this.containerDescriptorIndex];
            var container = {
                element: descriptor.element,
                scopes: descriptor.scopes,
                data: descriptor.data
            };
            if (container.scopes.indexOf(this.draggableItem.scope) >= 0) {
                var event_3 = new EqDragEvent(this.draggableItem, this.dragImage, ev);
                event_3.dropEffect = this.dropEffect;
                if (descriptor.onDragOver) {
                    descriptor.onDragOver(container, event_3);
                }
            }
        }
    };
    DragManager.prototype.updateCusror = function (dropEffect) {
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
    };
    DragManager.prototype.updateImageClass = function (dropEffect) {
        this.dragImage.classList.remove(this.classPrefix + "-allow");
        this.dragImage.classList.remove(this.classPrefix + "-forbid");
        this.dragImage.classList.remove(this.classPrefix + "-none");
        switch (dropEffect) {
            case DropEffect.Allow:
                this.dragImage.classList.add(this.classPrefix + "-allow");
                break;
            case DropEffect.None:
                this.dragImage.classList.add(this.classPrefix + "-none");
                break;
            case DropEffect.Forbid:
                this.dragImage.classList.add(this.classPrefix + "-forbid");
                break;
            default:
                this.dragImage.classList.add(this.classPrefix + "-none");
                break;
        }
    };
    DragManager.prototype.setCursorStyle = function (element, cursor) {
        if (element) {
            element.style.cursor = cursor;
            for (var i = 0; i < element.children.length; i++) {
                this.setCursorStyle(element.children[i], cursor);
            }
        }
    };
    DragManager.prototype.updateDragItemPosition = function (ev) {
        if (this.dragImage) {
            var pos = new Position(ev);
            this.dragImage.style.top = (pos.y - this.dragImage.offsetHeight / 2) + 'px';
            this.dragImage.style.left = (pos.x - this.dragImage.offsetWidth / 2) + 'px';
        }
    };
    DragManager.prototype.dragEnterEvent = function (ev) {
        var descriptor = this.containerDescriptors[this.containerDescriptorIndex];
        var container = {
            element: descriptor.element,
            scopes: descriptor.scopes,
            data: descriptor.data
        };
        if (container.scopes.indexOf(this.draggableItem.scope) >= 0) {
            var event_4 = new EqDragEvent(this.draggableItem, this.dragImage, ev);
            event_4.dropEffect = DropEffect.Allow;
            if (descriptor.onDragEnter) {
                descriptor.onDragEnter(container, event_4);
            }
            this.dropEffect = event_4.dropEffect;
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
    };
    DragManager.prototype.dragLeaveEvent = function (ev) {
        var descriptor = this.containerDescriptors[this.containerDescriptorIndex];
        var container = {
            element: descriptor.element,
            scopes: descriptor.scopes,
            data: descriptor.data
        };
        if (container.scopes.indexOf(this.draggableItem.scope) >= 0) {
            var event_5 = new EqDragEvent(this.draggableItem, this.dragImage, ev);
            event_5.dropEffect = DropEffect.None;
            if (descriptor.onDragLeave) {
                descriptor.onDragLeave(container, event_5);
            }
            this.dropEffect = event_5.dropEffect;
            this.updateCusror(this.dropEffect);
            this.updateImageClass(this.dropEffect);
        }
    };
    DragManager.prototype.detectDragEnterEvent = function (container, ev) {
        var containerPos = Object(_ui_utils__WEBPACK_IMPORTED_MODULE_1__["getElementAbsolutePos"])(container);
        var pos = new Position(ev);
        if (pos.y < containerPos.y || pos.y > containerPos.y + container.offsetHeight) {
            return false;
        }
        if (pos.x < containerPos.x || pos.x > containerPos.x + container.offsetWidth) {
            return false;
        }
        return true;
    };
    DragManager.prototype.detectDragLeaveEvent = function (container, ev) {
        var containerPos = Object(_ui_utils__WEBPACK_IMPORTED_MODULE_1__["getElementAbsolutePos"])(container);
        var pos = new Position(ev);
        if (pos.y > containerPos.y && pos.y < containerPos.y + container.offsetHeight
            && pos.x > containerPos.x && pos.x < containerPos.x + container.offsetWidth) {
            return false;
        }
        return true;
    };
    return DragManager;
}());

//global variable
var eqDragManager = new DragManager();
//# sourceMappingURL=drag_manager.js.map

/***/ }),

/***/ "../../easydata.js/packs/ui/dist/lib/utils/mask.js":
/*!************************************************************************!*\
  !*** c:/projects/easydata/easydata.js/packs/ui/dist/lib/utils/mask.js ***!
  \************************************************************************/
/*! exports provided: mask */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "mask", function() { return mask; });
function mask(input, maskPattern) {
    var d = { 9: '[0-9]', a: '[a-z]' };
    var mask = maskPattern.split('');
    var keyDownHandler = function (e) {
        // backspace key or delete key
        if (e.keyCode === 8 || e.keyCode === 46) {
            e.preventDefault();
            var mskd = [];
            var startSelection = input.selectionStart;
            if (startSelection == 0)
                return;
            var selection = startSelection;
            var onlyLodash = true;
            for (var index = mask.length - 1; index >= 0; index--) {
                var el = mask[index];
                if (d[el]) {
                    var t = new RegExp(d[el], 'i').test(input.value.charAt(index));
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
            var event_1 = document.createEvent('Event');
            event_1.initEvent('input', true, true);
            input.dispatchEvent(event_1);
        }
    };
    var keyPressHandler = function (e) {
        var char = String.fromCharCode(e.charCode);
        if (char) {
            e.preventDefault();
            var mskd_1 = [];
            var selectionStart_1 = input.selectionStart;
            var selection_1 = selectionStart_1;
            mask.forEach(function (el, index) {
                if (d[el]) {
                    var ch = (index != selectionStart_1)
                        ? input.value.charAt(index)
                        : char;
                    var t = new RegExp(d[el], 'i').test(ch);
                    mskd_1.push(t ? ch : '_');
                    if (t && selectionStart_1 === index)
                        selection_1++;
                }
                else {
                    mskd_1.push(el);
                    if (selection_1 === index)
                        selection_1++;
                    if (selectionStart_1 === index)
                        selectionStart_1++;
                }
            });
            input.value = mskd_1.join('');
            input.selectionStart = input.selectionEnd = selection_1;
            var event_2 = document.createEvent('Event');
            event_2.initEvent('input', true, true);
            input.dispatchEvent(event_2);
        }
    };
    var inputHandler = function (e) {
        if (e.type === 'focus' && input.value !== '')
            return;
        var mskd = [];
        var startSelection = input.selectionStart;
        mask.forEach(function (el, index) {
            if (d[el]) {
                var t = new RegExp(d[el], 'i').test(input.value.charAt(index));
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
//# sourceMappingURL=mask.js.map

/***/ }),

/***/ "../../easydata.js/packs/ui/dist/lib/utils/ui-utils.js":
/*!****************************************************************************!*\
  !*** c:/projects/easydata/easydata.js/packs/ui/dist/lib/utils/ui-utils.js ***!
  \****************************************************************************/
/*! exports provided: wrapInner, addElement, addCssClass, hideElement, showElement, toggleVisibility, isVisible, createBrowserEvent, getViewportSize, getDocSize, getScrollPos, getElementAbsolutePos, getWinSize, slideDown, slideUp, eqCssPrefix, eqCssMobile */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "wrapInner", function() { return wrapInner; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "addElement", function() { return addElement; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "addCssClass", function() { return addCssClass; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "hideElement", function() { return hideElement; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "showElement", function() { return showElement; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "toggleVisibility", function() { return toggleVisibility; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isVisible", function() { return isVisible; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createBrowserEvent", function() { return createBrowserEvent; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getViewportSize", function() { return getViewportSize; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getDocSize", function() { return getDocSize; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getScrollPos", function() { return getScrollPos; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getElementAbsolutePos", function() { return getElementAbsolutePos; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getWinSize", function() { return getWinSize; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "slideDown", function() { return slideDown; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "slideUp", function() { return slideUp; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "eqCssPrefix", function() { return eqCssPrefix; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "eqCssMobile", function() { return eqCssMobile; });
/* harmony import */ var _browser_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./browser_utils */ "../../easydata.js/packs/ui/dist/lib/utils/browser_utils.js");

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
    var element = document.createElement(tag);
    var opts = options || {};
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
    var width = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    var height = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
    return {
        width: width,
        height: height
    };
}
function getDocSize() {
    if (_browser_utils__WEBPACK_IMPORTED_MODULE_0__["browserUtils"].IsIE())
        return getWinSize();
    var width = Math.max(document.documentElement.clientWidth, document.body.clientWidth || 0);
    var height = Math.max(document.documentElement.clientHeight, document.body.clientHeight || 0);
    return {
        width: width,
        height: height
    };
}
function getScrollPos() {
    var body = document.body;
    var docElem = document.documentElement;
    return {
        top: window.pageYOffset || docElem.scrollTop || body.scrollTop,
        left: window.pageXOffset || docElem.scrollLeft || body.scrollLeft
    };
}
function getElementAbsolutePos(element) {
    var res = { x: 0, y: 0 };
    if (element !== null) {
        var position = offset(element);
        res = { x: position.left, y: position.top };
    }
    return res;
}
function offset(element) {
    var defaultBoundingClientRect = { top: 0, right: 0, bottom: 0, left: 0, width: 0, height: 0 };
    var box;
    try {
        box = element.getBoundingClientRect();
    }
    catch (_a) {
        box = defaultBoundingClientRect;
    }
    var body = document.body;
    var docElem = document.documentElement;
    var scollPos = getScrollPos();
    var scrollTop = scollPos.top;
    var scrollLeft = scollPos.left;
    var clientTop = docElem.clientTop || body.clientTop || 0;
    var clientLeft = docElem.clientLeft || body.clientLeft || 0;
    var top = box.top + scrollTop - clientTop;
    var left = box.left + scrollLeft - clientLeft;
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
    var display = window.getComputedStyle(target).display;
    if (display === 'none')
        display = 'block';
    target.style.display = display;
    var height = target.offsetHeight;
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
    window.setTimeout(function () {
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
    window.setTimeout(function () {
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
var eqCssPrefix = 'eqjs';
var eqCssMobile = 'eqjs-mobile';
//# sourceMappingURL=ui-utils.js.map

/***/ }),

/***/ "../../easydata.js/packs/ui/node_modules/es6-promise/dist/es6-promise.js":
/*!**********************************************************************************************!*\
  !*** c:/projects/easydata/easydata.js/packs/ui/node_modules/es6-promise/dist/es6-promise.js ***!
  \**********************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process, global) {/*!
 * @overview es6-promise - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/stefanpenner/es6-promise/master/LICENSE
 * @version   v4.2.8+1e68dce6
 */

(function (global, factory) {
	 true ? module.exports = factory() :
	undefined;
}(this, (function () { 'use strict';

function objectOrFunction(x) {
  var type = typeof x;
  return x !== null && (type === 'object' || type === 'function');
}

function isFunction(x) {
  return typeof x === 'function';
}



var _isArray = void 0;
if (Array.isArray) {
  _isArray = Array.isArray;
} else {
  _isArray = function (x) {
    return Object.prototype.toString.call(x) === '[object Array]';
  };
}

var isArray = _isArray;

var len = 0;
var vertxNext = void 0;
var customSchedulerFn = void 0;

var asap = function asap(callback, arg) {
  queue[len] = callback;
  queue[len + 1] = arg;
  len += 2;
  if (len === 2) {
    // If len is 2, that means that we need to schedule an async flush.
    // If additional callbacks are queued before the queue is flushed, they
    // will be processed by this flush that we are scheduling.
    if (customSchedulerFn) {
      customSchedulerFn(flush);
    } else {
      scheduleFlush();
    }
  }
};

function setScheduler(scheduleFn) {
  customSchedulerFn = scheduleFn;
}

function setAsap(asapFn) {
  asap = asapFn;
}

var browserWindow = typeof window !== 'undefined' ? window : undefined;
var browserGlobal = browserWindow || {};
var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
var isNode = typeof self === 'undefined' && typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';

// test for web worker but not in IE10
var isWorker = typeof Uint8ClampedArray !== 'undefined' && typeof importScripts !== 'undefined' && typeof MessageChannel !== 'undefined';

// node
function useNextTick() {
  // node version 0.10.x displays a deprecation warning when nextTick is used recursively
  // see https://github.com/cujojs/when/issues/410 for details
  return function () {
    return process.nextTick(flush);
  };
}

// vertx
function useVertxTimer() {
  if (typeof vertxNext !== 'undefined') {
    return function () {
      vertxNext(flush);
    };
  }

  return useSetTimeout();
}

function useMutationObserver() {
  var iterations = 0;
  var observer = new BrowserMutationObserver(flush);
  var node = document.createTextNode('');
  observer.observe(node, { characterData: true });

  return function () {
    node.data = iterations = ++iterations % 2;
  };
}

// web worker
function useMessageChannel() {
  var channel = new MessageChannel();
  channel.port1.onmessage = flush;
  return function () {
    return channel.port2.postMessage(0);
  };
}

function useSetTimeout() {
  // Store setTimeout reference so es6-promise will be unaffected by
  // other code modifying setTimeout (like sinon.useFakeTimers())
  var globalSetTimeout = setTimeout;
  return function () {
    return globalSetTimeout(flush, 1);
  };
}

var queue = new Array(1000);
function flush() {
  for (var i = 0; i < len; i += 2) {
    var callback = queue[i];
    var arg = queue[i + 1];

    callback(arg);

    queue[i] = undefined;
    queue[i + 1] = undefined;
  }

  len = 0;
}

function attemptVertx() {
  try {
    var vertx = Function('return this')().require('vertx');
    vertxNext = vertx.runOnLoop || vertx.runOnContext;
    return useVertxTimer();
  } catch (e) {
    return useSetTimeout();
  }
}

var scheduleFlush = void 0;
// Decide what async method to use to triggering processing of queued callbacks:
if (isNode) {
  scheduleFlush = useNextTick();
} else if (BrowserMutationObserver) {
  scheduleFlush = useMutationObserver();
} else if (isWorker) {
  scheduleFlush = useMessageChannel();
} else if (browserWindow === undefined && "function" === 'function') {
  scheduleFlush = attemptVertx();
} else {
  scheduleFlush = useSetTimeout();
}

function then(onFulfillment, onRejection) {
  var parent = this;

  var child = new this.constructor(noop);

  if (child[PROMISE_ID] === undefined) {
    makePromise(child);
  }

  var _state = parent._state;


  if (_state) {
    var callback = arguments[_state - 1];
    asap(function () {
      return invokeCallback(_state, child, callback, parent._result);
    });
  } else {
    subscribe(parent, child, onFulfillment, onRejection);
  }

  return child;
}

/**
  `Promise.resolve` returns a promise that will become resolved with the
  passed `value`. It is shorthand for the following:

  ```javascript
  let promise = new Promise(function(resolve, reject){
    resolve(1);
  });

  promise.then(function(value){
    // value === 1
  });
  ```

  Instead of writing the above, your code now simply becomes the following:

  ```javascript
  let promise = Promise.resolve(1);

  promise.then(function(value){
    // value === 1
  });
  ```

  @method resolve
  @static
  @param {Any} value value that the returned promise will be resolved with
  Useful for tooling.
  @return {Promise} a promise that will become fulfilled with the given
  `value`
*/
function resolve$1(object) {
  /*jshint validthis:true */
  var Constructor = this;

  if (object && typeof object === 'object' && object.constructor === Constructor) {
    return object;
  }

  var promise = new Constructor(noop);
  resolve(promise, object);
  return promise;
}

var PROMISE_ID = Math.random().toString(36).substring(2);

function noop() {}

var PENDING = void 0;
var FULFILLED = 1;
var REJECTED = 2;

function selfFulfillment() {
  return new TypeError("You cannot resolve a promise with itself");
}

function cannotReturnOwn() {
  return new TypeError('A promises callback cannot return that same promise.');
}

function tryThen(then$$1, value, fulfillmentHandler, rejectionHandler) {
  try {
    then$$1.call(value, fulfillmentHandler, rejectionHandler);
  } catch (e) {
    return e;
  }
}

function handleForeignThenable(promise, thenable, then$$1) {
  asap(function (promise) {
    var sealed = false;
    var error = tryThen(then$$1, thenable, function (value) {
      if (sealed) {
        return;
      }
      sealed = true;
      if (thenable !== value) {
        resolve(promise, value);
      } else {
        fulfill(promise, value);
      }
    }, function (reason) {
      if (sealed) {
        return;
      }
      sealed = true;

      reject(promise, reason);
    }, 'Settle: ' + (promise._label || ' unknown promise'));

    if (!sealed && error) {
      sealed = true;
      reject(promise, error);
    }
  }, promise);
}

function handleOwnThenable(promise, thenable) {
  if (thenable._state === FULFILLED) {
    fulfill(promise, thenable._result);
  } else if (thenable._state === REJECTED) {
    reject(promise, thenable._result);
  } else {
    subscribe(thenable, undefined, function (value) {
      return resolve(promise, value);
    }, function (reason) {
      return reject(promise, reason);
    });
  }
}

function handleMaybeThenable(promise, maybeThenable, then$$1) {
  if (maybeThenable.constructor === promise.constructor && then$$1 === then && maybeThenable.constructor.resolve === resolve$1) {
    handleOwnThenable(promise, maybeThenable);
  } else {
    if (then$$1 === undefined) {
      fulfill(promise, maybeThenable);
    } else if (isFunction(then$$1)) {
      handleForeignThenable(promise, maybeThenable, then$$1);
    } else {
      fulfill(promise, maybeThenable);
    }
  }
}

function resolve(promise, value) {
  if (promise === value) {
    reject(promise, selfFulfillment());
  } else if (objectOrFunction(value)) {
    var then$$1 = void 0;
    try {
      then$$1 = value.then;
    } catch (error) {
      reject(promise, error);
      return;
    }
    handleMaybeThenable(promise, value, then$$1);
  } else {
    fulfill(promise, value);
  }
}

function publishRejection(promise) {
  if (promise._onerror) {
    promise._onerror(promise._result);
  }

  publish(promise);
}

function fulfill(promise, value) {
  if (promise._state !== PENDING) {
    return;
  }

  promise._result = value;
  promise._state = FULFILLED;

  if (promise._subscribers.length !== 0) {
    asap(publish, promise);
  }
}

function reject(promise, reason) {
  if (promise._state !== PENDING) {
    return;
  }
  promise._state = REJECTED;
  promise._result = reason;

  asap(publishRejection, promise);
}

function subscribe(parent, child, onFulfillment, onRejection) {
  var _subscribers = parent._subscribers;
  var length = _subscribers.length;


  parent._onerror = null;

  _subscribers[length] = child;
  _subscribers[length + FULFILLED] = onFulfillment;
  _subscribers[length + REJECTED] = onRejection;

  if (length === 0 && parent._state) {
    asap(publish, parent);
  }
}

function publish(promise) {
  var subscribers = promise._subscribers;
  var settled = promise._state;

  if (subscribers.length === 0) {
    return;
  }

  var child = void 0,
      callback = void 0,
      detail = promise._result;

  for (var i = 0; i < subscribers.length; i += 3) {
    child = subscribers[i];
    callback = subscribers[i + settled];

    if (child) {
      invokeCallback(settled, child, callback, detail);
    } else {
      callback(detail);
    }
  }

  promise._subscribers.length = 0;
}

function invokeCallback(settled, promise, callback, detail) {
  var hasCallback = isFunction(callback),
      value = void 0,
      error = void 0,
      succeeded = true;

  if (hasCallback) {
    try {
      value = callback(detail);
    } catch (e) {
      succeeded = false;
      error = e;
    }

    if (promise === value) {
      reject(promise, cannotReturnOwn());
      return;
    }
  } else {
    value = detail;
  }

  if (promise._state !== PENDING) {
    // noop
  } else if (hasCallback && succeeded) {
    resolve(promise, value);
  } else if (succeeded === false) {
    reject(promise, error);
  } else if (settled === FULFILLED) {
    fulfill(promise, value);
  } else if (settled === REJECTED) {
    reject(promise, value);
  }
}

function initializePromise(promise, resolver) {
  try {
    resolver(function resolvePromise(value) {
      resolve(promise, value);
    }, function rejectPromise(reason) {
      reject(promise, reason);
    });
  } catch (e) {
    reject(promise, e);
  }
}

var id = 0;
function nextId() {
  return id++;
}

function makePromise(promise) {
  promise[PROMISE_ID] = id++;
  promise._state = undefined;
  promise._result = undefined;
  promise._subscribers = [];
}

function validationError() {
  return new Error('Array Methods must be provided an Array');
}

var Enumerator = function () {
  function Enumerator(Constructor, input) {
    this._instanceConstructor = Constructor;
    this.promise = new Constructor(noop);

    if (!this.promise[PROMISE_ID]) {
      makePromise(this.promise);
    }

    if (isArray(input)) {
      this.length = input.length;
      this._remaining = input.length;

      this._result = new Array(this.length);

      if (this.length === 0) {
        fulfill(this.promise, this._result);
      } else {
        this.length = this.length || 0;
        this._enumerate(input);
        if (this._remaining === 0) {
          fulfill(this.promise, this._result);
        }
      }
    } else {
      reject(this.promise, validationError());
    }
  }

  Enumerator.prototype._enumerate = function _enumerate(input) {
    for (var i = 0; this._state === PENDING && i < input.length; i++) {
      this._eachEntry(input[i], i);
    }
  };

  Enumerator.prototype._eachEntry = function _eachEntry(entry, i) {
    var c = this._instanceConstructor;
    var resolve$$1 = c.resolve;


    if (resolve$$1 === resolve$1) {
      var _then = void 0;
      var error = void 0;
      var didError = false;
      try {
        _then = entry.then;
      } catch (e) {
        didError = true;
        error = e;
      }

      if (_then === then && entry._state !== PENDING) {
        this._settledAt(entry._state, i, entry._result);
      } else if (typeof _then !== 'function') {
        this._remaining--;
        this._result[i] = entry;
      } else if (c === Promise$1) {
        var promise = new c(noop);
        if (didError) {
          reject(promise, error);
        } else {
          handleMaybeThenable(promise, entry, _then);
        }
        this._willSettleAt(promise, i);
      } else {
        this._willSettleAt(new c(function (resolve$$1) {
          return resolve$$1(entry);
        }), i);
      }
    } else {
      this._willSettleAt(resolve$$1(entry), i);
    }
  };

  Enumerator.prototype._settledAt = function _settledAt(state, i, value) {
    var promise = this.promise;


    if (promise._state === PENDING) {
      this._remaining--;

      if (state === REJECTED) {
        reject(promise, value);
      } else {
        this._result[i] = value;
      }
    }

    if (this._remaining === 0) {
      fulfill(promise, this._result);
    }
  };

  Enumerator.prototype._willSettleAt = function _willSettleAt(promise, i) {
    var enumerator = this;

    subscribe(promise, undefined, function (value) {
      return enumerator._settledAt(FULFILLED, i, value);
    }, function (reason) {
      return enumerator._settledAt(REJECTED, i, reason);
    });
  };

  return Enumerator;
}();

/**
  `Promise.all` accepts an array of promises, and returns a new promise which
  is fulfilled with an array of fulfillment values for the passed promises, or
  rejected with the reason of the first passed promise to be rejected. It casts all
  elements of the passed iterable to promises as it runs this algorithm.

  Example:

  ```javascript
  let promise1 = resolve(1);
  let promise2 = resolve(2);
  let promise3 = resolve(3);
  let promises = [ promise1, promise2, promise3 ];

  Promise.all(promises).then(function(array){
    // The array here would be [ 1, 2, 3 ];
  });
  ```

  If any of the `promises` given to `all` are rejected, the first promise
  that is rejected will be given as an argument to the returned promises's
  rejection handler. For example:

  Example:

  ```javascript
  let promise1 = resolve(1);
  let promise2 = reject(new Error("2"));
  let promise3 = reject(new Error("3"));
  let promises = [ promise1, promise2, promise3 ];

  Promise.all(promises).then(function(array){
    // Code here never runs because there are rejected promises!
  }, function(error) {
    // error.message === "2"
  });
  ```

  @method all
  @static
  @param {Array} entries array of promises
  @param {String} label optional string for labeling the promise.
  Useful for tooling.
  @return {Promise} promise that is fulfilled when all `promises` have been
  fulfilled, or rejected if any of them become rejected.
  @static
*/
function all(entries) {
  return new Enumerator(this, entries).promise;
}

/**
  `Promise.race` returns a new promise which is settled in the same way as the
  first passed promise to settle.

  Example:

  ```javascript
  let promise1 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 1');
    }, 200);
  });

  let promise2 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 2');
    }, 100);
  });

  Promise.race([promise1, promise2]).then(function(result){
    // result === 'promise 2' because it was resolved before promise1
    // was resolved.
  });
  ```

  `Promise.race` is deterministic in that only the state of the first
  settled promise matters. For example, even if other promises given to the
  `promises` array argument are resolved, but the first settled promise has
  become rejected before the other promises became fulfilled, the returned
  promise will become rejected:

  ```javascript
  let promise1 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 1');
    }, 200);
  });

  let promise2 = new Promise(function(resolve, reject){
    setTimeout(function(){
      reject(new Error('promise 2'));
    }, 100);
  });

  Promise.race([promise1, promise2]).then(function(result){
    // Code here never runs
  }, function(reason){
    // reason.message === 'promise 2' because promise 2 became rejected before
    // promise 1 became fulfilled
  });
  ```

  An example real-world use case is implementing timeouts:

  ```javascript
  Promise.race([ajax('foo.json'), timeout(5000)])
  ```

  @method race
  @static
  @param {Array} promises array of promises to observe
  Useful for tooling.
  @return {Promise} a promise which settles in the same way as the first passed
  promise to settle.
*/
function race(entries) {
  /*jshint validthis:true */
  var Constructor = this;

  if (!isArray(entries)) {
    return new Constructor(function (_, reject) {
      return reject(new TypeError('You must pass an array to race.'));
    });
  } else {
    return new Constructor(function (resolve, reject) {
      var length = entries.length;
      for (var i = 0; i < length; i++) {
        Constructor.resolve(entries[i]).then(resolve, reject);
      }
    });
  }
}

/**
  `Promise.reject` returns a promise rejected with the passed `reason`.
  It is shorthand for the following:

  ```javascript
  let promise = new Promise(function(resolve, reject){
    reject(new Error('WHOOPS'));
  });

  promise.then(function(value){
    // Code here doesn't run because the promise is rejected!
  }, function(reason){
    // reason.message === 'WHOOPS'
  });
  ```

  Instead of writing the above, your code now simply becomes the following:

  ```javascript
  let promise = Promise.reject(new Error('WHOOPS'));

  promise.then(function(value){
    // Code here doesn't run because the promise is rejected!
  }, function(reason){
    // reason.message === 'WHOOPS'
  });
  ```

  @method reject
  @static
  @param {Any} reason value that the returned promise will be rejected with.
  Useful for tooling.
  @return {Promise} a promise rejected with the given `reason`.
*/
function reject$1(reason) {
  /*jshint validthis:true */
  var Constructor = this;
  var promise = new Constructor(noop);
  reject(promise, reason);
  return promise;
}

function needsResolver() {
  throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
}

function needsNew() {
  throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
}

/**
  Promise objects represent the eventual result of an asynchronous operation. The
  primary way of interacting with a promise is through its `then` method, which
  registers callbacks to receive either a promise's eventual value or the reason
  why the promise cannot be fulfilled.

  Terminology
  -----------

  - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
  - `thenable` is an object or function that defines a `then` method.
  - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
  - `exception` is a value that is thrown using the throw statement.
  - `reason` is a value that indicates why a promise was rejected.
  - `settled` the final resting state of a promise, fulfilled or rejected.

  A promise can be in one of three states: pending, fulfilled, or rejected.

  Promises that are fulfilled have a fulfillment value and are in the fulfilled
  state.  Promises that are rejected have a rejection reason and are in the
  rejected state.  A fulfillment value is never a thenable.

  Promises can also be said to *resolve* a value.  If this value is also a
  promise, then the original promise's settled state will match the value's
  settled state.  So a promise that *resolves* a promise that rejects will
  itself reject, and a promise that *resolves* a promise that fulfills will
  itself fulfill.


  Basic Usage:
  ------------

  ```js
  let promise = new Promise(function(resolve, reject) {
    // on success
    resolve(value);

    // on failure
    reject(reason);
  });

  promise.then(function(value) {
    // on fulfillment
  }, function(reason) {
    // on rejection
  });
  ```

  Advanced Usage:
  ---------------

  Promises shine when abstracting away asynchronous interactions such as
  `XMLHttpRequest`s.

  ```js
  function getJSON(url) {
    return new Promise(function(resolve, reject){
      let xhr = new XMLHttpRequest();

      xhr.open('GET', url);
      xhr.onreadystatechange = handler;
      xhr.responseType = 'json';
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.send();

      function handler() {
        if (this.readyState === this.DONE) {
          if (this.status === 200) {
            resolve(this.response);
          } else {
            reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
          }
        }
      };
    });
  }

  getJSON('/posts.json').then(function(json) {
    // on fulfillment
  }, function(reason) {
    // on rejection
  });
  ```

  Unlike callbacks, promises are great composable primitives.

  ```js
  Promise.all([
    getJSON('/posts'),
    getJSON('/comments')
  ]).then(function(values){
    values[0] // => postsJSON
    values[1] // => commentsJSON

    return values;
  });
  ```

  @class Promise
  @param {Function} resolver
  Useful for tooling.
  @constructor
*/

var Promise$1 = function () {
  function Promise(resolver) {
    this[PROMISE_ID] = nextId();
    this._result = this._state = undefined;
    this._subscribers = [];

    if (noop !== resolver) {
      typeof resolver !== 'function' && needsResolver();
      this instanceof Promise ? initializePromise(this, resolver) : needsNew();
    }
  }

  /**
  The primary way of interacting with a promise is through its `then` method,
  which registers callbacks to receive either a promise's eventual value or the
  reason why the promise cannot be fulfilled.
   ```js
  findUser().then(function(user){
    // user is available
  }, function(reason){
    // user is unavailable, and you are given the reason why
  });
  ```
   Chaining
  --------
   The return value of `then` is itself a promise.  This second, 'downstream'
  promise is resolved with the return value of the first promise's fulfillment
  or rejection handler, or rejected if the handler throws an exception.
   ```js
  findUser().then(function (user) {
    return user.name;
  }, function (reason) {
    return 'default name';
  }).then(function (userName) {
    // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
    // will be `'default name'`
  });
   findUser().then(function (user) {
    throw new Error('Found user, but still unhappy');
  }, function (reason) {
    throw new Error('`findUser` rejected and we're unhappy');
  }).then(function (value) {
    // never reached
  }, function (reason) {
    // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
    // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
  });
  ```
  If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.
   ```js
  findUser().then(function (user) {
    throw new PedagogicalException('Upstream error');
  }).then(function (value) {
    // never reached
  }).then(function (value) {
    // never reached
  }, function (reason) {
    // The `PedgagocialException` is propagated all the way down to here
  });
  ```
   Assimilation
  ------------
   Sometimes the value you want to propagate to a downstream promise can only be
  retrieved asynchronously. This can be achieved by returning a promise in the
  fulfillment or rejection handler. The downstream promise will then be pending
  until the returned promise is settled. This is called *assimilation*.
   ```js
  findUser().then(function (user) {
    return findCommentsByAuthor(user);
  }).then(function (comments) {
    // The user's comments are now available
  });
  ```
   If the assimliated promise rejects, then the downstream promise will also reject.
   ```js
  findUser().then(function (user) {
    return findCommentsByAuthor(user);
  }).then(function (comments) {
    // If `findCommentsByAuthor` fulfills, we'll have the value here
  }, function (reason) {
    // If `findCommentsByAuthor` rejects, we'll have the reason here
  });
  ```
   Simple Example
  --------------
   Synchronous Example
   ```javascript
  let result;
   try {
    result = findResult();
    // success
  } catch(reason) {
    // failure
  }
  ```
   Errback Example
   ```js
  findResult(function(result, err){
    if (err) {
      // failure
    } else {
      // success
    }
  });
  ```
   Promise Example;
   ```javascript
  findResult().then(function(result){
    // success
  }, function(reason){
    // failure
  });
  ```
   Advanced Example
  --------------
   Synchronous Example
   ```javascript
  let author, books;
   try {
    author = findAuthor();
    books  = findBooksByAuthor(author);
    // success
  } catch(reason) {
    // failure
  }
  ```
   Errback Example
   ```js
   function foundBooks(books) {
   }
   function failure(reason) {
   }
   findAuthor(function(author, err){
    if (err) {
      failure(err);
      // failure
    } else {
      try {
        findBoooksByAuthor(author, function(books, err) {
          if (err) {
            failure(err);
          } else {
            try {
              foundBooks(books);
            } catch(reason) {
              failure(reason);
            }
          }
        });
      } catch(error) {
        failure(err);
      }
      // success
    }
  });
  ```
   Promise Example;
   ```javascript
  findAuthor().
    then(findBooksByAuthor).
    then(function(books){
      // found books
  }).catch(function(reason){
    // something went wrong
  });
  ```
   @method then
  @param {Function} onFulfilled
  @param {Function} onRejected
  Useful for tooling.
  @return {Promise}
  */

  /**
  `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
  as the catch block of a try/catch statement.
  ```js
  function findAuthor(){
  throw new Error('couldn't find that author');
  }
  // synchronous
  try {
  findAuthor();
  } catch(reason) {
  // something went wrong
  }
  // async with promises
  findAuthor().catch(function(reason){
  // something went wrong
  });
  ```
  @method catch
  @param {Function} onRejection
  Useful for tooling.
  @return {Promise}
  */


  Promise.prototype.catch = function _catch(onRejection) {
    return this.then(null, onRejection);
  };

  /**
    `finally` will be invoked regardless of the promise's fate just as native
    try/catch/finally behaves
  
    Synchronous example:
  
    ```js
    findAuthor() {
      if (Math.random() > 0.5) {
        throw new Error();
      }
      return new Author();
    }
  
    try {
      return findAuthor(); // succeed or fail
    } catch(error) {
      return findOtherAuther();
    } finally {
      // always runs
      // doesn't affect the return value
    }
    ```
  
    Asynchronous example:
  
    ```js
    findAuthor().catch(function(reason){
      return findOtherAuther();
    }).finally(function(){
      // author was either found, or not
    });
    ```
  
    @method finally
    @param {Function} callback
    @return {Promise}
  */


  Promise.prototype.finally = function _finally(callback) {
    var promise = this;
    var constructor = promise.constructor;

    if (isFunction(callback)) {
      return promise.then(function (value) {
        return constructor.resolve(callback()).then(function () {
          return value;
        });
      }, function (reason) {
        return constructor.resolve(callback()).then(function () {
          throw reason;
        });
      });
    }

    return promise.then(callback, callback);
  };

  return Promise;
}();

Promise$1.prototype.then = then;
Promise$1.all = all;
Promise$1.race = race;
Promise$1.resolve = resolve$1;
Promise$1.reject = reject$1;
Promise$1._setScheduler = setScheduler;
Promise$1._setAsap = setAsap;
Promise$1._asap = asap;

/*global self*/
function polyfill() {
  var local = void 0;

  if (typeof global !== 'undefined') {
    local = global;
  } else if (typeof self !== 'undefined') {
    local = self;
  } else {
    try {
      local = Function('return this')();
    } catch (e) {
      throw new Error('polyfill failed because global object is unavailable in this environment');
    }
  }

  var P = local.Promise;

  if (P) {
    var promiseToString = null;
    try {
      promiseToString = Object.prototype.toString.call(P.resolve());
    } catch (e) {
      // silently ignored
    }

    if (promiseToString === '[object Promise]' && !P.cast) {
      return;
    }
  }

  local.Promise = Promise$1;
}

// Strange compat..
Promise$1.polyfill = polyfill;
Promise$1.Promise = Promise$1;

return Promise$1;

})));



//# sourceMappingURL=es6-promise.map

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../../../../../samples/EasyDataBasicDemo.NetCore31/node_modules/process/browser.js */ "./node_modules/process/browser.js"), __webpack_require__(/*! ./../../../../../../samples/EasyDataBasicDemo.NetCore31/node_modules/webpack/buildin/global.js */ "./node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js?!../../easydata.js/packs/crud/dist/assets/css/ed-view.css":
/*!************************************************************************************************************************************************************************************!*\
  !*** c:/projects/easydata/samples/EasyDataBasicDemo.NetCore31/node_modules/css-loader/dist/cjs.js??ref--6!c:/projects/easydata/easydata.js/packs/crud/dist/assets/css/ed-view.css ***!
  \************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(/*! ../../../../../../samples/EasyDataBasicDemo.NetCore31/node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js")(false);
// Module
exports.push([module.i, "\r\n.ed-entity-menu {\r\n    display: -ms-flexbox;\r\n    display: flex;\r\n    -ms-flex-direction: column;\r\n    flex-direction: column;\r\n    padding-left: 0;\r\n    margin-bottom: 0;\r\n}\r\n\r\n.ed-entity-item {\r\n    position: relative;\r\n    display: block;\r\n    padding: .75rem 1.25rem;\r\n    margin-bottom: -1px;\r\n    background-color: #fff;\r\n    border-bottom: 1px solid rgba(0,0,0,.125);\r\n    border-top: 1px solid rgba(0,0,0,.125);    \r\n    border-left: none;\r\n    border-right: none;\r\n    font-size: 1.2em;\r\n}\r\n\r\n.ed-entity-item:hover {\r\n    cursor: pointer;\r\n    background-color: #3498DB;\r\n    color: white;\r\n}\r\n\r\n.ed-root {\r\n    display: flex;\r\n    flex-direction: column;\r\n}\r\n\r\n.ed-menu-description {\r\n    margin: 50px auto;\r\n    text-align: center;\r\n    font-size: 1.5em;\r\n}\r\n\r\n.ed-entity-item-caption {\r\n    font-weight: 500;\r\n    display: flex;\r\n    justify-content: space-between;\r\n}\r\n\r\n.ed-entity-item-caption::after {\r\n    content: \"\\276F\";\r\n    width: 1em;\r\n    height: 1em;\r\n    text-align: center;\r\n    -webkit-transition: all .35s;\r\n    transition: all .35s;\r\n}\r\n\r\n.ed-entity-item-descr {\r\n    font-size: 0.8em;\r\n    margin-left: 30px;\r\n    margin-top: 5px;\r\n}\r\n\r\n\r\n/* Progress Bar start */\r\n.ed-progress-bar {\r\n    display: 'none';\r\n    height: 4px;\r\n    width: 100%;\r\n    position: fixed;\r\n    top: 0;\r\n\tleft: 0;\r\n    z-index: 65000;\r\n    overflow: hidden;\r\n    background-color: #ddd;\r\n  }\r\n\r\n  .ed-progress-bar:before {\r\n    display: block;\r\n    position: absolute;\r\n    content: \"\";\r\n    left: -200px;\r\n    width: 200px;\r\n    height: 4px;\r\n    background-color: #2980b9;\r\n    animation: ed-progress-bar-loading 2s linear infinite;\r\n  }\r\n  \r\n  @keyframes ed-progress-bar-loading {\r\n      from {left: -200px; width: 30%;}\r\n      50% {width: 30%;}\r\n      70% {width: 70%;}\r\n      80% { left: 50%;}\r\n      95% {left: 120%;}\r\n      to {left: 100%;}\r\n  }\r\n/* Progress Bar end */", ""]);



/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js?!../../easydata.js/packs/ui/dist/assets/css/easy-dialog.css":
/*!**************************************************************************************************************************************************************************************!*\
  !*** c:/projects/easydata/samples/EasyDataBasicDemo.NetCore31/node_modules/css-loader/dist/cjs.js??ref--6!c:/projects/easydata/easydata.js/packs/ui/dist/assets/css/easy-dialog.css ***!
  \**************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(/*! ../../../../../../samples/EasyDataBasicDemo.NetCore31/node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js")(false);
// Module
exports.push([module.i, ".kdlg-modal, .kdlg-modal-background {\r\n    bottom: 0;\r\n    left: 0;\r\n    position: absolute;\r\n    right: 0;\r\n    top: 0;\r\n}\r\n\r\n.kdlg-modal-background {\r\n    background-color: rgb(10 10 10 / 50%);\r\n}\r\n\r\n.kdlg-modal {\r\n    font-family: \"Roboto\", Arial;\r\n    font-size: 16px;\r\n    font-weight: 400;\r\n    line-height: 1.5;\r\n\r\n    align-items: center;\r\n    display: none;\r\n    flex-direction: column;\r\n    justify-content: center;\r\n    overflow: hidden;\r\n    position: fixed;\r\n    z-index: 40;\r\n}\r\n\r\n.kdlg-modal.is-active {\r\n    display: flex;\r\n}\r\n\r\n\r\n.kdlg-modal-window, .kdlg-modal-window.size-default {\r\n    margin: 0 20px;\r\n    position: relative;\r\n    width: 100%;\r\n    display: flex;\r\n    flex-direction: column;\r\n    max-height: calc(100vh - 40px);\r\n    overflow: hidden;\r\n    -ms-overflow-y: visible;    \r\n}\r\n\r\n@media screen and (min-width: 481px), print {\r\n    .kdlg-modal-window.size-small {\r\n        margin: 0 auto;\r\n        width: 400px;\r\n    }\r\n}\r\n\r\n@media screen and (min-width: 769px), print {\r\n    .kdlg-modal-window, .kdlg-modal-window.size-default {\r\n        margin: 0 auto;\r\n        width: 640px;\r\n    }\r\n\r\n    .kdlg-modal-window.size-large, .kdlg-modal-window.size-xl {\r\n        margin: 0 20px;\r\n        width: 100%;\r\n    }\r\n}\r\n\r\n@media screen and (min-width: 1025px), print {\r\n    .kdlg-modal-window.size-large {\r\n        margin: 0 auto;\r\n        width: 900px;\r\n    }\r\n}\r\n\r\n@media screen and (min-width: 1383px), print {\r\n    .kdlg-modal-window.size-xl {\r\n        margin: 0 auto;\r\n        width: 1200px;\r\n    }\r\n}\r\n\r\n\r\n\r\n.kdlg-footer, .kdlg-header {\r\n    align-items: center;\r\n    /*background-color: #f5f5f5;*/\r\n    background-color: #fff;\r\n    display: flex;\r\n    flex-shrink: 0;\r\n    justify-content: flex-start;\r\n    padding: 20px;\r\n    position: relative;\r\n}\r\n\r\n.kdlg-footer.align-right {\r\n    justify-content: flex-end;\r\n}\r\n\r\n.kdlg-header {\r\n    border-top-left-radius: 6px;\r\n    border-top-right-radius: 6px;\r\n}\r\n\r\n.kdlg-header.has-border {\r\n    border-bottom: 1px solid #dbdbdb;\r\n}\r\n\r\n.kdlg-footer {\r\n    border-bottom-left-radius: 6px;\r\n    border-bottom-right-radius: 6px;\r\n}\r\n\r\n.kdlg-footer.has-border {\r\n    border-top: 1px solid #dbdbdb;\r\n}\r\n\r\n.kdlg-header-title {\r\n    color: #363636;\r\n    flex-grow: 1;\r\n    flex-shrink: 0;\r\n    font-size: 1.6rem;\r\n    line-height: 1;\r\n    margin: 0;\r\n    padding: 0;\r\n}\r\n\r\n.kdlg-modal-close {\r\n    -webkit-touch-callout: none;\r\n    -webkit-user-select: none;\r\n    -moz-user-select: none;\r\n    -ms-user-select: none;\r\n    user-select: none;\r\n    -moz-appearance: none;\r\n    -webkit-appearance: none;\r\n    background-color: rgba(10,10,10,.2);\r\n    border: none;\r\n    border-radius: 290486px;\r\n    cursor: pointer;\r\n    pointer-events: auto;\r\n    display: inline-block;\r\n    flex-grow: 0;\r\n    flex-shrink: 0;\r\n    font-size: 0;\r\n    height: 24px;\r\n    max-height: 24px;\r\n    max-width: 24px;\r\n    min-height: 24px;\r\n    min-width: 24px;\r\n    outline: 0;\r\n    position: relative;\r\n    vertical-align: top;\r\n    width: 24px;\r\n}\r\n\r\n.kdlg-modal-close::before, .kdlg-modal-close::after {\r\n    background-color: #fff;\r\n    content: \"\";\r\n    display: block;\r\n    left: 50%;\r\n    position: absolute;\r\n    top: 50%;\r\n    transform: translateX(-50%) translateY(-50%) rotate(45deg);\r\n    transform-origin: center center;\r\n}\r\n\r\n.kdlg-modal-close::before {\r\n    height: 2px;\r\n    width: 50%;\r\n}\r\n\r\n.kdlg-modal-close::after {\r\n    height: 50%;\r\n    width: 2px;\r\n}\r\n\r\n.kdlg-modal-close:focus, .kdlg-modal-close:hover {\r\n    background-color: rgba(255,1,1,.48);\r\n}\r\n\r\n\r\n.kdlg-body {\r\n    -webkit-overflow-scrolling: touch;\r\n    background-color: #fff;\r\n    flex-grow: 1;\r\n    flex-shrink: 1;\r\n    overflow: auto;\r\n    padding: 20px;\r\n    font-size: 1em;\r\n    color: #4a4a4a;\r\n}\r\n\r\n\r\n", ""]);



/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js?!../../easydata.js/packs/ui/dist/assets/css/easy-forms.css":
/*!*************************************************************************************************************************************************************************************!*\
  !*** c:/projects/easydata/samples/EasyDataBasicDemo.NetCore31/node_modules/css-loader/dist/cjs.js??ref--6!c:/projects/easydata/easydata.js/packs/ui/dist/assets/css/easy-forms.css ***!
  \*************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(/*! ../../../../../../samples/EasyDataBasicDemo.NetCore31/node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js")(false);
// Module
exports.push([module.i, "/* BUTTONS */\r\n\r\n.kfrm-buttons {\r\n    align-items: center;\r\n    display: flex;\r\n    flex-wrap: wrap;\r\n    justify-content: flex-start;\r\n}\r\n\r\n.kfrm-buttons.align-right {\r\n    justify-content: flex-end;\r\n}\r\n\r\n.kfrm-buttons.align-center {\r\n    justify-content: center;\r\n}\r\n\r\n.kfrm-buttons:last-child {\r\n    margin-bottom: -.5rem;\r\n}\r\n\r\n.kfrm-buttons .kfrm-button {\r\n    margin-bottom: .5rem;\r\n}\r\n\r\n.kfrm-button {\r\n    position: relative;\r\n    vertical-align: top;\r\n    line-height: 1.5;\r\n    align-items: center;\r\n    border: 1px solid transparent;\r\n    border-radius: 4px;\r\n    box-shadow: none;\r\n    display: inline-flex;\r\n    font-size: 1rem;\r\n    height: 2.5em;\r\n    -moz-appearance: none;\r\n    -webkit-appearance: none;\r\n\r\n\r\n    background-color: #fff;\r\n    border-color: #dbdbdb;\r\n    border-width: 1px;\r\n    color: #363636;\r\n    cursor: pointer;\r\n    justify-content: center;\r\n    padding-bottom: calc(.5em - 1px);\r\n    padding-left: 1em;\r\n    padding-right: 1em;\r\n    padding-top: calc(.5em - 1px);\r\n    text-align: center;\r\n    white-space: nowrap;\r\n\r\n    -webkit-touch-callout:none;\r\n    -webkit-user-select:none;\r\n    -moz-user-select:none;\r\n    -ms-user-select:none;\r\n    user-select:none\r\n}\r\n\r\n.kfrm-button:not(:last-child) {\r\n    margin-right: .5em;\r\n}\r\n\r\n.kfrm-button.is-hovered, .kfrm-button:hover {\r\n    border-color: #b5b5b5;\r\n    color: #363636;\r\n}\r\n\r\n.kfrm-button.is-focused, .kfrm-button:focus {\r\n    outline: none;\r\n    border-color: #3273dc;\r\n    color: #363636;\r\n}\r\n\r\n.kfrm-button.is-focused:not(:active), .kfrm-button:focus:not(:active) {\r\n    box-shadow: 0 0 0 0.125em rgba(50,115,220,.25);\r\n}\r\n\r\n.kfrm-button.is-active, .kfrm-button:active {\r\n    border-color: #4a4a4a;\r\n    color: #363636;\r\n}\r\n\r\n.kfrm-button[disabled], fieldset[disabled] .kfrm-button {\r\n    background-color: #fff;\r\n    border-color: #dbdbdb;\r\n    box-shadow: none;\r\n    opacity: .5;\r\n    cursor: not-allowed;\r\n}\r\n\r\n.kfrm-button.is-loading {\r\n    color: transparent!important;\r\n    pointer-events: none;\r\n}\r\n\r\n.kfrm-button.is-loading::after {\r\n    -webkit-animation:spinAround .5s infinite linear;\r\n    animation:spinAround .5s infinite linear;\r\n    border:2px solid #dbdbdb;\r\n    border-radius:290486px;\r\n    border-right-color:transparent;\r\n    border-top-color:transparent;\r\n    content:\"\";\r\n    display:block;\r\n    height:1em;\r\n    width:1em;\r\n\r\n    left: calc(50% - (1em / 2));\r\n    top: calc(50% - (1em / 2));\r\n    position: absolute!important;\r\n}\r\n\r\n@keyframes spinAround {\r\n    from {\r\n        transform:rotate(0deg);\r\n    }\r\n    to {\r\n        transform:rotate(360deg);\r\n    }\r\n}\r\n\r\n/* SIZES */\r\n\r\n.kfrm-button.size-small,\r\n.kfrm-buttons.size-small .kfrm-button:not(.size-default):not(.size-medium):not(.size-large) {\r\n    border-radius: 2px;\r\n    font-size: .75rem;\r\n}\r\n\r\n.kfrm-button.size-default\r\n.kfrm-buttons.size-default .kfrm-button:not(.size-small):not(.size-medium):not(.size-large) {\r\n    font-size: 1rem;\r\n}\r\n\r\n.kfrm-button.size-medium,\r\n.kfrm-buttons.size-medium .kfrm-button:not(.size-small):not(.size-default):not(.size-large) {\r\n    font-size: 1.25rem;\r\n}\r\n\r\n.kfrm-button.size-large\r\n.kfrm-buttons.size-large .kfrm-button:not(.size-small):not(.size-default):not(.size-medium) {\r\n    font-size: 1.5rem;\r\n}\r\n\r\n/* SIZES END */\r\n\r\n\r\n\r\n/* COLORS */\r\n\r\n/* white */\r\n.kfrm-button.is-white {\r\n    background-color: #fff;\r\n    border-color: transparent;\r\n    color: #0a0a0a;\r\n}\r\n\r\n.kfrm-button.is-white.is-hovered, .kfrm-button.is-white:hover {\r\n    background-color: #f9f9f9;\r\n    border-color: transparent;\r\n    color: #0a0a0a;\r\n}\r\n\r\n.kfrm-button.is-white.is-focused, .kfrm-button.is-white:focus {\r\n    border-color: transparent;\r\n    color: #0a0a0a;\r\n}\r\n\r\n.kfrm-button.is-white.is-focused:not(:active), .kfrm-button.is-white:focus:not(:active) {\r\n    box-shadow: 0 0 0 0.125em rgba(150,150,150,.15);\r\n}\r\n\r\n.kfrm-button.is-white.is-active, .kfrm-button.is-white:active {\r\n    background-color: #f2f2f2;\r\n    border-color: transparent;\r\n    color: #0a0a0a;\r\n}\r\n\r\n/* dark */\r\n\r\n.kfrm-button.is-dark {\r\n    background-color: #363636e6;\r\n    border-color: transparent;\r\n    color: #fff;\r\n}\r\n\r\n.kfrm-button.is-dark.is-hovered, .kfrm-button.is-dark:hover {\r\n    background-color: #2f2f2f;\r\n    border-color: transparent;\r\n    color: #fff;\r\n}\r\n\r\n.kfrm-button.is-dark.is-focused, .kfrm-button.is-dark:focus {\r\n    border-color: transparent;\r\n    color: #fff;\r\n}\r\n\r\n.kfrm-button.is-dark.is-focused:not(:active), .kfrm-button.is-dark:focus:not(:active) {\r\n    box-shadow: 0 0 0 0.125em rgba(54,54,54,.25);\r\n}\r\n\r\n.kfrm-button.is-dark.is-active, .kfrm-button.is-dark:active {\r\n    background-color: #292929;\r\n    border-color: transparent;\r\n    color: #fff;\r\n}\r\n\r\n/* primary */\r\n\r\n.kfrm-button.is-primary {\r\n    background-color: #00d1b2;\r\n    border-color: transparent;\r\n    color: #fff;\r\n}\r\n\r\n.kfrm-button.is-primary.is-hovered, .kfrm-button.is-primary:hover {\r\n    background-color: #00c4a7;\r\n    border-color: transparent;\r\n    color: #fff;\r\n}\r\n\r\n.kfrm-button.is-primary.is-focused, .kfrm-button.is-primary:focus {\r\n    border-color: transparent;\r\n    color: #fff;\r\n}\r\n\r\n.kfrm-button.is-primary.is-focused:not(:active), .kfrm-button.is-primary:focus:not(:active) {\r\n    box-shadow: 0 0 0 0.125em rgba(0,209,178,.25);\r\n}\r\n\r\n.kfrm-button.is-primary.is-active, .kfrm-button.is-primary:active {\r\n    background-color: #00b89c;\r\n    border-color: transparent;\r\n    color: #fff;\r\n}\r\n\r\n.kfrm-button.is-primary.is-loading::after {\r\n    border-color: transparent transparent #fff #fff!important;\r\n}\r\n\r\n/* link */\r\n\r\n.kfrm-button.is-link {\r\n    background-color: #3273dc;\r\n    border-color: transparent;\r\n    color: #fff;\r\n}\r\n\r\n.kfrm-button.is-link.is-hovered, .kfrm-button.is-link:hover {\r\n    background-color: #276cda;\r\n    border-color: transparent;\r\n    color: #fff;\r\n}\r\n\r\n.kfrm-button.is-link.is-focused, .kfrm-button.is-link:focus {\r\n    border-color: transparent;\r\n    color: #fff;\r\n}\r\n\r\n.kfrm-button.is-link.is-focused:not(:active), .kfrm-button.is-link:focus:not(:active) {\r\n    box-shadow: 0 0 0 0.125em rgba(50,115,220,.25);\r\n}\r\n\r\n.kfrm-button.is-link.is-active, .kfrm-button.is-link:active {\r\n    background-color: #2366d1;\r\n    border-color: transparent;\r\n    color: #fff;\r\n}\r\n\r\n.kfrm-button.is-link.is-loading::after {\r\n    border-color: transparent transparent #fff #fff!important;\r\n}\r\n\r\n/* info */\r\n\r\n.kfrm-button.is-info {\r\n    background-color: #3298dc;\r\n    border-color: transparent;\r\n    color: #fff;\r\n}\r\n\r\n.kfrm-button.is-info.is-hovered, .kfrm-button.is-info:hover {\r\n    background-color: #2793da;\r\n    border-color: transparent;\r\n    color: #fff;\r\n}\r\n\r\n.kfrm-button.is-info.is-focused, .kfrm-button.is-info:focus {\r\n    border-color: transparent;\r\n    color: #fff;\r\n}\r\n\r\n.kfrm-button.is-info.is-focused:not(:active), .kfrm-button.is-info:focus:not(:active) {\r\n    box-shadow: 0 0 0 0.125em rgba(50,152,220,.25);\r\n}\r\n\r\n.kfrm-button.is-info.is-active, .kfrm-button.is-info:active {\r\n    background-color: #238cd1;\r\n    border-color: transparent;\r\n    color: #fff;\r\n}\r\n\r\n.kfrm-button.is-info.is-loading::after {\r\n    border-color: transparent transparent #fff #fff!important;\r\n}\r\n\r\n/* success */\r\n\r\n.kfrm-button.is-success {\r\n    background-color: #48c774;\r\n    border-color: transparent;\r\n    color: #fff;\r\n}\r\n\r\n.kfrm-button.is-success.is-hovered, .kfrm-button.is-success:hover {\r\n    background-color: #3ec46d;\r\n    border-color: transparent;\r\n    color: #fff;\r\n}\r\n\r\n.kfrm-button.is-success.is-focused:not(:active), .kfrm-button.is-success:focus:not(:active) {\r\n    box-shadow: 0 0 0 0.125em rgba(72,199,116,.25);\r\n}\r\n\r\n.kfrm-button.is-success.is-active, .kfrm-button.is-success:active {\r\n    background-color: #3abb67;\r\n    border-color: transparent;\r\n    color: #fff;\r\n}\r\n\r\n.kfrm-button.is-success.is-loading::after {\r\n    border-color: transparent transparent #fff #fff!important;\r\n}\r\n\r\n/* warning */\r\n\r\n.kfrm-button.is-warning {\r\n    background-color: #ffdd57;\r\n    border-color: transparent;\r\n    color: rgba(0,0,0,.7);\r\n}\r\n\r\n.kfrm-button.is-warning.is-hovered, .kfrm-button.is-warning:hover {\r\n    background-color: #ffdb4a;\r\n    border-color: transparent;\r\n    color: rgba(0,0,0,.7);\r\n}\r\n\r\n.kfrm-button.is-warning.is-focused, .kfrm-button.is-warning:focus {\r\n    border-color: transparent;\r\n    color: rgba(0,0,0,.7);\r\n}\r\n\r\n.kfrm-button.is-warning.is-focused:not(:active), .kfrm-button.is-warning:focus:not(:active) {\r\n    box-shadow: 0 0 0 0.125em rgba(255,221,87,.25);\r\n}\r\n\r\n.kfrm-button.is-warning.is-active, .kfrm-button.is-warning:active {\r\n    background-color: #ffd83d;\r\n    border-color: transparent;\r\n    color: rgba(0,0,0,.7);\r\n}\r\n\r\n.kfrm-button.is-warning.is-loading::after {\r\n    border-color: transparent transparent rgba(0,0,0,.7) rgba(0,0,0,.7)!important;\r\n}\r\n\r\n/* danger */\r\n\r\n.kfrm-button.is-danger {\r\n    background-color: #f14668;\r\n    border-color: transparent;\r\n    color: #fff;\r\n}\r\n\r\n.kfrm-button.is-danger.is-hovered, .kfrm-button.is-danger:hover {\r\n    background-color: #f03a5f;\r\n    border-color: transparent;\r\n    color: #fff;\r\n}\r\n\r\n.kfrm-button.is-danger.is-focused, .kfrm-button.is-danger:focus {\r\n    border-color: transparent;\r\n    color: #fff;\r\n}\r\n\r\n.kfrm-button.is-danger.is-focused:not(:active), .kfrm-button.is-danger:focus:not(:active) {\r\n    box-shadow: 0 0 0 0.125em rgba(241,70,104,.25);\r\n}\r\n\r\n.kfrm-button.is-danger.is-active, .kfrm-button.is-danger:active {\r\n    background-color: #ef2e55;\r\n    border-color: transparent;\r\n    color: #fff;\r\n}\r\n\r\n.kfrm-button.is-danger.is-loading::after {\r\n    border-color: transparent transparent #fff #fff!important;\r\n}\r\n\r\n/* COLORS END */\r\n\r\n\r\n/* BUTTONS END *//* COLUMNS */\r\n\r\n.kfrm-row {\r\n    margin-left: -.75rem;\r\n    margin-right: -.75rem;\r\n    margin-top: -.75rem;\r\n}\r\n\r\n.kfrm-row:not(:last-child) {\r\n    margin-bottom: calc(1.5rem - .75rem);\r\n}\r\n\r\n@media screen and (min-width: 769px), print {\r\n    .kfrm-row {\r\n        display: flex;\r\n        flex-wrap: wrap;\r\n    }\r\n\r\n    .kdlg-modal-window.size-small .kfrm-row {\r\n        display: block;\r\n    }\r\n\r\n\r\n    /* 12 columns grid */\r\n    .kfrm-column.size-1 {\r\n        flex: none;\r\n        width: 8.33333%;\r\n    }\r\n\r\n    .kfrm-column.size-2 {\r\n        flex: none;\r\n        width: 16.66667%;\r\n    }\r\n\r\n    .kfrm-column.size-3 {\r\n        flex: none;\r\n        width: 25%;\r\n    }\r\n\r\n    .kfrm-column.size-4 {\r\n        flex: none;\r\n        width: 33.33333%;\r\n    }\r\n\r\n    .kfrm-column.size-5 {\r\n        flex: none;\r\n        width: 41.66667%;\r\n    }\r\n\r\n    .kfrm-column.size-6 {\r\n        flex: none;\r\n        width: 50%;\r\n    }\r\n\r\n    .kfrm-column.size-7 {\r\n        flex: none;\r\n        width: 58.33333%;\r\n    }\r\n\r\n    .kfrm-column.size-8 {\r\n        flex: none;\r\n        width: 66.66667%;\r\n    }\r\n\r\n    .kfrm-column.size-9 {\r\n        flex: none;\r\n        width: 75%;\r\n    }\r\n\r\n    .kfrm-column.size-10 {\r\n        flex: none;\r\n        width: 83.33333%;\r\n    }\r\n\r\n    .kfrm-column.size-11 {\r\n        flex: none;\r\n        width: 91.66667%;\r\n    }\r\n\r\n    .kfrm-column.size-12 {\r\n        flex: none;\r\n        width: 100%;\r\n    }\r\n\r\n\r\n\r\n}\r\n\r\n.kfrm-column {\r\n    display: block;\r\n    flex-basis: 0;\r\n    flex-grow: 1;\r\n    flex-shrink: 1;\r\n    padding: .75rem;\r\n}\r\n\r\n/* COLUMNS END */\r\n\r\n/* CONTROLS */\r\n\r\n.kfrm-form .errors-block {\r\n    color: red;\r\n}\r\n\r\n\r\n.kfrm-form .control {\r\n    box-sizing: border-box;\r\n    clear: both;\r\n    position: relative;\r\n    text-align: inherit;\r\n    display: inline-flex;\r\n    width: 100%;\r\n    max-width: 100%;\r\n    padding: 0 !important;\r\n}\r\n\r\n.kfrm-form .icon {\r\n    align-items: center;\r\n    display: inline-flex;\r\n    justify-content: center;\r\n    height: 1.5em;\r\n    width: 1.5em;\r\n}\r\n\r\n.kfrm-form .control.has-icons-left input, .kfrm-form .control.has-icons-left .select select {\r\n    padding-left: 2.5em;\r\n}\r\n\r\n.kfrm-form .control.has-icons-right input, .kfrm-form .control.has-icons-right .select select {\r\n    padding-right: 2.5em;\r\n}\r\n\r\n.kfrm-form .control.has-icons-left .icon.is-left {\r\n    left: 0;\r\n}\r\n\r\n.kfrm-form .control.has-icons-right .icon.is-right {\r\n    right: 0;\r\n}\r\n\r\n.kfrm-form .control .icon {\r\n    color: #dbdbdb;\r\n    height: 2.5em;\r\n    pointer-events: none;\r\n    position: absolute;\r\n    top: 0;\r\n    width: 2.5em;\r\n    z-index: 4;\r\n}\r\n\r\n.kfrm-form .control .icon.is-clickable {\r\n    pointer-events: auto;\r\n}\r\n\r\n/*\r\n.kfrm-form .control input:focus~.icon, .kfrm-form .control .select:focus~.icon {\r\n    color: #4a4a4a;\r\n}\r\n*/\r\n\r\n.kfrm-form .control .icon.is-clickable:hover {\r\n    color: #4a4a4a;\r\n    cursor: pointer;\r\n}\r\n\r\n\r\n.kfrm-form input.is-valid:not([type='checkbox']),\r\n.kfrm-form input.is-valid:not([type='checkbox']):hover {\r\n    border-color: green;\r\n}\r\n\r\n.kfrm-form input.is-invalid:not([type='checkbox']),\r\n.kfrm-form input.is-invalid:not([type='checkbox']):hover {\r\n    border-color: red;\r\n}\r\n\r\n.kfrm-form input:not([type='checkbox']):read-only {\r\n    background-color: #e9ecef;\r\n    opacity: 1;\r\n}\r\n\r\n.kfrm-form input:not([type='checkbox']), .kfrm-select select, .kfrm-form textarea {\r\n    -moz-appearance: none;\r\n    -webkit-appearance: none;\r\n    align-items: center;\r\n    border: 1px solid transparent;\r\n    border-radius: 4px;\r\n    box-shadow: none;\r\n    display: inline-flex;\r\n    font-size: 1em;\r\n    height: 2.5em;\r\n    justify-content: flex-start;\r\n    line-height: 1.5;\r\n    padding-bottom: calc(.5em - 1px);\r\n    padding-left: calc(.75em - 1px);\r\n    padding-right: calc(.75em - 1px);\r\n    padding-top: calc(.5em - 1px);\r\n    position: relative;\r\n    vertical-align: top;\r\n}\r\n\r\n.kfrm-form input:not([type='checkbox']), .kfrm-select select, .kfrm-form textarea {\r\n    background-color: #fff;\r\n    border-color: #dbdbdb;\r\n    border-radius: 4px;\r\n    color: #363636;\r\n    outline: 0;\r\n}\r\n\r\n.kfrm-form input:not([type='checkbox']), .kfrm-form textarea {\r\n    box-shadow: inset 0 0.0625em 0.125em rgba(10,10,10,.05);\r\n    max-width: 100%;\r\n    width: 100%;\r\n}\r\n\r\n.kfrm-form input:not([type='checkbox']):hover, .kfrm-form input:not([type='checkbox']).is-hovered, .kfrm-form textarea:hover, .kfrm-form textarea.is-hovered, .kfrm-select select:hover, .kfrm-select select.is-hovered {\r\n    border-color: #b5b5b5;\r\n}\r\n\r\n.kfrm-form input:not([type='checkbox']):active, .kfrm-form input:not([type='checkbox']).is-active, .kfrm-form textarea:active, .kfrm-form textarea.is-active, .kfrm-select select:active, .kfrm-select select.is-active, \r\n.kfrm-form input:not([type='checkbox']):focus, .kfrm-form input:not([type='checkbox']).is-focused, .kfrm-form textarea:focus, .kfrm-form textarea.is-focused, .kfrm-select select:focus, .kfrm-select select.is-focused {\r\n    border-color: #3273dc;\r\n    box-shadow: 0 0 0 0.125em rgba(50,115,220,.25);\r\n    outline: 0;\r\n}\r\n\r\n\r\n.kfrm-select {\r\n    display: inline-block;\r\n    max-width: 100%;\r\n    position: relative;\r\n    vertical-align: top;\r\n    padding: 0;\r\n    width: max-content;\r\n}\r\n\r\n.kfrm-select select::-ms-expand {\r\n    display: none !important;\r\n}\r\n\r\n.kfrm-select:not(.is-multiple) {\r\n    height: 2.5em;\r\n}\r\n\r\n.kfrm-select select {\r\n    cursor: pointer;\r\n    display: block;\r\n    font-size: 1em;\r\n    max-width: 100%;\r\n    outline: 0;\r\n}\r\n\r\n.kfrm-select select:not([multiple]) {\r\n    padding-right: 2.5em;\r\n}\r\n\r\n .kfrm-select:not(.is-multiple):not(.is-loading)::after {\r\n    border: 3px solid #3273dc;\r\n    border-radius: 2px;\r\n    border-right: 0;\r\n    border-top: 0;\r\n    content: \" \";\r\n    display: block;\r\n    height: .425em;\r\n    margin-top: -.5em;\r\n    pointer-events: none;\r\n    position: absolute;\r\n    top: 50%;\r\n    transform: rotate(-45deg);\r\n    transform-origin: center;\r\n    width: .425em;\r\n    right: .7em;\r\n    z-index: 4;\r\n}\r\n\r\n\r\n.kfrm-form textarea {\r\n    display: block;\r\n    max-width: 100%;\r\n    min-width: 100%;\r\n    padding: calc(.75em - 1px);\r\n    resize: vertical;\r\n}\r\n\r\n.kfrm-form textarea:not([rows]) {\r\n    max-height: 40em;\r\n    min-height: 8em;\r\n}\r\n\r\n/* CONTROLS END */\r\n\r\n/* FORMS */\r\n.kfrm-form {\r\n    font-size: 16px;\r\n}\r\n\r\n.kfrm-form fieldset {\r\n    border: 1px solid #dbdbdb;\r\n    border-radius: 6px;\r\n    padding: 20px;\r\n}\r\n\r\n.kfrm-form fieldset > legend {\r\n    padding-inline-start: 10px;\r\n    padding-inline-end: 10px;\r\n    font-weight: 600;\r\n}\r\n\r\n.kfrm-break, .kfrm-break-50 {\r\n    margin-top: 50px;\r\n}\r\n\r\n.kfrm-break-10 {\r\n    margin-top: 10px;\r\n}\r\n\r\n.kfrm-break-20 {\r\n    margin-top: 20px;\r\n}\r\n\r\n.kfrm-break-30 {\r\n    margin-top: 30px;\r\n}\r\n\r\n.kfrm-break-40 {\r\n    margin-top: 40px;\r\n}\r\n\r\n.kfrm-break-60 {\r\n    margin-top: 60px;\r\n}\r\n\r\n.kfrm-break-70 {\r\n    margin-top: 70px;\r\n}\r\n\r\n.kfrm-break-80 {\r\n    margin-top: 10px;\r\n}\r\n\r\n\r\n.kfrm-fields, .kfrm-fields.col-a {\r\n    display: grid;\r\n    grid-template-columns: auto;\r\n    grid-gap: 10px;\r\n    grid-auto-rows: auto;\r\n}\r\n\r\n.kfrm-fields:not(:last-child) {\r\n    margin-bottom: calc(1.5rem - .75rem);\r\n}\r\n\r\n.kfrm-fields > label {\r\n    padding: .5em 0;\r\n}\r\n\r\n.kfrm-fields > label:not(.checkbox) {\r\n    font-weight: 600;\r\n}\r\n\r\n.kfrm-fields.label-above > label:not(.checkbox) {\r\n    padding: 0.5em 0 0 0;\r\n    margin-bottom: -0.5em;\r\n}\r\n\r\n.kfrm-fields.label-align-right > label:not(.checkbox) {\r\n    text-align: right;\r\n}\r\n\r\n.kfrm-fields.col-a-1 {\r\n    grid-template-columns: auto 1fr;\r\n}\r\n\r\n.kfrm-fields.col-1-a {\r\n    grid-template-columns: 1fr auto;\r\n}\r\n\r\n.kfrm-fields.col-a-a {\r\n    grid-template-columns: auto auto;\r\n}\r\n\r\n.kfrm-fields.col-1-1 {\r\n    grid-template-columns: 1fr 1fr;\r\n}\r\n\r\n.kfrm-fields.col-1-2 {\r\n    grid-template-columns: 1fr 2fr;\r\n}\r\n\r\n.kfrm-fields.col-1-3 {\r\n    grid-template-columns: 1fr 3fr;\r\n}\r\n\r\n.kfrm-fields.col-2-1 {\r\n    grid-template-columns: 2fr 1fr;\r\n}\r\n\r\n.kfrm-fields.col-3-1 {\r\n    grid-template-columns: 3fr 1fr;\r\n}\r\n\r\n.kfrm-fields.col-2-3 {\r\n    grid-template-columns: 2fr 3fr;\r\n}\r\n\r\n.kfrm-fields.col-3-2 {\r\n    grid-template-columns: 3fr 2fr;\r\n}\r\n\r\n.kfrm-fields.is-horizontal {\r\n    display: flex;\r\n    padding: 0;\r\n}\r\n\r\n.kfrm-fields.is-horizontal.align-right {\r\n    justify-content: flex-end;\r\n}\r\n\r\n.kfrm-fields.is-horizontal.align-center {\r\n    justify-content: center;\r\n}\r\n\r\n.kfrm-fields.is-horizontal.align-evenly {\r\n    justify-content: space-evenly;\r\n}\r\n\r\n.kfrm-fields.is-horizontal > label:not(:first-child) {\r\n    margin-left: .5rem;\r\n}\r\n\r\n/* IE */\r\n.kfrm-fields-ie {\r\n    display: flex;\r\n    flex-direction: column;\r\n    font-size: 16px;\r\n  }\r\n\r\n.kfrm-field-ie {\r\n    display: flex;\r\n    margin-bottom: 1em;\r\n}\r\n\r\n/*  \r\n  .kfrm-field-ie > * {\r\n      font-size: 16px;\r\n  }\r\n*/\r\n\r\n.kfrm-field-ie > *:nth-child(1) {\r\n    margin-right: 20px;\r\n}\r\n\r\n.kfrm-field-ie > label {\r\n    padding: .5em 0;\r\n}\r\n\r\n/*\r\n  .kfrm-field-ie > *:nth-child(2):not(.kfrm-select):not(.kfrm-fields-ie) {\r\n    padding: .5em;\r\n  }\r\n*/\r\n  .kfrm-fields-ie.col-ie-1-1 > .kfrm-field-ie > *:nth-child(1) {\r\n    flex: 0 0 50%;\r\n  }\r\n\r\n  .kfrm-fields-ie.col-ie-1-2 > .kfrm-field-ie > *:nth-child(1) {\r\n    flex: 0 0 33.3333%;\r\n  }\r\n\r\n  .kfrm-fields-ie.col-ie-1-3 > .kfrm-field-ie > *:nth-child(1) {\r\n    flex: 0 0 25%;\r\n  }\r\n\r\n  .kfrm-fields-ie.col-ie-1-4 > .kfrm-field-ie > *:nth-child(1) {\r\n    flex: 0 0 20%;\r\n  }\r\n\r\n\r\n  .kfrm-fields-ie.label-align-right .kfrm-field-ie > *:nth-child(1) {\r\n    text-align: right;\r\n  }\r\n\r\n  .kfrm-fields-ie.label-above .kfrm-field-ie > *:nth-child(1):not(.checkbox) {\r\n      padding: 0.5em 0 0 0;\r\n      margin-bottom: -0.5em;\r\n  }\r\n\r\n  .kfrm-field-ie > label:not(.checkbox), .kfrm-fields-ie > label:not(.checkbox) {\r\n      font-weight: 600;\r\n  }\r\n\r\n  .kfrm-fields-ie.is-horizontal {\r\n    display: flex;\r\n    padding: 0 !important;\r\n    flex-direction: row;\r\n  }\r\n\r\n  .kfrm-fields-ie.kfrm-fields-ie.is-horizontal > *:not(.kfrm-select) {\r\n    padding: .5em;\r\n  }\r\n\r\n  .kfrm-fields-ie.is-horizontal > *:not(:first-child) {\r\n    margin-left: 1em;\r\n  }\r\n\r\n.kfrm-fields-ie > label {\r\n    padding-left: 0 !important;\r\n    padding-right: 0 !important;\r\n}\r\n\r\n\r\n/* FORMS END */\r\n/* DATETIME STARTS */\r\n.kdtp {\r\n    border: 1px solid silver;\r\n    background-color: white;\r\n    box-shadow: 4px 8px 15px 0px rgba(0,0,0,.16);\r\n    border-radius: 8px;\r\n    overflow: hidden;    \r\n    z-index: 100000;\r\n    outline: none;\r\n    font-size: 0.7rem;\r\n}\r\n\r\n.kdtp-buttons {\r\n    margin-top: 1em;\r\n    display: flex;\r\n    flex-direction: row;\r\n    justify-content: space-between;\r\n}\r\n\r\n.kdtp-button {\r\n    height: 2.5em;\r\n    flex: 1;\r\n    background-color: #0099CC;\r\n    border: none;\r\n    color: white;\r\n    text-align: center;\r\n    text-decoration: none;\r\n    cursor: pointer;    \r\n    font-weight: 500;\r\n}\r\n\r\n.kdtp-button:focus, .kdtp-button:active {\r\n    outline: 0;\r\n}\r\n\r\n.kdtp-button-now {\r\n    border: none;\r\n    background-color: white;\r\n    color: #0099CC;\r\n}\r\n\r\n.kdtp-button:nth-child(2) {\r\n    border-top-left-radius: 8px;\r\n}\r\n\r\n.kdtp-button:not(:first-child) {\r\n    margin-left: 2px;\r\n}\r\n\r\n.kdtp-cal {\r\n    padding: 0;\r\n}\r\n\r\n.kdtp-cal * {\r\n    outline: none !important;\r\n}\r\n\r\n.kdtp-cal-body {\r\n    display: -ms-grid;\r\n    display: grid;\r\n    -ms-grid-columns: minmax(1em, 1fr) 5px minmax(1em, 1fr) 0.5em minmax(1em, 1fr) 0.5em minmax(1em, 1fr) 0.5em minmax(1em, 1fr) 0.5em minmax(1em, 1fr) 0.5em minmax(1em, 1fr);\r\n    grid-template-columns: repeat(7, minmax(1em, 1fr));\r\n    grid-gap: 0.5em;\r\n    -webkit-box-sizing: border-box;\r\n\tbox-sizing: border-box;\r\n    padding: 0 12px;\r\n    -ms-grid-rows: 1fr 0.5em 1fr 0.5em 1fr 0.5em 1fr 0.5em 1fr 0.5em 1fr 0.5em 1fr;\r\n}\r\n\r\n.kdtp-cal-body > *:nth-child(1) {\r\n    -ms-grid-row: 1;\r\n    -ms-grid-column: 1;\r\n}\r\n.kdtp-cal-body > *:nth-child(2) {\r\n    -ms-grid-row: 1;\r\n    -ms-grid-column: 3;\r\n}\r\n.kdtp-cal-body > *:nth-child(3) {\r\n    -ms-grid-row: 1;\r\n    -ms-grid-column: 5;\r\n}\r\n.kdtp-cal-body > *:nth-child(4) {\r\n    -ms-grid-row: 1;\r\n    -ms-grid-column: 7;\r\n}\r\n.kdtp-cal-body > *:nth-child(5) {\r\n    -ms-grid-row: 1;\r\n    -ms-grid-column: 9;\r\n}\r\n.kdtp-cal-body > *:nth-child(6) {\r\n    -ms-grid-row: 1;\r\n    -ms-grid-column: 11;\r\n}\r\n.kdtp-cal-body > *:nth-child(7) {\r\n    -ms-grid-row: 1;\r\n    -ms-grid-column: 13;\r\n}\r\n.kdtp-cal-body > *:nth-child(8) {\r\n    -ms-grid-row: 3;\r\n    -ms-grid-column: 1;\r\n}\r\n.kdtp-cal-body > *:nth-child(9) {\r\n    -ms-grid-row: 3;\r\n    -ms-grid-column: 3;\r\n}\r\n.kdtp-cal-body > *:nth-child(10) {\r\n    -ms-grid-row: 3;\r\n    -ms-grid-column: 5;\r\n}\r\n.kdtp-cal-body > *:nth-child(11) {\r\n    -ms-grid-row: 3;\r\n    -ms-grid-column: 7;\r\n}\r\n.kdtp-cal-body > *:nth-child(12) {\r\n    -ms-grid-row: 3;\r\n    -ms-grid-column: 9;\r\n}\r\n.kdtp-cal-body > *:nth-child(13) {\r\n    -ms-grid-row: 3;\r\n    -ms-grid-column: 11;\r\n}\r\n.kdtp-cal-body > *:nth-child(14) {\r\n    -ms-grid-row: 3;\r\n    -ms-grid-column: 13;\r\n}\r\n.kdtp-cal-body > *:nth-child(15) {\r\n    -ms-grid-row: 5;\r\n    -ms-grid-column: 1;\r\n}\r\n.kdtp-cal-body > *:nth-child(16) {\r\n    -ms-grid-row: 5;\r\n    -ms-grid-column: 3;\r\n}\r\n.kdtp-cal-body > *:nth-child(17) {\r\n    -ms-grid-row: 5;\r\n    -ms-grid-column: 5;\r\n}\r\n.kdtp-cal-body > *:nth-child(18) {\r\n    -ms-grid-row: 5;\r\n    -ms-grid-column: 7;\r\n}\r\n.kdtp-cal-body > *:nth-child(19) {\r\n    -ms-grid-row: 5;\r\n    -ms-grid-column: 9;\r\n}\r\n.kdtp-cal-body > *:nth-child(20) {\r\n    -ms-grid-row: 5;\r\n    -ms-grid-column: 11;\r\n}\r\n.kdtp-cal-body > *:nth-child(21) {\r\n    -ms-grid-row: 5;\r\n    -ms-grid-column: 13;\r\n}\r\n.kdtp-cal-body > *:nth-child(22) {\r\n    -ms-grid-row: 7;\r\n    -ms-grid-column: 1;\r\n}\r\n.kdtp-cal-body > *:nth-child(23) {\r\n    -ms-grid-row: 7;\r\n    -ms-grid-column: 3;\r\n}\r\n.kdtp-cal-body > *:nth-child(24) {\r\n    -ms-grid-row: 7;\r\n    -ms-grid-column: 5;\r\n}\r\n.kdtp-cal-body > *:nth-child(25) {\r\n    -ms-grid-row: 7;\r\n    -ms-grid-column: 7;\r\n}\r\n.kdtp-cal-body > *:nth-child(26) {\r\n    -ms-grid-row: 7;\r\n    -ms-grid-column: 9;\r\n}\r\n.kdtp-cal-body > *:nth-child(27) {\r\n    -ms-grid-row: 7;\r\n    -ms-grid-column: 11;\r\n}\r\n.kdtp-cal-body > *:nth-child(28) {\r\n    -ms-grid-row: 7;\r\n    -ms-grid-column: 13;\r\n}\r\n.kdtp-cal-body > *:nth-child(29) {\r\n    -ms-grid-row: 9;\r\n    -ms-grid-column: 1;\r\n}\r\n.kdtp-cal-body > *:nth-child(30) {\r\n    -ms-grid-row: 9;\r\n    -ms-grid-column: 3;\r\n}\r\n.kdtp-cal-body > *:nth-child(31) {\r\n    -ms-grid-row: 9;\r\n    -ms-grid-column: 5;\r\n}\r\n.kdtp-cal-body > *:nth-child(32) {\r\n    -ms-grid-row: 9;\r\n    -ms-grid-column: 7;\r\n}\r\n.kdtp-cal-body > *:nth-child(33) {\r\n    -ms-grid-row: 9;\r\n    -ms-grid-column: 9;\r\n}\r\n.kdtp-cal-body > *:nth-child(34) {\r\n    -ms-grid-row: 9;\r\n    -ms-grid-column: 11;\r\n}\r\n.kdtp-cal-body > *:nth-child(35) {\r\n    -ms-grid-row: 9;\r\n    -ms-grid-column: 13;\r\n}\r\n.kdtp-cal-body > *:nth-child(36) {\r\n    -ms-grid-row: 11;\r\n    -ms-grid-column: 1;\r\n}\r\n.kdtp-cal-body > *:nth-child(37) {\r\n    -ms-grid-row: 11;\r\n    -ms-grid-column: 3;\r\n}\r\n.kdtp-cal-body > *:nth-child(38) {\r\n    -ms-grid-row: 11;\r\n    -ms-grid-column: 5;\r\n}\r\n.kdtp-cal-body > *:nth-child(39) {\r\n    -ms-grid-row: 11;\r\n    -ms-grid-column: 7;\r\n}\r\n.kdtp-cal-body > *:nth-child(40) {\r\n    -ms-grid-row: 11;\r\n    -ms-grid-column: 9;\r\n}\r\n.kdtp-cal-body > *:nth-child(41) {\r\n    -ms-grid-row: 11;\r\n    -ms-grid-column: 11;\r\n}\r\n.kdtp-cal-body > *:nth-child(42) {\r\n    -ms-grid-row: 11;\r\n    -ms-grid-column: 13;\r\n}\r\n.kdtp-cal-body > *:nth-child(43) {\r\n    -ms-grid-row: 13;\r\n    -ms-grid-column: 1;\r\n}\r\n.kdtp-cal-body > *:nth-child(44) {\r\n    -ms-grid-row: 13;\r\n    -ms-grid-column: 3;\r\n}\r\n.kdtp-cal-body > *:nth-child(45) {\r\n    -ms-grid-row: 13;\r\n    -ms-grid-column: 5;\r\n}\r\n.kdtp-cal-body > *:nth-child(46) {\r\n    -ms-grid-row: 13;\r\n    -ms-grid-column: 7;\r\n}\r\n.kdtp-cal-body > *:nth-child(47) {\r\n    -ms-grid-row: 13;\r\n    -ms-grid-column: 9;\r\n}\r\n.kdtp-cal-body > *:nth-child(48) {\r\n    -ms-grid-row: 13;\r\n    -ms-grid-column: 11;\r\n}\r\n.kdtp-cal-body > *:nth-child(49) {\r\n    -ms-grid-row: 13;\r\n    -ms-grid-column: 13;\r\n}\r\n\r\n.kdtp-cal-header-input {\r\n    width: 100%;\r\n    width: -moz-available;          /* WebKit-based browsers will ignore this. */\r\n    width: -webkit-fill-available;  /* Mozilla-based browsers will ignore this. */\r\n    width: fill-available;\r\n    height: 100%;\r\n    height: -moz-available;          /* WebKit-based browsers will ignore this. */\r\n    height: -webkit-fill-available;  /* Mozilla-based browsers will ignore this. */\r\n    height: fill-available;\r\n\r\n    font-size: 1em;\r\n    padding: 2px 5px;\r\n    border: 1px solid silver;\r\n    outline: none;\r\n    background: #fff;\r\n    color: #262626;\r\n}\r\n\r\n.kdtp-cal-header-input.error {\r\n    border-color: red;\r\n}\r\n\r\n.kdtp-cal-header {\r\n    background-color: #0099CC;\r\n    color: white;\r\n    text-align: center;\r\n    font-size: 1.2em;\r\n    font-weight: 600;\r\n    height: 2em;\r\n    line-height: 2em;\r\n}\r\n\r\n.kdtp-cal-nav {\r\n    display: flex;\r\n    padding: 0;\r\n    margin: 0.7em 0;\r\n    line-height: 1em;\r\n}\r\n\r\n.kdtp-cal-nav-prev, .kdtp-cal-nav-next {\r\n    flex: 0 0 auto;\r\n    font-size: 3em;\r\n    font-weight: 600;\r\n    width: 1em;\r\n    color: #777777;\r\n    text-align: center;    \r\n}\r\n\r\n.kdtp-cal-nav-prev:hover, .kdtp-cal-nav-next:hover {\r\n    cursor: pointer;\r\n    color: #0099CC;\r\n}\r\n\r\n.kdtp-cal-nav-selectors {\r\n    flex: 1 1 auto;\r\n    display: flex;\r\n    margin: 0 0.5em;\r\n    font-size: 1.2em;\r\n}\r\n\r\n.kdtp-cal-nav-month {\r\n    flex: 1 1 auto;\r\n    margin-right: 0.5em;\r\n}\r\n\r\n.kdtp-cal-nav-year {\r\n    flex: 0 0 auto;\r\n}\r\n\r\n.kdtp-cal-nav-selectors select {\r\n    border: none;\r\n    color: #777777;\r\n    font-weight: 600;\r\n}\r\n\r\n.kdtp-cal-nav-selectors select:hover {\r\n    color: #0099CC;\r\n}\r\n\r\n.kdtp-cal-nav-selectors select:hover option {\r\n    color: #777777;\r\n}\r\n\r\n.kdtp-cal-weekday {\r\n    display: flex;\r\n    align-items: center;\r\n    justify-content: center;\r\n    height: 1.8em;\r\n    font-weight: 600;\r\n\tfont-size: 0.8em;\r\n    color: #262626;\r\n}\r\n\r\n.kdtp-cal-weekday.kdtp-cal-weekend {\r\n    color: #ff685d;\r\n}\r\n\r\n.kdtp-cal-day, .kdtp-cal-day-empty {\r\n    display: flex;\r\n    align-items: center;\r\n    justify-content: center;\r\n    height: 1.5em;\r\n    color: #262626;\r\n    border-radius: 4px;\r\n}\r\n\r\n.kdtp-cal-day.kdtp-cal-weekend {\r\n    color: #ff685d;\r\n    font-weight: 700;\r\n}\r\n\r\n.kdtp-cal-day:hover, .kdtp-cal-day-selected {\r\n    border: 2px solid #0099CC;\r\n    font-weight: 700;\r\n    cursor: pointer;\r\n}\r\n\r\n.kdtp-cal-day-current {\r\n    background-color: lightgray;\r\n}\r\n\r\n.kdtp-tp {\r\n    display: flex;\r\n    display:-webkit-flex;\r\n    display:-ms-flexbox;\r\n    align-items: center;\r\n    -webkit-align-items:center;\r\n    -ms-flex-align:center;\r\n    margin-top: 1em;\r\n    padding: 0 1em;\r\n}\r\n\r\n.kdtp-tp-time {\r\n    flex: 0 0 5em;\r\n    -webkit-flex: 0 0 5em;\r\n    -ms-flex: 0 0 5em;\r\n    text-align: center;\r\n    font-weight: 600;\r\n    color: #777777;\r\n    border: 2px solid #0099CC;\r\n    border-radius: 6px;\r\n    margin-right: 0.5em;\r\n}\r\n\r\n.kdtp-tp-sliders {\r\n    flex: 1 1 auto;\r\n    -webkit-flex: 1 1 auto;\r\n    -ms-flex: 1 1 auto;\r\n}\r\n\r\n.kdtp-tp-time-row {\r\n    display:-webkit-flex;\r\n    display:-ms-flexbox;\r\n    display:flex;\r\n    -webkit-align-items:center;\r\n    -ms-flex-align:center;\r\n    align-items:center;\r\n    height: 1.5em;\r\n    background:linear-gradient(to right,#c5c5c5,#c5c5c5) left 50%/100% 1px no-repeat;\r\n}\r\n\r\n.kdtp-tp-time-row input[type=range] {\r\n    background:0 0;\r\n    cursor:pointer;\r\n    -webkit-flex:1;\r\n    -ms-flex:1;\r\n    flex:1;\r\n    height:100%;\r\n    padding:0;\r\n    margin:0;\r\n    -webkit-appearance:none\r\n}\r\n\r\n.kdtp-tp-time-row input[type=range]:hover::-webkit-slider-thumb {\r\n    border-color:#777777\r\n}\r\n\r\n.kdtp-tp-time-row input[type=range]:hover::-moz-range-thumb {\r\n    border-color:#777777\r\n}\r\n\r\n.kdtp-tp-time-row input[type=range]:hover::-ms-thumb {\r\n    border-color:#777777\r\n}\r\n\r\n.kdtp-tp-time-row input[type=range]:focus {\r\n    outline:0\r\n}\r\n\r\n.kdtp-tp-time-row input[type=range]:focus::-webkit-slider-thumb {\r\n    background:#0099CC;\r\n    border-color:#0099CC\r\n}\r\n\r\n.kdtp-tp-time-row input[type=range]:focus::-moz-range-thumb {\r\n    background:#0099CC;\r\n    border-color:#0099CC\r\n}\r\n\r\n.kdtp-tp-time-row input[type=range]:focus::-ms-thumb {\r\n    background:#0099CC;\r\n    border-color:#0099CC\r\n}\r\n\r\n.kdtp-tp-time-row input[type=range]::-webkit-slider-thumb {\r\n    -webkit-appearance:none;\r\n    box-sizing:border-box;\r\n    height:12px;\r\n    width:12px;\r\n    border-radius:3px;\r\n    border:1px solid #c5c5c5;\r\n    background:#fff;\r\n    cursor:pointer;\r\n    transition:background .2s;\r\n    margin-top:-6px\r\n}\r\n\r\n.kdtp-tp-time-row input[type=range]::-moz-range-thumb {\r\n    box-sizing:border-box;\r\n    height:12px;\r\n    width:12px;\r\n    border-radius:3px;\r\n    border:1px solid #c5c5c5;\r\n    background:#fff;\r\n    cursor:pointer;\r\n    transition:background .2s\r\n}\r\n\r\n.kdtp-tp-time-row input[type=range]::-ms-thumb {\r\n    box-sizing:border-box;\r\n    height:12px;\r\n    width:12px;\r\n    border-radius:3px;\r\n    border:1px solid #c5c5c5;\r\n    background:#fff;\r\n    cursor:pointer;\r\n    transition:background .2s\r\n}\r\n\r\n.kdtp-tp-time-row input[type=range]::-webkit-slider-runnable-track {\r\n    border:none;\r\n    height:1px;\r\n    cursor:pointer;\r\n    color:transparent;\r\n    background:0 0\r\n}\r\n\r\n.kdtp-tp-time-row input[type=range]::-moz-range-track {\r\n    border:none;\r\n    height:1px;\r\n    cursor:pointer;\r\n    color:transparent;\r\n    background:0 0\r\n}\r\n\r\n.kdtp-tp-time-row input[type=range]::-ms-track {\r\n    border:none;\r\n    height:1px;\r\n    cursor:pointer;\r\n    color:transparent;\r\n    background:0 0\r\n}\r\n\r\n.kdtp-tp-time-row input[type=range]::-ms-fill-lower {\r\n    background:0 0\r\n}\r\n\r\n.kdtp-tp-time-row input[type=range]::-ms-fill-upper {\r\n    background:0 0\r\n}\r\n", ""]);



/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js?!../../easydata.js/packs/ui/dist/assets/css/easy-grid.css":
/*!************************************************************************************************************************************************************************************!*\
  !*** c:/projects/easydata/samples/EasyDataBasicDemo.NetCore31/node_modules/css-loader/dist/cjs.js??ref--6!c:/projects/easydata/easydata.js/packs/ui/dist/assets/css/easy-grid.css ***!
  \************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(/*! ../../../../../../samples/EasyDataBasicDemo.NetCore31/node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js")(false);
// Module
exports.push([module.i, ".keg-container * {\r\n    outline: none;    \r\n}\r\n\r\n\r\n.keg-container {\r\n    overflow: hidden;\r\n}\r\n\r\n.keg-header {\r\n    background-color: #f8f8f8;\r\n    border-bottom: 1px solid #babfc7;\r\n    overflow: hidden;\r\n\r\n}\r\n\r\n.keg-root {\r\n    font-family: \"Roboto\", Arial;\r\n    display: flex;\r\n    flex-direction: column;\r\n    border: 1px solid #babfc7;\r\n}\r\n\r\n.keg-body {\r\n/*\r\n    flex-grow: 1;\r\n    height: calc(100% - 50px);\r\n    width: 100%;\r\n*/    \r\n    overflow: hidden;\r\n\r\n    /* !!! temp */\r\n    /*height: 340px;*/\r\n}\r\n\r\n.keg-body-viewport {\r\n    overflow-x: auto;\r\n    overflow-y: auto;\r\n    height: 100%;\r\n    border: 1px solid transparent;\r\n}\r\n\r\n.keg-body-viewport:focus, .keg-body-viewport:focus-within {\r\n    border: 1px solid #838383;\r\n}\r\n\r\n.keg-header-row {\r\n    min-height: 30px;\r\n    display: flex;\r\n    font-size: 12px;\r\n    font-weight: 600;\r\n    color: rgba(0,0,0,.54);\r\n}\r\n\r\n.keg-row {\r\n    display: flex;\r\n    font-size: 12px;\r\n    background-color: #fff;\r\n    color: #181d1f;\r\n    outline: none;\r\n    border-color: #dde2eb;\r\n    border-width: 1px;\r\n    border-bottom-style: solid;\r\n    height: 26px;\r\n    align-items: center;\r\n}\r\n\r\n.keg-row:not(.keg-row-active):hover {\r\n    background-color: #fffae9;\r\n}\r\n\r\n.keg-row-odd {\r\n    background-color: #fcfcfc;\r\n}\r\n\r\n.keg-row-active {\r\n    background-color: #fff3cf;\r\n    font-weight: 600;\r\n}\r\n\r\n.keg-cell, .keg-header-cell {\r\n    display: flex;\r\n/*\r\n    flex: 1;\r\n    min-width: 150px;\r\n*/\r\n}\r\n\r\n.keg-header-cell {\r\n    position: relative;\r\n    align-items: center;\r\n    padding: 2px 15px;\r\n}\r\n\r\n.keg-header-cell-resize {\r\n    display: flex;\r\n    align-items: center;\r\n    position: absolute;\r\n    z-index: 2;\r\n    height: 100%;\r\n    width: 8px;\r\n    top: 0;\r\n    /*cursor: ew-resize;*/\r\n    right: -4px;\r\n}\r\n\r\n.keg-header-cell-resize:after {\r\n    content: \"\";\r\n    position: absolute;\r\n    z-index: 1;\r\n    display: block;\r\n    left: calc(50% - 1px);\r\n    width: 2px;\r\n    height: 50%;\r\n    top: 25%;\r\n    background-color: rgba(186,191,199,.5);    \r\n}\r\n\r\n.keg-header-cell-label {\r\n    width: 100%;\r\n    text-align: center;\r\n    word-break: break-word;\r\n    -ms-word-wrap: break-word;\r\n}\r\n\r\n.keg-cell {\r\n    padding: 0 15px;\r\n    border-right-width: 1px;\r\n    border-right: solid transparent;\r\n    align-items: center;\r\n    height: 100%;\r\n    outline: none;\r\n}\r\n\r\n.keg-cell-value {\r\n    width: 100%;\r\n    overflow: hidden;\r\n    text-overflow: ellipsis;\r\n    white-space: nowrap;\r\n    max-height: 100%;\r\n}\r\n\r\n/*\r\n.keg-row .keg-cell:first-child, .keg-header-row .keg-header-cell:first-child {\r\n    flex: 0 0 55px;\r\n    min-width: 55px;\r\n}\r\n*/\r\n\r\n.keg-cell-align-left, .keg-cell-value-align-left {\r\n    text-align: left;\r\n}\r\n\r\n.keg-cell-align-right, .keg-cell-value-align-right {\r\n    text-align: right;\r\n}\r\n\r\n.keg-cell-align-center, .keg-cell-value-align-center {\r\n    text-align: center;\r\n}\r\n\r\n.keg-cell-value-bool {\r\n    margin: 0 auto;\r\n    width: auto;\r\n}\r\n\r\n.keg-cell-value-true::before {\r\n    content: \"✔\";\r\n    color: #28a745;\r\n    font-size: 16px;\r\n}\r\n\r\n.keg-cell-value-false::before {\r\n    content: \"✖\";\r\n    color: #dc3545;\r\n    font-size: 16px;\r\n}\r\n\r\n.keg-addrow {\r\n    position: relative;\r\n    height: 23px;\r\n    width: 23px;\r\n}\r\n\r\n.keg-addrow a {\r\n    background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC8AAAAWCAYAAABQUsXJAAAACXBIWXMAAAsTAAALEwEAmpwYAAAKT2lDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjanVNnVFPpFj333vRCS4iAlEtvUhUIIFJCi4AUkSYqIQkQSoghodkVUcERRUUEG8igiAOOjoCMFVEsDIoK2AfkIaKOg6OIisr74Xuja9a89+bN/rXXPues852zzwfACAyWSDNRNYAMqUIeEeCDx8TG4eQuQIEKJHAAEAizZCFz/SMBAPh+PDwrIsAHvgABeNMLCADATZvAMByH/w/qQplcAYCEAcB0kThLCIAUAEB6jkKmAEBGAYCdmCZTAKAEAGDLY2LjAFAtAGAnf+bTAICd+Jl7AQBblCEVAaCRACATZYhEAGg7AKzPVopFAFgwABRmS8Q5ANgtADBJV2ZIALC3AMDOEAuyAAgMADBRiIUpAAR7AGDIIyN4AISZABRG8lc88SuuEOcqAAB4mbI8uSQ5RYFbCC1xB1dXLh4ozkkXKxQ2YQJhmkAuwnmZGTKBNA/g88wAAKCRFRHgg/P9eM4Ors7ONo62Dl8t6r8G/yJiYuP+5c+rcEAAAOF0ftH+LC+zGoA7BoBt/qIl7gRoXgugdfeLZrIPQLUAoOnaV/Nw+H48PEWhkLnZ2eXk5NhKxEJbYcpXff5nwl/AV/1s+X48/Pf14L7iJIEyXYFHBPjgwsz0TKUcz5IJhGLc5o9H/LcL//wd0yLESWK5WCoU41EScY5EmozzMqUiiUKSKcUl0v9k4t8s+wM+3zUAsGo+AXuRLahdYwP2SycQWHTA4vcAAPK7b8HUKAgDgGiD4c93/+8//UegJQCAZkmScQAAXkQkLlTKsz/HCAAARKCBKrBBG/TBGCzABhzBBdzBC/xgNoRCJMTCQhBCCmSAHHJgKayCQiiGzbAdKmAv1EAdNMBRaIaTcA4uwlW4Dj1wD/phCJ7BKLyBCQRByAgTYSHaiAFiilgjjggXmYX4IcFIBBKLJCDJiBRRIkuRNUgxUopUIFVIHfI9cgI5h1xGupE7yAAygvyGvEcxlIGyUT3UDLVDuag3GoRGogvQZHQxmo8WoJvQcrQaPYw2oefQq2gP2o8+Q8cwwOgYBzPEbDAuxsNCsTgsCZNjy7EirAyrxhqwVqwDu4n1Y8+xdwQSgUXACTYEd0IgYR5BSFhMWE7YSKggHCQ0EdoJNwkDhFHCJyKTqEu0JroR+cQYYjIxh1hILCPWEo8TLxB7iEPENyQSiUMyJ7mQAkmxpFTSEtJG0m5SI+ksqZs0SBojk8naZGuyBzmULCAryIXkneTD5DPkG+Qh8lsKnWJAcaT4U+IoUspqShnlEOU05QZlmDJBVaOaUt2ooVQRNY9aQq2htlKvUYeoEzR1mjnNgxZJS6WtopXTGmgXaPdpr+h0uhHdlR5Ol9BX0svpR+iX6AP0dwwNhhWDx4hnKBmbGAcYZxl3GK+YTKYZ04sZx1QwNzHrmOeZD5lvVVgqtip8FZHKCpVKlSaVGyovVKmqpqreqgtV81XLVI+pXlN9rkZVM1PjqQnUlqtVqp1Q61MbU2epO6iHqmeob1Q/pH5Z/YkGWcNMw09DpFGgsV/jvMYgC2MZs3gsIWsNq4Z1gTXEJrHN2Xx2KruY/R27iz2qqaE5QzNKM1ezUvOUZj8H45hx+Jx0TgnnKKeX836K3hTvKeIpG6Y0TLkxZVxrqpaXllirSKtRq0frvTau7aedpr1Fu1n7gQ5Bx0onXCdHZ4/OBZ3nU9lT3acKpxZNPTr1ri6qa6UbobtEd79up+6Ynr5egJ5Mb6feeb3n+hx9L/1U/W36p/VHDFgGswwkBtsMzhg8xTVxbzwdL8fb8VFDXcNAQ6VhlWGX4YSRudE8o9VGjUYPjGnGXOMk423GbcajJgYmISZLTepN7ppSTbmmKaY7TDtMx83MzaLN1pk1mz0x1zLnm+eb15vft2BaeFostqi2uGVJsuRaplnutrxuhVo5WaVYVVpds0atna0l1rutu6cRp7lOk06rntZnw7Dxtsm2qbcZsOXYBtuutm22fWFnYhdnt8Wuw+6TvZN9un2N/T0HDYfZDqsdWh1+c7RyFDpWOt6azpzuP33F9JbpL2dYzxDP2DPjthPLKcRpnVOb00dnF2e5c4PziIuJS4LLLpc+Lpsbxt3IveRKdPVxXeF60vWdm7Obwu2o26/uNu5p7ofcn8w0nymeWTNz0MPIQ+BR5dE/C5+VMGvfrH5PQ0+BZ7XnIy9jL5FXrdewt6V3qvdh7xc+9j5yn+M+4zw33jLeWV/MN8C3yLfLT8Nvnl+F30N/I/9k/3r/0QCngCUBZwOJgUGBWwL7+Hp8Ib+OPzrbZfay2e1BjKC5QRVBj4KtguXBrSFoyOyQrSH355jOkc5pDoVQfujW0Adh5mGLw34MJ4WHhVeGP45wiFga0TGXNXfR3ENz30T6RJZE3ptnMU85ry1KNSo+qi5qPNo3ujS6P8YuZlnM1VidWElsSxw5LiquNm5svt/87fOH4p3iC+N7F5gvyF1weaHOwvSFpxapLhIsOpZATIhOOJTwQRAqqBaMJfITdyWOCnnCHcJnIi/RNtGI2ENcKh5O8kgqTXqS7JG8NXkkxTOlLOW5hCepkLxMDUzdmzqeFpp2IG0yPTq9MYOSkZBxQqohTZO2Z+pn5mZ2y6xlhbL+xW6Lty8elQfJa7OQrAVZLQq2QqboVFoo1yoHsmdlV2a/zYnKOZarnivN7cyzytuQN5zvn//tEsIS4ZK2pYZLVy0dWOa9rGo5sjxxedsK4xUFK4ZWBqw8uIq2Km3VT6vtV5eufr0mek1rgV7ByoLBtQFr6wtVCuWFfevc1+1dT1gvWd+1YfqGnRs+FYmKrhTbF5cVf9go3HjlG4dvyr+Z3JS0qavEuWTPZtJm6ebeLZ5bDpaql+aXDm4N2dq0Dd9WtO319kXbL5fNKNu7g7ZDuaO/PLi8ZafJzs07P1SkVPRU+lQ27tLdtWHX+G7R7ht7vPY07NXbW7z3/T7JvttVAVVN1WbVZftJ+7P3P66Jqun4lvttXa1ObXHtxwPSA/0HIw6217nU1R3SPVRSj9Yr60cOxx++/p3vdy0NNg1VjZzG4iNwRHnk6fcJ3/ceDTradox7rOEH0x92HWcdL2pCmvKaRptTmvtbYlu6T8w+0dbq3nr8R9sfD5w0PFl5SvNUyWna6YLTk2fyz4ydlZ19fi753GDborZ752PO32oPb++6EHTh0kX/i+c7vDvOXPK4dPKy2+UTV7hXmq86X23qdOo8/pPTT8e7nLuarrlca7nuer21e2b36RueN87d9L158Rb/1tWeOT3dvfN6b/fF9/XfFt1+cif9zsu72Xcn7q28T7xf9EDtQdlD3YfVP1v+3Njv3H9qwHeg89HcR/cGhYPP/pH1jw9DBY+Zj8uGDYbrnjg+OTniP3L96fynQ89kzyaeF/6i/suuFxYvfvjV69fO0ZjRoZfyl5O/bXyl/erA6xmv28bCxh6+yXgzMV70VvvtwXfcdx3vo98PT+R8IH8o/2j5sfVT0Kf7kxmTk/8EA5jz/GMzLdsAAAAgY0hSTQAAeiUAAICDAAD5/wAAgOkAAHUwAADqYAAAOpgAABdvkl/FRgAAApBJREFUeNrUljFME1EYx3/v3buWNhCGemKo0eGUxEUHEtx0YHBAExc3o4sJ0Z04aeLkwOaCOjIocVLj5MSqYZEYBwiDBW2QGG21QHvX9xwobY+29o5eB/7b97+77/vf9/7ve08sLS2dBmaB64BNb9gE5oDZjM324xw8/wrYpIEZ4C4w0mMND3gNzKia8BvEgxHgAfALeNLE36nxVgw17H29EpgiXljA5AFuMibhzZiSQIL4kegSx1JDAjqU0TwP3/fDJtZd4lYIYNeHbQ9MuBoyzFtSSlzXJZvNorWmL6hoZi5meXrFJWXLUD8QSrwQAsdxyGQy/RPvaW6fzTB9ziEpRahPZJT81WqVvkHA78pefhPyE8kRhupkk06xECIQG2MO12gBqrmOFOxHthTYUrBPaAPVNnVUu6niui6O47S8PDg4yMTERIBbWVmhUCggpYzk70unhlm8Ntb28datC4F47ssW996vQdr+v3ghBL7vUy6XA3wymURrTaVSCXT+UBtYwI6vWS001TCGk0MJUpZkrVhGNzX6x46/t1TdOq+UYmNjg/X19caRaVmMj49TKpVYXl7Gtu3AGI3UdQAl+bj5l7H5Tw1ux2Px5nkujw5xZuEz7FbrtsESkFYtO1l1muuB896y6quilKrHPUEKSDbl0QZVG5HDCYuCoSG+wwg60tMmknilVP+UGDg2oOqLcuhR2XKJ0JpcLofnedH9HeGadf/DN06kbUqeDlqmF/HGGPL5PEKIePze9pYuebP6c2+oD6jQnRd9sIzoEre1DYlIjRESKPahj3+6xHGgKIGXEe5CYVAA3h3g3tb4GLc3rxTwCEgBV4F0j0m/A8+AFwf4BeA4MA2M9lhju9ach/8GANfFuVIHy61bAAAAAElFTkSuQmCC') no-repeat;\r\n    width: 100%;\r\n    height: 100%;\r\n    display: block;\r\n}\r\n\r\n.keg-addrow a:hover {\r\n    background-position: -25px 0 !important;\r\n}\r\n\r\n/* Pagination */\r\n.keg-pagination {\r\n    display: inline-block;\r\n    padding-left: 0;\r\n    margin: 0;\r\n    border-radius: 4px;\r\n}\r\n\r\n.keg-page-item {\r\n    display: inline;\r\n}\r\n\r\n.keg-page-link {\r\n    font-size: 12px;\r\n    background-color: #fff;\r\n    border: 1px solid #ddd;\r\n    color: #428bca;\r\n    float: left;\r\n    line-height: 1.42857;\r\n    margin-left: -1px;\r\n    padding: 5px 10px;\r\n    position: relative;\r\n    text-decoration: none;\r\n}\r\n\r\n.keg-page-link:hover, .keg-page-link:focus {\r\n    background-color: #eee;\r\n    border-color: #ddd;\r\n    color: #2a6496;\r\n    border-bottom: #ffd148 2px solid !important;\r\n}\r\n\r\n.keg-page-item.active > .keg-page-link, .keg-page-item.active > .keg-page-link:hover, .keg-page-item.active > .keg-page-link:focus {\r\n    background-color: #428bca;\r\n    border-color: #428bca;\r\n    color: #fff;\r\n    cursor: default;\r\n    z-index: 2;\r\n}\r\n\r\n.keg-page-item.disabled > .keg-page-link, .keg-page-item.disabled > .keg-page-link:hover, .keg-page-item.disabled > .keg-page-link:focus {\r\n    background-color: #fff;\r\n    border-color: #ddd;\r\n    color: #999;\r\n    cursor: not-allowed;\r\n}\r\n\r\n.keg-page-item:first-child > .keg-page-link {\r\n    border-bottom-left-radius: 3px;\r\n    border-top-left-radius: 3px;\r\n    margin-left: 0;\r\n}\r\n\r\n.keg-page-item:last-child > .keg-page-link {\r\n    border-bottom-right-radius: 3px;\r\n    border-top-right-radius: 3px;\r\n}\r\n\r\n.keg-footer {\r\n    display: flex;\r\n    /*justify-content: space-between;*/\r\n    margin-top: 5px;\r\n    flex-wrap: wrap;\r\n}\r\n\r\n.keg-page-info {\r\n    padding: 5px 10px;\r\n    font-size: 16px;\r\n    white-space: nowrap;\r\n    flex: 1 1 auto;\r\n    text-align: end;\r\n    color: rgba(0,0,0,.54);\r\n}\r\n\r\n.keg-page-info > span {\r\n    color: #212529;\r\n}", ""]);



/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/api.js":
/*!************************************************************************************************************!*\
  !*** c:/projects/easydata/samples/EasyDataBasicDemo.NetCore31/node_modules/css-loader/dist/runtime/api.js ***!
  \************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function (useSourceMap) {
  var list = []; // return the list of modules as css string

  list.toString = function toString() {
    return this.map(function (item) {
      var content = cssWithMappingToString(item, useSourceMap);

      if (item[2]) {
        return '@media ' + item[2] + '{' + content + '}';
      } else {
        return content;
      }
    }).join('');
  }; // import a list of modules into the list


  list.i = function (modules, mediaQuery) {
    if (typeof modules === 'string') {
      modules = [[null, modules, '']];
    }

    var alreadyImportedModules = {};

    for (var i = 0; i < this.length; i++) {
      var id = this[i][0];

      if (id != null) {
        alreadyImportedModules[id] = true;
      }
    }

    for (i = 0; i < modules.length; i++) {
      var item = modules[i]; // skip already imported module
      // this implementation is not 100% perfect for weird media query combinations
      // when a module is imported multiple times with different media queries.
      // I hope this will never occur (Hey this way we have smaller bundles)

      if (item[0] == null || !alreadyImportedModules[item[0]]) {
        if (mediaQuery && !item[2]) {
          item[2] = mediaQuery;
        } else if (mediaQuery) {
          item[2] = '(' + item[2] + ') and (' + mediaQuery + ')';
        }

        list.push(item);
      }
    }
  };

  return list;
};

function cssWithMappingToString(item, useSourceMap) {
  var content = item[1] || '';
  var cssMapping = item[3];

  if (!cssMapping) {
    return content;
  }

  if (useSourceMap && typeof btoa === 'function') {
    var sourceMapping = toComment(cssMapping);
    var sourceURLs = cssMapping.sources.map(function (source) {
      return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */';
    });
    return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
  }

  return [content].join('\n');
} // Adapted from convert-source-map (MIT)


function toComment(sourceMap) {
  // eslint-disable-next-line no-undef
  var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
  var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;
  return '/*# ' + data + ' */';
}

/***/ }),

/***/ "./node_modules/process/browser.js":
/*!************************************************************************************************!*\
  !*** c:/projects/easydata/samples/EasyDataBasicDemo.NetCore31/node_modules/process/browser.js ***!
  \************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),

/***/ "./node_modules/style-loader/lib/addStyles.js":
/*!***********************************************************************************************************!*\
  !*** c:/projects/easydata/samples/EasyDataBasicDemo.NetCore31/node_modules/style-loader/lib/addStyles.js ***!
  \***********************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

var stylesInDom = {};

var	memoize = function (fn) {
	var memo;

	return function () {
		if (typeof memo === "undefined") memo = fn.apply(this, arguments);
		return memo;
	};
};

var isOldIE = memoize(function () {
	// Test for IE <= 9 as proposed by Browserhacks
	// @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
	// Tests for existence of standard globals is to allow style-loader
	// to operate correctly into non-standard environments
	// @see https://github.com/webpack-contrib/style-loader/issues/177
	return window && document && document.all && !window.atob;
});

var getTarget = function (target, parent) {
  if (parent){
    return parent.querySelector(target);
  }
  return document.querySelector(target);
};

var getElement = (function (fn) {
	var memo = {};

	return function(target, parent) {
                // If passing function in options, then use it for resolve "head" element.
                // Useful for Shadow Root style i.e
                // {
                //   insertInto: function () { return document.querySelector("#foo").shadowRoot }
                // }
                if (typeof target === 'function') {
                        return target();
                }
                if (typeof memo[target] === "undefined") {
			var styleTarget = getTarget.call(this, target, parent);
			// Special case to return head of iframe instead of iframe itself
			if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
				try {
					// This will throw an exception if access to iframe is blocked
					// due to cross-origin restrictions
					styleTarget = styleTarget.contentDocument.head;
				} catch(e) {
					styleTarget = null;
				}
			}
			memo[target] = styleTarget;
		}
		return memo[target]
	};
})();

var singleton = null;
var	singletonCounter = 0;
var	stylesInsertedAtTop = [];

var	fixUrls = __webpack_require__(/*! ./urls */ "./node_modules/style-loader/lib/urls.js");

module.exports = function(list, options) {
	if (typeof DEBUG !== "undefined" && DEBUG) {
		if (typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}

	options = options || {};

	options.attrs = typeof options.attrs === "object" ? options.attrs : {};

	// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
	// tags it will allow on a page
	if (!options.singleton && typeof options.singleton !== "boolean") options.singleton = isOldIE();

	// By default, add <style> tags to the <head> element
        if (!options.insertInto) options.insertInto = "head";

	// By default, add <style> tags to the bottom of the target
	if (!options.insertAt) options.insertAt = "bottom";

	var styles = listToStyles(list, options);

	addStylesToDom(styles, options);

	return function update (newList) {
		var mayRemove = [];

		for (var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];

			domStyle.refs--;
			mayRemove.push(domStyle);
		}

		if(newList) {
			var newStyles = listToStyles(newList, options);
			addStylesToDom(newStyles, options);
		}

		for (var i = 0; i < mayRemove.length; i++) {
			var domStyle = mayRemove[i];

			if(domStyle.refs === 0) {
				for (var j = 0; j < domStyle.parts.length; j++) domStyle.parts[j]();

				delete stylesInDom[domStyle.id];
			}
		}
	};
};

function addStylesToDom (styles, options) {
	for (var i = 0; i < styles.length; i++) {
		var item = styles[i];
		var domStyle = stylesInDom[item.id];

		if(domStyle) {
			domStyle.refs++;

			for(var j = 0; j < domStyle.parts.length; j++) {
				domStyle.parts[j](item.parts[j]);
			}

			for(; j < item.parts.length; j++) {
				domStyle.parts.push(addStyle(item.parts[j], options));
			}
		} else {
			var parts = [];

			for(var j = 0; j < item.parts.length; j++) {
				parts.push(addStyle(item.parts[j], options));
			}

			stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
		}
	}
}

function listToStyles (list, options) {
	var styles = [];
	var newStyles = {};

	for (var i = 0; i < list.length; i++) {
		var item = list[i];
		var id = options.base ? item[0] + options.base : item[0];
		var css = item[1];
		var media = item[2];
		var sourceMap = item[3];
		var part = {css: css, media: media, sourceMap: sourceMap};

		if(!newStyles[id]) styles.push(newStyles[id] = {id: id, parts: [part]});
		else newStyles[id].parts.push(part);
	}

	return styles;
}

function insertStyleElement (options, style) {
	var target = getElement(options.insertInto)

	if (!target) {
		throw new Error("Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.");
	}

	var lastStyleElementInsertedAtTop = stylesInsertedAtTop[stylesInsertedAtTop.length - 1];

	if (options.insertAt === "top") {
		if (!lastStyleElementInsertedAtTop) {
			target.insertBefore(style, target.firstChild);
		} else if (lastStyleElementInsertedAtTop.nextSibling) {
			target.insertBefore(style, lastStyleElementInsertedAtTop.nextSibling);
		} else {
			target.appendChild(style);
		}
		stylesInsertedAtTop.push(style);
	} else if (options.insertAt === "bottom") {
		target.appendChild(style);
	} else if (typeof options.insertAt === "object" && options.insertAt.before) {
		var nextSibling = getElement(options.insertAt.before, target);
		target.insertBefore(style, nextSibling);
	} else {
		throw new Error("[Style Loader]\n\n Invalid value for parameter 'insertAt' ('options.insertAt') found.\n Must be 'top', 'bottom', or Object.\n (https://github.com/webpack-contrib/style-loader#insertat)\n");
	}
}

function removeStyleElement (style) {
	if (style.parentNode === null) return false;
	style.parentNode.removeChild(style);

	var idx = stylesInsertedAtTop.indexOf(style);
	if(idx >= 0) {
		stylesInsertedAtTop.splice(idx, 1);
	}
}

function createStyleElement (options) {
	var style = document.createElement("style");

	if(options.attrs.type === undefined) {
		options.attrs.type = "text/css";
	}

	if(options.attrs.nonce === undefined) {
		var nonce = getNonce();
		if (nonce) {
			options.attrs.nonce = nonce;
		}
	}

	addAttrs(style, options.attrs);
	insertStyleElement(options, style);

	return style;
}

function createLinkElement (options) {
	var link = document.createElement("link");

	if(options.attrs.type === undefined) {
		options.attrs.type = "text/css";
	}
	options.attrs.rel = "stylesheet";

	addAttrs(link, options.attrs);
	insertStyleElement(options, link);

	return link;
}

function addAttrs (el, attrs) {
	Object.keys(attrs).forEach(function (key) {
		el.setAttribute(key, attrs[key]);
	});
}

function getNonce() {
	if (false) {}

	return __webpack_require__.nc;
}

function addStyle (obj, options) {
	var style, update, remove, result;

	// If a transform function was defined, run it on the css
	if (options.transform && obj.css) {
	    result = typeof options.transform === 'function'
		 ? options.transform(obj.css) 
		 : options.transform.default(obj.css);

	    if (result) {
	    	// If transform returns a value, use that instead of the original css.
	    	// This allows running runtime transformations on the css.
	    	obj.css = result;
	    } else {
	    	// If the transform function returns a falsy value, don't add this css.
	    	// This allows conditional loading of css
	    	return function() {
	    		// noop
	    	};
	    }
	}

	if (options.singleton) {
		var styleIndex = singletonCounter++;

		style = singleton || (singleton = createStyleElement(options));

		update = applyToSingletonTag.bind(null, style, styleIndex, false);
		remove = applyToSingletonTag.bind(null, style, styleIndex, true);

	} else if (
		obj.sourceMap &&
		typeof URL === "function" &&
		typeof URL.createObjectURL === "function" &&
		typeof URL.revokeObjectURL === "function" &&
		typeof Blob === "function" &&
		typeof btoa === "function"
	) {
		style = createLinkElement(options);
		update = updateLink.bind(null, style, options);
		remove = function () {
			removeStyleElement(style);

			if(style.href) URL.revokeObjectURL(style.href);
		};
	} else {
		style = createStyleElement(options);
		update = applyToTag.bind(null, style);
		remove = function () {
			removeStyleElement(style);
		};
	}

	update(obj);

	return function updateStyle (newObj) {
		if (newObj) {
			if (
				newObj.css === obj.css &&
				newObj.media === obj.media &&
				newObj.sourceMap === obj.sourceMap
			) {
				return;
			}

			update(obj = newObj);
		} else {
			remove();
		}
	};
}

var replaceText = (function () {
	var textStore = [];

	return function (index, replacement) {
		textStore[index] = replacement;

		return textStore.filter(Boolean).join('\n');
	};
})();

function applyToSingletonTag (style, index, remove, obj) {
	var css = remove ? "" : obj.css;

	if (style.styleSheet) {
		style.styleSheet.cssText = replaceText(index, css);
	} else {
		var cssNode = document.createTextNode(css);
		var childNodes = style.childNodes;

		if (childNodes[index]) style.removeChild(childNodes[index]);

		if (childNodes.length) {
			style.insertBefore(cssNode, childNodes[index]);
		} else {
			style.appendChild(cssNode);
		}
	}
}

function applyToTag (style, obj) {
	var css = obj.css;
	var media = obj.media;

	if(media) {
		style.setAttribute("media", media)
	}

	if(style.styleSheet) {
		style.styleSheet.cssText = css;
	} else {
		while(style.firstChild) {
			style.removeChild(style.firstChild);
		}

		style.appendChild(document.createTextNode(css));
	}
}

function updateLink (link, options, obj) {
	var css = obj.css;
	var sourceMap = obj.sourceMap;

	/*
		If convertToAbsoluteUrls isn't defined, but sourcemaps are enabled
		and there is no publicPath defined then lets turn convertToAbsoluteUrls
		on by default.  Otherwise default to the convertToAbsoluteUrls option
		directly
	*/
	var autoFixUrls = options.convertToAbsoluteUrls === undefined && sourceMap;

	if (options.convertToAbsoluteUrls || autoFixUrls) {
		css = fixUrls(css);
	}

	if (sourceMap) {
		// http://stackoverflow.com/a/26603875
		css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
	}

	var blob = new Blob([css], { type: "text/css" });

	var oldSrc = link.href;

	link.href = URL.createObjectURL(blob);

	if(oldSrc) URL.revokeObjectURL(oldSrc);
}


/***/ }),

/***/ "./node_modules/style-loader/lib/urls.js":
/*!******************************************************************************************************!*\
  !*** c:/projects/easydata/samples/EasyDataBasicDemo.NetCore31/node_modules/style-loader/lib/urls.js ***!
  \******************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {


/**
 * When source maps are enabled, `style-loader` uses a link element with a data-uri to
 * embed the css on the page. This breaks all relative urls because now they are relative to a
 * bundle instead of the current page.
 *
 * One solution is to only use full urls, but that may be impossible.
 *
 * Instead, this function "fixes" the relative urls to be absolute according to the current page location.
 *
 * A rudimentary test suite is located at `test/fixUrls.js` and can be run via the `npm test` command.
 *
 */

module.exports = function (css) {
  // get current location
  var location = typeof window !== "undefined" && window.location;

  if (!location) {
    throw new Error("fixUrls requires window.location");
  }

	// blank or null?
	if (!css || typeof css !== "string") {
	  return css;
  }

  var baseUrl = location.protocol + "//" + location.host;
  var currentDir = baseUrl + location.pathname.replace(/\/[^\/]*$/, "/");

	// convert each url(...)
	/*
	This regular expression is just a way to recursively match brackets within
	a string.

	 /url\s*\(  = Match on the word "url" with any whitespace after it and then a parens
	   (  = Start a capturing group
	     (?:  = Start a non-capturing group
	         [^)(]  = Match anything that isn't a parentheses
	         |  = OR
	         \(  = Match a start parentheses
	             (?:  = Start another non-capturing groups
	                 [^)(]+  = Match anything that isn't a parentheses
	                 |  = OR
	                 \(  = Match a start parentheses
	                     [^)(]*  = Match anything that isn't a parentheses
	                 \)  = Match a end parentheses
	             )  = End Group
              *\) = Match anything and then a close parens
          )  = Close non-capturing group
          *  = Match anything
       )  = Close capturing group
	 \)  = Match a close parens

	 /gi  = Get all matches, not the first.  Be case insensitive.
	 */
	var fixedCss = css.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi, function(fullMatch, origUrl) {
		// strip quotes (if they exist)
		var unquotedOrigUrl = origUrl
			.trim()
			.replace(/^"(.*)"$/, function(o, $1){ return $1; })
			.replace(/^'(.*)'$/, function(o, $1){ return $1; });

		// already a full url? no change
		if (/^(#|data:|http:\/\/|https:\/\/|file:\/\/\/|\s*$)/i.test(unquotedOrigUrl)) {
		  return fullMatch;
		}

		// convert the url to a full url
		var newUrl;

		if (unquotedOrigUrl.indexOf("//") === 0) {
		  	//TODO: should we add protocol?
			newUrl = unquotedOrigUrl;
		} else if (unquotedOrigUrl.indexOf("/") === 0) {
			// path should be relative to the base url
			newUrl = baseUrl + unquotedOrigUrl; // already starts with '/'
		} else {
			// path should be relative to current directory
			newUrl = currentDir + unquotedOrigUrl.replace(/^\.\//, ""); // Strip leading './'
		}

		// send back the fixed url(...)
		return "url(" + JSON.stringify(newUrl) + ")";
	});

	// send back the fixed css
	return fixedCss;
};


/***/ }),

/***/ "./node_modules/webpack/buildin/global.js":
/*!*******************************************************************************************************!*\
  !*** c:/projects/easydata/samples/EasyDataBasicDemo.NetCore31/node_modules/webpack/buildin/global.js ***!
  \*******************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || new Function("return this")();
} catch (e) {
	// This works if the window reference is available
	if (typeof window === "object") g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),

/***/ "./ts/easydata.ts":
/*!************************!*\
  !*** ./ts/easydata.ts ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var crud_1 = __webpack_require__(/*! @easydata/crud */ "../../easydata.js/packs/crud/dist/lib/public_api.js");
window.addEventListener('load', function () {
    new crud_1.EasyDataViewDispatcher().run();
});


/***/ }),

/***/ "./ts/styles.js":
/*!**********************!*\
  !*** ./ts/styles.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

﻿__webpack_require__(/*! ../node_modules/@easydata/ui/dist/assets/css/easy-grid.css */ "../../easydata.js/packs/ui/dist/assets/css/easy-grid.css");
__webpack_require__(/*! ../node_modules/@easydata/ui/dist/assets/css/easy-dialog.css */ "../../easydata.js/packs/ui/dist/assets/css/easy-dialog.css");
__webpack_require__(/*! ../node_modules/@easydata/ui/dist/assets/css/easy-forms.css */ "../../easydata.js/packs/ui/dist/assets/css/easy-forms.css");
__webpack_require__(/*! ../node_modules/@easydata/crud/dist/assets/css/ed-view.css */ "../../easydata.js/packs/crud/dist/assets/css/ed-view.css");

/***/ }),

/***/ 0:
/*!*********************************************!*\
  !*** multi ./ts/styles.js ./ts/easydata.ts ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(/*! ./ts/styles.js */"./ts/styles.js");
module.exports = __webpack_require__(/*! ./ts/easydata.ts */"./ts/easydata.ts");


/***/ })

/******/ });
//# sourceMappingURL=easydata.js.map