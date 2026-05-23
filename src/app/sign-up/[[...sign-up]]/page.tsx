import { SignUp } from "@clerk/nextjs";
import AuthLayout from "../../components/AuthLayout";

export default function Page() {
  return (
    <AuthLayout>
      <SignUp forceRedirectUrl="/sign-out-redirect" />
    </AuthLayout>
  );
}
