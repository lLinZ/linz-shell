import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ButtonCustom from '@/Components/ButtonCustom';
import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';

interface CartItem {
    id: number;
    product_id: number;
    quantity: number;
    price: number;
    product: {
        name: string;
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
                                    href="/"
                                    className="mt-4 inline-block text-app-accent hover:text-app-accent-hover transition-colors font-medium"
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
                                                    {item.product.name}
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">{item.product.description}</div>
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
                                <div className="mt-4 flex justify-end">
                                    <ButtonCustom
                                        className="px-8"
                                    >
                                        Proceed to Checkout
                                    </ButtonCustom>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
