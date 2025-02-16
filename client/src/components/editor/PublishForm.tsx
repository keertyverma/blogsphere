import { useCreateBlog, useUpdateBlog } from "@/lib/react-query/queries";
import { BlogValidation } from "@/lib/validation";
import { useAuthStore, useEditorStore } from "@/store";
import { IBlog, ICreatePublishedBlog } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChangeEvent, KeyboardEvent, useState } from "react";
import { useForm } from "react-hook-form";
import { IoClose } from "react-icons/io5";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
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
import Tag from "./Tag";

const PublishForm = () => {
  const TAG_LIMIT = 10;
  const DESCRIPTION_CHAR_LIMIT = 200;
  const {
    blog,
    blog: { title, coverImgURL, description = "", tags = [], content },
  } = useEditorStore((s) => ({ blog: s.blog }));
  const setBlog = useEditorStore((s) => s.setBlog);
  const setIsPublish = useEditorStore((s) => s.setIsPublish);
  const setIsPublishClose = useEditorStore((s) => s.setIsPublishClose);
  const [searchParams] = useSearchParams();
  const isDraft = searchParams.get("isDraft") === "true";

  const [descriptionValue, setDescriptionValue] = useState(description);

  const { mutateAsync: createBlog, isPending: isPublishing } = useCreateBlog();
  const { mutateAsync: updatePublishedBlog, isPending: isUpdating } =
    useUpdateBlog();

  const { blogId } = useParams();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof BlogValidation>>({
    resolver: zodResolver(BlogValidation),
    defaultValues: {
      title: title,
      description: description,
      tag: "",
    },
  });

  const handleSubmit = async (value: z.infer<typeof BlogValidation>) => {
    const { title, description, tag } = value;

    // tags are required
    if (blog.tags.length === 0 && !tag) {
      toast.error("Please add at least one tag to publish.");
      return;
    }

    const updatedBlog: ICreatePublishedBlog = {
      title,
      description,
      content: { blocks: content.blocks },
      tags: blog.tags.length === 0 ? [tag] : blog.tags,
    };

    if (coverImgURL) {
      updatedBlog.coverImgURL = coverImgURL;
    }

    setBlog({ ...blog, ...updatedBlog });
    const publishedBlog = {
      ...updatedBlog,
      isDraft: false,
    };

    try {
      let message = "";
      let blogUrl = "";
      if (blogId) {
        // edit mode - publish updated blog
        const updatedBlog = await updatePublishedBlog({
          blogId,
          blog: publishedBlog,
          isPublishingDraft: isDraft ? true : false,
        });
        message = isDraft ? "Blog Published 🥳" : "Blog Updated";
        blogUrl = `/blogs/${updatedBlog.blogId}`;
      } else {
        // create mode - publish new blog
        const newBlog: IBlog = await createBlog(publishedBlog);
        message = "Blog Published 🥳";
        blogUrl = `/blogs/${newBlog.blogId}`;
      }
      toast.success(message);
      form.reset();
      setIsPublish(false);
      navigate(blogUrl);
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
    setDescriptionValue(value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };
  const addTags = (tag: string) => {
    if (tags.length < TAG_LIMIT) {
      // add tag
      if (tag.length && !tags.includes(tag))
        setBlog({ ...blog, tags: [...tags, tag] });
    } else {
      toast.error(
        `Maximum tag limit of ${TAG_LIMIT} reached. You can’t add any more tags.`
      );
    }
  };

  /**
   * Handle input key down event for adding tags.
   * Triggers when 'Enter' key is pressed, preventing default behavior.
   * Adds the trimmed input value as a tag.
   * Resets the input value after processing.
   *
   * @param {KeyboardEvent<HTMLInputElement>} e - The input keyboard event object.
   */
  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    /* This function does not handle the 'comma' key event due to an issue with the Android Google browser. 
      In this browser, the comma key is not properly identified, and instead, a keycode of 229 is returned for most keys.
      Known Chromium Bug -> https://issues.chromium.org/issues/41368867
    */

    if (e.key === "Enter") {
      e.preventDefault();

      const inputElement = e.target as HTMLInputElement;
      const tag = inputElement.value.trim();
      addTags(tag);

      // reset input value
      form.setValue("tag", "");
    }
  };

  /**
   * Handle input change event for adding tags.
   * Checks if a 'comma' is present at the end of the input value,
   * Extracts the value other than the comma, and adds it as a tag.
   * Resets the input value after processing.
   *
   * @param {ChangeEvent<HTMLInputElement>} e - The input change event object.
   */
  const handleTagOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputElement = e.target as HTMLInputElement;
    const inputValue = inputElement.value.trim();

    if (inputValue.endsWith(",")) {
      const tag = inputValue.slice(0, -1).trim();
      addTags(tag);

      form.setValue("tag", "");
    }
  };

  return (
    <AnimationWrapper>
      <section className="px-6 mx-auto md:max-w-[728px] flex flex-col gap-2 py-12">
        <div className="mb-5">
          <h3 className="h3-bold !font-semibold capitalize text-left">
            Publish your blog
          </h3>
          <p className="mt-1 text-muted-foreground">
            Share your thoughts with the world.
          </p>
          <hr className="mt-2 border-1 border-border" />
        </div>
        <Button
          variant="outline"
          size="sm"
          className="absolute right-[5vw] top-[2%] z-10 bg-muted rounded-lg"
          onClick={() => {
            setIsPublish(false);
            setIsPublishClose(true);
          }}
        >
          <IoClose className="text-xl" />
        </Button>
        <Form {...form}>
          <form
            className="w-full flex flex-col gap-4 md:border-[1px] border-border md:shadow-md rounded-lg p-0 md:p-6"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base text-secondary-foreground">
                    Blog Title <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Title"
                      className="shad-input text-base placeholder:text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="shad-form_message" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base text-secondary-foreground">
                    Blog Summary <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormDescription className="text-muted-foreground">
                    Summary will be displayed in the feed and search results.
                    Keep it brief and informative.
                  </FormDescription>
                  <FormControl>
                    <Textarea
                      className="shad-textarea custom-scrollbar text-base placeholder:text-sm"
                      placeholder="Summarize your blog in a few words"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        handleDescriptionChange(e);
                      }}
                      onKeyDown={handleKeyDown}
                    />
                  </FormControl>
                  <FormMessage className="shad-form_message" />
                  {descriptionValue.length > 0 &&
                    descriptionValue.length < DESCRIPTION_CHAR_LIMIT && (
                      <FormDescription className="text-sm text-muted-foreground text-right">
                        {DESCRIPTION_CHAR_LIMIT - descriptionValue.length}{" "}
                        characters left
                      </FormDescription>
                    )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tag"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base text-secondary-foreground">
                    Tags <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormDescription className="text-muted-foreground">
                    Add relevant tags to improve your blog's visibility in
                    search results.
                  </FormDescription>
                  <FormControl>
                    <div className="relative input-box">
                      <Input
                        type="text"
                        placeholder="Type a tag and press enter or comma to add"
                        className="mt-1 bg-muted sticky top-0 left-0 mb-3 md:text-base placeholder:text-sm"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          handleTagOnChange(e);
                        }}
                        onKeyDown={handleTagKeyDown}
                      />
                      {tags.map((tag, index) => (
                        <Tag key={index} name={tag} />
                      ))}
                    </div>
                  </FormControl>
                  {tags.length > 0 && tags.length < TAG_LIMIT && (
                    <FormDescription className="text-sm text-muted-foreground text-right">
                      {TAG_LIMIT - tags.length} tags left
                    </FormDescription>
                  )}
                  <FormMessage className="shad-form_message" />
                </FormItem>
              )}
            />
            <div className="flex-center">
              <Button
                type="submit"
                className="rounded-full text-base capitalize flex-center gap-1"
                disabled={isPublishing || isUpdating}
              >
                {blogId && !isDraft ? "update" : "publish"}
                {(isPublishing || isUpdating) && (
                  <LoadingSpinner className="h-6 md:w-6 text-white" />
                )}
              </Button>
            </div>
          </form>
        </Form>
      </section>
    </AnimationWrapper>
  );
};

export default PublishForm;
