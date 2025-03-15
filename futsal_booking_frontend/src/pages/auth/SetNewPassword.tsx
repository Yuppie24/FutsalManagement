import { useState } from "react";
import CommonAuthLayout from "../../layout/CommonAuthLayout";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { cn } from "../../lib/utils";
import NewPasswordForm from "../../components/login/NewPasswordForm";
import successGif from "../../assets/gif/cartoon.gif";
import useRedirectIfLoggedIn from "../../hooks/useRedirectIfLoggedIn";

export default function SetNewPassword() {

  useRedirectIfLoggedIn();

  const [verified, setVerified] = useState(false);

  return (
    <CommonAuthLayout
      backLink="/auth/reset-password"
      title={
        verified
          ? "Your password was successfully updated!"
          : "Set Your New Password"
      }
      subTitle={
        verified
          ? "You can now login with your new password"
          : "Enter your new password"
      }
      mailImage={false}
    >
      {!verified ? (
        <NewPasswordForm setVerified={setVerified} />
      ) : (
        <div className="mx-auto w-[480px] h-auto flex flex-col gap-[24px]">
          <img
            src={successGif}
            className="mx-auto h-[300px] w-[300px]"
            alt="Success gif"
          />
          <Link to={"/auth"} className="button w-full mx-auto">
            <Button
              type="submit"
              size={"login"}
              variant={"login"}
              className={cn(
                "flex justify-center items-center gap-4 cursor-pointer w-full"
              )}
            >
              Continue to Login
            </Button>
          </Link>
        </div>
      )}
    </CommonAuthLayout>
  );
}
