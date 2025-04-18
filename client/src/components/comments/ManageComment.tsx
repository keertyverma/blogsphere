import { useDeleteComment } from "@/lib/react-query/queries";
import { showErrorToast } from "@/lib/utils";
import { useAuthStore } from "@/store";
import { useState } from "react";
import { BsThreeDots } from "react-icons/bs";
import { MdEdit, MdOutlineDelete } from "react-icons/md";
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
  isReply: boolean;
  onEdit: () => void;
}
const ManageComment = ({
  commentId,
  commentedByUserId: commetedByUserId,
  isReply,
  onEdit,
}: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { mutateAsync: deleteBlog, isPending: isDeleting } = useDeleteComment();
  const user = useAuthStore((s) => s.user);

  const handleDelete = () => {
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteBlog(commentId);
      setIsModalOpen(false);
    } catch (error) {
      if (!useAuthStore.getState().isTokenExpired) {
        showErrorToast("An error occurred. Please try again later.");
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
          <BsThreeDots className="text-xl text-muted-foreground" />
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
            >
              <MdOutlineDelete className="text-lg text-destructive" />
              Delete
            </Button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmationModal
        isOpen={isModalOpen}
        isDeleting={isDeleting}
        message={`Are you sure you want to delete this ${
          isReply ? "reply" : "comment"
        }?`}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
};

export default ManageComment;
