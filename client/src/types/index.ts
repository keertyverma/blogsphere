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
  data?: T[] | T;
  error?: IFetchError;
};

export interface IUser {
  id: string;
  email: string;
  fullname: string;
  username: string;
  profileImage: string;
}

export interface IAuthor {
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
  createdAt: string;
}

export interface IBlog {
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
  };
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
}
