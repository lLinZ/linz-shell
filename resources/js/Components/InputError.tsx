import { HTMLAttributes } from 'react';
import { Typography } from '@/Components/ui/Typography';
import { cn } from '@/lib/utils';

export default function InputError({
    message,
    className = '',
    ...props
}: HTMLAttributes<HTMLParagraphElement> & { message?: string }) {
    return message ? (
        <Typography
            variant="small"
            component="p"
            {...props}
            className={cn('text-red-600 dark:text-red-400', className)}
        >
            {message}
        </Typography>
    ) : null;
}
