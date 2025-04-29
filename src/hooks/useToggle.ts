import { useCallback, useState } from "react";

/**
 * useToggle - A simple hook for toggling boolean state.
 * Returns [value, toggle, setValue]
 */
export function useToggle(initial = false): [boolean, () => void, (v: boolean) => void] {
  const [value, setValue] = useState(!!initial);
  const toggle = useCallback(() => setValue(v => !v), []);
  return [value, toggle, setValue];
}
