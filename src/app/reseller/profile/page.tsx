"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  BadgeCheck,
  Camera,
  CheckCircle2,
  Circle,
  Loader2,
  Save,
  ShieldAlert,
  UserCheck,
} from "lucide-react";
import PanelPage from "@/components/panel/PanelPage";
import PanelPageHeader from "@/components/panel/PanelPageHeader";
import { mediaApi } from "@/services/media.api";
import { profileApi } from "@/services/profile.api";
import { resolveImageUrl } from "@/components/homepage/SafeImage";
import { useResellerProfileStore } from "@/store/useResellerProfileStore";
import { useAuthStore } from "@/store/useAuthStore";

const schema = z.object({
  name: z.string().trim().min(2, "নাম লিখুন"),
  pageName: z.string().trim().max(100).optional().or(z.literal("")),
  nidNumber: z
    .string()
    .trim()
    .regex(/^(\d{10}|\d{13}|\d{17})?$/, "NID নম্বর ১০, ১৩ অথবা ১৭ সংখ্যার হতে হবে")
    .optional()
    .or(z.literal("")),
  secondaryPhone: z.string().trim().max(20).optional().or(z.literal("")),
  presentDistrict: z.string().trim().max(100),
  presentThana: z.string().trim().max(100),
  presentAddress: z.string().trim().max(1000).optional().or(z.literal("")),
  permanentDistrict: z.string().trim().max(100),
  permanentThana: z.string().trim().max(100),
});

type FormValues = z.infer<typeof schema>;

const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
const bn = (n: number) => String(n).replace(/\d/g, (d) => BN_DIGITS[Number(d)]);

export default function ResellerProfilePage() {
  const profile = useResellerProfileStore((state) => state.profile);
  const setProfile = useResellerProfileStore((state) => state.setProfile);
  const refresh = useResellerProfileStore((state) => state.refresh);
  const authUser = useAuthStore((state) => state.user);

  const [imageUrl, setImageUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!profile) {
      refresh().catch(() => undefined);
      return;
    }
    setImageUrl(profile.imageUrl || "");
    reset({
      name: profile.name || "",
      pageName: profile.pageName || "",
      nidNumber: profile.nidNumber || "",
      secondaryPhone: profile.secondaryPhone || "",
      presentDistrict: profile.presentDistrict || "",
      presentThana: profile.presentThana || "",
      presentAddress: profile.presentAddress || "",
      permanentDistrict: profile.permanentDistrict || "",
      permanentThana: profile.permanentThana || "",
    });
    // Only re-seed the form when a different profile loads; saves reset it explicitly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  const save = async (values: FormValues, nextImageUrl = imageUrl) => {
    setSaving(true);
    setMessage(null);
    try {
      const updated = await profileApi.updateMe({ ...values, imageUrl: nextImageUrl || "" });
      setProfile(updated);
      reset(values);
      // Keep the persisted header name in sync.
      const auth = useAuthStore.getState();
      if (auth.user && updated.name !== auth.user.name) {
        useAuthStore.setState({ user: { ...auth.user, name: updated.name } });
      }
      setMessage({
        type: "success",
        text: updated.verification.isVerified
          ? "প্রোফাইল সেভ হয়েছে — আপনার অ্যাকাউন্ট ভেরিফাইড ✅"
          : "প্রোফাইল সেভ হয়েছে। ভেরিফাই হতে বাকি তথ্যগুলো পূরণ করুন।",
      });
    } catch (err: any) {
      const apiMessage = err?.response?.data?.message;
      setMessage({
        type: "error",
        text: Array.isArray(apiMessage) ? apiMessage.join(", ") : apiMessage || "সেভ করা যায়নি, আবার চেষ্টা করুন।",
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePhoto = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    setMessage(null);
    try {
      const { media } = await mediaApi.uploadImage(file, "profilePhoto");
      setImageUrl(media.url);
      // Save the photo right away so the verify light updates without a second click.
      const updated = await profileApi.updateMe({ imageUrl: media.url });
      setProfile(updated);
    } catch (err: any) {
      setMessage({ type: "error", text: err?.response?.data?.message || err?.message || "ছবি আপলোড করা যায়নি।" });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  if (!profile) {
    return (
      <PanelPage width="narrow">
        <div className="flex h-64 items-center justify-center">
          <span className="loading loading-spinner loading-lg text-teal-600" />
        </div>
      </PanelPage>
    );
  }

  const verification = profile.verification;
  const missingKeys = new Set(verification.missing.map((m) => m.key));
  const percent = Math.round((verification.completed / verification.total) * 100);
  const CHECKLIST = [
    { key: "imageUrl", label: "প্রোফাইল ছবি" },
    { key: "name", label: "নাম" },
    { key: "phone", label: "মোবাইল নম্বর" },
    { key: "nidNumber", label: "NID নম্বর" },
    { key: "pageName", label: "পেজ / শপের নাম" },
    { key: "presentDistrict", label: "জেলা" },
    { key: "presentThana", label: "থানা / উপজেলা" },
    { key: "presentAddress", label: "পূর্ণ ঠিকানা" },
  ];
  const avatar = resolveImageUrl(imageUrl);

  return (
    <PanelPage width="narrow">
      <PanelPageHeader
        title="প্রোফাইল ও ভেরিফিকেশন"
        subtitle="সব তথ্য পূরণ করলেই ভেরিফাই সবুজ বাতি জ্বলবে, তারপর অর্ডার করতে পারবেন।"
        icon={UserCheck}
      />

      {/* Verification status */}
      <section
        className={`rounded-3xl p-4 sm:p-5 ring-1 ${
          verification.isVerified
            ? "bg-emerald-50 ring-emerald-200"
            : "bg-rose-50/70 ring-rose-200"
        }`}
      >
        <div className="flex items-center gap-3">
          <span
            className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white ${
              verification.isVerified ? "bg-emerald-500" : "bg-rose-500"
            }`}
          >
            {verification.isVerified && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
            )}
            {verification.isVerified ? <BadgeCheck size={22} /> : <ShieldAlert size={20} />}
          </span>
          <div className="min-w-0 flex-1">
            <p className={`font-extrabold ${verification.isVerified ? "text-emerald-700" : "text-rose-700"}`}>
              {verification.isVerified ? "ভেরিফাইড উদ্যোক্তা" : "ভেরিফাই করুন"}
            </p>
            <p className="text-xs text-base-content/60">
              {verification.isVerified
                ? "আপনার প্রোফাইল সম্পূর্ণ। এখন আপনি অর্ডার করতে পারবেন।"
                : `${bn(verification.completed)}/${bn(verification.total)} তথ্য পূরণ হয়েছে — বাকিগুলো পূরণ করলে অর্ডার করতে পারবেন।`}
            </p>
          </div>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white">
          <div
            className={`h-full rounded-full transition-all ${verification.isVerified ? "bg-emerald-500" : "bg-rose-400"}`}
            style={{ width: `${percent}%` }}
          />
        </div>
        <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 sm:grid-cols-4">
          {CHECKLIST.map((item) => {
            const done = !missingKeys.has(item.key);
            return (
              <li key={item.key} className={`flex items-center gap-1.5 text-[11px] font-semibold ${done ? "text-emerald-700" : "text-rose-600"}`}>
                {done ? <CheckCircle2 size={13} /> : <Circle size={13} />}
                {item.label}
              </li>
            );
          })}
        </ul>
      </section>

      {/* Photo */}
      <section className="flex flex-col items-center gap-3 rounded-3xl border border-base-200 bg-base-100 p-5">
        <div className="relative">
          <div
            className={`h-28 w-28 overflow-hidden rounded-full border-4 bg-base-200 shadow ${
              missingKeys.has("imageUrl") ? "border-rose-300" : "border-teal-500"
            }`}
          >
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} alt={profile.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-3xl font-black text-base-content/30">
                {(profile.name || authUser?.name || "U").charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-teal-600 text-white shadow-lg hover:bg-teal-700 disabled:opacity-60"
            aria-label="ছবি আপলোড করুন"
          >
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => handlePhoto(e.target.files?.[0])}
          />
        </div>
        <p className="text-[11px] text-base-content/50">নিজের পরিষ্কার ছবি দিন (JPG / PNG, সর্বোচ্চ ৫ MB)</p>
      </section>

      {/* Details */}
      <form
        onSubmit={handleSubmit((values) => save(values))}
        className="space-y-4 rounded-3xl border border-base-200 bg-base-100 p-4 sm:p-5"
      >
        <h2 className="text-sm font-extrabold">ব্যক্তিগত তথ্য</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="পূর্ণ নাম *" error={errors.name?.message} missing={missingKeys.has("name")}>
            <input {...register("name")} className="input input-bordered w-full" />
          </Field>
          <Field label="মোবাইল নম্বর">
            <input value={profile.phone} disabled className="input input-bordered w-full" />
          </Field>
          <Field label="NID নম্বর *" error={errors.nidNumber?.message} missing={missingKeys.has("nidNumber")}>
            <input {...register("nidNumber")} inputMode="numeric" placeholder="১০, ১৩ বা ১৭ সংখ্যা" className="input input-bordered w-full" />
          </Field>
          <Field label="বিকল্প মোবাইল নম্বর" error={errors.secondaryPhone?.message}>
            <input {...register("secondaryPhone")} inputMode="tel" className="input input-bordered w-full" />
          </Field>
          <Field label="পেজ / শপের নাম *" error={errors.pageName?.message} missing={missingKeys.has("pageName")}>
            <input {...register("pageName")} placeholder="যেমন: Saykot Fashion House" className="input input-bordered w-full" />
          </Field>
          <Field label="ইমেইল">
            <input value={profile.email} disabled className="input input-bordered w-full" />
          </Field>
        </div>

        <h2 className="pt-2 text-sm font-extrabold">বর্তমান ঠিকানা</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="জেলা *" error={errors.presentDistrict?.message} missing={missingKeys.has("presentDistrict")}>
            <input {...register("presentDistrict")} className="input input-bordered w-full" />
          </Field>
          <Field label="থানা / উপজেলা *" error={errors.presentThana?.message} missing={missingKeys.has("presentThana")}>
            <input {...register("presentThana")} className="input input-bordered w-full" />
          </Field>
          <div className="sm:col-span-2">
            <Field label="পূর্ণ ঠিকানা (গ্রাম / রোড / বাসা নং) *" error={errors.presentAddress?.message} missing={missingKeys.has("presentAddress")}>
              <textarea {...register("presentAddress")} rows={2} className="textarea textarea-bordered w-full" />
            </Field>
          </div>
        </div>

        <h2 className="pt-2 text-sm font-extrabold">স্থায়ী ঠিকানা</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="জেলা" error={errors.permanentDistrict?.message}>
            <input {...register("permanentDistrict")} className="input input-bordered w-full" />
          </Field>
          <Field label="থানা / উপজেলা" error={errors.permanentThana?.message}>
            <input {...register("permanentThana")} className="input input-bordered w-full" />
          </Field>
        </div>

        {message && (
          <div
            role="status"
            className={`rounded-2xl px-3 py-2 text-xs font-semibold ${
              message.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={saving || (!isDirty && imageUrl === (profile.imageUrl || ""))}
          className="btn w-full rounded-2xl border-none bg-teal-600 text-white hover:bg-teal-700 disabled:bg-base-300"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          সেভ করুন
        </button>
      </form>
    </PanelPage>
  );
}

function Field({
  label,
  error,
  missing,
  children,
}: {
  label: string;
  error?: string;
  missing?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="form-control w-full">
      <span className={`label-text mb-1 text-xs font-bold ${missing ? "text-rose-600" : ""}`}>
        {label}
        {missing && <span className="ml-1 text-[10px] font-semibold">(বাকি)</span>}
      </span>
      {children}
      {error && <span className="mt-1 text-[11px] font-semibold text-error">{error}</span>}
    </label>
  );
}
