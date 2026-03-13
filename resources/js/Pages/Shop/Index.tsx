import React from 'react';
import PublicLayout from '@/Layouts/PublicLayout';
import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Surface } from '@/Components/ui/Surface';
import { Typography } from '@/Components/ui/Typography';
import { Button } from '@/Components/ui/button';
import { ShoppingCart, Eye, Sparkles, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/Stores/useCartStore';
import { Search, Filter, SlidersHorizontal, ChevronDown, Tag, Hash, ArrowDown, X } from 'lucide-react';
import { router } from '@inertiajs/react';
import { useInView } from 'react-intersection-observer';
import { cn } from '@/lib/utils';
import TextFieldCustom from '@/Components/TextFieldCustom';
import SelectCustom from '@/Components/SelectCustom';

interface Product {
    id: number;
    name: string;
    slug: string;
    description: string;
    price: number | string;
    stock: number;
    image_url: string;
    category?: string;
    tags?: string[];
}

interface PaginationData {
    data: Product[];
    next_page_url: string | null;
    current_page: number;
}

export default function Index({ auth, products, categories, filters = {} }: PageProps<{
    products: PaginationData,
    categories: string[],
    filters: any
}>) {
    // Robust data checks
    const initialProductsList = products?.data || [];
    const safeFilters = filters || {};

    const [productsList, setProductsList] = React.useState<Product[]>(initialProductsList);
    const [isLoadingMore, setIsLoadingMore] = React.useState(false);
    const [showFilters, setShowFilters] = React.useState(false);

    // Filtering State with defensive defaults
    const [search, setSearch] = React.useState(safeFilters.search || '');
    const [selectedCategory, setSelectedCategory] = React.useState(safeFilters.category || '');
    const [minPrice, setMinPrice] = React.useState(safeFilters.min_price || '');
    const [maxPrice, setMaxPrice] = React.useState(safeFilters.max_price || '');
    // Crucial: check type of sort to avoid executing Array.prototype.sort if filters is an array
    const [selectedSort, setSelectedSort] = React.useState(typeof safeFilters.sort === 'string' ? safeFilters.sort : 'newest');

    const addItem = useCartStore((state: any) => state.addItem);
    const { ref: loadMoreRef, inView } = useInView({ threshold: 0.1 });

    // Handle Infinite Scroll
    React.useEffect(() => {
        if (inView && products.next_page_url && !isLoadingMore) {
            loadMore();
        }
    }, [inView, products.next_page_url, isLoadingMore]);

    // Update list when products change (e.g., initial load or search)
    React.useEffect(() => {
        if (!products || !products.data) return;

        if (products.current_page === 1) {
            setProductsList(products.data);
        } else {
            setProductsList(prev => {
                const existingIds = new Set(prev.map(p => p.id));
                const newItems = products.data.filter(p => !existingIds.has(p.id));
                return [...prev, ...newItems];
            });
        }
    }, [products]);

    const loadMore = () => {
        setIsLoadingMore(true);
        router.get(products.next_page_url!, {}, {
            preserveState: true,
            preserveScroll: true,
            only: ['products'],
            onFinish: () => setIsLoadingMore(false)
        });
    };

    const applyFilters = () => {
        router.get(route('shop.index'), {
            search,
            category: selectedCategory,
            min_price: minPrice,
            max_price: maxPrice,
            sort: selectedSort
        }, {
            preserveState: true,
            replace: true
        });
    };

    const formatPrice = (price: string | number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(Number(price));
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    } as any;

    const cardVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: "spring", stiffness: 100, damping: 15 }
        }
    } as any;

    return (
        <PublicLayout title="Nuestra Colección - Linz Premium">
            <Head title="Nuestra Colección - Linz Premium" />

            <div className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-20 text-center"
                >
                    <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 mb-4 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 text-[var(--color-primary)] text-[10px] font-black uppercase tracking-[0.2em]">
                        <Sparkles className="w-3 h-3" />
                        Linz Exclusive Store
                    </div>
                    <Typography variant="h2" className="text-5xl md:text-7xl font-black tracking-tighter leading-none mb-6">
                        Nuestra Colección
                    </Typography>
                    <Typography variant="p" className="text-[var(--color-text-muted)] text-lg font-medium max-w-2xl mx-auto italic">
                        Piezas seleccionadas con los más altos estándares de calidad y diseño ejecutivo.
                    </Typography>
                </motion.div>

                {/* Filters Section */}
                <div className="mb-12">
                    <Surface variant="tertiary" rounding="3xl" shadow="xl" border className="p-4 sm:p-6">
                        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                            <div className="relative w-full lg:w-96 group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)] group-focus-within:text-[var(--color-primary)] transition-colors z-10" />
                                <TextFieldCustom
                                    placeholder="Buscar producto..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                                    className="w-full h-12 bg-[var(--color-bg-tertiary)] border-[var(--color-border)] focus:border-[var(--color-primary)]/50 rounded-2xl pl-12 pr-10 text-sm transition-all"
                                />
                                {search && (
                                    <button
                                        onClick={() => { setSearch(''); router.get(route('shop.index')); }}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors z-10"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-3 w-full lg:w-auto justify-end">
                                <Button
                                    variant="outline"
                                    rounding="2xl"
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={cn(
                                        "h-12 px-6",
                                        showFilters ? "bg-[var(--color-primary)]/10 border-[var(--color-primary)] text-[var(--color-primary)]" : ""
                                    )}
                                >
                                    <SlidersHorizontal className="w-4 h-4" />
                                    Filtros Avanzados
                                </Button>

                                <Button
                                    variant="premium"
                                    rounding="2xl"
                                    onClick={applyFilters}
                                    className="h-12 px-8 uppercase tracking-widest text-[10px]"
                                >
                                    Explorar
                                </Button>
                            </div>
                        </div>

                        <AnimatePresence>
                            {showFilters && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="pt-8 mt-6 border-t border-[var(--color-border)]/50 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                        <div className="space-y-3">
                                            <Typography variant="small" className="font-black uppercase tracking-widest opacity-40 text-[9px] ml-1">Categoría</Typography>
                                            <div className="relative group">
                                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)] pointer-events-none z-10" />
                                                <SelectCustom
                                                    value={selectedCategory}
                                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                                    className="w-full h-12 bg-[var(--color-bg-tertiary)] border-[var(--color-border)] rounded-2xl px-4 text-sm appearance-none cursor-pointer focus:border-[var(--color-primary)]/50"
                                                >
                                                    <option value="">Todas las categorías</option>
                                                    {categories.map((cat) => (
                                                        <option key={cat} value={cat}>{cat}</option>
                                                    ))}
                                                </SelectCustom>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <Typography variant="small" className="font-black uppercase tracking-widest opacity-40 text-[9px] ml-1">Rango de Precio</Typography>
                                            <div className="flex gap-2">
                                                <TextFieldCustom
                                                    type="number"
                                                    placeholder="Min"
                                                    value={minPrice}
                                                    onChange={(e) => setMinPrice(e.target.value)}
                                                    className="w-full h-12 bg-[var(--color-bg-tertiary)] border-[var(--color-border)] rounded-2xl px-4 text-sm focus:border-[var(--color-primary)]/50"
                                                />
                                                <TextFieldCustom
                                                    type="number"
                                                    placeholder="Max"
                                                    value={maxPrice}
                                                    onChange={(e) => setMaxPrice(e.target.value)}
                                                    className="w-full h-12 bg-[var(--color-bg-tertiary)] border-[var(--color-border)] rounded-2xl px-4 text-sm focus:border-[var(--color-primary)]/50"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <Typography variant="small" className="font-black uppercase tracking-widest opacity-40 text-[9px] ml-1">Ordenar por</Typography>
                                            <div className="relative group">
                                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)] pointer-events-none z-10" />
                                                <SelectCustom
                                                    value={selectedSort}
                                                    onChange={(e) => setSelectedSort(e.target.value)}
                                                    className="w-full h-12 bg-[var(--color-bg-tertiary)] border-[var(--color-border)] rounded-2xl px-4 text-sm appearance-none cursor-pointer focus:border-[var(--color-primary)]/50"
                                                >
                                                    <option value="newest">Lo más nuevo</option>
                                                    <option value="price_low">Precio: Menor a Mayor</option>
                                                    <option value="price_high">Precio: Mayor a Menor</option>
                                                </SelectCustom>
                                            </div>
                                        </div>

                                        <div className="flex flex-col justify-end pb-1">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                rounding="xl"
                                                onClick={() => {
                                                    setSearch('');
                                                    setSelectedCategory('');
                                                    setMinPrice('');
                                                    setMaxPrice('');
                                                    setSelectedSort('newest');
                                                }}
                                                className="w-full opacity-60 hover:opacity-100"
                                            >
                                                Limpiar Filtros
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Surface>
                </div>

                {productsList.length === 0 ? (
                    <Surface variant="secondary" className="p-20 text-center rounded-[3rem] border border-dashed border-[var(--color-border)] bg-[var(--color-bg-tertiary)]/30 backdrop-blur-sm">
                        <TrendingUp className="w-12 h-12 mx-auto mb-4 text-[var(--color-text-muted)] opacity-20" />
                        <Typography variant="h4" className="text-xl font-bold opacity-40">
                            {search ? 'No encontramos lo que buscas...' : 'Preparando la nueva colección...'}
                        </Typography>
                        {search && (
                            <Typography variant="small" className="text-[var(--color-text-muted)] mt-2 font-bold uppercase tracking-widest opacity-30">
                                Intenta con otros términos de búsqueda
                            </Typography>
                        )}
                    </Surface>
                ) : (
                    <>
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12"
                        >
                            {productsList.map((product: any) => (
                                <motion.div key={product.id} variants={cardVariants}>
                                    <Surface
                                        variant="secondary"
                                        rounding="3xl"
                                        interactive
                                        className="group relative h-full flex flex-col overflow-hidden"
                                    >
                                        {/* Product Visual Area */}
                                        <div className="p-3">
                                            <div className="aspect-[4/5] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800/50 relative rounded-[2rem] shadow-inner">
                                                <Link href={route('shop.product', product.slug)}>
                                                    <img
                                                        src={product.image_url}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                                                    />
                                                </Link>

                                                {/* Badge Logic */}
                                                <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                                                    {product.category && (
                                                        <div className="px-3 py-1.5 glass bg-[var(--color-primary)]/80 backdrop-blur-md rounded-xl text-white text-[8px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1.5">
                                                            <Tag className="w-2.5 h-2.5" />
                                                            {product.category}
                                                        </div>
                                                    )}
                                                    {product.stock <= 5 && product.stock > 0 && (
                                                        <div className="px-2 py-1 glass bg-orange-500/80 backdrop-blur-md rounded-lg text-white text-[7px] font-black uppercase tracking-wider shadow-lg animate-pulse">
                                                            Escaso
                                                        </div>
                                                    )}
                                                    {product.stock <= 0 && (
                                                        <div className="px-2 py-1 glass bg-zinc-800/90 backdrop-blur-md rounded-lg text-white text-[7px] font-black uppercase tracking-wider shadow-lg">
                                                            Agotado
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Action Overlay */}
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 backdrop-blur-[2px]">
                                                    <Button
                                                        asChild
                                                        variant="secondary"
                                                        size="icon-sm"
                                                        rounding="full"
                                                        animation="float-up"
                                                        className="bg-white text-black hover:bg-[var(--color-primary)] hover:text-white delay-75"
                                                    >
                                                        <Link href={route('shop.product', product.slug)}>
                                                            <Eye className="w-4 h-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); addItem(product); }}
                                                        disabled={product.stock <= 0}
                                                        size="icon-sm"
                                                        rounding="full"
                                                        animation="float-up"
                                                    >
                                                        <ShoppingCart className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Info Section */}
                                        <div className="p-7 pt-2 flex-1 flex flex-col bg-gradient-to-b from-transparent to-[var(--color-bg-secondary)]/20">
                                            <div className="flex-1">
                                                <div className="flex flex-wrap gap-1 mb-3">
                                                    {product.tags?.slice(0, 3).map((tag: string) => (
                                                        <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--color-primary)]/5 text-[var(--color-primary)] text-[7px] font-black uppercase tracking-widest border border-[var(--color-primary)]/10">
                                                            <Hash className="w-1.5 h-1.5" />
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                                <div className="flex justify-between items-start mb-2">
                                                    <Link href={route('shop.product', product.slug)}>
                                                        <Typography variant="h4" className="text-xl font-black tracking-tight leading-tight group-hover:text-[var(--color-primary)] transition-colors line-clamp-2">
                                                            {product.name}
                                                        </Typography>
                                                    </Link>
                                                </div>
                                                <Typography variant="small" className="text-[var(--color-text-muted)] line-clamp-2 mb-6 font-medium leading-relaxed italic opacity-80 uppercase text-[9px] tracking-widest">
                                                    {product.description}
                                                </Typography>
                                            </div>

                                            <div className="mt-auto pt-6 border-t border-[var(--color-border)]/50">
                                                <div className="flex justify-between items-end">
                                                    <div className="flex flex-col">
                                                        <span className="text-[8px] font-black uppercase tracking-widest text-[var(--color-text-muted)] mb-1">Precio Unitario</span>
                                                        <Typography className="text-3xl font-black tracking-tighter text-[var(--color-text-primary)]">
                                                            {formatPrice(product.price)}
                                                        </Typography>
                                                    </div>

                                                    <Button
                                                        variant="premium"
                                                        size="sm"
                                                        rounding="2xl"
                                                        glow
                                                        className="px-6 h-10 tracking-widest text-[9px]"
                                                        disabled={product.stock <= 0}
                                                        onClick={() => addItem(product)}
                                                    >
                                                        Comprar
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </Surface>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* Sentinela Scroll Infinito */}
                        <div ref={loadMoreRef} className="pt-20 flex flex-col items-center justify-center gap-4">
                            {products.next_page_url ? (
                                <>
                                    <div className="w-8 h-8 rounded-full border-2 border-t-[var(--color-primary)] border-transparent animate-spin" />
                                    <Typography variant="small" className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">Cargando más tesoros...</Typography>
                                </>
                            ) : productsList.length > 0 ? (
                                <div className="flex flex-col items-center opacity-20">
                                    <ArrowDown className="w-6 h-6 mb-2 rotate-180" />
                                    <Typography variant="small" className="text-[10px] font-bold uppercase tracking-[0.2em]">Has llegado al final de la colección</Typography>
                                </div>
                            ) : null}
                        </div>
                    </>
                )}
            </div>
        </PublicLayout>
    );
}
