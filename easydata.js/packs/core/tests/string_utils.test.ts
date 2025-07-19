import { repeatString, reverseString, strEndsWith, combinePath } from '../src/utils/string_utils';

describe('String Utils', () => {
    it('should correctly repeat string specified number of times', () => {
        expect(repeatString('a', 3)).toBe('aaa');
        expect(repeatString('abc', 2)).toBe('abcabc');
        expect(repeatString('x', 0)).toBe('');
        expect(repeatString('', 5)).toBe('');
    });

    it('should correctly reverse string', () => {
        expect(reverseString('abc')).toBe('cba');
        expect(reverseString('hello')).toBe('olleh');
        expect(reverseString('')).toBe('');
        expect(reverseString('a')).toBe('a');
        expect(reverseString('12345')).toBe('54321');
    });

    it('should correctly check if string ends with specified character', () => {
        expect(strEndsWith('test.js', '.js')).toBe(true);
        expect(strEndsWith('hello world', 'world')).toBe(true);
        expect(strEndsWith('file.txt', '.doc')).toBe(false);
        expect(strEndsWith('', '')).toBe(true);
        expect(strEndsWith('a', 'ab')).toBe(false);
        expect(strEndsWith('abc', '')).toBe(true);
    });

    it('should correctly handle case when strEndsWith receives null or undefined', () => {
        expect(strEndsWith(null as any, '.js')).toBe(false);
        expect(strEndsWith(undefined as any, '.txt')).toBe(false);
    });

    it('should correctly combine paths', () => {
        expect(combinePath('path/to', 'file')).toBe('path/to/file');
        expect(combinePath('path/to/', 'file')).toBe('path/to/file');
        expect(combinePath('', 'file')).toBe('file');
        expect(combinePath(null as any, 'file')).toBe('file');
        expect(combinePath('path', '')).toBe('path/');
    });

    it('should correctly handle various path combination scenarios', () => {
        expect(combinePath('root', 'path/to/file')).toBe('root/path/to/file');
        expect(combinePath('/api', '/data')).toBe('/api/data');
        expect(combinePath('http://example.com', 'api')).toBe('http://example.com/api');
        expect(combinePath('/', 'index.html')).toBe('/index.html');
        expect(combinePath('/root/', '/path/')).toBe('/root//path/');
    });
});
