import { expect } from "@olton/latte";

import { i18n } from '../src/i18n/i18n';
import { DataType } from '../src/types/data_type';

describe('i18n module', () => {
  beforeEach(() => {
    // Reset locales before each test
    i18n.resetLocales();
  });

  it('should have correct current locale by default', () => {
    expect(i18n.getCurrentLocale()).toBe('en-US');
  });

  it('should return list of available locales', () => {
    // By default should have only one locale
    const locales = i18n.getLocales();
    expect(locales.length).toBe(1);
    expect(locales[0].locale).toBe('en-US');
    expect(locales[0].englishName).toBe('English');
    expect(locales[0].displayName).toBe('English');

    // Add another locale
    i18n.addLocale('uk-UA', {
      englishName: 'Ukrainian',
      displayName: 'Українська',
      texts: {
        ButtonOK: 'ОК',
        ButtonCancel: 'Скасувати'
      }
    });

    // Now should have two locales, sorted by englishName
    const updatedLocales = i18n.getLocales();
    expect(updatedLocales.length).toBe(2);
    expect(updatedLocales[0].locale).toBe('en-US');
    expect(updatedLocales[0].englishName).toBe('English');
    expect(updatedLocales[1].locale).toBe('uk-UA');
    expect(updatedLocales[1].englishName).toBe('Ukrainian');
  });

  it('should get texts from current locale', () => {
    // Check standard texts in en-US
    expect(i18n.getText('ButtonOK')).toBe('OK');
    expect(i18n.getText('ButtonCancel')).toBe('Cancel');
    expect(i18n.getText('Yes')).toBe('Yes');

    // Adding new locale
    i18n.addLocale('de-DE', {
      englishName: 'German',
      displayName: 'Deutsch',
      texts: {
        ButtonOK: 'OK',
        ButtonCancel: 'Abbrechen',
        Yes: 'Ja',
        No: 'Nein'
      }
    });

    // Switching to new locale and checking texts
    i18n.setCurrentLocale('de-DE');
    expect(i18n.getCurrentLocale()).toBe('de-DE');
    expect(i18n.getText('ButtonOK')).toBe('OK');
    expect(i18n.getText('ButtonCancel')).toBe('Abbrechen');
    expect(i18n.getText('Yes')).toBe('Ja');
    expect(i18n.getText('No')).toBe('Nein');
  });

  it('should work with nested text resources', () => {
    i18n.updateLocaleTexts({
      Menu: {
        File: 'File',
        Open: 'Open',
        Save: 'Save',
        Settings: {
          General: 'General',
          Advanced: 'Advanced'
        }
      }
    });

    expect(i18n.getText('Menu', 'File')).toBe('File');
    expect(i18n.getText('Menu', 'Open')).toBe('Open');
    expect(i18n.getText('Menu', 'Settings', 'General')).toBe('General');
    expect(i18n.getText('Menu', 'Settings', 'Advanced')).toBe('Advanced');
  });

  it('should update texts for current locale', () => {
    // Update current locale texts
    i18n.updateLocaleTexts({
      ButtonOK: 'Okay',
      ButtonCancel: 'Dismiss',
      NewText: 'Brand new text'
    });

    // Check updated texts
    expect(i18n.getText('ButtonOK')).toBe('Okay');
    expect(i18n.getText('ButtonCancel')).toBe('Dismiss');
    expect(i18n.getText('NewText')).toBe('Brand new text');

    // Check that unchanged texts remained the same
    expect(i18n.getText('Yes')).toBe('Yes');
  });

  it('should update default texts for all locales', () => {
    // Add new locale
    i18n.addLocale('fr-FR', {
      englishName: 'French',
      displayName: 'Français',
      texts: {
        ButtonOK: 'OK',
        ButtonCancel: 'Annuler'
      }
    });

    // Update default texts
    i18n.updateDefaultTexts({
      NewGlobalText: 'New text for all locales'
    });

    // Check English locale
    i18n.setCurrentLocale('en-US');
    expect(i18n.getText('NewGlobalText')).toBe('New text for all locales');

    // Check French locale
    i18n.setCurrentLocale('fr-FR');
    expect(i18n.getText('NewGlobalText')).toBe('New text for all locales');
    // Make sure locale-specific texts remained
    expect(i18n.getText('ButtonCancel')).toBe('Annuler');
  });

  it('should work with locale settings', () => {
    const settings = i18n.getLocaleSettings();
    
    // Check date and time formats
    expect(settings.shortDateFormat).toBe('MM/dd/yyyy');
    expect(settings.longDateFormat).toBe('dd MMM, yyyy');
    expect(settings.shortTimeFormat).toBe('HH:mm');
    expect(settings.longTimeFormat).toBe('HH:mm:ss');
    
    // Check month names
    expect(settings.shortMonthNames.length).toBe(12);
    expect(settings.shortMonthNames[0]).toBe('Jan');
    expect(settings.longMonthNames[0]).toBe('January');
    
    // Check weekday names
    expect(settings.shortWeekDayNames.length).toBe(7);
    expect(settings.shortWeekDayNames[0]).toBe('Sun');
    expect(settings.longWeekDayNames[0]).toBe('Sunday');
    
    // Check decimal separator and currency
    expect(settings.decimalSeparator).toBe('.');
    expect(settings.currency).toBe('USD');
  });

  it('should return month names', () => {
    expect(i18n.getShortMonthName(1)).toBe('Jan');
    expect(i18n.getLongMonthName(1)).toBe('January');
    expect(i18n.getShortMonthName(12)).toBe('Dec');
    expect(i18n.getLongMonthName(12)).toBe('December');
    
    // Check exceptions for invalid month number
    expect(() => i18n.getShortMonthName(0)).toThrow();
    expect(() => i18n.getLongMonthName(13)).toThrow();
  });

  it('should return weekday names', () => {
    expect(i18n.getShortWeekDayName(1)).toBe('Sun');
    expect(i18n.getLongWeekDayName(1)).toBe('Sunday');
    expect(i18n.getShortWeekDayName(7)).toBe('Sat');
    expect(i18n.getLongWeekDayName(7)).toBe('Saturday');
    
    // Check exceptions for invalid day number
    expect(() => i18n.getShortWeekDayName(0)).toThrow();
    expect(() => i18n.getLongWeekDayName(8)).toThrow();
  });

  it('should update locale settings', () => {
    // Update locale settings
    i18n.updateLocaleSettings({
      shortDateFormat: 'dd.MM.yyyy',
      longDateFormat: 'dd MMMM yyyy',
      decimalSeparator: ',',
      currency: 'EUR'
    });
    
    const settings = i18n.getLocaleSettings();
    
    // Check updated settings
    expect(settings.shortDateFormat).toBe('dd.MM.yyyy');
    expect(settings.longDateFormat).toBe('dd MMMM yyyy');
    expect(settings.decimalSeparator).toBe(',');
    expect(settings.currency).toBe('EUR');
    
    // Check that unchanged settings remained the same
    expect(settings.shortTimeFormat).toBe('HH:mm');
  });

  it('should format date and time by format', () => {
    const date = new Date(2023, 4, 15, 14, 30, 45); // May 15, 2023 14:30:45
    
    // Formatting by template
    expect(i18n.dateTimeToStr(date, 'yyyy-MM-dd')).toBe('2023-05-15');
    expect(i18n.dateTimeToStr(date, 'dd/MM/yyyy')).toBe('15/05/2023');
    expect(i18n.dateTimeToStr(date, 'MMM dd, yyyy')).toBe('May 15, 2023');
    expect(i18n.dateTimeToStr(date, 'MMMM dd, yyyy')).toBe('May 15, 2023');
    expect(i18n.dateTimeToStr(date, 'HH:mm:ss')).toBe('14:30:45');
    expect(i18n.dateTimeToStr(date, 'hh:mm tt')).toBe('02:30 PM');
    
    // Check formatting with text in brackets
    expect(i18n.dateTimeToStr(date, 'yyyy-MM-dd [at] HH:mm')).toBe('2023-05-15 at 14:30');
  });

  it('should format date and time using extended function', () => {
    const date = new Date(2023, 4, 15, 14, 30, 45); // May 15, 2023 14:30:45
    
    // Formatting using current locale settings
    i18n.updateLocaleSettings({
      shortDateFormat: 'dd.MM.yyyy',
      longDateFormat: 'dd MMMM, yyyy',
      shortTimeFormat: 'HH:mm',
      longTimeFormat: 'HH:mm:ss'
    });
    
    // Using predefined formats
    expect(i18n.dateTimeToStrEx(date, DataType.Date, 'd')).toBe('15.05.2023');
    expect(i18n.dateTimeToStrEx(date, DataType.Date, 'D')).toBe('15 May, 2023');
    expect(i18n.dateTimeToStrEx(date, DataType.DateTime, 'f')).toBe('15.05.2023 14:30');
    expect(i18n.dateTimeToStrEx(date, DataType.DateTime, 'F')).toBe('15 May, 2023 14:30:45');
    expect(i18n.dateTimeToStrEx(date, DataType.Time)).toBe('14:30');
    
    // Universal format
    expect(i18n.dateTimeToStrEx(date, DataType.Date, 'u')).toBe('2023-05-15');
    expect(i18n.dateTimeToStrEx(date, DataType.DateTime, 'u')).toBe('2023-05-15 14:30');
  });

  it('should format numbers', () => {
    // Formatting without specifying format
    i18n.updateLocaleSettings({ decimalSeparator: ',' });
    expect(i18n.numberToStr(123.45)).toBe('123,45');
    
    // With decimal separator specified
    expect(i18n.numberToStr(123.45, null, '.')).toBe('123.45');
    
    // Formatting by D format (decimal)
    expect(i18n.numberToStr(123, 'D3')).toBe('123');
    
    // Formatting by F format (float)
    expect(i18n.numberToStr(123.456, 'F2')).toBe('123.46');
    
    // Formatting by C format (currency)
    i18n.updateLocaleSettings({ currency: 'USD' });
    const currencyResult = i18n.numberToStr(1234.56, 'C2');
    expect(currencyResult.indexOf('1,234.56')).toBeGreaterThan(-1);
    expect(currencyResult.indexOf('$')).toBeGreaterThan(-1);
    
    // Formatting with mask
    expect(i18n.numberToStr(123456, '### ###')).toBe('123 456');
    expect(i18n.numberToStr(123, '#####')).toBe('00123');
    
    // Formatting with sequence
    expect(i18n.numberToStr(1, 'SOne=1|Two=2|Three=3')).toBe('One');
    expect(i18n.numberToStr(2, 'SOne=1|Two=2|Three=3')).toBe('Two');
    expect(i18n.numberToStr(4, 'SOne=1|Two=2|Three=3')).toBe('4');
  });

  it('should format boolean values', () => {
    // By default (without format)
    expect(i18n.booleanToStr(true)).toBe('true');
    expect(i18n.booleanToStr(false)).toBe('false');
    
    // Using S format
    expect(i18n.booleanToStr(true, 'SFalse|True')).toBe('True');
    expect(i18n.booleanToStr(false, 'SFalse|True')).toBe('False');
    
    // Using S format with localized values
    i18n.updateLocaleTexts({
      Yes: 'Yes',
      No: 'No'
    });
    
    expect(i18n.booleanToStr(true, 'SNo|Yes')).toBe('Yes');
    expect(i18n.booleanToStr(false, 'SNo|Yes')).toBe('No');
  });

  it('should add and call mapper', () => {
    let mapperCalled = false;
    let mapperLocaleId: string;
    let mapperTexts: any;
    
    // Adding mapper
    i18n.addMapper((info) => {
      mapperCalled = true;
      mapperLocaleId = info.localeId;
      mapperTexts = info.texts;
    });
    
    // Call function that should invoke mapper
    i18n.updateLocaleTexts({
      NewText: 'Test text'
    });
    
    // Check that mapper was called with correct parameters
    expect(mapperCalled).toBe(true);
    expect(mapperLocaleId).toBe('en-US');
    expect(mapperTexts).toBeObject({ NewText: 'Test text' });
  });
});
