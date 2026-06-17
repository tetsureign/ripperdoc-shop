import { toast } from "sonner";
import { z } from "zod";

import { Brand } from "@/types/brand";
import { UI_LABELS } from "@/lib/routes";

import { brandFormSchema } from "./BrandForm";
import pluralize from "pluralize";
import { useFormState } from "./useFormState";
import { useDeleteState } from "@/hooks/useDeleteState";
import { useTableState } from "@/hooks/useTableState";
import {
  useCreateBrand,
  useRestoreBrand,
  useHardDeleteBrand,
  useSoftDeleteBrand,
  useUpdateBrand,
} from "./network";

export function useBrands() {
  const tableState = useTableState();
  const formState = useFormState();
  const deleteState = useDeleteState();

  const createBrand = useCreateBrand();
  const updateBrand = useUpdateBrand(formState.brand.id);
  const softDelete = useSoftDeleteBrand();
  const hardDelete = useHardDeleteBrand();
  const restore = useRestoreBrand();

  const isDeleting =
    softDelete.isPending || hardDelete.isPending || restore.isPending;

  const isSubmitting = createBrand.isPending || updateBrand.isPending;

  const openCreateForm = () => {
    formState.setBrand({
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

  const openEditForm = (brand: Brand) => {
    formState.setBrand(brand);
    formState.form.reset({ name: brand.name, description: brand.description });
    formState.setIsEditMode(true);
    formState.setOpenSheet(true);
  };

  const stageSoftDelete = (brandId: string) => {
    deleteState.setAlertMessage({
      title: "Trash it?",
      description: "Wanna trash it? You can dig it back later.",
    });
    deleteState.setSelectedId(brandId);
    deleteState.setDeleteMode("soft");
    deleteState.setOpenConfirmDialog(true);
  };

  const stageHardDelete = (brandId: string) => {
    deleteState.setAlertMessage({
      title: "Flatline this?",
      description: "You're reaching the point of no return.",
    });
    deleteState.setSelectedId(brandId);
    deleteState.setDeleteMode("hard");
    deleteState.setOpenConfirmDialog(true);
  };

  const stageRestore = (brandId: string) => {
    deleteState.setAlertMessage({
      title: "Revive it?",
      description: "Bring it back to life?",
    });
    deleteState.setSelectedId(brandId);
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

  async function submitForm(values: z.infer<typeof brandFormSchema>) {
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
  };
}
