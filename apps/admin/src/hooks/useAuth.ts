import { authService } from "@/services/authService";
import { useQuery } from "@tanstack/react-query";

export const useAuth = () => {
  const query = useQuery({
    queryKey: ["auth", "whoami"],
    queryFn: () => authService.whoami().then((r) => r.data),
    retry: false, // don't retry on 401
  });

  return { user: query.data, loading: query.isLoading };
};
