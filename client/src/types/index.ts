import { OutputData } from "@editorjs/editorjs";

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type IFetchResponse<T = any> = {
  result: T;
  error?: IFetchError;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type IFetchAllResponse<T = any> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
  error?: IFetchError;
};

export interface IUser {
  id: string;
  email: string;
  fullname: string;
  username: string;
  profileImage: string;
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
  authorDetails: IAuthor;
  content: OutputData;
  createdAt?: string; //timestamp
  activity?: {
    totalLikes: number;
    totalReads: number;
    totalComments: number;
    totalParentComments: number;
  };
  likes?: { [key: string]: boolean };
  isDraft?: boolean;
}

export interface ICreateBlog {
  title: string;
  description: string;
  content: OutputData;
  coverImgURL?: string;
  tags: string[];
}

export interface IBlogQuery {
  tag?: string;
  search?: string;
  authorId?: string;
  draft?: boolean;
  pageSize?: number;
  page?: number;
}

export interface IUpdateUserProfile {
  fullname?: string;
  bio?: string;
  profileImage?: string;
  socialLinks?: SocialLink;
}
