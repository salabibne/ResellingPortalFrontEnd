"use client";

import React, { type ReactNode } from "react";

interface TextFieldProps {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  mono?: boolean;
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
  mono,
}: TextFieldProps) {
  return (
    <div className="form-control">
      <label className="label py-1">
        <span className="label-text text-xs font-bold">{label}</span>
      </label>
      <input
        type="text"
        value={value || ""}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={`input input-bordered input-sm w-full ${mono ? "font-mono text-[11px]" : "text-xs"}`}
      />
    </div>
  );
}

export function TextArea({
  label,
  value,
  onChange,
  rows = 3,
  placeholder,
  maxLength,
}: {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <div className="form-control">
      <label className="label py-1">
        <span className="label-text text-xs font-bold">{label}</span>
      </label>
      <textarea
        rows={rows}
        value={value || ""}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="textarea textarea-bordered w-full text-xs leading-relaxed"
      />
    </div>
  );
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  helpText,
}: {
  label: string;
  value?: string | number;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  helpText?: string;
}) {
  return (
    <div className="form-control">
      <label className="label py-1">
        <span className="label-text text-xs font-bold">{label}</span>
      </label>
      <select
        value={value === undefined ? "" : String(value)}
        onChange={(event) => onChange(event.target.value)}
        className="select select-bordered select-sm w-full text-xs font-semibold"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {helpText && <p className="mt-1 text-[10px] text-base-content/50">{helpText}</p>}
    </div>
  );
}

export function NumberField({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  suffix,
}: {
  label: string;
  value?: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}) {
  return (
    <div className="form-control">
      <label className="label py-1">
        <span className="label-text text-xs font-bold">
          {label}
          {suffix ? <span className="ml-1 font-normal text-base-content/50">({suffix})</span> : null}
        </span>
      </label>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value ?? ""}
        onChange={(event) => {
          const next = Number(event.target.value);
          if (!Number.isFinite(next)) return;
          onChange(Math.min(max, Math.max(min, next)));
        }}
        className="input input-bordered input-sm w-full text-xs"
      />
    </div>
  );
}

export function ToggleField({
  label,
  checked,
  onChange,
  hint,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  hint?: string;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-base-200 px-3 py-2">
      <span>
        <span className="block text-xs font-bold">{label}</span>
        {hint && <span className="block text-[10px] text-base-content/50">{hint}</span>}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="toggle toggle-primary toggle-sm"
      />
    </label>
  );
}

const PRESET_COLORS = [
  { label: "Primary", value: "primary" },
  { label: "Base 100", value: "base-100" },
  { label: "Base 200", value: "base-200" },
  { label: "Base content", value: "base-content" },
];

export function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="form-control">
      <label className="label py-1">
        <span className="label-text text-xs font-bold">{label}</span>
      </label>
      <div className="flex items-center gap-1.5">
        <input
          type="text"
          value={value || ""}
          placeholder="#001C94 or primary"
          onChange={(event) => onChange(event.target.value)}
          className="input input-bordered input-sm w-full font-mono text-[11px]"
        />
        <input
          type="color"
          aria-label={`${label} picker`}
          value={value?.startsWith("#") ? value : "#001C94"}
          onChange={(event) => onChange(event.target.value)}
          className="h-8 w-9 cursor-pointer rounded border border-base-300 bg-base-100 p-0.5"
        />
      </div>
      <div className="mt-1 flex flex-wrap gap-1">
        {PRESET_COLORS.map((preset) => (
          <button
            key={preset.value}
            type="button"
            onClick={() => onChange(preset.value)}
            className="badge badge-xs badge-outline hover:badge-primary"
          >
            {preset.label}
          </button>
        ))}
        {value && (
          <button type="button" onClick={() => onChange("")} className="badge badge-xs badge-ghost">
            clear
          </button>
        )}
      </div>
    </div>
  );
}

export function CheckboxList({
  label,
  options,
  values,
  onChange,
  emptyText = "Nothing available yet.",
  searchable = false,
}: {
  label: string;
  options: { id: string; name: string }[];
  values: string[];
  onChange: (values: string[]) => void;
  emptyText?: string;
  searchable?: boolean;
}) {
  const [query, setQuery] = React.useState("");

  const filtered =
    searchable && query.trim()
      ? options.filter((option) =>
          option.name.toLowerCase().includes(query.trim().toLowerCase()),
        )
      : options;

  const toggle = (id: string) => {
    if (values.includes(id)) {
      onChange(values.filter((value) => value !== id));
    } else {
      onChange([...values, id]);
    }
  };

  return (
    <div className="form-control">
      <label className="label py-1">
        <span className="label-text text-xs font-bold">
          {label}
          <span className="ml-1 font-normal text-base-content/50">({values.length} selected)</span>
        </span>
      </label>
      {searchable && (
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search…"
          className="input input-bordered input-xs mb-1.5 w-full text-[11px]"
        />
      )}
      <div className="max-h-40 overflow-y-auto rounded-xl border border-base-200 p-1.5">
        {filtered.length === 0 ? (
          <p className="px-2 py-3 text-center text-[11px] text-base-content/50">{emptyText}</p>
        ) : (
          filtered.slice(0, 200).map((option) => (
            <label
              key={option.id}
              className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 hover:bg-base-200/60"
            >
              <input
                type="checkbox"
                checked={values.includes(option.id)}
                onChange={() => toggle(option.id)}
                className="checkbox checkbox-primary checkbox-xs"
              />
              <span className="truncate text-[11px]">{option.name}</span>
            </label>
          ))
        )}
      </div>
    </div>
  );
}

export function FieldGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-2 rounded-2xl border border-base-200 bg-base-100 p-3">
      <h4 className="text-[11px] font-black uppercase tracking-wider text-base-content/50">
        {title}
      </h4>
      {children}
    </div>
  );
}
