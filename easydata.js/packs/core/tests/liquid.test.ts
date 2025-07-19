import { liquid } from '../src/utils/liquid';

describe('liquid', () => {
    it('should replace single variable in template', () => {
        const template = 'Hello, {{name}}!';
        const vars = { name: 'World' };
        
        const result = liquid.renderLiquidTemplate(template, vars);
        
        expect(result).toBe('Hello, World!');
    });
    
    it('should replace multiple different variables', () => {
        const template = 'Hello, {{name}}! Today is {{day}}.';
        const vars = { name: 'John', day: 'Monday' };
        
        const result = liquid.renderLiquidTemplate(template, vars);
        
        expect(result).toBe('Hello, John! Today is Monday.');
    });
    
    it('should replace repeating variables', () => {
        const template = '{{name}} wrote: "Hello, {{name}}!"';
        const vars = { name: 'Alice' };
        
        const result = liquid.renderLiquidTemplate(template, vars);
        
        expect(result).toBe('Alice wrote: "Hello, Alice!"');
    });
    
    it('should correctly handle numeric values', () => {
        const template = 'The answer is {{answer}}.';
        const vars = { answer: 42 };
        
        const result = liquid.renderLiquidTemplate(template, vars);
        
        expect(result).toBe('The answer is 42.');
    });
    
    it('should ignore undefined variables', () => {
        const template = 'Hello, {{name}}! Your age is {{age}}.';
        const vars = { name: 'Bob' };
        
        const result = liquid.renderLiquidTemplate(template, vars);
        
        // Undefined variable remains as {{age}}
        expect(result).toBe('Hello, Bob! Your age is {{age}}.');
    });
    
    it('should return original template if vars is null', () => {
        const template = 'Hello, {{name}}!';
        
        const result = liquid.renderLiquidTemplate(template, null);
        
        expect(result).toBe('Hello, {{name}}!');
    });
    
    it('should return original template if vars is undefined', () => {
        const template = 'Hello, {{name}}!';
        
        const result = liquid.renderLiquidTemplate(template, undefined);
        
        expect(result).toBe('Hello, {{name}}!');
    });
    
    it('should correctly work with empty template', () => {
        const template = '';
        const vars = { name: 'World' };
        
        const result = liquid.renderLiquidTemplate(template, vars);
        
        expect(result).toBe('');
    });
    
    it('should correctly work with empty vars object', () => {
        const template = 'Hello, {{name}}!';
        const vars = {};
        
        const result = liquid.renderLiquidTemplate(template, vars);
        
        expect(result).toBe('Hello, {{name}}!');
    });
    
    it('should correctly replace with empty values', () => {
        const template = 'Name: "{{name}}"';
        const vars = { name: '' };
        
        const result = liquid.renderLiquidTemplate(template, vars);
        
        expect(result).toBe('Name: ""');
    });
    
    it('should correctly work with template without variables', () => {
        const template = 'Simple text without variables';
        const vars = { name: 'World' };
        
        const result = liquid.renderLiquidTemplate(template, vars);
        
        expect(result).toBe('Simple text without variables');
    });
    
    it('should correctly replace variables with true boolean value', () => {
        const template = 'Is active: {{isActive}}';
        const vars = { isActive: true };
        
        const result = liquid.renderLiquidTemplate(template, vars);
        
        expect(result).toBe('Is active: true');
    });
    
    it('should correctly replace variables with false boolean value', () => {
        const template = 'Is deleted: {{isDeleted}}';
        const vars = { isDeleted: false };
        
        const result = liquid.renderLiquidTemplate(template, vars);
        
        expect(result).toBe('Is deleted: false');
    });
});
