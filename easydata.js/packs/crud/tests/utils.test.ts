import { DataType, i18n } from '@easydata/core';
import { getInternalDateTimeFormat, getEditDateTimeFormat, setLocation } from '../src/utils/utils';
import { Mock, restoreAllMocks, setReturnValue, spyOn } from './helpers/mocks';

describe('Utils', () => {
    // Original i18n settings
    let originalSettings: any;

    // Path passed to the last pushState call
    const lastPushedPath = () => (window.history.pushState as Mock).mock.calls.at(-1)[2];
    
    beforeEach(() => {
        // Save original i18n settings
        originalSettings = i18n.getLocaleSettings();
        
        // Create mock for i18n.getLocaleSettings
        spyOn(i18n, 'getLocaleSettings').mockReturnValue({
            ...originalSettings,
            editDateFormat: 'dd.MM.yyyy',
            editTimeFormat: 'HH:mm',
        });
        
        // Create mocks for window.history
        spyOn(window.history, 'pushState').mockImplementation(() => {});
        spyOn(window, 'dispatchEvent').mockImplementation(() => true);
    });
    
    afterEach(() => {
        // Restore original objects and functions
        restoreAllMocks();
    });
    
    it('should return correct internal format for Date', () => {
        const format = getInternalDateTimeFormat(DataType.Date);
        expect(format).toBe('yyyy-MM-dd');
    });
    
    it('should return correct internal format for Time', () => {
        const format = getInternalDateTimeFormat(DataType.Time);
        expect(format).toBe('HH:mm');
    });
    
    it('should return correct internal format for DateTime', () => {
        const format = getInternalDateTimeFormat(DataType.DateTime);
        expect(format).toBe('yyyy-MM-ddTHH:mm');
    });
    
    it('should return edit format from locale settings for Date', () => {
        const format = getEditDateTimeFormat(DataType.Date);
        expect(format).toBe('dd.MM.yyyy');
    });
    
    it('should return edit format from locale settings for Time', () => {
        const format = getEditDateTimeFormat(DataType.Time);
        expect(format).toBe('HH:mm');
    });
    
    it('should return edit format from locale settings for DateTime', () => {
        const format = getEditDateTimeFormat(DataType.DateTime);
        expect(format).toBe('dd.MM.yyyy HH:mm');
    });
    
    it('should change location via pushState and generate event', () => {
        // Set initial state value
        const mockState = { test: 'state' };
        window.history.replaceState(mockState, ''); // history.state is read-only
        document.title = 'Test Title';
        
        // Call function
        setLocation('/new-path');
        
        // Check that pushState was called with correct arguments
        expect(window.history.pushState).toHaveBeenCalledWith([
            mockState,
            'Test Title',
            '/new-path'
        ]);
        
        // Check that correct event was generated
        expect(window.dispatchEvent).toHaveBeenCalled();
        const eventArg = (window.dispatchEvent as Mock).mock.calls[0][0];
        expect(eventArg).toBeInstanceOf(Event);
        expect(eventArg.type).toBe('ed_set_location');
    });
    
    it('should work with different path formats', () => {
        // Relative path
        setLocation('relative/path');
        expect(lastPushedPath()).toBe('relative/path');
        
        // Path with parameters
        setLocation('/path?param=value');
        expect(lastPushedPath()).toBe('/path?param=value');
        
        // Path with hash
        setLocation('/path#section');
        expect(lastPushedPath()).toBe('/path#section');
    });
    
    it('should use formats from i18n for editing', () => {
        // Reconfigure mock for i18n.getLocaleSettings with different formats
        setReturnValue(i18n.getLocaleSettings as Mock, {
            editDateFormat: 'MM/dd/yyyy',
            editTimeFormat: 'hh:mm a',
        });
        
        // Check updated formats
        expect(getEditDateTimeFormat(DataType.Date)).toBe('MM/dd/yyyy');
        expect(getEditDateTimeFormat(DataType.Time)).toBe('hh:mm a');
        expect(getEditDateTimeFormat(DataType.DateTime)).toBe('MM/dd/yyyy hh:mm a');
    });
});
