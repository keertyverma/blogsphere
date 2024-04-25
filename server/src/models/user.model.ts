import { Schema, model } from "mongoose";
import Joi from "joi";

interface IUser {
  personalInfo: {
    fullname: string;
    email: string;
    password: string;
    username?: string;
    bio?: string;
    profileImage?: string;
  };
}

const userSchema = new Schema(
  {
    personalInfo: {
      fullname: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        minlength: 2,
        maxlength: 50,
      },
      email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        minlength: 5,
        maxlength: 255,
        unique: true,
      },
      password: {
        type: String,
        required: true,
        trim: true,
        minlength: 8,
        maxlength: 1024,
      },
      username: {
        type: String,
        minlength: [3, "Username must be atleast 3 letters long"],
        unique: true,
      },
      bio: {
        type: String,
        maxlength: [200, "Bio should not be more than 200"],
        default: "",
      },
      profileImage: {
        type: String,
        default: "",
      },
    },
  },
  { timestamps: true }
);

const User = model("User", userSchema);

const validateUser = (user: IUser) => {
  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,20}$/;

  const schema = Joi.object({
    fullname: Joi.string().min(2).max(50).required(),
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string()
      .min(5)
      .max(1024)
      .required()
      .pattern(passwordRegex)
      .message(
        "Password must be 8 to 20 characters long and contain at least 1 numeric digit, 1 lowercase letter and 1 uppercase letter."
      ),
  });

  return schema.validate(user);
};

export { IUser, User, validateUser };
