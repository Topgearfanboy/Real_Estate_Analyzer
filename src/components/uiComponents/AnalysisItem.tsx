interface AnalysisItemProps {
  label: string;
  value: string;
  highlight?: boolean;
}

export function AnalysisItem({ label, value, highlight }: AnalysisItemProps) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-border last:border-0">
      <span className="text-sm text-text-muted">{label}</span>
      <span
        className={`font-medium ${
          highlight ? "text-primary" : "text-text"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
