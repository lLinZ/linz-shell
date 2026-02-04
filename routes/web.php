<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});


Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');

    Route::get('/chat', [App\Http\Controllers\ChatController::class, 'index'])->name('chat.index');
    Route::get('/chat/search-all-users', [App\Http\Controllers\ChatController::class, 'searchAllUsers']);
    Route::post('/chat/private/{user}', [App\Http\Controllers\ChatController::class, 'startPrivateChat']);
    Route::get('/chat/{conversation}/messages', [App\Http\Controllers\ChatController::class, 'messages'])->name('chat.messages.index');
    Route::get('/chat/{conversation}/users', [App\Http\Controllers\ChatController::class, 'users'])->name('chat.users');
    Route::patch('/chat/{conversation}/name', [App\Http\Controllers\ChatController::class, 'updateName'])->name('chat.name.update');
    Route::post('/chat/{conversation}/users', [App\Http\Controllers\ChatController::class, 'addParticipant'])->name('chat.users.add');
    Route::delete('/chat/{conversation}/users', [App\Http\Controllers\ChatController::class, 'removeParticipant'])->name('chat.users.remove');
    Route::get('/chat/{conversation}/search-users', [App\Http\Controllers\ChatController::class, 'searchUsers'])->name('chat.users.search');
    Route::post('/chat/{conversation}/messages', [App\Http\Controllers\ChatController::class, 'store'])->name('chat.messages.store');

    Route::get('/debug-conversations', function () {
        return Auth::user()->conversations;
    });
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';
