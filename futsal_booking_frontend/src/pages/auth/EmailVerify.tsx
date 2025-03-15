import EmailVerify from "../../components/login/EmailVerify";
import CommonAuthLayout from "../../layout/CommonAuthLayout";

export default function EmailVerifyOTP() {
  return (
    <CommonAuthLayout
      backLink="/auth"
      title="Verify Email"
      subTitle="Enter the OTP sent to your email address"
    >
      <EmailVerify
        OTP="123456"
        type="EmailVerify"
        redirectLink="/auth"
      />
    </CommonAuthLayout>
  )
}
