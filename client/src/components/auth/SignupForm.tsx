import { SignupValidation } from "@/lib/validation";
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
import { IFetchError, IFetchResponse, INewUser } from "@/types";
import { AxiosError } from "axios";
import { FormEvent, useState } from "react";
import { BiUser } from "react-icons/bi";
import { FcGoogle } from "react-icons/fc";
import { IoEye, IoEyeOff, IoKeyOutline, IoMailOutline } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import {
  useCreateUserAccount,
  useLoginWithGoogle,
} from "../../lib/react-query/queries";
import AnimationWrapper from "../shared/AnimationWrapper";
import { Input } from "../ui/input";

import { googleAuth } from "@/lib/firebase/Firebase";
import { useAuthStore } from "@/store";
import { toast } from "react-toastify";
import LoadingSpinner from "../ui/LoadingSpinner";

const SignupForm = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [hasSentEmail, setHasSentEmail] = useState(false);

  const { mutateAsync: createUserAccount, isPending: isCreatingUser } =
    useCreateUserAccount();
  const { mutateAsync: loginWithGoogle, isPending: isGoogleLoginUser } =
    useLoginWithGoogle();
  const isLoading = isCreatingUser || isGoogleLoginUser;

  const setUserAuth = useAuthStore((s) => s.setUserAuth);
  const clearRedirectedUrl = useAuthStore((s) => s.clearRedirectedUrl);
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof SignupValidation>>({
    resolver: zodResolver(SignupValidation),
    defaultValues: {
      fullname: "",
      email: "",
      password: "",
    },
  });

  const handleSignup = async (user: z.infer<typeof SignupValidation>) => {
    try {
      const userResponse = await createUserAccount(user);
      if (userResponse.status === 201) {
        // user registered and verification email has been sent.
        setHasSentEmail(true);
      }
      form.reset();
    } catch (error) {
      let errorMessage = "An error occurred. Please try again later.";
      if (error instanceof AxiosError) {
        const errorResponse = error.response?.data as IFetchResponse<INewUser>;
        const errorDetail = (errorResponse.error as IFetchError).details;
        if (errorDetail.includes("verification email")) {
          errorMessage =
            "Registration successful, but the verification email could not be sent. \n You can request a new one when you log in.";
        } else if (error.code === "ERR_BAD_REQUEST") {
          errorMessage = errorDetail;
        }
      }

      toast.error(errorMessage, {
        position: "top-right",
        className: "mt-10",
        autoClose: 10000,
      });
    }
  };

  const handleGoogleAuth = async (event: FormEvent) => {
    event.preventDefault();

    try {
      const googleUser = await googleAuth();
      if (!googleUser) {
        throw new Error("Invalid Google email/password");
      }

      const accessToken = await googleUser.getIdToken();
      const userResponse = await loginWithGoogle(accessToken);
      const { data } = userResponse;
      const { result: userData } = data;

      if (userData) {
        setUserAuth({ ...userData });
        const redirectedUrl = useAuthStore.getState().redirectedUrl;
        if (redirectedUrl) {
          navigate(redirectedUrl);
          clearRedirectedUrl();
        } else {
          navigate("/");
        }
      }
    } catch (error) {
      let errorMessage = "An error occurred. Please try again later.";
      if (error instanceof AxiosError && error.response) {
        const {
          response: {
            status,
            data: {
              error: { details },
            },
          },
        } = error;

        if (status === 403) {
          errorMessage =
            "Email already registered. Please use email & password to login";
          navigate("/login");
          toast.error(errorMessage, {
            position: "top-right",
            className: "mt-20",
          });
          return;
        } else if (details?.toLowerCase() === "access token has expired") {
          errorMessage = "Please re-login with google account";
        }
      }
      toast.error(errorMessage, {
        position: "top-right",
        className: "mt-20",
      });
    }
  };

  return (
    <AnimationWrapper>
      <section className="h-cover flex-center py-[20vh]">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSignup)}
            className="w-[80%] max-w-[400px] flex flex-col gap-2 md:gap-3"
          >
            <div className="text-center">
              <h2 className="h3-bold md:h2-bold capitalize">join us today</h2>
              <p className="text-light-3 base-medium md:body-medium my-2 md:mb-4">
                Create your account
              </p>
              {hasSentEmail && (
                <p className="max-sm:text-sm text-green-800 bg-green-100 border border-green-400 p-2 rounded-md">
                  Verification email sent. Please verify to complete the
                  registration.
                </p>
              )}
            </div>
            {isLoading && <LoadingSpinner className="flex-col m-auto" />}
            <FormField
              control={form.control}
              name="fullname"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="Full Name"
                        className="shad-input pl-11"
                        {...field}
                      />
                      <BiUser className="input-icon left-4" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
              disabled={isLoading}
            >
              Sign Up
            </Button>

            <p className="text-sm md:text-base text-center text-secondary-foreground">
              Already have an account?
              <Link to="/login" className="underline text-primary ml-1">
                Log in
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
              onClick={handleGoogleAuth}
              disabled={isLoading}
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

export default SignupForm;
