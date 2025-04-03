import { Button } from "../ui/button";
import TextWithLoader from "../ui/text-with-loader";

interface Props {
  isOpen: boolean;
  isDeleting: boolean;
  message: string;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmationModal = ({
  isOpen,
  isDeleting,
  message,
  onClose,
  onConfirm,
}: Props) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-background p-8 rounded-md shadow-lg border border-muted-foreground/40">
        <p>{message}</p>
        <div className="mt-4 flex justify-end">
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            className="border border-muted-foreground/40"
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onConfirm}
            className="ml-2 flex gap-1"
            disabled={isDeleting}
          >
            <TextWithLoader
              text="Delete"
              isLoading={isDeleting}
              loaderClassName="text-white"
            />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
