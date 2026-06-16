import { toast } from "sonner";
import { z } from "zod";

import { Product } from "@/types/product";
import { Category } from "@/types/category";
import { UI_LABELS } from "@/lib/routes";

import { productFormSchema } from "./ProductForm";
import pluralize from "pluralize";
import { useFormState } from "./useFormState";
import { useDeleteState } from "@/hooks/useDeleteState";
import { useTableState } from "@/hooks/useTableState";
import {
  useCreateProduct,
  useRestoreProduct,
  useHardDeleteProduct,
  useSoftDeleteProduct,
  useUpdateProduct,
  useFeatureProduct,
  useUnfeatureProduct,
} from "./network";

export function useProducts() {
  const tableState = useTableState();
  const formState = useFormState();
  const deleteState = useDeleteState();

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct(formState.product.id);
  const softDelete = useSoftDeleteProduct();
  const hardDelete = useHardDeleteProduct();
  const restore = useRestoreProduct();
  const featureProduct = useFeatureProduct();
  const unfeatureProduct = useUnfeatureProduct();

  const isDeleting =
    softDelete.isPending || hardDelete.isPending || restore.isPending;

  const isSubmitting = createProduct.isPending || updateProduct.isPending;

  const openCreateForm = () => {
    formState.setProduct({
      id: "",
      name: "",
      slug: "",
      description: "",
      imageUrl: "",
      price: 0,
      isFeatured: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      category: {
        id: "",
        name: "",
        slug: "",
        description: "",
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      } as Category,
      brand: null,
    });
    formState.form.reset({
      name: "",
      description: "",
      imageUrl: "",
      price: 0,
      isFeatured: false,
      categoryId: "",
      brandId: "__none__",
    });
    formState.setIsEditMode(false);
    formState.setOpenSheet(true);
  };

  const openEditForm = (product: Product) => {
    formState.setProduct(product);
    formState.form.reset({
      name: product.name,
      description: product.description,
      imageUrl: product.imageUrl,
      price: product.price,
      isFeatured: product.isFeatured,
      categoryId: product.category.id,
      brandId: product.brand?.id ?? "__none__",
    });
    formState.setIsEditMode(true);
    formState.setOpenSheet(true);
  };

  const stageSoftDelete = (productId: string) => {
    deleteState.setAlertMessage({
      title: "Trash it?",
      description: "Wanna trash it? You can dig it back later.",
    });
    deleteState.setSelectedId(productId);
    deleteState.setDeleteMode("soft");
    deleteState.setOpenConfirmDialog(true);
  };

  const stageHardDelete = (productId: string) => {
    deleteState.setAlertMessage({
      title: "Flatline this?",
      description: "You're reaching the point of no return.",
    });
    deleteState.setSelectedId(productId);
    deleteState.setDeleteMode("hard");
    deleteState.setOpenConfirmDialog(true);
  };

  const stageRestore = (productId: string) => {
    deleteState.setAlertMessage({
      title: "Revive it?",
      description: "Bring it back to life?",
    });
    deleteState.setSelectedId(productId);
    deleteState.setDeleteMode("restore");
    deleteState.setOpenConfirmDialog(true);
  };

  const executeStaged = async () => {
    const id = deleteState.selectedId;
    const mode = deleteState.deleteMode;

    const verbMap = {
      soft: { ing: "Trashing", ed: "trashed", fail: "trash" },
      hard: { ing: "Deleting", ed: "deleted", fail: "delete" },
      restore: { ing: "Restoring", ed: "restored", fail: "restore" },
    };
    const v = verbMap[mode];
    const label = pluralize.singular(UI_LABELS.products.toLowerCase());

    const promise =
      mode === "soft"
        ? softDelete.mutateAsync(id)
        : mode === "hard"
          ? hardDelete.mutateAsync(id)
          : restore.mutateAsync(id);

    toast.promise(promise, {
      loading: `${v.ing} ${label}...`,
      success: `${pluralize.singular(UI_LABELS.products)} ${v.ed} successfully`,
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

  async function submitForm(values: z.infer<typeof productFormSchema>) {
    const label = pluralize.singular(UI_LABELS.products.toLowerCase());

    const payload = {
      ...values,
      brandId: values.brandId === "__none__" ? null : values.brandId,
    };

    const promise = formState.isEditMode
      ? updateProduct.mutateAsync(payload)
      : createProduct.mutateAsync(payload);

    toast.promise(promise, {
      loading: formState.isEditMode
        ? `Updating ${label}...`
        : `Creating ${label}...`,
      success: formState.isEditMode
        ? `${pluralize.singular(UI_LABELS.products)} updated successfully`
        : `${pluralize.singular(UI_LABELS.products)} created successfully`,
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

  const handleFeature = async (productId: string) => {
    const promise = featureProduct.mutateAsync(productId);
    toast.promise(promise, {
      loading: "Featuring product...",
      success: "Product featured.",
      error: "Error featuring product.",
    });
    try {
      await promise;
    } catch (err) {
      console.error("Failed to feature product", err);
    }
  };

  const handleUnfeature = async (productId: string) => {
    const promise = unfeatureProduct.mutateAsync(productId);
    toast.promise(promise, {
      loading: "Unfeaturing product...",
      success: "Product unfeatured.",
      error: "Error unfeaturing product.",
    });
    try {
      await promise;
    } catch (err) {
      console.error("Failed to unfeature product", err);
    }
  };

  return {
    tableState,
    formState,
    deleteState,
    isDeleting,
    isSubmitting,
    openCreateForm,
    openEditForm,
    stageSoftDelete,
    stageHardDelete,
    stageRestore,
    executeStaged,
    submitForm,
    handleFeature,
    handleUnfeature,
  };
}
