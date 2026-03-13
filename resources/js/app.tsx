import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { PresenceProvider } from './Components/Chat/PresenceContext';
import { ChatSoundProvider } from './Components/Chat/ChatSoundContext';

import { Head } from '@inertiajs/react';

import { Toaster } from './Components/ui/Toaster';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => {
        const siteName = (window as any).siteName || appName;
        return title ? `${title} | ${siteName}` : siteName;
    },
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob('./Pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        // Branding Initialization
        const branding = props.initialPage.props.branding as any;
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

        const user = props.initialPage.props.auth?.user as any;

        root.render(
            <PresenceProvider user={user}>
                <ChatSoundProvider>
                    <App {...props} />
                    <Toaster />
                </ChatSoundProvider>
            </PresenceProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});
