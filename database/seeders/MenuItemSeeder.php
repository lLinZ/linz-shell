<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\MenuItem;

class MenuItemSeeder extends Seeder
{
    public function run(): void
    {
        // Admin Links
        MenuItem::updateOrCreate(['label' => 'Dashboard'], [
            'route' => 'dashboard',
            'order' => 10,
            'roles' => ['admin', 'master', 'user'],
            'icon' => 'HomeIcon'
        ]);

        MenuItem::updateOrCreate(['label' => 'Chat'], [
            'route' => 'chat.index',
            'order' => 20,
            'roles' => ['admin', 'master', 'user'],
            'module_slug' => 'chat',
            'icon' => 'ChatBubbleLeftRightIcon'
        ]);

        MenuItem::updateOrCreate(['label' => 'Shop'], [
            'route' => 'shop.index', // Now points to the real Shop Catalog
            'url' => '/shop',
            'order' => 30,
            'roles' => ['admin', 'master', 'user'],
            'module_slug' => 'shopping-cart',
            'icon' => 'ShoppingCartIcon'
        ]);


        // Admin Only Links - Grouped under "Administration"
        $adminParent = MenuItem::updateOrCreate(['label' => 'Administration'], [
            'order' => 90,
            'roles' => ['admin', 'master'],
            'icon' => 'Cog6ToothIcon'
        ]);

        MenuItem::updateOrCreate(['label' => 'Modules'], [
            'route' => 'admin.modules.index',
            'parent_id' => $adminParent->id,
            'order' => 10,
            'roles' => ['master'],
        ]);

        MenuItem::updateOrCreate(['label' => 'Gestión de Páginas'], [
            'route' => 'admin.pages.index',
            'parent_id' => $adminParent->id,
            'order' => 20,
            'roles' => ['admin', 'master'],
        ]);

        MenuItem::updateOrCreate(['label' => 'Navigation'], [
            'route' => 'admin.navigation.index',
            'parent_id' => $adminParent->id,
            'order' => 25,
            'roles' => ['master'],
        ]);

        MenuItem::updateOrCreate(['label' => 'Products'], [
            'route' => 'admin.products.index',
            'parent_id' => $adminParent->id,
            'order' => 30,
            'roles' => ['admin', 'master'],
            'module_slug' => 'shopping-cart'
        ]);

        MenuItem::updateOrCreate(['label' => 'Inventory'], [
            'route' => 'admin.inventory.index',
            'parent_id' => $adminParent->id,
            'order' => 35,
            'roles' => ['admin', 'master'],
            'module_slug' => 'inventory'
        ]);

        MenuItem::updateOrCreate(['label' => 'Menus'], [
            'route' => 'admin.menus.index',
            'parent_id' => $adminParent->id,
            'order' => 40,
            'roles' => ['master'],
        ]);

        MenuItem::updateOrCreate(['label' => 'System Settings'], [
            'route' => 'admin.settings.index',
            'parent_id' => $adminParent->id,
            'order' => 50,
            'roles' => ['master'],
        ]);
    }
}
