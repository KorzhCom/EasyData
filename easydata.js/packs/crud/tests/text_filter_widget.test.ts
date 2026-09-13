import { i18n, utils as dataUtils, EasyDataTable } from '@easydata/core';
import { 
    browserUtils, CellRendererType,
    EasyGrid, GridCellRenderer, 
    GridColumn, domel
} from '@easydata/ui';

import { TextFilterWidget } from '../src/widgets/text_filter_widget';
import { DataFilter } from '../src/filter/data_filter';
import {
    Mock, advanceTimersByTime, restoreAllMocks, setReturnValue,
    spyOn, useFakeTimers, useRealTimers
} from './helpers/mocks';

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
        // Create DOM for mounting the widget
        mockSlot = document.createElement('div');
        document.body.appendChild(mockSlot);
        
        // Create mocks for cell renderers
        defaultStringRenderer = mock();
        defaultNumberRenderer = mock();
        
        // Mock for renderer store
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
        spyOn(i18n, 'getText').mockImplementation((key: string) => {
            if (key === 'SearchInputPlaceholder') return 'Search...';
            if (key === 'SearchBtn') return 'Search';
            return key;
        });
        
        // Mock for browserUtils.isIE and isEdge
        spyOn(browserUtils, 'isIE').mockReturnValue(false);
        spyOn(browserUtils, 'isEdge').mockReturnValue(false);
        
        // Mock for dataUtils.isNumericType and getStringDataTypes
        spyOn(dataUtils, 'isNumericType').mockImplementation((type) => {
            return type === 'number';
        });
        spyOn(dataUtils, 'getStringDataTypes').mockReturnValue(['string']);
        
        // Create widget instance for testing
        filterWidget = new TextFilterWidget(mockSlot, mockGrid, mockFilter);
    });
    
    // Cleanup after each test
    afterEach(() => {
        if (mockSlot.parentNode) {
            mockSlot.parentNode.removeChild(mockSlot);
        }
        
        // Reset all mocks
        restoreAllMocks();
    });
    
    it('should be created with default settings', () => {
        expect(filterWidget).toBeDefined();
        
        // Check renderer setup
        expect(mockCellRendererStore.getDefaultRendererByType).toHaveBeenCalledWith([CellRendererType.STRING]);
        expect(mockCellRendererStore.getDefaultRendererByType).toHaveBeenCalledWith([CellRendererType.NUMBER]);
        expect(mockCellRendererStore.setDefaultRenderer).toHaveBeenCalledTimes(2);
    });
    
    it('should correctly render HTML structure', () => {
        // Check input field presence
        const input = mockSlot.querySelector('input');
        expect(input).toBeDefined();
        expect(input.getAttribute('placeholder')).toBe('Search...');
        
        // Check search button presence (outside instantMode)
        const button = mockSlot.querySelector('button');
        expect(button).toBeDefined();
        expect(button.textContent).toBe('Search');
        
        // Check clear icon presence
        const clearIcon = mockSlot.querySelector('span.icon');
        expect(clearIcon).toBeDefined();
    });
    
    it('should render HTML without search button in instantMode', () => {
        // Remove previous widget
        mockSlot.innerHTML = '';
        
        // Create new widget with instantMode
        filterWidget = new TextFilterWidget(mockSlot, mockGrid, mockFilter, {
            instantMode: true
        });
        
        // Check input field presence
        const input = mockSlot.querySelector('input');
        expect(input).toBeDefined();
        
        // Check absence of search button
        const button = mockSlot.querySelector('button');
        expect(button).toBeNull();
    });
    
    it('should use different classes for IE', () => {
        // Remove previous widget
        mockSlot.innerHTML = '';
        
        // Change mock for IE
        setReturnValue(browserUtils.isIE as Mock, true);
        
        // Create new widget
        filterWidget = new TextFilterWidget(mockSlot, mockGrid, mockFilter);
        
        // Check IE class presence
        expect(mockSlot.classList.contains('kfrm-fields-ie')).toBe(true);
    });
    
    it('should set focus on input field if focus=true option is set', () => {
        // Remove previous widget
        mockSlot.innerHTML = '';
        
        // Mock for focus
        const focusMock = mock();
        HTMLInputElement.prototype.focus = focusMock;
        
        // Create new widget with focus=true option
        filterWidget = new TextFilterWidget(mockSlot, mockGrid, mockFilter, {
            focus: true
        });
        
        // Check focus call
        expect(focusMock).toHaveBeenCalled();
    });
    
    it('should apply filter when Enter is pressed', () => {
        // Get input field
        const input = mockSlot.querySelector('input') as HTMLInputElement;
        
        // Set value
        input.value = 'test';
        
        // Emulate Enter key press
        const enterEvent = new KeyboardEvent('keydown', { keyCode: 13 });
        input.dispatchEvent(enterEvent);
        
        // Check apply call with correct value
        expect(mockFilter.apply).toHaveBeenCalledWith(['test']);
    });
    
    it('should apply filter when Search button is pressed', () => {
        // Get input field and button
        const input = mockSlot.querySelector('input') as HTMLInputElement;
        const button = mockSlot.querySelector('button') as HTMLButtonElement;
        
        // Set value
        input.value = 'test';
        
        // Emulate button click
        button.click();
        
        // Check apply call with correct value
        expect(mockFilter.apply).toHaveBeenCalledWith(['test']);
    });
    
    it('should clear input field when clear icon is clicked', () => {
        // Get input field and clear icon
        const input = mockSlot.querySelector('input') as HTMLInputElement;
        const clearIcon = mockSlot.querySelector('span.icon') as HTMLSpanElement;
        
        // Set value and focus mock
        input.value = 'test';
        const focusMock = mock();
        input.focus = focusMock;
        
        // Emulate clear icon click
        clearIcon.click();
        
        // Check value clearing
        expect(input.value).toBe('');
        
        // Check focus setting
        expect(focusMock).toHaveBeenCalled();
        
        // Check apply call with empty value
        expect(mockFilter.apply).toHaveBeenCalledWith(['']);
    });
    
    it('should apply filter with delay in instantMode on input', () => {
        // Remove previous widget
        mockSlot.innerHTML = '';
        
        // Mock for setTimeout
        useFakeTimers();
        
        // Create new widget with instantMode and small timeout
        filterWidget = new TextFilterWidget(mockSlot, mockGrid, mockFilter, {
            instantMode: true,
            instantTimeout: 500
        });
        
        // Get input field
        const input = mockSlot.querySelector('input') as HTMLInputElement;
        
        // Set value and emulate keyup
        input.value = 'test';
        input.dispatchEvent(new KeyboardEvent('keyup'));
        
        // Check that apply is not called immediately
        expect(mockFilter.apply).not.toHaveBeenCalled();
        
        // Advance timers
        advanceTimersByTime(500);
        
        // Check apply call with correct value
        expect(mockFilter.apply).toHaveBeenCalledWith(['test']);
        
        // Restore timers
        useRealTimers();
    });
    
    it('should clear previous timer on new keyup event', () => {
        // Remove previous widget
        mockSlot.innerHTML = '';
        
        // Mock for setTimeout and clearTimeout
        useFakeTimers();
        // The widget calls the global clearTimeout, which under latte is not window.clearTimeout
        const clearTimeoutSpy = spyOn(globalThis, 'clearTimeout');
        
        // Create new widget with instantMode
        filterWidget = new TextFilterWidget(mockSlot, mockGrid, mockFilter, {
            instantMode: true,
            instantTimeout: 500
        });
        
        // Get input field
        const input = mockSlot.querySelector('input') as HTMLInputElement;
        
        // First input
        input.value = 'test';
        input.dispatchEvent(new KeyboardEvent('keyup'));
        
        // Second input before timeout expires
        input.value = 'test2';
        input.dispatchEvent(new KeyboardEvent('keyup'));
        
        // Check clearTimeout call
        expect(clearTimeoutSpy).toHaveBeenCalled();
        
        // Advance timers
        advanceTimersByTime(500);
        
        // Check apply call with last value
        expect(mockFilter.apply).toHaveBeenCalledWith(['test2']);
        
        // Restore timers
        useRealTimers();
    });
    
    it('applyFilter method should return true if filter value changed', () => {
        // Get input field
        const input = mockSlot.querySelector('input') as HTMLInputElement;
        
        // Set value
        input.value = 'test';
        
        // Mock for getValue returning different value
        setReturnValue(mockFilter.getValue as Mock, 'old');
        
        // Call method and check result
        const result = filterWidget.applyFilter(true);
        expect(result).toBe(true);
        
        // Check apply call
        expect(mockFilter.apply).toHaveBeenCalledWith(['test']);
    });
    
    it('applyFilter method should return false if filter value did not change', () => {
        // Get input field
        const input = mockSlot.querySelector('input') as HTMLInputElement;
        
        // Set value
        input.value = 'test';
        
        // Mock for getValue returning the same value
        setReturnValue(mockFilter.getValue as Mock, 'test');
        
        // Call method and check result
        const result = filterWidget.applyFilter(true);
        expect(result).toBe(false);
        
        // Check that apply is not called
        expect(mockFilter.apply).not.toHaveBeenCalled();
    });
    
    it('should correctly highlight text matching the filter', () => {
        // Mock for getValue returning search word
        setReturnValue(mockFilter.getValue as Mock, 'test');
        
        // Call highlightText directly through private method
        const result = (filterWidget as any).highlightText('This is a test string');
        
        // Check result type
        expect(result instanceof HTMLElement).toBe(true);
        
        // Check content
        const div = result as HTMLElement;
        
        // Should have 3 child elements: text, span with highlight, text
        expect(div.childNodes.length).toBe(3);
        
        // Check correct highlighting
        expect(div.childNodes[0].textContent).toBe('This is a ');
        
        const highlightSpan = div.childNodes[1] as HTMLSpanElement;
        expect(highlightSpan.tagName).toBe('SPAN');
        expect(highlightSpan.style.backgroundColor).toBe('yellow');
        expect(highlightSpan.textContent).toBe('test');
        
        expect(div.childNodes[2].textContent).toBe(' string');
    });
    
    it('should correctly highlight multiple matches', () => {
        // Mock for getValue returning search word
        setReturnValue(mockFilter.getValue as Mock, 'test');
        
        // Call highlightText directly through private method
        const result = (filterWidget as any).highlightText('test another test');
        
        // Check result type
        expect(result instanceof HTMLElement).toBe(true);
        
        // Check content
        const div = result as HTMLElement;
        
        // Should have 5 child elements: span, text, span, text
        expect(div.childNodes.length).toBe(3);
        
        // Check first highlight
        const firstSpan = div.childNodes[0] as HTMLSpanElement;
        expect(firstSpan.tagName).toBe('SPAN');
        expect(firstSpan.textContent).toBe('test');
        
        // Check text between highlights
        expect(div.childNodes[1].textContent).toBe(' another ');
        
        // Check second highlight
        const secondSpan = div.childNodes[2] as HTMLSpanElement;
        expect(secondSpan.tagName).toBe('SPAN');
        expect(secondSpan.textContent).toBe('test');
    });
    
    it('should correctly handle multiple search words with || separator', () => {
        // Mock for getValue returning multiple words with separator
        setReturnValue(mockFilter.getValue as Mock, 'apple || banana');
        
        // Call highlightText directly through private method
        const result = (filterWidget as any).highlightText('I have an apple and a banana');
        
        // Check result type
        expect(result instanceof HTMLElement).toBe(true);
        
        // Check content
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
    
    it('should highlight entire cell if content fully matches the filter', () => {
        // Mock for getValue returning the full cell value
        setReturnValue(mockFilter.getValue as Mock, 'exact match');
        
        // Call highlightText directly through private method
        const result = (filterWidget as any).highlightText('exact match');
        
        // Should return one span highlighting all content
        expect(result instanceof HTMLSpanElement).toBe(true);
        expect((result as HTMLSpanElement).style.backgroundColor).toBe('yellow');
        expect((result as HTMLSpanElement).textContent).toBe('exact match');
    });
    
    it('should return original text if no matches', () => {
        // Mock for getValue returning word that is not in text
        setReturnValue(mockFilter.getValue as Mock, 'missing');
        
        // Call highlightText directly through private method
        const result = (filterWidget as any).highlightText('This is a test string');
        
        // Should return original string
        expect(result).toBe('This is a test string');
    });
    
    it('should return original text if filter is empty', () => {
        // Mock for getValue returning empty string
        setReturnValue(mockFilter.getValue as Mock, '');
        
        // Call highlightText directly through private method
        const result = (filterWidget as any).highlightText('This is a test string');
        
        // Should return original string
        expect(result).toBe('This is a test string');
    });
    
    it('should use custom renderer for string cells', () => {
        // Create mocks for renderer parameters
        const column: GridColumn = {
            dataColumn: { id: 'name' },
            type: 'string'
        } as GridColumn;
        const cellElement = document.createElement('div');
        const rowElement = document.createElement('tr');
        
        // Get custom renderer for strings
        const stringRendererCall = (mockCellRendererStore.setDefaultRenderer as Mock).mock.calls[0];
        const customStringRenderer = stringRendererCall[1];
        
        // Mock for getValue, so that strings are highlighted
        setReturnValue(mockFilter.getValue as Mock, 'test');
        
        // Call custom renderer
        customStringRenderer('This is a test', column, cellElement, rowElement);
        
        // Check that cell contains highlighted text
        expect(cellElement.innerHTML).not.toBe('');
        expect(cellElement.querySelector('span[style*="yellow"]')).toBeDefined();
    });
    
    it('should use custom renderer for numeric cells', () => {
        // Create mocks for renderer parameters
        const column: GridColumn = {
            dataColumn: { id: 'value' },
            type: 'number'
        } as GridColumn;
        const cellElement = document.createElement('div');
        const rowElement = document.createElement('tr');
        
        // Get custom renderer for numbers
        const numberRendererCall = (mockCellRendererStore.setDefaultRenderer as Mock).mock.calls[1];
        const customNumberRenderer = numberRendererCall[1];
        
        // Mock for getValue to make numbers highlighted
        setReturnValue(mockFilter.getValue as Mock, '42');
        
        // Mock for toLocaleString
        Number.prototype.toLocaleString = function() { return this.toString(); };
        
        // Call custom renderer
        customNumberRenderer(42, column, cellElement, rowElement);
        
        // Check that cell contains highlighted text
        expect(cellElement.innerHTML).not.toBe('');
        expect(cellElement.querySelector('span[style*="yellow"]')).toBeDefined();
    });
});
