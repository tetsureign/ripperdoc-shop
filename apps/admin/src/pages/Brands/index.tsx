import pluralize from "pluralize";

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
import { useBrands } from "./useBrands";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useBrandsQuery } from "./network";

export default function Brands() {
  const {
    tableState,
    formState,
    deleteState,
    isDeleting,
    isSubmitting,
    toggleIncludeDeleted,
    openCreateForm,
    openEditForm,
    stageSoftDelete,
    stageHardDelete,
    stageRestore,
    executeStaged,
    submitForm,
  } = useBrands();

  const {
    data: brandsData,
    isLoading,
    isError,
  } = useBrandsQuery(
    tableState.includeDeleted,
    tableState.pageIndex + 1,
    tableState.pageSize,
  );

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
        <Button id="create" onClick={openCreateForm} disabled={isLoading}>
          Create
        </Button>
        <div className="flex items-center space-x-2">
          <Switch
            id="include-deleted"
            disabled={isLoading}
            onCheckedChange={toggleIncludeDeleted}
          />
          <Label htmlFor="include-deleted">Include deleted</Label>
        </div>
      </div>

      <DataTable
        columns={columns({
          onUpdate: openEditForm,
          onSoftDelete: stageSoftDelete,
          onHardDelete: stageHardDelete,
          onRestore: stageRestore,
        })}
        data={brandsData?.brands ?? []}
        loading={isLoading}
        columnVisibility={tableState.columnVisibility}
        setColumnVisibility={tableState.setColumnVisibility}
        pageIndex={tableState.pageIndex}
        pageSize={tableState.pageSize}
        pageCount={brandsData?.totalPages ?? 0}
        onPageChange={tableState.setPageIndex}
        onPageSizeChange={tableState.setPageSize}
      />

      <InfoUpdateSheet
        open={formState.openSheet}
        onOpenChange={formState.setOpenSheet}
      >
        <SheetTitle>
          {formState.isEditMode
            ? `Update ${pluralize.singular(UI_LABELS.brands)}`
            : `Create ${pluralize.singular(UI_LABELS.brands)}`}
        </SheetTitle>
        <ScrollArea className="max-h-[90vh]">
          <BrandForm
            form={formState.form}
            onSubmit={submitForm}
            onCancel={() => formState.setOpenSheet(false)}
            isLoading={isSubmitting}
          />
        </ScrollArea>
      </InfoUpdateSheet>

      <ConfirmationDialog
        open={deleteState.openConfirmDialog}
        onOpenChange={deleteState.setOpenConfirmDialog}
        title={deleteState.alertMessage.title}
        description={deleteState.alertMessage.description}
        onConfirm={executeStaged}
        isLoading={isDeleting}
      />
    </div>
  );
}
