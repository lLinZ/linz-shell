<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Module;

class ModuleSeeder extends Seeder
{
    public function run(): void
    {
        Module::updateOrCreate(['slug' => 'chat'], [
            'name' => 'Chat System',
            'description' => 'Real-time chat functionality.',
            'is_enabled' => true,
        ]);

        Module::updateOrCreate(['slug' => 'shopping-cart'], [
            'name' => 'Shopping Cart',
            'description' => 'E-commerce shopping cart and product management.',
            'is_enabled' => true,
        ]);

        Module::updateOrCreate(['slug' => 'landing-page'], [
            'name' => 'Landing Page',
            'description' => 'Customizable landing page.',
            'is_enabled' => true,
        ]);
    }
}
