import CardWrapper from "@/src/components/custom/auth/card/auth-card-wrapper";
import { headers, type UnsafeUnwrappedHeaders } from "next/headers";
import React from "react";

type Props = {};

const VerifyRequestPage = (props: Props) => {
  const headersList = (headers() as unknown as UnsafeUnwrappedHeaders);
  const domain = headersList.get("host") || "";

  return (
    <section className="shadow-2xl h-screen flex items-center justify-center w-screen">
      <CardWrapper
        headerLabel="Check your email"
        backButtonHref="/"
        backButtonLabel={"Ir a " + domain}
      >
        <p className="text-center">A sign in link has been sent to</p>
        <p className="text-center">your email address</p>
      </CardWrapper>
    </section>
  );
};

export default VerifyRequestPage;
