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

        // 2. Insertar Hero Block
        PageBlock::create([
            'page_id' => $page->id,
            'module_namespace' => 'Core',
            'block_type' => 'Hero',
            'order' => 1,
            'payload_json' => [
                'badge' => 'Prueba de Vida - SaaS Core',
                'title' => '¿Necesitas una mano?',
                'subtitle' => 'Lanza un Trabajo.',
                'description' => 'Conecta con los mejores profesionales técnicos de forma rápida, segura y sin complicaciones. Plomería, electricidad, carpintería y mucho más a un clic.',
                'primary_cta' => ['text' => 'Busco un Técnico 👤', 'url' => '/register?role=client'],
                'secondary_cta' => ['text' => 'Soy Profesional 👷', 'url' => '/register?role=technician']
            ]
        ]);
    }
}
