import { categoriesService, CategoryDTO } from "@/services/categoriesService";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

export const useCategoriesQuery = (
  includeDeleted = false,
  page = 1,
  pageSize = 10,
) =>
  useQuery({
    queryKey: ["categories", { includeDeleted, page, pageSize }],
    queryFn: async () => {
      const response = await categoriesService.getAll(
        includeDeleted,
        page,
        pageSize,
      );
      return response.data;
    },
  });

export const useCategoryQuery = (categoryId: string) =>
  useQuery({
    queryKey: ["category", categoryId],
    queryFn: async () => {
      const response = await categoriesService.getById(categoryId);
      return response.data;
    },
    enabled: !!categoryId,
  });

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (category: CategoryDTO) => categoriesService.create(category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

export const useUpdateCategory = (categoryId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (category: CategoryDTO) =>
      categoriesService.update(categoryId, category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["category", categoryId] });
    },
  });
};

export const useSoftDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryId: string) => categoriesService.softDelete(categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

export const useHardDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryId: string) => categoriesService.hardDelete(categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

export const useRestoreCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryId: string) => categoriesService.restore(categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};
