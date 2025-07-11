import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const features = [
  {
    icon: "/assets/images/feature-user-onboarding.svg",
    title: "Effortless Onboarding",
    points: [
      "Secure sign-in with email/password or Google.",
      "Account Verification for trusted access.",
      "Customizable user profile and settings.",
      "Easy password recovery option.",
    ],
  },
  {
    icon: "/assets/images/feature-blog-manage.svg",
    title: "Smarter Blog Management",
    points: [
      "Create, edit and manage blogs with a rich block-style editor.",
      "Publish faster with smart, AI-powered metadata suggestions.",
      "Filter blogs by tags and search across users and content.",
      "Manage drafts and published blogs in one place.",
    ],
  },
  {
    icon: "/assets/images/feature-blog-interaction.svg",
    title: "Engage and Connect",
    points: [
      "Like posts and join conversations with threaded comments.",
      "Bookmark favorite blogs for quick access.",
      "Share to X, LinkedIn, or copy links.",
      "Discover What’s Trending: Top Blogs.",
      "Infinite feed scroll for seamless browsing.",
    ],
  },
];

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div>
      {/* Hero Section */}
      <section className="pt-20 pb-4 md:py-32 md:pb-20 flex gap-6 md:gap-1 flex-col md:flex-row">
        <div className="container mx-auto px-4 md:px-8 lg:px-12 xl:px-14 text-center md:text-left flex flex-col gap-2 md:gap-4">
          <h2 className="font-bold text-4xl md:text-[3.5rem] leading-tight text-center sm:text-left">
            <p>Create</p>
            <p className="bg-gradient-to-r from-primary to-blue-800 text-transparent bg-clip-text">
              Connect
            </p>
            <p>Inspire</p>
          </h2>
          <div className="text-base md:text-xl text-secondary-foreground">
            <p>
              {" "}
              Fuel your creativity with a{" "}
              <strong className="font-semibold">blogging platform</strong> built
              for <br className="max-sm:hidden" />
              thoughtful creators and curious readers.
            </p>
            {/* Where ideas meet curious minds. */}
          </div>
          <div className="flex gap-4 max-sm:justify-center items-center">
            <Button
              onClick={() => navigate("/signup")}
              className="text-base md:text-lg font-normal rounded-full"
            >
              Get Started
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/feed")}
              className="text-base md:text-lg font-normal rounded-full text-primary hover:text-primary"
            >
              Discover Blogs
            </Button>
          </div>
        </div>
        <div className="w-full lg:w-1/2">
          <img
            src="/assets/images/hero-banner.svg"
            alt="Blogging illustration"
            className="w-full h-full max-w-md md:max-w-xl object-contain"
            loading="lazy"
            width={600}
            height={400}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-10 md:py-16 bg-secondary">
        <div className="container mx-auto px-2">
          <h3 className="text-[1.75rem] md:text-[2.5rem] font-bold text-center text-primary mb-2">
            Unlock the Full Potential of Blogging
          </h3>
          <p className="text-center max-w-2xl mx-auto text-secondary-foreground mb-10 text-base md:text-lg">
            Your all-in-one solution to create compelling blogs, build a
            thriving community, and spark engaging conversations
          </p>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:mb-6">
            {features.map(({ icon, title, points }, index) => (
              <div
                key={index}
                className="bg-background rounded-3xl p-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-border hover:border-primary/60 cursor-pointer"
              >
                <div className="bg-secondary rounded-t-xl">
                  <img
                    src={icon}
                    alt={title}
                    className="w-32 h-32 md:w-36 md:h-36 mx-auto"
                    loading="lazy"
                  />
                </div>

                <h4 className="text-xl font-semibold text-left md:text-center text-foreground my-4">
                  {title}
                </h4>
                <ul className="space-y-2 text-base text-muted-foreground list-disc -list-inside pl-4">
                  {points.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section  */}
      <section className="bg-primary/90 text-primary-foreground px-5 md:px-10 py-10 md:py-24">
        <div className="flex flex-col md:flex-row gap-2 justify-center items-center">
          <div className="max-sm:text-center">
            <h3 className="text-[1.75rem] md:text-[2.5rem] font-semibold">
              Ready to Get Started?
            </h3>
            <p className="max-w-4xl text-base md:text-lg mt-1">
              Join a growing community of creators. Write, share, and connect
              with the world - one blog at a time.
            </p>
          </div>
          <div>
            <Button
              variant="outline"
              onClick={() => navigate("/signup")}
              className="text-base md:text-lg font-normal text-primary dark:text-primary-foreground hover:text-primary max-sm:mt-2 rounded-full"
            >
              Get Started
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
