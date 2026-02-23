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
     * Toggle block visibility or delete (optional based on needs, let's keep it simple for now).
     */
    public function destroy(PageBlock $block)
    {
        $block->delete();
        return back()->with('success', 'Bloque eliminado.');
    }
}
