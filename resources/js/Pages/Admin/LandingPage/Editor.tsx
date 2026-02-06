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
                                    <div className="mt-4 space-y-2">
                                        <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400">Content Fields</h4>
                                        {section.content && typeof section.content === 'object' && !Array.isArray(section.content) && Object.keys(section.content).map((key) => (
                                            <div key={key}>
                                                <label className="block text-xs font-medium text-app-text/50 uppercase">{key}</label>
                                                <TextFieldCustom
                                                    type="text"
                                                    value={section.content[key] || ''}
                                                    onChange={(e) => handleContentChange(index, key, e.target.value)}
                                                    className="mt-1 block w-full text-sm"
                                                />
                                            </div>
                                        ))}
                                        {/* Simple fallback for array items (like features) - just JSON stringify for now or skip */}
                                        {section.content && Array.isArray(section.content['items']) && (
                                            <div className="text-xs text-gray-500">Complex array content editing not fully supported in this basic editor.</div>
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
