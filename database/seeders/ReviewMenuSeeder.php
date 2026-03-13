<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ReviewMenuSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $adminParent = \App\Models\MenuItem::where('label', 'Administration')->first();

        \App\Models\MenuItem::updateOrCreate(['label' => 'Reseñas'], [
            'route' => 'admin.reviews.index',
            'parent_id' => $adminParent?->id,
            'order' => 32, // After products/inventory
            'roles' => ['admin', 'master'],
            'icon' => 'StarIcon'
        ]);
    }
}
