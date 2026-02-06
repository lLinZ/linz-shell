<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Module;

class ModuleEnabledMiddleware
{
    public function handle(Request $request, Closure $next, string $moduleSlug): Response
    {
        $module = Module::where('slug', $moduleSlug)->first();

        if ($module && !$module->is_enabled) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Module is disabled.'], 403);
            }
            return redirect()->route('dashboard')->with('error', 'This module is currently disabled.');
        }

        return $next($request);
    }
}
