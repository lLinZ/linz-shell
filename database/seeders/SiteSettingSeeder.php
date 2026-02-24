<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\SiteSetting;

class SiteSettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        SiteSetting::updateOrCreate(
            ['key' => 'navbar_config'],
            [
                'value' => [
                    'logo_text' => 'LINZ SHELL',
                    'logo_url' => '/',
                    'links' => [
                        ['label' => 'Características', 'url' => '#features'],
                        ['label' => 'Precios', 'url' => '#pricing'],
                        ['label' => 'Tienda', 'url' => '/shop'],
                    ],
                ]
            ]
        );

        SiteSetting::updateOrCreate(
            ['key' => 'branding_config'],
            [
                'value' => [
                    'site_name' => 'LINZ SHELL',
                    'site_logo' => 'https://linz-shell.test/logo.png',
                    'site_favicon' => 'https://linz-shell.test/favicon.ico',
                ]
            ]
        );
    }
}
