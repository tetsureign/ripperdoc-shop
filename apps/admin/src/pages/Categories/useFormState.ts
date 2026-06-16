import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { categoryFormSchema } from "./CategoryForm";
import { Category } from "@/types/category";

export function useFormState() {
  const [category, setCategory] = useState<Category>({
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

  const form = useForm<z.infer<typeof categoryFormSchema>>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: { name: "", description: "" },
  });

  return {
    category,
    setCategory,
    isEditMode,
    setIsEditMode,
    openSheet,
    setOpenSheet,
    form,
  };
}
