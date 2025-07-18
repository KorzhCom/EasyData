import { repeatString, reverseString, strEndsWith, combinePath } from '../src/utils/string_utils';

describe('String Utils', () => {
    it('должен правильно повторять строку указанное количество раз', () => {
        expect(repeatString('a', 3)).toBe('aaa');
        expect(repeatString('abc', 2)).toBe('abcabc');
        expect(repeatString('x', 0)).toBe('');
        expect(repeatString('', 5)).toBe('');
    });

    it('должен правильно переворачивать строку', () => {
        expect(reverseString('abc')).toBe('cba');
        expect(reverseString('hello')).toBe('olleh');
        expect(reverseString('')).toBe('');
        expect(reverseString('a')).toBe('a');
        expect(reverseString('12345')).toBe('54321');
    });

    it('должен правильно проверять, заканчивается ли строка указанным символом', () => {
        expect(strEndsWith('test.js', '.js')).toBe(true);
        expect(strEndsWith('hello world', 'world')).toBe(true);
        expect(strEndsWith('file.txt', '.doc')).toBe(false);
        expect(strEndsWith('', '')).toBe(true);
        expect(strEndsWith('a', 'ab')).toBe(false);
        expect(strEndsWith('abc', '')).toBe(true);
    });

    it('должен корректно обрабатывать случай, когда strEndsWith получает null или undefined', () => {
        expect(strEndsWith(null as any, '.js')).toBe(false);
        expect(strEndsWith(undefined as any, '.txt')).toBe(false);
    });

    it('должен корректно объединять пути', () => {
        expect(combinePath('path/to', 'file')).toBe('path/to/file');
        expect(combinePath('path/to/', 'file')).toBe('path/to/file');
        expect(combinePath('', 'file')).toBe('file');
        expect(combinePath(null as any, 'file')).toBe('file');
        expect(combinePath('path', '')).toBe('path/');
    });

    it('должен корректно обрабатывать различные сценарии объединения путей', () => {
        expect(combinePath('root', 'path/to/file')).toBe('root/path/to/file');
        expect(combinePath('/api', '/data')).toBe('/api/data');
        expect(combinePath('http://example.com', 'api')).toBe('http://example.com/api');
        expect(combinePath('/', 'index.html')).toBe('/index.html');
        expect(combinePath('/root/', '/path/')).toBe('/root//path/');
    });
});
