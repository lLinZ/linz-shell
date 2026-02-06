<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ShopController extends Controller
{
    public function index()
    {
        return Inertia::render('Shop/Index', [
            'products' => Product::where('is_active', true)->where('stock', '>', 0)->get(),
        ]);
    }
}
