import { Star } from 'lucide-react';

interface Props {
  rating: number;
  size?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

export default function StarRating({ rating, size = 16, interactive = false, onChange }: Props) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(star => (
        <Star
          key={star}
          size={size}
          fill={star <= rating ? 'var(--amber-400)' : 'transparent'}
          stroke={star <= rating ? 'var(--amber-400)' : 'var(--neutral-300)'}
          style={interactive ? { cursor: 'pointer', transition: 'transform 0.1s' } : undefined}
          onClick={interactive && onChange ? () => onChange(star) : undefined}
        />
      ))}
    </div>
  );
}
