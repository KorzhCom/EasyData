import { utils } from '../utils/utils';

/**
 * Contains internatialization functionality.
 */
export namespace i18n {
    export interface LocaleSettings {
        shortDateFormat?: string;
        editDateFormat?: string;
        longDateFormat?: string;
        shortTimeFormat?: string;
        editTimeFormat?: string;
        longTimeFormat?: string;
        shortMonthNames?: string[];
        longMonthNames?: string[];
        shortWeekDayNames?: string[];
        longWeekDayNames?: string[];
        decimalSeparator?: string;
    }
    
    export interface TextResources {
        ButtonOK?: string;
        ButtonCancel?: string;
        [propName: string]: string | TextResources;
    }
    
    
    export interface LocaleInfo {
        localeId?: string;
        englishName?: string;
        displayName?: string;
        texts?: TextResources;
        settings?: LocaleSettings; //if the settings is not specified - we will use the default one.
    }
    
    export interface LocaleInfoItem {
        locale: string;
        englishName?: string;
        displayName?: string;
    }    

    const defaultTexts: TextResources = {
        ButtonOK: 'OK',
        ButtonCancel: 'Cancel'
    };

    let englishUSLocaleSettings: LocaleSettings = {
        shortDateFormat: 'MM/dd/yyyy',
        longDateFormat: 'dd MMM, yyyy',
        editDateFormat: 'MM/dd/yyyy',
        shortTimeFormat: 'HH:mm',
        editTimeFormat: 'HH:mm',
        longTimeFormat: 'HH:mm:ss',
        shortMonthNames: [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ],
        longMonthNames: [ 'January', 'February', 'March', 'April', 'May', 'June', 
                            'July', 'August', 'September', 'October', 'November', 'December' ],
        shortWeekDayNames: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        longWeekDayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        decimalSeparator:'.'
    }

    interface LocalesDict {
        [localeId: string]: LocaleInfo
    }

    let allLocales: LocalesDict = {
        'en-US': {
            localeId : 'en-US',
            englishName: 'English',
            displayName: 'English',
            texts: defaultTexts,
            settings: englishUSLocaleSettings
        }
    }

    //let currentLocale = undefined; //default

    let defaultLocale: LocaleInfo = {
        localeId: 'en-US',
        englishName: 'English',
        displayName: 'English',
        texts: defaultTexts,
        settings: englishUSLocaleSettings
    };

    let currentLocale = defaultLocale;
    
    type LocaleMapper = (info: LocaleInfo) => void;

    const mappers: LocaleMapper[] = [];

    function mapInfo(info: LocaleInfo) {
        for(const mapper of mappers) {
            mapper(info);
        }
    }

    export function addMapper(mapper: LocaleMapper) {
        mappers.push(mapper);
    }

    /**
     * Gets added locales with their names.
     * @returns  The locales.
     */
    export function getLocales(): LocaleInfoItem[] {
        let result: LocaleInfoItem[] = [];

        for(let locale in allLocales) {
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

            return - 1;
        });
    }

    /**
     * Gets the current locale ID.
     * @returns The locale.
     */
    export function getCurrentLocale() : string {
        return currentLocale.localeId;
    }

    
     /**
     * Sets the curent locale. 
     * @deprecated Use setCurrentLocale instead
     * @param l The locale.
     */
    export function setLocale(l : string) : void {
        console.warn("This method is deprecated. Use setCurrentLocale instead");
        setCurrentLocale(l);
    }

    /**
     * Sets the curent locale.
     * @param localeId The locale.
     */
    export function setCurrentLocale(localeId : string) : void {
        const newLocale = allLocales[localeId]; 
        if (!newLocale) {
            throw `Locale ${localeId} is not installed`;
        }
        currentLocale = newLocale;
    }

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
    export function getText(...args: string[]): string {
        let textsObj: any = currentLocale.texts;

        let resText : string | TextResources = '';
        if (args && args.length) {
            let notFound = false;
            const argLength = args.length;
            for (let i = 0; i < argLength; i++) {
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
                for (let i = 0; i < argLength; i++) {
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

        return resText as string;
    }

    export function getLocaleSettings(): LocaleSettings {
        return currentLocale.settings;
    }

    export function getOneLocaleSetting(key: string): any {
        return currentLocale.settings[key]; 
    }

    export function getShortMonthName(monthNum: number) : string {
        const settings = getLocaleSettings();
        if (monthNum > 0 && monthNum < 13) {
            return settings.shortMonthNames[monthNum - 1];
        }
        else {
            throw 'Wrong month number: ' + monthNum;
        }
    }

    export function getLongMonthName(monthNum: number) : string {
        const settings = getLocaleSettings();
        if (monthNum > 0 && monthNum < 13) {
            return settings.longMonthNames[monthNum - 1];
        }
        else {
            throw 'Wrong month number: ' + monthNum;
        }
    }

    export function getShortWeekDayName(dayNum: number) : string {
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

    export function getLongWeekDayName(dayNum: number) : string {
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

    /**
     * Updates the locale settings (date/time formats, separators, etc) for the specified locale.
     * @param settingsToUpdate a LocaleSettings object
     * @param locale The locale ID (like 'en', 'de', 'uk', etc). 
     * If not specified - the function will update the settings for the current locale
     */
    export function updateLocaleSettings(settingsToUpdate: LocaleSettings) : void {
        utils.assignDeep(currentLocale.settings, settingsToUpdate);
    }

    /**
     * Updates the texts for the current locale
     * @param texts A plain JS object that contains textual resources
     */
    export function updateLocaleTexts(texts: any) {
        if (typeof texts !== 'object') {
            console.error('Wrong parameter type in updateLocaleTexts function call.' +
                    'The first parameter (localeId) is not necessary. Use updateLocaleTexts(texts) instead');
            return;
        }
        mapInfo({localeId: currentLocale.localeId, texts: texts});

        utils.assignDeep(currentLocale.texts, texts);
    }

    /**
     * Updates the information for the specified locale.
     * @param localeId The locale ID (like 'en', 'de', 'uk', etc). 
     * If the locale does exist yet - it will be added
     * @param localeInfo  a LocaleInfo object that contains the locale settings and textual resources
     */
    export function updateLocaleInfo(localeId: string, localeData: LocaleInfo) : void {
        mapInfo(localeData);

        if (!localeData.localeId) {
            localeData.localeId = localeId;
        }

        let localeInfoToUpdate = allLocales[localeId] || defaultLocale;
        utils.assignDeep(localeInfoToUpdate, localeData);
        allLocales[localeId] = localeInfoToUpdate;   
    }

    /**
     * Adds the locale.
     * @param localeId The locale ID (like 'en', 'de', 'uk', etc). 
     * If the locale does exist yet - it will be created
     * @param localeInfo - a LocaleInfo object that contains the locale settings and textual resources
     */
    export function addLocale(localeId: string, localeInfo: LocaleInfo) {       
        updateLocaleInfo(localeId, localeInfo);
    }

    /**
     * Overwrites some locale settings (date/time formats) with the formats used in browser's current language
     */
    export function loadSystemLocaleSettings() {
        const lang = typeof navigator === 'object' ? navigator.language : undefined;

        const now = new Date('2020-11-21');
        
        const options = { year: 'numeric', month: 'numeric', day: 'numeric' }
        const nowStr = now.toLocaleDateString(lang, options);

        let format = nowStr
                        .replace('21', 'dd')
                        .replace('11', 'MM')
                        .replace('2020', 'yyyy');

        currentLocale.settings.shortDateFormat = format;
        currentLocale.settings.editDateFormat = format;
    }
}
