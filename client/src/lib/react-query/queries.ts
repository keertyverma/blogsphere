import { IBlog, IBlogQuery, IFetchResponse, INewUser } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import apiClient from "../api-client";
import { QUERY_KEYS } from "./queryKeys";
import ms from "ms";

export const usePingServer = () => {
  useQuery({
    queryKey: ["ping-server"],
    queryFn: () => apiClient.get("/").then((res) => res.data),
  });
};

// ----------------- User -------------------
export const useCreateUserAccount = () =>
  useMutation({
    mutationFn: (user: INewUser) => apiClient.post("/users/register", user),
  });

export const useLogin = () =>
  useMutation({
    mutationFn: (user: { email: string; password: string }) =>
      apiClient.post("/auth", user),
  });

export const useLoginWithGoogle = () =>
  useMutation({
    mutationFn: (accessToken: string) =>
      apiClient.post("/auth/google-auth", { accessToken }),
  });

export const useUpload = () =>
  useMutation({
    mutationFn: (data: string) =>
      apiClient.post("/upload", { data }).then((res) => res.data),
  });

// ----------------- Blog -------------------
export const useCreateBlog = () =>
  useMutation({
    mutationFn: (data: { token: string; blog: object }) =>
      apiClient
        .post("/blogs", data.blog, {
          headers: {
            Authorization: `Bearer ${data.token}`,
          },
        })
        .then((res) => res.data),
  });

export const useGetLatestBlog = (tag: string) =>
  useQuery<IBlog[]>({
    queryKey: [QUERY_KEYS.GET_LATEST_BLOGS, tag],
    queryFn: async () => {
      const params: IBlogQuery = {};
      if (tag !== "all") params.tag = tag;

      return await apiClient
        .get<IBlog[]>("/blogs", { params })
        .then((res) => (res.data as IFetchResponse).data);
    },
    staleTime: ms("1m"),
    gcTime: ms("5m"),
    refetchOnWindowFocus: true, // Refetch on window focus
    refetchOnMount: true, // Refetch on component mount to ensure fresh data when component re-renders
    refetchOnReconnect: true, // Refetch on network reconnect
  });

export const useGetTrendingBlog = () =>
  useQuery<IBlog[]>({
    queryKey: [QUERY_KEYS.GET_TRENDING_BLOGS],
    queryFn: () =>
      apiClient
        .get<IBlog[]>("/blogs/trending")
        .then((res) => (res.data as IFetchResponse).data),
    staleTime: ms("5m"),
    gcTime: ms("10m"),
    refetchOnWindowFocus: false, // No need to refetch on window focus
    refetchOnMount: true, // Refetch on component mount to ensure fresh data when component re-renders
    refetchOnReconnect: true, // Refetch on network reconnect
  });
