<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\MenuItem;
use Inertia\Inertia;

class AdminMenuController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Menu/Index', [
            'menuItems' => MenuItem::orderBy('order')->with('children')->whereNull('parent_id')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'label' => 'required|string|max:255',
            'route' => 'nullable|string|max:255',
            'url' => 'nullable|string|max:255',
            'icon' => 'nullable|string|max:255',
            'roles' => 'nullable|array',
            'module_slug' => 'nullable|string|max:255',
            'order' => 'integer',
            'parent_id' => 'nullable|exists:menu_items,id',
        ]);

        MenuItem::create($request->all());

        return back()->with('success', 'Menu item created.');
    }

    public function update(Request $request, MenuItem $menu)
    {
        $request->validate([
            'label' => 'required|string|max:255',
            'route' => 'nullable|string|max:255',
            'url' => 'nullable|string|max:255',
            'icon' => 'nullable|string|max:255',
            'roles' => 'nullable|array',
            'module_slug' => 'nullable|string|max:255',
            'order' => 'integer',
            'parent_id' => 'nullable|exists:menu_items,id',
        ]);

        $menu->update($request->all());

        return back()->with('success', 'Menu item updated.');
    }

    public function destroy(MenuItem $menu)
    {
        $menu->delete();

        return back()->with('success', 'Menu item deleted.');
    }
}
