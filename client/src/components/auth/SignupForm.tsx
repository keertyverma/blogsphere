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
import { useState } from "react";
import { BiUser } from "react-icons/bi";
import { FcGoogle } from "react-icons/fc";
import { IoEye, IoEyeOff, IoKeyOutline, IoMailOutline } from "react-icons/io5";
import { Link } from "react-router-dom";
import { Input } from "../ui/input";
import AnimationWrapper from "../AnimationWrapper";

const SignupForm = () => {
  const [passwordVisible, setPasswordVisible] = useState(true);

  const form = useForm<z.infer<typeof SignupValidation>>({
    resolver: zodResolver(SignupValidation),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const handleSignup = (user: z.infer<typeof SignupValidation>) => {
    console.log(user);
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
              name="name"
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
