import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { categoriesService } from "@/services/categoriesService";
import { Category } from "@/types/category";
import { zodResolver } from "@hookform/resolvers/zod";
import { VisibilityState } from "@tanstack/react-table";

import { categoryFormSchema } from "./CategoryForm";
import pluralize from "pluralize";
import { UI_LABELS } from "@/lib/routes";

export function useTableState(includeDeleted = false) {
  const [data, setData] = useState<Category[]>([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    deletedAt: includeDeleted,
  });
  const [pageIndex, setPageIndex] = useState(0); // 0-based for TanStack Table
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);

  return {
    data,
    setData,
    tableLoading,
    setTableLoading,
    columnVisibility,
    setColumnVisibility,
    pageIndex,
    setPageIndex,
    pageSize,
    setPageSize,
    totalCount,
    setTotalCount,
    pageCount,
    setPageCount,
  };
}

export function useFormState(category: Category) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [openSheet, setOpenSheet] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);

  const form = useForm<z.infer<typeof categoryFormSchema>>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: category.name,
      description: category.description,
    },
  });

  return {
    isEditMode,
    setIsEditMode,
    openSheet,
    setOpenSheet,
    isDataLoading,
    setIsDataLoading,
    form,
  };
}

export function useDeleteState() {
  const [deleteMode, setDeleteMode] = useState<"soft" | "hard" | "restore">(
    "soft",
  );
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [alertMessage, setAlertMessage] = useState({
    title: "",
    description: "",
  });

  return {
    deleteMode,
    setDeleteMode,
    openConfirmDialog,
    setOpenConfirmDialog,
    selectedCategoryId,
    setSelectedCategoryId,
    alertMessage,
    setAlertMessage,
  };
}

export function useCategories() {
  const [error, setError] = useState<string | null>(null);
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [category, setCategory] = useState<Category>({
    id: "",
    name: "",
    slug: "",
    description: "",
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  });

  const tableState = useTableState(includeDeleted);
  const formState = useFormState(category);
  const deleteState = useDeleteState();

  const fetchCategories = async (
    includeDeleted = false,
    page = 1,
    pageSize = 10,
  ) => {
    try {
      tableState.setTableLoading(true);
      const response = await categoriesService.getAll(
        includeDeleted,
        page,
        pageSize,
      );
      tableState.setData(response.data.categories);
      tableState.setTotalCount(response.data.totalCount);
      tableState.setPageCount(response.data.totalPages);
    } catch (err) {
      setError("Failed to fetch categories");
      console.error(err);
    } finally {
      tableState.setTableLoading(false);
    }
  };

  const handleCreate = () => {
    setCategory({
      id: "",
      name: "",
      slug: "",
      description: "",
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });
    formState.setIsEditMode(false);
    formState.setOpenSheet(true);
  };

  const handleUpdate = (category: Category) => {
    setCategory(category);
    formState.setIsEditMode(true);
    formState.setOpenSheet(true);
  };

  const handleSoftDelete = async (categoryId: string) => {
    deleteState.setAlertMessage({
      title: "Trash it?",
      description: "Wanna trash it? You can dig it back later.",
    });
    deleteState.setSelectedCategoryId(categoryId);
    deleteState.setDeleteMode("soft");
    deleteState.setOpenConfirmDialog(true);
  };

  const handleHardDelete = async (categoryId: string) => {
    deleteState.setAlertMessage({
      title: "Flatline this?",
      description: "You're reaching the point of no return.",
    });
    deleteState.setSelectedCategoryId(categoryId);
    deleteState.setDeleteMode("hard");
    deleteState.setOpenConfirmDialog(true);
  };

  const handleRestore = async (categoryId: string) => {
    deleteState.setAlertMessage({
      title: "Revive it?",
      description: "Bring it back to life?",
    });
    deleteState.setSelectedCategoryId(categoryId);
    deleteState.setDeleteMode("restore");
    deleteState.setOpenConfirmDialog(true);
  };

  const handleConfirmDelOperation = async () => {
    try {
      formState.setIsDataLoading(true);

      let promise;

      switch (deleteState.deleteMode) {
        case "soft":
          promise = categoriesService.softDelete(
            deleteState.selectedCategoryId,
          );
          break;
        case "hard":
          promise = categoriesService.hardDelete(
            deleteState.selectedCategoryId,
          );
          break;
        case "restore":
          promise = categoriesService.restore(deleteState.selectedCategoryId);
          break;
      }

      toast.promise(promise, {
        loading: `${
          deleteState.deleteMode === "restore"
            ? "Restoring"
            : deleteState.deleteMode === "hard"
              ? "Deleting"
              : "Trashing"
        } ${pluralize.singular(UI_LABELS.categories.toLowerCase())}...`,
        success: `${pluralize.singular(UI_LABELS.categories)} ${
          deleteState.deleteMode === "restore"
            ? "restored"
            : deleteState.deleteMode === "hard"
              ? "deleted"
              : "trashed"
        } successfully`,
        error: `Failed to ${
          deleteState.deleteMode === "restore"
            ? "restore"
            : deleteState.deleteMode === "hard"
              ? "delete"
              : "trash"
        } ${pluralize.singular(UI_LABELS.categories.toLowerCase())}`,
      });

      await promise;

      await fetchCategories(includeDeleted);
    } catch (error) {
      console.error("Operation failed:", error);
      toast.error("Operation failed");
    } finally {
      deleteState.setOpenConfirmDialog(false);
      formState.setIsDataLoading(false);
    }
  };

  async function onSubmit(values: z.infer<typeof categoryFormSchema>) {
    try {
      formState.setIsDataLoading(true);

      const promise = formState.isEditMode
        ? categoriesService.update(category.id, values)
        : categoriesService.create(values);

      toast.promise(promise, {
        loading: formState.isEditMode
          ? `Updating ${pluralize.singular(
              UI_LABELS.categories.toLowerCase(),
            )}...`
          : `Creating ${pluralize.singular(
              UI_LABELS.categories.toLowerCase(),
            )}...`,
        success: formState.isEditMode
          ? `${pluralize.singular(UI_LABELS.categories)} updated successfully`
          : `${pluralize.singular(UI_LABELS.categories)} created successfully`,
        error: formState.isEditMode
          ? `Failed to update ${pluralize.singular(
              UI_LABELS.categories.toLowerCase(),
            )}`
          : `Failed to create ${pluralize.singular(
              UI_LABELS.categories.toLowerCase(),
            )}`,
      });

      await promise;

      await fetchCategories(includeDeleted);
      formState.setOpenSheet(false);
    } catch (error) {
      console.error(
        `Failed to update ${pluralize.singular(UI_LABELS.categories)}:`,
        error,
      );
    } finally {
      formState.setIsDataLoading(false);
    }
  }

  return {
    state: {
      table: tableState,
      form: formState,
      delete: deleteState,
      error,
      includeDeleted,
      category,
    },
    actions: {
      setIncludeDeleted,
      setCategory,
      handleCreate,
      handleUpdate,
      handleSoftDelete,
      handleHardDelete,
      handleRestore,
      handleConfirmDelOperation,
      onSubmit,
      fetchCategories,
    },
  };
}
