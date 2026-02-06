import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useRealtime } from '@/Hooks/useRealtime';
import BackButton from '@/Components/BackButton';
import { useState } from 'react';

interface Product {
    id: number;
    name: string;
    stock: number;
    price: number;
}

export default function Index({ auth, products: initialProducts }: PageProps<{ products: Product[] }>) {
    // Listen for real-time updates to 'Product' model
    const { data: products } = useRealtime<Product>('Product', initialProducts);

    const updateStock = (product: Product, newStock: number) => {
        if (newStock < 0) return;

        router.patch(route('admin.inventory.update', product.id), {
            stock: newStock
        }, {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-white">
                    Inventory Management
                </h2>
            }
        >
            <Head title="Inventory" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <BackButton href={route('dashboard')} label="Back to Dashboard" />

                    <div className="bg-app-card overflow-hidden shadow-lg sm:rounded-xl border border-app-border mt-4">
                        <div className="p-6 text-app-text">
                            <table className="min-w-full divide-y divide-app-border">
                                <thead>
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Product</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Current Stock</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-app-border">
                                    {products.map((product) => (
                                        <tr key={product.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                                                {product.name}
                                                <div className="text-xs text-gray-500">${Number(product.price).toFixed(2)}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                <div className={`font-bold inline-flex px-2 py-0.5 rounded ${product.stock < 10 ? 'bg-red-900/50 text-red-400' : 'bg-green-900/50 text-green-400'}`}>
                                                    {product.stock} Units
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => updateStock(product, product.stock - 1)}
                                                        className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600 text-white transition"
                                                    >
                                                        -
                                                    </button>
                                                    <input
                                                        type="number"
                                                        className="w-20 rounded bg-black/30 border-app-border text-white text-center focus:border-app-accent focus:ring-app-accent"
                                                        value={product.stock}
                                                        onChange={(e) => updateStock(product, parseInt(e.target.value) || 0)}
                                                    />
                                                    <button
                                                        onClick={() => updateStock(product, product.stock + 1)}
                                                        className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600 text-white transition"
                                                    >
                                                        +
                                                    </button>
                                                </div>
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
