import { Button } from "@/src/components/ui/button";
import { Icons } from "@/src/components/icons";

function GoogleProvider({
  isPending,
  onClick,
}: {
  isPending?: boolean;
  onClick: (provider: "google" | "github") => void;
}) {
  return (
    <Button
      variant="outline"
      type="button"
      className="w-full"
      disabled={isPending}
      onClick={() => onClick}
    >
      {isPending ? (
        <Icons.SpinnerIcon className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Icons.GoogleIcon className="mr-2 h-4 w-4" />
      )}{" "}
      Google
    </Button>
  );
}

export default GoogleProvider;
