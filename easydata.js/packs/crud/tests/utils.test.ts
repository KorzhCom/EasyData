import { DataType, i18n } from '@easydata/core';
import { getInternalDateTimeFormat, getEditDateTimeFormat, setLocation } from '../src/utils/utils';

describe('Utils', () => {
    // Сохраняем оригинальные объекты перед тестами
    const originalWindow = { ...window };
    const originalHistory = { ...window.history };
    const originalDispatchEvent = window.dispatchEvent;
    
    // Оригинальные настройки i18n
    let originalSettings: any;
    
    beforeEach(() => {
        // Сохраняем оригинальные настройки i18n
        originalSettings = i18n.getLocaleSettings();
        
        // Создаем мок для i18n.getLocaleSettings
        jest.spyOn(i18n, 'getLocaleSettings').mockReturnValue({
            ...originalSettings,
            editDateFormat: 'dd.MM.yyyy',
            editTimeFormat: 'HH:mm',
        });
        
        // Создаем моки для window.history
        window.history.pushState = mock();
        window.dispatchEvent = mock();
    });
    
    afterEach(() => {
        // Восстанавливаем оригинальные объекты и функции
        jest.restoreAllMocks();
        window.history = originalHistory;
        window.dispatchEvent = originalDispatchEvent;
    });
    
    it('должен возвращать правильный внутренний формат для Date', () => {
        const format = getInternalDateTimeFormat(DataType.Date);
        expect(format).toBe('yyyy-MM-dd');
    });
    
    it('должен возвращать правильный внутренний формат для Time', () => {
        const format = getInternalDateTimeFormat(DataType.Time);
        expect(format).toBe('HH:mm');
    });
    
    it('должен возвращать правильный внутренний формат для DateTime', () => {
        const format = getInternalDateTimeFormat(DataType.DateTime);
        expect(format).toBe('yyyy-MM-ddTHH:mm');
    });
    
    it('должен возвращать формат редактирования из настроек локали для Date', () => {
        const format = getEditDateTimeFormat(DataType.Date);
        expect(format).toBe('dd.MM.yyyy');
    });
    
    it('должен возвращать формат редактирования из настроек локали для Time', () => {
        const format = getEditDateTimeFormat(DataType.Time);
        expect(format).toBe('HH:mm');
    });
    
    it('должен возвращать формат редактирования из настроек локали для DateTime', () => {
        const format = getEditDateTimeFormat(DataType.DateTime);
        expect(format).toBe('dd.MM.yyyy HH:mm');
    });
    
    it('должен изменять локацию через pushState и генерировать событие', () => {
        // Устанавливаем исходное значение state
        const mockState = { test: 'state' };
        window.history.state = mockState;
        document.title = 'Test Title';
        
        // Вызываем функцию
        setLocation('/new-path');
        
        // Проверяем, что pushState был вызван с правильными аргументами
        expect(window.history.pushState).toHaveBeenCalledWith(
            mockState,
            'Test Title',
            '/new-path'
        );
        
        // Проверяем, что было сгенерировано правильное событие
        expect(window.dispatchEvent).toHaveBeenCalled();
        const eventArg = (window.dispatchEvent as jest.Mock).mock.calls[0][0];
        expect(eventArg).toBeInstanceOf(Event);
        expect(eventArg.type).toBe('ed_set_location');
    });
    
    it('должен работать с различными форматами путей', () => {
        // Относительный путь
        setLocation('relative/path');
        expect(window.history.pushState).toHaveBeenCalledWith(
            expect.anything(),
            expect.anything(),
            'relative/path'
        );
        
        // Путь с параметрами
        setLocation('/path?param=value');
        expect(window.history.pushState).toHaveBeenCalledWith(
            expect.anything(),
            expect.anything(),
            '/path?param=value'
        );
        
        // Путь с хэшем
        setLocation('/path#section');
        expect(window.history.pushState).toHaveBeenCalledWith(
            expect.anything(),
            expect.anything(),
            '/path#section'
        );
    });
    
    it('должен использовать форматы из i18n для редактирования', () => {
        // Перенастраиваем мок для i18n.getLocaleSettings с другими форматами
        (i18n.getLocaleSettings as jest.Mock).mockReturnValue({
            editDateFormat: 'MM/dd/yyyy',
            editTimeFormat: 'hh:mm a',
        });
        
        // Проверяем обновленные форматы
        expect(getEditDateTimeFormat(DataType.Date)).toBe('MM/dd/yyyy');
        expect(getEditDateTimeFormat(DataType.Time)).toBe('hh:mm a');
        expect(getEditDateTimeFormat(DataType.DateTime)).toBe('MM/dd/yyyy hh:mm a');
    });
});
