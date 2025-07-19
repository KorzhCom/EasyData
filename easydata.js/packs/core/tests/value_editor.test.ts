import { expect } from "@olton/latte";

import { ValueEditor } from '../src/meta/value_editor';
import { ValueEditorDTO } from '../src/meta/dto/value_editor_dto';
import { EditorTag } from '../src/types/editor_tag';
import { DataType } from '../src/types/data_type';

describe('ValueEditor', () => {
    it('should be created with correct default values', () => {
        const editor = new ValueEditor();
        
        expect(editor.id).toBe('');
        expect(editor.tag).toBe(EditorTag.Unknown);
        expect(editor.resType).toBe(DataType.Unknown);
        expect(editor.defValue).toBe('');
        expect(editor.name).toBeUndefined();
        expect(editor.statement).toBeUndefined();
        expect(editor.accept).toBeUndefined();
        expect(editor.multiline).toBeUndefined();
        expect(editor.values).toBeUndefined();
        expect(editor.extraParams).toBeUndefined();
        expect(editor.processValues).toBeUndefined();
    });
    
    it('should load required data from DTO', () => {
        const editor = new ValueEditor();
        const dto: ValueEditorDTO = {
            id: 'test-editor',
            tag: EditorTag.Edit,
            rtype: DataType.String,
            defval: 'default'
        };
        
        editor.loadFromData(dto);
        
        expect(editor.id).toBe('test-editor');
        expect(editor.tag).toBe(EditorTag.Edit);
        expect(editor.resType).toBe(DataType.String);
        expect(editor.defValue).toBe('default');
    });
    
    it('should load all data from DTO', () => {
        const editor = new ValueEditor();
        const dto: ValueEditorDTO = {
            id: 'test-editor',
            tag: EditorTag.MultipleChoice,
            rtype: DataType.String,
            subType: DataType.Int32,
            defval: 'default',
            name: 'Test Editor',
            accept: '.txt,.pdf',
            multiline: true,
            values: [
                { id: '1', text: 'Option 1' },
                { id: '2', text: 'Option 2' }
            ]
        };
        
        editor.loadFromData(dto);
        
        expect(editor.id).toBe('test-editor');
        expect(editor.tag).toBe(EditorTag.MultipleChoice);
        // subType should override rtype
        expect(editor.resType).toBe(DataType.Int32);
        expect(editor.defValue).toBe('default');
        expect(editor.name).toBe('Test Editor');
        expect(editor.accept).toBe('.txt,.pdf');
        expect(editor.multiline).toBe(true);
        expect(editor.values).toBeArrayEqual([
            { id: '1', text: 'Option 1' },
            { id: '2', text: 'Option 2' }
        ]);
    });
    
    it('should return an empty string for getValueText when there are no values', () => {
        const editor = new ValueEditor();
        editor.id = 'test-editor';
        
        const result = editor.getValueText('1');
        expect(result).toBe('');
    });
    
    it('should return text for a string value through getValueText', () => {
        const editor = new ValueEditor();
        editor.values = [
            { id: '1', text: 'Option 1' },
            { id: '2', text: 'Option 2' },
            { id: '3', text: 'Option 3' }
        ];
        
        const result = editor.getValueText('2');
        expect(result).toBe('Option 2');
    });
    
    it('should return an empty string for a non-existent value through getValueText', () => {
        const editor = new ValueEditor();
        editor.values = [
            { id: '1', text: 'Option 1' },
            { id: '2', text: 'Option 2' }
        ];
        
        const result = editor.getValueText('4');
        expect(result).toBe('');
    });
    
    it('should concatenate texts for an array of values through getValueText', () => {
        const editor = new ValueEditor();
        editor.values = [
            { id: '1', text: 'Option 1' },
            { id: '2', text: 'Option 2' },
            { id: '3', text: 'Option 3' }
        ];
        
        const result = editor.getValueText(['1', '3']);
        expect(result).toBe('Option 1,Option 3');
    });
    
    it('should return only found texts for an array of values through getValueText', () => {
        const editor = new ValueEditor();
        editor.values = [
            { id: '1', text: 'Option 1' },
            { id: '2', text: 'Option 2' },
            { id: '3', text: 'Option 3' }
        ];
        
        const result = editor.getValueText(['1', '4', '3']);
        expect(result).toBe('Option 1,Option 3');
    });
    
    it('should handle the case when values is an empty array', () => {
        const editor = new ValueEditor();
        editor.values = [];
        
        const result1 = editor.getValueText('1');
        expect(result1).toBe('');
        
        const result2 = editor.getValueText(['1', '2']);
        expect(result2).toBe('');
    });
    
    it('should load data even if DTO is incomplete', () => {
        const editor = new ValueEditor();
        const incompleteDTO = {
            id: 'test-editor'
        } as ValueEditorDTO;
        
        editor.loadFromData(incompleteDTO);
        
        expect(editor.id).toBe('test-editor');
        // Other properties should remain with default values
        expect(editor.tag).toBe(EditorTag.Unknown);
        expect(editor.resType).toBe(DataType.Unknown);
        expect(editor.defValue).toBe('');
    });
    
    it('should not change current values if DTO is null or undefined', () => {
        const editor = new ValueEditor();
        editor.id = 'existing-id';
        editor.tag = EditorTag.Edit;
        
        // Pass undefined
        editor.loadFromData(undefined as any);
        
        expect(editor.id).toBe('existing-id');
        expect(editor.tag).toBe(EditorTag.Edit);
        
        // Pass null
        editor.loadFromData(null as any);
        
        expect(editor.id).toBe('existing-id');
        expect(editor.tag).toBe(EditorTag.Edit);
    });
});
