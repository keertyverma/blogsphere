import { useUpdateUsername } from "@/lib/react-query/queries";
import { showErrorToast, showSuccessToast } from "@/lib/utils";
import { ChangeUsernameValidation } from "@/lib/validation";
import { useAuthStore } from "@/store";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import * as z from "zod";
import AnimationWrapper from "../shared/AnimationWrapper";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import TextWithLoader from "../ui/text-with-loader";

const ChangeUsername = () => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const confirmedUsernameRef = useRef("");
  const user = useAuthStore((s) => s.user);
  const { mutateAsync: updateUsername, isPending: isUpdating } =
    useUpdateUsername();

  const navigate = useNavigate();
  const form = useForm<z.infer<typeof ChangeUsernameValidation>>({
    resolver: zodResolver(ChangeUsernameValidation),
    defaultValues: {
      newUsername: "",
    },
    mode: "onChange", // Set validation mode to trigger on every input change
  });

  const handleFormSubmit = (data: z.infer<typeof ChangeUsernameValidation>) => {
    if (!data.newUsername) return;

    confirmedUsernameRef.current = data.newUsername;
    // Remove focus from the submit button to prevent console warning when opening the dialog
    submitButtonRef.current?.blur();
    setShowConfirmDialog(true);
  };

  const handleUsernameUpdate = async () => {
    const newUsername = confirmedUsernameRef?.current;
    if (!newUsername) return;

    try {
      const { username: updatedUsername } = await updateUsername({
        username: newUsername,
      });
      if (!updatedUsername) return;
      showSuccessToast(
        "Username updated successfully! Please log in again to continue."
      );
      form.reset();

      // prompt the user to log in again after the username update,
      // as the session is tied to the old username and needs to be refreshed.
      navigate("/login");
      const { clearUserAuth } = useAuthStore.getState();
      clearUserAuth();
    } catch (error) {
      let errorMessage = "An error occurred. Please try again later.";
      if (error instanceof AxiosError && error.response) {
        const {
          response: {
            status,
            data: {
              error: { details },
            },
          },
        } = error;

        if (status === 403 || status === 400) {
          errorMessage = details;
        }
      }

      if (!useAuthStore.getState().isTokenExpired) {
        showErrorToast(errorMessage);
      }
    } finally {
      setShowConfirmDialog(false);
    }
  };

  return (
    <AnimationWrapper>
      <section className="h-cover p-0">
        <div className="max-md:hidden text-center">
          <h3 className="h3-bold !font-semibold capitalize text-left">
            Change Username
          </h3>
          <hr className="mt-2 border-1 border-border" />
        </div>
        <div className="my-2 text-left text-slate-500 dark:text-slate-400 flex flex-col gap-1">
          <p>
            Your username is your unique identity on this platform. It appears
            in your profile URL.
          </p>
          {/* <p>
            {" "}
            and to mention you in posts and comments using{" "}
            <code>@username</code>.
          </p> */}
        </div>
        <div className="flex-center mt-10 md:mt-16">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleFormSubmit)}
              className="w-full max-w-[400px] flex flex-col gap-2 md:gap-3 md:form-container md:!py-12"
            >
              <p>
                Current Username:{" "}
                <strong className="font-semibold">{user.username}</strong>
              </p>
              <FormField
                control={form.control}
                name="newUsername"
                render={({ field }) => (
                  <FormItem>
                    <p className="text-muted-foreground mt-1">
                      You can only change your username once.
                    </p>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="New Username"
                        className="shad-input pl-4"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                ref={submitButtonRef}
                className="h-12 rounded-full mt-2 text-sm md:text-base flex-center gap-1"
                disabled={
                  !form.formState.isValid ||
                  form.watch("newUsername").trim().toLowerCase() ===
                    user.username.toLowerCase()
                }
              >
                Update
              </Button>
              <div className="mt-2 flex flex-col gap-2 text-sm">
                <p>
                  <strong className="font-semibold">Note:</strong> After
                  updating your username, some links using the old one might
                  temporarily stop working until everything refreshes.
                </p>
                <p className="text-muted-foreground">
                  Additionally, you will need to log in again for security
                  reasons and proper session management.
                </p>
              </div>
            </form>
          </Form>
        </div>
        {/* Update Confirmation Dialog */}
        <AlertDialog
          open={showConfirmDialog}
          onOpenChange={setShowConfirmDialog}
        >
          <AlertDialogContent className="!rounded-2xl">
            <AlertDialogHeader className="text-left">
              <AlertDialogTitle className="text-base">
                Confirm Username Change
              </AlertDialogTitle>
              <AlertDialogDescription>
                Your username can only be changed once. This action is permanent
                and can not be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-row justify-end gap-3 md:gap-2">
              <Button
                variant="secondary"
                onClick={() => setShowConfirmDialog(false)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleUsernameUpdate}
                disabled={isUpdating}
              >
                <TextWithLoader
                  text="Update"
                  isLoading={isUpdating}
                  loaderClassName="text-white"
                />
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>
    </AnimationWrapper>
  );
};

export default ChangeUsername;
