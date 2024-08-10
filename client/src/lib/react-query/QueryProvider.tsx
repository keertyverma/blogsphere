import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { isAxiosError } from "axios";
import React from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Do not retry if rate limit is hit
        if (isAxiosError(error) && error.response?.status === 429) {
          return false;
        }
        return failureCount < 1; // Retry only twice
      },
      refetchOnReconnect: true, // Refetch on network reconnect
      refetchOnWindowFocus: false, // No need to refetch on window focus
    },
  },
});

export const QueryProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};
