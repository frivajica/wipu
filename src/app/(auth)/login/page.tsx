import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold font-display text-text-primary">
          Welcome back
        </h1>
        <p className="text-text-secondary mt-1">
          Sign in to your Wipu account
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
