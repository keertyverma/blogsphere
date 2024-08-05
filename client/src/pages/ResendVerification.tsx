import Logo from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useResendVerificationEmail } from "@/lib/react-query/queries";
import { AxiosError } from "axios";
import { ChangeEvent, useState } from "react";
import { toast } from "react-toastify";

const ResendVerification = () => {
  const [email, setEmail] = useState<string>("");

  const {
    mutateAsync: resendVerificationEmail,
    isPending,
    isSuccess,
  } = useResendVerificationEmail();

  const handleOnEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    setEmail(target.value.trim());
  };

  const handleResendEmail = async () => {
    if (!email) return;

    try {
      await resendVerificationEmail(email);
      setEmail("");
    } catch (error) {
      let errorMessage = "An error occurred. Please try again later.";
      if (error instanceof AxiosError) {
        if (error.code === "ERR_BAD_REQUEST" && error.response) {
          const {
            response: {
              data: {
                error: { details },
              },
            },
          } = error;

          if (details.toLowerCase().includes("invalid")) {
            errorMessage = "This email address is not registered.";
          } else if (details.toLowerCase().includes("verified")) {
            errorMessage = "Your account is already verified. Please log in.";
          } else if (details.toLowerCase().includes("token already exists")) {
            errorMessage =
              "An active token already exists. Please check your most recent email for a verification link.";
          } else {
            errorMessage =
              "There was an issue with your request. Please try again.";
          }
        }
      }

      toast.error(errorMessage, {
        position: "top-right",
        className: "mt-20",
      });
    }
  };

  return (
    <div className="w-full h-full">
      <nav className="navbar">
        <Logo />
      </nav>

      <section className="h-cover flex-center flex-col py-[20vh]">
        <div className="max-w-[450px] flex-center flex-col">
          <h2 className="text-xl md:text-2xl font-semibold capitalize text-center">
            Resend Verification Link
          </h2>

          <div className="my-2 max-w-[320px] flex-center flex-col gap-3 text-center">
            <p className="text-muted-foreground">
              Enter your registered email address
            </p>
            <Input
              value={email}
              type="email"
              placeholder="Email"
              onChange={handleOnEmailChange}
              className="w-full bg-accent placeholder:text-muted-foreground text-accent-foreground focus-visible:ring-0 border border-primary"
            />
            <Button
              onClick={handleResendEmail}
              className="w-full max-sm:bg-primary max-sm:text-primary-foreground max-sm:hover:bg-primary/90 rounded-full"
              disabled={!email || isPending}
            >
              Send
            </Button>
          </div>
          {isSuccess && (
            <div className="mt-2 max-sm:text-sm text-green-800 bg-green-100 border border-green-400 p-2 rounded-md">
              <p>We have sent you an email with a verification link.</p>
              <p className="mt-2">
                Please follow the instructions in the email to complete the
                verification process.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ResendVerification;
