import { SocialLink } from "@/types";
import { ReactNode } from "react";
import { FaFacebook, FaGithub, FaInstagram, FaYoutube } from "react-icons/fa";
import { RiTwitterXFill } from "react-icons/ri";
import { SlGlobe } from "react-icons/sl";

interface Props {
  links: SocialLink;
}

const SocialLinks = ({ links }: Props) => {
  const DISPLAY_ORDER: (keyof SocialLink)[] = [
    "website",
    "twitter",
    "github",
    "youtube",
    "instagram",
    "facebook",
  ];

  const socialIconsMap: { [key: string]: ReactNode } = {
    youtube: <FaYoutube />,
    instagram: <FaInstagram />,
    facebook: <FaFacebook />,
    twitter: <RiTwitterXFill />,
    github: <FaGithub />,
    website: <SlGlobe />,
  };

  return (
    <ul className="flex gap-4 md:gap-3 items-center text-secondary-foreground mt-3">
      {DISPLAY_ORDER.map((key) => {
        const url = links?.[key];
        if (!url) return null;

        return (
          <li key={key} className="text-xl">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-muted-foreground"
            >
              {socialIconsMap[key]}
            </a>
          </li>
        );
        return null;
      })}
    </ul>
  );
};

export default SocialLinks;
