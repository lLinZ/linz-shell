<?php

use App\Models\Message;

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

$kernel->bootstrap();

echo "Total Messages: " . Message::count() . PHP_EOL;
$latest = Message::latest()->first();
if ($latest) {
    echo "Latest Message: " . $latest->body . " (ID: " . $latest->id . ", User: " . $latest->user_id . ")" . PHP_EOL;
} else {
    echo "No messages found." . PHP_EOL;
}
