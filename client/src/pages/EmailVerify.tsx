import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useVerifyEmail } from "@/lib/react-query/queries";
import { AxiosError } from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { IoMdCheckmarkCircle } from "react-icons/io";
import { MdOutlineErrorOutline } from "react-icons/md";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import ErrorPage from "./ErrorPage";

const EmailVerify = () => {
  const [isVerified, setIsVerified] = useState(false);
  const [verificationMsg, setVerificationMsg] = useState("");
  const [showResendLink, setShowResentLink] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isVerificationAttempted = useRef(false);
  const { mutateAsync: verifyEmail } = useVerifyEmail();

  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";

  const handleVerification = useCallback(async () => {
    if (!email && !token) return;
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
      if (error instanceof AxiosError) {
        if (error.code === "ERR_NETWORK") {
          setVerificationMsg("network issue");
        } else if (error.code === "ERR_BAD_REQUEST" && error.response) {
          const {
            response: {
              data: {
                error: { details },
              },
            },
          } = error;

          if (details.toLowerCase().includes("expired")) {
            setVerificationMsg(
              "The verification link seems to have expired. Request a new email to verify your account."
            );
            setShowResentLink(true);
          } else {
            setVerificationMsg(
              "The verification link is no longer valid. Please check your email for the most recent verification link."
            );
          }
        }
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

  if (!email && !token) {
    return <ErrorPage />;
  }

  if (isLoading)
    return (
      <div className="flex-center gap-3 py-[20vh]">
        <LoadingSpinner className="" />
        <p>Verifying your email...</p>
      </div>
    );

  return (
    <>
      <Helmet>
        <title>Email Verification | BlogSphere</title>
        <meta
          name="description"
          content="Verify your email address to complete the registration process and unlock all features."
        />
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="w-full h-full">
        <section className="h-cover flex-center py-[20vh]">
          {isVerified ? (
            <div className="flex-center flex-col gap-3 text-center">
              <IoMdCheckmarkCircle className="text-green-600 text-4xl" />
              <h2 className="text-xl md:text-2xl font-semibold capitalize">
                email verified
              </h2>
              <p>{verificationMsg} Please log in.</p>
              <Button
                onClick={() => navigate("/login")}
                className="mt-2 min-w-[320px] max-w-[320px] max-sm:bg-primary max-sm:text-primary-foreground max-sm:hover:bg-primary/90 rounded-full"
              >
                Login
              </Button>
            </div>
          ) : (
            <div className="flex-center flex-col gap-3 text-center">
              <MdOutlineErrorOutline className="text-red-700 text-4xl" />
              <h2 className="text-xl md:text-2xl font-semibold capitalize">
                {verificationMsg === "network issue"
                  ? "Oops!"
                  : "Email verification failed!"}
              </h2>
              <p className="max-w-xl text-muted-foreground">
                {verificationMsg === "network issue"
                  ? "Something went wrong on our end. Please try again later."
                  : verificationMsg}
              </p>
              {showResendLink && (
                <Link
                  to="/resend-verification-link"
                  className="mt-2 text-primary underline text-sm md:text-base"
                >
                  Resend verification link
                </Link>
              )}
            </div>
          )}
        </section>
      </div>
    </>
  );
};

export default EmailVerify;
