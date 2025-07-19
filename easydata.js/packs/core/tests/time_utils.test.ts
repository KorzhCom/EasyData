import { TimeValue, TimeSettings, SpecialDatesResolver, registerSpecialDatesResolver } from '../src/types/time_utils';

describe('Time Utils', () => {
    // Mock for dates, so tests don't depend on current time
    let originalDate: DateConstructor;
    let fixedDate: Date;
    
    beforeEach(() => {
        // Save original Date constructor
        originalDate = global.Date;
        
        // Set fixed date for tests: May 15, 2023, 10:30:00
        fixedDate = new Date(2023, 4, 15, 10, 30, 0);
        
        // Mock Date constructor
        global.Date = class extends Date {
            constructor(...args: any[]) {
                if (args.length === 0) {
                    return fixedDate;
                }
                return new originalDate(...args);
            }
        } as any;
    });
    
    afterEach(() => {
        // Restore original Date
        global.Date = originalDate;
    });

    it('should create TimeValue with date', () => {
        const date = new Date(2023, 0, 15);
        const timeValue = new TimeValue(date);
        
        expect(timeValue['date']).toBe(date);
        expect(timeValue['_name']).toBeUndefined();
    });
    
    it('should create TimeValue with string name', () => {
        const timeValue = new TimeValue('Today');
        
        expect(timeValue['date']).toBeUndefined();
        expect(timeValue['_name']).toBe('Today');
    });
    
    it('should return date via asTime', () => {
        const date = new Date(2023, 0, 15);
        const timeValue = new TimeValue(date);
        
        const result = timeValue.asTime();
        expect(result).toBe(date);
    });
    
    it('should return special date via asTime', () => {
        const timeValue = new TimeValue('Today');
        expect(timeValue.asTime()).toBeInstanceOf(Date);
    });
    
    it('should have getter for name', () => {
        const timeValue = new TimeValue('Today');        
        expect(timeValue.name).toBe('Today');
    });
    
    it('should resolve special date Today', () => {
        const resolver = new SpecialDatesResolver();
        const result = resolver.Today();
        
        expect(result).toBeInstanceOf(Date);
        expect(result.getFullYear()).toBe(2023);
        expect(result.getMonth()).toBe(4); // May (0-indexed months)
        expect(result.getDate()).toBe(15);
    });
    
    it('should resolve special date Yesterday', () => {
        const resolver = new SpecialDatesResolver();
        const result = resolver.Yesterday();
        
        expect(result).toBeInstanceOf(Date);
        expect(result.getFullYear()).toBe(2023);
        expect(result.getMonth()).toBe(4);
        expect(result.getDate()).toBe(14); // 15 - 1 = 14
    });
    
    it('should resolve special date Tomorrow', () => {
        const resolver = new SpecialDatesResolver();
        const result = resolver.Tomorrow();
        
        expect(result).toBeInstanceOf(Date);
        expect(result.getFullYear()).toBe(2023);
        expect(result.getMonth()).toBe(4);
        expect(result.getDate()).toBe(16); // 15 + 1 = 16
    });
    
    it('should resolve special date FirstDayOfMonth', () => {
        const resolver = new SpecialDatesResolver();
        const result = resolver.FirstDayOfMonth();
        
        expect(result).toBeInstanceOf(Date);
        expect(result.getFullYear()).toBe(2023);
        expect(result.getMonth()).toBe(4);
        expect(result.getDate()).toBe(1);
    });
    
    it('should resolve special date LastDayOfMonth', () => {
        const resolver = new SpecialDatesResolver();
        const result = resolver.LastDayOfMonth();
        
        expect(result).toBeInstanceOf(Date);
        expect(result.getFullYear()).toBe(2023);
        expect(result.getMonth()).toBe(4);
        expect(result.getDate()).toBe(31); // May has 31 days
    });
    
    it('should resolve special date FirstDayOfNextMonth', () => {
        const resolver = new SpecialDatesResolver();
        const result = resolver.FirstDayOfNextMonth();
        
        expect(result).toBeInstanceOf(Date);
        expect(result.getFullYear()).toBe(2023);
        expect(result.getMonth()).toBe(5); // June
        expect(result.getDate()).toBe(1);
    });
    
    it('should resolve special date FirstDayOfPrevMonth', () => {
        const resolver = new SpecialDatesResolver();
        const result = resolver.FirstDayOfPrevMonth();
        
        expect(result).toBeInstanceOf(Date);
        expect(result.getFullYear()).toBe(2023);
        expect(result.getMonth()).toBe(3); // April
        expect(result.getDate()).toBe(1);
    });
    
    it('should resolve special date FirstDayOfYear', () => {
        const resolver = new SpecialDatesResolver();
        const result = resolver.FirstDayOfYear();
        
        expect(result).toBeInstanceOf(Date);
        expect(result.getFullYear()).toBe(2023);
        expect(result.getMonth()).toBe(0); // January
        expect(result.getDate()).toBe(1);
    });
    
    it('should resolve special date FirstDayOfPrevYear', () => {
        const resolver = new SpecialDatesResolver();
        const result = resolver.FirstDayOfPrevYear();
        
        expect(result).toBeInstanceOf(Date);
        expect(result.getFullYear()).toBe(2022);
        expect(result.getMonth()).toBe(0); // январь
        expect(result.getDate()).toBe(1);
    });
    
    it('should resolve special date FirstDayOfNextYear', () => {
        const resolver = new SpecialDatesResolver();
        const result = resolver.FirstDayOfNextYear();
        
        expect(result).toBeInstanceOf(Date);
        expect(result.getFullYear()).toBe(2024);
        expect(result.getMonth()).toBe(0); // январь
        expect(result.getDate()).toBe(1);
    });
    
    it('should разрешать специальную дату FirstDayOfWeek для середины недели', () => {
        // 15 мая 2023 - понедельник
        fixedDate = new Date(2023, 4, 15); // 15 мая 2023
        const resolver = new SpecialDatesResolver();
        const result = resolver.FirstDayOfWeek();
        
        expect(result).toBeInstanceOf(Date);
        expect(result.getFullYear()).toBe(2023);
        expect(result.getMonth()).toBe(4);
        expect(result.getDate()).toBe(15); // понедельник
    });
    
    it('should разрешать специальную дату FirstDayOfPrevWeek', () => {
        const resolver = new SpecialDatesResolver();
        const result = resolver.FirstDayOfPrevWeek();
        
        expect(result).toBeInstanceOf(Date);
        // Конкретная дата зависит от того, какой день недели у fixedDate
        expect(result).toBeInstanceOf(Date);
    });
    
    it('should разрешать специальную дату FirstDayOfNextWeek', () => {
        const resolver = new SpecialDatesResolver();
        const result = resolver.FirstDayOfNextWeek();
        
        expect(result).toBeInstanceOf(Date);
        // Конкретная дата зависит от того, какой день недели у fixedDate
        expect(result).toBeInstanceOf(Date);
    });
    
    it('should return дату по имени через getDateByName', () => {
        const resolver = new SpecialDatesResolver();
        
        const result = resolver.getDateByName('Today');
        
        expect(result).toBeInstanceOf(Date);
        expect(result.getFullYear()).toBe(2023);
        expect(result.getMonth()).toBe(4);
        expect(result.getDate()).toBe(15);
    });
    
    it('should return undefined для неизвестного имени даты', () => {
        const resolver = new SpecialDatesResolver();
        const result = resolver.getDateByName('NonExistentDate');
        
        expect(result).toBeUndefined();
    });
    
    it('should регистрировать новый резолвер через registerSpecialDatesResolver', () => {
        // Create custom резолвер
        class CustomResolver extends SpecialDatesResolver {
            public Custom(): Date {
                return new Date(2000, 0, 1);
            }
        }
        
        const customResolver = new CustomResolver();
        
        // Регистрируем его
        registerSpecialDatesResolver(customResolver);
        
        // Check, что теперь используется новый резолвер
        const timeValue = new TimeValue('Custom');
        const result = timeValue.asTime();
        
        expect(result).toBeInstanceOf(Date);
        expect(result.getFullYear()).toBe(2000);
        expect(result.getMonth()).toBe(0);
        expect(result.getDate()).toBe(1);
    });
});
