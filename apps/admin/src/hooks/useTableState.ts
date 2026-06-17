import { VisibilityState } from "@tanstack/react-table";
import { useState } from "react";

export function useTableState() {
  const [includeDeleted, setIncludeDeleted] = useState(false);

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    deletedAt: includeDeleted,
  });
  const [pageIndex, setPageIndex] = useState(0); // 0-based for TanStack Table
  const [pageSize, setPageSize] = useState(10);

  const toggleIncludeDeleted = (checked: boolean) => {
    setIncludeDeleted(checked);
    setColumnVisibility((prev) => ({ ...prev, deletedAt: checked }));
  };

  return {
    includeDeleted,
    setIncludeDeleted,
    columnVisibility,
    setColumnVisibility,
    pageIndex,
    setPageIndex,
    pageSize,
    setPageSize,
    toggleIncludeDeleted,
  };
}
