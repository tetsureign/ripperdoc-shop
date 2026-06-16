import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { BrandDTO, brandsService } from "@/services/brandsService";
import { Brand } from "@/types/brand";
import { zodResolver } from "@hookform/resolvers/zod";
import { VisibilityState } from "@tanstack/react-table";
import { UI_LABELS } from "@/lib/routes";

import { brandFormSchema } from "./BrandForm";
import pluralize from "pluralize";

// ---------------------------------------------------------------------------
// Primitive state hooks (UI only — no data fetching)
// ---------------------------------------------------------------------------

export function useTableState(includeDeleted = false) {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    deletedAt: includeDeleted,
  });
  const [pageIndex, setPageIndex] = useState(0); // 0-based for TanStack Table
  const [pageSize, setPageSize] = useState(10);

  return {
    columnVisibility,
    setColumnVisibility,
    pageIndex,
    setPageIndex,
    pageSize,
    setPageSize,
  };
}

export function useFormState() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [openSheet, setOpenSheet] = useState(false);

  const form = useForm<z.infer<typeof brandFormSchema>>({
    resolver: zodResolver(brandFormSchema),
    defaultValues: { name: "", description: "" },
  });

  return {
    isEditMode,
    setIsEditMode,
    openSheet,
    setOpenSheet,
    form,
  };
}

export function useDeleteState() {
  const [deleteMode, setDeleteMode] = useState<"soft" | "hard" | "restore">(
    "soft",
  );
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [selectedBrandId, setSelectedBrandId] = useState<string>("");
  const [alertMessage, setAlertMessage] = useState({
    title: "",
    description: "",
  });

  return {
    deleteMode,
    setDeleteMode,
    openConfirmDialog,
    setOpenConfirmDialog,
    selectedBrandId,
    setSelectedBrandId,
    alertMessage,
    setAlertMessage,
  };
}

// ---------------------------------------------------------------------------
// Query hooks
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Mutation hooks
// ---------------------------------------------------------------------------

export const useCreateBrandMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (brand: BrandDTO) => brandsService.create(brand),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
    },
  });
};

export const useUpdateBrandMutation = (brandId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (brand: BrandDTO) => brandsService.update(brandId, brand),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      queryClient.invalidateQueries({ queryKey: ["brand", brandId] });
    },
  });
};

export const useSoftDeleteBrandMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (brandId: string) => brandsService.softDelete(brandId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
    },
  });
};

export const useHardDeleteBrandMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (brandId: string) => brandsService.hardDelete(brandId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
    },
  });
};

export const useRestoreBrandMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (brandId: string) => brandsService.restore(brandId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
    },
  });
};

// ---------------------------------------------------------------------------
// Composite hook — orchestrates UI state + mutations
// ---------------------------------------------------------------------------

export function useBrands() {
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [brand, setBrand] = useState<Brand>({
    id: "",
    name: "",
    slug: "",
    description: "",
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  });

  const tableState = useTableState(includeDeleted);
  const formState = useFormState();
  const deleteState = useDeleteState();

  const createBrand = useCreateBrandMutation();
  const updateBrand = useUpdateBrandMutation(brand.id);
  const softDelete = useSoftDeleteBrandMutation();
  const hardDelete = useHardDeleteBrandMutation();
  const restore = useRestoreBrandMutation();

  const isDeleting =
    softDelete.isPending || hardDelete.isPending || restore.isPending;

  const isSubmitting = createBrand.isPending || updateBrand.isPending;

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------

  const handleCreate = () => {
    setBrand({
      id: "",
      name: "",
      slug: "",
      description: "",
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });
    formState.form.reset({ name: "", description: "" });
    formState.setIsEditMode(false);
    formState.setOpenSheet(true);
  };

  const handleUpdate = (brand: Brand) => {
    setBrand(brand);
    formState.form.reset({ name: brand.name, description: brand.description });
    formState.setIsEditMode(true);
    formState.setOpenSheet(true);
  };

  const handleSoftDelete = (brandId: string) => {
    deleteState.setAlertMessage({
      title: "Trash it?",
      description: "Wanna trash it? You can dig it back later.",
    });
    deleteState.setSelectedBrandId(brandId);
    deleteState.setDeleteMode("soft");
    deleteState.setOpenConfirmDialog(true);
  };

  const handleHardDelete = (brandId: string) => {
    deleteState.setAlertMessage({
      title: "Flatline this?",
      description: "You're reaching the point of no return.",
    });
    deleteState.setSelectedBrandId(brandId);
    deleteState.setDeleteMode("hard");
    deleteState.setOpenConfirmDialog(true);
  };

  const handleRestore = (brandId: string) => {
    deleteState.setAlertMessage({
      title: "Revive it?",
      description: "Bring it back to life?",
    });
    deleteState.setSelectedBrandId(brandId);
    deleteState.setDeleteMode("restore");
    deleteState.setOpenConfirmDialog(true);
  };

  const handleConfirmDelOperation = async () => {
    const id = deleteState.selectedBrandId;
    const mode = deleteState.deleteMode;

    const verbMap = {
      soft: { ing: "Trashing", ed: "trashed", fail: "trash" },
      hard: { ing: "Deleting", ed: "deleted", fail: "delete" },
      restore: { ing: "Restoring", ed: "restored", fail: "restore" },
    };
    const v = verbMap[mode];
    const label = pluralize.singular(UI_LABELS.brands.toLowerCase());

    const promise =
      mode === "soft"
        ? softDelete.mutateAsync(id)
        : mode === "hard"
          ? hardDelete.mutateAsync(id)
          : restore.mutateAsync(id);

    toast.promise(promise, {
      loading: `${v.ing} ${label}...`,
      success: `${pluralize.singular(UI_LABELS.brands)} ${v.ed} successfully`,
      error: `Failed to ${v.fail} ${label}`,
    });

    try {
      await promise;
    } catch (error) {
      console.error("Operation failed:", error);
    } finally {
      deleteState.setOpenConfirmDialog(false);
    }
  };

  async function onSubmit(values: z.infer<typeof brandFormSchema>) {
    const label = pluralize.singular(UI_LABELS.brands.toLowerCase());

    const promise = formState.isEditMode
      ? updateBrand.mutateAsync(values)
      : createBrand.mutateAsync(values);

    toast.promise(promise, {
      loading: formState.isEditMode
        ? `Updating ${label}...`
        : `Creating ${label}...`,
      success: formState.isEditMode
        ? `${pluralize.singular(UI_LABELS.brands)} updated successfully`
        : `${pluralize.singular(UI_LABELS.brands)} created successfully`,
      error: formState.isEditMode
        ? `Failed to update ${label}`
        : `Failed to create ${label}`,
    });

    try {
      await promise;
      formState.setOpenSheet(false);
    } catch (error) {
      console.error(`Failed to submit ${label}:`, error);
    }
  }

  return {
    state: {
      table: tableState,
      form: formState,
      delete: deleteState,
      includeDeleted,
      brand,
      isDeleting,
      isSubmitting,
    },
    actions: {
      setIncludeDeleted,
      setBrand,
      handleCreate,
      handleUpdate,
      handleSoftDelete,
      handleHardDelete,
      handleRestore,
      handleConfirmDelOperation,
      onSubmit,
    },
  };
}
