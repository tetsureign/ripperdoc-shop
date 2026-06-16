import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { brandsService } from "@/services/brandsService";
import { Brand } from "@/types/brand";
import { zodResolver } from "@hookform/resolvers/zod";
import { VisibilityState } from "@tanstack/react-table";
import { UI_LABELS } from "@/lib/routes";

import { brandFormSchema } from "./BrandForm";
import pluralize from "pluralize";

export function useTableState(includeDeleted = false) {
  const [data, setData] = useState<Brand[]>([]);
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

export function useFormState(brand: Brand) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [openSheet, setOpenSheet] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);

  const form = useForm<z.infer<typeof brandFormSchema>>({
    resolver: zodResolver(brandFormSchema),
    defaultValues: {
      name: brand.name,
      description: brand.description,
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

export function useBrands() {
  const [error, setError] = useState<string | null>(null);
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
  const formState = useFormState(brand);
  const deleteState = useDeleteState();

  const fetchBrands = async (
    includeDeleted = false,
    page = 1,
    pageSize = 10,
  ) => {
    try {
      tableState.setTableLoading(true);
      const response = await brandsService.getAll(
        includeDeleted,
        page,
        pageSize,
      );
      tableState.setData(response.data.brands);
      tableState.setTotalCount(response.data.totalCount);
      tableState.setPageCount(response.data.totalPages);
    } catch (err) {
      setError(`Failed to fetch ${UI_LABELS.brands.toLowerCase()}`);
      console.error(err);
    } finally {
      tableState.setTableLoading(false);
    }
  };

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
    formState.setIsEditMode(false);
    formState.setOpenSheet(true);
  };

  const handleUpdate = (brand: Brand) => {
    setBrand(brand);
    formState.setIsEditMode(true);
    formState.setOpenSheet(true);
  };

  const handleSoftDelete = async (brandId: string) => {
    deleteState.setAlertMessage({
      title: "Trash it?",
      description: "Wanna trash it? You can dig it back later.",
    });
    deleteState.setSelectedBrandId(brandId);
    deleteState.setDeleteMode("soft");
    deleteState.setOpenConfirmDialog(true);
  };

  const handleHardDelete = async (brandId: string) => {
    deleteState.setAlertMessage({
      title: "Flatline this?",
      description: "You're reaching the point of no return.",
    });
    deleteState.setSelectedBrandId(brandId);
    deleteState.setDeleteMode("hard");
    deleteState.setOpenConfirmDialog(true);
  };

  const handleRestore = async (brandId: string) => {
    deleteState.setAlertMessage({
      title: "Revive it?",
      description: "Bring it back to life?",
    });
    deleteState.setSelectedBrandId(brandId);
    deleteState.setDeleteMode("restore");
    deleteState.setOpenConfirmDialog(true);
  };

  const handleConfirmDelOperation = async () => {
    try {
      formState.setIsDataLoading(true);

      let promise;

      switch (deleteState.deleteMode) {
        case "soft":
          promise = brandsService.softDelete(deleteState.selectedBrandId);
          break;
        case "hard":
          promise = brandsService.hardDelete(deleteState.selectedBrandId);
          break;
        case "restore":
          promise = brandsService.restore(deleteState.selectedBrandId);
          break;
      }

      toast.promise(promise, {
        loading: `${
          deleteState.deleteMode === "restore"
            ? "Restoring"
            : deleteState.deleteMode === "hard"
              ? "Deleting"
              : "Trashing"
        } ${pluralize.singular(UI_LABELS.brands.toLowerCase())}...`,
        success: `${pluralize.singular(UI_LABELS.brands)} ${
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
        } ${pluralize.singular(UI_LABELS.brands.toLowerCase())}`,
      });

      await promise;

      await fetchBrands(includeDeleted);
    } catch (error) {
      console.error("Operation failed:", error);
      toast.error("Operation failed");
    } finally {
      deleteState.setOpenConfirmDialog(false);
      formState.setIsDataLoading(false);
    }
  };

  async function onSubmit(values: z.infer<typeof brandFormSchema>) {
    try {
      formState.setIsDataLoading(true);

      const promise = formState.isEditMode
        ? brandsService.update(brand.id, values)
        : brandsService.create(values);

      toast.promise(promise, {
        loading: formState.isEditMode
          ? `Updating ${pluralize.singular(UI_LABELS.brands.toLowerCase())}...`
          : `Creating ${pluralize.singular(UI_LABELS.brands.toLowerCase())}...`,
        success: formState.isEditMode
          ? `${pluralize.singular(UI_LABELS.brands)} updated successfully`
          : `${pluralize.singular(UI_LABELS.brands)} created successfully`,
        error: formState.isEditMode
          ? `Failed to update ${pluralize.singular(
              UI_LABELS.brands.toLowerCase(),
            )}`
          : `Failed to create ${pluralize.singular(
              UI_LABELS.brands.toLowerCase(),
            )}`,
      });

      await promise;

      await fetchBrands(includeDeleted);
      formState.setOpenSheet(false);
    } catch (error) {
      console.error(
        `Failed to update ${pluralize.singular(UI_LABELS.brands)}:`,
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
      brand,
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
      fetchBrands,
    },
  };
}
