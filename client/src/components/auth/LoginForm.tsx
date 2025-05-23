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
import { googleAuth } from "@/lib/firebase/Firebase";
import { useLogin, useLoginWithGoogle } from "@/lib/react-query/queries";
import { showErrorToast } from "@/lib/utils";
import { useAuthStore } from "@/store";
import { AxiosError } from "axios";
import { FormEvent, useState } from "react";
import { Helmet } from "react-helmet-async";
import { FcGoogle } from "react-icons/fc";
import { IoEye, IoEyeOff, IoKeyOutline, IoMailOutline } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import AnimationWrapper from "../shared/AnimationWrapper";
import FullScreenLoader from "../shared/FullScreenLoader";
import { Input } from "../ui/input";

const LoginForm = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [verificationMsg, setVerificationMsg] = useState("");

  const { mutateAsync: login, isPending: isLoginUser } = useLogin();
  const { mutateAsync: loginWithGoogle, isPending: isGoogleLoginUser } =
    useLoginWithGoogle();

  const setUserAuth = useAuthStore((s) => s.setUserAuth);
  const clearRedirectedUrl = useAuthStore((s) => s.clearRedirectedUrl);
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof LoginValidation>>({
    resolver: zodResolver(LoginValidation),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleLogin = async (user: z.infer<typeof LoginValidation>) => {
    try {
      const userResponse = await login(user);
      const userData = userResponse.data.result;
      if (userData) {
        setUserAuth({ ...userData });
      }

      form.reset();
      const redirectedUrl = useAuthStore.getState().redirectedUrl;
      if (redirectedUrl) {
        navigate(redirectedUrl);
        clearRedirectedUrl();
      } else {
        navigate("/feed");
      }
    } catch (error) {
      let errorMessage = "An error occurred. Please try again later.";
      let verificationMessage = "";
      if (
        error instanceof AxiosError &&
        error.code === "ERR_BAD_REQUEST" &&
        error.response
      ) {
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
            "Account was created using Google. Please log in using Google.";
        } else if (details.toLowerCase().includes("not verified")) {
          verificationMessage =
            "Your account is not verified yet. Please check your email for the most recent verification link or request a new one.";
          errorMessage = "";
        } else {
          errorMessage = details;
        }
      }

      if (verificationMessage) {
        setVerificationMsg(verificationMessage);
      } else {
        setVerificationMsg("");
      }
      if (errorMessage) {
        showErrorToast(errorMessage);
      }
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
        setUserAuth({ ...userData, googleAuth: true });
        const redirectedUrl = useAuthStore.getState().redirectedUrl;
        if (redirectedUrl) {
          navigate(redirectedUrl);
          clearRedirectedUrl();
        } else {
          navigate("/feed");
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
            "Your account was created with email and password. Please log in using those credentials.";
          navigate("/login");
          showErrorToast(errorMessage);
          return;
        } else if (details?.toLowerCase() === "access token has expired") {
          errorMessage =
            "Your session has expired. Please re-login with Google to continue.";
        }
      }
      showErrorToast(errorMessage);
    }
  };

  return (
    <>
      <Helmet>
        <title>Login | BlogSphere</title>
        <meta
          name="description"
          content="Log in to your BlogSphere account to explore a world of blogs, engage with writers, and manage your content effortlessly."
        />
      </Helmet>
      <AnimationWrapper>
        {(isLoginUser || isGoogleLoginUser) && (
          <FullScreenLoader message="Logging you in..." />
        )}

        <section className="h-cover flex-center pt-[18vh]">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleLogin)}
              className="w-[90%] max-w-[400px] md:max-w-[450px] flex flex-col gap-2 md:gap-3 md:form-container"
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
                          className="shad-input pl-11 max-sm:placeholder:text-sm"
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
                          className="shad-input pl-11 max-sm:placeholder:text-sm"
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
              <div className="flex justify-end">
                <Link
                  to="/forgot-password"
                  className="underline text-primary ml-1 text-sm md:text-base"
                >
                  Forgot Password?
                </Link>
              </div>

              <Button
                type="submit"
                className="h-12 rounded-full mt-2 text-sm md:text-base"
                disabled={isLoginUser}
              >
                Log in
              </Button>

              {verificationMsg && (
                <div className="text-center mb-4 bg-red-100 border border-red-400 p-1 rounded-md">
                  <p className="max-sm:text-sm text-red-800  p-2 rounded-md">
                    {verificationMsg}
                  </p>
                  <Link
                    to="/resend-verification-link"
                    className="text-primary underline text-sm md:text-base"
                  >
                    Resend verification link
                  </Link>
                </div>
              )}

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
                className="h-12 border border-muted-foreground/40 rounded-full flex-center gap-3 text-sm md:text-base"
                onClick={handleGoogleAuth}
                disabled={isGoogleLoginUser}
              >
                <FcGoogle size={20} />
                Continue with Google
              </Button>

              <p className="mt-4 text-sm text-center text-muted-foreground">
                By logging in, you agree to BlogSphere's
                <Link
                  to="/privacy-policy"
                  className="no-underline hover:underline ml-1"
                >
                  Privacy Policy.
                </Link>
              </p>
            </form>
          </Form>
        </section>
      </AnimationWrapper>
    </>
  );
};

export default LoginForm;
