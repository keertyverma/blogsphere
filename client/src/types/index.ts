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
