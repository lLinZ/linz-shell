<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InventoryController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Inventory/Index', [
            'products' => Product::all(),
        ]);
    }

    public function update(Request $request, Product $product)
    {
        $request->validate([
            'stock' => 'required|integer|min:0',
        ]);

        $product->update(['stock' => $request->stock]); // Triggers BroadcastsState

        return back()->with('success', 'Stock updated.');
    }
}
