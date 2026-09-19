/**
 * Returns what `fn` throws, or undefined if it doesn't throw.
 * latte's toThrow() takes no expected value (its argument is the failure
 * message) and toThrowError() only reads `error.message`, while the core
 * sources throw both Error objects and plain strings.
 */
export function thrown(fn: () => void): any {
    try {
        fn();
    }
    catch (e) {
        return e;
    }
    return undefined;
}

/** Returns what `fn` throws, as text, or undefined if it doesn't throw. */
export function thrownMessage(fn: () => void): string | undefined {
    const error = thrown(fn);
    if (typeof error === 'undefined') {
        return undefined;
    }
    return error instanceof Error ? error.message : String(error);
}
