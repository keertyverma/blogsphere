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
}

const ShareBlog = ({ title, description }: Props) => {
  const copyToClipboard = () => {
    const currentURL = location.href;
    navigator.clipboard
      .writeText(currentURL)
      .then(() => {
        showSuccessToast(
          <div className="flex items-center space-x-2">
            <IoIosLink className="text-muted-foreground text-xl" />
            <span>Link copied successfully!</span>
          </div>,
          {
            icon: false,
          }
        );
      })
      .catch((err) => {
        console.error(err);
        showErrorToast("Failed to copy link.");
      });
  };

  const handleLinkedinShare = () => {
    const text = encodeURIComponent(
      `${title}\n${description}\n\nCheck it out at BlogSphere!\n${location.href}`
    );
    const linkedInShareUrl = `https://www.linkedin.com/shareArticle?mini=true&text=${text}`;
    window.open(linkedInShareUrl, "_blank");
  };

  const handleXShare = () => {
    const xShareUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(
      `${title}.\n\nCheck it out at BlogSphere!`
    )}&url=${encodeURIComponent(location.href)}`;
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
