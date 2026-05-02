import { LoginForm } from "@/components/auth/login-form";
import { AuthPageWrapper } from "@/components/auth/auth-page-wrapper";

export default function LoginPage() {
  return (
    <AuthPageWrapper title="Welcome back" subtitle="Sign in to your Wipu account">
      <LoginForm />
    </AuthPageWrapper>
  );
}
