import { useDeleteBlog } from "@/lib/react-query/queries";
import { showErrorToast, showSuccessToast } from "@/lib/utils";
import { useAuthStore } from "@/store";
import { IBlog } from "@/types";
import { MdEdit, MdOutlineDelete } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";

interface Props {
  blogId: string;
  isDraft: boolean;
}

const ManageBlog = ({ blogId, isDraft }: Props) => {
  const { mutateAsync: deleteBlog } = useDeleteBlog();
  const navigate = useNavigate();

  const handleDelete = async () => {
    const loadingToast = toast.loading("Deleting ...");
    try {
      const deletedBlog: IBlog = await deleteBlog(blogId);
      const authorUsername = deletedBlog.authorDetails.personalInfo.username;

      toast.dismiss(loadingToast);
      showSuccessToast("Blog Deleted.👍");
      navigate(`/user/${authorUsername}`);
    } catch (error) {
      toast.dismiss(loadingToast);
      if (!useAuthStore.getState().isTokenExpired) {
        showErrorToast("An error occurred. Please try again later.");
      }
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => navigate(`/editor/${blogId}?isDraft=${isDraft}`)}
        className="w-8 h-8 rounded-full flex-center border border-muted-foreground/40"
      >
        <MdEdit className="text-lg text-secondary-foreground" />
      </Button>

      <AlertDialog>
        <AlertDialogTrigger>
          <div className="w-8 h-8 rounded-full flex-center border border-muted-foreground/40 bg-background hover:bg-accent hover:text-accent-foreground">
            <MdOutlineDelete className="text-lg text-destructive" />
          </div>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Confirmation</AlertDialogTitle>
            <AlertDialogDescription className="text-secondary-foreground">
              Are you absolutely sure? This will permanently delete your blog.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-secondary border border-muted-foreground/40">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ManageBlog;
