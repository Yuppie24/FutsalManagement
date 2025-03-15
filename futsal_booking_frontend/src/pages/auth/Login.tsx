import { LoginForm } from "../../components";
import useRedirectIfLoggedIn from "../../hooks/useRedirectIfLoggedIn";

export default function Login() {
  useRedirectIfLoggedIn();
  return (
    <>
      <LoginForm />
    </>
  );
}
