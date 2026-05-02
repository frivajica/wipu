import { RegisterForm } from "@/components/auth/register-form";
import { AuthPageWrapper } from "@/components/auth/auth-page-wrapper";

export default function RegisterPage() {
  return (
    <AuthPageWrapper title="Create account" subtitle="Start tracking with Wipu">
      <RegisterForm />
    </AuthPageWrapper>
  );
}
