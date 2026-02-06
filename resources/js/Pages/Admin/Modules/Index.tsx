import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, router } from '@inertiajs/react';
import BackButton from '@/Components/BackButton';
import ButtonCustom from '@/Components/ButtonCustom';

interface Module {
    id: number;
    name: string;
    slug: string;
    description: string;
    is_enabled: boolean;
}

export default function Index({ auth, modules }: PageProps<{ modules: Module[] }>) {
    const toggleModule = (module: Module) => {
        router.patch(route('admin.modules.update', module.id), {
            is_enabled: !module.is_enabled,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Modules Management
                </h2>
            }
        >
            <Head title="Modules" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <BackButton href={route('dashboard')} label="Back to Dashboard" />
                    <div style={{ backgroundColor: 'var(--color-bg-tertiary)' }} className="shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <table className="min-w-full divide-y divide-app-border">
                                <thead>
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-app-text/60">Example Module Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-app-text/60">Description</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-app-text/60">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-app-text/60">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-app-border">
                                    {modules.map((module) => (
                                        <tr key={module.id}>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">{module.name}</td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{module.description}</td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${module.is_enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {module.is_enabled ? 'Enabled' : 'Disabled'}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-right">
                                                <button
                                                    onClick={() => toggleModule(module)}
                                                    className="text-app-accent hover:text-app-accent-hover transition-colors font-bold uppercase text-xs tracking-wider"
                                                >
                                                    {module.is_enabled ? 'Disable' : 'Enable'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
