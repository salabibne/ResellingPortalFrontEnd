"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { authApi } from "@/services/auth.api";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { CheckCircle2 } from "lucide-react";
import PasswordInput from "@/components/ui/PasswordInput";

const registerSchema = z.object({
  name: z.string().min(1, { message: "পূর্ণ নাম দিন" }),
  email: z.string().email({ message: "সঠিক ইমেইল ঠিকানা দিন" }),
  phone: z.string().min(1, { message: "ব্যবসায়িক নম্বর দিন" }),
  password: z.string().min(8, { message: "পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে" }),
  role: z.enum(["USER", "RESELLER"]).default("USER"),
  organizationId: z.string().uuid({ message: "অর্গানাইজেশন আইডি প্রয়োজন" }),
  presentDistrict: z.string().min(1, { message: "বর্তমান জেলা দিন" }),
  presentThana: z.string().min(1, { message: "বর্তমান থানা দিন" }),
  permanentDistrict: z.string().min(1, { message: "স্থায়ী জেলা দিন" }),
  permanentThana: z.string().min(1, { message: "স্থায়ী থানা দিন" }),
  secondaryPhone: z.string().optional(),
  pageName: z.string().trim().min(1, { message: "পেজের নাম দিন" }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const RESELLER_SUCCESS_MESSAGE =
  "ধন্যবাদ! আমরা আপনার উদ্যোক্তা হিসেবে যোগ দেওয়ার আবেদন পেয়েছি। খুব শীঘ্রই আমাদের টিম আপনার সাথে যোগাযোগ করবে।";

function RegisterForm() {
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isResellerRequest, setIsResellerRequest] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);

  const initialRole = searchParams.get("role") === "RESELLER" ? "RESELLER" : "USER";

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: initialRole as any,
      organizationId: "550e8400-e29b-41d4-a716-446655440000",
      pageName: "",
    },
  });

  const wantsReseller = watch("role") === "RESELLER";

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setError("");

      const res = await authApi.register(data);

      // Reseller accounts are gated behind admin approval, so the API
      // deliberately does not return tokens for them. Show the confirmation
      // and stay on this page (no redirect to login).
      if (res.requiresApproval || !res.accessToken) {
        setSuccessMessage(RESELLER_SUCCESS_MESSAGE);
        setIsResellerRequest(true);
        setIsSuccess(true);
        return;
      }

      setAuth(res.user, res.accessToken, res.refreshToken);
      setSuccessMessage("ধন্যবাদ! আপনার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে।");
      setIsResellerRequest(false);
      setIsSuccess(true);

      const redirectParam = searchParams.get("redirect");
      const userRole = (res.user?.role || "").toUpperCase();

      setTimeout(() => {
        if (redirectParam && redirectParam.startsWith("/")) {
          router.push(redirectParam);
          return;
        }
        router.push(userRole === "USER" ? "/" : "/dashboard");
      }, 1500);
    } catch (err: any) {
      const message = err.response?.data?.message;
      setError(
        Array.isArray(message)
          ? message.join(", ")
          : message || "রেজিস্ট্রেশন সম্পন্ন হয়নি, আবার চেষ্টা করুন",
      );
    }
  };

  const inputClass = (hasError: boolean) =>
    `input input-bordered text-base-content w-full ${hasError ? "input-error" : ""}`;

  return (
    <div className="flex-1 flex flex-col bg-base-200">
      <div className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="card w-full max-w-2xl bg-base-100 shadow-xl">
          <div className="card-body">
          <h2 className="card-title text-3xl font-bold justify-center mb-6 text-[#001C94]">
            {isSuccess && isResellerRequest ? "আবেদন গ্রহণ করা হয়েছে" : "নতুন অ্যাকাউন্ট খুলুন"}
          </h2>

          {isSuccess ? (
            <div className="text-center py-8 space-y-5">
              <CheckCircle2 className="mx-auto text-success" size={56} />
              <p className="text-lg sm:text-xl font-semibold leading-relaxed" style={{ color: "#001C94" }}>
                {successMessage}
              </p>
              {isResellerRequest && (
                <p className="text-sm text-base-content/70">
                  অনুমোদনের আগে আপনি লগইন করে প্রোডাক্ট দেখতে পারবেন, তবে অনুমোদন পাওয়ার পর থেকে কার্ট ও অর্ডার করতে পারবেন।
                </p>
              )}
              {isResellerRequest && (
                <div className="flex flex-wrap justify-center gap-3">
                  <Link href="/" className="btn btn-primary btn-sm rounded-full">
                    হোমে ফিরে যান
                  </Link>
                  <Link href="/login" className="btn btn-outline btn-sm rounded-full">
                    লগইন
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <>
              {error && (
                <div className="alert alert-error text-sm p-3 rounded-lg mb-4">
                  <span>{error}</span>
                </div>
              )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label"><span className="label-text">পূর্ণ নাম</span></label>
                <input type="text" placeholder="আপনার নাম" className={inputClass(!!errors.name)} {...register("name")} />
                {errors.name && <span className="label-text-alt text-error mt-1">{errors.name.message}</span>}
              </div>

              <div className="form-control">
                <label className="label"><span className="label-text">ইমেইল</span></label>
                <input type="email" placeholder="example@gmail.com" className={inputClass(!!errors.email)} {...register("email")} />
                {errors.email && <span className="label-text-alt text-error mt-1">{errors.email.message}</span>}
              </div>

              <div className="form-control">
                <label className="label"><span className="label-text">ব্যবসায়িক নম্বর</span></label>
                <input type="tel" placeholder="01XXXXXXXXX" className={inputClass(!!errors.phone)} {...register("phone")} />
                {errors.phone ? (
                  <span className="label-text-alt text-error mt-1">{errors.phone.message}</span>
                ) : (
                  <span className="label-text-alt text-base-content/60 mt-1">এই নাম্বারটি ইনভয়েসে প্রিন্ট হবে</span>
                )}
              </div>

              <div className="form-control">
                <label className="label"><span className="label-text">বিকল্প ফোন নম্বর (ঐচ্ছিক)</span></label>
                <input type="tel" placeholder="01XXXXXXXXX" className={inputClass(!!errors.secondaryPhone)} {...register("secondaryPhone")} />
                {errors.secondaryPhone && <span className="label-text-alt text-error mt-1">{errors.secondaryPhone.message}</span>}
              </div>

              <div className="form-control">
                <label className="label"><span className="label-text">পেজের নাম</span></label>
                <input type="text" placeholder="আপনার পেজের নাম" className={inputClass(!!errors.pageName)} {...register("pageName")} />
                {errors.pageName && <span className="label-text-alt text-error mt-1">{errors.pageName.message}</span>}
              </div>

              <div className="form-control">
                <label className="label"><span className="label-text">পাসওয়ার্ড</span></label>
                <PasswordInput
                  placeholder="********"
                  showLabel="পাসওয়ার্ড দেখুন"
                  hideLabel="পাসওয়ার্ড লুকান"
                  className={inputClass(!!errors.password)}
                  {...register("password")}
                />
                {errors.password && <span className="label-text-alt text-error mt-1">{errors.password.message}</span>}
              </div>

              {/* Hidden fields for Role and Organization ID */}
              <input type="hidden" {...register("organizationId")} />
              <input type="hidden" {...register("role")} />
            </div>

            <div className="divider text-base-content">ঠিকানা</div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label"><span className="label-text">বর্তমান জেলা</span></label>
                <input type="text" placeholder="ঢাকা" className={inputClass(!!errors.presentDistrict)} {...register("presentDistrict")} />
                {errors.presentDistrict && <span className="label-text-alt text-error mt-1">{errors.presentDistrict.message}</span>}
              </div>

              <div className="form-control">
                <label className="label"><span className="label-text">বর্তমান থানা</span></label>
                <input type="text" placeholder="মিরপুর" className={inputClass(!!errors.presentThana)} {...register("presentThana")} />
                {errors.presentThana && <span className="label-text-alt text-error mt-1">{errors.presentThana.message}</span>}
              </div>

              <div className="form-control">
                <label className="label"><span className="label-text">স্থায়ী জেলা</span></label>
                <input type="text" placeholder="ঢাকা" className={inputClass(!!errors.permanentDistrict)} {...register("permanentDistrict")} />
                {errors.permanentDistrict && <span className="label-text-alt text-error mt-1">{errors.permanentDistrict.message}</span>}
              </div>

              <div className="form-control">
                <label className="label"><span className="label-text">স্থায়ী থানা</span></label>
                <input type="text" placeholder="মিরপুর" className={inputClass(!!errors.permanentThana)} {...register("permanentThana")} />
                {errors.permanentThana && <span className="label-text-alt text-error mt-1">{errors.permanentThana.message}</span>}
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer rounded-xl border border-base-300 bg-base-200/60 p-4 mt-6">
              <input
                type="checkbox"
                className="checkbox checkbox-primary mt-0.5"
                checked={wantsReseller}
                onChange={(e) =>
                  setValue("role", e.target.checked ? "RESELLER" : "USER", { shouldDirty: true })
                }
              />
              <span className="text-base-content">
                <span className="font-semibold block">আমি উদ্যোক্তা (রিসেলার) হিসেবে যোগ দিতে আগ্রহী</span>
                <span className="text-sm text-base-content/70">
                  টিক দিলে আপনার আবেদন অ্যাডমিনের কাছে অনুমোদনের জন্য যাবে।
                </span>
              </span>
            </label>

            <div className="form-control mt-8">
              <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="loading loading-spinner"></span>
                ) : wantsReseller ? (
                  "আবেদন জমা দিন"
                ) : (
                  "অ্যাকাউন্ট খুলুন"
                )}
              </button>
            </div>
          </form>

          <div className="divider mt-6">অথবা</div>

          <div className="text-center mt-2">
            <span className="text-base-content/70">আগে থেকেই অ্যাকাউন্ট আছে? </span>
            <Link href="/login" className="link link-primary font-semibold">
              লগইন করুন
            </Link>
          </div>
          </>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><span className="loading loading-spinner text-primary"></span></div>}>
      <RegisterForm />
    </Suspense>
  );
}
