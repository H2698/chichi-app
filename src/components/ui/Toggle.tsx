export function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className="relative h-6 w-[42px] flex-shrink-0 rounded-full transition-colors"
      style={{
        background: checked ? "#33291f" : "#e6dbc6",
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "default" : "pointer",
      }}
    >
      <span
        className="absolute top-[3px] h-[18px] w-[18px] rounded-full bg-[#fdfaf3] shadow-[0_2px_4px_rgba(35,27,20,.3)] transition-all"
        style={{ left: checked ? "21px" : "3px" }}
      />
    </button>
  );
}
