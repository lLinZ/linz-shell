<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        Product::updateOrCreate(['name' => 'Basic Plan'], [
            'description' => 'Great for starters.',
            'price' => 9.99,
            'is_active' => true,
        ]);

        Product::updateOrCreate(['name' => 'Premium Plan'], [
            'description' => 'For serious users.',
            'price' => 29.99,
            'is_active' => true,
        ]);
    }
}
