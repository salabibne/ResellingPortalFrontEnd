import { notFound } from "next/navigation";
import AttributeManager, { AttributeConfig } from "@/components/shared/AttributeManager";

export default function ProductAttributePage({ params }: { params: { type: string } }) {
  const configs: Record<string, AttributeConfig> = {
    category: {
      type: "category",
      title: "Category",
      apiEndpoint: "/categories",
      fields: [
        { name: "name", label: "Category Name", type: "text" },
        { name: "imageUrl", label: "Image URL", type: "text" },
      ],
    },
    "sub-category": {
      type: "sub-category",
      title: "Sub Category",
      apiEndpoint: "/subcategories",
      fields: [
        { name: "name", label: "Sub Category Name", type: "text" },
        { 
          name: "categoryId", 
          label: "Parent Category", 
          type: "select",
          apiSource: "/categories"
        },
      ],
    },
    "children-category": {
      type: "children-category",
      title: "Children Category",
      apiEndpoint: "/child-categories",
      fields: [
        { name: "name", label: "Children Category Name", type: "text" },
        { 
          name: "subcategoryId", 
          label: "Parent Sub Category", 
          type: "select",
          apiSource: "/subcategories"
        },
      ],
    },
    brands: {
      type: "brands",
      title: "Brands",
      apiEndpoint: "/brands",
      fields: [
        { name: "name", label: "Brand Name", type: "text" },
        { name: "imageUrl", label: "Image URL", type: "text" },
      ],
    },
    colors: {
      type: "colors",
      title: "Colors",
      apiEndpoint: "/colors",
      fields: [
        { name: "name", label: "Color Name", type: "text" },
        { name: "colorCode", label: "Color Hex Code", type: "color" },
      ],
    },
    sizes: {
      type: "sizes",
      title: "Sizes",
      apiEndpoint: "/sizes",
      fields: [{ name: "name", label: "Size", type: "text" }],
    },
    "age-variants": {
      type: "age-variants",
      title: "Age Variants",
      apiEndpoint: "/age-variants",
      fields: [{ name: "ageRange", label: "Age Variant", type: "text" }],
    },
  };

  const config = configs[params.type];

  if (!config) {
    notFound();
  }

  return <AttributeManager config={config} />;
}
