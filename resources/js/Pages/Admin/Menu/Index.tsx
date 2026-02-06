import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import BackButton from '@/Components/BackButton';
import TextFieldCustom from '@/Components/TextFieldCustom';
import SelectCustom from '@/Components/SelectCustom';
import ButtonCustom from '@/Components/ButtonCustom';

interface MenuItem {
    id: number;
    label: string;
    route?: string;
    url?: string;
    icon?: string;
    roles?: string[];
    module_slug?: string;
    order: number;
    parent_id?: number | null;
    children?: MenuItem[];
}

export default function Index({ auth, menuItems }: PageProps<{ menuItems: MenuItem[] }>) {
    const { data, setData, post, put, delete: destroy, processing, reset, errors } = useForm({
        id: 0,
        label: '',
        route: '',
        url: '',
        icon: '',
        roles: [] as string[],
        module_slug: '',
        order: 0,
        parent_id: '' as string | number, // Form handles as string mostly
    });

    const [editing, setEditing] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        // Clean up empty strings
        const payload: any = { ...data };
        if (!payload.parent_id) delete payload.parent_id;
        if (!payload.route) delete payload.route;
        if (!payload.url) delete payload.url;
        if (!payload.module_slug) delete payload.module_slug;

        if (editing) {
            put(route('admin.menus.update', data.id), {
                onSuccess: () => {
                    reset();
                    setEditing(false);
                }
            });
        } else {
            post(route('admin.menus.store'), {
                onSuccess: () => reset()
            });
        }
    };

    const editItem = (item: MenuItem) => {
        setEditing(true);
        setData({
            id: item.id,
            label: item.label,
            route: item.route || '',
            url: item.url || '',
            icon: item.icon || '',
            roles: item.roles || [],
            module_slug: item.module_slug || '',
            order: item.order,
            parent_id: item.parent_id || '',
        });
    };

    const cancelEdit = () => {
        setEditing(false);
        reset();
    };

    const deleteItem = (id: number) => {
        if (confirm('Are you sure you want to delete this menu item?')) {
            destroy(route('admin.menus.destroy', id));
        }
    };

    // Flatten menu items for parent selection (simple version)
    const flattenItems = (items: MenuItem[]): MenuItem[] => {
        let flat: MenuItem[] = [];
        items.forEach(item => {
            flat.push(item);
            if (item.children) {
                flat = [...flat, ...flattenItems(item.children)];
            }
        });
        return flat;
    };
    const allItems = flattenItems(menuItems);


    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Menu Management
                </h2>
            }
        >
            <Head title="Menus" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <BackButton href={route('dashboard')} label="Back to Dashboard" />

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        {/* Form Section */}
                        <div className="md:col-span-1">
                            <div className="bg-white p-6 shadow-sm sm:rounded-lg dark:bg-app-card">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                                    {editing ? 'Edit Menu Item' : 'Add New Item'}
                                </h3>
                                <form onSubmit={submit}>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-app-text/70">Label</label>
                                        <TextFieldCustom
                                            type="text"
                                            value={data.label}
                                            onChange={(e) => setData('label', e.target.value)}
                                            className="mt-1 block w-full"
                                            required
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-app-text/70">Route (Optional)</label>
                                        <TextFieldCustom
                                            type="text"
                                            value={data.route}
                                            onChange={(e) => setData('route', e.target.value)}
                                            className="mt-1 block w-full"
                                            placeholder="e.g. dashboard"
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-app-text/70">URL (Optional)</label>
                                        <TextFieldCustom
                                            type="text"
                                            value={data.url}
                                            onChange={(e) => setData('url', e.target.value)}
                                            className="mt-1 block w-full"
                                            placeholder="e.g. /custom-link"
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-app-text/70">Roles</label>
                                        <SelectCustom
                                            multiple
                                            value={data.roles}
                                            onChange={(e) => setData('roles', Array.from((e.target as HTMLSelectElement).selectedOptions, option => option.value))}
                                            className="mt-1 block w-full"
                                        >
                                            <option value="admin">Admin</option>
                                            <option value="user">User</option>
                                        </SelectCustom>
                                        <p className="text-xs text-app-text/40 mt-1">Hold Ctrl/Cmd to select multiple.</p>
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-app-text/70">Parent Item</label>
                                        <SelectCustom
                                            value={data.parent_id}
                                            onChange={(e) => setData('parent_id', e.target.value)}
                                            className="mt-1 block w-full"
                                        >
                                            <option value="">None (Top Level)</option>
                                            {allItems.map(item => (
                                                <option key={item.id} value={item.id}>{item.label}</option>
                                            ))}
                                        </SelectCustom>
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-app-text/70">Order</label>
                                        <TextFieldCustom
                                            type="number"
                                            value={data.order}
                                            onChange={(e) => setData('order', parseInt(e.target.value))}
                                            className="mt-1 block w-full"
                                        />
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
                            <div className="bg-white p-6 shadow-sm sm:rounded-lg dark:bg-app-card">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Menu Structure</h3>
                                <div className="space-y-2">
                                    {menuItems.map(item => (
                                        <div key={item.id} className="border rounded p-3 bg-gray-50 dark:bg-app-background dark:border-app-border">
                                            <div className="flex justify-between items-center">
                                                <div className="font-semibold text-gray-800 dark:text-gray-200">
                                                    {item.label}
                                                    <span className="text-xs font-normal text-gray-500 ml-2">
                                                        ({item.route || item.url})
                                                    </span>
                                                </div>
                                                <div>
                                                    <button onClick={() => editItem(item)} className="text-app-accent hover:text-app-accent-hover transition-colors text-sm mr-2 font-bold uppercase">Edit</button>
                                                    <button onClick={() => deleteItem(item.id)} className="text-red-500 hover:text-red-400 transition-colors text-sm font-bold uppercase">Delete</button>
                                                </div>
                                            </div>
                                            {/* Children */}
                                            {item.children && item.children.length > 0 && (
                                                <div className="ml-6 mt-2 space-y-2 pl-2 border-l-2 border-gray-300 dark:border-app-border">
                                                    {item.children.map(child => (
                                                        <div key={child.id} className="flex justify-between items-center text-sm">
                                                            <div className="text-gray-700 dark:text-gray-300">
                                                                {child.label}
                                                                <span className="text-xs text-gray-500 ml-2">
                                                                    ({child.route || child.url})
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <button onClick={() => editItem(child)} className="text-app-accent hover:text-app-accent-hover transition-colors text-xs mr-2 font-bold uppercase">Edit</button>
                                                                <button onClick={() => deleteItem(child.id)} className="text-red-500 hover:text-red-400 transition-colors text-xs font-bold uppercase">Delete</button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
