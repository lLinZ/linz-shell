<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\MenuItem;

echo "WIPING MENU_ITEMS TABLE...\n";
MenuItem::truncate();

echo "RE-SEEDING...\n";
$seeder = new \Database\Seeders\MenuItemSeeder();
$seeder->run();

echo "DONE. Current count: " . MenuItem::count() . "\n";
foreach (MenuItem::all() as $item) {
    echo "ID: {$item->id} | Label: {$item->label} | Route: {$item->route}\n";
}
