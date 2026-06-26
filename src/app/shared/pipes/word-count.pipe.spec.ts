import { describe, expect, it } from '@jest/globals';
import { WordCountPipe } from './word-count.pipe';

describe('WordCountPipe', () => {
    let pipe: WordCountPipe;

    beforeEach(() => {
        pipe = new WordCountPipe();
    });

    it('should return 2 for "Hello world"', () => {
        expect(pipe.transform('Hello world')).toBe(2);
    });

    it('should return 0 for empty string', () => {
        expect(pipe.transform('')).toBe(0);
    });

    it('should return 0 for null', () => {
        expect(pipe.transform(null)).toBe(0);
    });

    it('should return 0 for white space only', () => {
        expect(pipe.transform('    ')).toBe(0);
    });

    it('should return 2 for "Hello      world"', () => {
        expect(pipe.transform('Hello      world')).toBe(2);
    });
});