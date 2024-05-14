import { IBlog, IFetchResponse, INewUser } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import apiClient from "../api-client";
import { QUERY_KEYS } from "./queryKeys";

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

export const useGetLatestBlog = () =>
  useQuery<IBlog[]>({
    queryKey: [QUERY_KEYS.GET_LATEST_BLOG],
    queryFn: () =>
      apiClient
        .get<IBlog[]>("/blogs/latest")
        .then((res) => (res.data as IFetchResponse).data),
  });
