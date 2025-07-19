import { i18n, utils as dataUtils, EasyDataTable } from '@easydata/core';
import { 
    browserUtils, CellRendererType,
    EasyGrid, GridCellRenderer, 
    GridColumn, domel
} from '@easydata/ui';

import { TextFilterWidget } from '../src/widgets/text_filter_widget';
import { DataFilter } from '../src/filter/data_filter';

describe('TextFilterWidget', () => {
    // Variables for tests
    let mockSlot: HTMLElement;
    let mockGrid: EasyGrid;
    let mockFilter: DataFilter;
    let filterWidget: TextFilterWidget;
    let mockCellRendererStore: any;
    let defaultStringRenderer: GridCellRenderer;
    let defaultNumberRenderer: GridCellRenderer;
    
    // Initialization before each test
    beforeEach(() => {
        // Create DOM для монтирования виджета
        mockSlot = document.createElement('div');
        document.body.appendChild(mockSlot);
        
        // Create mocks for рендереров ячеек
        defaultStringRenderer = mock();
        defaultNumberRenderer = mock();
        
        // Mock for хранилища рендереров
        mockCellRendererStore = {
            getDefaultRendererByType: mock((type: CellRendererType) => {
                if (type === CellRendererType.STRING) return defaultStringRenderer;
                if (type === CellRendererType.NUMBER) return defaultNumberRenderer;
                return null;
            }),
            setDefaultRenderer: mock()
        };
        
        // Mock for EasyGrid
        mockGrid = {
            cellRendererStore: mockCellRendererStore,
            setData: mock(),
        } as unknown as EasyGrid;
        
        // Mock for DataFilter
        mockFilter = {
            getValue: mock().mockReturnValue(''),
            apply: mock().mockResolvedValue(new EasyDataTable())
        } as unknown as DataFilter;
        
        // Mock for i18n.getText
        jest.spyOn(i18n, 'getText').mockImplementation((key: string) => {
            if (key === 'SearchInputPlaceholder') return 'Search...';
            if (key === 'SearchBtn') return 'Search';
            return key;
        });
        
        // Mock for browserUtils.isIE и isEdge
        jest.spyOn(browserUtils, 'isIE').mockReturnValue(false);
        jest.spyOn(browserUtils, 'isEdge').mockReturnValue(false);
        
        // Mock for dataUtils.isNumericType и getStringDataTypes
        jest.spyOn(dataUtils, 'isNumericType').mockImplementation((type) => {
            return type === 'number';
        });
        jest.spyOn(dataUtils, 'getStringDataTypes').mockReturnValue(['string']);
        
        // Create widget instance for testing
        filterWidget = new TextFilterWidget(mockSlot, mockGrid, mockFilter);
    });
    
    // Cleanup after each test
    afterEach(() => {
        if (mockSlot.parentNode) {
            mockSlot.parentNode.removeChild(mockSlot);
        }
        
        // Сброс всех моков
        jest.restoreAllMocks();
    });
    
    it('should создаваться with default settings', () => {
        expect(filterWidget).toBeDefined();
        
        // Check установки рендереров
        expect(mockCellRendererStore.getDefaultRendererByType).toHaveBeenCalledWith(CellRendererType.STRING);
        expect(mockCellRendererStore.getDefaultRendererByType).toHaveBeenCalledWith(CellRendererType.NUMBER);
        expect(mockCellRendererStore.setDefaultRenderer).toHaveBeenCalledTimes(2);
    });
    
    it('should правильно рендерить HTML структуру', () => {
        // Check наличия поля ввода
        const input = mockSlot.querySelector('input');
        expect(input).toBeDefined();
        expect(input.getAttribute('placeholder')).toBe('Search...');
        
        // Check наличия кнопки поиска (вне режима instantMode)
        const button = mockSlot.querySelector('button');
        expect(button).toBeDefined();
        expect(button.textContent).toBe('Search');
        
        // Check наличия иконки очистки
        const clearIcon = mockSlot.querySelector('span.icon');
        expect(clearIcon).toBeDefined();
    });
    
    it('should рендерить HTML без кнопки поиска в instantMode', () => {
        // Remove предыдущий виджет
        mockSlot.innerHTML = '';
        
        // Создаем новый виджет с instantMode
        filterWidget = new TextFilterWidget(mockSlot, mockGrid, mockFilter, {
            instantMode: true
        });
        
        // Check наличия поля ввода
        const input = mockSlot.querySelector('input');
        expect(input).toBeDefined();
        
        // Check отсутствия кнопки поиска
        const button = mockSlot.querySelector('button');
        expect(button).toBeNull();
    });
    
    it('should использовать другие классы для IE', () => {
        // Remove предыдущий виджет
        mockSlot.innerHTML = '';
        
        // Change mock for IE
        (browserUtils.isIE as jest.Mock).mockReturnValue(true);
        
        // Создаем новый виджет
        filterWidget = new TextFilterWidget(mockSlot, mockGrid, mockFilter);
        
        // Check наличия класса для IE
        expect(mockSlot.classList.contains('kfrm-fields-ie')).toBe(true);
    });
    
    it('should устанавливать фокус на поле ввода, если опция focus=true', () => {
        // Remove предыдущий виджет
        mockSlot.innerHTML = '';
        
        // Mock for focus
        const focusMock = mock();
        HTMLInputElement.prototype.focus = focusMock;
        
        // Создаем новый виджет с опцией focus=true
        filterWidget = new TextFilterWidget(mockSlot, mockGrid, mockFilter, {
            focus: true
        });
        
        // Check вызова focus
        expect(focusMock).toHaveBeenCalled();
    });
    
    it('should применять фильтр при нажатии Enter', () => {
        // Get поле ввода
        const input = mockSlot.querySelector('input') as HTMLInputElement;
        
        // Set значение
        input.value = 'test';
        
        // Emulate нажатие Enter
        const enterEvent = new KeyboardEvent('keydown', { keyCode: 13 });
        input.dispatchEvent(enterEvent);
        
        // Check вызова apply с правильным значением
        expect(mockFilter.apply).toHaveBeenCalledWith('test');
    });
    
    it('should применять фильтр при нажатии кнопки Search', () => {
        // Get поле ввода и кнопку
        const input = mockSlot.querySelector('input') as HTMLInputElement;
        const button = mockSlot.querySelector('button') as HTMLButtonElement;
        
        // Set значение
        input.value = 'test';
        
        // Emulate клик по кнопке
        button.click();
        
        // Check вызова apply с правильным значением
        expect(mockFilter.apply).toHaveBeenCalledWith('test');
    });
    
    it('should очищать поле ввода при нажатии на иконку очистки', () => {
        // Get поле ввода и иконку очистки
        const input = mockSlot.querySelector('input') as HTMLInputElement;
        const clearIcon = mockSlot.querySelector('span.icon') as HTMLSpanElement;
        
        // Set значение и фокус мок
        input.value = 'test';
        const focusMock = mock();
        input.focus = focusMock;
        
        // Emulate клик по иконке очистки
        clearIcon.click();
        
        // Check очистки значения
        expect(input.value).toBe('');
        
        // Check установки фокуса
        expect(focusMock).toHaveBeenCalled();
        
        // Check вызова apply с пустым значением
        expect(mockFilter.apply).toHaveBeenCalledWith('');
    });
    
    it('should применять фильтр с задержкой в instantMode при вводе', () => {
        // Remove предыдущий виджет
        mockSlot.innerHTML = '';
        
        // Mock for setTimeout
        jest.useFakeTimers();
        
        // Создаем новый виджет с instantMode и маленьким таймаутом
        filterWidget = new TextFilterWidget(mockSlot, mockGrid, mockFilter, {
            instantMode: true,
            instantTimeout: 500
        });
        
        // Get поле ввода
        const input = mockSlot.querySelector('input') as HTMLInputElement;
        
        // Set значение и эмулируем keyup
        input.value = 'test';
        input.dispatchEvent(new KeyboardEvent('keyup'));
        
        // Check, что apply не вызван сразу
        expect(mockFilter.apply).not.toHaveBeenCalled();
        
        // Проматываем таймеры
        jest.advanceTimersByTime(500);
        
        // Check вызова apply с правильным значением
        expect(mockFilter.apply).toHaveBeenCalledWith('test');
        
        // Restore таймеры
        jest.useRealTimers();
    });
    
    it('should очищать предыдущий таймер при новом событии keyup', () => {
        // Remove предыдущий виджет
        mockSlot.innerHTML = '';
        
        // Mock for setTimeout и clearTimeout
        jest.useFakeTimers();
        const clearTimeoutSpy = jest.spyOn(window, 'clearTimeout');
        
        // Создаем новый виджет с instantMode
        filterWidget = new TextFilterWidget(mockSlot, mockGrid, mockFilter, {
            instantMode: true,
            instantTimeout: 500
        });
        
        // Get поле ввода
        const input = mockSlot.querySelector('input') as HTMLInputElement;
        
        // Первый ввод
        input.value = 'test';
        input.dispatchEvent(new KeyboardEvent('keyup'));
        
        // Второй ввод до истечения таймаута
        input.value = 'test2';
        input.dispatchEvent(new KeyboardEvent('keyup'));
        
        // Check вызова clearTimeout
        expect(clearTimeoutSpy).toHaveBeenCalled();
        
        // Проматываем таймеры
        jest.advanceTimersByTime(500);
        
        // Check вызова apply с последним значением
        expect(mockFilter.apply).toHaveBeenCalledWith('test2');
        
        // Restore таймеры
        jest.useRealTimers();
    });
    
    it('метод applyFilter should вернуть true если значение фильтра изменилось', () => {
        // Get поле ввода
        const input = mockSlot.querySelector('input') as HTMLInputElement;
        
        // Set значение
        input.value = 'test';
        
        // Mock for getValue, возвращающий другое значение
        (mockFilter.getValue as jest.Mock).mockReturnValue('old');
        
        // Call метод и проверяем результат
        const result = filterWidget.applyFilter(true);
        expect(result).toBe(true);
        
        // Check вызова apply
        expect(mockFilter.apply).toHaveBeenCalledWith('test');
    });
    
    it('метод applyFilter should вернуть false если значение фильтра не изменилось', () => {
        // Get поле ввода
        const input = mockSlot.querySelector('input') as HTMLInputElement;
        
        // Set значение
        input.value = 'test';
        
        // Mock for getValue, возвращающий то же самое значение
        (mockFilter.getValue as jest.Mock).mockReturnValue('test');
        
        // Call метод и проверяем результат
        const result = filterWidget.applyFilter(true);
        expect(result).toBe(false);
        
        // Check, что apply не вызван
        expect(mockFilter.apply).not.toHaveBeenCalled();
    });
    
    it('should правильно выделять текст, совпадающий с фильтром', () => {
        // Mock for getValue, возвращающий искомое слово
        (mockFilter.getValue as jest.Mock).mockReturnValue('test');
        
        // Call highlightText напрямую через приватный метод
        const result = (filterWidget as any).highlightText('This is a test string');
        
        // Check типа результата
        expect(result instanceof HTMLElement).toBe(true);
        
        // Check содержимого
        const div = result as HTMLElement;
        
        // Should have 3 child elements: text, span with highlight, text
        expect(div.childNodes.length).toBe(3);
        
        // Check правильного выделения
        expect(div.childNodes[0].textContent).toBe('This is a ');
        
        const highlightSpan = div.childNodes[1] as HTMLSpanElement;
        expect(highlightSpan.tagName).toBe('SPAN');
        expect(highlightSpan.style.backgroundColor).toBe('yellow');
        expect(highlightSpan.textContent).toBe('test');
        
        expect(div.childNodes[2].textContent).toBe(' string');
    });
    
    it('should правильно выделять несколько совпадений', () => {
        // Mock for getValue, возвращающий искомое слово
        (mockFilter.getValue as jest.Mock).mockReturnValue('test');
        
        // Call highlightText напрямую через приватный метод
        const result = (filterWidget as any).highlightText('test another test');
        
        // Check типа результата
        expect(result instanceof HTMLElement).toBe(true);
        
        // Check содержимого
        const div = result as HTMLElement;
        
        // Should have 5 child elements: span, text, span, text
        expect(div.childNodes.length).toBe(3);
        
        // Check первого выделения
        const firstSpan = div.childNodes[0] as HTMLSpanElement;
        expect(firstSpan.tagName).toBe('SPAN');
        expect(firstSpan.textContent).toBe('test');
        
        // Check текста между выделениями
        expect(div.childNodes[1].textContent).toBe(' another ');
        
        // Check второго выделения
        const secondSpan = div.childNodes[2] as HTMLSpanElement;
        expect(secondSpan.tagName).toBe('SPAN');
        expect(secondSpan.textContent).toBe('test');
    });
    
    it('should правильно обрабатывать несколько искомых слов через разделитель ||', () => {
        // Mock for getValue, возвращающий несколько слов через разделитель
        (mockFilter.getValue as jest.Mock).mockReturnValue('apple || banana');
        
        // Call highlightText напрямую через приватный метод
        const result = (filterWidget as any).highlightText('I have an apple and a banana');
        
        // Check типа результата
        expect(result instanceof HTMLElement).toBe(true);
        
        // Check содержимого
        const div = result as HTMLElement;
        
        // Should contain highlights for both words
        let appleFound = false;
        let bananaFound = false;
        
        for (let i = 0; i < div.childNodes.length; i++) {
            const node = div.childNodes[i];
            if (node instanceof HTMLSpanElement && node.textContent === 'apple') {
                appleFound = true;
            }
            if (node instanceof HTMLSpanElement && node.textContent === 'banana') {
                bananaFound = true;
            }
        }
        
        expect(appleFound).toBe(true);
        expect(bananaFound).toBe(true);
    });
    
    it('should выделять всю ячейку, если содержимое полностью совпадает с фильтром', () => {
        // Mock for getValue, возвращающий полное значение ячейки
        (mockFilter.getValue as jest.Mock).mockReturnValue('exact match');
        
        // Call highlightText напрямую через приватный метод
        const result = (filterWidget as any).highlightText('exact match');
        
        // Should return one span highlighting all content
        expect(result instanceof HTMLSpanElement).toBe(true);
        expect((result as HTMLSpanElement).style.backgroundColor).toBe('yellow');
        expect((result as HTMLSpanElement).textContent).toBe('exact match');
    });
    
    it('should return original text if no matches', () => {
        // Mock for getValue, возвращающий слово, которого нет в тексте
        (mockFilter.getValue as jest.Mock).mockReturnValue('missing');
        
        // Call highlightText напрямую через приватный метод
        const result = (filterWidget as any).highlightText('This is a test string');
        
        // Should return original string
        expect(result).toBe('This is a test string');
    });
    
    it('should return original text if filter is empty', () => {
        // Mock for getValue, возвращающий пустую строку
        (mockFilter.getValue as jest.Mock).mockReturnValue('');
        
        // Call highlightText напрямую через приватный метод
        const result = (filterWidget as any).highlightText('This is a test string');
        
        // Should return original string
        expect(result).toBe('This is a test string');
    });
    
    it('should использовать пользовательский рендерер для строковых ячеек', () => {
        // Create mocks for параметров рендерера
        const column: GridColumn = {
            dataColumn: { id: 'name' },
            type: 'string'
        } as GridColumn;
        const cellElement = document.createElement('div');
        const rowElement = document.createElement('tr');
        
        // Get установленный рендерер для строк
        const stringRendererCall = (mockCellRendererStore.setDefaultRenderer as jest.Mock).mock.calls[0];
        const customStringRenderer = stringRendererCall[1];
        
        // Mock for getValue, чтобы строки выделялись
        (mockFilter.getValue as jest.Mock).mockReturnValue('test');
        
        // Call пользовательский рендерер
        customStringRenderer('This is a test', column, cellElement, rowElement);
        
        // Check, что ячейка содержит выделенный текст
        expect(cellElement.innerHTML).not.toBe('');
        expect(cellElement.querySelector('span[style*="yellow"]')).toBeDefined();
    });
    
    it('should использовать пользовательский рендерер для числовых ячеек', () => {
        // Create mocks for параметров рендерера
        const column: GridColumn = {
            dataColumn: { id: 'value' },
            type: 'number'
        } as GridColumn;
        const cellElement = document.createElement('div');
        const rowElement = document.createElement('tr');
        
        // Get установленный рендерер для чисел
        const numberRendererCall = (mockCellRendererStore.setDefaultRenderer as jest.Mock).mock.calls[1];
        const customNumberRenderer = numberRendererCall[1];
        
        // Mock for getValue, чтобы числа выделялись
        (mockFilter.getValue as jest.Mock).mockReturnValue('42');
        
        // Mock for toLocaleString
        Number.prototype.toLocaleString = function() { return this.toString(); };
        
        // Call пользовательский рендерер
        customNumberRenderer(42, column, cellElement, rowElement);
        
        // Check, что ячейка содержит выделенный текст
        expect(cellElement.innerHTML).not.toBe('');
        expect(cellElement.querySelector('span[style*="yellow"]')).toBeDefined();
    });
});
