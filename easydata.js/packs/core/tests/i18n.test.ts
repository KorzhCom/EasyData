import { expect } from "@olton/latte";

import { i18n } from '../src/i18n/i18n';
import { DataType } from '../src/types/data_type';

describe('i18n module', () => {
  beforeEach(() => {
    // Сбрасываем локали перед каждым тестом
    i18n.resetLocales();
  });

  it('должен иметь правильную текущую локаль по умолчанию', () => {
    expect(i18n.getCurrentLocale()).toBe('en-US');
  });

  it('должен возвращать список доступных локалей', () => {
    // По умолчанию должна быть только одна локаль
    const locales = i18n.getLocales();
    expect(locales.length).toBe(1);
    expect(locales[0].locale).toBe('en-US');
    expect(locales[0].englishName).toBe('English');
    expect(locales[0].displayName).toBe('English');

    // Добавим ещё одну локаль
    i18n.addLocale('uk-UA', {
      englishName: 'Ukrainian',
      displayName: 'Українська',
      texts: {
        ButtonOK: 'ОК',
        ButtonCancel: 'Скасувати'
      }
    });

    // Теперь должно быть две локали, отсортированные по englishName
    const updatedLocales = i18n.getLocales();
    expect(updatedLocales.length).toBe(2);
    expect(updatedLocales[0].locale).toBe('en-US');
    expect(updatedLocales[0].englishName).toBe('English');
    expect(updatedLocales[1].locale).toBe('uk-UA');
    expect(updatedLocales[1].englishName).toBe('Ukrainian');
  });

  it('должен получать тексты из текущей локали', () => {
    // Проверка стандартных текстов в en-US
    expect(i18n.getText('ButtonOK')).toBe('OK');
    expect(i18n.getText('ButtonCancel')).toBe('Cancel');
    expect(i18n.getText('Yes')).toBe('Yes');

    // Добавление новой локали
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

    // Переключение на новую локаль и проверка текстов
    i18n.setCurrentLocale('de-DE');
    expect(i18n.getCurrentLocale()).toBe('de-DE');
    expect(i18n.getText('ButtonOK')).toBe('OK');
    expect(i18n.getText('ButtonCancel')).toBe('Abbrechen');
    expect(i18n.getText('Yes')).toBe('Ja');
    expect(i18n.getText('No')).toBe('Nein');
  });

  it('должен работать с вложенными текстовыми ресурсами', () => {
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

  it('должен обновлять тексты для текущей локали', () => {
    // Обновление текстов текущей локали
    i18n.updateLocaleTexts({
      ButtonOK: 'Okay',
      ButtonCancel: 'Dismiss',
      NewText: 'Brand new text'
    });

    // Проверка обновленных текстов
    expect(i18n.getText('ButtonOK')).toBe('Okay');
    expect(i18n.getText('ButtonCancel')).toBe('Dismiss');
    expect(i18n.getText('NewText')).toBe('Brand new text');

    // Проверка что неизменные тексты остались прежними
    expect(i18n.getText('Yes')).toBe('Yes');
  });

  it('должен обновлять тексты по умолчанию для всех локалей', () => {
    // Добавим новую локаль
    i18n.addLocale('fr-FR', {
      englishName: 'French',
      displayName: 'Français',
      texts: {
        ButtonOK: 'OK',
        ButtonCancel: 'Annuler'
      }
    });

    // Обновляем тексты по умолчанию
    i18n.updateDefaultTexts({
      NewGlobalText: 'New text for all locales'
    });

    // Проверяем английскую локаль
    i18n.setCurrentLocale('en-US');
    expect(i18n.getText('NewGlobalText')).toBe('New text for all locales');

    // Проверяем французскую локаль
    i18n.setCurrentLocale('fr-FR');
    expect(i18n.getText('NewGlobalText')).toBe('New text for all locales');
    // Убеждаемся что специфичные для локали тексты остались
    expect(i18n.getText('ButtonCancel')).toBe('Annuler');
  });

  it('должен работать с настройками локали', () => {
    const settings = i18n.getLocaleSettings();
    
    // Проверка форматов даты и времени
    expect(settings.shortDateFormat).toBe('MM/dd/yyyy');
    expect(settings.longDateFormat).toBe('dd MMM, yyyy');
    expect(settings.shortTimeFormat).toBe('HH:mm');
    expect(settings.longTimeFormat).toBe('HH:mm:ss');
    
    // Проверка названий месяцев
    expect(settings.shortMonthNames.length).toBe(12);
    expect(settings.shortMonthNames[0]).toBe('Jan');
    expect(settings.longMonthNames[0]).toBe('January');
    
    // Проверка названий дней недели
    expect(settings.shortWeekDayNames.length).toBe(7);
    expect(settings.shortWeekDayNames[0]).toBe('Sun');
    expect(settings.longWeekDayNames[0]).toBe('Sunday');
    
    // Проверка разделителя десятичных и валюты
    expect(settings.decimalSeparator).toBe('.');
    expect(settings.currency).toBe('USD');
  });

  it('должен возвращать названия месяцев', () => {
    expect(i18n.getShortMonthName(1)).toBe('Jan');
    expect(i18n.getLongMonthName(1)).toBe('January');
    expect(i18n.getShortMonthName(12)).toBe('Dec');
    expect(i18n.getLongMonthName(12)).toBe('December');
    
    // Проверка исключений при неверном номере месяца
    expect(() => i18n.getShortMonthName(0)).toThrow();
    expect(() => i18n.getLongMonthName(13)).toThrow();
  });

  it('должен возвращать названия дней недели', () => {
    expect(i18n.getShortWeekDayName(1)).toBe('Sun');
    expect(i18n.getLongWeekDayName(1)).toBe('Sunday');
    expect(i18n.getShortWeekDayName(7)).toBe('Sat');
    expect(i18n.getLongWeekDayName(7)).toBe('Saturday');
    
    // Проверка исключений при неверном номере дня
    expect(() => i18n.getShortWeekDayName(0)).toThrow();
    expect(() => i18n.getLongWeekDayName(8)).toThrow();
  });

  it('должен обновлять настройки локали', () => {
    // Обновление настроек локали
    i18n.updateLocaleSettings({
      shortDateFormat: 'dd.MM.yyyy',
      longDateFormat: 'dd MMMM yyyy',
      decimalSeparator: ',',
      currency: 'EUR'
    });
    
    const settings = i18n.getLocaleSettings();
    
    // Проверка обновленных настроек
    expect(settings.shortDateFormat).toBe('dd.MM.yyyy');
    expect(settings.longDateFormat).toBe('dd MMMM yyyy');
    expect(settings.decimalSeparator).toBe(',');
    expect(settings.currency).toBe('EUR');
    
    // Проверка, что неизмененные настройки остались прежними
    expect(settings.shortTimeFormat).toBe('HH:mm');
  });

  it('должен форматировать дату и время по формату', () => {
    const date = new Date(2023, 4, 15, 14, 30, 45); // 15 мая 2023 14:30:45
    
    // Форматирование по шаблону
    expect(i18n.dateTimeToStr(date, 'yyyy-MM-dd')).toBe('2023-05-15');
    expect(i18n.dateTimeToStr(date, 'dd/MM/yyyy')).toBe('15/05/2023');
    expect(i18n.dateTimeToStr(date, 'MMM dd, yyyy')).toBe('May 15, 2023');
    expect(i18n.dateTimeToStr(date, 'MMMM dd, yyyy')).toBe('May 15, 2023');
    expect(i18n.dateTimeToStr(date, 'HH:mm:ss')).toBe('14:30:45');
    expect(i18n.dateTimeToStr(date, 'hh:mm tt')).toBe('02:30 PM');
    
    // Проверка форматирования с текстом в скобках
    expect(i18n.dateTimeToStr(date, 'yyyy-MM-dd [at] HH:mm')).toBe('2023-05-15 at 14:30');
  });

  it('должен форматировать дату и время с использованием расширенной функции', () => {
    const date = new Date(2023, 4, 15, 14, 30, 45); // 15 мая 2023 14:30:45
    
    // Форматирование с использованием настроек текущей локали
    i18n.updateLocaleSettings({
      shortDateFormat: 'dd.MM.yyyy',
      longDateFormat: 'dd MMMM, yyyy',
      shortTimeFormat: 'HH:mm',
      longTimeFormat: 'HH:mm:ss'
    });
    
    // Использование предопределенных форматов
    expect(i18n.dateTimeToStrEx(date, DataType.Date, 'd')).toBe('15.05.2023');
    expect(i18n.dateTimeToStrEx(date, DataType.Date, 'D')).toBe('15 May, 2023');
    expect(i18n.dateTimeToStrEx(date, DataType.DateTime, 'f')).toBe('15.05.2023 14:30');
    expect(i18n.dateTimeToStrEx(date, DataType.DateTime, 'F')).toBe('15 May, 2023 14:30:45');
    expect(i18n.dateTimeToStrEx(date, DataType.Time)).toBe('14:30');
    
    // Универсальный формат
    expect(i18n.dateTimeToStrEx(date, DataType.Date, 'u')).toBe('2023-05-15');
    expect(i18n.dateTimeToStrEx(date, DataType.DateTime, 'u')).toBe('2023-05-15 14:30');
  });

  it('должен форматировать числа', () => {
    // Форматирование без указания формата
    i18n.updateLocaleSettings({ decimalSeparator: ',' });
    expect(i18n.numberToStr(123.45)).toBe('123,45');
    
    // С указанием десятичного разделителя
    expect(i18n.numberToStr(123.45, null, '.')).toBe('123.45');
    
    // Форматирование по формату D (decimal)
    expect(i18n.numberToStr(123, 'D3')).toBe('123');
    
    // Форматирование по формату F (float)
    expect(i18n.numberToStr(123.456, 'F2')).toBe('123.46');
    
    // Форматирование по формату C (currency)
    i18n.updateLocaleSettings({ currency: 'USD' });
    const currencyResult = i18n.numberToStr(1234.56, 'C2');
    expect(currencyResult.indexOf('1,234.56')).toBeGreaterThan(-1);
    expect(currencyResult.indexOf('$')).toBeGreaterThan(-1);
    
    // Форматирование с маской
    expect(i18n.numberToStr(123456, '### ###')).toBe('123 456');
    expect(i18n.numberToStr(123, '#####')).toBe('00123');
    
    // Форматирование с последовательностью
    expect(i18n.numberToStr(1, 'SOne=1|Two=2|Three=3')).toBe('One');
    expect(i18n.numberToStr(2, 'SOne=1|Two=2|Three=3')).toBe('Two');
    expect(i18n.numberToStr(4, 'SOne=1|Two=2|Three=3')).toBe('4');
  });

  it('должен форматировать логические значения', () => {
    // По умолчанию (без формата)
    expect(i18n.booleanToStr(true)).toBe('true');
    expect(i18n.booleanToStr(false)).toBe('false');
    
    // С использованием формата S
    expect(i18n.booleanToStr(true, 'SFalse|True')).toBe('True');
    expect(i18n.booleanToStr(false, 'SFalse|True')).toBe('False');
    
    // С использованием формата S и локализованных значений
    i18n.updateLocaleTexts({
      Yes: 'Yes',
      No: 'No'
    });
    
    expect(i18n.booleanToStr(true, 'SNo|Yes')).toBe('Yes');
    expect(i18n.booleanToStr(false, 'SNo|Yes')).toBe('No');
  });

  it('должен добавлять и вызывать маппер', () => {
    let mapperCalled = false;
    let mapperLocaleId: string;
    let mapperTexts: any;
    
    // Добавление маппера
    i18n.addMapper((info) => {
      mapperCalled = true;
      mapperLocaleId = info.localeId;
      mapperTexts = info.texts;
    });
    
    // Вызов функции, которая должна вызвать маппер
    i18n.updateLocaleTexts({
      NewText: 'Test text'
    });
    
    // Проверка что маппер был вызван с правильными параметрами
    expect(mapperCalled).toBe(true);
    expect(mapperLocaleId).toBe('en-US');
    expect(mapperTexts).toBeObject({ NewText: 'Test text' });
  });
});
