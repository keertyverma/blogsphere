import { SocialLink } from "@/types";
import { ReactNode } from "react";
import { FaFacebook, FaGithub, FaInstagram, FaYoutube } from "react-icons/fa";
import { RiTwitterXFill } from "react-icons/ri";
import { SlGlobe } from "react-icons/sl";
import { Link } from "react-router-dom";

interface Props {
  links: SocialLink;
}

const SocialLinks = ({ links }: Props) => {
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
      {Object.keys(links).map((key) => {
        const link = links[key as keyof SocialLink];
        if (link) {
          return (
            <li key={key} className="text-xl">
              <Link
                to={link}
                target="_blank"
                className="hover:text-muted-foreground"
              >
                {socialIconsMap[key]}
              </Link>
            </li>
          );
        }
        return null;
      })}
    </ul>
  );
};

export default SocialLinks;
