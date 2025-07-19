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
        // Create mock for metadata with attributes
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

        // Create mock for data context
        context = {
            getMetaData: () => mockMetaData
        } as DataContext;

        // Create HTML for form
        mockFormHtml = document.createElement('div');
        mockErrorsDiv = document.createElement('div');
        mockErrorsDiv.className = 'errors-block';
        mockFormHtml.appendChild(mockErrorsDiv);

        // Create form
        form = new EntityEditForm(context);
        
        // Set HTML through private property
        (form as any).setHtmlInt(mockFormHtml);
    });

    it('should be created with data context', () => {
        expect(form).toBeDefined();
        expect((form as any).context).toBe(context);
    });

    it('should return HTML through getHtml', () => {
        const html = form.getHtml();
        expect(html).toBe(mockFormHtml);
    });

    it('should consider form valid if no fields', () => {
        const isValid = form.validate();
        expect(isValid).toBe(true);
        expect(mockErrorsDiv.innerHTML).toBe('');
    });

    it('should validate form fields', () => {
        // Create test fields
        const nameInput = document.createElement('input');
        nameInput.name = 'Person.name';
        nameInput.value = 'John';
        mockFormHtml.appendChild(nameInput);

        const ageInput = document.createElement('input');
        ageInput.name = 'Person.age';
        ageInput.value = '25';
        mockFormHtml.appendChild(ageInput);

        // Check validation
        const isValid = form.validate();
        expect(isValid).toBe(true);
        expect(nameInput.classList.contains('is-valid')).toBe(true);
        expect(ageInput.classList.contains('is-valid')).toBe(true);
    });

    it('should display validation errors', () => {
        // Create custom validator that considers "age" field invalid
        const mockValidator: Validator = {
            name: 'test-validator',
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

        // Add validator to form
        form.useValidator(mockValidator);

        // Create test fields
        const nameInput = document.createElement('input');
        nameInput.name = 'Person.name';
        nameInput.value = 'John';
        mockFormHtml.appendChild(nameInput);

        const ageInput = document.createElement('input');
        ageInput.name = 'Person.age';
        ageInput.value = '16'; // Invalid value
        mockFormHtml.appendChild(ageInput);

        // Check validation
        const isValid = form.validate();
        expect(isValid).toBe(false);
        expect(nameInput.classList.contains('is-valid')).toBe(true);
        expect(ageInput.classList.contains('is-invalid')).toBe(true);
        
        // Check that error is displayed
        const errorsList = mockErrorsDiv.querySelector('ul');
        expect(errorsList).toBeDefined();
        expect(errorsList.innerHTML).toContain('Age: Age must be at least 18');
    });

    it('should get data from form through getData', async () => {
        // Create test fields
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

        // Get form data
        const data = await form.getData();
        
        // Check that we got object with correct data
        expect(data).toBeObject();
        expect(data.name).toBe('John');
        expect(data.age).toBe(25); // Converted to number
        expect(data.isActive).toBe(true);
    });

    it('should handle different data types in getData', async () => {
        // Create fields of different types
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

        // Get form data
        const data = await form.getData();
        
        // Check type conversion
        expect(data).toBeObject();
        expect(data.name).toBe('John');
        expect(data.age).toBe(25);
        
        // For date check that value is not null
        expect(data.birthDate).not.toBeNull();
        
        expect(data.description).toBe('Some description');
    });

    it('should use multiple validators', () => {
        // Create two custom validators
        const nameValidator: Validator = {
            name: 'name-validator',
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
            name: 'age-validator',
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

        // Add validators to form
        form.useValidators([nameValidator, ageValidator]);

        // Create test fields with invalid values
        const nameInput = document.createElement('input');
        nameInput.name = 'Person.name';
        nameInput.value = 'Jo'; // Name too short
        mockFormHtml.appendChild(nameInput);

        const ageInput = document.createElement('input');
        ageInput.name = 'Person.age';
        ageInput.value = '16'; // Age too low
        mockFormHtml.appendChild(ageInput);

        // Check validation
        const isValid = form.validate();
        expect(isValid).toBe(false);
        
        // Check that errors from both validators are displayed
        const errorsList = mockErrorsDiv.querySelector('ul');
        expect(errorsList.innerHTML).toContain('Name: Name must be at least 3 characters');
        expect(errorsList.innerHTML).toContain('Age: Age must be at least 18');
    });

    it('should clear errors on re-validation', () => {
        // Create custom validator
        const mockValidator: Validator = {
            name: 'age-validator',
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

        // Create age field with invalid value
        const ageInput = document.createElement('input');
        ageInput.name = 'Person.age';
        ageInput.value = '16';
        mockFormHtml.appendChild(ageInput);

        // Check first validation - should have errors
        let isValid = form.validate();
        expect(isValid).toBe(false);
        expect(ageInput.classList.contains('is-invalid')).toBe(true);
        expect(mockErrorsDiv.innerHTML).not.toBe('');

        // Change value and validate again
        ageInput.value = '18';
        isValid = form.validate();
        
        // Now should be valid and errors should disappear
        expect(isValid).toBe(true);
        expect(ageInput.classList.contains('is-valid')).toBe(true);
        expect(ageInput.classList.contains('is-invalid')).toBe(false);
        expect(mockErrorsDiv.innerHTML).toBe('');
    });

    it('should ignore checkboxes when checking for empty values', () => {
        // Create validator that checks that all fields are filled
        const requiredValidator: Validator = {
            name: 'required-validator',
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

        // Create checkbox and text field
        const isActiveInput = document.createElement('input');
        isActiveInput.type = 'checkbox';
        isActiveInput.name = 'Person.isActive';
        isActiveInput.checked = false; // Not selected
        mockFormHtml.appendChild(isActiveInput);

        const nameInput = document.createElement('input');
        nameInput.name = 'Person.name';
        nameInput.value = 'John';
        mockFormHtml.appendChild(nameInput);

        // Validation should pass successfully, because checkboxes are ignored
        const isValid = form.validate();
        expect(isValid).toBe(true);
    });
});
