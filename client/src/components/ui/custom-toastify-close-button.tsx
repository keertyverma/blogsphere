import { IoClose } from "react-icons/io5";
import { Button } from "./button";

const CustomCloseButton = ({ closeToast }: { closeToast?: () => void }) => (
  <Button variant="ghost" onClick={closeToast}>
    <IoClose className="text-lg hover:text-muted-foreground" />
  </Button>
);

export default CustomCloseButton;
