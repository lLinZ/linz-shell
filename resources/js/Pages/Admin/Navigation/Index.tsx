import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Surface } from '@/Components/ui/Surface';
import { Typography } from '@/Components/ui/Typography';
import { Button } from '@/Components/ui/button';
import { Save, Braces, Palette, Globe, Image as ImageIcon } from 'lucide-react';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';

interface Props {
    navbar_config: any;
    branding_config: {
        site_name: string;
        site_logo: string;
        site_favicon: string;
    };
}

export default function Index({ navbar_config, branding_config }: Props) {
    const [jsonBuffer, setJsonBuffer] = useState<string>(JSON.stringify(navbar_config, null, 2));

    const { data, setData, post, processing, transform } = useForm({
        navbar_config: navbar_config,
        branding_config: branding_config
    });

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const parsed = JSON.parse(jsonBuffer);

            transform((data) => ({
                ...data,
                navbar_config: parsed
            }));

            post(route('admin.navigation.update'), {
                preserveScroll: true,
                onSuccess: () => {
                    // Success feedback can be handled via flash messages
                }
            });
        } catch (err) {
            alert('Error de sintaxis en el JSON: Revisa el formato antes de guardar.');
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <Typography variant="h2">Branding y Navegación</Typography>
                    <PrimaryButton onClick={handleUpdate} disabled={processing}>
                        <Save className="w-4 h-4 mr-2" /> Guardar Todo
                    </PrimaryButton>
                </div>
            }
        >
            <Head title="Navegación & Branding" />

            <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
                {/* Global Branding Section */}
                <Surface variant="primary" className="p-0 overflow-hidden shadow-xl border border-[var(--color-border)] rounded-2xl">
                    <div className="p-6 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]/30">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-[var(--color-primary)]/10 rounded-lg">
                                <Palette className="w-6 h-6 text-[var(--color-primary)]" />
                            </div>
                            <div>
                                <Typography variant="h3">Identidad de Marca</Typography>
                                <Typography variant="small" className="text-[var(--color-text-muted)]">
                                    Configura el nombre del sitio, logo y favicon global.
                                </Typography>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <InputLabel value="NOMBRE DEL SITIO" />
                            <TextInput
                                className="w-full"
                                value={data.branding_config.site_name}
                                onChange={(e) => setData('branding_config', { ...data.branding_config, site_name: e.target.value })}
                                placeholder="Ej: JOBI"
                            />
                        </div>
                        <div className="space-y-2">
                            <InputLabel value="URL DEL FAVICON" />
                            <TextInput
                                className="w-full"
                                value={data.branding_config.site_favicon}
                                onChange={(e) => setData('branding_config', { ...data.branding_config, site_favicon: e.target.value })}
                                placeholder="https://..."
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <InputLabel value="URL DEL LOGOTIPO principal" />
                            <div className="flex gap-4 items-start">
                                <TextInput
                                    className="flex-1"
                                    value={data.branding_config.site_logo}
                                    onChange={(e) => setData('branding_config', { ...data.branding_config, site_logo: e.target.value })}
                                    placeholder="https://..."
                                />
                                {data.branding_config.site_logo && (
                                    <div className="bg-[var(--color-bg-secondary)] p-2 rounded-lg border border-[var(--color-border)]">
                                        <img src={data.branding_config.site_logo} alt="Preview" className="h-10 object-contain max-w-[100px]" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </Surface>

                {/* Navbar JSON Section */}
                <Surface variant="primary" className="p-0 overflow-hidden shadow-xl border border-[var(--color-border)] rounded-2xl">
                    <div className="p-6 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]/30">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-[var(--color-primary)]/10 rounded-lg">
                                <Braces className="w-6 h-6 text-[var(--color-primary)]" />
                            </div>
                            <div>
                                <Typography variant="h3">Navbar Config (JSON)</Typography>
                                <Typography variant="small" className="text-[var(--color-text-muted)]">
                                    Edita la estructura de navegación y enlaces globales.
                                </Typography>
                            </div>
                        </div>
                    </div>

                    <div className="p-0">
                        <CodeMirror
                            value={jsonBuffer}
                            height="300px"
                            theme="dark"
                            extensions={[json()]}
                            className="text-base"
                            onChange={(value) => setJsonBuffer(value)}
                        />
                    </div>

                    <div className="p-6 bg-[var(--color-bg-secondary)]/20 border-t border-[var(--color-border)] flex justify-between items-center">
                        <Typography variant="small" className="text-[var(--color-text-muted)] max-w-md">
                            Asegúrate de mantener la estructura: <code>{'{ "logo_text": "...", "links": [...] }'}</code>.
                        </Typography>
                        <PrimaryButton onClick={handleUpdate} disabled={processing}>
                            <Save className="w-4 h-4 mr-2" /> Actualizar Todo
                        </PrimaryButton>
                    </div>
                </Surface>
            </div>
        </AuthenticatedLayout>
    );
}
