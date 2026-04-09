interface Segment {
  value: number;
  color: string;
  label: string;
}

interface SegmentedProgressBarProps {
  segments: Segment[];
  total: number;
}

export function SegmentedProgressBar({ segments, total }: SegmentedProgressBarProps) {
  if (total <= 0) return null;

  return (
    <div className="pt-1 pb-3 px-4">
      <div className="flex h-3 w-full rounded-full overflow-hidden bg-gray-200">
        {segments.map((segment, index) => (
          <div
            key={index}
            className={`h-full ${segment.color}`}
            style={{
              width: `${Math.max(1, (segment.value / total) * 100)}%`,
            }}
            title={`${segment.label}: $${segment.value.toFixed(0)}`}
          />
        ))}
      </div>
      <div className="flex justify-between text-xs text-text-muted mt-1">
        {segments.map((segment, index) => (
          <span key={index} className={segment.color.replace('bg-', 'text-').replace('-500', '-600')}>
            {segment.label}: ${segment.value.toFixed(0)}
          </span>
        ))}
      </div>
    </div>
  );
}
