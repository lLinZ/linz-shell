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

    public function checkout(Request $request)
    {
        $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'required|email|max:255',
            'customer_phone' => 'required|string|max:20',
        ]);

        $cart = $this->getCart();
        $cart->load('items.product');

        if ($cart->items->isEmpty()) {
            return back()->with('error', 'Your cart is empty.');
        }

        try {
            \Illuminate\Support\Facades\DB::beginTransaction();

            $total = $cart->items->sum(function ($item) {
                return $item->quantity * $item->price;
            });

            $order = \App\Models\Order::create([
                'user_id' => auth()->id(),
                'session_id' => session()->getId(),
                'customer_name' => $request->customer_name,
                'customer_email' => $request->customer_email,
                'customer_phone' => $request->customer_phone,
                'status' => 'Nuevo',
                'total' => $total,
            ]);

            foreach ($cart->items as $item) {
                \App\Models\OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item->product_id,
                    'quantity' => $item->quantity,
                    'price' => $item->price,
                ]);
            }

            // Clear the cart
            $cart->items()->delete();
            $cart->status = 'completed';
            $cart->save();

            \Illuminate\Support\Facades\DB::commit();

            // Broadcast the Order Created event
            event(new \App\Events\OrderCreated($order));

            return Inertia::location(route('shop.index')); // redirect somewhere, maybe to a success page
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            return back()->with('error', 'There was an error processing your order.');
        }
    }
}
