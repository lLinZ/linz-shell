<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\PublicPageController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

// Reviews
Route::get('/reviews/submit/{uuid}', [ReviewController::class, 'publicShow'])->name('reviews.show');
Route::post('/reviews/submit', [ReviewController::class, 'publicStore'])->name('reviews.store');
Route::get('/api/reviews/approved', [ReviewController::class, 'getApprovedReviews'])->name('api.reviews.approved');

// Single-page catch-all for CMS pages (Must be at the bottom or carefully placed)
Route::get('/', [PublicPageController::class, 'show'])->name('welcome');



Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [App\Http\Controllers\Admin\DashboardController::class, 'index'])->middleware(['admin'])->name('dashboard');

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
        Route::post('/cart/checkout', [App\Http\Controllers\CartController::class, 'checkout'])->name('cart.checkout');
        Route::get('/shop', [App\Http\Controllers\ShopController::class, 'index'])->name('shop.index');
        Route::get('/product/{slug}', [App\Http\Controllers\ShopController::class, 'show'])->name('shop.product');
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

        // User Management
        Route::get('/users', [App\Http\Controllers\Admin\UserManagementController::class, 'index'])->name('users.index');
        Route::post('/users', [App\Http\Controllers\Admin\UserManagementController::class, 'store'])->name('users.store');
        Route::put('/users/{user}', [App\Http\Controllers\Admin\UserManagementController::class, 'update'])->name('users.update');
        Route::patch('/users/{user}/password', [App\Http\Controllers\Admin\UserManagementController::class, 'updatePassword'])->name('users.password');
        Route::patch('/users/{user}/toggle-status', [App\Http\Controllers\Admin\UserManagementController::class, 'toggleStatus'])->name('users.toggle-status');
        Route::delete('/users/{user}', [App\Http\Controllers\Admin\UserManagementController::class, 'destroy'])->name('users.destroy');

        // System Health
        Route::get('/system-health', [App\Http\Controllers\Admin\SystemHealthController::class, 'index'])->name('system-health.index');
    });

    // Monitor (accessible to all admins)
    Route::get('/monitor', [App\Http\Controllers\Admin\MonitorController::class, 'index'])->name('monitor.index');

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

    // Leads / Form Submissions
    Route::get('/submissions', [App\Http\Controllers\FormSubmissionController::class, 'index'])->name('submissions.index');
    Route::get('/submissions/{form_name}', [App\Http\Controllers\FormSubmissionController::class, 'show'])->name('submissions.show');
    Route::delete('/submissions/{submission}', [App\Http\Controllers\FormSubmissionController::class, 'destroy'])->name('submissions.destroy');
    
    // CRM Orders
    Route::get('/orders', [App\Http\Controllers\Admin\OrderController::class, 'index'])->name('orders.index');
    Route::post('/orders', [App\Http\Controllers\Admin\OrderController::class, 'store'])->name('orders.store');
    Route::patch('/orders/{order}/status', [App\Http\Controllers\Admin\OrderController::class, 'updateStatus'])->name('orders.update-status');
    Route::get('/orders/search-users', [App\Http\Controllers\Admin\OrderController::class, 'searchUsers'])->name('orders.search-users');
    Route::post('/orders/{order}/start-chat', [App\Http\Controllers\Admin\OrderController::class, 'startChat'])->name('orders.start-chat');
    Route::get('/orders/{order}/notes', [App\Http\Controllers\Admin\OrderController::class, 'getNotes'])->name('orders.notes.index');
    Route::post('/orders/{order}/notes', [App\Http\Controllers\Admin\OrderController::class, 'addNote'])->name('orders.notes.store');



    // Media Manager
    Route::get('/media', [App\Http\Controllers\Admin\AdminMediaController::class, 'index'])->name('media.index');
    Route::post('/media', [App\Http\Controllers\Admin\AdminMediaController::class, 'store'])->name('media.store');
    Route::delete('/media/{media}', [App\Http\Controllers\Admin\AdminMediaController::class, 'destroy'])->name('media.destroy');

    // Admin Reviews Management
    Route::get('/reviews', [ReviewController::class, 'index'])->name('reviews.index');
    Route::post('/reviews/generate', [ReviewController::class, 'generateInvitation'])->name('reviews.generate');
    Route::patch('/reviews/{review}', [ReviewController::class, 'update'])->name('reviews.update');
    Route::delete('/reviews/{review}', [ReviewController::class, 'destroy'])->name('reviews.destroy');

    Route::middleware(['module:shopping-cart'])->group(function () {
        Route::resource('products', App\Http\Controllers\Admin\AdminProductController::class)->except(['create', 'show', 'edit']);
    });

    Route::middleware(['module:inventory'])->group(function () {
        Route::get('/inventory', [App\Http\Controllers\Admin\InventoryController::class, 'index'])->name('inventory.index');
        Route::patch('/inventory/{product}', [App\Http\Controllers\Admin\InventoryController::class, 'update'])->name('inventory.update');
        Route::get('/inventory/movements', [App\Http\Controllers\Admin\InventoryMovementController::class, 'index'])->name('inventory.movements');
    });
});

require __DIR__ . '/auth.php';

// Dynamic Slug Router (Must be at the very bottom)
Route::get('/{slug}', [PublicPageController::class, 'show'])->where('slug', '.*')->name('page.show');
