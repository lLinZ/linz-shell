<?php

namespace Database\Seeders;

use App\Models\SystemSetting;
use Illuminate\Database\Seeder;

class SystemSettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Branding
        SystemSetting::set('app_name', 'Linz Shell', 'branding', 'text');
        SystemSetting::set('app_logo', null, 'branding', 'image');
        SystemSetting::set('app_favicon', null, 'branding', 'image');
        
        // Colors
        SystemSetting::set('primary_color', '#3B82F6', 'colors', 'color');
        SystemSetting::set('accent_color', '#F59E0B', 'colors', 'color');
        
        // Social / Contact
        SystemSetting::set('contact_email', 'admin@example.com', 'contact', 'text');
        SystemSetting::set('footer_text', '© 2026 Linz Shell. All rights reserved.', 'general', 'text');
    }
}
