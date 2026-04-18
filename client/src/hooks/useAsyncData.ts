import { DependencyList, useEffect, useMemo, useState } from "react";

type AsyncState<T> = {
  data: T | null;
  error: string | null;
  loading: boolean;
};

export function useAsyncData<T>(
  loader: () => Promise<T>,
  deps: DependencyList = []
) {
  const [version, setVersion] = useState(0);
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    loading: true
  });

  useEffect(() => {
    let active = true;

    setState((current) => ({ ...current, loading: true, error: null }));

    loader()
      .then((data) => {
        if (active) {
          setState({ data, error: null, loading: false });
        }
      })
      .catch((error: Error) => {
        if (active) {
          setState({ data: null, error: error.message, loading: false });
        }
      });

    return () => {
      active = false;
    };
  }, [loader, version, ...deps]);

  return useMemo(
    () => ({
      ...state,
      reload: () => setVersion((current) => current + 1)
    }),
    [state]
  );
}
