import { useAuthStore, useEditorStore } from "@/store";
import {
  IAuthor,
  IBlog,
  IBlogQuery,
  IBookmark,
  IBookmarkGetQuery,
  ICommentQuery,
  IFetchAllResponse,
  IFetchResponse,
  INewUser,
  IUpdateUserProfile,
} from "@/types";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import ms from "ms";
import apiClient from "../api-client";
import { QUERY_KEYS } from "./queryKeys";

export const usePingServer = () => {
  useQuery({
    queryKey: ["ping-server"],
    queryFn: () =>
      apiClient
        .get("/", {
          withCredentials: false,
        })
        .then((res) => res.data),
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

export const useLogout = () =>
  useMutation({
    mutationFn: () => apiClient.post("/auth/logout"),
  });

export const useVerifyEmail = () =>
  useMutation({
    mutationFn: (data: { email: string; token: string }) =>
      apiClient
        .post<IFetchResponse>("/auth/verify-email", data)
        .then((res) => res.data),
  });

export const useUpload = () =>
  useMutation({
    mutationFn: (data: string) =>
      apiClient.post("/upload", { data }).then((res) => res.data.result),
  });

export const useGetSearchedUsers = (searchTerm: string) =>
  useQuery<IAuthor[]>({
    queryKey: [QUERY_KEYS.GET_SEARCHED_USERS, searchTerm],
    queryFn: () =>
      apiClient
        .get<IAuthor[]>("/users", {
          params: {
            search: searchTerm,
            pageSize: 50,
          },
          withCredentials: false,
        })
        .then(
          (res) => (res.data as unknown as IFetchAllResponse<IAuthor>).results
        ),
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
        .get<IAuthor>(`/users/${profileId}`, { withCredentials: false })
        .then((res) => (res.data as unknown as IFetchResponse<IAuthor>).result),
    staleTime: ms("5m"),
    gcTime: ms("10m"),
    refetchOnWindowFocus: false, // No need to refetch on window focus
    refetchOnMount: true, // Refetch on component mount to ensure fresh data when component re-renders
    refetchOnReconnect: true, // Refetch on network reconnect
    enabled: !!profileId, // Query only runs if profileId is truthy
  });

export const useUpdatePassword = () =>
  useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      apiClient
        .post("/users/changePassword", {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        })
        .then((res) => res.data.result),
  });

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IUpdateUserProfile) =>
      apiClient.patch("/users", data).then((res) => res.data.result),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_USER_BY_ID, data.personalInfo.username],
      });
    },
  });
};

// ----------------- Blog -------------------
export const useCreateBlog = () => {
  const queryClient = useQueryClient();
  const { id: authorId, username } = useAuthStore((s) => s.user);
  const selectedTag = useEditorStore((s) => s.selectedTag);

  return useMutation({
    mutationFn: (data: object) =>
      apiClient.post("/blogs", data).then((res) => res.data.result),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_LATEST_BLOGS, "all"],
      });
      if (selectedTag !== "all") {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_LATEST_BLOGS, selectedTag],
        });
      }

      // refresh authenticated user published and draft blog lists
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_USER_BY_ID, username],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_USER_BLOGS, { authorId, isDraft: false }],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_USER_BLOGS, { authorId, isDraft: true }],
      });
    },
  });
};

export const useGetLatestBlogs = (tag: string) =>
  useInfiniteQuery({
    queryKey: [QUERY_KEYS.GET_LATEST_BLOGS, tag],
    queryFn: async ({ pageParam = 1 }) => {
      const params: IBlogQuery = {
        draft: false,
        page: pageParam,
        pageSize: 10,
      };
      if (tag !== "all") params.tag = tag;
      return await apiClient
        .get("/blogs", {
          params,
          withCredentials: false,
        })
        .then((res) => res.data);
    },
    getNextPageParam: (lastPage, allPages) => {
      // to get next page number
      return lastPage.next ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: ms("2m"),
    gcTime: ms("5m"),
    refetchOnWindowFocus: true, // Refetch on window focus
    refetchOnMount: true, // Refetch on component mount to ensure fresh data when component re-renders
    refetchOnReconnect: true, // Refetch on network reconnect
  });

// Get top 10 trending blogs
export const useGetTrendingBlogs = () =>
  useQuery<IBlog[]>({
    queryKey: [QUERY_KEYS.GET_TRENDING_BLOGS],
    queryFn: () =>
      apiClient
        .get<IBlog[]>("/blogs", {
          params: { ordering: "trending", pageSize: 10 },
          withCredentials: false,
        })
        .then((res) => (res.data as unknown as IFetchAllResponse).results),
    staleTime: ms("5m"),
    gcTime: ms("10m"),
    refetchOnWindowFocus: false, // No need to refetch on window focus
    refetchOnMount: true, // Refetch on component mount to ensure fresh data when component re-renders
    refetchOnReconnect: true, // Refetch on network reconnect
  });

export const useGetSearchedBlogs = (searchTerm: string) =>
  useInfiniteQuery<IFetchAllResponse<IBlog>>({
    queryKey: [QUERY_KEYS.GET_SEARCHED_BLOGS, searchTerm],
    queryFn: async ({ pageParam = 1 }) =>
      await apiClient
        .get("/blogs", {
          params: {
            draft: false,
            search: searchTerm,
            pageSize: 10,
            page: pageParam,
          },
          withCredentials: false,
        })
        .then((res) => res.data),
    getNextPageParam: (lastPage, allPages) => {
      // to get next page number
      return lastPage.next ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: ms("5m"),
    gcTime: ms("10m"),
    refetchOnWindowFocus: false, // No need to refetch on window focus
    refetchOnMount: true, // Refetch on component mount to ensure fresh data when component re-renders
    refetchOnReconnect: true, // Refetch on network reconnect
  });

export const useGetUserBlogs = (
  authorId: string,
  isDraft: boolean,
  searchTerm?: string
) =>
  useInfiniteQuery({
    queryKey: [QUERY_KEYS.GET_USER_BLOGS, { authorId, isDraft, searchTerm }],
    queryFn: async ({ pageParam = 1 }) => {
      const params: IBlogQuery = {
        authorId,
        draft: isDraft,
        pageSize: 10,
        page: pageParam,
      };

      if (searchTerm) {
        params["search"] = searchTerm;
      }

      return await apiClient
        .get("/blogs", {
          params,
          withCredentials: false,
        })
        .then((res) => res.data);
    },
    getNextPageParam: (lastPage, allPages) => {
      // to get next page number
      return lastPage.next ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
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
        .get<IBlog>(`/blogs/${blogId}`, { withCredentials: false })
        .then((res) => (res.data as unknown as IFetchResponse).result),
    staleTime: ms("10m"),
    gcTime: ms("30m"),
    refetchOnWindowFocus: false, // No need to refetch on window focus
    refetchOnMount: true, // Refetch on component mount to get updated blog after edit
    refetchOnReconnect: true, // Refetch on network reconnect
    enabled: !!blogId, // Query only runs if blogId is truthy
  });

export const useUpdateReads = () =>
  useMutation({
    mutationFn: (blogId: string) =>
      apiClient.patch(`/blogs/${blogId}/readCount`).then((res) => res.data),
  });

export const useUpdateBlog = () => {
  const queryClient = useQueryClient();
  const selectedTag = useEditorStore((s) => s.selectedTag);

  return useMutation({
    mutationFn: (data: { blogId: string; blog: object }) =>
      apiClient
        .patch(`/blogs/${data.blogId}`, data.blog)
        .then((res) => res.data.result),
    onSuccess: (data) => {
      // refetch given blog
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_BLOG_BY_ID, data.blogId],
      });

      // refetch latest blog with or without tag filter
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_LATEST_BLOGS, "all"],
      });
      if (selectedTag !== "all") {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_LATEST_BLOGS, selectedTag],
        });
      }

      // refetch user profile and all blogs
      const { _id: authorId, personalInfo } = data.authorDetails;
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_USER_BY_ID, personalInfo.username],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_USER_BLOGS, { authorId, isDraft: false }],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_USER_BLOGS, { authorId, isDraft: true }],
      });
    },
  });
};

export const useLikePost = () => {
  const queryClient = useQueryClient();
  const selectedTag = useEditorStore((s) => s.selectedTag);

  return useMutation({
    mutationFn: (blogId: string) =>
      apiClient.patch(`/blogs/${blogId}/like`).then((res) => res.data.result),
    onSuccess: (data) => {
      const authorId = data.authorDetails;
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_BLOG_BY_ID, data.blogId],
      });

      // refetch latest blog with or without tag filter
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_LATEST_BLOGS, "all"],
      });
      if (selectedTag !== "all") {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_LATEST_BLOGS, selectedTag],
        });
      }

      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_USER_BLOGS, { authorId, isDraft: false }],
      });
    },
  });
};

export const useDeleteBlog = () => {
  const queryClient = useQueryClient();
  const selectedTag = useEditorStore((s) => s.selectedTag);

  return useMutation({
    mutationFn: (blogId: string) =>
      apiClient.delete(`blogs/${blogId}`).then((res) => res.data.result),
    onSuccess: (data) => {
      const { _id: authorId, personalInfo } = data.authorDetails;
      // refetch user profile and all blogs
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_USER_BY_ID, personalInfo.username],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_USER_BLOGS, { authorId, isDraft: false }],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_USER_BLOGS, { authorId, isDraft: true }],
      });

      // refetch latest blog with or without tag filter
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_LATEST_BLOGS, "all"],
      });
      if (selectedTag !== "all") {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_LATEST_BLOGS, selectedTag],
        });
      }
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_TRENDING_BLOGS],
      });
    },
  });
};

// ----------------- Comment -------------------
export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (comment: {
      blogId: string;
      blogAuthor: string;
      content: string;
    }) => apiClient.post(`/comments`, comment).then((res) => res.data.result),
    onSuccess: (data) => {
      const {
        blog: { id, blogId },
      } = data;
      if (blogId) {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_BLOG_BY_ID, blogId],
        });
      }
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_BLOG_COMMENTS, id, ""],
      });
    },
  });
};

export const useGetComments = (blogId: string = "", commentId: string = "") =>
  useInfiniteQuery({
    queryKey: [QUERY_KEYS.GET_BLOG_COMMENTS, blogId, commentId],
    queryFn: async ({ pageParam = 1 }) => {
      const params: ICommentQuery = {
        pageSize: 10,
        page: pageParam,
      };
      if (blogId) params.blogId = blogId;
      if (commentId) params.commentId = commentId;

      return await apiClient
        .get(`/comments`, { params, withCredentials: false })
        .then((res) => res.data);
    },
    getNextPageParam: (lastPage, allPages) => {
      // to get next page number
      return lastPage.next ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: ms("2m"),
    gcTime: ms("5m"),
    enabled: !!blogId || !!commentId,
    refetchOnWindowFocus: true, // Refetch on window focus
    refetchOnMount: true, // Refetch on component mount to ensure fresh data when component re-renders
    refetchOnReconnect: true, // Refetch on network reconnect
  });

export const useCreateReply = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reply: { commentId: string; content: string }) =>
      apiClient.post(`/comments/replies`, reply).then((res) => res.data.result),
    onSuccess: (data) => {
      const {
        blog: { id, blogId },
        parent,
      } = data;
      if (blogId) {
        // refresh blog page to show correct 'totalComments' count
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_BLOG_BY_ID, blogId],
        });
      }

      // refresh reply list for given comment
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_BLOG_COMMENTS, "", parent],
      });

      // refresh top-level comment list for given blog
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_BLOG_COMMENTS, id, ""],
      });
    },
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) =>
      apiClient.delete(`comments/${commentId}`).then((res) => res.data.result),
    onSuccess: (data) => {
      const {
        blog: { id, blogId },
        parent,
      } = data;
      // refresh blog page
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_BLOG_BY_ID, blogId],
      });

      // refresh reply list for given comment
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_BLOG_COMMENTS, "", parent],
      });

      // refresh top-level comment list for given blog
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_BLOG_COMMENTS, id, ""],
      });
    },
  });
};

export const useUpdateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (comment: { id: string; content: string }) =>
      apiClient
        .patch(`/comments/${comment.id}`, { content: comment.content })
        .then((res) => res.data.result),
    onSuccess: (data) => {
      const {
        blog: { id },
        parent,
      } = data;
      if (parent) {
        // refresh reply list
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_BLOG_COMMENTS, "", parent],
        });
      } else {
        // refresh top level comment list
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_BLOG_COMMENTS, id, ""],
        });
      }
    },
  });
};

// ----------------- Bookmark -------------------
export const useCreateBookmark = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (blogId: string) =>
      apiClient.post(`/bookmarks/${blogId}`).then((res) => res.data.result),
    onSuccess: (data: IBookmark) => {
      const { userId, blogId } = data;
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_USER_BOOKMARKS, { userId, blogId }],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_USER_BOOKMARKS, { userId }],
      });
    },
  });
};

export const useDeleteBookmark = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (blogId: string) =>
      apiClient.delete(`/bookmarks/${blogId}`).then((res) => res.data.result),
    onSuccess: (data: IBookmark) => {
      const { userId, blogId } = data;
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_USER_BOOKMARKS, { userId, blogId }],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_USER_BOOKMARKS, { userId }],
      });
    },
  });
};

export const useGetUserBookmarks = (userId: string, blogId?: string) =>
  useInfiniteQuery({
    queryKey: [QUERY_KEYS.GET_USER_BOOKMARKS, { userId, blogId }],
    queryFn: async ({ pageParam = 1 }) => {
      const params: IBookmarkGetQuery = {
        // pageSize: 2,
        page: pageParam,
      };
      if (blogId) {
        params["blogId"] = blogId;
      }

      return await apiClient
        .get(`bookmarks/users/${userId}`, {
          params,
          withCredentials: false,
        })
        .then((res) => res.data);
    },
    getNextPageParam: (lastPage, allPages) => {
      // to get next page number
      return lastPage.next ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: ms("30m"),
    gcTime: ms("40m"),
    enabled: !!userId, // Query only runs if userId is truthy
    refetchOnWindowFocus: false, // No need to refetch on window focus
    refetchOnMount: true, // Refetch on component mount to ensure fresh data when component re-renders
    refetchOnReconnect: true, // Refetch on network reconnect
  });
