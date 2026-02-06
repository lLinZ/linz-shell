import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import BackButton from '@/Components/BackButton';
import TextFieldCustom from '@/Components/TextFieldCustom';
import TextAreaCustom from '@/Components/TextAreaCustom';
import Checkbox from '@/Components/Checkbox';
import ButtonCustom from '@/Components/ButtonCustom';

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    is_active: boolean;
}

export default function Index({ auth, products }: PageProps<{ products: Product[] }>) {
    const { data, setData, post, put, delete: destroy, processing, reset, errors } = useForm({
        id: 0,
        name: '',
        description: '',
        price: '',
        is_active: true,
    });

    const [editing, setEditing] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (editing) {
            put(route('admin.products.update', data.id), {
                onSuccess: () => {
                    reset();
                    setEditing(false);
                }
            });
        } else {
            post(route('admin.products.store'), {
                onSuccess: () => reset()
            });
        }
    };

    const editProduct = (product: Product) => {
        setEditing(true);
        setData({
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price.toString(),
            is_active: product.is_active,
        });
    };

    const cancelEdit = () => {
        setEditing(false);
        reset();
    };

    const deleteProduct = (id: number) => {
        if (confirm('Are you sure you want to delete this product?')) {
            destroy(route('admin.products.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-white">
                    Product Management
                </h2>
            }
        >
            <Head title="Products" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <BackButton href={route('dashboard')} label="Back to Dashboard" />
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        {/* Form Section */}
                        <div className="md:col-span-1">
                            <div className="bg-app-card p-6 shadow-lg sm:rounded-xl border border-app-border">
                                <h3 className="text-lg font-bold text-white mb-4">
                                    {editing ? 'Edit Product' : 'Add New Product'}
                                </h3>
                                <form onSubmit={submit}>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-app-text/70">Name</label>
                                        <TextFieldCustom
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className="mt-1 block w-full"
                                            required
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-app-text/70">Description</label>
                                        <TextAreaCustom
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            className="mt-1 block w-full"
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-app-text/70">Price</label>
                                        <TextFieldCustom
                                            type="number"
                                            step="0.01"
                                            value={data.price}
                                            onChange={(e) => setData('price', e.target.value)}
                                            className="mt-1 block w-full"
                                            required
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="flex items-center">
                                            <Checkbox
                                                checked={data.is_active}
                                                onChange={(e) => setData('is_active', e.target.checked)}
                                            />
                                            <span className="ml-2 text-sm text-app-text/70">Active</span>
                                        </label>
                                    </div>
                                    <div className="flex items-center justify-end">
                                        {editing && (
                                            <button
                                                type="button"
                                                onClick={cancelEdit}
                                                className="mr-3 text-sm text-app-text/50 underline hover:text-white transition"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                        <ButtonCustom
                                            type="submit"
                                            disabled={processing}
                                        >
                                            {editing ? 'Update' : 'Create'}
                                        </ButtonCustom>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* List Section */}
                        <div className="md:col-span-2">
                            <div className="bg-app-card p-6 shadow-lg sm:rounded-xl border border-app-border text-app-text">
                                <table className="min-w-full divide-y divide-app-border">
                                    <thead>
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Price</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-app-border">
                                        {products.map((product) => (
                                            <tr key={product.id} className="hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4 text-sm font-medium text-white">
                                                    <div>{product.name}</div>
                                                    <div className="text-xs text-gray-500">{product.description}</div>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">${Number(product.price).toFixed(2)}</td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${product.is_active ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                                                        {product.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                                                    <button
                                                        onClick={() => editProduct(product)}
                                                        className="mr-3 text-app-accent hover:text-app-accent-hover transition-colors"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => deleteProduct(product.id)}
                                                        className="text-red-500 hover:text-red-400 transition-colors"
                                                    >
                                                        Delete
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
            </div>
        </AuthenticatedLayout>
    );
}
