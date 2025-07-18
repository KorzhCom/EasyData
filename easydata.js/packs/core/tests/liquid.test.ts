import { liquid } from '../src/utils/liquid';

describe('liquid', () => {
    it('должен заменять одну переменную в шаблоне', () => {
        const template = 'Hello, {{name}}!';
        const vars = { name: 'World' };
        
        const result = liquid.renderLiquidTemplate(template, vars);
        
        expect(result).toBe('Hello, World!');
    });
    
    it('должен заменять несколько разных переменных', () => {
        const template = 'Hello, {{name}}! Today is {{day}}.';
        const vars = { name: 'John', day: 'Monday' };
        
        const result = liquid.renderLiquidTemplate(template, vars);
        
        expect(result).toBe('Hello, John! Today is Monday.');
    });
    
    it('должен заменять повторяющиеся переменные', () => {
        const template = '{{name}} wrote: "Hello, {{name}}!"';
        const vars = { name: 'Alice' };
        
        const result = liquid.renderLiquidTemplate(template, vars);
        
        expect(result).toBe('Alice wrote: "Hello, Alice!"');
    });
    
    it('должен корректно обрабатывать числовые значения', () => {
        const template = 'The answer is {{answer}}.';
        const vars = { answer: 42 };
        
        const result = liquid.renderLiquidTemplate(template, vars);
        
        expect(result).toBe('The answer is 42.');
    });
    
    it('должен игнорировать неопределенные переменные', () => {
        const template = 'Hello, {{name}}! Your age is {{age}}.';
        const vars = { name: 'Bob' };
        
        const result = liquid.renderLiquidTemplate(template, vars);
        
        // Неопределенная переменная остается в виде {{age}}
        expect(result).toBe('Hello, Bob! Your age is {{age}}.');
    });
    
    it('должен возвращать оригинальный шаблон, если vars равен null', () => {
        const template = 'Hello, {{name}}!';
        
        const result = liquid.renderLiquidTemplate(template, null);
        
        expect(result).toBe('Hello, {{name}}!');
    });
    
    it('должен возвращать оригинальный шаблон, если vars равен undefined', () => {
        const template = 'Hello, {{name}}!';
        
        const result = liquid.renderLiquidTemplate(template, undefined);
        
        expect(result).toBe('Hello, {{name}}!');
    });
    
    it('должен корректно работать с пустым шаблоном', () => {
        const template = '';
        const vars = { name: 'World' };
        
        const result = liquid.renderLiquidTemplate(template, vars);
        
        expect(result).toBe('');
    });
    
    it('должен корректно работать с пустым объектом vars', () => {
        const template = 'Hello, {{name}}!';
        const vars = {};
        
        const result = liquid.renderLiquidTemplate(template, vars);
        
        expect(result).toBe('Hello, {{name}}!');
    });
    
    it('должен корректно заменять на пустые значения', () => {
        const template = 'Name: "{{name}}"';
        const vars = { name: '' };
        
        const result = liquid.renderLiquidTemplate(template, vars);
        
        expect(result).toBe('Name: ""');
    });
    
    it('должен корректно работать с шаблоном без переменных', () => {
        const template = 'Simple text without variables';
        const vars = { name: 'World' };
        
        const result = liquid.renderLiquidTemplate(template, vars);
        
        expect(result).toBe('Simple text without variables');
    });
    
    it('должен корректно заменять переменные с истинным логическим значением', () => {
        const template = 'Is active: {{isActive}}';
        const vars = { isActive: true };
        
        const result = liquid.renderLiquidTemplate(template, vars);
        
        expect(result).toBe('Is active: true');
    });
    
    it('должен корректно заменять переменные с ложным логическим значением', () => {
        const template = 'Is deleted: {{isDeleted}}';
        const vars = { isDeleted: false };
        
        const result = liquid.renderLiquidTemplate(template, vars);
        
        expect(result).toBe('Is deleted: false');
    });
});
