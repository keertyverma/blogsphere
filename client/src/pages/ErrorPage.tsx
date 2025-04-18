import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const ErrorPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <section className="h-cover flex-center flex-col md:flex-row gap-10 text-center">
        <img
          src="/assets/images/page_not_found_error.jpeg"
          alt="page not found"
          className="border-2 border-border w-72 aspect-square object-cover rounded-md"
        />
        <div className="flex-center flex-col gap-2">
          <h1 className="text-4xl tracking-tight font-bold text-primary/50">
            404
          </h1>
          <div>
            <p className="text-lg md:text-xl">
              Looks like this page doesn't exist!
            </p>
            <p className="text-sm md:text-base text-muted-foreground mt-1">
              Go back to home and continue exploring.
            </p>
          </div>

          <Button
            onClick={() => navigate("/")}
            size="sm"
            className="capitalize w-fit mt-2"
          >
            back to home
          </Button>
        </div>
      </section>
    </>
  );
};

export default ErrorPage;
