import { useState } from "react";

export function useDeleteState() {
  const [deleteMode, setDeleteMode] = useState<"soft" | "hard" | "restore">(
    "soft",
  );
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [selectedId, setSelectedId] = useState<string>("");
  const [alertMessage, setAlertMessage] = useState({
    title: "",
    description: "",
  });

  return {
    deleteMode,
    setDeleteMode,
    openConfirmDialog,
    setOpenConfirmDialog,
    selectedId,
    setSelectedId,
    alertMessage,
    setAlertMessage,
  };
}
