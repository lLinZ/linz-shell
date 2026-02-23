import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, useForm, router } from '@inertiajs/react';
import { FormEventHandler, useState, useRef } from 'react';
import { Surface } from '@/Components/ui/Surface';
import { Typography } from '@/Components/ui/Typography';
import { Button } from '@/Components/ui/button';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextAreaCustom from '@/Components/TextAreaCustom';
import Checkbox from '@/Components/Checkbox';
import { Image, Upload, Trash2, Edit3, Save, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    is_active: boolean;
    image_url: string | null;
}

export default function Index({ auth, products }: PageProps<{ products: Product[] }>) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [editing, setEditing] = useState(false);

    const { data, setData, post, transform, processing, reset, errors, clearErrors } = useForm({
        id: 0,
        name: '',
        description: '',
        price: '',
        is_active: true,
        image: null as File | null,
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('image', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (editing) {
            // Official Laravel Method Spoofing: Use POST with _method: 'PUT' for file uploads
            transform((data) => ({
                ...data,
                _method: 'PUT',
            }));

            post(route('admin.products.update', data.id), {
                forceFormData: true,
                onSuccess: () => {
                    reset();
                    setEditing(false);
                    setImagePreview(null);
                }
            });
        } else {
            // Ensure no spoofing is active for clear creation
            transform((data) => ({
                ...data,
                _method: undefined,
            }));

            post(route('admin.products.store'), {
                forceFormData: true,
                onSuccess: () => {
                    reset();
                    setImagePreview(null);
                }
            });
        }
    };

    const editProduct = (product: Product) => {
        clearErrors();
        setEditing(true);
        setData({
            id: product.id,
            name: product.name,
            description: product.description || '',
            price: product.price.toString(),
            is_active: !!product.is_active,
            image: null,
        });
        setImagePreview(product.image_url);
    };

    const cancelEdit = () => {
        setEditing(false);
        reset();
        setImagePreview(null);
        clearErrors();
    };

    const deleteProduct = (id: number) => {
        if (confirm('¿Estás seguro de eliminar este producto?')) {
            router.delete(route('admin.products.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <Typography variant="h2">Administración de Productos</Typography>
                </div>
            }
        >
            <Head title="Productos" />

            <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Formulario */}
                    <div className="lg:col-span-1">
                        <Surface variant="primary" className="p-6 h-fit sticky top-24">
                            <Typography variant="h3" className="mb-6">
                                {editing ? 'Editar Producto' : 'Nuevo Producto'}
                            </Typography>

                            <form onSubmit={submit} className="space-y-6">
                                {/* Image Upload Area */}
                                <div>
                                    <InputLabel value="Imagen del Producto" />
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        onChange={handleImageChange}
                                        accept="image/*"
                                    />
                                    <Surface
                                        variant="secondary"
                                        className="mt-2 border-2 border-dashed border-[var(--color-border)] p-4 rounded-xl cursor-pointer hover:border-[var(--color-primary)] transition-all overflow-hidden relative group"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        {imagePreview ? (
                                            <div className="relative aspect-square rounded-lg overflow-hidden">
                                                <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                    <Upload className="text-white w-8 h-8" />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-8 text-[var(--color-text-muted)]">
                                                <Image className="w-12 h-12 mb-2 opacity-20" />
                                                <Typography variant="small">Haga clic para subir</Typography>
                                            </div>
                                        )}
                                    </Surface>
                                    {errors.image && <Typography variant="small" className="text-red-500 mt-1">{errors.image}</Typography>}
                                </div>

                                <div>
                                    <InputLabel value="Nombre" />
                                    <TextInput
                                        className="mt-1 block w-full"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                    />
                                    {errors.name && <Typography variant="small" className="text-red-500 mt-1">{errors.name}</Typography>}
                                </div>

                                <div>
                                    <InputLabel value="Precio (USD)" />
                                    <TextInput
                                        type="number"
                                        step="0.01"
                                        className="mt-1 block w-full"
                                        value={data.price}
                                        onChange={(e) => setData('price', e.target.value)}
                                        required
                                    />
                                    {errors.price && <Typography variant="small" className="text-red-500 mt-1">{errors.price}</Typography>}
                                </div>

                                <div>
                                    <InputLabel value="Descripción" />
                                    <TextAreaCustom
                                        className="mt-1 block w-full text-sm"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={3}
                                    />
                                </div>

                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                    />
                                    <InputLabel value="Producto Activo" className="mb-0" />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    {editing && (
                                        <SecondaryButton type="button" onClick={cancelEdit} className="flex-1">
                                            Cancelar
                                        </SecondaryButton>
                                    )}
                                    <PrimaryButton className="flex-1 justify-center" disabled={processing}>
                                        <Save className="w-4 h-4 mr-2" />
                                        {editing ? 'Actualizar' : 'Crear'}
                                    </PrimaryButton>
                                </div>
                            </form>
                        </Surface>
                    </div>

                    {/* Lista */}
                    <div className="lg:col-span-2">
                        <Surface variant="primary" border className="overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)]">
                                    <tr>
                                        <th className="p-4"><Typography variant="small" className="font-bold uppercase text-[var(--color-text-secondary)]">Imagen</Typography></th>
                                        <th className="p-4"><Typography variant="small" className="font-bold uppercase text-[var(--color-text-secondary)]">Producto</Typography></th>
                                        <th className="p-4"><Typography variant="small" className="font-bold uppercase text-[var(--color-text-secondary)] text-right">Precio</Typography></th>
                                        <th className="p-4"><Typography variant="small" className="font-bold uppercase text-[var(--color-text-secondary)] text-center">Estado</Typography></th>
                                        <th className="p-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--color-border)]">
                                    {products.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="p-12 text-center text-[var(--color-text-muted)]">
                                                No hay productos registrados.
                                            </td>
                                        </tr>
                                    )}
                                    {products.map((product) => (
                                        <tr key={product.id} className="hover:bg-[var(--color-surface)] transition-colors group">
                                            <td className="p-4">
                                                <div className="w-12 h-12 rounded-lg overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
                                                    {product.image_url ? (
                                                        <img src={product.image_url} className="w-full h-full object-cover" alt={product.name} />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Image className="w-4 h-4 opacity-20" />
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <Typography variant="p" className="font-bold leading-tight">{product.name}</Typography>
                                                <Typography variant="small" className="text-[var(--color-text-muted)] line-clamp-1">{product.description}</Typography>
                                            </td>
                                            <td className="p-4 text-right">
                                                <Typography variant="p" className="font-bold text-[var(--color-primary)]">
                                                    ${Number(product.price).toFixed(2)}
                                                </Typography>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className={cn(
                                                    "inline-flex rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider",
                                                    product.is_active ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                                                )}>
                                                    {product.is_active ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button variant="ghost" size="none" onClick={() => editProduct(product)} className="p-2 hover:bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                                                        <Edit3 className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="none" onClick={() => deleteProduct(product.id)} className="p-2 hover:bg-red-500/10 text-red-500">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </Surface>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
