import { useDeleteComment } from "@/lib/react-query/queries";
import { useAuthStore } from "@/store";
import { useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
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
}
const ManageComment = ({
  commentId,
  commentedByUserId: commetedByUserId,
}: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { mutateAsync: deleteBlog, isPending: isDeleting } = useDeleteComment();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);

  const handleDelete = () => {
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsModalOpen(false);
    const loadingToast = toast.loading("Deleting ...");
    try {
      await deleteBlog({ commentId, token });
      toast.dismiss(loadingToast);
      toast.success("Comment Deleted.");
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("An error occurred. Please try again later.", {
        position: "top-right",
        className: "mt-20",
      });
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
                  className="bg-transparent text-muted-foreground w-full justify-start"
                >
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
              className="bg-transparent text-muted-foreground w-full justify-start"
              disabled={isDeleting}
            >
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