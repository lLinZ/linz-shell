<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\MenuItem;

echo "--- Current Menu Items with potentially broken routes ---\n";
$items = MenuItem::all();
foreach ($items as $item) {
    if (str_contains($item->route, 'landing-page')) {
        echo "ID: {$item->id}, Label: {$item->label}, Route: {$item->route} (BROKEN)\n";
        $item->delete();
        echo "DELETED.\n";
    }
}

echo "--- Checking for CMS Pages ---\n";
$cmsPage = MenuItem::where('label', 'CMS Pages')->first();
if ($cmsPage) {
    echo "ID: {$cmsPage->id}, Label: {$cmsPage->label}, Route: {$cmsPage->route}\n";
} else {
    echo "CMS Pages link NOT FOUND. Re-running MenuItemSeeder...\n";
    $seeder = new \Database\Seeders\MenuItemSeeder();
    $seeder->run();
    echo "MenuItemSeeder executed.\n";
}

echo "Done.\n";
