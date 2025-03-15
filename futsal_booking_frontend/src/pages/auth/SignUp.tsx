import SignUpForm from "../../components/login/SignUpForm";
import useRedirectIfLoggedIn from "../../hooks/useRedirectIfLoggedIn";

export default function SignUp() {
  useRedirectIfLoggedIn();
  return (
    <>
      <SignUpForm />
    </>
  );
}
