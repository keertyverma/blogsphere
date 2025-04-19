import { Link } from "react-router-dom";
import Logo from "./Logo";

const Footer = () => {
  return (
    <footer className="py-4 px-14 text-sm bg-secondary text-secondary-foreground text-center flex items-center justify-center md:justify-around flex-col md:flex-row">
      <div className="flex-center gap-1">
        <Logo withText={false} className="w-10 h-10" />{" "}
        <p className="text-muted-foreground flex max-sm:flex-col">
          <span>
            {" "}
            Copyright &copy; {new Date().getFullYear()} BlogSphere.&nbsp;
          </span>
          <span>
            All right reserved.{" "}
            <Link
              to="/privacy-policy"
              className="hover:underline text-muted-foreground md:hidden"
            >
              {" "}
              Privacy Policy{" "}
            </Link>
          </span>
        </p>
      </div>

      <Link
        to="/privacy-policy"
        className="hover:underline text-muted-foreground max-sm:hidden"
      >
        {" "}
        Privacy Policy{" "}
      </Link>

      <p className="mt-3 md:mt-0">
        Built by{" "}
        <a
          href="https://github.com/keertyverma"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline text-primary"
        >
          Keerty 👩🏻‍💻
        </a>
      </p>
    </footer>
  );
};

export default Footer;
