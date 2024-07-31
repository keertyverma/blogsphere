import Logo from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useVerifyEmail } from "@/lib/react-query/queries";
import { AxiosError } from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { IoMdCheckmarkCircle } from "react-icons/io";
import { MdOutlineErrorOutline } from "react-icons/md";
import { useNavigate, useSearchParams } from "react-router-dom";

const EmailVerify = () => {
  const [isVerified, setIsVerified] = useState(false);
  const [verificationMsg, setVerificationMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isVerificationAttempted = useRef(false);
  const { mutateAsync: verifyEmail } = useVerifyEmail();

  const email = searchParams.get("email");
  const token = searchParams.get("token");

  const handleVerification = useCallback(async () => {
    if (!email || !token) return;

    try {
      setIsLoading(true);
      const data = await verifyEmail({ email, token });
      if (data.message?.toLowerCase() === "email verified successfully.") {
        setIsVerified(true);
        setVerificationMsg("Your email has been successfully verified.");
      } else {
        setIsVerified(true);
        setVerificationMsg("Your account is already verified.");
      }
    } catch (error) {
      if (error instanceof AxiosError && error.code === "ERR_NETWORK") {
        setVerificationMsg("network issue");
      } else {
        setVerificationMsg("Verification failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [email, token, verifyEmail]);

  useEffect(() => {
    // call handleVerification only once on component mount
    if (!isVerificationAttempted.current) {
      isVerificationAttempted.current = true;
      handleVerification();
    }
  }, [handleVerification]);

  if (isLoading) return <LoadingSpinner className="mx-auto" />;
  return (
    <div className="w-full h-full bg-gray-100 ">
      <nav className="navbar">
        <Logo />
      </nav>

      <section className="h-cover flex-center py-[20vh]">
        {isVerified ? (
          <div className="flex-center flex-col gap-4 text-center">
            <IoMdCheckmarkCircle className="text-green-600 text-4xl" />
            <h2 className="text-2xl font-semibold capitalize">
              email verified
            </h2>
            <p>{verificationMsg} Please log in.</p>
            <Button
              onClick={() => navigate("/login")}
              className="mt-3 min-w-[320px] max-w-[320px] max-sm:bg-primary max-sm:text-primary-foreground max-sm:hover:bg-primary/90 rounded-full"
            >
              Login
            </Button>
          </div>
        ) : (
          <div className="flex-center flex-col gap-4 text-center">
            <MdOutlineErrorOutline className="text-red-700 text-4xl" />
            <h2 className="text-2xl font-semibold capitalize">
              {verificationMsg === "network issue"
                ? "Oops!"
                : "Email verification failed!"}
            </h2>
            <p className="max-w-xl text-muted-foreground">
              {verificationMsg === "network issue"
                ? "Something went wrong on our end. Please try again later."
                : `It looks like the verification link is invalid or has expired.
              If you haven't already verified your email, please request a
              new verification link to complete the process.`}
            </p>
            {/* TODO: show 'resent verification link' option with email field or add "You may close this window."*/}
          </div>
        )}
      </section>
    </div>
  );
};

export default EmailVerify;
