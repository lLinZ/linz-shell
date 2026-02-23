<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\LandingPage;

class LandingPageSeeder extends Seeder
{
    public function run(): void
    {
        // Limpiamos todo lo anterior para que no queden secciones "fantasma"
        LandingPage::truncate();

        // 1. HERO SECTION
        LandingPage::updateOrCreate(['section_key' => 'hero'], [
            'title' => '¿Necesitas una mano?',
            'content' => [
                'subtitle' => 'Lanza un Trabajo.',
                'badge' => '🔥 La red de servicios más grande de la zona',
                'description' => 'Conecta con los mejores profesionales técnicos de forma rápida, segura y sin complicaciones. Plomería, electricidad, carpintería y mucho más a un clic.',
                'cta_client_text' => 'Busco un Técnico 👤',
                'cta_tech_text' => 'Soy Profesional 👷',
                'bg_image_1' => '', // Background blurs are CSS but could be images
                'bg_image_2' => '',
            ],
            'is_visible' => true,
            'order' => 1,
        ]);

        // 2. HOW IT WORKS - HEADER
        LandingPage::updateOrCreate(['section_key' => 'how_it_works_header'], [
            'title' => '¿Cómo funciona JOBI?',
            'content' => [
                'description' => 'Un proceso simple para conectar soluciones con problemas.',
            ],
            'is_visible' => true,
            'order' => 2,
        ]);

        // 3. STEPS FOR CLIENTS
        LandingPage::updateOrCreate(['section_key' => 'steps_clients'], [
            'title' => 'Para Clientes',
            'content' => [
                'icon' => '👤',
                'items' => [
                    ['title' => 'Lanza tu Trabajo', 'description' => 'Describe tu necesidad (reparación, instalación, etc.), adjunta fotos y dinos dónde estás.'],
                    ['title' => 'Recibe Presupuestos', 'description' => 'Técnicos calificados verán tu requerimiento y te enviarán sus mejores ofertas en dólares.'],
                    ['title' => 'Elige y Soluciona', 'description' => 'Chatea con los interesados, acepta la oferta que más te convenga y obtén sus datos de contacto.'],
                ]
            ],
            'is_visible' => true,
            'order' => 3,
        ]);

        // 4. STEPS FOR TECHNICIANS
        LandingPage::updateOrCreate(['section_key' => 'steps_techs'], [
            'title' => 'Para Técnicos',
            'content' => [
                'icon' => '👷',
                'items' => [
                    ['title' => 'Crea tu Perfil', 'description' => 'Regístrate, selecciona tus categorías profesionales y añade tu información de contacto.'],
                    ['title' => 'Capta Oportunidades', 'description' => 'Recibe notificaciones instantáneas cada vez que alguien necesite un experto en tu área.'],
                    ['title' => 'Gana Dinero', 'description' => 'Envía tus ofertas, chatea con el cliente y cierra el trato. ¡Tú manejas tus propios precios!'],
                ]
            ],
            'is_visible' => true,
            'order' => 4,
        ]);

        // 5. DUAL CTA SECTION
        LandingPage::updateOrCreate(['section_key' => 'dual_cta'], [
            'title' => 'Únete a la comunidad',
            'content' => [
                'client_box_title' => '¿Tienes algo que reparar en casa?',
                'client_box_btn' => '¡Quiero un Técnico! 🚀',
                'client_features' => ['Sin costos ocultos', 'Seguridad y confianza', 'Soporte 24/7'],
                'tech_box_title' => '¿Eres un maestro en tu oficio?',
                'tech_box_btn' => '¡Empezar a Trabajar! 💼',
                'tech_features' => ['Nuevos clientes a diario', 'Tú pones tus precios', 'Sin intermediarios'],
            ],
            'is_visible' => true,
            'order' => 5,
        ]);

        // 6. FOOTER
        LandingPage::updateOrCreate(['section_key' => 'footer'], [
            'title' => 'Footer',
            'content' => [
                'copyright' => '© 2026 JOBI Inc. Todos los derechos reservados.',
                'link_1' => 'Términos',
                'link_2' => 'Privacidad',
                'link_3' => 'Contacto',
            ],
            'is_visible' => true,
            'order' => 6,
        ]);
    }
}
