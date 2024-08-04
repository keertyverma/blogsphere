import Logo from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForgotPassword } from "@/lib/react-query/queries";
import { AxiosError } from "axios";
import { ChangeEvent, useState } from "react";
import { toast } from "react-toastify";

const ForgotPassword = () => {
  const [email, setEmail] = useState<string>("");

  const {
    mutateAsync: forgotPassword,
    isPending,
    isSuccess,
  } = useForgotPassword();

  const handleOnEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    setEmail(target.value.trim());
  };

  const handleSendPasswordResetEmail = async () => {
    if (!email) return;

    try {
      await forgotPassword(email);
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
          } else if (details.toLowerCase().includes("token already exists")) {
            errorMessage =
              "An active token already exists. Please check your most recent email for a password reset link.";
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
    <div className="w-full h-full bg-gray-100">
      <nav className="navbar">
        <Logo />
      </nav>

      <section className="h-cover flex-center flex-col py-[20vh]">
        <div className="max-w-[450px] flex-center flex-col">
          <h2 className="text-xl md:text-2xl font-semibold capitalize text-center">
            Forgot Password?
          </h2>

          <div className="my-2 max-w-[400px] flex flex-col gap-3">
            <p className="text-muted-foreground mb-2">
              No worries, we'll send you reset instructions
            </p>
            <Input
              value={email}
              id="email"
              type="email"
              placeholder="Enter your registered Email address"
              onChange={handleOnEmailChange}
              className="w-full bg-accent placeholder:text-muted-foreground text-accent-foreground focus-visible:ring-0 border border-primary"
            />
            <Button
              onClick={handleSendPasswordResetEmail}
              className="w-full max-sm:bg-primary max-sm:text-primary-foreground max-sm:hover:bg-primary/90 rounded-full"
              disabled={!email || isPending}
            >
              Reset Password
            </Button>
          </div>
          {isSuccess && (
            <div className="mt-2 max-sm:text-sm text-green-800 bg-green-100 border border-green-400 p-2 rounded-md">
              <p>We have sent you an email with a reset password link.</p>
              <p className="mt-2">
                Please follow the instructions in the email to reset your
                password.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ForgotPassword;
