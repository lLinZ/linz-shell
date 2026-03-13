<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->boolean('is_manual')->default(false)->after('status');
            $table->string('manual_label')->nullable()->after('is_manual'); // e.g. "Pedido por teléfono"
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['is_manual', 'manual_label']);
        });
    }
};
