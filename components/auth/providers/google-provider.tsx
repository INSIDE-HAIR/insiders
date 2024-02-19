import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import React from "react";

function GoogleProvider({ isPending, onClick}: { isPending?: boolean, onClick: (provider: "google" | "github") => void}) {
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
        <Icons.google className="mr-2 h-4 w-4" />
      )}{" "}
      Google
    </Button>
  );
}

export default GoogleProvider;
