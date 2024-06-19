import { MdEdit, MdOutlineDelete } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
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

interface Props {
  blogId: string;
}

const ManageBlog = ({ blogId }: Props) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => navigate(`/editor/${blogId}`)}
        className="w-8 h-8 rounded-full flex-center"
      >
        <MdEdit className="text-lg text-muted-foreground" />
      </Button>

      <AlertDialog>
        <AlertDialogTrigger>
          <div className="w-8 h-8 rounded-full flex-center border bg-background hover:bg-accent hover:text-accent-foreground">
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
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => console.log("handle delete")}
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
