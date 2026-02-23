import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { FormEventHandler } from 'react';

interface Setting {
    id: number;
    key: string;
    value: string | null;
    group: string;
    type: string;
}

interface Props {
    settings: Record<string, Setting[]>;
}

export default function Index({ settings }: Props) {
    // Flatten settings for the form
    const allSettings = Object.values(settings).flat();

    const { data, setData, patch, processing, errors, recentlySuccessful } = useForm({
        settings: allSettings.map(s => ({ key: s.key, value: s.value || '' }))
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch(route('admin.settings.update'));
    };

    const handleInputChange = (key: string, value: string) => {
        const newSettings = data.settings.map(s =>
            s.key === key ? { ...s, value } : s
        );
        setData('settings', newSettings);
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">System Settings</h2>}
        >
            <Head title="System Settings" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <form onSubmit={submit} className="space-y-8">
                        {Object.entries(settings).map(([group, groupSettings]) => (
                            <div key={group} className="p-4 sm:p-8 bg-white dark:bg-gray-800 shadow sm:rounded-lg">
                                <header>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 capitalize">{group} Settings</h3>
                                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                        Manage your application's {group} configuration.
                                    </p>
                                </header>

                                <div className="mt-6 space-y-6">
                                    {groupSettings.map((setting) => (
                                        <div key={setting.key}>
                                            <InputLabel htmlFor={setting.key} value={setting.key.replace(/_/g, ' ').toUpperCase()} />

                                            {setting.type === 'color' ? (
                                                <div className="flex items-center space-x-3 mt-1">
                                                    <input
                                                        type="color"
                                                        id={setting.key}
                                                        value={data.settings.find(s => s.key === setting.key)?.value || '#000000'}
                                                        onChange={(e) => handleInputChange(setting.key, e.target.value)}
                                                        className="h-10 w-20 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
                                                    />
                                                    <TextInput
                                                        className="mt-1 block w-full"
                                                        value={data.settings.find(s => s.key === setting.key)?.value || ''}
                                                        onChange={(e) => handleInputChange(setting.key, e.target.value)}
                                                    />
                                                </div>
                                            ) : (
                                                <TextInput
                                                    id={setting.key}
                                                    type="text"
                                                    className="mt-1 block w-full"
                                                    value={data.settings.find(s => s.key === setting.key)?.value || ''}
                                                    onChange={(e) => handleInputChange(setting.key, e.target.value)}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        <div className="flex items-center gap-4">
                            <PrimaryButton disabled={processing}>Save All Settings</PrimaryButton>

                            {recentlySuccessful && (
                                <p className="text-sm text-gray-600 dark:text-gray-400">Saved successfully.</p>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
