/**
 * Modified version of `useAsyncFn` so that the wrapped async function
 * can still reject with its error.
 * Hopefully we can get this change into `react-use` proper:
 * https://github.com/streamich/react-use/issues/981
 */

/* eslint-disable */
import { DependencyList, useCallback, useRef, useState } from 'react';
import { useMountedState } from 'react-use';

export type AsyncState<T> =
  | {
      loading: boolean;
      error?: undefined;
      value?: undefined;
    }
  | {
      loading: false;
      error: Error;
      value?: undefined;
    }
  | {
      loading: false;
      error?: undefined;
      value: T;
    };

export type AsyncFn<Result = any, Args extends any[] = any[]> = [
  AsyncState<Result>,
  (...args: Args | []) => Promise<Result>,
];

export default function useAsyncFnThrowing<
  Result = any,
  Args extends any[] = any[]
>(
  fn: (...args: Args | []) => Promise<Result>,
  deps: DependencyList = [],
  initialState: AsyncState<Result> = { loading: false },
): AsyncFn<Result, Args> {
  const lastCallId = useRef(0);
  const [state, set] = useState<AsyncState<Result>>(initialState);

  const isMounted = useMountedState();

  const callback = useCallback((...args: Args | []) => {
    const callId = ++lastCallId.current;
    set({ loading: true });

    return fn(...args).then(
      (value) => {
        isMounted() &&
          callId === lastCallId.current &&
          set({ value, loading: false });

        return value;
      },
      (error) => {
        isMounted() &&
          callId === lastCallId.current &&
          set({ error, loading: false });

        // Throw the error instead of returning it:
        // return value
        throw error;
      },
    );
  }, deps);

  return [state, callback];
}
