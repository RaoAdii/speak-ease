import { useEffect, useMemo, useState } from "react";
export function useAsyncData(loader, deps = []) {
    const [version, setVersion] = useState(0);
    const [state, setState] = useState({
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
            .catch((error) => {
            if (active) {
                setState({ data: null, error: error.message, loading: false });
            }
        });
        return () => {
            active = false;
        };
    }, [loader, version, ...deps]);
    return useMemo(() => ({
        ...state,
        reload: () => setVersion((current) => current + 1)
    }), [state]);
}
