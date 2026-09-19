/**
 * Returns what `fn` throws, as text, or undefined if it doesn't throw.
 * The crud sources throw plain strings, which latte's toThrowError() can't
 * match (it reads `error.message`), and toThrow() takes no expected value.
 */
export function thrownMessage(fn: () => void): string | undefined {
    try {
        fn();
    }
    catch (e) {
        return e instanceof Error ? e.message : String(e);
    }
    return undefined;
}
