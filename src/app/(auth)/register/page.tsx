"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { authApi } from "@/services/auth.api";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

const registerSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z.string().min(1, { message: "Phone is required" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  role: z.enum(["USER", "RESELLER"]).default("USER"),
  organizationId: z.string().uuid({ message: "Organization ID (UUID) is required" }),
  presentDistrict: z.string().min(1, { message: "Present District is required" }),
  presentThana: z.string().min(1, { message: "Present Thana is required" }),
  permanentDistrict: z.string().min(1, { message: "Permanent District is required" }),
  permanentThana: z.string().min(1, { message: "Permanent Thana is required" }),
  secondaryPhone: z.string().optional(),
  pageName: z.string().trim().min(1, { message: "Page Name is required" }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

function RegisterForm() {
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState(
    "Thank you for registering. Our representative will contact you within 24 to 72 hours.",
  );
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  const initialRole = searchParams.get("role") === "RESELLER" ? "RESELLER" : "USER";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: initialRole as any,
      organizationId: "550e8400-e29b-41d4-a716-446655440000",
      pageName: "",
    }
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setError("");

      const res = await authApi.register(data);

      // Reseller accounts are gated behind admin approval, so the API
      // deliberately does not return tokens for them.
      if (res.requiresApproval || !res.accessToken) {
        setSuccessMessage(
          "Your reseller account is awaiting approval. You will be able to log in once an administrator approves it.",
        );
        setIsSuccess(true);

        setTimeout(() => {
          router.push("/login");
        }, 2600);
        return;
      }

      setAuth(res.user, res.accessToken, res.refreshToken);
      setSuccessMessage(
        "Thank you for registering. Our representative will contact you within 24 to 72 hours.",
      );
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
      setError(Array.isArray(message) ? message.join(", ") : message || "Registration failed");
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-base-200">
      <div className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="card w-full max-w-2xl bg-base-100 shadow-xl">
          <div className="card-body">
          <h2 className="card-title text-3xl font-bold justify-center mb-6 text-[#001C94]">Create an Account</h2>
          
          {isSuccess ? (
            <div className="text-center py-8 space-y-4">
              <p className="text-xl font-semibold" style={{ color: "#001C94" }}>
                {successMessage}
              </p>
              <Link href="/login" className="btn btn-primary btn-sm rounded-full">
                Go to login
              </Link>
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
                <label className="label"><span className="label-text">Full Name</span></label>
                <input type="text" placeholder="Abdur Rahim" className={`input input-bordered text-base-content w-full ${errors.name ? "input-error" : ""}`} {...register("name")} />
                {errors.name && <span className="label-text-alt text-error mt-1">{errors.name.message}</span>}
              </div>

              <div className="form-control">
                <label className="label"><span className="label-text">Email</span></label>
                <input type="email" placeholder="abdurrahim@gmail.com" className={`input input-bordered text-base-content w-full ${errors.email ? "input-error" : ""}`} {...register("email")} />
                {errors.email && <span className="label-text-alt text-error mt-1">{errors.email.message}</span>}
              </div>
              
              <div className="form-control">
                <label className="label"><span className="label-text">Phone Number</span></label>
                <input type="tel" placeholder="01XXXXXXXXX" className={`input input-bordered text-base-content w-full ${errors.phone ? "input-error" : ""}`} {...register("phone")} />
                {errors.phone && <span className="label-text-alt text-error mt-1">{errors.phone.message}</span>}
              </div>

              <div className="form-control">
                <label className="label"><span className="label-text">Secondary Phone (Optional)</span></label>
                <input type="tel" placeholder="01XXXXXXXXX" className={`input input-bordered text-base-content w-full ${errors.secondaryPhone ? "input-error" : ""}`} {...register("secondaryPhone")} />
                {errors.secondaryPhone && <span className="label-text-alt text-error mt-1">{errors.secondaryPhone.message}</span>}
              </div>

              <div className="form-control">
                <label className="label"><span className="label-text">Page Name</span></label>
                <input type="text" placeholder="Your Page Name" className={`input input-bordered text-base-content w-full ${errors.pageName ? "input-error" : ""}`} {...register("pageName")} />
                {errors.pageName && <span className="label-text-alt text-error mt-1">{errors.pageName.message}</span>}
              </div>

              <div className="form-control">
                <label className="label"><span className="label-text">Password</span></label>
                <input type="password" placeholder="********" className={`input input-bordered text-base-content w-full ${errors.password ? "input-error" : ""}`} {...register("password")} />
                {errors.password && <span className="label-text-alt text-error mt-1">{errors.password.message}</span>}
              </div>

              {/* Hidden fields for Role and Organization ID */}
              <input type="hidden" {...register("organizationId")} />
              <input type="hidden" {...register("role")} />
            </div>

            <div className="divider text-base-content">Address Info</div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label"><span className="label-text">Present District</span></label>
                <input type="text" placeholder="Dhaka" className={`input input-bordered text-base-content w-full ${errors.presentDistrict ? "input-error" : ""}`} {...register("presentDistrict")} />
                {errors.presentDistrict && <span className="label-text-alt text-error mt-1">{errors.presentDistrict.message}</span>}
              </div>

              <div className="form-control">
                <label className="label"><span className="label-text">Present Thana</span></label>
                <input type="text" placeholder="Mirpur" className={`input input-bordered text-base-content w-full ${errors.presentThana ? "input-error" : ""}`} {...register("presentThana")} />
                {errors.presentThana && <span className="label-text-alt text-error mt-1">{errors.presentThana.message}</span>}
              </div>

              <div className="form-control">
                <label className="label"><span className="label-text">Permanent District</span></label>
                <input type="text" placeholder="Dhaka" className={`input input-bordered text-base-content w-full ${errors.permanentDistrict ? "input-error" : ""}`} {...register("permanentDistrict")} />
                {errors.permanentDistrict && <span className="label-text-alt text-error mt-1">{errors.permanentDistrict.message}</span>}
              </div>

              <div className="form-control">
                <label className="label"><span className="label-text">Permanent Thana</span></label>
                <input type="text" placeholder="Mirpur" className={`input input-bordered text-base-content w-full ${errors.permanentThana ? "input-error" : ""}`} {...register("permanentThana")} />
                {errors.permanentThana && <span className="label-text-alt text-error mt-1">{errors.permanentThana.message}</span>}
              </div>
            </div>

            <div className="form-control mt-8">
              <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting}>
                {isSubmitting ? <span className="loading loading-spinner"></span> : "Create Account"}
              </button>
            </div>
          </form>

          <div className="divider mt-6">OR</div>
          
          <div className="text-center mt-2">
            <span className="text-base-content/70">Already have an account? </span>
            <Link href="/login" className="link link-primary font-semibold">
              Log in here
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
