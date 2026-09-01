import { BackHeader } from "@/components/shell/BackHeader";
import { StepBar, type ReservationStepKey } from "@/components/ui/StepBar";

export function ReservationHeader({ step }: { step: ReservationStepKey }) {
  return (
    <div className="px-[22px] pb-0 pt-1.5">
      <BackHeader title="NOUVELLE RÉSERVATION" eyebrow />
      <StepBar current={step} />
    </div>
  );
}
