import React from 'react';
import { cn } from '@/lib/utils';

export interface AvatarProps {
    name: string;
    color?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    src?: string;
    status?: 'online' | 'offline' | 'away' | null;
    className?: string;
    showRing?: boolean;
}

const Avatar: React.FC<AvatarProps> = ({
    name,
    color,
    size = 'md',
    src,
    status = null,
    className,
    showRing = false,
}) => {
    const sizeClasses = {
        xs: 'h-6 w-6 text-xs',
        sm: 'h-8 w-8 text-sm',
        md: 'h-10 w-10 text-base',
        lg: 'h-12 w-12 text-lg',
        xl: 'h-16 w-16 text-2xl',
    };

    const statusSizeClasses = {
        xs: 'h-1.5 w-1.5',
        sm: 'h-2 w-2',
        md: 'h-3 w-3',
        lg: 'h-3.5 w-3.5',
        xl: 'h-4 w-4',
    };

    const statusColorClasses = {
        online: 'bg-green-500',
        offline: 'bg-gray-400',
        away: 'bg-amber-500',
    };

    const initial = name.charAt(0).toUpperCase();

    const avatarStyle: React.CSSProperties = color
        ? { backgroundColor: color }
        : {};

    return (
        <div className={cn('relative inline-block', className)}>
            <div
                className={cn(
                    'rounded-full flex items-center justify-center text-white font-bold shadow-sm overflow-hidden',
                    sizeClasses[size],
                    showRing && 'ring-2 ring-offset-2 dark:ring-offset-gray-900',
                )}
                style={avatarStyle}
            >
                {src ? (
                    <img
                        src={src}
                        alt={name}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    initial
                )}
            </div>
            {status && (
                <span
                    className={cn(
                        'absolute bottom-0 right-0 block rounded-full ring-2 ring-white dark:ring-gray-900',
                        statusSizeClasses[size],
                        statusColorClasses[status]
                    )}
                />
            )}
        </div>
    );
};

export default Avatar;
