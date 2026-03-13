<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class UserManagementController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query();

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        if ($request->filled('status')) {
            $query->where('is_active', $request->status === 'active');
        }

        $users = $query->orderBy('created_at', 'desc')->paginate(15)->withQueryString();

        $stats = [
            'total'    => User::count(),
            'active'   => User::where('is_active', true)->count(),
            'inactive' => User::where('is_active', false)->count(),
            'admins'   => User::whereIn('role', ['admin', 'master'])->count(),
            'clients'  => User::where('role', 'client')->count(),
        ];

        return Inertia::render('Admin/Users/Index', [
            'users'   => $users,
            'stats'   => $stats,
            'filters' => $request->only(['search', 'role', 'status']),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'email', 'unique:users,email'],
            'password' => ['required', Password::defaults()],
            'role'     => ['required', 'in:admin,client'],
            'is_active' => ['boolean'],
        ]);

        // Prevent creating master users from UI
        $role = $request->role;
        if ($role === 'master') {
            $role = 'admin';
        }

        User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'role'     => $role,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return back()->with('success', 'Usuario creado correctamente.');
    }

    public function update(Request $request, User $user)
    {
        // Protect master user from being modified
        if ($user->isMaster() && auth()->id() !== $user->id) {
            abort(403, 'No puedes modificar al usuario Master.');
        }

        $request->validate([
            'name'      => ['required', 'string', 'max:255'],
            'email'     => ['required', 'email', 'unique:users,email,' . $user->id],
            'role'      => ['required', 'in:admin,client,master'],
            'is_active' => ['boolean'],
        ]);

        $role = $request->role;
        if ($user->isMaster()) {
            $role = 'master'; // Force keep master role
        } elseif ($role === 'master') {
            $role = 'admin'; // Don't allow elevating to master
        }

        $user->update([
            'name'      => $request->name,
            'email'     => $request->email,
            'role'      => $role,
            'is_active' => $user->isMaster() ? true : $request->boolean('is_active'),
        ]);

        return back()->with('success', 'Usuario actualizado correctamente.');
    }

    public function updatePassword(Request $request, User $user)
    {
        if ($user->isMaster() && auth()->id() !== $user->id) {
            abort(403, 'No puedes modificar la contraseña del usuario Master.');
        }

        $request->validate([
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $user->update([
            'password' => Hash::make($request->password),
        ]);

        return back()->with('success', 'Contraseña actualizada correctamente.');
    }

    public function toggleStatus(User $user)
    {
        if ($user->isMaster()) {
            abort(403, 'No puedes desactivar al usuario Master.');
        }

        if ($user->id === auth()->id()) {
            abort(403, 'No puedes desactivarte a ti mismo.');
        }

        $user->update(['is_active' => !$user->is_active]);

        $status = $user->is_active ? 'activado' : 'desactivado';

        return back()->with('success', "Usuario {$status} correctamente.");
    }

    public function destroy(User $user)
    {
        if ($user->isMaster()) {
            abort(403, 'No puedes eliminar al usuario Master.');
        }

        if ($user->id === auth()->id()) {
            abort(403, 'No puedes eliminarte a ti mismo.');
        }

        $user->delete();

        return back()->with('success', 'Usuario eliminado correctamente.');
    }
}
