import { Button } from "../ui/button";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmationModal = ({ isOpen, onClose, onConfirm }: Props) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded shadow-lg">
        <p>Are you sure you want to delete this comment?</p>
        <div className="mt-4 flex justify-end">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onConfirm}
            className="ml-2"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
