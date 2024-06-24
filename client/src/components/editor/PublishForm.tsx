import { useCreateBlog, useUpdateBlog } from "@/lib/react-query/queries";
import { BlogValidation } from "@/lib/validation";
import { useAuthStore, useEditorStore } from "@/store";
import { ICreateBlog } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChangeEvent, KeyboardEvent, useState } from "react";
import { useForm } from "react-hook-form";
import { IoClose } from "react-icons/io5";
import { useNavigate, useParams } from "react-router-dom";
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
    blog: { title, coverImgURL, description, tags, content, isDraft },
  } = useEditorStore((s) => ({ blog: s.blog }));
  const setBlog = useEditorStore((s) => s.setBlog);
  const setIsPublish = useEditorStore((s) => s.setIsPublish);
  const setIsPublishClose = useEditorStore((s) => s.setIsPublishClose);

  const [titleValue, setTitleValue] = useState(title);
  const [descriptionValue, setDescriptionValue] = useState(description);
  const token = useAuthStore((s) => s.token);

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
      toast.error("Add atleast one tag to publish");
      return;
    }

    const updatedBlog: ICreateBlog = {
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
          token,
        });
        message = "Blog Updated";
        blogUrl = `/blogs/${updatedBlog.blogId}`;
      } else {
        // create mode - publish new blog
        const newBlog = await createBlog({
          blog: publishedBlog,
          token,
        });
        message = "Blog Published 🥳";
        blogUrl = `/blogs/${newBlog.id}`;
      }
      toast.success(message);
      navigate(blogUrl);
      form.reset();
      setIsPublish(false);
    } catch (error) {
      toast.error("An error occurred. Please try again later.");
    }
  };

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (value) setTitleValue(value);
  };

  const handleDescriptionChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const value = event.target.value;
    if (value) setDescriptionValue(value);
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
      toast.error(`You can add maximum of ${TAG_LIMIT} tags`);
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
      <section className="w-screen grid lg:grid-cols-2 py-16 xl:px-[1vw] gap-2 lg:gap-1">
        <Button
          variant="ghost"
          className="absolute right-[5vw] top-[1%] md:top-[2%] z-10"
          onClick={() => {
            setIsPublish(false);
            setIsPublishClose(true);
          }}
        >
          <IoClose className="text-xl md:text-2xl" />
        </Button>
        {/* preview */}
        <div className="max-w-[550px] md:center">
          <p className="text-md md:text-lg text-muted-foreground mb-1">
            Preview
          </p>

          {coverImgURL && (
            <div className="w-full rounded-lg overflow-hidden bg-gray-200 mt-4">
              <img src={coverImgURL} className="cover-img" />
            </div>
          )}

          <h1 className="h1-medium mt-2">{titleValue}</h1>
          <p className="text-base md:text-lg line-clamp-2 md:line-clamp-4 leading-7 mt-4 overflow-hidden">
            {descriptionValue}
          </p>
        </div>

        {/* publish form */}
        <Form {...form}>
          <form
            className="p-2 lg:p-6 border-[1px] border-border rounded-lg lg:shadow-md flex flex-col gap-4 md:gap-3 max-sm:mt-5 md:max-w-[700px]"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            {(isPublishing || isUpdating) && (
              <LoadingSpinner className="flex-col m-auto" />
            )}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground">
                    Blog Title <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Title"
                      className="shad-input md:text-base"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        handleTitleChange(e);
                      }}
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
                  <FormLabel className="text-muted-foreground">
                    Blog Summary <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      className="shad-textarea custom-scrollbar md:text-base placeholder:text-sm"
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
                  {descriptionValue.length < DESCRIPTION_CHAR_LIMIT && (
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
                  <FormLabel className="text-muted-foreground">
                    Tags - (Enhances blog searchability and ranking){" "}
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative input-box bg-muted">
                      <Input
                        type="text"
                        placeholder="Add Tag and press enter or comma"
                        className="mt-1 input-box sticky top-0 left-0 bg-white mb-3 md:text-base placeholder:text-sm"
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
                  {tags.length < TAG_LIMIT && (
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
                className="rounded-full text-sm md:text-base capitalize"
                disabled={isPublishing || isUpdating}
              >
                {blogId && !isDraft ? "update" : "publish"}
              </Button>
            </div>
          </form>
        </Form>
      </section>
    </AnimationWrapper>
  );
};

export default PublishForm;
