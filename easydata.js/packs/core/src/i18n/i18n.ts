import { utils } from '../utils/utils';
/**
 * Contains internatialization functionality.
 */
export namespace i18n {
    export interface LocaleSettings {
        shortDateFormat?: string;
        longDateFormat?: string;
        shortTimeFormat?: string;
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
        englishName?: string;
        displayName?: string;
        texts?: TextResources;
        settings?: LocaleSettings;
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

    let defaultLocaleSettings: LocaleSettings = {
        shortDateFormat: 'MM/dd/yyyy',
        longDateFormat: 'dd MMM, yyyy',
        shortTimeFormat: 'HH:mm',
        longTimeFormat: 'HH:mm:ss',
        shortMonthNames: [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ],
        longMonthNames: [ 'January', 'February', 'March', 'April', 'May', 'June', 
                            'July', 'August', 'September', 'October', 'November', 'December' ],
        shortWeekDayNames: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        longWeekDayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        decimalSeparator:'.'
    }

    let locales: any = {
        'en': {
            englishName: 'English',
            displayName: 'English',
            texts: defaultTexts,
            settings: defaultLocaleSettings
        }
    }

    let currentLocale = 'en';

    
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

        for(let locale in locales) {
            result.push({
                locale: locale,
                englishName: locales[locale].englishName,
                displayName: locales[locale].displayName
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
     * Gets the current locale.
     * @returns The locale.
     */
    export function getCurrentLocale() : string {
        return currentLocale;
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
     * @param l The locale.
     */
    export function setCurrentLocale(l : string) : void {
        currentLocale = l;
    }

    function getTextResources(): TextResources {
        return (locales[currentLocale]) ? locales[currentLocale].texts || {} : {};
    }

    /**
     * Returns localized text by the key defined in parameter.
     * Here we get the text of the resource string assigned to CmdClickToAddCondition key:
     * 
     ```
       const text = i18n.getText('CmdClickToAddCondition')
     ```
     * @param args The keys of the resource string.
     * @returns Text of the resource defined by key.
     * 
     */
    export function getText(...args: string[]): string {
        let textsObj: any = getTextResources();

        let resText = '';
        if (args && args.length) {
            let notFount = false;
            const argLength = args.length;
            for (let i = 0; i < argLength; i++) {
                resText = textsObj[args[i]];
                if (!resText) {
                    notFount = true;
                    break;
                }
                else {
                    textsObj = resText;
                }
            }

            if (notFount) {
                let defTexts = locales['en'] ? locales['en'].texts || defaultTexts : defaultTexts;
                for (let i = 0; i < argLength; i++) {
                    resText = defTexts[args[i]];
                    if (!resText) {
                        break;
                    }
                    else {
                        textsObj = resText;
                    }
                }
            }
        }

        return resText;
    }

    export function getLocaleSettings(lang? : string): any {
        lang = lang || currentLocale;

        let settings: LocaleSettings = utils.assignDeep({}, defaultLocaleSettings);

        if (locales[lang] && locales[lang].settings) {
            settings = utils.assignDeep(settings, locales[currentLocale].settings);
        }

        return settings; 
    }

    export function getOneLocaleSetting(key: string): any {
        let settings: LocaleSettings;

        if (locales[currentLocale] && locales[currentLocale].settings) {
            settings = locales[currentLocale].settings;
        }
        else {
            settings = defaultLocaleSettings;
        }

        return settings[key] || defaultLocaleSettings[key]; 
    }

    export function getShortMonthName(monthNum: number) : string {
        const settings = getLocaleSettings();
        if (monthNum > 0 && monthNum < 13) {
            return settings.shortMonthNames.length >= monthNum 
                ? settings.shortMonthNames[monthNum - 1] 
                : monthNum.toString();
        }
        else {
            throw 'Wrong month number: ' + monthNum;
        }
    }

    export function getLongMonthName(monthNum: number) : string {
        const settings = getLocaleSettings();
        if (monthNum > 0 && monthNum < 13) {
            return settings.longMonthNames.length >= monthNum 
                ? settings.longMonthNames[monthNum - 1] 
                : monthNum.toString();
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
     * Updates the information for the specified locale.
     * @param locale The locale ID (like 'en', 'de', 'uk', etc). 
     * If the locale does exist yet - it will be added
     * @param localeInfo  a LocaleInfo object that contains the locale settings and textual resources
     */
    export function updateLocaleInfo(locale: string, localeData: LocaleInfo) {

        mapInfo(localeData);

        let data = locales[locale] || {};
        utils.assignDeep(data, localeData);
        locales[locale] = data;   
    }

    /**
     * Deprecated! Use updateLocaleInfo instead
     * Add the locale.
     * @param locale The locale ID (like 'en', 'de', 'uk', etc). 
     * If the locale does exist yet - it will be added
     * @param localeInfo - a LocaleInfo object that contains the locale settings and textual resources
     */
    export function addLocale(locale: string, localeInfo: LocaleInfo) {
        updateLocaleInfo(locale, localeInfo);
    }

    /**
     * Updates the texts for the specified locale
     * @param locale The locale ID (like 'en', 'de', 'uk', etc). 
     * If the locale does exist yet - it will be added
     * @param texts A plain JS object that contains textual resources
     */
    export function updateLocaleTexts(locale: string, texts: any) {

        mapInfo({texts: texts});

        let data = locales[locale];
        if (data) {
            utils.assignDeep(data.texts, texts);
            locales[locale] = data;
        }
    }
}
