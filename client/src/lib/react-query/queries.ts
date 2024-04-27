import { IFetchResponse, INewUser } from "@/types";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

export const useCreateUserAccount = () =>
  useMutation({
    mutationFn: (user: INewUser) =>
      axios.post<IFetchResponse<INewUser>>(
        `${import.meta.env.VITE_SERVER_DOMAIN}/users/register`,
        user
      ),
  });
