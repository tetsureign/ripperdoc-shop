import { zodResolver } from "@hookform/resolvers/zod";
import { VisibilityState } from "@tanstack/react-table";
import { z } from "zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { brandFormSchema } from "./BrandForm";
import { Brand } from "@/types/brand";

export function useTableState() {
  const [includeDeleted, setIncludeDeleted] = useState(false);

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    deletedAt: includeDeleted,
  });
  const [pageIndex, setPageIndex] = useState(0); // 0-based for TanStack Table
  const [pageSize, setPageSize] = useState(10);

  return {
    includeDeleted,
    setIncludeDeleted,
    columnVisibility,
    setColumnVisibility,
    pageIndex,
    setPageIndex,
    pageSize,
    setPageSize,
  };
}
export function useFormState() {
  const [brand, setBrand] = useState<Brand>({
    id: "",
    name: "",
    slug: "",
    description: "",
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [openSheet, setOpenSheet] = useState(false);

  const form = useForm<z.infer<typeof brandFormSchema>>({
    resolver: zodResolver(brandFormSchema),
    defaultValues: { name: "", description: "" },
  });

  return {
    brand,
    setBrand,
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
