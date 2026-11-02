"use client";

import type { HomepageSection, HomepageSectionType } from "@/components/homepage/types";
import ListEditor from "./ListEditor";
import IconPicker from "./IconPicker";
import { FieldGroup, NumberField, TextArea, TextField } from "./fields";

/** Section types whose content editor lives in this file. */
export const ICON_SECTION_TYPES: ReadonlySet<HomepageSectionType> = new Set<HomepageSectionType>([
  "stats",
  "steps",
  "checklist",
  "cta",
]);

interface IconSectionEditorProps {
  section: HomepageSection;
  onSettings: (patch: Record<string, unknown>) => void;
}

/** Content editors for the icon-led sections: stats, steps, checklist and CTA band. */
export default function IconSectionEditor({ section, onSettings }: IconSectionEditorProps) {
  const settings = section.settings;
  const items = (settings.items as unknown as Record<string, unknown>[]) || [];

  if (section.type === "stats") {
    return (
      <FieldGroup title="Figures">
        <NumberField
          label="Columns"
          value={Number(settings.columns ?? 4)}
          min={2}
          max={4}
          onChange={(columns) => onSettings({ columns })}
        />
        <p className="text-[10px] text-base-content/50">
          Only enter figures that are true today. Nothing is generated for you.
        </p>
        <ListEditor
          label="Figures"
          items={items}
          max={8}
          onChange={(next) => onSettings({ items: next })}
          createItem={() => ({ icon: "Users", value: "", label: "" })}
          addLabel="Add figure"
          renderItem={(item, update) => (
            <>
              <IconPicker
                label="Icon"
                value={item.icon as string}
                defaultIcon="TrendingUp"
                onChange={(icon) => update({ icon })}
              />
              <TextField
                label="Number"
                value={item.value as string}
                maxLength={40}
                placeholder="5,000+"
                onChange={(value) => update({ value })}
              />
              <TextField
                label="Label"
                value={item.label as string}
                maxLength={120}
                placeholder="Active resellers"
                onChange={(label) => update({ label })}
              />
            </>
          )}
        />
      </FieldGroup>
    );
  }

  if (section.type === "steps") {
    return (
      <FieldGroup title="Steps">
        <NumberField
          label="Columns"
          value={Number(settings.columns ?? 4)}
          min={2}
          max={4}
          onChange={(columns) => onSettings({ columns })}
        />
        <ListEditor
          label="Steps"
          items={items}
          max={8}
          onChange={(next) => onSettings({ items: next })}
          createItem={() => ({ icon: "CircleCheckBig", title: "", description: "" })}
          addLabel="Add step"
          renderItem={(item, update) => (
            <>
              <IconPicker
                label="Icon or emoji"
                value={item.icon as string}
                defaultIcon="CircleCheckBig"
                onChange={(icon) => update({ icon })}
              />
              <TextField
                label="Title"
                value={item.title as string}
                maxLength={120}
                onChange={(title) => update({ title })}
              />
              <TextArea
                label="Description"
                rows={2}
                value={item.description as string}
                maxLength={400}
                onChange={(description) => update({ description })}
              />
            </>
          )}
        />
      </FieldGroup>
    );
  }

  if (section.type === "checklist") {
    return (
      <FieldGroup title="Checklist">
        <IconPicker
          label="Line icon"
          value={settings.itemIcon as string}
          defaultIcon="BadgeCheck"
          onChange={(itemIcon) => onSettings({ itemIcon })}
          helpText="Shown before every line."
        />
        <ListEditor
          label="Lines"
          items={items}
          max={20}
          onChange={(next) => onSettings({ items: next })}
          createItem={() => ({ text: "" })}
          addLabel="Add line"
          renderItem={(item, update) => (
            <TextField
              label="Text"
              value={item.text as string}
              maxLength={200}
              onChange={(text) => update({ text })}
            />
          )}
        />
      </FieldGroup>
    );
  }

  if (section.type === "cta") {
    return (
      <FieldGroup title="Badge">
        <IconPicker
          label="Badge icon"
          value={settings.icon as string}
          defaultIcon="HeartHandshake"
          allowNone
          onChange={(icon) => onSettings({ icon })}
          helpText="Large icon above the headline."
        />
      </FieldGroup>
    );
  }

  return null;
}
