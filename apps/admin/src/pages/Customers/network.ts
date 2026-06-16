import { customersService } from "@/services/customersService";
import { useQuery } from "@tanstack/react-query";

export const useCustomersQuery = (
  includeDeleted = false,
  page = 1,
  pageSize = 10,
) =>
  useQuery({
    queryKey: ["customers", { includeDeleted, page, pageSize }],
    queryFn: async () => {
      const response = await customersService.getAll(
        includeDeleted,
        page,
        pageSize,
      );
      return response.data;
    },
  });
