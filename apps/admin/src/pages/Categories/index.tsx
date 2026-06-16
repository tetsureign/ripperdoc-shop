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

import { CategoryForm } from "./CategoryForm";
import { columns } from "./categoriesTableColumns";
import { useCategories } from "./useCategories";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCategoriesQuery } from "./network";

export default function Categories() {
  const {
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
  } = useCategories();

  const {
    data: categoriesData,
    isLoading,
    isError,
  } = useCategoriesQuery(
    tableState.includeDeleted,
    tableState.pageIndex + 1,
    tableState.pageSize,
  );

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to fetch {UI_LABELS.categories.toLowerCase()}
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
            onCheckedChange={tableState.toggleIncludeDeleted}
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
        data={categoriesData?.categories ?? []}
        loading={isLoading}
        columnVisibility={tableState.columnVisibility}
        setColumnVisibility={tableState.setColumnVisibility}
        pageIndex={tableState.pageIndex}
        pageSize={tableState.pageSize}
        pageCount={categoriesData?.totalPages ?? 0}
        onPageChange={tableState.setPageIndex}
        onPageSizeChange={tableState.setPageSize}
      />

      <InfoUpdateSheet
        open={formState.openSheet}
        onOpenChange={formState.setOpenSheet}
      >
        <SheetTitle>
          {formState.isEditMode
            ? `Update ${pluralize.singular(UI_LABELS.categories)}`
            : `Create ${pluralize.singular(UI_LABELS.categories)}`}
        </SheetTitle>
        <ScrollArea className="max-h-[90vh]">
          <CategoryForm
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
