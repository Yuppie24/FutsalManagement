import CommonAuthLayout from "../../layout/CommonAuthLayout";
import EmailVerify from "../../components/login/EmailVerify";
import useRedirectIfLoggedIn from "../../hooks/useRedirectIfLoggedIn";

export default function ResetPasswordOTP() {
  useRedirectIfLoggedIn();

  return (
    <CommonAuthLayout
      backLink="/auth/reset-password"
      title="Reset Password"
      subTitle="Enter the OTP sent to your email address"
    >
      <EmailVerify
        type="ResetPassword"
        redirectLink="/auth/reset-password/set-new-password"
      />
    </CommonAuthLayout>
  );
}
