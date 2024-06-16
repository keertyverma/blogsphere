import { useAuthContext } from "@/context/authContext";
import { useGetUser } from "@/lib/react-query/queries";
import { EditProfileValidation } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
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
  const {
    user: { username },
  } = useAuthContext();
  const { data: user, isLoading, error } = useGetUser(username);
  const [bioValue, setBioValue] = useState(user?.personalInfo.bio || "");
  const [profileImgUrl, setProfileImgUrl] = useState("");

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
    console.log("form data = ", data);
    console.log("profile image url = ", profileImgUrl);

    // TODO: call api to update profile
  };

  const handleDescriptionChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const value = event.target.value;
    if (value) setBioValue(value);
  };

  return (
    <AnimationWrapper>
      <section className="h-cover p-0">
        <div className="max-md:hidden text-center mb-5">
          <h3 className="h3-bold !font-semibold capitalize text-left">
            Edit Profile
          </h3>
          <hr className="mt-2 border-1 border-border" />
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleProfileUpdate)}>
            <div className="flex flex-col md:flex-row gap-5 md:gap-10">
              <div className="flex-1 flex flex-col gap-5">
                <h4 className="text-lg font-semibold">Basic Info</h4>
                <FormField
                  control={form.control}
                  name="profileImageFile"
                  render={({ field }) => (
                    <FormItem className="flex flex-col justify-start">
                      <FormLabel className="text-muted-foreground font-semibold">
                        Profile Photo
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
                      <FormLabel className="text-muted-foreground font-semibold">
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
                      <FormLabel className="text-muted-foreground font-semibold">
                        Bio (about you)
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          className="shad-textarea custom-scrollbar md:text-base placeholder:text-sm"
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
                <h4 className="text-lg font-semibold">Social</h4>
                <FormField
                  control={form.control}
                  name="twitter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground font-semibold">
                        X Profile
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="url"
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
                      <FormLabel className="text-muted-foreground font-semibold">
                        Instagram Profile
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="url"
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
                      <FormLabel className="text-muted-foreground font-semibold">
                        Github Profile
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="url"
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
                  name="youtube"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground font-semibold">
                        YouTube Channel
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://www.youtube.com/channel/channel-name"
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
                      <FormLabel className="text-muted-foreground font-semibold">
                        Facebook Profile
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="url"
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
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground font-semibold">
                        Website URL
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="url"
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
            <div className="max-md:flex-center">
              <Button type="submit" size="lg" className="rounded-full my-4">
                Update
              </Button>
            </div>
          </form>
        </Form>
      </section>
    </AnimationWrapper>
  );
};

export default EditProfile;
