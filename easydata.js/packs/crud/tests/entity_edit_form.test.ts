import { 
    DataType,
    MetaData,
    MetaEntity,
    MetaEntityAttr
} from '@easydata/core';

import { EntityEditForm } from '../src/form/entity_edit_form';
import { DataContext } from '../src/main/data_context';
import { ValidationResult, Validator } from '../src/validators/validator';

describe('EntityEditForm', () => {
    let form: EntityEditForm;
    let context: DataContext;
    let mockMetaData: MetaData;
    let mockEntity: MetaEntity;
    let mockFormHtml: HTMLElement;
    let mockErrorsDiv: HTMLElement;

    beforeEach(() => {
        // Создаем мок для метаданных с атрибутами
        mockMetaData = {
            getAttributeById: (id: string): MetaEntityAttr => {
                if (id === 'Person.name') {
                    return {
                        id: 'Person.name',
                        caption: 'Name',
                        dataType: DataType.String
                    } as MetaEntityAttr;
                } 
                else if (id === 'Person.age') {
                    return {
                        id: 'Person.age',
                        caption: 'Age',
                        dataType: DataType.Int32
                    } as MetaEntityAttr;
                }
                else if (id === 'Person.birthDate') {
                    return {
                        id: 'Person.birthDate',
                        caption: 'Birth Date',
                        dataType: DataType.Date
                    } as MetaEntityAttr;
                }
                else if (id === 'Person.isActive') {
                    return {
                        id: 'Person.isActive',
                        caption: 'Is Active',
                        dataType: DataType.Bool
                    } as MetaEntityAttr;
                }
                else if (id === 'Person.photo') {
                    return {
                        id: 'Person.photo',
                        caption: 'Photo',
                        dataType: DataType.Blob
                    } as MetaEntityAttr;
                }
                else if (id === 'Person.description') {
                    return {
                        id: 'Person.description',
                        caption: 'Description',
                        dataType: DataType.String
                    } as MetaEntityAttr;
                }
                return null;
            }
        } as MetaData;

        // Создаем мок для контекста данных
        context = {
            getMetaData: () => mockMetaData
        } as DataContext;

        // Создаем HTML для формы
        mockFormHtml = document.createElement('div');
        mockErrorsDiv = document.createElement('div');
        mockErrorsDiv.className = 'errors-block';
        mockFormHtml.appendChild(mockErrorsDiv);

        // Создаем форму
        form = new EntityEditForm(context);
        
        // Устанавливаем HTML через приватное свойство
        (form as any).setHtmlInt(mockFormHtml);
    });

    it('должен создаваться с контекстом данных', () => {
        expect(form).toBeDefined();
        expect((form as any).context).toBe(context);
    });

    it('должен возвращать HTML через getHtml', () => {
        const html = form.getHtml();
        expect(html).toBe(mockFormHtml);
    });

    it('должен считать форму валидной, если нет полей', () => {
        const isValid = form.validate();
        expect(isValid).toBe(true);
        expect(mockErrorsDiv.innerHTML).toBe('');
    });

    it('должен валидировать поля формы', () => {
        // Создаем тестовые поля
        const nameInput = document.createElement('input');
        nameInput.name = 'Person.name';
        nameInput.value = 'John';
        mockFormHtml.appendChild(nameInput);

        const ageInput = document.createElement('input');
        ageInput.name = 'Person.age';
        ageInput.value = '25';
        mockFormHtml.appendChild(ageInput);

        // Проверяем валидацию
        const isValid = form.validate();
        expect(isValid).toBe(true);
        expect(nameInput.classList.contains('is-valid')).toBe(true);
        expect(ageInput.classList.contains('is-valid')).toBe(true);
    });

    it('должен отображать ошибки валидации', () => {
        // Создаем пользовательский валидатор, который считает поле "age" невалидным
        const mockValidator: Validator = {
            validate: (attr: MetaEntityAttr, value: any): ValidationResult => {
                if (attr.id === 'Person.age' && parseInt(value) < 18) {
                    return {
                        successed: false,
                        messages: ['Age must be at least 18']
                    };
                }
                return {
                    successed: true,
                    messages: []
                };
            }
        };

        // Добавляем валидатор к форме
        form.useValidator(mockValidator);

        // Создаем тестовые поля
        const nameInput = document.createElement('input');
        nameInput.name = 'Person.name';
        nameInput.value = 'John';
        mockFormHtml.appendChild(nameInput);

        const ageInput = document.createElement('input');
        ageInput.name = 'Person.age';
        ageInput.value = '16'; // Невалидное значение
        mockFormHtml.appendChild(ageInput);

        // Проверяем валидацию
        const isValid = form.validate();
        expect(isValid).toBe(false);
        expect(nameInput.classList.contains('is-valid')).toBe(true);
        expect(ageInput.classList.contains('is-invalid')).toBe(true);
        
        // Проверяем, что ошибка отображается
        const errorsList = mockErrorsDiv.querySelector('ul');
        expect(errorsList).toBeDefined();
        expect(errorsList.innerHTML).toContain('Age: Age must be at least 18');
    });

    it('должен получать данные из формы через getData', async () => {
        // Создаем тестовые поля
        const nameInput = document.createElement('input');
        nameInput.name = 'Person.name';
        nameInput.value = 'John';
        mockFormHtml.appendChild(nameInput);

        const ageInput = document.createElement('input');
        ageInput.name = 'Person.age';
        ageInput.value = '25';
        mockFormHtml.appendChild(ageInput);

        const isActiveInput = document.createElement('input');
        isActiveInput.type = 'checkbox';
        isActiveInput.name = 'Person.isActive';
        isActiveInput.checked = true;
        mockFormHtml.appendChild(isActiveInput);

        // Получаем данные формы
        const data = await form.getData();
        
        // Проверяем, что получен объект с правильными данными
        expect(data).toBeObject();
        expect(data.name).toBe('John');
        expect(data.age).toBe(25); // Преобразовано в число
        expect(data.isActive).toBe(true);
    });

    it('должен обрабатывать различные типы данных в getData', async () => {
        // Создаем поля разных типов
        const nameInput = document.createElement('input');
        nameInput.name = 'Person.name';
        nameInput.value = 'John';
        mockFormHtml.appendChild(nameInput);

        const ageInput = document.createElement('input');
        ageInput.name = 'Person.age';
        ageInput.value = '25';
        mockFormHtml.appendChild(ageInput);
        
        const birthDateInput = document.createElement('input');
        birthDateInput.name = 'Person.birthDate';
        birthDateInput.value = '1995-05-15';
        mockFormHtml.appendChild(birthDateInput);
        
        const descriptionTextarea = document.createElement('textarea');
        descriptionTextarea.name = 'Person.description';
        descriptionTextarea.value = 'Some description';
        mockFormHtml.appendChild(descriptionTextarea);

        // Получаем данные формы
        const data = await form.getData();
        
        // Проверяем преобразование типов
        expect(data).toBeObject();
        expect(data.name).toBe('John');
        expect(data.age).toBe(25);
        
        // Для даты проверяем, что значение не null
        expect(data.birthDate).not.toBeNull();
        
        expect(data.description).toBe('Some description');
    });

    it('должен использовать несколько валидаторов', () => {
        // Создаем два пользовательских валидатора
        const nameValidator: Validator = {
            validate: (attr: MetaEntityAttr, value: any): ValidationResult => {
                if (attr.id === 'Person.name' && (!value || value.length < 3)) {
                    return {
                        successed: false,
                        messages: ['Name must be at least 3 characters']
                    };
                }
                return { successed: true, messages: [] };
            }
        };
        
        const ageValidator: Validator = {
            validate: (attr: MetaEntityAttr, value: any): ValidationResult => {
                if (attr.id === 'Person.age' && parseInt(value) < 18) {
                    return {
                        successed: false,
                        messages: ['Age must be at least 18']
                    };
                }
                return { successed: true, messages: [] };
            }
        };

        // Добавляем валидаторы к форме
        form.useValidators([nameValidator, ageValidator]);

        // Создаем тестовые поля с невалидными значениями
        const nameInput = document.createElement('input');
        nameInput.name = 'Person.name';
        nameInput.value = 'Jo'; // Слишком короткое имя
        mockFormHtml.appendChild(nameInput);

        const ageInput = document.createElement('input');
        ageInput.name = 'Person.age';
        ageInput.value = '16'; // Слишком малый возраст
        mockFormHtml.appendChild(ageInput);

        // Проверяем валидацию
        const isValid = form.validate();
        expect(isValid).toBe(false);
        
        // Проверяем, что ошибки от обоих валидаторов отображаются
        const errorsList = mockErrorsDiv.querySelector('ul');
        expect(errorsList.innerHTML).toContain('Name: Name must be at least 3 characters');
        expect(errorsList.innerHTML).toContain('Age: Age must be at least 18');
    });

    it('должен очищать ошибки при повторной валидации', () => {
        // Создаем пользовательский валидатор
        const mockValidator: Validator = {
            validate: (attr: MetaEntityAttr, value: any): ValidationResult => {
                if (attr.id === 'Person.age' && parseInt(value) < 18) {
                    return {
                        successed: false,
                        messages: ['Age must be at least 18']
                    };
                }
                return { successed: true, messages: [] };
            }
        };
        
        form.useValidator(mockValidator);

        // Создаем поле возраста с невалидным значением
        const ageInput = document.createElement('input');
        ageInput.name = 'Person.age';
        ageInput.value = '16';
        mockFormHtml.appendChild(ageInput);

        // Проверяем первую валидацию - должны быть ошибки
        let isValid = form.validate();
        expect(isValid).toBe(false);
        expect(ageInput.classList.contains('is-invalid')).toBe(true);
        expect(mockErrorsDiv.innerHTML).not.toBe('');

        // Меняем значение и валидируем снова
        ageInput.value = '18';
        isValid = form.validate();
        
        // Теперь должно быть валидно и ошибки должны исчезнуть
        expect(isValid).toBe(true);
        expect(ageInput.classList.contains('is-valid')).toBe(true);
        expect(ageInput.classList.contains('is-invalid')).toBe(false);
        expect(mockErrorsDiv.innerHTML).toBe('');
    });

    it('должен игнорировать чекбоксы при проверке на пустое значение', () => {
        // Создаем валидатор, который проверяет, что все поля заполнены
        const requiredValidator: Validator = {
            validate: (attr: MetaEntityAttr, value: any): ValidationResult => {
                if (!value) {
                    return {
                        successed: false,
                        messages: ['Field is required']
                    };
                }
                return { successed: true, messages: [] };
            }
        };
        
        form.useValidator(requiredValidator);

        // Создаем чекбокс и текстовое поле
        const isActiveInput = document.createElement('input');
        isActiveInput.type = 'checkbox';
        isActiveInput.name = 'Person.isActive';
        isActiveInput.checked = false; // Не выбран
        mockFormHtml.appendChild(isActiveInput);

        const nameInput = document.createElement('input');
        nameInput.name = 'Person.name';
        nameInput.value = 'John';
        mockFormHtml.appendChild(nameInput);

        // Валидация должна пройти успешно, т.к. чекбоксы игнорируются
        const isValid = form.validate();
        expect(isValid).toBe(true);
    });
});
