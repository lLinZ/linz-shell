<?php

namespace App\Http\Controllers;

use App\Models\Page;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;

class PublicPageController extends Controller
{
    public function show($slug = 'welcome')
    {
        $page = Page::where('slug', $slug)
            ->where('is_published', true)
            ->with(['blocks' => function($q) {
                $q->orderBy('order');
            }])
            ->firstOrFail();

        $isEcommerceEnabled = \App\Models\Module::where('slug', 'shopping-cart')->where('is_enabled', true)->exists();

        $blocks = $page->blocks->filter(function ($block) use ($isEcommerceEnabled) {
            if ($block->block_type === 'ProductGrid' && !$isEcommerceEnabled) {
                return false;
            }
            return true;
        })->map(function ($block) {
            if ($block->block_type === 'ProductGrid') {
                $limit = $block->payload_json['limit'] ?? 8;
                $products = Product::where('is_active', true)
                    ->take($limit)
                    ->get();
                
                $payload = $block->payload_json;
                $payload['products'] = $products;
                $block->payload_json = $payload;
            }
            return $block;
        })->values();

        return Inertia::render('Welcome', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
            'blocks' => $blocks,
            'page' => $page,
        ]);
    }
}
