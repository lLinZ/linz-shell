import React from 'react';
import { cn } from '@/lib/utils';

export interface StatusIndicatorProps {
    status: 'online' | 'offline' | 'away' | 'busy';
    variant?: 'dot' | 'ring' | 'badge';
    size?: 'sm' | 'md' | 'lg';
    pulse?: boolean;
    className?: string;
    label?: string;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
    status,
    variant = 'dot',
    size = 'md',
    pulse = false,
    className,
    label,
}) => {
    const statusColors = {
        online: 'bg-green-500',
        offline: 'bg-gray-400',
        away: 'bg-amber-500',
        busy: 'bg-red-500',
    };

    const textColors = {
        online: 'text-green-600 dark:text-green-400',
        offline: 'text-gray-500 dark:text-gray-400',
        away: 'text-amber-600 dark:text-amber-400',
        busy: 'text-red-600 dark:text-red-400',
    };

    const sizeClasses = {
        sm: 'h-2 w-2',
        md: 'h-2.5 w-2.5',
        lg: 'h-3 w-3',
    };

    if (variant === 'badge' && label) {
        return (
            <span className={cn('inline-flex items-center gap-1.5', className)}>
                <span
                    className={cn(
                        'block rounded-full',
                        sizeClasses[size],
                        statusColors[status],
                        pulse && status === 'online' && 'animate-pulse'
                    )}
                />
                <span className={cn('text-xs font-medium', textColors[status])}>
                    {label}
                </span>
            </span>
        );
    }

    if (variant === 'ring') {
        return (
            <span
                className={cn(
                    'block rounded-full ring-2 ring-white dark:ring-gray-900',
                    sizeClasses[size],
                    statusColors[status],
                    pulse && status === 'online' && 'animate-pulse',
                    className
                )}
            />
        );
    }

    // Default: dot variant
    return (
        <span
            className={cn(
                'block rounded-full',
                sizeClasses[size],
                statusColors[status],
                pulse && status === 'online' && 'animate-pulse',
                className
            )}
        />
    );
};

export default StatusIndicator;
