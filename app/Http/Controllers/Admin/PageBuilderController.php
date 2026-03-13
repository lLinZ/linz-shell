<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Page;
use App\Models\PageBlock;
use App\Services\PageBlockService;
use App\Http\Requests\UpdatePageBlockRequest;
use App\Http\Resources\PageBlockResource;
use App\Models\Review;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PageBuilderController extends Controller
{
    protected $pageBlockService;

    public function __construct(PageBlockService $pageBlockService)
    {
        $this->pageBlockService = $pageBlockService;
    }

    /**
     * List blocks for the specified page.
     */
    public function index(Page $page)
    {
        $blocks = $page->blocks()->orderBy('order')->get();

        return Inertia::render('Admin/LandingBuilder/Index', [
            'page' => $page,
            'blocks' => PageBlockResource::collection($blocks),
            'approvedReviews' => Review::where('status', 'approved')->get(['id', 'author_name', 'rating']),
            'categories' => Product::distinct()->pluck('category')->filter()->values(),
        ]);
    }

    /**
     * Update the order of blocks.
     */
    public function reorder(Request $request)
    {
        $data = $request->validate([
            'blocks' => 'required|array',
            'blocks.*.id' => 'required|exists:page_blocks,id',
            'blocks.*.order' => 'required|integer',
        ]);

        $this->pageBlockService->reorderBlocks($data['blocks']);

        return back()->with('success', 'Orden actualizado correctamente.');
    }

    /**
     * Update block payload.
     */
    public function updateBlock(Request $request, PageBlock $block)
    {
        $payload = $request->input('payload_json');
        
        if (!$payload) {
             return back()->withErrors(['payload_json' => 'No se recibió ningún contenido para guardar.']);
        }

        if (!is_array($payload)) {
            return back()->withErrors(['payload_json' => 'El formato del payload es inválido.']);
        }

        // Just to be 100% sure, we update directly via model
        $block->payload_json = $payload;
        $saved = $block->save();

        if (!$saved) {
             return back()->withErrors(['error' => 'Error crítico al guardar en la base de datos.']);
        }

        return back()->with('success', '¡Bloque actualizado con éxito!');
    }

    /**
     * Add a new block to the page.
     */
    public function store(Request $request, Page $page)
    {
        $request->validate([
            'module_namespace' => 'required|string',
            'block_type' => 'required|string',
        ]);

        $this->pageBlockService->createBlock(
            $page, 
            $request->module_namespace, 
            $request->block_type
        );

        return back()->with('success', 'Bloque añadido correctamente.');
    }

    /**
     * Delete a block.
     */
    public function destroy(PageBlock $block)
    {
        $block->delete();
        return back()->with('success', 'Bloque eliminado.');
    }
}
