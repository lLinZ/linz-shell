<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Product;
use Inertia\Inertia;

class AdminProductController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Product/Index', [
            'products' => Product::all(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'category' => 'nullable|string|max:255',
            'tags' => 'nullable|array',
            'is_active' => 'boolean',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'images.*' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        $data = $request->except(['image', 'images']);
        $data['slug'] = \Illuminate\Support\Str::slug($request->name);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public');
            $data['image_url'] = '/storage/' . $path;
        }

        if ($request->hasFile('images')) {
            $additionalImages = [];
            foreach ($request->file('images') as $file) {
                $path = $file->store('products', 'public');
                $additionalImages[] = '/storage/' . $path;
            }
            $data['images'] = $additionalImages;
        }

        Product::create($data);

        return back()->with('success', 'Producto creado correctamente.');
    }

    public function update(Request $request, Product $product)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'category' => 'nullable|string|max:255',
            'tags' => 'nullable|array',
            'is_active' => 'boolean',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'images.*' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        $data = $request->except(['image', 'images']);
        $data['slug'] = \Illuminate\Support\Str::slug($request->name);

        if ($request->hasFile('image')) {
            // Delete old image if it exists and is local
            if ($product->image_url && str_starts_with($product->image_url, '/storage/')) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete(str_replace('/storage/', '', $product->image_url));
            }
            
            $path = $request->file('image')->store('products', 'public');
            $data['image_url'] = '/storage/' . $path;
        }

        // Handle additional images replacement
        if ($request->hasFile('images')) {
            // Optional: delete old gallery images
            if ($product->images) {
                foreach ($product->images as $oldPath) {
                    if (str_starts_with($oldPath, '/storage/')) {
                        \Illuminate\Support\Facades\Storage::disk('public')->delete(str_replace('/storage/', '', $oldPath));
                    }
                }
            }

            $additionalImages = [];
            foreach ($request->file('images') as $file) {
                $path = $file->store('products', 'public');
                $additionalImages[] = '/storage/' . $path;
            }
            $data['images'] = $additionalImages;
        }

        $product->update($data);

        return back()->with('success', 'Producto actualizado correctamente.');
    }

    public function destroy(Product $product)
    {
        $product->delete();

        return back()->with('success', 'Product deleted.');
    }
}
