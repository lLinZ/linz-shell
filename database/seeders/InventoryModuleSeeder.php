<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Module;

class InventoryModuleSeeder extends Seeder
{
    public function run(): void
    {
        Module::updateOrCreate(['slug' => 'inventory'], [
            'name' => 'Inventory Management',
            'description' => 'Manage product stock levels.',
            'is_enabled' => true,
        ]);
    }
}
