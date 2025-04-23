import { ChangePasswordValidation } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import AnimationWrapper from "../shared/AnimationWrapper";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";

import { useUpdatePassword } from "@/lib/react-query/queries";
import { showErrorToast, showSuccessToast } from "@/lib/utils";
import { useAuthStore } from "@/store";
import { AxiosError } from "axios";
import { useState } from "react";
import { IoEye, IoEyeOff, IoKeyOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import TextWithLoader from "../ui/text-with-loader";

const ChangePassword = () => {
  const [passwordVisible, setPasswordVisible] = useState(true);
  const { mutateAsync: updatePassword, isPending: isUpdatingPassword } =
    useUpdatePassword();
  const clearUserAuth = useAuthStore((s) => s.clearUserAuth);
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof ChangePasswordValidation>>({
    resolver: zodResolver(ChangePasswordValidation),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
    },
    mode: "onChange", // Set validation mode to trigger on every input change
  });

  const handlePasswordChange = async (
    data: z.infer<typeof ChangePasswordValidation>
  ) => {
    try {
      const { currentPassword, newPassword } = data;
      await updatePassword({
        currentPassword,
        newPassword,
      });

      showSuccessToast(
        "Password updated successfully! Please log in again to continue."
      );
      form.reset();
      navigate("/login");
      clearUserAuth();
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

        if (status === 403 || status === 400) {
          errorMessage = details;
        }
      }

      if (!useAuthStore.getState().isTokenExpired) {
        showErrorToast(errorMessage);
      }
    }
  };

  return (
    <AnimationWrapper>
      <section className="h-cover p-0">
        <div className="max-md:hidden text-center">
          <h3 className="h3-bold !font-semibold capitalize text-left">
            Change password
          </h3>
          <hr className="mt-2 border-1 border-border" />
        </div>
        <p className="mt-2 mb-5 text-left text-slate-500 dark:text-slate-400">
          Enhance your security by updating your password regularly.
        </p>
        <div className="flex-center mt-10 md:mt-16">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handlePasswordChange)}
              className="w-full max-w-[400px] flex flex-col gap-2 md:gap-3 md:form-container md:!py-12"
            >
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={passwordVisible ? "text" : "password"}
                          placeholder="Current Password"
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

              <Button
                type="submit"
                className="h-12 rounded-full mt-2 text-sm md:text-base flex-center gap-1"
                disabled={isUpdatingPassword}
              >
                <TextWithLoader
                  text="Update"
                  isLoading={isUpdatingPassword}
                  loaderClassName="text-white"
                />
              </Button>
            </form>
          </Form>
        </div>
      </section>
    </AnimationWrapper>
  );
};

export default ChangePassword;
