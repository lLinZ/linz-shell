<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Cart;
use App\Models\Product;
use Inertia\Inertia;

class CartController extends Controller
{
    private function getCart()
    {
        if (auth()->check()) {
            return Cart::firstOrCreate(
                ['user_id' => auth()->id(), 'status' => 'active']
            );
        }

        $sessionId = session()->getId();
        return Cart::firstOrCreate(
            ['session_id' => $sessionId, 'status' => 'active']
        );
    }

    public function index()
    {
        $cart = $this->getCart();
        $cart->load('items.product');

        return Inertia::render('Cart/Index', [
            'cart' => $cart
        ]);
    }

    public function add(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1'
        ]);

        $cart = $this->getCart();
        $product = Product::find($request->product_id);

        $item = $cart->items()->where('product_id', $product->id)->first();

        if ($item) {
            $item->increment('quantity', $request->quantity);
        } else {
            $cart->items()->create([
                'product_id' => $product->id,
                'quantity' => $request->quantity,
                'price' => $product->price
            ]);
        }

        return back()->with('success', 'Product added to cart.');
    }
}
