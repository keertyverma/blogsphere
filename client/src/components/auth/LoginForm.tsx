import { LoginValidation } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { IoEye, IoEyeOff, IoKeyOutline, IoMailOutline } from "react-icons/io5";
import { Link } from "react-router-dom";
import { Input } from "../ui/input";
import AnimationWrapper from "../AnimationWrapper";
import { useLogin } from "@/lib/react-query/queries";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import { IFetchError, IFetchResponse, INewUser } from "@/types";
import { useAuthContext } from "@/context/AuthProvider";

const LoginForm = () => {
  const [passwordVisible, setPasswordVisible] = useState(true);
  const login = useLogin();
  const { setUserAndToken } = useAuthContext();

  const form = useForm<z.infer<typeof LoginValidation>>({
    resolver: zodResolver(LoginValidation),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleLogin = async (user: z.infer<typeof LoginValidation>) => {
    try {
      const userResponse = await login.mutateAsync(user);
      const userData = userResponse.data.data;
      const authToken = userResponse.headers["x-auth-token"];

      if (userData && authToken) {
        setUserAndToken({ ...userData }, authToken);
      }

      form.reset();
      toast.success("Login is successful.", {
        position: "top-right",
        autoClose: 3000,
        className: "mt-20",
      });
    } catch (error) {
      let errorMessage = "An error occurred. Please try again later.";
      if (error instanceof AxiosError && error.code === "ERR_BAD_REQUEST") {
        console.log("error = ", error);

        const errorResponse = error.response?.data as IFetchResponse<INewUser>;
        errorMessage = (errorResponse.error as IFetchError).details;
      }

      toast.error(errorMessage, {
        position: "top-right",
        className: "mt-20",
      });
    }
  };

  return (
    <AnimationWrapper>
      <section className="h-cover flex-center">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleLogin)}
            className="w-[80%] max-w-[400px] flex flex-col gap-2 md:gap-3"
          >
            <div className="text-center mb-4">
              <h2 className="h3-bold md:h2-bold capitalize">welcome back</h2>
              <p className="text-light-3 base-medium md:body-medium my-2 md:mb-4">
                Login to your account
              </p>
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="email"
                        placeholder="Email"
                        className="shad-input pl-11"
                        {...field}
                      />
                      <IoMailOutline className="input-icon left-4" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={passwordVisible ? "text" : "password"}
                        placeholder="Password"
                        autoComplete="on"
                        className="shad-input pl-11"
                        {...field}
                      />
                      <IoKeyOutline className="input-icon left-4" />
                      {passwordVisible ? (
                        <IoEye
                          onClick={() => setPasswordVisible((prev) => !prev)}
                          className="input-icon right-4 cursor-pointer"
                        />
                      ) : (
                        <IoEyeOff
                          onClick={() => setPasswordVisible((prev) => !prev)}
                          className="input-icon right-4 cursor-pointer"
                        />
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="h-12 rounded-full mt-2 text-sm md:text-base"
            >
              Log in
            </Button>

            <p className="text-sm md:text-base text-center text-secondary-foreground">
              Don't have an account?
              <Link to="/signup" className="underline text-primary ml-1">
                Join us today
              </Link>
            </p>

            <div className="w-full flex-center gap-3 my-2 md:my-3 uppercase text-muted-foreground font-medium">
              <hr className="w-1/2 border-b border-border " />
              or
              <hr className="w-1/2 border-b border-border" />
            </div>

            <Button
              variant="secondary"
              className="h-12 border-b border-slate-500 rounded-full flex-center gap-3 text-sm md:text-base"
            >
              <FcGoogle size={20} />
              Continue with Google
            </Button>
          </form>
        </Form>
      </section>
    </AnimationWrapper>
  );
};

export default LoginForm;
