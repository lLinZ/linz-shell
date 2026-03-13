<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\MenuItem;

class NewAdminMenuSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Centro de Monitoreo (Top Level)
        MenuItem::updateOrCreate(
            ['route' => 'admin.monitor.index'],
            [
                'label' => 'Centro de Monitoreo',
                'url' => null,
                'icon' => 'SignalIcon',
                'roles' => ['admin', 'master'],
                'module_slug' => null,
                'order' => 5,
                'parent_id' => null,
            ]
        );

        // 2. Usuarios (Under Administration - ID 4)
        MenuItem::updateOrCreate(
            ['route' => 'admin.users.index'],
            [
                'label' => 'Usuarios',
                'url' => null,
                'icon' => 'UserGroupIcon',
                'roles' => ['master'], // Usually only master manages users in this setup
                'module_slug' => null,
                'order' => 5,
                'parent_id' => 4,
            ]
        );

        // 3. Salud del Sistema (Under Administration - ID 4)
        MenuItem::updateOrCreate(
            ['route' => 'admin.system-health.index'],
            [
                'label' => 'Salud del Sistema',
                'url' => null,
                'icon' => 'HeartIcon',
                'roles' => ['master'],
                'module_slug' => null,
                'order' => 60,
                'parent_id' => 4,
            ]
        );
    }
}
