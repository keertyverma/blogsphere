import { useEditorContext } from "@/context/editorContext";
import { BlogValidation } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyboardEvent, useState } from "react";
import { useForm } from "react-hook-form";
import { IoClose } from "react-icons/io5";
import { toast } from "react-toastify";
import * as z from "zod";
import AnimationWrapper from "./AnimationWrapper";
import Tag from "./Tag";
import { Button } from "./ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

const PublishForm = () => {
  const TAG_LIMIT = 10;
  const DESCRIPTION_CHAR_LIMIT = 200;
  const {
    blog: { title, coverImg, description, tags },
    blog,
    setIsPublish,
    setBlog,
  } = useEditorContext();
  const [titleValue, setTitleValue] = useState(title);
  const [descriptionValue, setDescriptionValue] = useState(description);

  const form = useForm<z.infer<typeof BlogValidation>>({
    resolver: zodResolver(BlogValidation),
    defaultValues: {
      title: title,
      description: description,
      tag: "",
    },
  });

  const handleSubmit = async (value: z.infer<typeof BlogValidation>) => {
    console.log(value);
    const { title, description } = value;

    setBlog({ ...blog, title, description });

    // call api
    // handle loading
    // handle error

    // form.reset()
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

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // TODO: remove this later,
    toast.error(`key = ${e.key}, code = ${e.code}, keyCode = ${e.keyCode}`, {
      autoClose: 12000,
    });

    if (
      e.key === "Enter" ||
      e.key === "," ||
      e.code === "Comma" ||
      e.keyCode === 188
    ) {
      e.preventDefault();

      const inputElement = e.target as HTMLInputElement;
      const tag = inputElement.value.trim();
      if (tags.length < TAG_LIMIT) {
        // add tag
        if (tag.length && !tags.includes(tag))
          setBlog({ ...blog, tags: [...tags, tag] });
      } else {
        toast.error(`You can add maximum of ${TAG_LIMIT} tags`);
      }

      // reset input value
      form.setValue("tag", "");
    }
  };

  return (
    <AnimationWrapper>
      <section className="w-screen grid lg:grid-cols-2 py-16 gap-2 lg:gap-1">
        <Button
          variant="ghost"
          className="absolute right-[5vw] top-[1%] md:top-[2%] z-10"
          onClick={() => setIsPublish(false)}
        >
          <IoClose className="text-xl md:text-2xl" />
        </Button>
        {/* preview */}
        <div className="max-w-[550px] md:center">
          <p className="text-md md:text-lg text-muted-foreground mb-1">
            Preview
          </p>

          {coverImg && (
            <div className="w-full rounded-lg overflow-hidden bg-gray-200 mt-4">
              <img src={coverImg} className="cover-img" />
            </div>
          )}

          <h1 className="h1-medium mt-2 line-clamp-2">{titleValue}</h1>

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
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground">
                    Blog Title
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
                    Blog Summary
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
                    Tags - (Enhances blog searchability and ranking)
                  </FormLabel>
                  <FormControl>
                    <div className="relative input-box bg-muted">
                      <Input
                        type="text"
                        placeholder="Add Tag and press enter or comma"
                        className="mt-1 input-box sticky top-0 left-0 bg-white mb-3 md:text-base placeholder:text-sm"
                        {...field}
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
                className="h-12 px-6 md:px-8 rounded-full text-sm md:text-base"
              >
                Publish
              </Button>
            </div>
          </form>
        </Form>
      </section>
    </AnimationWrapper>
  );
};

export default PublishForm;
