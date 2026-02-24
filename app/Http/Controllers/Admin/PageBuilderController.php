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
    public function index(Page $page)
    {
        return Inertia::render('Admin/LandingBuilder/Index', [
            'page' => $page,
            'blocks' => $page->blocks()->orderBy('order')->get(),
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
    public function store(Request $request, Page $page)
    {
        $request->validate([
            'module_namespace' => 'required|string',
            'block_type' => 'required|string',
        ]);

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
        } elseif ($request->block_type === 'Features') {
            $payload = [
                'title' => 'Nuestras Ventajas',
                'subtitle' => 'Descubre por qué somos la mejor opción.',
                'features' => [
                    ['title' => 'Rapidez', 'description' => 'Servicio inmediato.', 'icon' => 'Zap'],
                    ['title' => 'Seguridad', 'description' => 'Garantía total.', 'icon' => 'ShieldCheck'],
                ],
            ];
        } elseif ($request->block_type === 'InteractiveHero') {
            $payload = [
                'badge' => 'EXPERIENCIA PREMIUM',
                'title' => 'Crea Momentos Memorables',
                'description' => 'Efectos parallax, videos de fondo y carruseles fluidos para captar la atención de tus clientes desde el primer segundo.',
                'primary_cta' => ['text' => 'Comenzar Ahora', 'url' => '#'],
                'slides' => [
                    ['image' => 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=2070'],
                    ['image' => 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=2070'],
                ],
                'styles' => [
                    'parallax' => true,
                    'overlay_opacity' => 0.6
                ]
            ];
        } elseif ($request->block_type === 'Footer') {
            $payload = [
                'company_name' => 'Linz Shell',
                'description' => 'Plataforma para profesionales.',
                'columns' => [
                    ['title' => 'Enlaces', 'links' => [['label' => 'Inicio', 'url' => '/']]],
                ],
                'copyright' => '© 2026 Linz Shell.',
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
