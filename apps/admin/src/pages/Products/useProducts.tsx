import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { productsService } from "@/services/productsService";
import { Product } from "@/types/product";
import { Category } from "@/types/category";
import { zodResolver } from "@hookform/resolvers/zod";
import { VisibilityState } from "@tanstack/react-table";
import { UI_LABELS } from "@/lib/routes";

import { productFormSchema } from "./ProductForm";
import pluralize from "pluralize";

export function useTableState(includeDeleted = false) {
  const [data, setData] = useState<Product[]>([]);
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

export function useFormState(product: Product) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [openSheet, setOpenSheet] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);

  const form = useForm<z.infer<typeof productFormSchema>>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: product.name,
      description: product.description,
      imageUrl: product.imageUrl,
      price: product.price,
      isFeatured: product.isFeatured,
      categoryId: product.category.id,
      brandId: product.brand?.id,
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
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [alertMessage, setAlertMessage] = useState({
    title: "",
    description: "",
  });

  return {
    deleteMode,
    setDeleteMode,
    openConfirmDialog,
    setOpenConfirmDialog,
    selectedProductId,
    setSelectedProductId,
    alertMessage,
    setAlertMessage,
  };
}

export function useProducts() {
  const [error, setError] = useState<string | null>(null);
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [product, setProduct] = useState<Product>({
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
    // categoryId: "",
    category: {} as Category,
    // brandId: null,
    brand: null,
  });

  const tableState = useTableState(includeDeleted);
  const formState = useFormState(product);
  const deleteState = useDeleteState();

  const fetchProducts = async (
    includeDeleted = false,
    page = 1,
    pageSize = 10,
  ) => {
    try {
      tableState.setTableLoading(true);
      const response = await productsService.getAll(
        includeDeleted,
        page,
        pageSize,
      );
      tableState.setData(response.data.products);
      tableState.setTotalCount(response.data.totalCount);
      tableState.setPageCount(response.data.totalPages);
    } catch (err) {
      setError(`Failed to fetch ${UI_LABELS.products.toLowerCase()}`);
      console.error(err);
    } finally {
      tableState.setTableLoading(false);
    }
  };

  const handleCreate = () => {
    setProduct({
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
      // categoryId: "",
      category: {} as Category,
      // brandId: null,
      brand: null,
    });
    formState.setIsEditMode(false);
    formState.setOpenSheet(true);
  };

  const handleUpdate = (product: Product) => {
    setProduct(product);
    formState.setIsEditMode(true);
    formState.setOpenSheet(true);
  };

  const handleSoftDelete = async (productId: string) => {
    deleteState.setAlertMessage({
      title: "Trash it?",
      description: "Wanna trash it? You can dig it back later.",
    });
    deleteState.setSelectedProductId(productId);
    deleteState.setDeleteMode("soft");
    deleteState.setOpenConfirmDialog(true);
  };

  const handleHardDelete = async (productID: string) => {
    deleteState.setAlertMessage({
      title: "Flatline this?",
      description: "You're reaching the point of no return.",
    });
    deleteState.setSelectedProductId(productID);
    deleteState.setDeleteMode("hard");
    deleteState.setOpenConfirmDialog(true);
  };

  const handleRestore = async (productId: string) => {
    deleteState.setAlertMessage({
      title: "Revive it?",
      description: "Bring it back to life?",
    });
    deleteState.setSelectedProductId(productId);
    deleteState.setDeleteMode("restore");
    deleteState.setOpenConfirmDialog(true);
  };

  const handleConfirmDelOperation = async () => {
    try {
      formState.setIsDataLoading(true);

      let promise;

      switch (deleteState.deleteMode) {
        case "soft":
          promise = productsService.softDelete(deleteState.selectedProductId);
          break;
        case "hard":
          promise = productsService.hardDelete(deleteState.selectedProductId);
          break;
        case "restore":
          promise = productsService.restore(deleteState.selectedProductId);
          break;
      }

      toast.promise(promise, {
        loading: `${
          deleteState.deleteMode === "restore"
            ? "Restoring"
            : deleteState.deleteMode === "hard"
              ? "Deleting"
              : "Trashing"
        } ${pluralize.singular(UI_LABELS.products.toLowerCase())}...`,
        success: `${pluralize.singular(UI_LABELS.products)} ${
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
        } ${pluralize.singular(UI_LABELS.products.toLowerCase())}`,
      });

      await promise;

      await fetchProducts(includeDeleted);
    } catch (error) {
      console.error("Operation failed:", error);
      toast.error("Operation failed");
    } finally {
      deleteState.setOpenConfirmDialog(false);
      formState.setIsDataLoading(false);
    }
  };

  async function onSubmit(values: z.infer<typeof productFormSchema>) {
    try {
      const payload = {
        ...values,
        brandId: values.brandId === "__none__" ? null : values.brandId,
      };

      formState.setIsDataLoading(true);

      const promise = formState.isEditMode
        ? productsService.update(product.id!, payload)
        : productsService.create(payload);

      toast.promise(promise, {
        loading: formState.isEditMode
          ? `Updating ${pluralize.singular(
              UI_LABELS.products.toLowerCase(),
            )}...`
          : `Creating ${pluralize.singular(
              UI_LABELS.products.toLowerCase(),
            )}...`,
        success: formState.isEditMode
          ? `${pluralize.singular(UI_LABELS.products)} updated successfully`
          : `${pluralize.singular(UI_LABELS.products)} created successfully`,
        error: formState.isEditMode
          ? `Failed to update ${pluralize.singular(
              UI_LABELS.products.toLowerCase(),
            )}`
          : `Failed to create ${pluralize.singular(
              UI_LABELS.products.toLowerCase(),
            )}`,
      });

      await promise;

      await fetchProducts(includeDeleted);
      formState.setOpenSheet(false);
    } catch (error) {
      console.error(
        `Failed to update ${pluralize.singular(UI_LABELS.products)}:`,
        error,
      );
    } finally {
      formState.setIsDataLoading(false);
    }
  }

  const handleFeature = async (productID: string) => {
    try {
      formState.setIsDataLoading(true);
      const promise = productsService.feature(productID);

      toast.promise(promise, {
        loading: "Featuring product...",
        success: "Product featured.",
        error: "Error featuring product.",
      });

      await promise;

      await fetchProducts(includeDeleted);
    } catch (err) {
      console.error("Failed to feature product", err);
    } finally {
      formState.setIsDataLoading(false);
    }
  };

  const handleUnFeature = async (productID: string) => {
    try {
      formState.setIsDataLoading(true);
      const promise = productsService.unfeature(productID);

      toast.promise(promise, {
        loading: "Unfeaturing product...",
        success: "Product unfeatured.",
        error: "Error unfeaturing product.",
      });

      await promise;

      await fetchProducts(includeDeleted);
    } catch (err) {
      console.error("Failed to unfeature product", err);
    } finally {
      formState.setIsDataLoading(false);
    }
  };

  return {
    state: {
      table: tableState,
      form: formState,
      delete: deleteState,
      error,
      includeDeleted,
      product,
    },
    actions: {
      setIncludeDeleted,
      setProduct,
      handleCreate,
      handleUpdate,
      handleSoftDelete,
      handleHardDelete,
      handleRestore,
      handleConfirmDelOperation,
      onSubmit,
      fetchProducts,
      handleFeature,
      handleUnFeature,
    },
  };
}
