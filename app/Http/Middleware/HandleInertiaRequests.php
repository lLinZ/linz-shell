<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $navigation = [];
        $branding = [];
        $modules = [];
        $settings = [];
        $menu = [];

        try {
            // Check for site_settings table (Dynamic Navbar/Footer/Branding)
            if (\Illuminate\Support\Facades\Schema::hasTable('site_settings')) {
                $navigation = \App\Models\SiteSetting::where('key', 'navbar_config')->first()?->value ?? [];
                $branding = \App\Models\SiteSetting::where('key', 'branding_config')->first()?->value ?? [
                    'site_name' => config('app.name', 'Laravel'),
                    'site_logo' => '',
                    'site_favicon' => '',
                ];
            }
            
            // Check for modules table
            if (\Illuminate\Support\Facades\Schema::hasTable('modules')) {
                $modules = \App\Models\Module::all();
            }

            // Check for system_settings table
            if (\Illuminate\Support\Facades\Schema::hasTable('system_settings')) {
                $settings = \App\Models\SystemSetting::all()->pluck('value', 'key');
            }

            // Check for menu_items table
            if ($request->user() && \Illuminate\Support\Facades\Schema::hasTable('menu_items')) {
                $menu = \App\Models\MenuItem::whereNull('parent_id')
                    ->with('children')
                    ->orderBy('order')
                    ->get()
                    ->filter(function ($item) use ($request) {
                        // Filter by Role
                        if ($item->roles && !in_array($request->user()->role, $item->roles)) {
                            return false;
                        }
                        // Filter by Module (if enabled)
                        if ($item->module_slug) {
                            $module = \App\Models\Module::where('slug', $item->module_slug)->first();
                            if (!$module || !$module->is_enabled) {
                                return false;
                            }
                        }
                        return true;
                    })->values();
            }
        } catch (\Throwable $e) {
            // Silently fail to allow migrations to run or handle initial states
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'navigation' => $navigation,
            'branding' => $branding,
            'modules' => $modules,
            'settings' => $settings,
            'menu' => $menu,
        ];
    }
}
