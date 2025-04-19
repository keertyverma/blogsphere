import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useResetPassword } from "@/lib/react-query/queries";
import { showErrorToast, showSuccessToast } from "@/lib/utils";
import { ResetPasswordValidation } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { IoEye, IoEyeOff, IoKeyOutline } from "react-icons/io5";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import * as z from "zod";
import ErrorPage from "./ErrorPage";

const ResetPassword = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showResendLink, setShowResendLink] = useState(false);
  const [searchParams] = useSearchParams();
  const { mutateAsync: resetPassword, isPending } = useResetPassword();
  const navigate = useNavigate();

  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";

  const form = useForm<z.infer<typeof ResetPasswordValidation>>({
    resolver: zodResolver(ResetPasswordValidation),
    defaultValues: {
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const handleResetPassword = async (
    data: z.infer<typeof ResetPasswordValidation>
  ) => {
    if (!email && !token) return;

    if (data.newPassword !== data.confirmNewPassword) {
      return showErrorToast("Both passwords must match.");
    }

    try {
      await resetPassword({ email, token, password: data.newPassword });
      showSuccessToast(
        "Password reset complete. Please log in with your new password."
      );
      navigate("/login");
    } catch (error) {
      let errorMessage = "An error occurred. Please try again later.";
      if (
        error instanceof AxiosError &&
        error.code === "ERR_BAD_REQUEST" &&
        error.response
      ) {
        const {
          response: {
            data: {
              error: { details },
            },
          },
        } = error;

        if (details.toLowerCase().includes("expired")) {
          // expired link
          setErrorMsg(
            "The password reset link seems to have expired. Request a new link to reset your password."
          );
          setShowResendLink(true);
          errorMessage = "";
        } else {
          // invalid link
          setErrorMsg(
            "The password reset link is no longer valid. Please check your email for the most recent link."
          );
          errorMessage = "";
        }
      }

      if (errorMessage) {
        showErrorToast(errorMessage);
      }
    } finally {
      form.reset();
    }
  };

  if (!email && !token) {
    return <ErrorPage />;
  }

  return (
    <div className="w-full h-full">
      <section className="h-cover flex-center py-[20vh]">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleResetPassword)}
            className="w-[80%] max-w-[450px] flex flex-col gap-2 md:gap-3"
          >
            <div className="text-center">
              <h2 className="text-xl md:text-2xl font-semibold capitalize text-center">
                Reset your password
              </h2>

              <p className="text-muted-foreground my-2 md:mb-2 text-sm md:text-base">
                Ready for a fresh start? Go ahead and set a new password.
              </p>
            </div>
            {isPending && <LoadingSpinner className="flex-col m-auto" />}

            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={passwordVisible ? "text" : "password"}
                        placeholder="New Password"
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
            <FormField
              control={form.control}
              name="confirmNewPassword"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={passwordVisible ? "text" : "password"}
                        placeholder="Confirm New Password"
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
              disabled={isPending}
            >
              Save
            </Button>

            {errorMsg && (
              <div className="max-sm:text-sm text-red-800 bg-red-100 border border-red-400 p-2 rounded-md mt-3">
                <p>{errorMsg}</p>
                {showResendLink && (
                  <p className="text-center mt-2">
                    <Link
                      to="/forgot-password"
                      className="text-primary underline text-sm md:text-base"
                    >
                      Resend reset password link
                    </Link>
                  </p>
                )}
              </div>
            )}
          </form>
        </Form>
      </section>
    </div>
  );
};

export default ResetPassword;
