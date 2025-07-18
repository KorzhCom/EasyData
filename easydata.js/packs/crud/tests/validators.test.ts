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

        // Мок текстов для i18n
        jest.spyOn(i18n, 'getText').mockImplementation((key: string) => {
            if (key === 'NumberError') return 'Value must be a number';
            if (key === 'IntNumberError') return 'Value must be an integer number';
            return key;
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('должен иметь имя "Type"', () => {
        expect(validator.name).toBe('Type');
        expect(validator).toBeInstanceOf(Validator);
    });

    it('должен успешно проходить валидацию для null или пустой строки', () => {
        mockAttr = { dataType: DataType.Int32 } as MetaEntityAttr;

        const result1 = validator.validate(mockAttr, null);
        expect(result1.successed).toBe(true);
        
        const result2 = validator.validate(mockAttr, undefined);
        expect(result2.successed).toBe(true);
        
        const result3 = validator.validate(mockAttr, '');
        expect(result3.successed).toBe(true);
    });

    it('должен проверять числовые значения для числового типа', () => {
        mockAttr = { dataType: DataType.Int32 } as MetaEntityAttr;

        // Валидные значения
        const result1 = validator.validate(mockAttr, '123');
        expect(result1.successed).toBe(true);
        
        const result2 = validator.validate(mockAttr, 123);
        expect(result2.successed).toBe(true);
        
        // Невалидные значения
        const result3 = validator.validate(mockAttr, 'abc');
        expect(result3.successed).toBe(false);
        expect(result3.messages).toBeArray();
        expect(result3.messages[0]).toBe('Value must be a number');
    });

    it('должен проверять дробные значения для целочисленного типа', () => {
        mockAttr = { dataType: DataType.Int32 } as MetaEntityAttr;

        // Целочисленное значение
        const result1 = validator.validate(mockAttr, '123');
        expect(result1.successed).toBe(true);
        
        // Дробное значение не должно быть валидным для Int32
        const result2 = validator.validate(mockAttr, '123.45');
        expect(result2.successed).toBe(false);
        expect(result2.messages).toBeArray();
        expect(result2.messages[0]).toBe('Value must be an integer number');
    });

    it('должен принимать дробные значения для типа Float', () => {
        mockAttr = { dataType: DataType.Float } as MetaEntityAttr;

        // Целочисленное значение
        const result1 = validator.validate(mockAttr, '123');
        expect(result1.successed).toBe(true);
        
        // Дробное значение должно быть валидным для Float
        const result2 = validator.validate(mockAttr, '123.45');
        expect(result2.successed).toBe(true);
        
        // Строка не должна быть валидной
        const result3 = validator.validate(mockAttr, 'abc');
        expect(result3.successed).toBe(false);
        expect(result3.messages).toBeArray();
        expect(result3.messages[0]).toBe('Value must be a number');
    });

    it('должен успешно проходить валидацию для нечисловых типов', () => {
        mockAttr = { dataType: DataType.String } as MetaEntityAttr;

        // Любое значение должно быть валидным для строки
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

        // Мок текстов для i18n
        jest.spyOn(i18n, 'getText').mockImplementation((key: string) => {
            if (key === 'RequiredError') return 'This field is required';
            return key;
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('должен иметь имя "Required"', () => {
        expect(validator.name).toBe('Required');
        expect(validator).toBeInstanceOf(Validator);
    });

    it('должен проходить валидацию для nullable атрибутов', () => {
        mockAttr = { isNullable: true } as MetaEntityAttr;

        const result1 = validator.validate(mockAttr, null);
        expect(result1.successed).toBe(true);
        
        const result2 = validator.validate(mockAttr, undefined);
        expect(result2.successed).toBe(true);
        
        const result3 = validator.validate(mockAttr, '');
        expect(result3.successed).toBe(true);
    });

    it('должен проверять обязательные поля', () => {
        mockAttr = { isNullable: false } as MetaEntityAttr;

        // Не должно быть валидным для null, undefined или пустой строки
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
        
        // Должно быть валидным для непустых значений
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

        // Мок текстов для i18n
        jest.spyOn(i18n, 'getText').mockImplementation((key: string) => {
            if (key === 'DateTimeError') return 'Invalid date format';
            return key;
        });
        
        // Мок для getEditDateTimeFormat
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

    it('должен иметь имя "DateTime"', () => {
        expect(validator.name).toBe('DateTime');
        expect(validator).toBeInstanceOf(Validator);
    });

    it('должен успешно проходить валидацию для null или пустой строки', () => {
        mockAttr = { dataType: DataType.Date } as MetaEntityAttr;

        const result1 = validator.validate(mockAttr, null);
        expect(result1.successed).toBe(true);
        
        const result2 = validator.validate(mockAttr, undefined);
        expect(result2.successed).toBe(true);
        
        const result3 = validator.validate(mockAttr, '');
        expect(result3.successed).toBe(true);
    });

    it('должен проверять формат даты', () => {
        mockAttr = { dataType: DataType.Date } as MetaEntityAttr;

        // Корректный формат
        const result1 = validator.validate(mockAttr, '15.03.2023');
        expect(result1.successed).toBe(true);
        
        // Некорректный формат
        const result2 = validator.validate(mockAttr, '2023/03/15');
        expect(result2.successed).toBe(false);
        expect(result2.messages).toBeArray();
        expect(result2.messages[0]).toBe('Invalid date format');
        
        // Некорректное значение
        const result3 = validator.validate(mockAttr, '32.13.2023');
        expect(result3.successed).toBe(false);
        expect(result3.messages).toBeArray();
        expect(result3.messages[0]).toBe('Invalid date format');
    });

    it('должен проверять формат времени', () => {
        mockAttr = { dataType: DataType.Time } as MetaEntityAttr;

        // Корректный формат
        const result1 = validator.validate(mockAttr, '14:30');
        expect(result1.successed).toBe(true);
        
        // Некорректный формат
        const result2 = validator.validate(mockAttr, '14.30');
        expect(result2.successed).toBe(false);
        expect(result2.messages).toBeArray();
        expect(result2.messages[0]).toBe('Invalid date format');
        
        // Некорректное значение
        const result3 = validator.validate(mockAttr, '25:70');
        expect(result3.successed).toBe(false);
        expect(result3.messages).toBeArray();
        expect(result3.messages[0]).toBe('Invalid date format');
    });

    it('должен проверять формат даты и времени', () => {
        mockAttr = { dataType: DataType.DateTime } as MetaEntityAttr;

        // Корректный формат
        const result1 = validator.validate(mockAttr, '15.03.2023 14:30');
        expect(result1.successed).toBe(true);
        
        // Некорректный формат
        const result2 = validator.validate(mockAttr, '2023-03-15 14:30');
        expect(result2.successed).toBe(false);
        expect(result2.messages).toBeArray();
        expect(result2.messages[0]).toBe('Invalid date format');
    });

    it('должен успешно проходить валидацию для нетиповых дат', () => {
        mockAttr = { dataType: DataType.String } as MetaEntityAttr;

        // Любое значение должно быть валидным для строки
        const result1 = validator.validate(mockAttr, '15.03.2023');
        expect(result1.successed).toBe(true);
        
        const result2 = validator.validate(mockAttr, 'неверная дата');
        expect(result2.successed).toBe(true);
    });
});
