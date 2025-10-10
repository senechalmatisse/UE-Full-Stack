import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { get } from 'svelte/store';
import { useUnderlineAnimation } from './useUnderlineAnimation';

// Mock svelte/store
vi.mock('svelte', () => ({
    writable: (val: any) => {
        let value = val;
        const subscribers = new Set<(val: any) => void>();
        return {
            subscribe: (fn: (val: any) => void) => {
                subscribers.add(fn);
                fn(value);
                return () => subscribers.delete(fn);
            },
            set: (newVal: any) => {
                value = newVal;
                subscribers.forEach(fn => fn(value));
            },
            update: (fn: (val: any) => any) => {
                value = fn(value);
                subscribers.forEach(fn => fn(value));
            }
        };
    }
}));

describe('useUnderlineAnimation', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
        vi.clearAllTimers();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    describe('initialization', () => {
        it('shouldInitializeWithDefaultState', () => {
            // GIVEN

            // WHEN: useUnderlineAnimation is initialized
            const { underlineState } = useUnderlineAnimation();

            // THEN: The underline state should have width 0 and x 0
            const state = get(underlineState);
            expect(state).toEqual({ width: 0, x: 0 });
        });

        it('shouldAcceptCustomDefaultSelector', () => {
            // GIVEN: A custom default selector
            const customSelector = 'nav.active';

            // WHEN: useUnderlineAnimation is initialized with custom selector
            const result = useUnderlineAnimation(customSelector);

            // THEN: The result should contain the expected properties
            expect(result).toHaveProperty('underlineState');
            expect(result).toHaveProperty('updatePosition');
            expect(result).toHaveProperty('setupResizeListener');
        });

        it('shouldReturnUnderlineStateAndHelperMethods', () => {
            // GIVEN: Default initialization
            
            // WHEN: useUnderlineAnimation is called
            const result = useUnderlineAnimation();

            // THEN: The returned object should have all required properties
            expect(result).toHaveProperty('underlineState');
            expect(result).toHaveProperty('updatePosition');
            expect(result).toHaveProperty('setupResizeListener');
            expect(typeof result.updatePosition).toBe('function');
            expect(typeof result.setupResizeListener).toBe('function');
        });
    });

    describe('updatePosition - with HTMLElement', () => {
        it('shouldUpdatePositionBasedOnHTMLElement', () => {
            // GIVEN: An element with specific dimensions and position
            const element = document.createElement('a');
            element.style.width = '100px';
            element.style.position = 'absolute';
            element.style.left = '50px';
            document.body.appendChild(element);

            Object.defineProperty(element, 'offsetWidth', { value: 100, configurable: true });
            Object.defineProperty(element, 'offsetLeft', { value: 50, configurable: true });
            Object.defineProperty(element, 'offsetParent', { value: document.body, configurable: true });

            const { underlineState, updatePosition } = useUnderlineAnimation();

            // WHEN: updatePosition is called with the element
            updatePosition(element);

            // THEN: The underline state should reflect the element's dimensions
            const state = get(underlineState);
            expect(state).toEqual({ width: 100, x: 50 });
        });

        it('shouldHandleElementWithZeroDimensions', () => {
            // GIVEN: An element with zero width and offset
            const element = document.createElement('div');
            document.body.appendChild(element);

            Object.defineProperty(element, 'offsetWidth', { value: 0, configurable: true });
            Object.defineProperty(element, 'offsetLeft', { value: 0, configurable: true });
            Object.defineProperty(element, 'offsetParent', { value: document.body, configurable: true });

            const { underlineState, updatePosition } = useUnderlineAnimation();

            // WHEN: updatePosition is called with zero-dimension element
            updatePosition(element);

            // THEN: The underline state should be set to zero values
            const state = get(underlineState);
            expect(state).toEqual({ width: 0, x: 0 });
        });

        it('shouldHandleElementWithLargeOffset', () => {
            // GIVEN: An element with large offset values
            const element = document.createElement('span');
            document.body.appendChild(element);

            Object.defineProperty(element, 'offsetWidth', { value: 250, configurable: true });
            Object.defineProperty(element, 'offsetLeft', { value: 500, configurable: true });
            Object.defineProperty(element, 'offsetParent', { value: document.body, configurable: true });

            const { underlineState, updatePosition } = useUnderlineAnimation();

            // WHEN: updatePosition is called
            updatePosition(element);

            // THEN: The underline state should handle large values correctly
            const state = get(underlineState);
            expect(state).toEqual({ width: 250, x: 500 });
        });
    });

    describe('updatePosition - with selector string', () => {
        it('shouldUpdatePositionBasedOnSelector', () => {
            // GIVEN: An element matching a specific selector
            const element = document.createElement('a');
            element.className = 'nav-link';
            document.body.appendChild(element);

            Object.defineProperty(element, 'offsetWidth', { value: 120, configurable: true });
            Object.defineProperty(element, 'offsetLeft', { value: 30, configurable: true });
            Object.defineProperty(element, 'offsetParent', { value: document.body, configurable: true });

            const { underlineState, updatePosition } = useUnderlineAnimation();

            // WHEN: updatePosition is called with a selector
            updatePosition('.nav-link');

            // THEN: The underline state should match the selected element
            const state = get(underlineState);
            expect(state).toEqual({ width: 120, x: 30 });
        });

        it('shouldHandleNonExistentSelector', () => {
            // GIVEN: A composable and no matching elements in DOM
            const { underlineState, updatePosition } = useUnderlineAnimation();
            const initialState = get(underlineState);

            // WHEN: updatePosition is called with non-existent selector
            updatePosition('.does-not-exist');

            // THEN: The underline state should remain unchanged
            const state = get(underlineState);
            expect(state).toEqual(initialState);
        });

        it('shouldSelectFirstMatchingElement', () => {
            // GIVEN: Multiple elements matching the same selector
            const element1 = document.createElement('div');
            element1.className = 'item';
            const element2 = document.createElement('div');
            element2.className = 'item';

            document.body.appendChild(element1);
            document.body.appendChild(element2);

            Object.defineProperty(element1, 'offsetWidth', { value: 80, configurable: true });
            Object.defineProperty(element1, 'offsetLeft', { value: 10, configurable: true });
            Object.defineProperty(element1, 'offsetParent', { value: document.body, configurable: true });

            const { underlineState, updatePosition } = useUnderlineAnimation();

            // WHEN: updatePosition is called with a selector matching multiple elements
            updatePosition('.item');

            // THEN: The underline state should use the first matching element
            const state = get(underlineState);
            expect(state).toEqual({ width: 80, x: 10 });
        });
    });

    describe('updatePosition - with default selector', () => {
        it('shouldUseDefaultSelectorWhenNoTargetProvided', () => {
            // GIVEN: An element matching the default selector
            const element = document.createElement('a');
            element.className = 'active';
            document.body.appendChild(element);

            Object.defineProperty(element, 'offsetWidth', { value: 90, configurable: true });
            Object.defineProperty(element, 'offsetLeft', { value: 20, configurable: true });
            Object.defineProperty(element, 'offsetParent', { value: document.body, configurable: true });

            const { underlineState, updatePosition } = useUnderlineAnimation();

            // WHEN: updatePosition is called without arguments
            updatePosition();

            // THEN: The underline state should use the default 'a.active' selector
            const state = get(underlineState);
            expect(state).toEqual({ width: 90, x: 20 });
        });

        it('shouldUseCustomDefaultSelector', () => {
            // GIVEN: An element matching a custom default selector
            const customSelector = 'button.selected';
            const element = document.createElement('button');
            element.className = 'selected';
            document.body.appendChild(element);

            Object.defineProperty(element, 'offsetWidth', { value: 110, configurable: true });
            Object.defineProperty(element, 'offsetLeft', { value: 40, configurable: true });
            Object.defineProperty(element, 'offsetParent', { value: document.body, configurable: true });

            const { underlineState, updatePosition } = useUnderlineAnimation(customSelector);

            // WHEN: updatePosition is called without arguments
            updatePosition();

            // THEN: The underline state should use the custom default selector
            const state = get(underlineState);
            expect(state).toEqual({ width: 110, x: 40 });
        });
    });

    describe('updatePosition - edge cases', () => {
        it('shouldHandleElementWithoutOffsetParent', () => {
            // GIVEN: An element without offsetParent (not rendered)
            const element = document.createElement('div');
            document.body.appendChild(element);

            Object.defineProperty(element, 'offsetWidth', { value: 100, configurable: true });
            Object.defineProperty(element, 'offsetLeft', { value: 50, configurable: true });
            Object.defineProperty(element, 'offsetParent', { value: null, configurable: true });

            const { underlineState, updatePosition } = useUnderlineAnimation();
            const initialState = get(underlineState);

            // WHEN: updatePosition is called with element without offsetParent
            updatePosition(element);

            // THEN: The underline state should remain unchanged
            const state = get(underlineState);
            expect(state).toEqual(initialState);
        });

        it('shouldHandleNullTarget', () => {
            // GIVEN: A composable with no matching default selector
            const { underlineState, updatePosition } = useUnderlineAnimation('.non-existent');
            const initialState = get(underlineState);

            // WHEN: updatePosition is called without arguments
            updatePosition();

            // THEN: The underline state should remain unchanged
            const state = get(underlineState);
            expect(state).toEqual(initialState);
        });

        it('shouldUpdateMultipleTimes', () => {
            // GIVEN: Multiple elements with different dimensions
            const element1 = document.createElement('div');
            const element2 = document.createElement('span');

            document.body.appendChild(element1);
            document.body.appendChild(element2);

            Object.defineProperty(element1, 'offsetWidth', { value: 100, configurable: true });
            Object.defineProperty(element1, 'offsetLeft', { value: 0, configurable: true });
            Object.defineProperty(element1, 'offsetParent', { value: document.body, configurable: true });

            Object.defineProperty(element2, 'offsetWidth', { value: 200, configurable: true });
            Object.defineProperty(element2, 'offsetLeft', { value: 150, configurable: true });
            Object.defineProperty(element2, 'offsetParent', { value: document.body, configurable: true });

            const { underlineState, updatePosition } = useUnderlineAnimation();

            // WHEN: updatePosition is called multiple times
            updatePosition(element1);
            const firstState = get(underlineState);

            updatePosition(element2);
            const secondState = get(underlineState);

            // THEN: The underline state should update each time
            expect(firstState).toEqual({ width: 100, x: 0 });
            expect(secondState).toEqual({ width: 200, x: 150 });
        });
    });

    describe('setupResizeListener', () => {
        it('shouldCallCallbackWhenWindowIsResized', () => {
            // GIVEN: A composable and a callback function
            const { setupResizeListener } = useUnderlineAnimation();
            const mockCallback = vi.fn();

            // WHEN: A resize listener is set up and window is resized
            setupResizeListener(mockCallback);
            window.dispatchEvent(new Event('resize'));
            vi.runAllTimers();

            // THEN: The callback should be called
            expect(mockCallback).toHaveBeenCalledTimes(1);
        });

        it('shouldDebounceMultipleResizeEvents', () => {
            // GIVEN: A composable with debounce delay
            const { setupResizeListener } = useUnderlineAnimation();
            const mockCallback = vi.fn();
            const debounceDelay = 100;

            // WHEN: Multiple resize events are fired rapidly
            setupResizeListener(mockCallback, debounceDelay);
            window.dispatchEvent(new Event('resize'));
            window.dispatchEvent(new Event('resize'));
            window.dispatchEvent(new Event('resize'));

            vi.advanceTimersByTime(50);

            window.dispatchEvent(new Event('resize'));
            vi.runAllTimers();

            // THEN: The callback should only be called once after debounce
            expect(mockCallback).toHaveBeenCalledTimes(1);
        });

        it('shouldUseDefaultDebounceDelay', () => {
            // GIVEN: A composable without custom delay
            const { setupResizeListener } = useUnderlineAnimation();
            const mockCallback = vi.fn();

            // WHEN: A resize listener is set up without delay parameter
            setupResizeListener(mockCallback);
            window.dispatchEvent(new Event('resize'));

            vi.advanceTimersByTime(99);
            expect(mockCallback).not.toHaveBeenCalled();

            vi.advanceTimersByTime(1);

            // THEN: The callback should be called after default 100ms delay
            expect(mockCallback).toHaveBeenCalledTimes(1);
        });

        it('shouldUseCustomDebounceDelay', () => {
            // GIVEN: A composable with custom debounce delay
            const { setupResizeListener } = useUnderlineAnimation();
            const mockCallback = vi.fn();
            const customDelay = 250;

            // WHEN: A resize listener is set up with custom delay
            setupResizeListener(mockCallback, customDelay);
            window.dispatchEvent(new Event('resize'));

            vi.advanceTimersByTime(249);
            expect(mockCallback).not.toHaveBeenCalled();

            vi.advanceTimersByTime(1);

            // THEN: The callback should be called after custom delay
            expect(mockCallback).toHaveBeenCalledTimes(1);
        });

        it('shouldReturnCleanupFunction', () => {
            // GIVEN: A composable and a resize listener
            const { setupResizeListener } = useUnderlineAnimation();
            const mockCallback = vi.fn();

            // WHEN: A resize listener is set up
            const cleanup = setupResizeListener(mockCallback);

            // THEN: The return value should be a function
            expect(typeof cleanup).toBe('function');
        });

        it('shouldRemoveListenerWhenCleanupIsCalled', () => {
            // GIVEN: A composable with an active resize listener
            const { setupResizeListener } = useUnderlineAnimation();
            const mockCallback = vi.fn();
            const cleanup = setupResizeListener(mockCallback);

            // WHEN: The cleanup function is called
            cleanup();
            window.dispatchEvent(new Event('resize'));
            vi.runAllTimers();

            // THEN: The callback should not be called after cleanup
            expect(mockCallback).not.toHaveBeenCalled();
        });

        it('shouldClearPendingTimeoutOnNewResize', () => {
            // GIVEN: A composable with a resize listener
            const { setupResizeListener } = useUnderlineAnimation();
            const mockCallback = vi.fn();

            // WHEN: Multiple resize events trigger timer resets
            setupResizeListener(mockCallback, 100);
            window.dispatchEvent(new Event('resize'));
            vi.advanceTimersByTime(50);

            window.dispatchEvent(new Event('resize'));
            vi.advanceTimersByTime(50);
            expect(mockCallback).not.toHaveBeenCalled();

            vi.advanceTimersByTime(50);

            // THEN: The callback should only be called once after final debounce
            expect(mockCallback).toHaveBeenCalledTimes(1);
        });

        it('shouldHandleMultipleListeners', () => {
            // GIVEN: A composable with multiple resize listeners
            const { setupResizeListener } = useUnderlineAnimation();
            const mockCallback1 = vi.fn();
            const mockCallback2 = vi.fn();

            // WHEN: Multiple listeners are set up
            setupResizeListener(mockCallback1);
            setupResizeListener(mockCallback2);
            window.dispatchEvent(new Event('resize'));
            vi.runAllTimers();

            // THEN: Both callbacks should be called
            expect(mockCallback1).toHaveBeenCalledTimes(1);
            expect(mockCallback2).toHaveBeenCalledTimes(1);
        });

        it('shouldOnlyRemoveSpecificListenerOnCleanup', () => {
            // GIVEN: Multiple resize listeners
            const { setupResizeListener } = useUnderlineAnimation();
            const mockCallback1 = vi.fn();
            const mockCallback2 = vi.fn();

            const cleanup1 = setupResizeListener(mockCallback1);
            setupResizeListener(mockCallback2);

            // WHEN: One listener is cleaned up
            cleanup1();
            window.dispatchEvent(new Event('resize'));
            vi.runAllTimers();

            // THEN: Only the remaining listener should be called
            expect(mockCallback1).not.toHaveBeenCalled();
            expect(mockCallback2).toHaveBeenCalledTimes(1);
        });
    });

    describe('integration scenarios', () => {
        it('shouldUpdatePositionAndSetupListener', () => {
            // GIVEN: An element and a resize callback
            const element = document.createElement('a');
            element.className = 'active';
            document.body.appendChild(element);

            Object.defineProperty(element, 'offsetWidth', { value: 100, configurable: true });
            Object.defineProperty(element, 'offsetLeft', { value: 50, configurable: true });
            Object.defineProperty(element, 'offsetParent', { value: document.body, configurable: true });

            const { underlineState, updatePosition, setupResizeListener } = useUnderlineAnimation();

            // WHEN: Position is updated and resize listener is set up
            updatePosition(element);
            const resizeCallback = vi.fn(() => updatePosition(element));
            setupResizeListener(resizeCallback);

            const initialState = get(underlineState);

            window.dispatchEvent(new Event('resize'));
            vi.runAllTimers();

            // THEN: The state should be set and resize should trigger callback
            expect(initialState).toEqual({ width: 100, x: 50 });
            expect(resizeCallback).toHaveBeenCalledTimes(1);
        });

        it('shouldHandleCompleteNavigationScenario', () => {
            // GIVEN: Multiple navigation links
            const link1 = document.createElement('a');
            link1.className = 'nav-link active';
            link1.id = 'link1';
            const link2 = document.createElement('a');
            link2.className = 'nav-link';
            link2.id = 'link2';

            document.body.appendChild(link1);
            document.body.appendChild(link2);

            Object.defineProperty(link1, 'offsetWidth', { value: 80, configurable: true });
            Object.defineProperty(link1, 'offsetLeft', { value: 0, configurable: true });
            Object.defineProperty(link1, 'offsetParent', { value: document.body, configurable: true });

            Object.defineProperty(link2, 'offsetWidth', { value: 100, configurable: true });
            Object.defineProperty(link2, 'offsetLeft', { value: 100, configurable: true });
            Object.defineProperty(link2, 'offsetParent', { value: document.body, configurable: true });

            const { underlineState, updatePosition } = useUnderlineAnimation('a.nav-link.active');

            // WHEN: Navigation between links occurs
            updatePosition();
            const state1 = get(underlineState);

            // Simulate navigation - pass the element directly instead of relying on selector
            updatePosition(link2);
            const state2 = get(underlineState);

            // THEN: The underline should move between positions
            expect(state1).toEqual({ width: 80, x: 0 });
            expect(state2).toEqual({ width: 100, x: 100 });
        });
    });
});