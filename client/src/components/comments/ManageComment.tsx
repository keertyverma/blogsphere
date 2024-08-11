import { useDeleteComment } from "@/lib/react-query/queries";
import { useAuthStore } from "@/store";
import { useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { MdEdit, MdOutlineDelete } from "react-icons/md";
import { toast } from "react-toastify";
import ConfirmationModal from "../shared/ConfirmationModal";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface Props {
  commentId: string;
  commentedByUserId: string;
  onEdit: () => void;
}
const ManageComment = ({
  commentId,
  commentedByUserId: commetedByUserId,
  onEdit,
}: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { mutateAsync: deleteBlog, isPending: isDeleting } = useDeleteComment();
  const user = useAuthStore((s) => s.user);

  const handleDelete = () => {
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsModalOpen(false);
    const loadingToast = toast.loading("Deleting ...");
    try {
      await deleteBlog(commentId);
      toast.dismiss(loadingToast);
      toast.success("Comment Deleted.");
    } catch (error) {
      toast.dismiss(loadingToast);
      if (!useAuthStore.getState().isTokenExpired) {
        toast.error("An error occurred. Please try again later.");
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <BsThreeDotsVertical className="text-xl text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="mr-8 text-muted-foreground p-0">
          {user.id === commetedByUserId && (
            <>
              <DropdownMenuItem className="p-0">
                <Button
                  variant="secondary"
                  className="flex gap-2 bg-transparent text-inherit hover:text-foreground w-full justify-start"
                  onClick={() => onEdit()}
                >
                  <MdEdit className="text-lg text-secondary-foreground" />
                  Edit
                </Button>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-0" />
            </>
          )}

          <DropdownMenuItem className="p-0">
            <Button
              variant="secondary"
              onClick={handleDelete}
              className="flex gap-2 bg-transparent text-inherit hover:text-foreground w-full justify-start"
              disabled={isDeleting}
            >
              <MdOutlineDelete className="text-lg text-destructive" />
              Delete
            </Button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
};

export default ManageComment;
