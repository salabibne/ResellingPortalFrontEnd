import TrackOrderButton from "./TrackOrderButton";
import WhatsAppButton from "./WhatsAppButton";

/**
 * Single fixed stack for all storefront floating actions. Keeping both widgets
 * in one column guarantees they can never overlap each other and lets them
 * share one safe-area aware offset from the viewport edge. On phones the stack
 * sits above the bottom navigation.
 */
export default function FloatingActions() {
  return (
    <div className="pointer-events-none fixed bottom-28 lg:bottom-4 right-4 z-40 flex flex-col items-end gap-3 pb-[env(safe-area-inset-bottom)] print:hidden">
      <div className="pointer-events-auto">
        <TrackOrderButton />
      </div>
      {/* On phones WhatsApp lives in the bottom navigation instead. */}
      <div className="pointer-events-auto hidden lg:block">
        <WhatsAppButton />
      </div>
    </div>
  );
}
