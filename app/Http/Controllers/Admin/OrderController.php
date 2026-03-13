<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderNote;
use App\Models\Product;
use App\Models\User;
use Inertia\Inertia;
use App\Events\OrderCreated;
use App\Events\OrderStatusUpdated;

class OrderController extends Controller
{
    public function index()
    {
        $orders   = Order::with('items.product', 'notes.user', 'user:id,name,email,avatar_color')
            ->orderBy('created_at', 'desc')->get();
        $products = Product::where('is_active', true)->get(['id', 'name', 'price', 'image_url']);

        return Inertia::render('Admin/Orders/Index', [
            'orders'   => $orders,
            'products' => $products,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'customer_name'    => 'required|string|max:255',
            'customer_email'   => 'required|email|max:255',
            'customer_phone'   => 'required|string|max:30',
            'customer_address' => 'nullable|string|max:500',
            'manual_label'     => 'nullable|string|max:100',
            'status'           => 'required|string|max:50',
            'items'            => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity'   => 'required|integer|min:1',
            'items.*.price'      => 'required|numeric|min:0',
            // User assignment
            'user_action'      => 'nullable|in:none,existing,create',
            'user_id'          => 'nullable|exists:users,id',
            'new_user_name'    => 'nullable|required_if:user_action,create|string|max:255',
            'new_user_email'   => 'nullable|required_if:user_action,create|email|max:255',
            'new_user_password'=> 'nullable|required_if:user_action,create|string|min:8',
        ]);

        DB::beginTransaction();
        try {
            $userId = null;

            // Handle user assignment
            if ($request->user_action === 'existing' && $request->user_id) {
                $userId = $request->user_id;
            } elseif ($request->user_action === 'create') {
                // Check if email already exists
                if (User::where('email', $request->new_user_email)->exists()) {
                    return back()->withErrors(['new_user_email' => 'Este email ya está registrado.']);
                }
                $newUser = User::create([
                    'name'         => $request->new_user_name,
                    'email'        => $request->new_user_email,
                    'password'     => $request->new_user_password,
                    'role'         => 'client',
                    'is_active'    => true,
                    'avatar_color' => sprintf('#%06x', rand(0, 0xFFFFFF)),
                ]);
                $userId = $newUser->id;
            }

            $total = collect($request->items)->sum(fn($i) => $i['quantity'] * $i['price']);

            $order = Order::create([
                'user_id'          => $userId,
                'customer_name'    => $request->customer_name,
                'customer_email'   => $request->customer_email,
                'customer_phone'   => $request->customer_phone,
                'customer_address' => $request->customer_address,
                'status'           => $request->status,
                'is_manual'        => true,
                'manual_label'     => $request->manual_label ?: 'Manual',
                'total'            => $total,
            ]);

            foreach ($request->items as $item) {
                OrderItem::create([
                    'order_id'   => $order->id,
                    'product_id' => $item['product_id'],
                    'quantity'   => $item['quantity'],
                    'price'      => $item['price'],
                ]);
            }

            DB::commit();

            $order->load('items.product', 'user:id,name,email,avatar_color');
            broadcast(new OrderCreated($order))->toOthers();

            return back()->with('success', 'Orden manual creada correctamente.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Error al crear la orden: ' . $e->getMessage()]);
        }
    }

    public function updateStatus(Request $request, Order $order)
    {
        $request->validate(['status' => 'required|string|max:255']);
        $order->update(['status' => $request->status]);
        broadcast(new OrderStatusUpdated($order))->toOthers();
        return back()->with('success', 'Order status updated successfully');
    }

    /** Search users for order assignment */
    public function searchUsers(Request $request)
    {
        $q = $request->input('q', '');
        return response()->json(
            User::where('role', 'client')
                ->where(fn($query) =>
                    $query->where('name', 'like', "%{$q}%")
                          ->orWhere('email', 'like', "%{$q}%")
                )
                ->select('id', 'name', 'email', 'avatar_color')
                ->limit(8)
                ->get()
        );
    }

    /** Start or retrieve a private conversation between admin and order's linked user */
    public function startChat(Order $order)
    {
        if (!$order->user_id) {
            return response()->json(['error' => 'Esta orden no tiene un usuario vinculado.'], 422);
        }

        $adminId  = auth()->id();
        $clientId = $order->user_id;

        $conversation = Conversation::where('is_private', true)
            ->whereHas('users', fn($q) => $q->where('user_id', $adminId))
            ->whereHas('users', fn($q) => $q->where('user_id', $clientId))
            ->first();

        if (!$conversation) {
            $conversation = Conversation::create([
                'name'       => 'Chat con ' . ($order->user->name ?? $order->customer_name),
                'is_private' => true,
            ]);
            $conversation->users()->attach([$adminId, $clientId]);
        }

        $conversation->load('users:id,name,avatar_color,role');

        return response()->json($conversation);
    }

    /** Stats consumed by DashboardController */
    public static function stats(): array
    {
        return [
            'total'      => Order::count(),
            'new'        => Order::where('status', 'Nuevo')->count(),
            'processing' => Order::where('status', 'En Proceso')->count(),
            'completed'  => Order::where('status', 'Completado')->count(),
            'revenue'    => (float) Order::where('status', '!=', 'Cancelado')->sum('total'),
            'today'      => Order::whereDate('created_at', today())->count(),
        ];
    }

    public function getNotes(Order $order)
    {
        return response()->json(
            $order->notes()->with('user:id,name,avatar_color')->latest()->get()
        );
    }

    public function addNote(Request $request, Order $order)
    {
        $request->validate(['body' => 'required|string|max:2000']);

        $note = OrderNote::create([
            'order_id' => $order->id,
            'user_id'  => auth()->id(),
            'body'     => $request->body,
        ]);

        $note->load('user:id,name,avatar_color');

        return response()->json($note, 201);
    }
}
