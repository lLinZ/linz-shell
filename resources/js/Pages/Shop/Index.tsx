import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, router } from '@inertiajs/react'; // Import router for manual visits if needed, though Link is better
import { useRealtime } from '@/Hooks/useRealtime';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    stock: number;
    image_url?: string;
}

export default function Index({ auth, products: initialProducts }: PageProps<{ products: Product[] }>) {
    // Listen for real-time updates to 'Product' model
    const { data: products } = useRealtime<Product>('Product', initialProducts);

    const addToCart = (product: Product) => {
        router.post(route('cart.add'), {
            product_id: product.id,
            quantity: 1
        }, {
            preserveScroll: true,
            onSuccess: () => {
                // specific success handling if needed, usually flash message
            }
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Shop
                </h2>
            }
        >
            <Head title="Shop" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {products.map((product) => (
                            <div key={product.id} className="overflow-hidden bg-app-card shadow-lg sm:rounded-xl border border-app-border flex flex-col transition ease-in-out hover:-translate-y-1 hover:shadow-xl duration-300 group">
                                <div className="p-6 flex-grow">
                                    <h3 className="text-lg font-bold text-white group-hover:text-app-accent transition-colors">{product.name}</h3>
                                    <p className="mt-2 text-sm text-gray-400">{product.description}</p>
                                    <div className="mt-4 flex items-center justify-between">
                                        <span className="text-xl font-bold text-white">${Number(product.price).toFixed(2)}</span>
                                        <div className={`text-sm font-medium px-2 py-1 rounded-full ${product.stock > 0 ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                                            {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-black/20 px-6 py-4 border-t border-app-border">
                                    <button
                                        onClick={() => addToCart(product)}
                                        disabled={product.stock <= 0}
                                        className="w-full flex items-center justify-center rounded-lg bg-app-accent px-4 py-2 text-black font-bold hover:bg-green-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-green-500/20"
                                    >
                                        <ShoppingCartIcon className="h-5 w-5 mr-2" />
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        ))}
                        {products.length === 0 && (
                            <div className="col-span-full text-center text-gray-500 dark:text-gray-400 py-12">
                                No products available at the moment.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
