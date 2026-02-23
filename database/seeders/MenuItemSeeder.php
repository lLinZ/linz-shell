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
            'roles' => ['admin', 'user'],
            'icon' => 'HomeIcon'
        ]);

        MenuItem::updateOrCreate(['label' => 'Chat'], [
            'route' => 'chat.index',
            'order' => 20,
            'roles' => ['admin', 'user'],
            'module_slug' => 'chat',
            'icon' => 'ChatBubbleLeftRightIcon'
        ]);

        MenuItem::updateOrCreate(['label' => 'Shop'], [
            'route' => 'shop.index', // Now points to the real Shop Catalog
            'url' => '/shop',
            'order' => 30,
            'roles' => ['admin', 'user'],
            'module_slug' => 'shopping-cart',
            'icon' => 'ShoppingCartIcon'
        ]);


        // Admin Only Links - Grouped under "Administration"
        $adminParent = MenuItem::updateOrCreate(['label' => 'Administration'], [
            'order' => 90,
            'roles' => ['admin'],
            'icon' => 'Cog6ToothIcon'
        ]);

        MenuItem::updateOrCreate(['label' => 'Modules'], [
            'route' => 'admin.modules.index',
            'parent_id' => $adminParent->id,
            'order' => 10,
            'roles' => ['admin'],
        ]);

        MenuItem::updateOrCreate(['label' => 'Landing Page'], [
            'route' => 'admin.landing-page.index',
            'parent_id' => $adminParent->id,
            'order' => 20,
            'roles' => ['admin'],
        ]);

        MenuItem::updateOrCreate(['label' => 'Products'], [
            'route' => 'admin.products.index',
            'parent_id' => $adminParent->id,
            'order' => 30,
            'roles' => ['admin'],
            'module_slug' => 'shopping-cart'
        ]);

        MenuItem::updateOrCreate(['label' => 'Inventory'], [
            'route' => 'admin.inventory.index',
            'parent_id' => $adminParent->id,
            'order' => 35,
            'roles' => ['admin'],
            'module_slug' => 'inventory'
        ]);

        MenuItem::updateOrCreate(['label' => 'Menus'], [
            'route' => 'admin.menus.index',
            'parent_id' => $adminParent->id,
            'order' => 40,
            'roles' => ['admin'],
        ]);

        MenuItem::updateOrCreate(['label' => 'System Settings'], [
            'route' => 'admin.settings.index',
            'parent_id' => $adminParent->id,
            'order' => 50,
            'roles' => ['admin'],
        ]);
    }
}
