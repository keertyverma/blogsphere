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
import { useCreateUserAccount } from "../../lib/react-query/queries";
import AnimationWrapper from "../AnimationWrapper";
import { Input } from "../ui/input";

import { toast } from "react-toastify";
import { useAuthContext } from "@/context/AuthProvider";
import { googleAuth } from "@/lib/firebase/Firebase";

const SignupForm = () => {
  const [passwordVisible, setPasswordVisible] = useState(true);
  const createUserAccount = useCreateUserAccount();
  const { setUserAndToken, setIsAuthenticated } = useAuthContext();
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
      const userResponse = await createUserAccount.mutateAsync(user);
      const userData = userResponse.data.data;
      const authToken = userResponse.headers["x-auth-token"];

      if (userData && authToken) {
        setUserAndToken({ ...userData }, authToken);
        setIsAuthenticated(true);
      }

      form.reset();
      navigate("/");
    } catch (error) {
      let errorMessage = "An error occurred. Please try again later.";
      if (error instanceof AxiosError && error.code === "ERR_BAD_REQUEST") {
        const errorResponse = error.response?.data as IFetchResponse<INewUser>;
        errorMessage = (errorResponse.error as IFetchError).details;
      }

      toast.error(errorMessage, {
        position: "top-right",
        className: "mt-20",
      });
    }
  };

  const handleGoogleAuth = async (event: FormEvent) => {
    event.preventDefault();

    try {
      const user = await googleAuth();
      console.log("user = ", user);
      navigate("/");
      // TODO: navigate to dashboard
    } catch (error) {
      toast.error("Unable to login with Google", {
        position: "top-right",
        className: "mt-20",
      });
      return console.log("error = ", error);
    }
  };

  return (
    <AnimationWrapper>
      <section className="h-cover flex-center">
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
            </div>
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
