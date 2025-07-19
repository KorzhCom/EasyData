import { DataType, i18n, MetaEntityAttr } from '@easydata/core';
import { Validator, ValidationResult } from '../src/validators/validator';
import { TypeValidator } from '../src/validators/type_validator';
import { RequiredValidator } from '../src/validators/required_validator';
import { DateTimeValidator } from '../src/validators/datetime_validator';
import * as utils from '../src/utils/utils';

describe('TypeValidator', () => {
    let validator: TypeValidator;
    let mockAttr: MetaEntityAttr;

    beforeEach(() => {
        validator = new TypeValidator();

        // Mock texts for i18n
        jest.spyOn(i18n, 'getText').mockImplementation((key: string) => {
            if (key === 'NumberError') return 'Value must be a number';
            if (key === 'IntNumberError') return 'Value must be an integer number';
            return key;
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should have name "Type"', () => {
        expect(validator.name).toBe('Type');
        expect(validator).toBeInstanceOf(Validator);
    });

    it('should successfully pass validation for null or empty string', () => {
        mockAttr = { dataType: DataType.Int32 } as MetaEntityAttr;

        const result1 = validator.validate(mockAttr, null);
        expect(result1.successed).toBe(true);
        
        const result2 = validator.validate(mockAttr, undefined);
        expect(result2.successed).toBe(true);
        
        const result3 = validator.validate(mockAttr, '');
        expect(result3.successed).toBe(true);
    });

    it('should validate numeric values for numeric type', () => {
        mockAttr = { dataType: DataType.Int32 } as MetaEntityAttr;

        // Valid values
        const result1 = validator.validate(mockAttr, '123');
        expect(result1.successed).toBe(true);
        
        const result2 = validator.validate(mockAttr, 123);
        expect(result2.successed).toBe(true);
        
        // Invalid values
        const result3 = validator.validate(mockAttr, 'abc');
        expect(result3.successed).toBe(false);
        expect(result3.messages).toBeArray();
        expect(result3.messages[0]).toBe('Value must be a number');
    });

    it('should validate decimal values for integer type', () => {
        mockAttr = { dataType: DataType.Int32 } as MetaEntityAttr;

        // Integer value
        const result1 = validator.validate(mockAttr, '123');
        expect(result1.successed).toBe(true);
        
        // Decimal value shouldn't be valid for Int32
        const result2 = validator.validate(mockAttr, '123.45');
        expect(result2.successed).toBe(false);
        expect(result2.messages).toBeArray();
        expect(result2.messages[0]).toBe('Value must be an integer number');
    });

    it('should accept decimal values for Float type', () => {
        mockAttr = { dataType: DataType.Float } as MetaEntityAttr;

        // Integer value
        const result1 = validator.validate(mockAttr, '123');
        expect(result1.successed).toBe(true);
        
        // Decimal value should be valid for Float
        const result2 = validator.validate(mockAttr, '123.45');
        expect(result2.successed).toBe(true);
        
        // String should not be valid
        const result3 = validator.validate(mockAttr, 'abc');
        expect(result3.successed).toBe(false);
        expect(result3.messages).toBeArray();
        expect(result3.messages[0]).toBe('Value must be a number');
    });

    it('should successfully pass validation for non-numeric types', () => {
        mockAttr = { dataType: DataType.String } as MetaEntityAttr;

        // Any value should be valid for string
        const result1 = validator.validate(mockAttr, '123');
        expect(result1.successed).toBe(true);
        
        const result2 = validator.validate(mockAttr, 'abc');
        expect(result2.successed).toBe(true);
    });
});

describe('RequiredValidator', () => {
    let validator: RequiredValidator;
    let mockAttr: MetaEntityAttr;

    beforeEach(() => {
        validator = new RequiredValidator();

        // Mock texts for i18n
        jest.spyOn(i18n, 'getText').mockImplementation((key: string) => {
            if (key === 'RequiredError') return 'This field is required';
            return key;
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should have name "Required"', () => {
        expect(validator.name).toBe('Required');
        expect(validator).toBeInstanceOf(Validator);
    });

    it('should pass validation for nullable attributes', () => {
        mockAttr = { isNullable: true } as MetaEntityAttr;

        const result1 = validator.validate(mockAttr, null);
        expect(result1.successed).toBe(true);
        
        const result2 = validator.validate(mockAttr, undefined);
        expect(result2.successed).toBe(true);
        
        const result3 = validator.validate(mockAttr, '');
        expect(result3.successed).toBe(true);
    });

    it('should validate required fields', () => {
        mockAttr = { isNullable: false } as MetaEntityAttr;

        // Shouldn't be valid for null, undefined or empty string
        const result1 = validator.validate(mockAttr, null);
        expect(result1.successed).toBe(false);
        expect(result1.messages).toBeArray();
        expect(result1.messages[0]).toBe('This field is required');
        
        const result2 = validator.validate(mockAttr, undefined);
        expect(result2.successed).toBe(false);
        expect(result2.messages).toBeArray();
        expect(result2.messages[0]).toBe('This field is required');
        
        const result3 = validator.validate(mockAttr, '');
        expect(result3.successed).toBe(false);
        expect(result3.messages).toBeArray();
        expect(result3.messages[0]).toBe('This field is required');
        
        // Should be valid for non-empty values
        const result4 = validator.validate(mockAttr, 'some value');
        expect(result4.successed).toBe(true);
        
        const result5 = validator.validate(mockAttr, 0);
        expect(result5.successed).toBe(true);
        
        const result6 = validator.validate(mockAttr, false);
        expect(result6.successed).toBe(true);
    });
});

describe('DateTimeValidator', () => {
    let validator: DateTimeValidator;
    let mockAttr: MetaEntityAttr;

    beforeEach(() => {
        validator = new DateTimeValidator();

        // Mock texts for i18n
        jest.spyOn(i18n, 'getText').mockImplementation((key: string) => {
            if (key === 'DateTimeError') return 'Invalid date format';
            return key;
        });
        
        // Mock for getEditDateTimeFormat
        jest.spyOn(utils, 'getEditDateTimeFormat').mockImplementation((dataType: DataType) => {
            if (dataType === DataType.Date) return 'dd.MM.yyyy';
            if (dataType === DataType.Time) return 'HH:mm';
            if (dataType === DataType.DateTime) return 'dd.MM.yyyy HH:mm';
            return '';
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should have name "DateTime"', () => {
        expect(validator.name).toBe('DateTime');
        expect(validator).toBeInstanceOf(Validator);
    });

    it('should successfully pass validation for null or empty string', () => {
        mockAttr = { dataType: DataType.Date } as MetaEntityAttr;

        const result1 = validator.validate(mockAttr, null);
        expect(result1.successed).toBe(true);
        
        const result2 = validator.validate(mockAttr, undefined);
        expect(result2.successed).toBe(true);
        
        const result3 = validator.validate(mockAttr, '');
        expect(result3.successed).toBe(true);
    });

    it('should validate date format', () => {
        mockAttr = { dataType: DataType.Date } as MetaEntityAttr;

        // Correct format
        const result1 = validator.validate(mockAttr, '15.03.2023');
        expect(result1.successed).toBe(true);
        
        // Incorrect format
        const result2 = validator.validate(mockAttr, '2023/03/15');
        expect(result2.successed).toBe(false);
        expect(result2.messages).toBeArray();
        expect(result2.messages[0]).toBe('Invalid date format');
        
        // Invalid value
        const result3 = validator.validate(mockAttr, '32.13.2023');
        expect(result3.successed).toBe(false);
        expect(result3.messages).toBeArray();
        expect(result3.messages[0]).toBe('Invalid date format');
    });

    it('should validate time format', () => {
        mockAttr = { dataType: DataType.Time } as MetaEntityAttr;

        // Correct format
        const result1 = validator.validate(mockAttr, '14:30');
        expect(result1.successed).toBe(true);
        
        // Incorrect format
        const result2 = validator.validate(mockAttr, '14.30');
        expect(result2.successed).toBe(false);
        expect(result2.messages).toBeArray();
        expect(result2.messages[0]).toBe('Invalid date format');
        
        // Invalid value
        const result3 = validator.validate(mockAttr, '25:70');
        expect(result3.successed).toBe(false);
        expect(result3.messages).toBeArray();
        expect(result3.messages[0]).toBe('Invalid date format');
    });

    it('should validate datetime format', () => {
        mockAttr = { dataType: DataType.DateTime } as MetaEntityAttr;

        // Correct format
        const result1 = validator.validate(mockAttr, '15.03.2023 14:30');
        expect(result1.successed).toBe(true);
        
        // Incorrect format
        const result2 = validator.validate(mockAttr, '2023-03-15 14:30');
        expect(result2.successed).toBe(false);
        expect(result2.messages).toBeArray();
        expect(result2.messages[0]).toBe('Invalid date format');
    });

    it('should successfully pass validation for non-date types', () => {
        mockAttr = { dataType: DataType.String } as MetaEntityAttr;

        // Any value should be valid for string
        const result1 = validator.validate(mockAttr, '15.03.2023');
        expect(result1.successed).toBe(true);
        
        const result2 = validator.validate(mockAttr, 'invalid date');
        expect(result2.successed).toBe(true);
    });
});
