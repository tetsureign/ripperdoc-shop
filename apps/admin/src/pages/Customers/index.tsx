import { DataTable } from "@/components/data-table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import { columns } from "./customersTableColumns";
import { useCustomers } from "./useCustomers";
import { useCustomersQuery } from "./network";

export default function Customers() {
  const { tableState } = useCustomers();

  const {
    data: customersData,
    isLoading,
    isError,
  } = useCustomersQuery(
    tableState.includeDeleted,
    tableState.pageIndex + 1,
    tableState.pageSize,
  );

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Failed to fetch customers</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto flex flex-col gap-4">
      <div className="flex flex-row-reverse gap-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="include-deleted"
            disabled={isLoading}
            onCheckedChange={tableState.toggleIncludeDeleted}
          />
          <Label htmlFor="include-deleted">Include deleted</Label>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={customersData?.customers ?? []}
        loading={isLoading}
        columnVisibility={tableState.columnVisibility}
        setColumnVisibility={tableState.setColumnVisibility}
        pageIndex={tableState.pageIndex}
        pageSize={tableState.pageSize}
        pageCount={customersData?.totalPages ?? 0}
        onPageChange={tableState.setPageIndex}
        onPageSizeChange={tableState.setPageSize}
      />
    </div>
  );
}
