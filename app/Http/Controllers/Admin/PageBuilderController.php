<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Page;
use App\Models\PageBlock;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PageBuilderController extends Controller
{
    /**
     * List blocks for the 'welcome' page.
     */
    public function index()
    {
        $page = Page::where('slug', 'welcome')->with(['blocks' => function ($q) {
            $q->orderBy('order');
        }])->firstOrFail();

        return Inertia::render('Admin/LandingBuilder/Index', [
            'page' => $page,
            'blocks' => $page->blocks,
        ]);
    }

    /**
     * Update the order of blocks.
     */
    public function reorder(Request $request)
    {
        $request->validate([
            'blocks' => 'required|array',
            'blocks.*.id' => 'required|exists:page_blocks,id',
            'blocks.*.order' => 'required|integer',
        ]);

        foreach ($request->blocks as $blockData) {
            PageBlock::where('id', $blockData['id'])->update(['order' => $blockData['order']]);
        }

        return back()->with('success', 'Orden actualizado correctamente.');
    }

    /**
     * Update block payload.
     */
    public function updateBlock(Request $request, PageBlock $block)
    {
        $request->validate([
            'payload_json' => 'required|array',
        ]);

        $block->update([
            'payload_json' => $request->payload_json,
        ]);

        return back()->with('success', 'Bloque actualizado.');
    }

    /**
     * Add a new block to the page.
     */
    public function store(Request $request)
    {
        $request->validate([
            'module_namespace' => 'required|string',
            'block_type' => 'required|string',
        ]);

        $page = Page::where('slug', 'welcome')->firstOrFail();

        // Calculate next order
        $lastOrder = PageBlock::where('page_id', $page->id)->max('order') ?? 0;

        // Determine initial payload based on block type
        $payload = [];
        if ($request->block_type === 'Hero') {
            $payload = [
                'badge' => 'NUEVO',
                'title' => 'Título de tu Hero',
                'subtitle' => 'Subtítulo descriptivo',
                'description' => 'Escribe aquí una descripción impactante para tu landing page.',
                'primary_cta' => ['text' => 'Empezar', 'url' => '#'],
                'secondary_cta' => ['text' => 'Saber más', 'url' => '#'],
            ];
        } elseif ($request->block_type === 'ProductGrid') {
            $payload = [
                'title' => 'Nuestros Productos',
                'category' => 'all',
                'limit' => 8,
            ];
        }

        PageBlock::create([
            'page_id' => $page->id,
            'module_namespace' => $request->module_namespace,
            'block_type' => $request->block_type,
            'order' => $lastOrder + 1,
            'payload_json' => $payload
        ]);

        return back()->with('success', 'Bloque añadido correctamente.');
    }

    /**
     * Toggle block visibility or delete.
     */
    public function destroy(PageBlock $block)
    {
        $block->delete();
        return back()->with('success', 'Bloque eliminado.');
    }
}
