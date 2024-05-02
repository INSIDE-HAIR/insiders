import { Button } from "@/src/components/ui/buttons/chadcn-button";
import { Icons } from "@/src/components/icons";

function GithubProvider({ isPending, onClick}: { isPending?: boolean, onClick: (provider: "google" | "github") => void}) {

  return (
    <Button
      variant="outline"
      type="button"
      className="w-full"
      disabled={isPending}
      onClick={() => onClick}
    >
      {isPending ? (
        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Icons.gitHub className="mr-2 h-4 w-4" />
      )}{" "}
      GitHub
    </Button>
  );
}

export default GithubProvider;