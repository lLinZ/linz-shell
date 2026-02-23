import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import BackButton from '@/Components/BackButton';
import TextFieldCustom from '@/Components/TextFieldCustom';
import ButtonCustom from '@/Components/ButtonCustom';
import Checkbox from '@/Components/Checkbox';

interface Section {
    id: number;
    section_key: string;
    title: string;
    content: any;
    is_visible: boolean;
    order: number;
}

export default function Editor({ auth, sections }: PageProps<{ sections: Section[] }>) {
    const { data, setData, put, processing, errors } = useForm({
        sections: sections,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('admin.landing-page.update'));
    };

    const handleContentChange = (index: number, key: string, value: string) => {
        const newSections = [...data.sections];
        if (typeof newSections[index].content === 'object' && newSections[index].content !== null) {
            newSections[index].content = { ...newSections[index].content, [key]: value };
        } else {
            // Fallback for non-object content, maybe just replace?
            // For now assume strictly object as per seeder
        }
        setData('sections', newSections);
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Landing Page Editor
                </h2>
            }
        >
            <Head title="Landing Page Editor" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <BackButton href={route('dashboard')} label="Back to Dashboard" />
                    <form onSubmit={submit}>
                        <div className="space-y-6">
                            {data.sections.map((section, index) => (
                                <div key={section.id || index} style={{ backgroundColor: 'var(--color-bg-tertiary)' }} className="p-4 shadow sm:rounded-lg">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 uppercase">{section.section_key}</h3>

                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-app-text/70">Title</label>
                                        <TextFieldCustom
                                            type="text"
                                            value={section.title || ''}
                                            onChange={(e) => {
                                                const newSections = [...data.sections];
                                                newSections[index].title = e.target.value;
                                                setData('sections', newSections);
                                            }}
                                            className="mt-1 block w-full"
                                        />
                                    </div>

                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-app-text/70">Visibility</label>
                                        <Checkbox
                                            checked={section.is_visible}
                                            onChange={(e) => {
                                                const newSections = [...data.sections];
                                                newSections[index].is_visible = e.target.checked;
                                                setData('sections', newSections);
                                            }}
                                            className="mt-1"
                                        />
                                    </div>

                                    {/* Dynamic content fields based on seeded structure */}
                                    <div className="mt-4 space-y-4">
                                        <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400">Content Fields</h4>

                                        {/* Simple Fields (Strings/Numbers) */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {section.content && typeof section.content === 'object' && !Array.isArray(section.content) &&
                                                Object.keys(section.content).map((key) => {
                                                    const value = section.content[key];
                                                    // Skip complex values for the main loop
                                                    if (value !== null && typeof value === 'object') return null;

                                                    return (
                                                        <div key={key}>
                                                            <label className="block text-xs font-medium text-app-text/50 uppercase">{key}</label>
                                                            <TextFieldCustom
                                                                type="text"
                                                                value={value || ''}
                                                                onChange={(e) => handleContentChange(index, key, e.target.value)}
                                                                className="mt-1 block w-full text-sm"
                                                            />
                                                        </div>
                                                    );
                                                })
                                            }
                                        </div>

                                        {/* Complex Fields: Items Array (Features) */}
                                        {section.content?.items && Array.isArray(section.content.items) && (
                                            <div className="space-y-4 pt-4 border-t border-app-border/30">
                                                <h5 className="text-xs font-bold text-app-accent/70 uppercase">Items List</h5>
                                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                                    {section.content.items.map((item: any, itemIndex: number) => (
                                                        <div key={itemIndex} className="p-4 rounded-lg bg-black/20 border border-app-border/70 dark:border-app-border space-y-3">
                                                            <p className="text-[10px] font-bold text-app-accent">ITEM #{itemIndex + 1}</p>
                                                            <div>
                                                                <label className="block text-[10px] font-medium text-app-text/40 uppercase">Title</label>
                                                                <TextFieldCustom
                                                                    type="text"
                                                                    value={item.title || ''}
                                                                    onChange={(e) => {
                                                                        const newSections = JSON.parse(JSON.stringify(data.sections));
                                                                        newSections[index].content.items[itemIndex].title = e.target.value;
                                                                        setData('sections', newSections);
                                                                    }}
                                                                    className="mt-1 block w-full text-xs"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-[10px] font-medium text-app-text/40 uppercase">Description</label>
                                                                <TextFieldCustom
                                                                    type="text"
                                                                    value={item.description || ''}
                                                                    onChange={(e) => {
                                                                        const newSections = JSON.parse(JSON.stringify(data.sections));
                                                                        newSections[index].content.items[itemIndex].description = e.target.value;
                                                                        setData('sections', newSections);
                                                                    }}
                                                                    className="mt-1 block w-full text-xs"
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 flex justify-end">
                            <ButtonCustom
                                type="submit"
                                disabled={processing}
                            >
                                Save Changes
                            </ButtonCustom>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
