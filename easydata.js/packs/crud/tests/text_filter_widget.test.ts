import { i18n, utils as dataUtils, EasyDataTable } from '@easydata/core';
import { 
    browserUtils, CellRendererType,
    EasyGrid, GridCellRenderer, 
    GridColumn, domel
} from '@easydata/ui';

import { TextFilterWidget } from '../src/widgets/text_filter_widget';
import { DataFilter } from '../src/filter/data_filter';

describe('TextFilterWidget', () => {
    // Переменные для тестов
    let mockSlot: HTMLElement;
    let mockGrid: EasyGrid;
    let mockFilter: DataFilter;
    let filterWidget: TextFilterWidget;
    let mockCellRendererStore: any;
    let defaultStringRenderer: GridCellRenderer;
    let defaultNumberRenderer: GridCellRenderer;
    
    // Инициализация перед каждым тестом
    beforeEach(() => {
        // Создаем DOM для монтирования виджета
        mockSlot = document.createElement('div');
        document.body.appendChild(mockSlot);
        
        // Создаем моки для рендереров ячеек
        defaultStringRenderer = mock();
        defaultNumberRenderer = mock();
        
        // Мок для хранилища рендереров
        mockCellRendererStore = {
            getDefaultRendererByType: mock((type: CellRendererType) => {
                if (type === CellRendererType.STRING) return defaultStringRenderer;
                if (type === CellRendererType.NUMBER) return defaultNumberRenderer;
                return null;
            }),
            setDefaultRenderer: mock()
        };
        
        // Мок для EasyGrid
        mockGrid = {
            cellRendererStore: mockCellRendererStore,
            setData: mock(),
        } as unknown as EasyGrid;
        
        // Мок для DataFilter
        mockFilter = {
            getValue: mock().mockReturnValue(''),
            apply: mock().mockResolvedValue(new EasyDataTable())
        } as unknown as DataFilter;
        
        // Мок для i18n.getText
        jest.spyOn(i18n, 'getText').mockImplementation((key: string) => {
            if (key === 'SearchInputPlaceholder') return 'Search...';
            if (key === 'SearchBtn') return 'Search';
            return key;
        });
        
        // Мок для browserUtils.isIE и isEdge
        jest.spyOn(browserUtils, 'isIE').mockReturnValue(false);
        jest.spyOn(browserUtils, 'isEdge').mockReturnValue(false);
        
        // Мок для dataUtils.isNumericType и getStringDataTypes
        jest.spyOn(dataUtils, 'isNumericType').mockImplementation((type) => {
            return type === 'number';
        });
        jest.spyOn(dataUtils, 'getStringDataTypes').mockReturnValue(['string']);
        
        // Создание экземпляра виджета для тестов
        filterWidget = new TextFilterWidget(mockSlot, mockGrid, mockFilter);
    });
    
    // Очистка после каждого теста
    afterEach(() => {
        if (mockSlot.parentNode) {
            mockSlot.parentNode.removeChild(mockSlot);
        }
        
        // Сброс всех моков
        jest.restoreAllMocks();
    });
    
    it('должен создаваться с настройками по умолчанию', () => {
        expect(filterWidget).toBeDefined();
        
        // Проверка установки рендереров
        expect(mockCellRendererStore.getDefaultRendererByType).toHaveBeenCalledWith(CellRendererType.STRING);
        expect(mockCellRendererStore.getDefaultRendererByType).toHaveBeenCalledWith(CellRendererType.NUMBER);
        expect(mockCellRendererStore.setDefaultRenderer).toHaveBeenCalledTimes(2);
    });
    
    it('должен правильно рендерить HTML структуру', () => {
        // Проверка наличия поля ввода
        const input = mockSlot.querySelector('input');
        expect(input).toBeDefined();
        expect(input.getAttribute('placeholder')).toBe('Search...');
        
        // Проверка наличия кнопки поиска (вне режима instantMode)
        const button = mockSlot.querySelector('button');
        expect(button).toBeDefined();
        expect(button.textContent).toBe('Search');
        
        // Проверка наличия иконки очистки
        const clearIcon = mockSlot.querySelector('span.icon');
        expect(clearIcon).toBeDefined();
    });
    
    it('должен рендерить HTML без кнопки поиска в instantMode', () => {
        // Удаляем предыдущий виджет
        mockSlot.innerHTML = '';
        
        // Создаем новый виджет с instantMode
        filterWidget = new TextFilterWidget(mockSlot, mockGrid, mockFilter, {
            instantMode: true
        });
        
        // Проверка наличия поля ввода
        const input = mockSlot.querySelector('input');
        expect(input).toBeDefined();
        
        // Проверка отсутствия кнопки поиска
        const button = mockSlot.querySelector('button');
        expect(button).toBeNull();
    });
    
    it('должен использовать другие классы для IE', () => {
        // Удаляем предыдущий виджет
        mockSlot.innerHTML = '';
        
        // Меняем мок для IE
        (browserUtils.isIE as jest.Mock).mockReturnValue(true);
        
        // Создаем новый виджет
        filterWidget = new TextFilterWidget(mockSlot, mockGrid, mockFilter);
        
        // Проверка наличия класса для IE
        expect(mockSlot.classList.contains('kfrm-fields-ie')).toBe(true);
    });
    
    it('должен устанавливать фокус на поле ввода, если опция focus=true', () => {
        // Удаляем предыдущий виджет
        mockSlot.innerHTML = '';
        
        // Мок для focus
        const focusMock = mock();
        HTMLInputElement.prototype.focus = focusMock;
        
        // Создаем новый виджет с опцией focus=true
        filterWidget = new TextFilterWidget(mockSlot, mockGrid, mockFilter, {
            focus: true
        });
        
        // Проверка вызова focus
        expect(focusMock).toHaveBeenCalled();
    });
    
    it('должен применять фильтр при нажатии Enter', () => {
        // Получаем поле ввода
        const input = mockSlot.querySelector('input') as HTMLInputElement;
        
        // Устанавливаем значение
        input.value = 'test';
        
        // Эмулируем нажатие Enter
        const enterEvent = new KeyboardEvent('keydown', { keyCode: 13 });
        input.dispatchEvent(enterEvent);
        
        // Проверка вызова apply с правильным значением
        expect(mockFilter.apply).toHaveBeenCalledWith('test');
    });
    
    it('должен применять фильтр при нажатии кнопки Search', () => {
        // Получаем поле ввода и кнопку
        const input = mockSlot.querySelector('input') as HTMLInputElement;
        const button = mockSlot.querySelector('button') as HTMLButtonElement;
        
        // Устанавливаем значение
        input.value = 'test';
        
        // Эмулируем клик по кнопке
        button.click();
        
        // Проверка вызова apply с правильным значением
        expect(mockFilter.apply).toHaveBeenCalledWith('test');
    });
    
    it('должен очищать поле ввода при нажатии на иконку очистки', () => {
        // Получаем поле ввода и иконку очистки
        const input = mockSlot.querySelector('input') as HTMLInputElement;
        const clearIcon = mockSlot.querySelector('span.icon') as HTMLSpanElement;
        
        // Устанавливаем значение и фокус мок
        input.value = 'test';
        const focusMock = mock();
        input.focus = focusMock;
        
        // Эмулируем клик по иконке очистки
        clearIcon.click();
        
        // Проверка очистки значения
        expect(input.value).toBe('');
        
        // Проверка установки фокуса
        expect(focusMock).toHaveBeenCalled();
        
        // Проверка вызова apply с пустым значением
        expect(mockFilter.apply).toHaveBeenCalledWith('');
    });
    
    it('должен применять фильтр с задержкой в instantMode при вводе', () => {
        // Удаляем предыдущий виджет
        mockSlot.innerHTML = '';
        
        // Мок для setTimeout
        jest.useFakeTimers();
        
        // Создаем новый виджет с instantMode и маленьким таймаутом
        filterWidget = new TextFilterWidget(mockSlot, mockGrid, mockFilter, {
            instantMode: true,
            instantTimeout: 500
        });
        
        // Получаем поле ввода
        const input = mockSlot.querySelector('input') as HTMLInputElement;
        
        // Устанавливаем значение и эмулируем keyup
        input.value = 'test';
        input.dispatchEvent(new KeyboardEvent('keyup'));
        
        // Проверка, что apply не вызван сразу
        expect(mockFilter.apply).not.toHaveBeenCalled();
        
        // Проматываем таймеры
        jest.advanceTimersByTime(500);
        
        // Проверка вызова apply с правильным значением
        expect(mockFilter.apply).toHaveBeenCalledWith('test');
        
        // Восстанавливаем таймеры
        jest.useRealTimers();
    });
    
    it('должен очищать предыдущий таймер при новом событии keyup', () => {
        // Удаляем предыдущий виджет
        mockSlot.innerHTML = '';
        
        // Мок для setTimeout и clearTimeout
        jest.useFakeTimers();
        const clearTimeoutSpy = jest.spyOn(window, 'clearTimeout');
        
        // Создаем новый виджет с instantMode
        filterWidget = new TextFilterWidget(mockSlot, mockGrid, mockFilter, {
            instantMode: true,
            instantTimeout: 500
        });
        
        // Получаем поле ввода
        const input = mockSlot.querySelector('input') as HTMLInputElement;
        
        // Первый ввод
        input.value = 'test';
        input.dispatchEvent(new KeyboardEvent('keyup'));
        
        // Второй ввод до истечения таймаута
        input.value = 'test2';
        input.dispatchEvent(new KeyboardEvent('keyup'));
        
        // Проверка вызова clearTimeout
        expect(clearTimeoutSpy).toHaveBeenCalled();
        
        // Проматываем таймеры
        jest.advanceTimersByTime(500);
        
        // Проверка вызова apply с последним значением
        expect(mockFilter.apply).toHaveBeenCalledWith('test2');
        
        // Восстанавливаем таймеры
        jest.useRealTimers();
    });
    
    it('метод applyFilter должен вернуть true если значение фильтра изменилось', () => {
        // Получаем поле ввода
        const input = mockSlot.querySelector('input') as HTMLInputElement;
        
        // Устанавливаем значение
        input.value = 'test';
        
        // Мок для getValue, возвращающий другое значение
        (mockFilter.getValue as jest.Mock).mockReturnValue('old');
        
        // Вызываем метод и проверяем результат
        const result = filterWidget.applyFilter(true);
        expect(result).toBe(true);
        
        // Проверка вызова apply
        expect(mockFilter.apply).toHaveBeenCalledWith('test');
    });
    
    it('метод applyFilter должен вернуть false если значение фильтра не изменилось', () => {
        // Получаем поле ввода
        const input = mockSlot.querySelector('input') as HTMLInputElement;
        
        // Устанавливаем значение
        input.value = 'test';
        
        // Мок для getValue, возвращающий то же самое значение
        (mockFilter.getValue as jest.Mock).mockReturnValue('test');
        
        // Вызываем метод и проверяем результат
        const result = filterWidget.applyFilter(true);
        expect(result).toBe(false);
        
        // Проверка, что apply не вызван
        expect(mockFilter.apply).not.toHaveBeenCalled();
    });
    
    it('должен правильно выделять текст, совпадающий с фильтром', () => {
        // Мок для getValue, возвращающий искомое слово
        (mockFilter.getValue as jest.Mock).mockReturnValue('test');
        
        // Вызываем highlightText напрямую через приватный метод
        const result = (filterWidget as any).highlightText('This is a test string');
        
        // Проверка типа результата
        expect(result instanceof HTMLElement).toBe(true);
        
        // Проверка содержимого
        const div = result as HTMLElement;
        
        // Должно быть 3 дочерних элемента: текст, span с выделением, текст
        expect(div.childNodes.length).toBe(3);
        
        // Проверка правильного выделения
        expect(div.childNodes[0].textContent).toBe('This is a ');
        
        const highlightSpan = div.childNodes[1] as HTMLSpanElement;
        expect(highlightSpan.tagName).toBe('SPAN');
        expect(highlightSpan.style.backgroundColor).toBe('yellow');
        expect(highlightSpan.textContent).toBe('test');
        
        expect(div.childNodes[2].textContent).toBe(' string');
    });
    
    it('должен правильно выделять несколько совпадений', () => {
        // Мок для getValue, возвращающий искомое слово
        (mockFilter.getValue as jest.Mock).mockReturnValue('test');
        
        // Вызываем highlightText напрямую через приватный метод
        const result = (filterWidget as any).highlightText('test another test');
        
        // Проверка типа результата
        expect(result instanceof HTMLElement).toBe(true);
        
        // Проверка содержимого
        const div = result as HTMLElement;
        
        // Должно быть 5 дочерних элементов: span, текст, span, текст
        expect(div.childNodes.length).toBe(3);
        
        // Проверка первого выделения
        const firstSpan = div.childNodes[0] as HTMLSpanElement;
        expect(firstSpan.tagName).toBe('SPAN');
        expect(firstSpan.textContent).toBe('test');
        
        // Проверка текста между выделениями
        expect(div.childNodes[1].textContent).toBe(' another ');
        
        // Проверка второго выделения
        const secondSpan = div.childNodes[2] as HTMLSpanElement;
        expect(secondSpan.tagName).toBe('SPAN');
        expect(secondSpan.textContent).toBe('test');
    });
    
    it('должен правильно обрабатывать несколько искомых слов через разделитель ||', () => {
        // Мок для getValue, возвращающий несколько слов через разделитель
        (mockFilter.getValue as jest.Mock).mockReturnValue('apple || banana');
        
        // Вызываем highlightText напрямую через приватный метод
        const result = (filterWidget as any).highlightText('I have an apple and a banana');
        
        // Проверка типа результата
        expect(result instanceof HTMLElement).toBe(true);
        
        // Проверка содержимого
        const div = result as HTMLElement;
        
        // Должен содержать выделения для обоих слов
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
    
    it('должен выделять всю ячейку, если содержимое полностью совпадает с фильтром', () => {
        // Мок для getValue, возвращающий полное значение ячейки
        (mockFilter.getValue as jest.Mock).mockReturnValue('exact match');
        
        // Вызываем highlightText напрямую через приватный метод
        const result = (filterWidget as any).highlightText('exact match');
        
        // Должен вернуть один span, выделяющий всё содержимое
        expect(result instanceof HTMLSpanElement).toBe(true);
        expect((result as HTMLSpanElement).style.backgroundColor).toBe('yellow');
        expect((result as HTMLSpanElement).textContent).toBe('exact match');
    });
    
    it('должен возвращать исходный текст, если нет совпадений', () => {
        // Мок для getValue, возвращающий слово, которого нет в тексте
        (mockFilter.getValue as jest.Mock).mockReturnValue('missing');
        
        // Вызываем highlightText напрямую через приватный метод
        const result = (filterWidget as any).highlightText('This is a test string');
        
        // Должен вернуть оригинальную строку
        expect(result).toBe('This is a test string');
    });
    
    it('должен возвращать исходный текст, если фильтр пустой', () => {
        // Мок для getValue, возвращающий пустую строку
        (mockFilter.getValue as jest.Mock).mockReturnValue('');
        
        // Вызываем highlightText напрямую через приватный метод
        const result = (filterWidget as any).highlightText('This is a test string');
        
        // Должен вернуть оригинальную строку
        expect(result).toBe('This is a test string');
    });
    
    it('должен использовать пользовательский рендерер для строковых ячеек', () => {
        // Создаем моки для параметров рендерера
        const column: GridColumn = {
            dataColumn: { id: 'name' },
            type: 'string'
        } as GridColumn;
        const cellElement = document.createElement('div');
        const rowElement = document.createElement('tr');
        
        // Получаем установленный рендерер для строк
        const stringRendererCall = (mockCellRendererStore.setDefaultRenderer as jest.Mock).mock.calls[0];
        const customStringRenderer = stringRendererCall[1];
        
        // Мок для getValue, чтобы строки выделялись
        (mockFilter.getValue as jest.Mock).mockReturnValue('test');
        
        // Вызываем пользовательский рендерер
        customStringRenderer('This is a test', column, cellElement, rowElement);
        
        // Проверяем, что ячейка содержит выделенный текст
        expect(cellElement.innerHTML).not.toBe('');
        expect(cellElement.querySelector('span[style*="yellow"]')).toBeDefined();
    });
    
    it('должен использовать пользовательский рендерер для числовых ячеек', () => {
        // Создаем моки для параметров рендерера
        const column: GridColumn = {
            dataColumn: { id: 'value' },
            type: 'number'
        } as GridColumn;
        const cellElement = document.createElement('div');
        const rowElement = document.createElement('tr');
        
        // Получаем установленный рендерер для чисел
        const numberRendererCall = (mockCellRendererStore.setDefaultRenderer as jest.Mock).mock.calls[1];
        const customNumberRenderer = numberRendererCall[1];
        
        // Мок для getValue, чтобы числа выделялись
        (mockFilter.getValue as jest.Mock).mockReturnValue('42');
        
        // Мок для toLocaleString
        Number.prototype.toLocaleString = function() { return this.toString(); };
        
        // Вызываем пользовательский рендерер
        customNumberRenderer(42, column, cellElement, rowElement);
        
        // Проверяем, что ячейка содержит выделенный текст
        expect(cellElement.innerHTML).not.toBe('');
        expect(cellElement.querySelector('span[style*="yellow"]')).toBeDefined();
    });
});
