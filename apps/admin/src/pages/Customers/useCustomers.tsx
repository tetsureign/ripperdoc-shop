import { useTableState } from "@/hooks/useTableState";

export function useCustomers() {
  const tableState = useTableState();
  return { tableState };
}
