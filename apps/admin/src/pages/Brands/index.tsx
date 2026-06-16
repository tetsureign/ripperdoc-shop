import pluralize from "pluralize";
import { useEffect } from "react";

import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { DataTable } from "@/components/data-table";
import { InfoUpdateSheet } from "@/components/info-update-sheet";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { UI_LABELS } from "@/lib/routes";

import { BrandForm } from "./BrandForm";
import { columns } from "./brandsTableColumns";
import { useBrands, useBrandsQuery } from "./useBrands";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Brands() {
  const { state, actions } = useBrands();
  const {
    table,
    form,
    delete: deleteState,
    includeDeleted,
    isDeleting,
    isSubmitting,
  } = state;

  const {
    data: brandsData,
    isLoading,
    isError,
  } = useBrandsQuery(includeDeleted, table.pageIndex + 1, table.pageSize);

  useEffect(() => {
    table.setColumnVisibility((prev) => ({
      ...prev,
      deletedAt: includeDeleted,
    }));
  }, [includeDeleted]);

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to fetch {UI_LABELS.brands.toLowerCase()}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto flex flex-col gap-4">
      <div className="flex flex-row-reverse gap-4">
        <Button id="create" onClick={actions.handleCreate} disabled={isLoading}>
          Create
        </Button>
        <div className="flex items-center space-x-2">
          <Switch
            id="include-deleted"
            disabled={isLoading}
            onCheckedChange={(checked) => actions.setIncludeDeleted(checked)}
          />
          <Label htmlFor="include-deleted">Include deleted</Label>
        </div>
      </div>

      <DataTable
        columns={columns({
          onUpdate: actions.handleUpdate,
          onSoftDelete: actions.handleSoftDelete,
          onHardDelete: actions.handleHardDelete,
          onRestore: actions.handleRestore,
        })}
        data={brandsData?.brands ?? []}
        loading={isLoading}
        columnVisibility={table.columnVisibility}
        setColumnVisibility={table.setColumnVisibility}
        pageIndex={table.pageIndex}
        pageSize={table.pageSize}
        pageCount={brandsData?.totalPages ?? 0}
        onPageChange={table.setPageIndex}
        onPageSizeChange={table.setPageSize}
      />

      <InfoUpdateSheet open={form.openSheet} onOpenChange={form.setOpenSheet}>
        <SheetTitle>
          {form.isEditMode
            ? `Update ${pluralize.singular(UI_LABELS.brands)}`
            : `Create ${pluralize.singular(UI_LABELS.brands)}`}
        </SheetTitle>
        <ScrollArea className="max-h-[90vh]">
          <BrandForm
            form={form.form}
            onSubmit={actions.onSubmit}
            onCancel={() => form.setOpenSheet(false)}
            isLoading={isSubmitting}
          />
        </ScrollArea>
      </InfoUpdateSheet>

      <ConfirmationDialog
        open={deleteState.openConfirmDialog}
        onOpenChange={deleteState.setOpenConfirmDialog}
        title={deleteState.alertMessage.title}
        description={deleteState.alertMessage.description}
        onConfirm={actions.handleConfirmDelOperation}
        isLoading={isDeleting}
      />
    </div>
  );
}
