import { useEffect } from "react";

/**
 * Custom hook to handle input focus logic
 * @param inputRef - Reference to the input element
 * @param isLoading - Loading state that triggers focus when changed
 */
export const useInputFocus = (
  inputRef: React.RefObject<HTMLInputElement | null>,
  isLoading: boolean,
) => {
  // Focus input on component mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Keep focus on input after loading state changes
  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);
};
