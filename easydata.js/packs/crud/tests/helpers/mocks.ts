// Jest-style mocking helpers for latte, which only ships `mock()`.
//
// Two latte differences these helpers paper over:
// - latte's `mockReturnValue` queues a value for a single call, while the tests
//   expect Jest's behaviour of returning it on every call (see `setReturnValue`);
// - there is no `spyOn`, `restoreAllMocks` or fake timers.
import { mock } from '@olton/latte';

export interface Mock {
    (...args: any[]): any;
    mock: { calls: any[][]; returnValues: any[]; results: any[] };
    mockReturnValue(value: any): Mock;
    mockImplementation(impl: (...args: any[]) => any): Mock;
    mockResolvedValue(value: any): Mock;
    mockReset(): Mock;
}

const restorers: Array<() => void> = [];

/** Makes `fn` return `value` on every subsequent call, like Jest's `mockReturnValue`. */
export function setReturnValue(fn: Mock, value: any): Mock {
    fn.mock.returnValues.length = 0;
    return fn.mockImplementation(() => value);
}

/**
 * Replaces `obj[method]` with a mock that calls through to the original,
 * like `jest.spyOn`. Undone by `restoreAllMocks`.
 *
 * Note: exports of this package's own modules can't be spied on — under tsx
 * they are read-only getters — so mock what those functions call instead.
 */
export function spyOn<T extends object>(obj: T, method: keyof T & string): Mock {
    const target = obj as any;
    const original = target[method];
    const hadOwn = Object.prototype.hasOwnProperty.call(target, method);

    const spy: Mock = mock(function (this: any, ...args: any[]) {
        return original.apply(this, args);
    }, method);
    spy.mockReturnValue = (value: any) => setReturnValue(spy, value);

    target[method] = spy;
    if (target[method] !== spy) {
        throw new Error(`Cannot spy on read-only member '${method}'`);
    }

    restorers.push(() => {
        if (hadOwn) target[method] = original;
        else delete target[method];
    });
    return spy;
}

/**
 * Stubs `setLocation` from src/utils/utils, which can't be spied on directly,
 * by stubbing the `history.pushState` and `window.dispatchEvent` calls it makes.
 * Returns a mock that receives each path navigated to.
 */
export function stubSetLocation(): Mock {
    const setLocation: Mock = mock(() => {}, 'setLocation');
    const history = (globalThis as any).history ?? window.history;
    spyOn(history, 'pushState').mockImplementation(
        (_state: any, _title: string, path: string) => setLocation(path)
    );
    spyOn(window, 'dispatchEvent').mockImplementation(() => true);
    return setLocation;
}

/** Undoes every `spyOn` (latest first) and switches back to real timers. */
export function restoreAllMocks(): void {
    while (restorers.length) {
        restorers.pop()();
    }
    useRealTimers();
}

// ---- Fake timers ----
// Under latte `window` is not `globalThis` and each has its own setTimeout,
// so both are patched.

interface FakeTimer {
    at: number;
    fn: (...args: any[]) => void;
    args: any[];
}

let clock: { now: number; nextId: number; timers: Map<number, FakeTimer> } | null = null;
let realTimers: Array<[any, any, any]> | null = null;

function timerHosts(): any[] {
    return [...new Set<any>([globalThis, (globalThis as any).window].filter(Boolean))];
}

export function useFakeTimers(): void {
    if (clock) return;
    if (!realTimers) {
        realTimers = timerHosts().map(h => [h, h.setTimeout, h.clearTimeout]);
    }

    const c = clock = { now: 0, nextId: 1, timers: new Map<number, FakeTimer>() };
    for (const host of timerHosts()) {
        host.setTimeout = (fn: (...args: any[]) => void, ms = 0, ...args: any[]) => {
            const id = c.nextId++;
            c.timers.set(id, { at: c.now + ms, fn, args });
            return id;
        };
        host.clearTimeout = (id: number) => {
            c.timers.delete(id);
        };
    }
}

export function useRealTimers(): void {
    for (const [host, setTimeout, clearTimeout] of realTimers ?? []) {
        host.setTimeout = setTimeout;
        host.clearTimeout = clearTimeout;
    }
    clock = null;
}

export function advanceTimersByTime(ms: number): void {
    const c = requireClock();
    const end = c.now + ms;
    for (let next = nextDue(c.timers, end); next; next = nextDue(c.timers, end)) {
        runTimer(c, next);
    }
    c.now = end;
}

export function runAllTimers(): void {
    const c = requireClock();
    for (let count = 0; c.timers.size > 0; count++) {
        if (count >= 10000) {
            throw new Error('runAllTimers: aborting after 10000 timers');
        }
        runTimer(c, nextDue(c.timers, Infinity));
    }
}

function requireClock() {
    if (!clock) throw new Error('Fake timers are not enabled: call useFakeTimers() first');
    return clock;
}

function nextDue(timers: Map<number, FakeTimer>, limit: number): [number, FakeTimer] | undefined {
    let next: [number, FakeTimer] | undefined;
    for (const entry of timers) {
        if (entry[1].at <= limit && (!next || entry[1].at < next[1].at)) {
            next = entry;
        }
    }
    return next;
}

function runTimer(c: NonNullable<typeof clock>, [id, timer]: [number, FakeTimer]): void {
    c.timers.delete(id);
    c.now = timer.at;
    timer.fn(...timer.args);
}
