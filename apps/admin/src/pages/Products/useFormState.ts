import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { productFormSchema } from "./ProductForm";
import { Product } from "@/types/product";

export function useFormState() {
  const [product, setProduct] = useState<Product>({
    id: "",
    name: "",
    slug: "",
    description: "",
    imageUrl: "",
    price: 0,
    isFeatured: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    category: {
      id: "",
      name: "",
      slug: "",
      description: "",
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    },
    brand: null,
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [openSheet, setOpenSheet] = useState(false);

  const form = useForm<z.infer<typeof productFormSchema>>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      imageUrl: "",
      price: 0,
      isFeatured: false,
      categoryId: "",
      brandId: "__none__",
    },
  });

  return {
    product,
    setProduct,
    isEditMode,
    setIsEditMode,
    openSheet,
    setOpenSheet,
    form,
  };
}
