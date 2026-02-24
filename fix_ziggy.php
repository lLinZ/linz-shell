<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\MenuItem;

echo "CLEANUP START\n";
$affected = MenuItem::where('route', 'admin.landing-page.index')->update(['route' => 'admin.pages.index', 'label' => 'CMS Pages']);
echo "Rows updated based on exact match: $affected\n";

$affectedLike = MenuItem::where('route', 'like', '%landing-page%')->update(['route' => 'admin.pages.index', 'label' => 'CMS Pages']);
echo "Rows updated based on LIKE match: $affectedLike\n";

echo "CLEANUP END\n";
