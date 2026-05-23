import { SignIn } from "@clerk/nextjs";
import AuthLayout from "../../components/AuthLayout";

export default function Page() {
  return (
    <AuthLayout>
      <SignIn forceRedirectUrl="/auth-callback" />
    </AuthLayout>
  );
}
