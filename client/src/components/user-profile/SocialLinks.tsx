import { FaLinkedin, FaGithub, FaInstagram } from "react-icons/fa";
import { RiTwitterXFill } from "react-icons/ri";

const SocialLinks = () => {
  /* TODO: show only available social links of user */
  return (
    <ul className="flex gap-3 items-center text-muted-foreground mt-3">
      <li>
        <FaLinkedin />
      </li>
      <li>
        <RiTwitterXFill />
      </li>
      <li>
        <FaGithub />
      </li>
      <li>
        <FaInstagram />
      </li>
    </ul>
  );
};

export default SocialLinks;
