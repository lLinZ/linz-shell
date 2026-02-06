<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Module;
use Inertia\Inertia;

class AdminModuleController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Modules/Index', [
            'modules' => Module::all(),
        ]);
    }

    public function update(Request $request, Module $module)
    {
        $module->update([
            'is_enabled' => $request->boolean('is_enabled'),
        ]);

        return back();
    }
}
