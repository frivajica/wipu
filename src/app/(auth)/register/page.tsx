import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold font-display text-text-primary">
          Create account
        </h1>
        <p className="text-text-secondary mt-1">
          Start tracking with Wipu
        </p>
      </div>
      <RegisterForm />
    </div>
  );
}
