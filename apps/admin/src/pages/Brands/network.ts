import { brandsService, BrandDTO } from "@/services/brandsService";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

export const useBrandsQuery = (
  includeDeleted = false,
  page = 1,
  pageSize = 10,
) =>
  useQuery({
    queryKey: ["brands", { includeDeleted, page, pageSize }],
    queryFn: async () => {
      const response = await brandsService.getAll(
        includeDeleted,
        page,
        pageSize,
      );
      return response.data;
    },
  });

export const useBrandQuery = (brandId: string) =>
  useQuery({
    queryKey: ["brand", brandId],
    queryFn: async () => {
      const response = await brandsService.getById(brandId);
      return response.data;
    },
    enabled: !!brandId,
  });

export const useCreateBrand = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (brand: BrandDTO) => brandsService.create(brand),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
    },
  });
};

export const useUpdateBrand = (brandId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (brand: BrandDTO) => brandsService.update(brandId, brand),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      queryClient.invalidateQueries({ queryKey: ["brand", brandId] });
    },
  });
};

export const useSoftDeleteBrand = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (brandId: string) => brandsService.softDelete(brandId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
    },
  });
};

export const useHardDeleteBrand = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (brandId: string) => brandsService.hardDelete(brandId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
    },
  });
};

export const useRestoreBrand = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (brandId: string) => brandsService.restore(brandId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
    },
  });
};
