import { useState } from "react";
import { useNavigate } from "react-router";
import { LoginForm } from "@/components/login-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { APP_ROUTES } from "@/lib/routes";
import { AlertCircle } from "lucide-react";
import { useAuthMutations } from "@/hooks/useAuth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const { loginMutation } = useAuthMutations();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await loginMutation.mutateAsync({ email, password });
    navigate(APP_ROUTES.dashboard.url);
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm gap-2 flex flex-col">
        {loginMutation.error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>An error occured</AlertTitle>
            <AlertDescription>{loginMutation.error.message}</AlertDescription>
          </Alert>
        )}

        <LoginForm
          email={email}
          password={password}
          onSubmit={handleLogin}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          isLoading={loginMutation.isPending}
        />
      </div>
    </div>
  );
}
