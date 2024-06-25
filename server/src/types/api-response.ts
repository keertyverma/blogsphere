import { IBlog } from "../models/blog.model";
import { IUser } from "../models/user.model";

export enum APIStatus {
  SUCCESS = "success",
  ERROR = "error",
}

export type APIResponse<T = any> = {
  status: APIStatus;
  statusCode: number;
  results?: T[];
  result?: T;
  error?: APIError;
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
