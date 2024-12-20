import React from "react";
import EmailLoginForm from "../forms/email-login-form";

type Props = {};

const NonPasswordLogins = (props: Props) => {
  return (
    <div>
      <div className=" w-full  px-2 flex">
        <span className="border-t grow"></span>
        <span className="text-center text-xs -mt-2 bg-inherit opacity-100">
          No password providers
        </span>
        <span className="border-t grow"></span>
      </div>
      <div className="flex flex-col w-full gap-6">
        <EmailLoginForm />
      </div>
    </div>
  );
};

export default NonPasswordLogins;
