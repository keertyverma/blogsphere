export enum APIStatus {
  SUCCESS = "success",
  ERROR = "error",
}

export type APIResponse<T = any> = {
  status: APIStatus;
  statusCode: number;
  data?: T[] | T;
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
