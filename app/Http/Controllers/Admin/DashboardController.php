<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $orderStats = OrderController::stats();

        // Revenue by status breakdown
        $recentOrders = Order::with('items.product')
            ->orderBy('created_at', 'desc')
            ->limit(8)
            ->get();

        // Orders per day for the last 7 days (simple chart data)
        $dailyOrders = collect(range(6, 0))->map(function ($daysAgo) {
            $date = now()->subDays($daysAgo);
            return [
                'date'  => $date->format('D'),
                'count' => Order::whereDate('created_at', $date)->count(),
            ];
        });

        $statusBreakdown = collect(['Nuevo', 'En Proceso', 'Enviado', 'Completado', 'Cancelado'])
            ->map(fn($s) => [
                'status' => $s,
                'count'  => Order::where('status', $s)->count(),
            ]);

        return Inertia::render('Dashboard', [
            'stats'           => $orderStats,
            'recentOrders'    => $recentOrders,
            'dailyOrders'     => $dailyOrders,
            'statusBreakdown' => $statusBreakdown,
            'productCount'    => Product::where('is_active', true)->count(),
            'clientCount'     => User::where('role', 'client')->count(),
        ]);
    }
}
