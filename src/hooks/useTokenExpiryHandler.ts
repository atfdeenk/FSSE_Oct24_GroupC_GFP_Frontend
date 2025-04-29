import { useEffect } from "react";
import { TOKEN_EXPIRED_EVENT } from "@/constants";

/**
 * Calls the provided callback when the TOKEN_EXPIRED_EVENT is received.
 */
export function useTokenExpiryHandler(onTokenExpired: (event: CustomEvent) => void) {
  useEffect(() => {
    window.addEventListener(TOKEN_EXPIRED_EVENT, onTokenExpired as EventListener);
    return () => {
      window.removeEventListener(TOKEN_EXPIRED_EVENT, onTokenExpired as EventListener);
    };
  }, [onTokenExpired]);
}
