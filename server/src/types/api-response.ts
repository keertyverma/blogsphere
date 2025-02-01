import { IBlog } from "../models/blog.model";
import { IUser } from "../models/user.model";

export enum APIStatus {
  SUCCESS = "success",
  ERROR = "error",
}

export type APIResponse<T = any> =
  | SingleAPIResponse<T>
  | OffsetPaginatedAPIResponse<T>
  | CursorPaginatedAPIResponse<T>;

export type BaseAPIResponse = {
  status: APIStatus;
  statusCode: number;
  error?: APIError;
  message?: string;
};

export type SingleAPIResponse<T = any> = BaseAPIResponse & {
  result: T;
};

export type OffsetPaginatedAPIResponse<T = any> = BaseAPIResponse & {
  results?: T[];
  count?: number;
  next?: string | null;
  previous?: string | null;
};

export type CursorPaginatedAPIResponse<T = any> = BaseAPIResponse & {
  results?: T[];
  nextCursor?: string | null;
};

export type APIError = {
  code: string;
  message: string;
  details: string;
};

export interface IErrorCodeMessageMap {
  [key: number]: {
    code: string;
    message: string;
  };
}

export interface IBlogFindQuery {
  isDraft: boolean;
  tags?: string;
}

export interface IBlogResult extends IBlog {
  authorDetails: IUser;
}

export interface IUserUpdate {
  fullname: string;
  bio: string;
  profileImage: string;
  socialLinks: {
    youtube: string;
    instagram: string;
    facebook: string;
    twitter: string;
    github: string;
    website: string;
  };
}
