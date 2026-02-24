<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Page;
use App\Models\PageBlock;

class PageSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Crear página de Inicio
        $page = Page::updateOrCreate(
            ['slug' => 'welcome'],
            ['title' => 'Inicio', 'is_published' => true]
        );

        // Limpiar bloques existentes para evitar duplicados en la prueba
        $page->blocks()->delete();

        // 2. Insertar InteractiveHero Block (Premium)
        PageBlock::create([
            'page_id' => $page->id,
            'module_namespace' => 'Core',
            'block_type' => 'InteractiveHero',
            'order' => 1,
            'payload_json' => [
                'badge' => 'Experiencia Premium',
                'title' => 'Crea Momentos Memorables',
                'description' => 'Efectos parallax, videos de fondo y carruseles fluidos para captar la atención de tus clientes desde el primer segundo.',
                'primary_cta' => ['text' => 'Comenzar Ahora', 'url' => '/register'],
                'secondary_cta' => ['text' => 'Ver Tienda', 'url' => '/shop'],
                'slides' => [
                    ['image' => 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=2000'],
                    ['image' => 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=2000'],
                    ['image' => 'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&q=80&w=2000'],
                ],
                'styles' => [
                    'parallax' => true,
                    'overlay_opacity' => 0.4
                ]
            ]
        ]);
    }
}
