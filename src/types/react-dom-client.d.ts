// Minimal ambient declaration to satisfy TypeScript when @types/react-dom is not installed.
// This file prevents the "Could not find a declaration file for module 'react-dom/client'" error.
declare module 'react-dom/client' {
  export function createRoot(container: any): {
    render(element: any): void;
    unmount(): void;
  };
}
