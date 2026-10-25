"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";
import type { HomepageSection, HomepageResources } from "@/components/homepage/types";
import { productApi, type Product } from "@/services/product.api";
import MediaField from "@/components/ui/MediaField";
import {
  CheckboxList,
  ColorField,
  FieldGroup,
  NumberField,
  SelectField,
  TextArea,
  TextField,
  ToggleField,
} from "./fields";

interface SectionEditorProps {
  section: HomepageSection;
  resources: HomepageResources;
  onChange: (patch: Partial<HomepageSection>) => void;
  onSettings: (patch: Record<string, unknown>) => void;
}

const ALIGNMENT_OPTIONS = [
  { value: "left", label: "Left" },
  { value: "center", label: "Center" },
  { value: "right", label: "Right" },
];

const WIDTH_OPTIONS = [
  { value: "narrow", label: "Narrow" },
  { value: "normal", label: "Normal" },
  { value: "wide", label: "Wide" },
  { value: "full", label: "Full width" },
];

const PRODUCT_SOURCES = [
  { value: "new", label: "New arrivals" },
  { value: "discount", label: "Discounted products" },
  { value: "category", label: "Products in selected categories" },
  { value: "brand", label: "Products in selected brands" },
  { value: "manual", label: "Manually selected products" },
];

const ICON_OPTIONS = [
  { value: "Truck", label: "Truck" },
  { value: "ShieldCheck", label: "Shield" },
  { value: "Package", label: "Package" },
  { value: "Sparkles", label: "Sparkles" },
  { value: "Zap", label: "Zap" },
  { value: "Star", label: "Star" },
  { value: "Award", label: "Award" },
  { value: "CheckCircle2", label: "Check" },
];

function ListEditor({
  label,
  items,
  onChange,
  createItem,
  renderItem,
  addLabel,
  max = 12,
}: {
  label: string;
  items: Record<string, unknown>[];
  onChange: (items: Record<string, unknown>[]) => void;
  createItem: () => Record<string, unknown>;
  renderItem: (
    item: Record<string, unknown>,
    update: (patch: Record<string, unknown>) => void,
  ) => ReactNode;
  addLabel: string;
  max?: number;
}) {
  const update = (index: number, patch: Record<string, unknown>) => {
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold">{label}</span>
        <span className="text-[10px] text-base-content/50">{items.length}</span>
      </div>

      {items.length === 0 && (
        <p className="rounded-lg border border-dashed border-base-300 p-3 text-center text-[11px] text-base-content/50">
          Nothing added yet.
        </p>
      )}

      {items.map((item, index) => (
        <div key={index} className="space-y-1.5 rounded-xl border border-base-200 bg-base-100 p-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-[10px] font-bold text-base-content/50">
              <GripVertical size={12} /> #{index + 1}
            </span>
            <button
              type="button"
              onClick={() => onChange(items.filter((_, i) => i !== index))}
              className="btn btn-ghost btn-xs text-error"
              aria-label="Remove item"
            >
              <Trash2 size={12} />
            </button>
          </div>
          {renderItem(item, (patch) => update(index, patch))}
        </div>
      ))}

      {items.length < max && (
        <button
          type="button"
          onClick={() => onChange([...items, createItem()])}
          className="btn btn-xs btn-outline w-full gap-1"
        >
          <Plus size={12} /> {addLabel}
        </button>
      )}
    </div>
  );
}

export default function SectionEditor({
  section,
  resources,
  onChange,
  onSettings,
}: SectionEditorProps) {
  const type = section.type;
  const settings = section.settings;
  const [catalogue, setCatalogue] = useState<Product[]>([]);
  const [catalogueLoading, setCatalogueLoading] = useState(false);
  const [catalogueError, setCatalogueError] = useState<string | null>(null);

  const needsCatalogue =
    type === "products" && settings.productSource === "manual";

  useEffect(() => {
    if (!needsCatalogue || catalogue.length > 0) return;
    let alive = true;
    setCatalogueLoading(true);
    setCatalogueError(null);

    productApi
      .getAll()
      .then((list) => {
        if (alive) setCatalogue(list);
      })
      .catch(() => {
        if (alive) setCatalogueError("Could not load products. Retry by re-opening this section.");
      })
      .finally(() => {
        if (alive) setCatalogueLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [needsCatalogue, catalogue.length]);

  const items = (settings.items as unknown as Record<string, unknown>[]) || [];
  const cards = (settings.cards as unknown as Record<string, unknown>[]) || [];

  const showMedia = ["hero", "story", "banner", "promotion"].includes(type);
  const showButtons = ["hero", "story", "banner", "products"].includes(type);
  const showSecondary = ["hero", "story", "banner"].includes(type);

  return (
    <div className="space-y-3">
      <FieldGroup title="Content">
        <TextField
          label="Title"
          value={section.title}
          maxLength={200}
          onChange={(title) => onChange({ title })}
        />
        <TextField
          label="Eyebrow / badge label"
          value={section.subtitle}
          maxLength={200}
          onChange={(subtitle) => onChange({ subtitle })}
        />
        <TextArea
          label="Description"
          value={section.description}
          maxLength={2000}
          onChange={(description) => onChange({ description })}
        />
      </FieldGroup>

      {showMedia && (
        <FieldGroup title="Media">
          <MediaField
            label="Main image"
            value={section.imageUrl}
            onChange={(imageUrl) => onChange({ imageUrl })}
            helpText="Upload a file or paste a URL."
          />
          <TextField
            label="Image alt text"
            value={section.imageDescription}
            maxLength={300}
            onChange={(imageDescription) => onChange({ imageDescription })}
          />
          {type === "hero" && (
            <>
              <TextField
                label="Mobile-only image URL (optional)"
                value={(settings.mobileImageUrl as string) || ""}
                mono
                onChange={(mobileImageUrl) => onSettings({ mobileImageUrl })}
              />
              <SelectField
                label="Mobile stacking"
                value={(settings.mobileOrder as string) || "text-first"}
                options={[
                  { value: "text-first", label: "Text first, image second" },
                  { value: "image-first", label: "Image first, text second" },
                ]}
                onChange={(mobileOrder) => onSettings({ mobileOrder })}
              />
            </>
          )}
        </FieldGroup>
      )}

      {type === "hero" && (
        <FieldGroup title="Image & overlay">
          <SelectField
            label="Image focal point"
            value={(settings.focalPoint as string) || "center"}
            options={[
              { value: "center", label: "Center" },
              { value: "top", label: "Top" },
              { value: "bottom", label: "Bottom" },
            ]}
            onChange={(focalPoint) => onSettings({ focalPoint })}
          />
          <NumberField
            label="Overlay darkness"
            suffix="%"
            value={Number(settings.overlayOpacity ?? 45)}
            min={0}
            max={90}
            onChange={(overlayOpacity) => onSettings({ overlayOpacity })}
          />
          <NumberField
            label="Minimum height (overlay variants)"
            suffix="px"
            value={Number(settings.minHeight ?? 440)}
            min={240}
            max={900}
            onChange={(minHeight) => onSettings({ minHeight })}
          />
        </FieldGroup>
      )}

      {(type === "story" && section.variant === "full-width-bg") ||
      (type === "banner" && section.variant === "image-overlay") ? (
        <FieldGroup title="Overlay">
          <NumberField
            label="Overlay darkness"
            suffix="%"
            value={Number(settings.overlayOpacity ?? 45)}
            min={0}
            max={90}
            onChange={(overlayOpacity) => onSettings({ overlayOpacity })}
          />
        </FieldGroup>
      ) : null}

      {showButtons && (
        <FieldGroup title="Call to action">
          <TextField
            label="Primary button label"
            value={section.buttonText}
            maxLength={100}
            onChange={(buttonText) => onChange({ buttonText })}
          />
          <TextField
            label="Primary button link"
            value={section.buttonLink}
            mono
            onChange={(buttonLink) => onChange({ buttonLink })}
          />
          {showSecondary && (
            <>
              <TextField
                label="Secondary button label"
                value={(settings.secondaryButtonText as string) || ""}
                maxLength={100}
                onChange={(secondaryButtonText) => onSettings({ secondaryButtonText })}
              />
              <TextField
                label="Secondary button link"
                value={(settings.secondaryButtonLink as string) || ""}
                mono
                onChange={(secondaryButtonLink) => onSettings({ secondaryButtonLink })}
              />
              <SelectField
                label="Secondary button style"
                value={(settings.secondaryButtonStyle as string) || "outline"}
                options={[
                  { value: "outline", label: "Outline" },
                  { value: "primary", label: "Primary" },
                  { value: "secondary", label: "Secondary" },
                  { value: "ghost", label: "Ghost" },
                ]}
                onChange={(secondaryButtonStyle) => onSettings({ secondaryButtonStyle })}
              />
            </>
          )}
        </FieldGroup>
      )}

      {type === "categories" && (
        <FieldGroup title="Categories">
          <NumberField
            label="Visible columns"
            value={Number(settings.columns ?? 4)}
            min={1}
            max={6}
            onChange={(columns) => onSettings({ columns })}
          />
          <CheckboxList
            label="Categories to show"
            options={resources.categories.map((category) => ({
              id: category.id,
              name: category.name,
            }))}
            values={(settings.categoryIds as string[]) || []}
            onChange={(categoryIds) => onSettings({ categoryIds })}
            emptyText="No categories in the catalogue yet."
            searchable
          />
          <ToggleField
            label="Show product counts"
            checked={Boolean(settings.showProductCount)}
            onChange={(showProductCount) => onSettings({ showProductCount })}
          />
        </FieldGroup>
      )}

      {type === "products" && (
        <FieldGroup title="Collection source">
          <SelectField
            label="Where do products come from?"
            value={(settings.productSource as string) || "new"}
            options={PRODUCT_SOURCES}
            onChange={(productSource) => onSettings({ productSource })}
          />
          <NumberField
            label="Number of products"
            value={Number(settings.limit ?? 8)}
            min={1}
            max={24}
            onChange={(limit) => onSettings({ limit })}
          />
          <NumberField
            label="Visible columns"
            value={Number(settings.columns ?? 4)}
            min={1}
            max={6}
            onChange={(columns) => onSettings({ columns })}
          />

          {settings.productSource === "category" && (
            <CheckboxList
              label="Categories"
              options={resources.categories.map((category) => ({
                id: category.id,
                name: category.name,
              }))}
              values={(settings.categoryIds as string[]) || []}
              onChange={(categoryIds) => onSettings({ categoryIds })}
              emptyText="No categories in the catalogue yet."
              searchable
            />
          )}

          {settings.productSource === "brand" && (
            <CheckboxList
              label="Brands"
              options={(resources.productBrands || []).map((brand) => ({
                id: brand.id,
                name: brand.name,
              }))}
              values={(settings.brandIds as string[]) || []}
              onChange={(brandIds) => onSettings({ brandIds })}
              emptyText="No brands in the catalogue yet."
              searchable
            />
          )}

          {settings.productSource === "manual" && (
            <>
              {catalogueLoading && (
                <p className="text-[11px] text-base-content/60">Loading products…</p>
              )}
              {catalogueError && (
                <p className="text-[11px] font-semibold text-error">{catalogueError}</p>
              )}
              <CheckboxList
                label="Products"
                options={catalogue.map((product) => ({
                  id: product.id,
                  name: `${product.name}${product.brand?.name ? ` — ${product.brand.name}` : ""}`,
                }))}
                values={(settings.productIds as string[]) || []}
                onChange={(productIds) => onSettings({ productIds })}
                emptyText="No products in the catalogue yet."
                searchable
              />
            </>
          )}
        </FieldGroup>
      )}

      {type === "promotion" && (
        <>
          <FieldGroup title="Layout">
            <NumberField
              label="Columns"
              value={Number(settings.columns ?? 2)}
              min={1}
              max={4}
              onChange={(columns) => onSettings({ columns })}
            />
            <NumberField
              label="Overlay darkness"
              suffix="%"
              value={Number(settings.overlayOpacity ?? 40)}
              min={0}
              max={90}
              onChange={(overlayOpacity) => onSettings({ overlayOpacity })}
            />
          </FieldGroup>
          <FieldGroup title="Offer cards">
            <ListEditor
              label="Cards"
              items={cards}
              max={4}
              onChange={(next) => onSettings({ cards: next })}
              createItem={() => ({
                eyebrow: "",
                title: "",
                description: "",
                imageUrl: "",
                buttonText: "",
                buttonLink: "",
              })}
              addLabel="Add card"
              renderItem={(item, update) => (
                <>
                  <TextField
                    label="Eyebrow"
                    value={item.eyebrow as string}
                    onChange={(eyebrow) => update({ eyebrow })}
                  />
                  <TextField
                    label="Title"
                    value={item.title as string}
                    onChange={(title) => update({ title })}
                  />
                  <TextArea
                    label="Description"
                    rows={2}
                    value={item.description as string}
                    onChange={(description) => update({ description })}
                  />
                  <MediaField
                    label="Image"
                    value={item.imageUrl as string}
                    onChange={(imageUrl) => update({ imageUrl })}
                  />
                  <TextField
                    label="Button label"
                    value={item.buttonText as string}
                    onChange={(buttonText) => update({ buttonText })}
                  />
                  <TextField
                    label="Button link"
                    value={item.buttonLink as string}
                    mono
                    onChange={(buttonLink) => update({ buttonLink })}
                  />
                </>
              )}
            />
          </FieldGroup>
        </>
      )}

      {type === "trust" && (
        <FieldGroup title="Benefits">
          <NumberField
            label="Columns"
            value={Number(settings.columns ?? 4)}
            min={1}
            max={4}
            onChange={(columns) => onSettings({ columns })}
          />
          <ListEditor
            label="Benefit items"
            items={items}
            max={8}
            onChange={(next) => onSettings({ items: next })}
            createItem={() => ({ icon: "Truck", title: "", description: "" })}
            addLabel="Add benefit"
            renderItem={(item, update) => (
              <>
                <SelectField
                  label="Icon"
                  value={(item.icon as string) || "Truck"}
                  options={ICON_OPTIONS}
                  onChange={(icon) => update({ icon })}
                />
                <TextField
                  label="Title"
                  value={item.title as string}
                  onChange={(title) => update({ title })}
                />
                <TextArea
                  label="Description"
                  rows={2}
                  value={item.description as string}
                  onChange={(description) => update({ description })}
                />
              </>
            )}
          />
        </FieldGroup>
      )}

      {type === "testimonials" && (
        <FieldGroup title="Testimonials">
          <NumberField
            label="Columns"
            value={Number(settings.columns ?? 3)}
            min={1}
            max={3}
            onChange={(columns) => onSettings({ columns })}
          />
          <p className="text-[10px] text-base-content/50">
            Only enter quotes you actually received. Nothing is generated for you.
          </p>
          <ListEditor
            label="Quotes"
            items={items}
            max={12}
            onChange={(next) => onSettings({ items: next })}
            createItem={() => ({ name: "", role: "", quote: "", rating: 5, imageUrl: "" })}
            addLabel="Add testimonial"
            renderItem={(item, update) => (
              <>
                <TextField
                  label="Customer name"
                  value={item.name as string}
                  onChange={(name) => update({ name })}
                />
                <TextField
                  label="Role / context (optional)"
                  value={item.role as string}
                  onChange={(role) => update({ role })}
                />
                <TextArea
                  label="Quote"
                  rows={3}
                  value={item.quote as string}
                  onChange={(quote) => update({ quote })}
                />
                <NumberField
                  label="Rating"
                  min={1}
                  max={5}
                  value={Number(item.rating ?? 5)}
                  onChange={(rating) => update({ rating })}
                />
              </>
            )}
          />
        </FieldGroup>
      )}

      {type === "faq" && (
        <FieldGroup title="Questions">
          <ListEditor
            label="FAQ items"
            items={items}
            max={30}
            onChange={(next) => onSettings({ items: next })}
            createItem={() => ({ question: "", answer: "" })}
            addLabel="Add question"
            renderItem={(item, update) => (
              <>
                <TextField
                  label="Question"
                  value={item.question as string}
                  onChange={(question) => update({ question })}
                />
                <TextArea
                  label="Answer"
                  rows={3}
                  value={item.answer as string}
                  onChange={(answer) => update({ answer })}
                />
              </>
            )}
          />
        </FieldGroup>
      )}

      {type === "logos" && (
        <FieldGroup title="Logos">
          <NumberField
            label="Maximum logos"
            value={Number(settings.limit ?? 12)}
            min={1}
            max={24}
            onChange={(limit) => onSettings({ limit })}
          />
          <ToggleField
            label="Grayscale until hover"
            checked={Boolean(settings.grayscale)}
            onChange={(grayscale) => onSettings({ grayscale })}
          />
        </FieldGroup>
      )}

      <FieldGroup title="Appearance">
        <SelectField
          label="Text alignment"
          value={(settings.alignment as string) || "left"}
          options={ALIGNMENT_OPTIONS}
          onChange={(alignment) => onSettings({ alignment })}
        />
        <SelectField
          label="Content width"
          value={(settings.contentWidth as string) || "wide"}
          options={WIDTH_OPTIONS}
          onChange={(contentWidth) => onSettings({ contentWidth })}
        />
        <ColorField
          label="Background"
          value={settings.background as string}
          onChange={(background) => onSettings({ background })}
        />
        <ColorField
          label="Text colour"
          value={settings.textColor as string}
          onChange={(textColor) => onSettings({ textColor })}
        />
        <div className="grid grid-cols-2 gap-2">
          <NumberField
            label="Top spacing"
            value={Number(settings.paddingTop ?? 12)}
            min={0}
            max={24}
            onChange={(paddingTop) => onSettings({ paddingTop })}
          />
          <NumberField
            label="Bottom spacing"
            value={Number(settings.paddingBottom ?? 12)}
            min={0}
            max={24}
            onChange={(paddingBottom) => onSettings({ paddingBottom })}
          />
        </div>
      </FieldGroup>
    </div>
  );
}
