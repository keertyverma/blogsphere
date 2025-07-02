import { useAuthStore, useEditorStore } from "@/store";
import {
  IAuthor,
  IBlog,
  IBlogQuery,
  IBookmark,
  IBookmarkGetQuery,
  ICommentQuery,
  ICreateDraftBlog,
  ICreatePublishedBlog,
  IFetchAllResponse,
  IFetchCursorPaginatedResult,
  IFetchResponse,
  INewUser,
  IUpdateUserProfile,
} from "@/types";
import {
  InfiniteData,
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

export const useResendVerificationEmail = () =>
  useMutation({
    mutationFn: (email: string) =>
      apiClient
        .post<IFetchResponse>("/auth/resend-verification", { email })
        .then((res) => res.data),
  });

export const useForgotPassword = () =>
  useMutation({
    mutationFn: (email: string) =>
      apiClient
        .post<IFetchResponse>("/auth/forgot-password", { email })
        .then((res) => res.data),
  });

export const useResetPassword = () =>
  useMutation({
    mutationFn: (data: { email: string; token: string; password: string }) =>
      apiClient
        .post<IFetchResponse>("/auth/reset-password", { ...data })
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

export const useUpdateUsername = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { username: string }) =>
      apiClient
        .patch("/users/changeUsername", {
          newUsername: data.username,
        })
        .then((res) => res.data.result),
    onSuccess: (updatedData) => {
      const { username } = updatedData;
      if (username) {
        // Clear cached queries to reset session-related data.
        // Re-login is triggered in the component after this step.
        queryClient.clear();
      }
    },
  });
};

// ----------------- Blog -------------------
export const useCreateBlog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ICreateDraftBlog | ICreatePublishedBlog) =>
      apiClient.post("/blogs", data).then((res) => res.data.result),
    onSuccess: (
      _,
      toCreateRequest: ICreateDraftBlog | ICreatePublishedBlog
    ) => {
      const { isDraft } = toCreateRequest;
      const { id: authorId, username } = useAuthStore.getState().user;
      const selectedTag = useEditorStore.getState().selectedTag;

      if (isDraft) {
        // refetch user's draft blogs
        return queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_USER_DRAFT_BLOGS, { username }],
        });
      }

      // refetch user data to update the total post count and refresh the list of published blogs.
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_USER_BY_ID, username],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_USER_PUBLISHED_BLOGS, { authorId }],
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
    },
  });
};

export const useGetPublishedBlogs = (tag: string) =>
  useInfiniteQuery({
    queryKey: [QUERY_KEYS.GET_LATEST_BLOGS, tag],
    queryFn: async ({ pageParam = "" }) => {
      const params: IBlogQuery = {
        limit: 10,
        ...(pageParam ? { nextCursor: pageParam } : {}),
      };
      if (tag !== "all") params.tag = tag;
      return await apiClient
        .get("/blogs", {
          params,
          withCredentials: false,
        })
        .then((res) => res.data);
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor || undefined, // Return nextCursor if available
    initialPageParam: null, // Start with no cursor
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
          params: { ordering: "trending", limit: 10 },
          withCredentials: false,
        })
        .then((res) => (res.data as unknown as IFetchAllResponse).results),
    staleTime: ms("5m"),
    gcTime: ms("10m"),
    refetchOnMount: true, // Refetch on component mount to ensure fresh data when component re-renders
    refetchOnReconnect: true, // Refetch on network reconnect
  });

export const useGetSearchedBlogs = (searchTerm: string) =>
  useInfiniteQuery<IFetchCursorPaginatedResult<IBlog>>({
    queryKey: [QUERY_KEYS.GET_SEARCHED_BLOGS, searchTerm],
    queryFn: async ({ pageParam = "" }) =>
      await apiClient
        .get("/blogs", {
          params: {
            search: searchTerm,
            limit: 10,
            ...(pageParam ? { nextCursor: pageParam } : {}),
          },
          withCredentials: false,
        })
        .then((res) => res.data),
    getNextPageParam: (lastPage) => lastPage.nextCursor || undefined, // Return nextCursor if available
    initialPageParam: null, // Start with no cursor
    staleTime: ms("5m"),
    gcTime: ms("10m"),
    refetchOnMount: true, // Refetch on component mount to ensure fresh data when component re-renders
    refetchOnReconnect: true, // Refetch on network reconnect
  });

export const useGetUserPublishedBlogs = (
  authorId: string,
  searchTerm?: string
) =>
  useInfiniteQuery({
    queryKey: [QUERY_KEYS.GET_USER_PUBLISHED_BLOGS, { authorId, searchTerm }],
    queryFn: async ({ pageParam = "" }) => {
      const params: IBlogQuery = {
        authorId,
        limit: 10,
        ...(pageParam ? { nextCursor: pageParam } : {}),
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
    getNextPageParam: (lastPage) => lastPage.nextCursor || undefined, // Return nextCursor if available
    initialPageParam: null, // Start with no cursor
    staleTime: ms("5m"),
    gcTime: ms("10m"),
    refetchOnMount: true, // Refetch on component mount to ensure fresh data when component re-renders
    refetchOnReconnect: true, // Refetch on network reconnect
  });

export const useGetUserDraftBlogs = (searchTerm?: string) => {
  const { username } = useAuthStore.getState().user;

  return useInfiniteQuery({
    queryKey: [
      QUERY_KEYS.GET_USER_DRAFT_BLOGS,
      { username, searchTerm: searchTerm || "" },
    ],
    queryFn: async ({ pageParam = 1 }) =>
      await apiClient
        .get("/blogs/drafts", {
          params: {
            pageSize: 10,
            page: pageParam,
            ...(searchTerm ? { search: searchTerm } : {}),
          },
        })
        .then((res) => res.data),
    getNextPageParam: (lastPage, allPages) => {
      // to get next page number
      return lastPage.next ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: ms("5m"),
    gcTime: ms("10m"),
    refetchOnMount: true, // Refetch on component mount to ensure fresh data when component re-renders
    refetchOnReconnect: true, // Refetch on network reconnect
  });
};

export const useGetBlog = ({
  isDraft,
  blogId,
}: {
  isDraft: boolean;
  blogId?: string;
}) => {
  // Fetch draft blog if `isDraft` is set
  const draftBlog = useGetDraftBlog(isDraft ? blogId : undefined);

  // Fetch published blog if `isDraft` is not set
  const publishedBlog = useGetPublishedBlog(isDraft ? undefined : blogId);
  return isDraft ? draftBlog : publishedBlog;
};

export const useGetPublishedBlog = (blogId?: string) =>
  useQuery<IBlog>({
    queryKey: [QUERY_KEYS.GET_PUBLISHED_BLOG_BY_ID, blogId],
    queryFn: () =>
      apiClient
        .get<IBlog>(`/blogs/${blogId}`, { withCredentials: false })
        .then((res) => (res.data as unknown as IFetchResponse).result),
    staleTime: ms("10m"),
    gcTime: ms("30m"),
    refetchOnMount: true, // Refetch on component mount to get updated blog after edit
    refetchOnReconnect: true, // Refetch on network reconnect
    enabled: !!blogId, // Query only runs if blogId is truthy
  });

export const useGetDraftBlog = (blogId?: string) =>
  useQuery<IBlog>({
    queryKey: [QUERY_KEYS.GET_DRAFT_BLOG_BY_ID, blogId],
    queryFn: () =>
      apiClient
        .get<IBlog>(`/blogs/drafts/${blogId}`)
        .then((res) => (res.data as unknown as IFetchResponse).result),
    staleTime: ms("10m"),
    gcTime: ms("30m"),
    refetchOnMount: true, // Refetch on component mount to get updated draft blog after edit
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

  return useMutation({
    mutationFn: (data: {
      blogId: string;
      blog: object;
      isPublishingDraft?: boolean;
    }) =>
      apiClient
        .patch(`/blogs/${data.blogId}`, data.blog)
        .then((res) => res.data.result),
    onSuccess: (updatedBlog, toUpdateRequest) => {
      const { blogId, authorDetails, isDraft } = updatedBlog;
      const {
        _id: authorId,
        personalInfo: { username },
      } = authorDetails;
      const { isPublishingDraft } = toUpdateRequest;
      const selectedTag = useEditorStore.getState().selectedTag;

      // Transitioning from draft to published blog status
      if (isPublishingDraft) {
        // refetch user to update the total post count accurately
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_USER_BY_ID, username],
        });

        // refetch user's draft list
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_USER_DRAFT_BLOGS, { username }],
        });

        // refetch user's published list
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_USER_PUBLISHED_BLOGS, { authorId }],
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
        // Exit early, no need to check for draft or published updates
        return;
      }

      if (isDraft) {
        // draft blog updated
        // refetch given draft blog data
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_DRAFT_BLOG_BY_ID, blogId],
        });

        // refetch user's draft list
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_USER_DRAFT_BLOGS, { username }],
        });
      } else {
        // published blog updated
        // refetch given published blog data
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_PUBLISHED_BLOG_BY_ID, blogId],
        });

        // refetch user's published list
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_USER_PUBLISHED_BLOGS, { authorId }],
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
      }
    },
  });
};

export const useLikePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (blogId: string) =>
      apiClient.patch(`/blogs/${blogId}/like`).then((res) => res.data.result),
    onSuccess: (data) => {
      const authorId = data.author;
      const selectedTag = useEditorStore.getState().selectedTag;

      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_PUBLISHED_BLOG_BY_ID, data.blogId],
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
        queryKey: [QUERY_KEYS.GET_USER_PUBLISHED_BLOGS, { authorId }],
      });
    },
  });
};

export const useDeleteBlog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (blogId: string) =>
      apiClient.delete(`blogs/${blogId}`).then((res) => res.data.result),
    onSuccess: (data) => {
      const {
        isDraft,
        authorDetails: {
          _id: authorId,
          personalInfo: { username },
        },
        _id,
      } = data;
      const selectedTag = useEditorStore.getState().selectedTag;

      if (isDraft) {
        // refetch user's draft list
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_USER_DRAFT_BLOGS, { username }],
        });
      } else {
        // refetch user profile and published blog list
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_USER_BY_ID, username],
        });
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_USER_PUBLISHED_BLOGS, { authorId }],
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

        // refetch user's bookmarks if the deleted blog was previously bookmarked
        const userBookmarksQueryKey = [
          QUERY_KEYS.GET_USER_BOOKMARKS,
          { userId: authorId },
        ];
        const cachedBookmarks = queryClient.getQueryData<
          InfiniteData<IFetchAllResponse>
        >(userBookmarksQueryKey); // Retrieve the cached bookmarks data
        if (cachedBookmarks) {
          const isBlogBookmarked = cachedBookmarks.pages.some((page) =>
            page.results.some((bookmark) => bookmark.blogId === _id)
          );

          if (isBlogBookmarked) {
            queryClient.invalidateQueries({
              queryKey: userBookmarksQueryKey,
            });
          }
        }
      }
    },
  });
};

export const useGenerateBlogMetadata = () => {
  return useMutation({
    mutationFn: ({ blogText, blogId }: { blogText: string; blogId?: string }) =>
      apiClient
        .post(`/blogs/ai-metadata`, {
          blogText,
          ...(blogId && { blogId }),
        })
        .then((res) => res.data.result),
  });
};

// ----------------- Comment -------------------
export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (comment: { blogId: string; content: string }) =>
      apiClient.post(`/comments`, comment).then((res) => res.data.result),
    onSuccess: (data) => {
      const {
        blog: { id, blogId },
      } = data;
      if (blogId) {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_PUBLISHED_BLOG_BY_ID, blogId],
        });
      }
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_BLOG_COMMENTS, { blogId: id }],
      });
    },
  });
};

export const useGetComments = (blogId?: string, commentId?: string) =>
  useInfiniteQuery({
    queryKey: [QUERY_KEYS.GET_BLOG_COMMENTS, { blogId, commentId }],
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
          queryKey: [QUERY_KEYS.GET_PUBLISHED_BLOG_BY_ID, blogId],
        });
      }

      // refresh reply list for given comment
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_BLOG_COMMENTS, { commentId: parent }],
      });

      // refresh top-level comment list for given blog
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_BLOG_COMMENTS, { blogId: id }],
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
        queryKey: [QUERY_KEYS.GET_PUBLISHED_BLOG_BY_ID, blogId],
      });

      // refresh reply list for given comment
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_BLOG_COMMENTS, { commentId: parent }],
      });

      // refresh top-level comment list for given blog
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_BLOG_COMMENTS, { blogId: id }],
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
          queryKey: [QUERY_KEYS.GET_BLOG_COMMENTS, { commentId: parent }],
        });
      } else {
        // refresh top level comment list
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_BLOG_COMMENTS, { blogId: id }],
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
        queryKey: [QUERY_KEYS.GET_USER_BOOKMARKS, { userId }],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_BOOKMARK_STATUS, { userId, blogId }],
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
        queryKey: [QUERY_KEYS.GET_USER_BOOKMARKS, { userId }],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_BOOKMARK_STATUS, { userId, blogId }],
      });
    },
  });
};

export const useGetUserBookmarks = () => {
  const { id: userId } = useAuthStore.getState().user;

  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.GET_USER_BOOKMARKS, { userId }],
    queryFn: async ({ pageParam = 1 }) => {
      const params: IBookmarkGetQuery = {
        // pageSize: 2,
        page: pageParam,
      };

      return await apiClient
        .get(`bookmarks/user`, {
          params,
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
    refetchOnMount: true, // Refetch on component mount to ensure fresh data when component re-renders
    refetchOnReconnect: true, // Refetch on network reconnect
  });
};

export const useBookmarkStatus = (userId?: string, blogId?: string) =>
  useQuery({
    queryKey: [QUERY_KEYS.GET_BOOKMARK_STATUS, { userId, blogId }],
    queryFn: () =>
      apiClient
        .get(`/bookmarks/user/blog/${blogId}/exists`)
        .then((res) => (res.data as unknown as IFetchResponse).result),
    staleTime: Infinity, // Never becomes stale (only refetches on invalidation)
    gcTime: ms("3h"), // Cache remains for 3 hours before being garbage collected
    enabled: !!userId && !!blogId, // Fetch only if user is authenticated and blogId exists
    refetchOnMount: true, // Refetch on component mount to ensure fresh data when component re-renders
    refetchOnReconnect: true, // Refetch on network reconnect
  });
