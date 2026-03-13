import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ButtonCustom from '@/Components/ButtonCustom';
import { PageProps } from '@/types';
import { Head, Link, useForm, router } from '@inertiajs/react';
import React, { useState } from 'react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';

interface CartItem {
    id: number;
    product_id: number;
    quantity: number;
    price: number;
    product: {
        title: string;
        description: string;
        image_url?: string;
    };
}

interface Cart {
    id: number;
    user_id: number | null;
    session_id: string | null;
    status: string;
    items: CartItem[];
}

export default function Index({ auth, cart }: PageProps<{ cart: Cart }>) {
    const total = cart.items.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        customer_name: auth.user?.name || '',
        customer_email: auth.user?.email || '',
        customer_phone: '',
    });

    const submitCheckout = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('cart.checkout'), {
            onSuccess: () => {
                setIsCheckoutModalOpen(false);
                reset();
                // success message is handled by flash
            }
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Shopping Cart
                </h2>
            }
        >
            <Head title="Shopping Cart" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-white p-6 shadow-sm sm:rounded-lg dark:bg-app-card">
                        {cart.items.length === 0 ? (
                            <div className="text-center">
                                <p className="text-gray-500 dark:text-gray-400">Your cart is empty.</p>
                                <Link
                                    href="/shop"
                                    className="mt-4 inline-block text-[var(--color-primary)] hover:opacity-80 transition-opacity font-medium"
                                >
                                    Continue Shopping
                                </Link>
                            </div>
                        ) : (
                            <>
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead>
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Product</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Quantity</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Price</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {cart.items.map((item) => (
                                            <tr key={item.id}>
                                                <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {item.product?.title || 'Producto Eliminado'}
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">{item.product?.description}</div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{item.quantity}</td>
                                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">${Number(item.price).toFixed(2)}</td>
                                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">${(Number(item.price) * item.quantity).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="mt-8 flex justify-end">
                                    <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                        Total: ${total.toFixed(2)}
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-end gap-4">
                                    <Link href="/shop" className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                        Volver a Tienda
                                    </Link>
                                    <button
                                        className="px-8 py-2 bg-[var(--color-primary)] text-white font-bold rounded-lg hover:opacity-90 shadow-lg shadow-[var(--color-primary)]/30 transition-all"
                                        onClick={() => setIsCheckoutModalOpen(true)}
                                    >
                                        Proceed to Checkout
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <Modal show={isCheckoutModalOpen} onClose={() => setIsCheckoutModalOpen(false)}>
                <form onSubmit={submitCheckout} className="p-6 space-y-6">
                    <div>
                        <h2 className="text-xl font-black mb-2 tracking-tight">Detalles de tu Orden</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Por favor, ingresa tus datos para procesar la orden. Luego serás contactado.</p>
                    </div>

                    <div>
                        <InputLabel htmlFor="customer_name" value="Nombre Completo" />
                        <TextInput
                            id="customer_name"
                            className="mt-1 block w-full bg-[var(--color-bg-primary)] border-[var(--color-border)] text-[var(--color-text-primary)]"
                            value={data.customer_name}
                            onChange={(e: any) => setData('customer_name', e.target.value)}
                            required
                        />
                        <InputError message={errors.customer_name} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="customer_email" value="Correo Electrónico" />
                        <TextInput
                            id="customer_email"
                            type="email"
                            className="mt-1 block w-full bg-[var(--color-bg-primary)] border-[var(--color-border)] text-[var(--color-text-primary)]"
                            value={data.customer_email}
                            onChange={(e: any) => setData('customer_email', e.target.value)}
                            required
                        />
                        <InputError message={errors.customer_email} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="customer_phone" value="Teléfono (WhatsApp)" />
                        <TextInput
                            id="customer_phone"
                            type="text"
                            placeholder="+1234567890"
                            className="mt-1 block w-full bg-[var(--color-bg-primary)] border-[var(--color-border)] text-[var(--color-text-primary)]"
                            value={data.customer_phone}
                            onChange={(e: any) => setData('customer_phone', e.target.value)}
                            required
                        />
                        <InputError message={errors.customer_phone} className="mt-2" />
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setIsCheckoutModalOpen(false)}
                            className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className={`px-6 py-2 bg-[var(--color-primary)] text-white font-bold rounded-lg hover:opacity-90 transition-opacity ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            Completar Orden
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
