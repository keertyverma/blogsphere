import { IFetchResponse, INewUser } from "@/types";
import { useMutation } from "@tanstack/react-query";
import apiClient from "../api-client";

export const useCreateUserAccount = () =>
  useMutation({
    mutationFn: (user: INewUser) =>
      apiClient.post<IFetchResponse<INewUser>>("/users/register", user),
  });

export const useLogin = () =>
  useMutation({
    mutationFn: (user: { email: string; password: string }) =>
      apiClient.post("/auth", user),
  });
