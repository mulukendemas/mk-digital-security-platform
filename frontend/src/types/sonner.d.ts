declare module 'sonner' {
  export const toast: {
    success: (message: string) => void;
    error: (message: string) => void;
    // Add other toast methods you need
  };
}