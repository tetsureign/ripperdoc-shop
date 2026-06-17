import { authService } from "@/services/authService";
import { useQuery } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useAuthUser = () => {
  const query = useQuery({
    queryKey: ["auth", "whoami"],
    queryFn: () => authService.whoami().then((r) => r.data),
    staleTime: Infinity,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: false, // don't retry on 401
  });

  return { user: query.data, loading: query.isLoading };
};

export function useAuthMutations() {
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authService
        .login({
          email,
          password,
        })
        .then((r) => r.data),
    onSuccess: (userData) => {
      queryClient.setQueryData(["auth"], userData);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => await authService.logout(),
    onSuccess: () => {
      queryClient.clear();
    },
  });

  return { loginMutation, logoutMutation };
}
