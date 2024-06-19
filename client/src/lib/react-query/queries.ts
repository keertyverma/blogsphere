import {
  IAuthor,
  IBlog,
  IBlogQuery,
  IFetchResponse,
  INewUser,
  IUpdateUserProfile,
} from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ms from "ms";
import apiClient from "../api-client";
import { QUERY_KEYS } from "./queryKeys";

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

export const useGetSearchedUsers = (searchTerm: string) =>
  useQuery<IAuthor[]>({
    queryKey: [QUERY_KEYS.GET_SEARCHED_USERS, searchTerm],
    queryFn: () =>
      apiClient
        .get<IAuthor[]>("/users", {
          params: {
            search: searchTerm,
            limit: 20,
          },
        })
        .then((res) => (res.data as IFetchResponse).data),
    staleTime: ms("5m"),
    gcTime: ms("10m"),
    refetchOnWindowFocus: false, // No need to refetch on window focus
    refetchOnMount: true, // Refetch on component mount to ensure fresh data when component re-renders
    refetchOnReconnect: true, // Refetch on network reconnect
  });

export const useGetUser = (profileId?: string) =>
  useQuery<IAuthor>({
    queryKey: [QUERY_KEYS.GET_USER_BY_ID, profileId],
    queryFn: () =>
      apiClient
        .get<IAuthor>(`/users/${profileId}`)
        .then((res) => (res.data as IFetchResponse).data),
    staleTime: ms("5m"),
    gcTime: ms("10m"),
    refetchOnWindowFocus: false, // No need to refetch on window focus
    refetchOnMount: true, // Refetch on component mount to ensure fresh data when component re-renders
    refetchOnReconnect: true, // Refetch on network reconnect
    enabled: !!profileId, // Query only runs if profileId is truthy
  });

export const useUpdatePassword = () =>
  useMutation({
    mutationFn: (data: {
      token: string;
      currentPassword: string;
      newPassword: string;
    }) =>
      apiClient
        .post(
          "/users/changePassword",
          {
            currentPassword: data.currentPassword,
            newPassword: data.newPassword,
          },
          {
            headers: {
              Authorization: `Bearer ${data.token}`,
            },
          }
        )
        .then((res) => res.data.data),
  });

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { token: string; toUpdate: IUpdateUserProfile }) =>
      apiClient
        .patch("/users", data.toUpdate, {
          headers: {
            Authorization: `Bearer ${data.token}`,
          },
        })
        .then((res) => res.data.data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_USER_BY_ID, data.personalInfo.username],
      });
    },
  });
};

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
        .then((res) => res.data.data),
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
    // staleTime: ms("1m"),
    gcTime: ms("5m"),
    refetchOnWindowFocus: true, // Refetch on window focus
    refetchOnMount: true, // Refetch on component mount to ensure fresh data when component re-renders
    refetchOnReconnect: true, // Refetch on network reconnect
  });

// Get top 10 trending blog
export const useGetTrendingBlog = () =>
  useQuery<IBlog[]>({
    queryKey: [QUERY_KEYS.GET_TRENDING_BLOGS],
    queryFn: () =>
      apiClient
        .get<IBlog[]>("/blogs", {
          params: { ordering: "trending", limit: 10 },
        })
        .then((res) => (res.data as IFetchResponse).data),
    staleTime: ms("5m"),
    gcTime: ms("10m"),
    refetchOnWindowFocus: false, // No need to refetch on window focus
    refetchOnMount: true, // Refetch on component mount to ensure fresh data when component re-renders
    refetchOnReconnect: true, // Refetch on network reconnect
  });

export const useGetSearchedBlogs = (searchTerm: string) =>
  useQuery<IBlog[]>({
    queryKey: [QUERY_KEYS.GET_SEARCHED_BLOGS, searchTerm],
    queryFn: () =>
      apiClient
        .get<IBlog[]>("/blogs", {
          params: {
            search: searchTerm,
            limit: 10,
          },
        })
        .then((res) => (res.data as IFetchResponse).data),
    staleTime: ms("5m"),
    gcTime: ms("10m"),
    refetchOnWindowFocus: false, // No need to refetch on window focus
    refetchOnMount: true, // Refetch on component mount to ensure fresh data when component re-renders
    refetchOnReconnect: true, // Refetch on network reconnect
  });

export const useGetUserPublishedBlogs = (authorId: string) =>
  useQuery<IBlog[]>({
    queryKey: [QUERY_KEYS.GET_USER_PUBLISHED_BLOGS, authorId],
    queryFn: () =>
      apiClient
        .get<IBlog[]>("/blogs", {
          params: {
            authorId,
            limit: 10,
          },
        })
        .then((res) => (res.data as IFetchResponse).data),
    staleTime: ms("5m"),
    gcTime: ms("10m"),
    refetchOnWindowFocus: false, // No need to refetch on window focus
    refetchOnMount: true, // Refetch on component mount to ensure fresh data when component re-renders
    refetchOnReconnect: true, // Refetch on network reconnect
  });

export const useGetUserDraftBlogs = (authorId: string) =>
  useQuery<IBlog[]>({
    queryKey: [QUERY_KEYS.GET_USER_DRAFT_BLOGS, authorId],
    queryFn: () =>
      apiClient
        .get<IBlog[]>("/blogs", {
          params: {
            authorId,
            draft: true,
          },
        })
        .then((res) => (res.data as IFetchResponse).data),
    staleTime: ms("5m"),
    gcTime: ms("10m"),
    refetchOnWindowFocus: false, // No need to refetch on window focus
    refetchOnMount: true, // Refetch on component mount to ensure fresh data when component re-renders
    refetchOnReconnect: true, // Refetch on network reconnect
  });

export const useGetBlog = (blogId?: string) =>
  useQuery<IBlog>({
    queryKey: [QUERY_KEYS.GET_BLOG_BY_ID, blogId],
    queryFn: () =>
      apiClient
        .get<IBlog>(`/blogs/${blogId}`)
        .then((res) => (res.data as IFetchResponse).data),
    staleTime: ms("10m"),
    gcTime: ms("30m"),
    refetchOnWindowFocus: false, // No need to refetch on window focus
    refetchOnMount: true, // Refetch on component mount to get updated blog after edit
    refetchOnReconnect: true, // Refetch on network reconnect
    enabled: !!blogId, // Query only runs if blogId is truthy
  });

export const useUpdateReads = () =>
  useMutation({
    mutationFn: (data: { token: string; blogId: string }) =>
      apiClient
        .patch(
          `/blogs/${data.blogId}/readCount`,
          {},
          {
            headers: {
              Authorization: `Bearer ${data.token}`,
            },
          }
        )
        .then((res) => res.data),
  });

export const useUpdateBlog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { blogId: string; token: string; blog: object }) =>
      apiClient
        .patch(`/blogs/${data.blogId}`, data.blog, {
          headers: {
            Authorization: `Bearer ${data.token}`,
          },
        })
        .then((res) => res.data.data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_BLOG_BY_ID, data.blogId],
      });

      const { _id: authorId, personalInfo } = data.authorDetails;
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_USER_BY_ID, personalInfo.username],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_USER_PUBLISHED_BLOGS, authorId],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_USER_DRAFT_BLOGS, authorId],
      });
    },
  });
};

export const useLikePost = () => {
  return useMutation({
    mutationFn: (data: { token: string; blogId: string }) =>
      apiClient
        .patch(
          `/blogs/${data.blogId}/like`,
          {},
          {
            headers: {
              Authorization: `Bearer ${data.token}`,
            },
          }
        )
        .then((res) => res.data),
  });
};

export const useDeleteBlog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { blogId: string; token: string }) =>
      apiClient
        .delete(`blogs/${data.blogId}`, {
          headers: {
            Authorization: `Bearer ${data.token}`,
          },
        })
        .then((res) => res.data.data),
    onSuccess: (data) => {
      const { _id: authorId, personalInfo } = data.authorDetails;

      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_USER_BY_ID, personalInfo.username],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_USER_PUBLISHED_BLOGS, authorId],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_USER_DRAFT_BLOGS, authorId],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_TRENDING_BLOGS],
      });
    },
  });
};
