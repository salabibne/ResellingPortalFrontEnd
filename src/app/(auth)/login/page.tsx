"use client";

import Link from "next/link";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { authApi } from "@/services/auth.api";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useState } from "react";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [error, setError] = useState("");
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setError("");
      const res = await authApi.login(data);
      setAuth(res.user, res.accessToken, res.refreshToken);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-base-200">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="card w-full max-w-md bg-base-100 shadow-xl">
          <div className="card-body">
          <h2 className="card-title text-2xl font-bold justify-center mb-6 text-primary">Login to Aarham Apparel</h2>
          
          {error && (
            <div className="alert alert-error text-sm p-3 rounded-lg mb-4">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                placeholder="email@example.com"
                className={`input text-black input-bordered w-full ${errors.email ? "input-error" : ""}`}
                {...register("email")}
              />
              {errors.email && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.email.message}</span>
                </label>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                type="password"
                placeholder="********"
                className={`input input-bordered text-black w-full ${errors.password ? "input-error" : ""}`}
                {...register("password")}
              />
              {errors.password && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.password.message}</span>
                </label>
              )}
            </div>

            <div className="form-control mt-6">
              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? <span className="loading loading-spinner"></span> : "Login"}
              </button>
            </div>
          </form>

          <div className="divider mt-6">OR</div>
          
          <div className="text-center mt-2">
            <span className="text-base-content/70">Haven't registered yet? </span>
            <Link href="/register" className="link link-primary font-semibold">
              Create an account
            </Link>
          </div>
        </div>
      </div>
      </div>
      <Footer />
    </div>
  );
}
