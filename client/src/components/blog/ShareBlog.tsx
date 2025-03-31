import { showErrorToast, showSuccessToast } from "@/lib/utils";
import { BsLinkedin } from "react-icons/bs";
import { IoIosLink } from "react-icons/io";
import { MdIosShare } from "react-icons/md";
import { RiTwitterXFill } from "react-icons/ri";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface Props {
  title: string;
  description: string;
  tags?: string[];
}

const ShareBlog = ({ title, description, tags = [] }: Props) => {
  const copyToClipboard = () => {
    const currentURL = location.href;
    navigator.clipboard
      .writeText(currentURL)
      .then(() => {
        showSuccessToast(
          <div className="flex items-center space-x-2">
            <IoIosLink className="text-muted-foreground text-xl" />
            <span>Link copied to clipboard</span>
          </div>,
          {
            icon: false,
          }
        );
      })
      .catch((err) => {
        console.error(err);
        showErrorToast("Failed to copy the link. Please try again.");
      });
  };

  const handleLinkedinShare = () => {
    const maxLength = 3000; // LinkedIn's character limit for posts
    const fixedText = "🚀 Read now on BlogSphere!";
    const blogURL = location.href; // LinkedIn doesn't shorten URLs

    // Calculate max allowed length for title + hashtags
    const reservedSpace = fixedText.length + blogURL.length;
    const maxBlogDataLength = maxLength - reservedSpace;

    // Convert tags to hashtags (remove spaces, lowercase, limit to 5 hashtags)
    const hashtags = tags
      .slice(0, 5)
      .map((tag) => `#${tag.replace(/\s+/g, "").toLowerCase()}`)
      .join(" ");
    let blogData = `${title}\n${description}\n${hashtags}\n`;
    if (blogData.length > maxBlogDataLength) {
      blogData = blogData.substring(0, maxBlogDataLength - 3) + "..."; // -3 for "..."
    }

    const shareText = `${blogData}\n${fixedText}\n${blogURL}`;
    const linkedInShareUrl = `https://www.linkedin.com/shareArticle?mini=true&text=${encodeURIComponent(
      shareText
    )}`;
    window.open(linkedInShareUrl, "_blank");
  };

  const handleXShare = () => {
    const maxLength = 280;
    const fixedText = "🚀 Read now on BlogSphere!";
    const blogURL = location.href;
    const urlLength = 23; // X shortens URLs to 23 characters
    const newLines = "\n\n"; // Used between sections (counts as 2 characters)

    // Convert tags to hashtags (remove spaces, lowercase, limit to 3 hashtags)
    const hashtags = tags
      .slice(0, 3)
      .map((tag) => `#${tag.replace(/\s+/g, "").toLowerCase()}`)
      .join(" ");

    // Calculate max allowed length for title + hashtags
    const reservedSpace = fixedText.length + newLines.length + urlLength;
    const maxTitleHashtagsLength = maxLength - reservedSpace;

    let titleHashtags = `${title}\n${hashtags}`;
    if (titleHashtags.length > maxTitleHashtagsLength) {
      titleHashtags =
        titleHashtags.substring(0, maxTitleHashtagsLength - 3) + "..."; // -3 for "..."
    }

    const shareText = `${titleHashtags}\n\n${fixedText}`;
    const xShareUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(
      shareText
    )}&url=${encodeURIComponent(blogURL)}`;
    window.open(xShareUrl, "_blank");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="outline-none">
        <MdIosShare className="text-xl text-secondary-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="mt-2 mr-8 text-muted-foreground p-0">
        <DropdownMenuItem className="p-1">
          <Button
            variant="secondary"
            onClick={copyToClipboard}
            className="bg-transparent text-inherit hover:text-foreground w-full justify-start p-2"
          >
            <IoIosLink className="text-lg mr-3" />
            Copy link
          </Button>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="my-0" />
        <DropdownMenuItem className="p-1">
          <Button
            variant="secondary"
            onClick={handleXShare}
            className="bg-transparent text-inherit hover:text-foreground w-full justify-start p-2"
          >
            <RiTwitterXFill className="text-lg mr-3" />
            Share to X
          </Button>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="my-0" />
        <DropdownMenuItem className="p-1">
          <Button
            variant="secondary"
            onClick={handleLinkedinShare}
            className="bg-transparent text-inherit hover:text-foreground w-full justify-start p-2"
          >
            <BsLinkedin className="text-lg mr-3" />
            Share to Linkedin
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ShareBlog;
