<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\LandingPage;

class LandingPageSeeder extends Seeder
{
    public function run(): void
    {
        LandingPage::updateOrCreate(['section_key' => 'hero'], [
            'title' => 'Welcome to linz-shell',
            'content' => ['subtitle' => 'The modular base for your next big project.', 'button_text' => 'Get Started'],
            'is_visible' => true,
            'order' => 1,
        ]);

        LandingPage::updateOrCreate(['section_key' => 'features'], [
            'title' => 'Core Features',
            'content' => [
                'items' => [
                    ['title' => 'Modular Architecture', 'description' => 'Toggle features on demand.'],
                    ['title' => 'User Management', 'description' => 'Built-in roles and permissions.'],
                    ['title' => 'Dynamic Theming', 'description' => 'Personalize your experience.'],
                ]
            ],
            'is_visible' => true,
            'order' => 2,
        ]);
    }
}
