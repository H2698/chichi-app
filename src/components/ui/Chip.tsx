export function Chip({
  label,
  active,
  onClick,
  scrollable,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  scrollable?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[20px] px-4 py-2.5 text-[12.5px] cursor-pointer ${
        scrollable ? "flex-shrink-0 whitespace-nowrap" : ""
      }`}
      style={{
        border: `1px solid ${active ? "#33291f" : "#e6dbc6"}`,
        background: active ? "#33291f" : "transparent",
        color: active ? "#f6ecd9" : "#7c6a58",
      }}
    >
      {label}
    </button>
  );
}
