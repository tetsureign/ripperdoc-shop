import { useState } from "react";
import { useNavigate } from "react-router";
import { LoginForm } from "@/components/login-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { APP_ROUTES } from "@/lib/routes";
import { authService } from "@/services/authService";
import { AlertCircle } from "lucide-react";
import { AxiosError } from "axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.login({
        email,
        password,
      });
      navigate(APP_ROUTES.dashboard.url);
    } catch (err) {
      if (err instanceof AxiosError) {
        if (err.response?.data) {
          setError(err.response?.data);
        } else {
          setError(err.message);
        }
      } else {
        setError("Unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm gap-2 flex flex-col">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>An error occured</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <LoginForm
          email={email}
          password={password}
          onSubmit={handleLogin}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          isLoading={loading}
        />
      </div>
    </div>
  );
}
