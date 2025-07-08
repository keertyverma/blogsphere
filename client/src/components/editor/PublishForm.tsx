import {
  useCreateBlog,
  useGenerateBlogMetadata,
  useUpdateBlog,
} from "@/lib/react-query/queries";
import {
  extractMeaningfulTextFromBlogContent,
  showConfetti,
  showErrorToast,
  showSuccessToast,
} from "@/lib/utils";
import { BlogValidation } from "@/lib/validation";
import { useAuthStore, useEditorStore } from "@/store";
import { FormSnapshot, IBlog, ICreatePublishedBlog } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { ChangeEvent, KeyboardEvent, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { IoArrowUndoSharp, IoClose, IoSparkles } from "react-icons/io5";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
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
    blog: { title, coverImgURL, description = "", content },
  } = useEditorStore((s) => ({ blog: s.blog }));
  const setBlog = useEditorStore((s) => s.setBlog);
  const setIsPublish = useEditorStore((s) => s.setIsPublish);
  const setIsPublishClose = useEditorStore((s) => s.setIsPublishClose);
  const [searchParams] = useSearchParams();
  const isDraft = searchParams.get("isDraft") === "true";

  const [descriptionValue, setDescriptionValue] = useState(description);
  const [tags, setTags] = useState<string[]>(blog?.tags || []);
  const [showUndo, setShowUndo] = useState<boolean>(false);
  const prevFormSnapshot = useRef<FormSnapshot | null>(null);

  const { mutateAsync: createBlog, isPending: isPublishing } = useCreateBlog();
  const { mutateAsync: updatePublishedBlog, isPending: isUpdating } =
    useUpdateBlog();
  const { mutateAsync: generateMetadataWithAI, isPending: isGeneratingWithAI } =
    useGenerateBlogMetadata();

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
    if (tags.length === 0 && !tag) {
      showErrorToast("Please add at least one tag to publish.");
      return;
    }

    const updatedBlog: ICreatePublishedBlog = {
      title,
      description,
      content: { blocks: content.blocks },
      tags,
    };

    if (coverImgURL) {
      updatedBlog.coverImgURL = coverImgURL;
    }

    const publishedBlog = {
      ...updatedBlog,
      isDraft: false,
    };

    try {
      let message = "";
      let blogUrl = "";
      let isPublished = false;
      if (blogId) {
        // edit mode - update a published blog or publish a draft
        const isPublishingDraft = isDraft ? true : false;
        const updatedBlog = await updatePublishedBlog({
          blogId,
          blog: publishedBlog,
          isPublishingDraft,
        });
        setBlog({ ...blog, ...updatedBlog });
        message = isDraft ? "Blog Published 🥳" : "Blog Updated";
        blogUrl = `/blogs/${updatedBlog.blogId}`;
        isPublished = isPublishingDraft;
      } else {
        // create mode - publish new blog
        const newBlog: IBlog = await createBlog(publishedBlog);
        setBlog({ ...blog, ...newBlog });
        message = "Blog Published 🥳";
        blogUrl = `/blogs/${newBlog.blogId}`;
        isPublished = true;
      }
      showSuccessToast(message);
      if (isPublished) showConfetti();
      form.reset();
      setIsPublish(false);
      navigate(blogUrl);
    } catch (error) {
      if (!useAuthStore.getState().isTokenExpired) {
        showErrorToast("An error occurred. Please try again later.");
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

  const addTag = (tag: string) => {
    if (tags.length >= TAG_LIMIT) {
      return showErrorToast(
        `Maximum tag limit of ${TAG_LIMIT} reached. You can’t add any more tags.`
      );
    }

    if (tag.length && !tags.includes(tag)) {
      setTags([...tags, tag]);
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
      addTag(tag);

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
      addTag(tag);

      form.setValue("tag", "");
    }
  };

  /**
   * Handles the end-to-end process of generating blog metadata using AI.
   * - Validates blog content
   * - Calls the backend API to generate metadata (title, summary, tags)
   * - Captures a form snapshot before override
   * - Updates form fields with AI-generated values
   * - Triggers validation for updated fields
   * - Shows Undo if snapshot is captured
   */
  const handleGenerateMetadataWithAI = async () => {
    try {
      // Extract meaningful text from the latest blog content
      const blogText = extractMeaningfulTextFromBlogContent(content.blocks);
      if (!blogText) {
        return showErrorToast(
          "To generate metadata, add more meaningful text (like paragraphs or headings) to your blog."
        );
      }

      // Request AI-generated metadata
      const metadata = await generateMetadataWithAI({
        blogText,
        ...(blog._id && { blogId: blog._id }),
      });
      if (!metadata) return;

      captureFormSnapshot(); // Capture the current form data before override

      // Update form fields with AI-generated values
      form.setValue("title", metadata.title);
      form.setValue("description", metadata.description);
      setDescriptionValue(metadata.description); // for character count UI
      setTags([...metadata.tags.slice(0, TAG_LIMIT)]); // cap the number of tags to the maximum allowed

      // Show Undo (only if snapshot was created)
      if (prevFormSnapshot.current) {
        setShowUndo(true);
      }

      // Trigger form validation for updated fields
      const isValid = await form.trigger(["title", "description"]);
      if (isValid) {
        showSuccessToast(
          "AI-generated title, summary, and tags have been added to the form."
        );
      }
    } catch (error) {
      if (useAuthStore.getState().isTokenExpired) return;

      let errorMessage = "An error occurred. Please try again later.";
      if (error instanceof AxiosError && error.response) {
        const { status } = error.response;
        if (status === 429) return; // Interceptor handles AI rate limit toasts
        if (status === 502) {
          errorMessage =
            "The AI service is currently unavailable. Please try again in a few moments.";
        } else if (status === 503) {
          errorMessage =
            "The AI service is temporarily unavailable due to high load. Please try again shortly.";
        }
      }

      showErrorToast(errorMessage);
    }
  };

  /**
   * Captures a snapshot of the current form state (title, description, tags)
   * to support undoing AI-generated metadata changes.
   */
  const captureFormSnapshot = () => {
    const { title, description } = form.getValues();

    prevFormSnapshot.current = {
      title,
      description,
      tags, // local state
    };
  };

  /**
   * Reverts the form fields and tag list to the previously captured snapshot.
   * Hides the undo button
   */
  const handleUndoAIMetadata = async () => {
    setShowUndo(false);

    const snapshot = prevFormSnapshot.current;
    if (!snapshot) return;

    // Restore previous form values and tags
    const { title, description, tags: previousTags } = snapshot;
    form.setValue("title", title);
    form.setValue("description", description);
    setDescriptionValue(description); // for character count UI
    setTags([...previousTags.slice(0, TAG_LIMIT)]); // cap the number of tags to the maximum allowed

    prevFormSnapshot.current = null;
  };

  return (
    <AnimationWrapper>
      <section className="px-6 mx-auto md:max-w-[728px] flex flex-col gap-2 py-12">
        <div className="mb-1">
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
        <div className="mb-1 flex flex-col-reverse sm:flex-row sm:justify-end sm:items-center gap-2">
          <p className="text-xs sm:text-sm text-muted-foreground text-right">
            {showUndo && !isGeneratingWithAI ? (
              <>
                ✅ AI-generated blog metadata applied.{" "}
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg py-1 px-2"
                  onClick={handleUndoAIMetadata}
                  aria-label="Undo AI-generated metadata"
                >
                  <div className="flex items-center gap-1">
                    <IoArrowUndoSharp />
                    <span className="text-secondary-foreground text-xs sm:text-sm">
                      Undo
                    </span>
                  </div>
                </Button>
              </>
            ) : (
              <> 💡 Let AI generate a title, summary, and tags.</>
            )}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="border border-primary text-primary hover:text-primary rounded-lg self-end flex items-center gap-1"
            onClick={handleGenerateMetadataWithAI}
            disabled={isGeneratingWithAI}
            aria-label="Generate blog metadata using AI"
          >
            {isGeneratingWithAI ? (
              <LoadingSpinner className="h-4 w-4 md:w-4 dark:text-white" />
            ) : (
              <IoSparkles className="text-yellow-500 w-4 h-4" />
            )}
            Generate With AI
          </Button>
        </div>
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
                      className="shad-input max-sm:placeholder:text-sm"
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
                      className="shad-textarea max-sm:placeholder:text-sm"
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
                  {descriptionValue.length > 0 && (
                    <FormDescription className="text-sm text-muted-foreground text-right">
                      <span
                        className={
                          DESCRIPTION_CHAR_LIMIT - descriptionValue.length < 0
                            ? "text-destructive"
                            : ""
                        }
                      >
                        {DESCRIPTION_CHAR_LIMIT - descriptionValue.length}
                      </span>{" "}
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
                        className="mt-1 bg-muted sticky top-0 left-0 mb-3 max-sm:placeholder:text-sm"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          handleTagOnChange(e);
                        }}
                        onKeyDown={handleTagKeyDown}
                      />
                      {tags.map((tag, index) => (
                        <Tag
                          key={index}
                          name={tag}
                          onDelete={(tagToDelete: string) => {
                            setTags(tags.filter((tag) => tag !== tagToDelete));
                          }}
                        />
                      ))}
                      {tags.length > 0 && tags.length < TAG_LIMIT && (
                        <FormDescription className="text-sm text-muted-foreground text-right mt-1">
                          {TAG_LIMIT - tags.length} tags left
                        </FormDescription>
                      )}
                    </div>
                  </FormControl>
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
