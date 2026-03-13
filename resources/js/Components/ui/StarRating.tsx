import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
    value: number;
    onChange?: (value: number) => void;
    readonly?: boolean;
    size?: number;
}

export const StarRating: React.FC<StarRatingProps> = ({
    value,
    onChange,
    readonly = false,
    size = 24
}) => {
    const [hover, setHover] = useState(0);

    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={readonly}
                    onClick={() => onChange?.(star)}
                    onMouseEnter={() => !readonly && setHover(star)}
                    onMouseLeave={() => !readonly && setHover(0)}
                    className={`transition-all duration-200 ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110 active:scale-95'
                        }`}
                >
                    <Star
                        size={size}
                        className={`${(hover || value) >= star
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'fill-transparent text-muted-foreground/30'
                            } transition-colors`}
                    />
                </button>
            ))}
        </div>
    );
};
