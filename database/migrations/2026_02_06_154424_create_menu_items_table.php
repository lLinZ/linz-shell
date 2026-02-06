<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('menu_items', function (Blueprint $table) {
            $table->id();
            $table->string('label');
            $table->string('route')->nullable();
            $table->string('url')->nullable();
            $table->string('icon')->nullable(); // Heroicon name
            $table->json('roles')->nullable(); // ['admin', 'user']
            $table->string('module_slug')->nullable(); // 'chat', 'shopping-cart'
            $table->integer('order')->default(0);
            $table->foreignId('parent_id')->nullable()->constrained('menu_items')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('menu_items');
    }
};
