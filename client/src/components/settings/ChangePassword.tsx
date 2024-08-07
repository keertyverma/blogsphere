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
import { useAuthStore } from "@/store";
import { AxiosError } from "axios";
import { useState } from "react";
import { IoEye, IoEyeOff, IoKeyOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

const ChangePassword = () => {
  const [passwordVisible, setPasswordVisible] = useState(true);
  const { mutateAsync: updatePassword, isPending: isUpdatingPassword } =
    useUpdatePassword();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof ChangePasswordValidation>>({
    resolver: zodResolver(ChangePasswordValidation),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
    },
  });

  const handlePasswordChange = async (
    data: z.infer<typeof ChangePasswordValidation>
  ) => {
    const loadingToast = toast.loading("Updating...");
    try {
      const { currentPassword, newPassword } = data;
      await updatePassword({
        currentPassword,
        newPassword,
      });

      toast.dismiss(loadingToast);
      toast.success("Password Updated. Please login again.");
      form.reset();
      navigate("/login");
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

      toast.dismiss(loadingToast);
      if (!useAuthStore.getState().isTokenExpired) {
        toast.error(errorMessage);
      }
    }
  };

  return (
    <AnimationWrapper>
      <section className="h-cover flex justify-center p-0">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handlePasswordChange)}
            className="w-[80%] max-w-[400px] flex flex-col gap-2 md:gap-3"
          >
            <div className="text-center mb-4">
              <h3 className="max-md:hidden md:h3-bold !font-semibold capitalize">
                Change Password
              </h3>
            </div>
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
              className="h-12 rounded-full mt-2 text-sm md:text-base"
              disabled={isUpdatingPassword}
            >
              Update
            </Button>
          </form>
        </Form>
      </section>
    </AnimationWrapper>
  );
};

export default ChangePassword;
