import { useGetUser, useUpdateUserProfile } from "@/lib/react-query/queries";
import { EditProfileValidation } from "@/lib/validation";
import { useAuthStore } from "@/store";
import { IUpdateUserProfile, SocialLink } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaFacebook, FaGithub, FaInstagram, FaYoutube } from "react-icons/fa";
import { RiTwitterXFill } from "react-icons/ri";
import { SlGlobe } from "react-icons/sl";
import { toast } from "react-toastify";
import * as z from "zod";
import AnimationWrapper from "../shared/AnimationWrapper";
import LoadingSpinner from "../ui/LoadingSpinner";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import ProfileUploader from "./ProfileUploader";

const EditProfile = () => {
  const BIO_CHAR_LIMIT = 200;
  const { username } = useAuthStore((s) => s.user);
  const { data: user, isLoading, error } = useGetUser(username);
  const [bioValue, setBioValue] = useState(user?.personalInfo.bio || "");
  const [profileImgUrl, setProfileImgUrl] = useState("");
  const { mutateAsync: updateProfile, isPending: isUpdating } =
    useUpdateUserProfile();

  const form = useForm<z.infer<typeof EditProfileValidation>>({
    resolver: zodResolver(EditProfileValidation),
    defaultValues: {
      fullname: "",
      bio: "",
      profileImageFile: [],
      youtube: "",
      instagram: "",
      facebook: "",
      twitter: "",
      github: "",
      website: "",
    },
    mode: "onBlur", // Validate when the input field loses focus (i.e., when the user clicks away or tabs out of the field)
  });

  useEffect(() => {
    if (user) {
      form.reset({
        fullname: user.personalInfo.fullname || "",
        bio: user.personalInfo.bio || "",
        profileImageFile: [user.personalInfo.profileImage || ""],
        youtube: user.socialLinks.youtube || "",
        instagram: user.socialLinks.instagram || "",
        facebook: user.socialLinks.facebook || "",
        twitter: user.socialLinks.twitter || "",
        github: user.socialLinks.github || "",
        website: user.socialLinks.website || "",
      });
    }
  }, [user, form.reset]);

  if (isLoading)
    return (
      <section>
        <LoadingSpinner />
      </section>
    );

  if (error) console.error(error);

  if (!user)
    return (
      <section>
        <div className="lg:w-[50%] text-center p-3 rounded-full bg-muted mt-10">
          <p>No user available</p>
        </div>
      </section>
    );

  const handleProfileUpdate = async (
    data: z.infer<typeof EditProfileValidation>
  ) => {
    try {
      const { fullname, bio, ...socialData } = data;
      const socialKeys: (keyof SocialLink)[] = [
        "youtube",
        "instagram",
        "github",
        "website",
        "facebook",
        "twitter",
      ];
      const socialLinks: Partial<SocialLink> = {};
      socialKeys.forEach((key) => {
        if (key in socialData) {
          socialLinks[key] = socialData[key];
        }
      });

      const toUpdate: IUpdateUserProfile = {
        ...(fullname && { fullname }),
        bio,
        ...(profileImgUrl && { profileImage: profileImgUrl }),
        ...(Object.keys(socialLinks).length && {
          socialLinks: socialLinks as SocialLink,
        }),
      };

      // Update profile
      await updateProfile(toUpdate);

      toast.success("Profile Updated.👍");
    } catch (error) {
      if (!useAuthStore.getState().isTokenExpired) {
        toast.error("An error occurred. Please try again later.");
      }
    }
  };

  const handleDescriptionChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const value = event.target.value;
    setBioValue(value);
  };

  return (
    <AnimationWrapper>
      <section className="h-cover p-0 pb-20">
        <div className="text-center mb-5">
          <h3 className="h3-bold !font-semibold capitalize text-left">
            Profile
          </h3>
          <p className="text-left text-slate-500 dark:text-slate-400">
            Manage your BlogSphere profile
          </p>
          <hr className="mt-3 border-1 border-border" />
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleProfileUpdate)}>
            <div className="flex flex-col lg:flex-row gap-5 md:gap-10">
              <div className="flex-1 flex flex-col gap-5">
                <h4 className="text-lg font-semibold">Basic Info</h4>
                <FormField
                  control={form.control}
                  name="profileImageFile"
                  render={({ field }) => (
                    <FormItem className="flex flex-col justify-start">
                      <FormLabel className="text-secondary-foreground font-semibold">
                        Profile Image
                      </FormLabel>
                      <FormControl>
                        <ProfileUploader
                          fieldChange={field.onChange}
                          mediaUrl={user.personalInfo.profileImage ?? ""}
                          onUpload={(url) => setProfileImgUrl(url)}
                        />
                      </FormControl>
                      <FormMessage className="shad-form_message" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fullname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-secondary-foreground font-semibold">
                        Full name
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Enter your full name"
                          className="shad-input md:text-base"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="shad-form_message" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-secondary-foreground font-semibold">
                        Bio (About You)
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          className="shad-textarea custom-scrollbar md:text-base placeholder:text-sm"
                          placeholder="Tell us your story"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            handleDescriptionChange(e);
                          }}
                        />
                      </FormControl>
                      <FormMessage className="shad-form_message" />
                      {bioValue?.length < BIO_CHAR_LIMIT && (
                        <FormDescription className="text-sm text-muted-foreground text-right">
                          {BIO_CHAR_LIMIT - bioValue?.length} characters left
                        </FormDescription>
                      )}
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex-1 flex flex-col gap-5">
                <hr className="md:hidden" />
                <div>
                  <h4 className="text-lg font-semibold">Social Profiles</h4>
                  <p className="mt-2 text-left text-slate-500 dark:text-slate-400 text-sm md:text-base">
                    The social links you add here will show up on your profile.
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="twitter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex gap-2 text-secondary-foreground font-semibold">
                        <RiTwitterXFill />
                        X/Twitter
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://x.com/username"
                          className="shad-input md:text-base"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="shad-form_message" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="instagram"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex gap-2 text-secondary-foreground font-semibold">
                        <FaInstagram /> Instagram
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://instagram.com/username"
                          className="shad-input md:text-base"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="shad-form_message" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="github"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex gap-2 text-secondary-foreground font-semibold">
                        <FaGithub /> Github
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://github.com/username"
                          className="shad-input md:text-base"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="shad-form_message" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="facebook"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex gap-2 text-secondary-foreground font-semibold">
                        <FaFacebook /> Facebook
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://facebook.com/username"
                          className="shad-input md:text-base"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="shad-form_message" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="youtube"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex gap-2 text-secondary-foreground font-semibold">
                        <FaYoutube /> YouTube
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://youtube.com/username"
                          className="shad-input md:text-base"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="shad-form_message" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex gap-2 text-secondary-foreground font-semibold">
                        <SlGlobe /> Website
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://username.com"
                          className="shad-input md:text-base"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="shad-form_message" />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            {/* fixed update button located at the footer of the page */}
            <div className="w-full fixed bottom-0 left-0 border-t-2 bg-header p-4 z-30">
              <div className="flex justify-center">
                <Button
                  type="submit"
                  size="lg"
                  className="rounded-full"
                  disabled={isUpdating}
                >
                  {isUpdating ? "Updating..." : "Update"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </section>
    </AnimationWrapper>
  );
};

export default EditProfile;
