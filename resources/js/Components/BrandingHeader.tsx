import React, { useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';

interface BrandingProps {
    title?: string;
}

export default function BrandingHeader({ title }: BrandingProps) {
    const { branding } = usePage<any>().props;

    useEffect(() => {
        if (branding?.site_name) {
            (window as any).siteName = branding.site_name;
        }

        if (branding?.site_favicon) {
            let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
            if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.getElementsByTagName('head')[0].appendChild(link);
            }
            link.href = branding.site_favicon;
        }
    }, [branding]);

    return (
        <Head title={title} />
    );
}
