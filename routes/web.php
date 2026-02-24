<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\PublicPageController;

// Single-page catch-all for CMS pages (Must be at the bottom or carefully placed)
Route::get('/', [PublicPageController::class, 'show'])->name('welcome');

Route::get('/shop', [App\Http\Controllers\ShopController::class, 'index'])->name('shop.index');


Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->middleware(['admin'])->name('dashboard');

    Route::middleware(['module:chat'])->group(function () {
        // Admin-only Chat Dashboard & Management
        Route::middleware(['admin'])->group(function () {
            Route::get('/chat', [App\Http\Controllers\ChatController::class, 'index'])->name('chat.index');
            Route::post('/chat/group', [App\Http\Controllers\ChatController::class, 'storeGroup'])->name('chat.group.store');
            Route::get('/chat/search-all-users', [App\Http\Controllers\ChatController::class, 'searchAllUsers']);
            Route::post('/chat/private/{user}', [App\Http\Controllers\ChatController::class, 'startPrivateChat']);
            Route::patch('/chat/{conversation}/name', [App\Http\Controllers\ChatController::class, 'updateName'])->name('chat.name.update');
            Route::post('/chat/{conversation}/users', [App\Http\Controllers\ChatController::class, 'addParticipant'])->name('chat.users.add');
            Route::delete('/chat/{conversation}/users', [App\Http\Controllers\ChatController::class, 'removeParticipant'])->name('chat.users.remove');
            Route::get('/chat/{conversation}/search-users', [App\Http\Controllers\ChatController::class, 'searchUsers'])->name('chat.users.search');
        });

        // Messaging endpoints accessible to Clients (via widget) and Admins
        Route::post('/chat/with-admin', [App\Http\Controllers\ChatController::class, 'chatWithAdmin'])->name('chat.with-admin');
        Route::post('/chat/{conversation}/archive', [App\Http\Controllers\ChatController::class, 'archive'])->name('chat.archive');
        Route::get('/chat/{conversation}/messages', [App\Http\Controllers\ChatController::class, 'messages'])->name('chat.messages.index');
        Route::get('/chat/{conversation}/users', [App\Http\Controllers\ChatController::class, 'users'])->name('chat.users');
        Route::post('/chat/{conversation}/messages', [App\Http\Controllers\ChatController::class, 'store'])->name('chat.messages.store');
        Route::post('/chat/messages/{message}/react', [App\Http\Controllers\ChatController::class, 'react'])->name('chat.messages.react');
    });

    Route::middleware(['module:shopping-cart'])->group(function () {
        Route::get('/cart', [App\Http\Controllers\CartController::class, 'index'])->name('cart.index');
        Route::post('/cart/add', [App\Http\Controllers\CartController::class, 'add'])->name('cart.add');
    });

    Route::get('/debug-conversations', function () {
        return Auth::user()->conversations;
    });
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware(['auth', 'verified', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::middleware('master')->group(function () {
        Route::get('/modules', [App\Http\Controllers\Admin\AdminModuleController::class, 'index'])->name('modules.index');
        Route::patch('/modules/{module}', [App\Http\Controllers\Admin\AdminModuleController::class, 'update'])->name('modules.update');

        // Navigation Management
        Route::get('/navigation', [App\Http\Controllers\Admin\NavigationController::class, 'index'])->name('navigation.index');
        Route::post('/navigation', [App\Http\Controllers\Admin\NavigationController::class, 'update'])->name('navigation.update');

        Route::get('/settings', [App\Http\Controllers\Admin\AdminSystemSettingController::class, 'index'])->name('settings.index');
        Route::patch('/settings', [App\Http\Controllers\Admin\AdminSystemSettingController::class, 'update'])->name('settings.update');

        Route::resource('menus', App\Http\Controllers\Admin\AdminMenuController::class)->except(['create', 'show', 'edit']);
    });

    // Multi-Page Management
    Route::get('/pages', [App\Http\Controllers\Admin\PageController::class, 'index'])->name('pages.index');
    Route::post('/pages', [App\Http\Controllers\Admin\PageController::class, 'store'])->name('pages.store');
    Route::patch('/pages/{page}', [App\Http\Controllers\Admin\PageController::class, 'update'])->name('pages.update');
    Route::delete('/pages/{page}', [App\Http\Controllers\Admin\PageController::class, 'destroy'])->name('pages.destroy');
    Route::post('/pages/{page}/toggle-publish', [App\Http\Controllers\Admin\PageController::class, 'togglePublish'])->name('pages.toggle-publish');
    Route::get('/pages/{page}/builder', [App\Http\Controllers\Admin\PageController::class, 'builder'])->name('pages.builder');

    // Page Builder Action Routes (Scoped by page)
    Route::post('/landing-page/{page}/blocks', [App\Http\Controllers\Admin\PageBuilderController::class, 'store'])->name('landing-page.store');
    Route::post('/landing-page/reorder', [App\Http\Controllers\Admin\PageBuilderController::class, 'reorder'])->name('landing-page.reorder');
    Route::patch('/landing-page/blocks/{block}', [App\Http\Controllers\Admin\PageBuilderController::class, 'updateBlock'])->name('landing-page.block.update');
    Route::delete('/landing-page/blocks/{block}', [App\Http\Controllers\Admin\PageBuilderController::class, 'destroy'])->name('landing-page.block.destroy');

    Route::resource('products', App\Http\Controllers\Admin\AdminProductController::class)->except(['create', 'show', 'edit']);

    Route::middleware(['module:inventory'])->group(function () {
        Route::get('/inventory', [App\Http\Controllers\Admin\InventoryController::class, 'index'])->name('inventory.index');
        Route::patch('/inventory/{product}', [App\Http\Controllers\Admin\InventoryController::class, 'update'])->name('inventory.update');
    });
});

require __DIR__ . '/auth.php';

// Dynamic Slug Router (Must be at the very bottom)
Route::get('/{slug}', [PublicPageController::class, 'show'])->where('slug', '.*')->name('page.show');
