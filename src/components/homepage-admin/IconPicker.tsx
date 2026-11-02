"use client";

import { useMemo, useState } from "react";
import { Search, Shapes, Smile } from "lucide-react";
import { PanelModal, PanelTabs } from "@/components/panel";
import DynamicIcon from "@/components/homepage/DynamicIcon";
import {
  EMOJI_GROUPS,
  ICON_CATEGORIES,
  ICON_KEYWORDS,
  ICON_LIBRARY,
  NO_ICON,
  emojiValue,
  iconLabel,
  parseIconValue,
} from "@/components/homepage/icon-library";

interface IconPickerProps {
  label: string;
  /** Stored icon value: a Lucide name, "emoji:…", "none" or empty. */
  value?: string;
  onChange: (value: string) => void;
  /** Icon the storefront shows when no value is stored. */
  defaultIcon?: string;
  /** Offer a "No icon" choice that stores "none". */
  allowNone?: boolean;
  helpText?: string;
}

const ALL_ICONS = Object.keys(ICON_LIBRARY).sort();
// Built with the constructor: the TS target (ES5) rejects the `u` flag on literals.
const PICTOGRAPHIC = new RegExp("\\p{Extended_Pictographic}|\\u20E3", "u");

function describe(value: string | undefined, defaultIcon?: string): string {
  const parsed = parseIconValue(value);
  if (!parsed) return defaultIcon ? `Default · ${describe(defaultIcon)}` : "No icon";
  if (parsed.kind === "none") return "No icon";
  if (parsed.kind === "emoji") return `Emoji ${parsed.emoji}`;
  return iconLabel(parsed.name);
}

function matches(name: string, query: string): boolean {
  const haystack = `${name} ${iconLabel(name)} ${ICON_KEYWORDS[name] ?? ""}`.toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word));
}

export default function IconPicker({
  label,
  value,
  onChange,
  defaultIcon,
  allowNone = false,
  helpText,
}: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("icons");
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [customEmoji, setCustomEmoji] = useState("");

  const parsed = parseIconValue(value);
  const selectedName = parsed?.kind === "lucide" ? parsed.name : null;
  const selectedEmoji = parsed?.kind === "emoji" ? parsed.emoji : null;

  const visibleIcons = useMemo(() => {
    if (query.trim()) return ALL_ICONS.filter((name) => matches(name, query.trim()));
    if (category === "all") return ALL_ICONS;
    return ICON_CATEGORIES.find((entry) => entry.id === category)?.icons ?? [];
  }, [category, query]);

  const customEmojiValid =
    customEmoji.trim().length > 0 &&
    customEmoji.trim().length <= 16 &&
    PICTOGRAPHIC.test(customEmoji) &&
    !/[A-Za-z<>"'&`\\]/.test(customEmoji);

  const openPicker = () => {
    setTab(parsed?.kind === "emoji" ? "emoji" : "icons");
    setQuery("");
    setCustomEmoji("");
    setOpen(true);
  };

  const choose = (next: string) => {
    onChange(next);
    setOpen(false);
  };

  return (
    <div className="form-control">
      <label className="label py-1">
        <span className="label-text text-xs font-bold">{label}</span>
      </label>
      <button
        type="button"
        onClick={openPicker}
        className="flex w-full items-center gap-2 rounded-xl border border-base-300 bg-base-100 px-2 py-1.5 text-left transition-colors hover:border-primary/50"
      >
        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <DynamicIcon value={value} fallback={defaultIcon} size={16} />
        </span>
        <span className="min-w-0 flex-1 truncate text-xs font-semibold">
          {describe(value, defaultIcon)}
        </span>
        <span className="text-[10px] font-bold text-primary">Change</span>
      </button>
      {helpText && <p className="mt-1 text-[10px] text-base-content/50">{helpText}</p>}

      <PanelModal
        open={open}
        onClose={() => setOpen(false)}
        title={`Choose icon · ${label}`}
        size="lg"
        footer={
          <>
            {defaultIcon && (
              <button
                type="button"
                onClick={() => choose("")}
                className="btn btn-ghost btn-sm rounded-xl"
              >
                Use default
              </button>
            )}
            {allowNone && (
              <button
                type="button"
                onClick={() => choose(NO_ICON)}
                className="btn btn-ghost btn-sm rounded-xl"
              >
                No icon
              </button>
            )}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="btn btn-outline btn-sm rounded-xl"
            >
              Cancel
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <PanelTabs
            ariaLabel="Icon type"
            value={tab}
            onChange={setTab}
            tabs={[
              { id: "icons", label: "Icons", icon: Shapes, count: ALL_ICONS.length },
              { id: "emoji", label: "Emoji", icon: Smile },
            ]}
          />

          {tab === "icons" ? (
            <>
              <label className="input input-bordered input-sm flex items-center gap-2 rounded-xl">
                <Search size={14} className="shrink-0 text-base-content/50" />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search icons, e.g. delivery, money, ডেলিভারি"
                  aria-label="Search icons"
                  className="w-full min-w-0 text-xs"
                />
              </label>

              {!query.trim() && (
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {[{ id: "all", label: "All" }, ...ICON_CATEGORIES].map((entry) => (
                    <button
                      key={entry.id}
                      type="button"
                      onClick={() => setCategory(entry.id)}
                      aria-pressed={category === entry.id}
                      className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-bold transition-colors ${
                        category === entry.id
                          ? "bg-primary text-white"
                          : "bg-base-200 text-base-content/70 hover:text-base-content"
                      }`}
                    >
                      {entry.label}
                    </button>
                  ))}
                </div>
              )}

              {visibleIcons.length === 0 ? (
                <p className="rounded-xl border border-dashed border-base-300 p-6 text-center text-xs text-base-content/50">
                  No icon matches “{query.trim()}”. Try another word or the Emoji tab.
                </p>
              ) : (
                <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-8">
                  {visibleIcons.map((name) => {
                    const Icon = ICON_LIBRARY[name];
                    const active = selectedName === name;
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => choose(name)}
                        aria-label={iconLabel(name)}
                        aria-pressed={active}
                        title={iconLabel(name)}
                        className={`flex h-11 items-center justify-center rounded-xl border transition-colors ${
                          active
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-base-200 text-base-content/80 hover:border-primary/40 hover:text-primary"
                        }`}
                      >
                        <Icon size={20} aria-hidden="true" />
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <>
              {EMOJI_GROUPS.map((group) => (
                <div key={group.id}>
                  <p className="mb-1.5 text-[11px] font-black uppercase tracking-wider text-base-content/50">
                    {group.label}
                  </p>
                  <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-10">
                    {group.emojis.map((emoji) => {
                      const active = selectedEmoji === emoji;
                      return (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => choose(emojiValue(emoji))}
                          aria-label={`Emoji ${emoji}`}
                          aria-pressed={active}
                          className={`flex h-11 items-center justify-center rounded-xl border text-xl transition-colors ${
                            active
                              ? "border-primary bg-primary/10"
                              : "border-base-200 hover:border-primary/40"
                          }`}
                        >
                          {emoji}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="rounded-xl border border-base-200 p-3">
                <p className="mb-1.5 text-xs font-bold">Use any other emoji</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customEmoji}
                    maxLength={16}
                    onChange={(event) => setCustomEmoji(event.target.value)}
                    placeholder="Paste an emoji, e.g. 🧵"
                    aria-label="Custom emoji"
                    className="input input-bordered input-sm w-full min-w-0 rounded-xl text-base"
                  />
                  <button
                    type="button"
                    disabled={!customEmojiValid}
                    onClick={() => choose(emojiValue(customEmoji))}
                    className="btn btn-primary btn-sm rounded-xl text-white"
                  >
                    Use
                  </button>
                </div>
                {customEmoji && !customEmojiValid && (
                  <p className="mt-1 text-[10px] font-semibold text-error">
                    Paste a single emoji (no letters).
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </PanelModal>
    </div>
  );
}
