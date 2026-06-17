import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { brandFormSchema } from "./BrandForm";
import { Brand } from "@/types/brand";

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
