<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\MenuItem;

$data = MenuItem::all();
file_put_contents('menu_debug.json', $data->toJson(JSON_PRETTY_PRINT));
echo "SAVED " . count($data) . " items.\n";
