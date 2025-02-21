import { OutputBlockData, OutputData } from "@editorjs/editorjs";

export type INewUser = {
  fullname: string;
  email: string;
  password: string;
};

export type IFetchError = {
  code: string;
  message: string;
  details: string;
};

type BaseApiResponse = {
  statusCode: number;
  error?: IFetchError;
  message?: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type IFetchResponse<T = any> = BaseApiResponse & {
  result: T;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type IFetchAllResponse<T = any> =
  | IFetchOffsetPaginatedResult<T>
  | IFetchCursorPaginatedResult<T>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type IFetchOffsetPaginatedResult<T = any> = BaseApiResponse & {
  results: T[];
  count: number;
  next: string | null;
  previous: string | null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type IFetchCursorPaginatedResult<T = any> = BaseApiResponse & {
  results: T[];
  nextCursor: string | null;
};

export interface IUser {
  id: string;
  email: string;
  fullname: string;
  username: string;
  profileImage: string;
  googleAuth?: boolean;
}

export interface SocialLink {
  youtube: string;
  instagram: string;
  facebook: string;
  twitter: string;
  github: string;
  website: string;
}

export interface IAuthor {
  _id: string;
  personalInfo: {
    fullname: string;
    email: string;
    password?: string;
    username: string;
    bio?: string;
    profileImage: string;
  };
  accountInfo: {
    totalPosts: number;
    totalReads: number;
  };
  socialLinks: SocialLink;
  createdAt: string;
}

export interface IBlog {
  _id?: string;
  blogId?: string;
  title: string;
  coverImgURL: string;
  description: string;
  tags: string[];
  author?: string;
  authorDetails: IAuthor;
  content: OutputData;
  createdAt?: string; //timestamp
  publishedAt?: string; //timestamp
  updatedAt?: string; //timestamp
  activity?: {
    totalLikes: number;
    totalReads: number;
    totalComments: number;
    totalParentComments: number;
  };
  likes?: { [key: string]: boolean };
  isDraft?: boolean;
}

export interface ICreateDraftBlog {
  title: string;
  isDraft: boolean;
  content?: { blocks: OutputBlockData<string, Record<string, unknown>>[] };
  coverImgURL?: string;
}

export interface ICreatePublishedBlog {
  title: string;
  content: { blocks: OutputBlockData<string, Record<string, unknown>>[] };
  description: string;
  tags: string[];
  isDraft?: boolean;
  coverImgURL?: string;
}

export interface IBlogQuery {
  tag?: string;
  search?: string;
  authorId?: string;
  draft?: boolean;
  limit?: number;
  nextCursor?: string;
}

export interface IUpdateUserProfile {
  fullname?: string;
  bio?: string;
  profileImage?: string;
  socialLinks?: SocialLink;
}

export interface IComment {
  _id: string;
  blogId: string;
  blogAuthor: string;
  content: string;
  commentedBy: IAuthor;
  commentedAt: string;
  totalReplies: number;
  isEdited: boolean;
}

export interface ICommentQuery {
  blogId?: string; // blog id
  pageSize?: number;
  page?: number;
  commentId?: string;
}

export interface IBookmark {
  userId: string;
  blogId?: string;
  blog?: IBlog;
}

export interface IBookmarkGetQuery {
  blogId?: string;
  pageSize?: number;
  page?: number;
}
