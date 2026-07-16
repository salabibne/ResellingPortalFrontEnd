import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 text-center">
      <div className="bg-base-200 p-10 rounded-3xl shadow-xl max-w-md w-full flex flex-col items-center gap-4 border border-base-300">
        <div className="bg-primary/10 p-4 rounded-full text-primary mb-2">
          <AlertCircle size={56} strokeWidth={1.5} />
        </div>
        <h1 className="text-4xl font-extrabold text-base-content">Coming Soon</h1>
        <p className="text-lg text-base-content/80 mt-2 font-medium">
          We are coming this feature very soon.
        </p>
        <Link href="/" className="btn btn-primary mt-6 w-full rounded-xl text-lg h-12">
          Go Back Home
        </Link>
      </div>
    </div>
  );
}
