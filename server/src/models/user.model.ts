import { Schema, model, Document } from "mongoose";
import Joi from "joi";
import jwt from "jsonwebtoken";
import config from "config";

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

interface IUserDocument extends IUser, Document {
  generateAuthToken(): string;
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
        default: () => getRandomProfileImage(),
      },
    },
  },
  { timestamps: true }
);

userSchema.methods.generateAuthToken = function (): string {
  return jwt.sign(
    {
      id: this._id,
    },
    config.get("secretAccessKey")
  );
};

const User = model<IUserDocument>("User", userSchema);

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

const getRandomProfileImage = (): string => {
  const profileImages: { [key: string]: string[] } = {
    "adventurer-neutral": [
      "Gizmo",
      "Callie",
      "Garfield",
      "Simon",
      "Molly",
      "Angel",
      "Sheba",
      "Sam",
      "Spooky",
    ],
    "lorelei-neutral": [
      "Rocky",
      "Oliver",
      "Sam",
      "Oscar",
      "Snuggles",
      "Patches",
      "Spooky",
      "Jasper",
      "Pepper",
      "Garfield",
    ],
    "notionists-neutral": [
      "Mittens",
      "Tinkerbell",
      "Jack",
      "Kitty",
      "Bailey",
      "Oscar",
      "Pumpkin",
      "Felix",
    ],
  };

  const collections = Object.keys(profileImages);
  const randomCollection =
    collections[Math.floor(Math.random() * collections.length)];

  const imageNames = profileImages[randomCollection];
  const randomImageName =
    imageNames[Math.floor(Math.random() * imageNames.length)];

  return `https://api.dicebear.com/8.x/${randomCollection}/svg?seed=${randomImageName}`;
};
export { IUser, User, validateUser };
