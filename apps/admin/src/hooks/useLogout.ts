import { useNavigate } from "react-router";
import { APP_ROUTES } from "@/lib/routes";
import { useAuthMutations } from "./useAuth";

export const useLogout = () => {
  const navigate = useNavigate();
  const { logoutMutation } = useAuthMutations();

  const logout = async () => {
    await logoutMutation.mutateAsync();
    navigate(APP_ROUTES.login.url, { replace: true });
  };

  return logout;
};
