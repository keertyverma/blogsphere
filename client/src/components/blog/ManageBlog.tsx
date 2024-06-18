import { MdEdit, MdOutlineDelete } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";

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

      <Button
        variant="outline"
        size="icon"
        className="w-8 h-8 rounded-full flex-center"
      >
        <MdOutlineDelete className="text-lg text-destructive" />
      </Button>
    </div>
  );
};

export default ManageBlog;
