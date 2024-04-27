import * as z from "zod";

export const SignupValidation = z.object({
  fullname: z
    .string()
    .min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email(),
  password: z.string().regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,20}$/, {
    message:
      "Password should be 8 to 20 characters long with atleast 1 numeric, 1 lowercase and 1 uppercase letters.",
  }),
});

export const LoginValidation = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." }),
});
