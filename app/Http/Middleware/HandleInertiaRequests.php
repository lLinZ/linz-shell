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
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'modules' => \App\Models\Module::all(),
            'menu' => $request->user()
                ? \App\Models\MenuItem::whereNull('parent_id')
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
                })->values()
                : [],
        ];
    }
}
