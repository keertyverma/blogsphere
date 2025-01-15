import config from "config";
import crypto from "crypto";
import Joi from "joi";
import jwt from "jsonwebtoken";
import { Document, Schema, Types, model } from "mongoose";
import ms from "ms";

interface IUser extends Document {
  personalInfo: {
    fullname: string;
    email: string;
    password?: string;
    username?: string;
    bio?: string;
    profileImage?: string;
  };
  googleAuth: boolean;
  accountInfo: {
    totalPosts: number;
    totalReads: number;
  };
  blogs: string[];
  updatedAt: Date;
  socialLinks: {
    youtube: string;
    instagram: string;
    facebook: string;
    twitter: string;
    github: string;
    website: string;
  };
  isVerified: boolean;
  verificationToken?: {
    token: string;
    expiresAt: Date;
  };
  resetPasswordToken?: {
    token: string;
    expiresAt: Date;
  };
}

interface IUserDocument extends IUser, Document {
  generateAuthToken(): string;
  generateVerificationToken(): {
    token: string;
    hashedToken: string;
    expiresAt: Date;
  };
  generateResetPasswordToken(): {
    token: string;
    hashedToken: string;
    expiresAt: Date;
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
        maxlength: [200, "Bio should not be more than 200 characters."],
        default: "",
      },
      profileImage: {
        type: String,
        default: () => getRandomProfileImage(),
      },
    },
    googleAuth: {
      type: Boolean,
      default: false,
    },
    accountInfo: {
      totalPosts: {
        type: Number,
        default: 0,
      },
      totalReads: {
        type: Number,
        default: 0,
      },
    },
    blogs: [
      {
        type: Types.ObjectId,
        ref: "Blog",
      },
    ],
    socialLinks: {
      youtube: {
        type: String,
        default: "",
      },
      instagram: {
        type: String,
        default: "",
      },
      facebook: {
        type: String,
        default: "",
      },
      twitter: {
        type: String,
        default: "",
      },
      github: {
        type: String,
        default: "",
      },
      website: {
        type: String,
        default: "",
      },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      token: String,
      expiresAt: Date,
    },
    resetPasswordToken: {
      token: String,
      expiresAt: Date,
    },
  },
  { timestamps: true }
);

userSchema.methods.generateAuthToken = function (): string {
  return jwt.sign(
    {
      id: this.id,
    },
    config.get("secretAccessKey") as string,
    {
      expiresIn: config.get("expiresIn.authToken"),
    }
  );
};

// generate and return verification token with expiry
userSchema.methods.generateVerificationToken = function (): {
  token: string;
  hashedToken: string;
  expiresAt: Date;
} {
  // generate a random token
  const token = crypto.randomBytes(24).toString("hex");

  // hash the token to store in DB for data security
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  // set token expiration
  const expiresIn = ms(config.get("expiresIn.verificationToken"));
  const expiresAt = new Date(Date.now() + expiresIn);

  return { token, hashedToken, expiresAt };
};

// generate and return reset password token with expiry
userSchema.methods.generateResetPasswordToken = function (): {
  token: string;
  hashedToken: string;
  expiresAt: Date;
} {
  // generate a random token
  const token = crypto.randomBytes(24).toString("hex");

  // hash the token to store in DB for data security
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  // set token expiration
  const expiresIn = ms(config.get("expiresIn.resetPasswordToken"));
  const expiresAt = new Date(Date.now() + expiresIn);

  return { token, hashedToken, expiresAt };
};

const User = model<IUserDocument>("User", userSchema);

const validateUser = (user: IUser) => {
  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,20}$/;

  const schema = Joi.object({
    fullname: Joi.string().min(2).max(50).trim().required(),
    email: Joi.string().min(5).max(255).trim().required().email(),
    password: Joi.string()
      .min(5)
      .max(1024)
      .trim()
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
