import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { isAxiosError } from "axios";
import React from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Skip retry for client errors -> 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden), 404 (Not Found), and 429 (Rate Limit Exceeded)
        const statusCode = isAxiosError(error) ? error.response?.status : null;
        if (statusCode && [400, 401, 403, 404, 429].includes(statusCode)) {
          return false;
        }

        return failureCount < 1; // Retry once (1 initial request + 1 retry -> 2 total attempts)
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
