import { EasyGuid } from '../src/utils/easy_guid';

describe('EasyGuid', () => {
    it('должен генерировать строку в формате GUID', () => {
        const guid = EasyGuid.newGuid();
        
        // Проверяем, что возвращаемое значение - строка
        expect(typeof guid).toBe('string');
        
        // Проверяем длину GUID (должна быть 36 символов включая дефисы)
        expect(guid.length).toBe(36);
        
        // Проверяем формат GUID с помощью регулярного выражения
        // Формат: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx, где y - это 8, 9, a или b
        const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        expect(guidRegex.test(guid)).toBe(true);
        
        // Проверяем, что 4-й символ в третьей группе - это 4 (версия GUID)
        expect(guid.charAt(14)).toBe('4');
    });
    
    it('должен генерировать уникальные GUID при каждом вызове', () => {
        const guidCount = 1000; // Проверка на большом количестве GUIDов
        const guidSet = new Set<string>();
        
        for (let i = 0; i < guidCount; i++) {
            guidSet.add(EasyGuid.newGuid());
        }
        
        // Если все GUIDы уникальны, размер Set должен равняться guidCount
        expect(guidSet.size).toBe(guidCount);
    });
    
    it('должен генерировать GUIDы с правильными позициями дефисов', () => {
        const guid = EasyGuid.newGuid();
        
        // Проверяем позиции дефисов
        expect(guid.charAt(8)).toBe('-');
        expect(guid.charAt(13)).toBe('-');
        expect(guid.charAt(18)).toBe('-');
        expect(guid.charAt(23)).toBe('-');
    });
    
    it('должен генерировать GUIDы с правильным значением в первом разряде третьей группы', () => {
        // Согласно спецификации GUID первый разряд третьей группы должен быть 8, 9, A или B
        const allowedChars = ['8', '9', 'a', 'b', 'A', 'B'];
        
        for (let i = 0; i < 100; i++) {
            const guid = EasyGuid.newGuid();
            const thirdGroupFirstChar = guid.charAt(19);
            
            expect(allowedChars.includes(thirdGroupFirstChar)).toBe(true);
        }
    });
});
