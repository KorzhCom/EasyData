import { EasyGuid } from '../src/utils/easy_guid';

describe('EasyGuid', () => {
    it('should generate string in GUID format', () => {
        const guid = EasyGuid.newGuid();
        
        // Check that returned value is a string
        expect(typeof guid).toBe('string');
        
        // Check GUID length (should be 36 characters including dashes)
        expect(guid.length).toBe(36);
        
        // Check GUID format using regular expression
        // Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx, where y is 8, 9, a or b
        const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        expect(guidRegex.test(guid)).toBe(true);
        
        // Check that the 4th character in the third group is 4 (GUID version)
        expect(guid.charAt(14)).toBe('4');
    });
    
    it('should generate unique GUIDs on each call', () => {
        const guidCount = 1000; // Check on large number of GUIDs
        const guidSet = new Set<string>();
        
        for (let i = 0; i < guidCount; i++) {
            guidSet.add(EasyGuid.newGuid());
        }
        
        // If all GUIDs are unique, Set size should equal guidCount
        expect(guidSet.size).toBe(guidCount);
    });
    
    it('should generate GUIDs with correct dash positions', () => {
        const guid = EasyGuid.newGuid();
        
        // Check dash positions
        expect(guid.charAt(8)).toBe('-');
        expect(guid.charAt(13)).toBe('-');
        expect(guid.charAt(18)).toBe('-');
        expect(guid.charAt(23)).toBe('-');
    });
    
    it('should generate GUIDs with correct value in first digit of third group', () => {
        // According to GUID specification, first digit of third group should be 8, 9, A or B
        const allowedChars = ['8', '9', 'a', 'b', 'A', 'B'];
        
        for (let i = 0; i < 100; i++) {
            const guid = EasyGuid.newGuid();
            const thirdGroupFirstChar = guid.charAt(19);
            
            expect(allowedChars.includes(thirdGroupFirstChar)).toBe(true);
        }
    });
});
