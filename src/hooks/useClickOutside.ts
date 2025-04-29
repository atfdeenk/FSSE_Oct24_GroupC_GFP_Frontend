import { useEffect } from "react";

/**
 * Calls the provided callback when a click occurs outside the referenced element.
 * @param ref - React ref object to the element to detect outside clicks for
 * @param callback - Function to call on outside click
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(ref: React.RefObject<T | null>, callback: (event: MouseEvent) => void) {
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback(event);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, [ref, callback]);
}
