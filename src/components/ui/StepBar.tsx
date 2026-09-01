const STEPS = ["Robe", "Dates", "Cliente", "Paiement", "Résumé"] as const;
const STEP_KEYS = ["dates", "customer", "payment", "summary"] as const;

export type ReservationStepKey = (typeof STEP_KEYS)[number];

export function StepBar({ current }: { current: ReservationStepKey }) {
  const currentIndex = STEP_KEYS.indexOf(current) + 1; // 'Robe' is always step 0, already satisfied

  return (
    <div className="mt-[18px] flex gap-1.5">
      {STEPS.map((label, i) => {
        const done = i <= currentIndex;
        return (
          <div key={label} className="flex-1">
            <div
              className="h-0.5 rounded-full"
              style={{ background: done ? "#a5813f" : "#eee3d0" }}
            />
            <div
              className="mt-1.5 text-[9.5px] uppercase tracking-[1.2px]"
              style={{ color: done ? "#a5813f" : "#c9bda6" }}
            >
              {label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
