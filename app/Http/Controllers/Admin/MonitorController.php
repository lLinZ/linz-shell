<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class MonitorController extends Controller
{
    public function index()
    {
        // Active Sessions (who is logged in - using sessions table)
        $activeSessions = DB::table('sessions')
            ->join('users', 'sessions.user_id', '=', 'users.id')
            ->where('sessions.last_activity', '>=', now()->subMinutes(15)->timestamp)
            ->select(
                'users.id',
                'users.name',
                'users.email',
                'users.role',
                'sessions.ip_address',
                'sessions.user_agent',
                'sessions.last_activity'
            )
            ->orderBy('sessions.last_activity', 'desc')
            ->get()
            ->map(function ($session) {
                $session->last_activity_at = now()->diffForHumans(\Carbon\Carbon::createFromTimestamp($session->last_activity));
                return $session;
            });

        // Recent activity - latest orders
        $recentActivity = Order::with('user')
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get()
            ->map(fn($o) => [
                'type'       => 'order',
                'id'         => $o->id,
                'message'    => "Nueva orden #{$o->id} - {$o->customer_name}",
                'status'     => $o->status,
                'created_at' => $o->created_at->diffForHumans(),
                'timestamp'  => $o->created_at->toISOString(),
            ]);

        // Client connected (clients who have been active in sessions in last 30 min)
        $connectedClients = DB::table('sessions')
            ->join('users', 'sessions.user_id', '=', 'users.id')
            ->where('users.role', 'client')
            ->where('sessions.last_activity', '>=', now()->subMinutes(30)->timestamp)
            ->select('users.id', 'users.name', 'users.email', 'sessions.ip_address', 'sessions.last_activity')
            ->get()
            ->map(function ($s) {
                $s->last_seen = now()->diffForHumans(\Carbon\Carbon::createFromTimestamp($s->last_activity));
                return $s;
            });

        // Guest visitors (null user_id in sessions with recent activity)
        $guestVisitors = DB::table('sessions')
            ->whereNull('user_id')
            ->where('last_activity', '>=', now()->subMinutes(30)->timestamp)
            ->count();

        // Notifications / Alerts (orders that need attention)
        $alertsArr = [];

        $newOrders = Order::where('status', 'Nuevo')
            ->where('created_at', '>=', now()->subHours(24))
            ->count();
        if ($newOrders > 0) {
            $alertsArr[] = [
                'id'       => 'new_orders',
                'type'     => 'warning',
                'title'    => 'Órdenes Nuevas Sin Atender',
                'message'  => "{$newOrders} orden(es) en estado 'Nuevo' requieren atención",
                'count'    => $newOrders,
                'action'   => '/admin/orders',
                'icon'     => 'ShoppingCart',
            ];
        }

        $inactiveUsers = User::where('is_active', false)->count();
        if ($inactiveUsers > 0) {
            $alertsArr[] = [
                'id'       => 'inactive_users',
                'type'     => 'info',
                'title'    => 'Usuarios Inactivos',
                'message'  => "{$inactiveUsers} usuario(s) están desactivados en el sistema",
                'count'    => $inactiveUsers,
                'action'   => '/admin/users',
                'icon'     => 'UserX',
            ];
        }

        $pendingOrders = Order::where('status', 'En Proceso')->count();
        if ($pendingOrders > 5) {
            $alertsArr[] = [
                'id'       => 'pending_orders',
                'type'     => 'warning',
                'title'    => 'Alto Volumen en Proceso',
                'message'  => "{$pendingOrders} órdenes están actualmente en proceso",
                'count'    => $pendingOrders,
                'action'   => '/admin/orders',
                'icon'     => 'Loader2',
            ];
        }

        $alerts = collect($alertsArr);

        $stats = [
            'activeAdmins'     => $activeSessions->whereIn('role', ['admin', 'master'])->count(),
            'activeClients'    => $connectedClients->count(),
            'guestVisitors'    => $guestVisitors,
            'totalActive'      => $activeSessions->count(),
            'alertCount'       => $alerts->count(),
            'recentOrderCount' => Order::whereDate('created_at', today())->count(),
        ];

        return Inertia::render('Admin/Monitor/Index', [
            'activeSessions'   => $activeSessions->values(),
            'connectedClients' => $connectedClients->values(),
            'guestVisitors'    => $guestVisitors,
            'recentActivity'   => $recentActivity,
            'alerts'           => $alerts->values(),
            'stats'            => $stats,
        ]);
    }
}
