<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NavigationController extends Controller
{
    public function index()
    {
        $navbarConfig = SiteSetting::where('key', 'navbar_config')->first();
        $brandingConfig = SiteSetting::where('key', 'branding_config')->first();
        
        return Inertia::render('Admin/Navigation/Index', [
            'navbar_config' => $navbarConfig ? $navbarConfig->value : [],
            'branding_config' => $brandingConfig ? $brandingConfig->value : [
                'site_name' => '',
                'site_logo' => '',
                'site_favicon' => '',
            ],
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'navbar_config' => 'nullable|array',
            'branding_config' => 'nullable|array',
        ]);

        if ($request->has('navbar_config')) {
            SiteSetting::updateOrCreate(
                ['key' => 'navbar_config'],
                ['value' => $request->navbar_config]
            );
        }

        if ($request->has('branding_config')) {
            SiteSetting::updateOrCreate(
                ['key' => 'branding_config'],
                ['value' => $request->branding_config]
            );
        }

        return back()->with('success', 'Configuración actualizada correctamente.');
    }
}
