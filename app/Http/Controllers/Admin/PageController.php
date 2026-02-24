<?php

namespace App\Http\Controllers\Admin;

use App\Models\Page;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class PageController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('Admin/Pages/Index', [
            'pages' => Page::latest()->get()
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'is_published' => 'boolean'
        ]);

        Page::create([
            'title' => $request->title,
            'slug' => Str::slug($request->title),
            'is_published' => $request->is_published ?? false
        ]);

        return back()->with('success', 'Página creada correctamente.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Page $page)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'slug' => [
                'required',
                'string',
                'max:255',
                Rule::unique('pages')->ignore($page->id),
            ],
        ]);

        $page->update([
            'title' => $request->title,
            'slug' => Str::slug($request->slug),
        ]);

        return back()->with('success', 'Página actualizada correctamente.');
    }

    /**
     * Load the builder for a specific page.
     */
    public function builder(Page $page)
    {
        return Inertia::render('Admin/LandingBuilder/Index', [
            'page' => $page,
            'blocks' => $page->blocks()->orderBy('order')->get()
        ]);
    }

    /**
     * Toggle publishing status.
     */
    public function togglePublish(Page $page)
    {
        $page->update(['is_published' => !$page->is_published]);
        return back()->with('success', 'Estado de publicación actualizado.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Page $page)
    {
        $page->delete();
        return back()->with('success', 'Página eliminada.');
    }
}
