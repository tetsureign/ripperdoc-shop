import { toast } from "sonner";
import { z } from "zod";

import { Category } from "@/types/category";
import { UI_LABELS } from "@/lib/routes";

import { categoryFormSchema } from "./CategoryForm";
import pluralize from "pluralize";
import { useFormState } from "./useFormState";
import { useDeleteState } from "@/hooks/useDeleteState";
import { useTableState } from "@/hooks/useTableState";
import {
  useCreateCategory,
  useRestoreCategory,
  useHardDeleteCategory,
  useSoftDeleteCategory,
  useUpdateCategory,
} from "./network";

export function useCategories() {
  const tableState = useTableState();
  const formState = useFormState();
  const deleteState = useDeleteState();

  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory(formState.category.id);
  const softDelete = useSoftDeleteCategory();
  const hardDelete = useHardDeleteCategory();
  const restore = useRestoreCategory();

  const isDeleting =
    softDelete.isPending || hardDelete.isPending || restore.isPending;

  const isSubmitting = createCategory.isPending || updateCategory.isPending;

  const openCreateForm = () => {
    formState.setCategory({
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

  const openEditForm = (category: Category) => {
    formState.setCategory(category);
    formState.form.reset({ name: category.name, description: category.description });
    formState.setIsEditMode(true);
    formState.setOpenSheet(true);
  };

  const stageSoftDelete = (categoryId: string) => {
    deleteState.setAlertMessage({
      title: "Trash it?",
      description: "Wanna trash it? You can dig it back later.",
    });
    deleteState.setSelectedId(categoryId);
    deleteState.setDeleteMode("soft");
    deleteState.setOpenConfirmDialog(true);
  };

  const stageHardDelete = (categoryId: string) => {
    deleteState.setAlertMessage({
      title: "Flatline this?",
      description: "You're reaching the point of no return.",
    });
    deleteState.setSelectedId(categoryId);
    deleteState.setDeleteMode("hard");
    deleteState.setOpenConfirmDialog(true);
  };

  const stageRestore = (categoryId: string) => {
    deleteState.setAlertMessage({
      title: "Revive it?",
      description: "Bring it back to life?",
    });
    deleteState.setSelectedId(categoryId);
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
    const label = pluralize.singular(UI_LABELS.categories.toLowerCase());

    const promise =
      mode === "soft"
        ? softDelete.mutateAsync(id)
        : mode === "hard"
          ? hardDelete.mutateAsync(id)
          : restore.mutateAsync(id);

    toast.promise(promise, {
      loading: `${v.ing} ${label}...`,
      success: `${pluralize.singular(UI_LABELS.categories)} ${v.ed} successfully`,
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

  async function submitForm(values: z.infer<typeof categoryFormSchema>) {
    const label = pluralize.singular(UI_LABELS.categories.toLowerCase());

    const promise = formState.isEditMode
      ? updateCategory.mutateAsync(values)
      : createCategory.mutateAsync(values);

    toast.promise(promise, {
      loading: formState.isEditMode
        ? `Updating ${label}...`
        : `Creating ${label}...`,
      success: formState.isEditMode
        ? `${pluralize.singular(UI_LABELS.categories)} updated successfully`
        : `${pluralize.singular(UI_LABELS.categories)} created successfully`,
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
