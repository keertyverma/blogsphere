import Logo from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForgotPassword } from "@/lib/react-query/queries";
import { showErrorToast } from "@/lib/utils";
import { AxiosError } from "axios";
import { ChangeEvent, useState } from "react";

const ForgotPassword = () => {
  const [email, setEmail] = useState<string>("");
  const [emailValidationError, setEmailValidationError] = useState<
    string | null
  >(null);
  const [errorMsg, setErrorMsg] = useState("");

  const {
    mutateAsync: forgotPassword,
    isPending,
    isSuccess,
  } = useForgotPassword();

  const handleOnEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    setEmail(target.value.trim());
    setEmailValidationError(null);
    setErrorMsg("");
  };

  const handleSendPasswordResetEmail = async () => {
    if (!email) return;

    // Email validation
    const emailRegex = /^(?!@)[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(email)) {
      setEmailValidationError("Please enter a valid email address.");
      return;
    }

    try {
      await forgotPassword(email);
    } catch (error) {
      let errorMessage =
        "There was an issue with your request. Please try again.";

      if (error instanceof AxiosError) {
        if (error.code === "ERR_BAD_REQUEST" && error.response) {
          const {
            response: {
              data: {
                error: { details },
              },
            },
          } = error;

          if (details.toLowerCase().includes("token already exists")) {
            setErrorMsg(
              "You already have an active password reset link. Please check your most recent email to reset your password."
            );
            errorMessage = "";
          }
        }
      }

      if (errorMessage) showErrorToast(errorMessage);
    } finally {
      setEmail("");
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
            Forgot Password?
          </h2>

          <div className="my-2 max-w-[400px] flex flex-col gap-3">
            <p className="text-muted-foreground mb-2">
              No worries, we'll send you reset instructions
            </p>
            <div>
              <Input
                value={email}
                id="email"
                type="email"
                placeholder="Enter your registered email address"
                onChange={handleOnEmailChange}
                className="w-full bg-accent placeholder:text-muted-foreground text-accent-foreground focus-visible:ring-0 border border-primary"
              />
              {emailValidationError && (
                <p className="max-sm:text-sm text-red-800 mt-1">
                  {emailValidationError}
                </p>
              )}
            </div>

            <Button
              onClick={handleSendPasswordResetEmail}
              className="w-full max-sm:bg-primary max-sm:text-primary-foreground max-sm:hover:bg-primary/90 rounded-full"
              disabled={!email || isPending}
            >
              Send Instructions
            </Button>
          </div>
          {isSuccess && !errorMsg && (
            <div className="mt-2 max-sm:text-sm text-green-800 bg-green-100 dark:bg-green-800/50 dark:text-green-50 border border-green-400 p-2 rounded-md">
              <p>
                If the email is associated with an account, a password reset
                link will be sent shortly.
              </p>
              <p className="mt-2">
                Please follow the instructions in the email to reset your
                password.
              </p>
            </div>
          )}
          {errorMsg && (
            <div className="text-left max-sm:text-sm text-yellow-600 bg-yellow-100 border dark:bg-yellow-500/50 dark:text-yellow-50 border-yellow-400 p-2 rounded-md mt-3">
              <p>{errorMsg}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ForgotPassword;
