import * as strf from './string_utils';
import { DataType } from '../types/data_type';
import { i18n } from '../i18n/i18n';


export namespace utils {
    export function getAllDataTypes(): DataType[] {
        return Object.values(DataType).filter(item => typeof item === "number") as DataType[];
    }

    export function getDateDataTypes(): DataType[] {
        return [DataType.Time, DataType.Date, DataType.DateTime]
    }
    
    export function getStringDataTypes(): DataType[] {
        return [DataType.String, DataType.Memo, DataType.FixedChar]
    }

    const _numericTypes = [DataType.Byte, DataType.Word, DataType.Int32, 
        DataType.Int64, DataType.Float, DataType.Currency, DataType.Autoinc];

    export function getNumericDataTypes(): DataType[] {
        return _numericTypes;
    }
            
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
    export function assign(target: any, ...args: any[]): any {
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

    /**
     * Copy the content of all objests passed in `args` parameters into `target`
     * and returns the result
     * NB: This function make a deep copy - 
     * so `assignDeep` will be called recursively for all object properties
     * on the first level. 
     * @param target - the target object 
     * @param sources  - an array of the source objects
     */
    export function assignDeep(target: any, ...sources:any[]): any {
        return assignDeepCore(new WeakMap(), target, sources);
    }

    function assignDeepCore(hashSet: WeakMap<any, any>, target: any, sources:any[]): any {
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
                            } else {
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

    export function getIfDefined<T>(value : T, defaultValue: T) : T {
        return (typeof value !== 'undefined') ? value : defaultValue;
    }

    export function IsDefinedAndNotNull(value): boolean {
        return typeof value !== 'undefined' && value !== null;
    }

    //------------- array functions ----------------

    /**
     * Represents any object which hs `id` property
     */
    export interface ItemWithId {
        id: any;
    }

    export function copyArrayTo(collection1: any, collection2: any): void {
        const len1 = collection1.length;
        const len2 = collection2.length;
        for (let i = 0; i < len1 && i < len2; i++) {
            collection2[i] = collection1[i];
        }
    }

    export function createArrayFrom(collection : any) : any {
        let result = [];
        for (let item of collection) {
            result.push(item);
        }
        return result;
    }


    /**
     * Searches an array of the objects which implement ItemWithId by ID
     * Returs the found object or null.
     * @param array 
     * @param id 
     */
    export function findItemById<T extends ItemWithId>(array: Array<T>, id): T {
        var arrLength = array.length;
        for (var idx = 0; idx < arrLength; idx++) {
            if (array[idx].id === id)
                return array[idx];
        }

        return null;
    }

    export function findItemIndexById<T extends ItemWithId>(array: Array<T>, id): number {
        var arrLength = array.length;
        for (var idx = 0; idx < arrLength; idx++) {
            if (array[idx].id === id)
                return idx;
        }

        return -1;
    }

    /**
     * Searches an array of the objects which implement ItemWithId by ID
     * Returs the index of the found element, or -1 if nothing was found.
     * @param array 
     * @param id 
     */
    export function indexOfArrayItem<T>(arr: Array<T>, item: T): number {
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

    /**
     * Moves an item in some array to a new position
     * @param array 
     * @param index1 
     * @param index2 
     */
    export function moveArrayItem<T>(array: Array<T>, index1: number, index2: number) {
        if (index1 >= array.length) {
            throw 'Index out of bounds: ' + index1;
        }

        if (index2 >= array.length) {
            index2 = array.length - 1;
        }

        let item = array.splice(index1, 1)[0];
        array.splice(index2, 0, item);
    }

    /**
     * Searches for a particular item in the array are removes that item if found. 
     * @param arr
     * @param value 
     */
    export function removeArrayItem<T>(arr: Array<T>, value: T): T {
        let index = arr.indexOf(value);
        if (index != -1) {
            return arr.splice(index, 1)[0];
        }
    }

    export function insertArrayItem<T>(arr: Array<T>, index: number, value: T) {
        arr.splice(index, 0, value); 
    }

    export function fillArray<T>(arr: Array<T>, value: T, start: number = 0, end?: number) {
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

    //------------ DOM utils ------------

    /**
     * Calculates the shift on which we need to move our element horizontally 
     * to find current window
     * @param absLeft 
     * @param width 
     */
    export function shiftToFitWindow(absLeft: number, width: number): number {      
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

    /**
     * Returns `true` if the value passed in the parameter is an object
     * @param val
     */
    export function isObject(val): boolean {
        if (val === null) { return false;}
        return ( (typeof val === 'function') || (typeof val === 'object') );
    }

    /**
     * Returns `true` if the `DataType` value passed in the parameter 
     * represents some numeric type 
     * @param dtype 
     */
    export function isNumericType(dtype: DataType): boolean {
        const index = _numericTypes.indexOf(dtype);
        return (index >= 0);
    }

    /**
     * Returns `true` if the `DataType` value passed in the parameter 
     * represents some numeric type 
     * @param dtype 
     */
    export function isIntType(dtype: DataType): boolean {
        const index = _intTypes.indexOf(dtype);

        return (index >= 0);
    }

    /**
     * Returns `true` if the value passed in the parameter is an a numeric value
     * @param val
     */
    export function isNumeric(val): boolean {
        return !isNaN(parseFloat(val)) && isFinite(val);

    }

    /**
     * Returns `true` if two data types  passed in parameters 
     * are compatible - so it's safe to copy the values between 
     * two expressions with these two types 
     * @param type1 
     * @param type2 
     */
    export function areCompatibleDataTypes(type1: DataType, type2: DataType): boolean {
        return typeof type1 == "undefined" || typeof type2 == "undefined" || type1 == DataType.Unknown || type2 == DataType.Unknown 
        ||  (type1 == type2) || (type1 == DataType.Date && type2 == DataType.DateTime) 
        || (type1 == DataType.DateTime && type2 == DataType.Date);
    }


    /**
     * Returns `true` if the property with named `propName` 
     * in the object `obj` has some value 
     * @param obj
     * @param propName 
     */
    export function isPropSet(obj, propName) {
        return obj[propName] || obj[propName.toLowerCase()] || obj[propName.toUpperCase()];
    }



    //-------------- ID generator -----------
    
    const prefixIdLen = 4;
    const symbols = "0123456789abcdefghijklmnopqrstuvwxyz";
    const magicTicks = 636712160627685350;

    /**
     * Generates an unique ID 
     */
    export function generateId(prefix : string) : string {
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

    function intToNumBase(value: number, targetBase = 36) {
        var buffer = '';
        var rest = value;
        do {
            buffer = symbols[rest % targetBase] + buffer;
            rest = Math.floor(rest /= targetBase);
        }
        while (rest > 0);

        return buffer;
    }

    function squeezeMoniker(str: string, maxlen: number): string {
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

    function squeeze(str: string, maxlen: number) {
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

    function replaceAtString(str: string, index: number, replacement: string): string {
        return str.substring(0, index) + replacement + str.substring(index + replacement.length);
    }

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    function getNowTicks(): number {
        return (621355968e9 + (new Date()).getTime() * 1e4)
    }
  
    function safeParseInt(str: string) {
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
    export function strToDateTime(value: string, format: string): Date {
        if (!value || value.length == 0)
            return new Date();

        const normalizedValue = value.replace(/[^a-zA-Z0-9_]/g, '-');
        const normalizedFormat = format.replace(/[^a-zA-Z0-9_]/g, '-');
        const formatItems = normalizedFormat.split('-');
        const dateItems = normalizedValue.split('-');
    
        const monthIndex  = formatItems.indexOf("MM");
        const dayIndex = formatItems.indexOf("dd");
        const yearIndex = formatItems.indexOf("yyyy");
        const hourIndex = formatItems.indexOf("HH");
        const minutesIndex  = formatItems.indexOf("mm");
        const secondsIndex  = formatItems.indexOf("ss");
    
        const today = new Date();
    
        try {
            const year  = yearIndex > -1 && yearIndex < dateItems.length   
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

            const minute  = minutesIndex > -1 && minutesIndex < dateItems.length 
                ? safeParseInt(dateItems[minutesIndex]) 
                : 0;
            if (minute > 59)
                throw '';

            const second  = secondsIndex > -1 && secondsIndex < dateItems.length 
                ? safeParseInt(dateItems[secondsIndex]) 
                : 0;
            if (second > 59)
                throw '';

            return new Date(year,month,day,hour,minute,second);
        }
        catch {
            throw `${value} is not a valid date.`
        }
    }

    export function strToTime(str: string): Date {
        const timeItems = str.split(':');

        try{
            const hour = timeItems.length > 0 ? safeParseInt(timeItems[0]) : 0;
            if (hour > 23)
                throw '';
    
            const minute = timeItems.length > 1 ? safeParseInt(timeItems[1]) : 0;
            if (minute > 59)
                throw '';
    
            const second = timeItems.length > 1 ? safeParseInt(timeItems[1]) : 0
            if (second > 59)
                throw '';
    
            return new Date(0, 0, 0, hour, minute, second);    
        }
        catch {
            throw `${str} is not a valid time.`
        }
    }

    const DT_FORMAT_RGEX = /\[([^\]]+)]|y{2,4}|M{1,4}|d{1,2}|H{1,2}|h{1,2}|m{2}|s{2}|t{2}/g;

    /**
     * Returns string representation of the date/time value according to the custom format (second parameter) 
     * The format is compatible with the one used in .NET: https://docs.microsoft.com/en-us/dotnet/standard/base-types/custom-date-and-time-format-strings
     * @param date 
     * @param format 
     */
    export function dateTimeToStr(date: Date, format: string): string {
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
        }

        return format.replace(DT_FORMAT_RGEX, (match, $1) => {
            return $1 || matches[match];
        });
    }

    /**
    * Converts a numeric value to the string taking into the account the decimal separator
    * @param value - the number to convert 
    * @param decimalSeparator - the symbol that represents decimal separator. If not specified the function gets the one from the current locale settings.
    */
    export function numberToStr(number: Number, decimalSeparator?: string) {
        decimalSeparator = decimalSeparator || i18n.getLocaleSettings().decimalSeparator;
        return number.toString().replace('.', decimalSeparator);
    }


}