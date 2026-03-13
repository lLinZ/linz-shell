<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

use App\Services\InventoryService;

class InventoryController extends Controller
{
    protected InventoryService $inventoryService;

    public function __construct(InventoryService $inventoryService)
    {
        $this->inventoryService = $inventoryService;
    }

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

        try {
            $this->inventoryService->setStock(
                $product,
                $request->stock,
                auth()->id(),
                'Manual Update',
                'Ajuste manual desde el panel'
            );
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', 'Stock updated.');
    }
}
