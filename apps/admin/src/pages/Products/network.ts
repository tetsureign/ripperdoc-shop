import { productsService, ProductDTO } from "@/services/productsService";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

export const useProductsQuery = (
  includeDeleted = false,
  page = 1,
  pageSize = 10,
) =>
  useQuery({
    queryKey: ["products", { includeDeleted, page, pageSize }],
    queryFn: async () => {
      const response = await productsService.getAll(
        includeDeleted,
        page,
        pageSize,
      );
      return response.data;
    },
  });

export const useProductQuery = (productId: string) =>
  useQuery({
    queryKey: ["product", productId],
    queryFn: async () => {
      const response = await productsService.getById(productId);
      return response.data;
    },
    enabled: !!productId,
  });

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (product: ProductDTO) => productsService.create(product),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useUpdateProduct = (productId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (product: ProductDTO) =>
      productsService.update(productId, product),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", productId] });
    },
  });
};

export const useSoftDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => productsService.softDelete(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useHardDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => productsService.hardDelete(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useRestoreProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => productsService.restore(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useFeatureProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => productsService.feature(productId),
    onSuccess: (_, productId) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", productId] });
    },
  });
};

export const useUnfeatureProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => productsService.unfeature(productId),
    onSuccess: (_, productId) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", productId] });
    },
  });
};
