<?php

namespace App\Services;

use App\Models\Page;
use App\Models\PageBlock;
use Illuminate\Support\Collection;

class PageBlockService
{
    /**
     * Create a new block with default payload.
     */
    public function createBlock(Page $page, string $moduleNamespace, string $blockType): PageBlock
    {
        $lastOrder = PageBlock::where('page_id', $page->id)->max('order') ?? 0;
        
        return PageBlock::create([
            'page_id' => $page->id,
            'module_namespace' => $moduleNamespace,
            'block_type' => $blockType,
            'order' => $lastOrder + 1,
            'payload_json' => $this->getDefaultPayload($blockType)
        ]);
    }

    /**
     * Update an existing block's payload.
     */
    public function updateBlock(PageBlock $block, array $payload): bool
    {
        return $block->update([
            'payload_json' => $payload,
        ]);
    }

    /**
     * Sync block orders.
     */
    public function reorderBlocks(array $blocksData): void
    {
        foreach ($blocksData as $data) {
            PageBlock::where('id', $data['id'])->update(['order' => $data['order']]);
        }
    }

    /**
     * Get default payload based on block type.
     */
    public function getDefaultPayload(string $blockType): array
    {
        return match ($blockType) {
            'Hero' => [
                'badge' => 'NUEVO',
                'title' => 'Título de tu Hero',
                'subtitle' => 'Subtítulo descriptivo',
                'description' => 'Escribe aquí una descripción impactante para tu landing page.',
                'primary_cta' => ['text' => 'Empezar', 'url' => '#'],
                'secondary_cta' => ['text' => 'Saber más', 'url' => '#'],
            ],
            'InteractiveHero' => [
                'badge' => 'EXPERIENCIA PREMIUM',
                'title' => 'Crea Momentos Memorables',
                'description' => 'Efectos parallax, videos de fondo y carruseles fluidos.',
                'primary_cta' => ['text' => 'Comenzar Ahora', 'url' => '#'],
                'slides' => [
                    ['image' => 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=2070'],
                    ['image' => 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=2070'],
                ],
                'styles' => ['parallax' => true, 'overlay_opacity' => 0.6]
            ],
            'ProductGrid' => [
                'title' => 'Nuestros Productos',
                'category' => 'all',
                'limit' => 8,
            ],
            'Features' => [
                'title' => 'Nuestras Ventajas',
                'subtitle' => 'Descubre por qué somos la mejor opción.',
                'features' => [
                    ['title' => 'Rapidez', 'description' => 'Servicio inmediato.', 'icon' => 'Zap', 'color' => '#3b82f6'],
                    ['title' => 'Seguridad', 'description' => 'Garantía total.', 'icon' => 'ShieldCheck', 'color' => '#10b981'],
                ],
            ],
            'Footer' => [
                'company_name' => 'Linz Shell',
                'description' => 'Plataforma para profesionales.',
                'columns' => [
                    ['title' => 'Enlaces', 'links' => [['label' => 'Inicio', 'url' => '/']]],
                ],
                'copyright' => '© ' . date('Y') . ' Linz Shell.',
            ],
            'DynamicForm' => [
                'form_name' => 'Contacto Principal',
                'submit_text' => 'Enviar Mensaje',
                'description' => 'Déjanos tus datos y te contactaremos a la brevedad.',
                'fields' => [
                    ['name' => 'nombre', 'label' => 'Tu Nombre', 'type' => 'text', 'required' => true],
                    ['name' => 'email', 'label' => 'Tu Correo', 'type' => 'email', 'required' => true],
                ]
            ],
            'ReviewsCarousel' => [
                'title' => 'Lo que dicen nuestros clientes',
                'subtitle' => 'Lee las reseñas de personas que ya confían en nosotros.',
                'limit' => 6,
                'sort' => 'recent',
                'selected_ids' => [],
            ],
            default => [],
        };
    }
}
