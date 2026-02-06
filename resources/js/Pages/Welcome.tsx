import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';

export default function Welcome({
    auth,
    laravelVersion,
    phpVersion,
    landingSections,
}: PageProps<{ laravelVersion: string; phpVersion: string; landingSections: any[] }>) {
    const handleImageError = () => {
        document
            .getElementById('screenshot-container')
            ?.classList.add('!hidden');
        document.getElementById('docs-card')?.classList.add('!row-span-1');
        document
            .getElementById('docs-card-content')
            ?.classList.add('!flex-row');
        document.getElementById('background')?.classList.add('!hidden');
    };

    const hero = landingSections.find(s => s.section_key === 'hero');
    const features = landingSections.find(s => s.section_key === 'features');

    return (
        <>
            <Head title="Welcome" />
            <div className="bg-gray-50 text-black/50 dark:bg-black dark:text-white/50">
                <img
                    id="background"
                    className="absolute -left-20 top-0 max-w-[877px]"
                    src="https://laravel.com/assets/img/welcome/background.svg"
                />
                <div className="relative flex min-h-screen flex-col items-center justify-center selection:bg-[#FF2D20] selection:text-white">
                    <div className="relative w-full max-w-2xl px-6 lg:max-w-7xl">
                        <header className="grid grid-cols-2 items-center gap-2 py-10 lg:grid-cols-3">
                            <div className="flex lg:col-start-2 lg:justify-center">
                                {/* Logo placeholder */}
                                <h1 className="text-3xl font-bold text-[#FF2D20]">linz-shell</h1>
                            </div>
                            <nav className="-mx-3 flex flex-1 justify-end">
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="rounded-md px-3 py-2 text-black ring-1 ring-transparent transition hover:text-black/70 focus:outline-none focus-visible:ring-[#FF2D20] dark:text-white dark:hover:text-white/80 dark:focus-visible:ring-white"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('login')}
                                            className="rounded-md px-3 py-2 text-black ring-1 ring-transparent transition hover:text-black/70 focus:outline-none focus-visible:ring-[#FF2D20] dark:text-white dark:hover:text-white/80 dark:focus-visible:ring-white"
                                        >
                                            Log in
                                        </Link>
                                        <Link
                                            href={route('register')}
                                            className="rounded-md px-3 py-2 text-black ring-1 ring-transparent transition hover:text-black/70 focus:outline-none focus-visible:ring-[#FF2D20] dark:text-white dark:hover:text-white/80 dark:focus-visible:ring-white"
                                        >
                                            Register
                                        </Link>
                                    </>
                                )}
                            </nav>
                        </header>

                        <main className="mt-6">
                            {/* Hero Section */}
                            {hero && (
                                <div className="text-center py-16">
                                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
                                        {hero.title}
                                    </h1>
                                    <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                                        {hero.content?.subtitle || 'The modular base for your next big project.'}
                                    </p>
                                    <div className="mt-10 flex items-center justify-center gap-x-6">
                                        <a
                                            href={route('register')}
                                            className="rounded-md bg-app-accent px-3.5 py-2.5 text-sm font-semibold text-black shadow-sm hover:bg-app-accent-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-accent transition-colors"
                                        >
                                            {hero.content?.button_text || 'Get started'}
                                        </a>
                                        <a href="#" className="text-sm font-semibold leading-6 text-gray-900 dark:text-white">
                                            Learn more <span aria-hidden="true">→</span>
                                        </a>
                                    </div>
                                </div>
                            )}

                            {/* Features Section */}
                            {features && features.content?.items && (
                                <div className="grid gap-6 lg:grid-cols-3 lg:gap-8 mt-12">
                                    {features.content.items.map((item: any, index: number) => (
                                        <div
                                            key={index}
                                            className="flex flex-col items-start gap-4 rounded-lg bg-white p-6 shadow-sm ring-1 ring-black/5 transition hover:shadow-md dark:bg-app-card dark:ring-white/10"
                                        >
                                            <h3 className="text-lg font-semibold text-black dark:text-white">{item.title}</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </main>

                        <footer className="py-16 text-center text-sm text-black dark:text-white/70">
                            Laravel v{laravelVersion} (PHP v{phpVersion})
                        </footer>
                    </div>
                </div>
            </div>
        </>
    );
}
