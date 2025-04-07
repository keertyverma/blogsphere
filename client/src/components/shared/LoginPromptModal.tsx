import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

type Props = {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
};

const LoginPromptModal = ({
  open,
  title,
  message,
  onConfirm,
  onCancel,
}: Props) => {
  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="w-[90vw] max-w-[400px] h-auto fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] z-50 rounded-2xl">
        <DialogHeader className="items-center space-y-3">
          <div className="w-16 h-16 rounded-full overflow-hidden">
            <img
              src="/assets/images/default_profile.png"
              loading="lazy"
              className="w-full h-full object-cover"
            />
          </div>
          <DialogTitle className="text-xl font-medium">{title}</DialogTitle>
          <DialogDescription className="text-sm md:text-base text-muted-foreground text-center">
            {`👋 Hey there! ${message}`}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="w-[50%] flex justify-center items-center mx-auto">
          <Button onClick={onConfirm} className="w-full rounded-full">
            Log in
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LoginPromptModal;
