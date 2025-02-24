import { useDeleteBlog } from "@/lib/react-query/queries";
import { showErrorToast, showSuccessToast } from "@/lib/utils";
import { useAuthStore } from "@/store";
import { IBlog } from "@/types";
import { useState } from "react";
import { MdEdit, MdOutlineDelete } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import TextWithLoader from "../ui/text-with-loader";

interface Props {
  blogId: string;
  isDraft: boolean;
}

const ManageBlog = ({ blogId, isDraft }: Props) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { mutateAsync: deleteBlog, isPending: isDeleting } = useDeleteBlog();
  const navigate = useNavigate();

  const handleDelete = async () => {
    try {
      const {
        authorDetails: {
          personalInfo: { username },
        },
      }: IBlog = await deleteBlog(blogId);

      setIsDeleteDialogOpen(false);
      showSuccessToast("Blog Deleted.");
      navigate(`/user/${username}`);
    } catch (error) {
      setIsDeleteDialogOpen(false);
      if (!useAuthStore.getState().isTokenExpired) {
        showErrorToast("An error occurred. Please try again later.");
      }
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Edit Button */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => navigate(`/editor/${blogId}?isDraft=${isDraft}`)}
        className="w-8 h-8 rounded-full flex-center border border-muted-foreground/40"
      >
        <MdEdit className="text-lg text-secondary-foreground" />
      </Button>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="w-8 h-8 rounded-full flex-center border border-muted-foreground/40 bg-background hover:bg-accent hover:text-accent-foreground"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <MdOutlineDelete className="text-lg text-destructive" />
          </Button>
        </AlertDialogTrigger>

        <AlertDialogContent className="!rounded-2xl">
          <AlertDialogHeader className="text-left">
            <AlertDialogTitle className="text-base">
              Delete Confirmation
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete this blog? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row justify-end gap-3 md:gap-2">
            <Button
              variant="secondary"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <TextWithLoader
                text="Delete"
                isLoading={isDeleting}
                loaderClassName="text-white"
              />
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ManageBlog;
