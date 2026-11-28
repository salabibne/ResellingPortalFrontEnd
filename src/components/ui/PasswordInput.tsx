"use client";

import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  /** Accessible labels for the toggle button. */
  showLabel?: string;
  hideLabel?: string;
};

/**
 * Password field with an eye button to show / hide the typed password.
 * Forwards its ref so it works with react-hook-form's `{...register("password")}`.
 */
const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput(
    { className = "", showLabel = "Show password", hideLabel = "Hide password", ...props },
    ref,
  ) {
    const [visible, setVisible] = useState(false);

    return (
      <div className="relative w-full">
        <input
          ref={ref}
          type={visible ? "text" : "password"}
          className={`${className} pr-12`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-base-content/60 hover:text-base-content"
          aria-label={visible ? hideLabel : showLabel}
          title={visible ? hideLabel : showLabel}
          tabIndex={-1}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    );
  },
);

export default PasswordInput;
