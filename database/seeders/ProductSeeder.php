<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = [
            [
                'name' => 'Franela JOBI Premium',
                'description' => 'Franela de algodón 100% con bordado de alta calidad. Edición limitada JOBI.',
                'price' => 25.00,
                'stock' => 50,
                'image_url' => 'https://placehold.co/400x400/312e81/ffffff?text=Franela+JOBI',
                'is_active' => true,
            ],
            [
                'name' => 'Gorra Trucker Linz',
                'description' => 'Gorra estilo trucker con rejilla transpirable y logo Linz bordado.',
                'price' => 15.00,
                'stock' => 100,
                'image_url' => 'https://placehold.co/400x400/1e293b/ffffff?text=Gorra+Linz',
                'is_active' => true,
            ],
            [
                'name' => 'Servicio de Inspección',
                'description' => 'Inspección técnica profesional para equipos industriales y soporte especializado.',
                'price' => 150.00,
                'stock' => 1, // Service, dummy stock
                'image_url' => 'https://placehold.co/400x400/4f46e5/ffffff?text=Inspeccion+Tecnica',
                'is_active' => true,
            ],
            [
                'name' => 'Módulo de Soporte Premium',
                'description' => 'Acceso prioritario a nuestro equipo de soporte técnico 24/7 durante 30 días.',
                'price' => 45.00,
                'stock' => 999,
                'image_url' => 'https://placehold.co/400x400/0ea5e9/ffffff?text=Soporte+Premium',
                'is_active' => true,
            ],
            [
                'name' => 'Manual de Usuario JOBI',
                'description' => 'Guía completa ilustrada para dominar todas las funcionalidades de la plataforma.',
                'price' => 10.00,
                'stock' => 200,
                'image_url' => 'https://placehold.co/400x400/6366f1/ffffff?text=Manual+JOBI',
                'is_active' => true,
            ],
            [
                'name' => 'Taza Cerámica Linz',
                'description' => 'Taza de cerámica resistente al microondas con diseño exclusivo Linz Shell.',
                'price' => 12.00,
                'stock' => 75,
                'image_url' => 'https://placehold.co/400x400/334155/ffffff?text=Taza+Linz',
                'is_active' => true,
            ],
            [
                'name' => 'Kit de Mantenimiento',
                'description' => 'Herramientas básicas y lubricantes para el mantenimiento preventivo de hardware.',
                'price' => 85.00,
                'stock' => 30,
                'image_url' => 'https://placehold.co/400x400/4338ca/ffffff?text=Kit+Mantenimiento',
                'is_active' => true,
            ],
            [
                'name' => 'Suscripción Desarrollador',
                'description' => 'Licencia anual para el uso de APIs avanzadas y herramientas de integración.',
                'price' => 299.00,
                'stock' => 999,
                'image_url' => 'https://placehold.co/400x400/0f172a/ffffff?text=Suscripcion+Dev',
                'is_active' => true,
            ],
        ];

        foreach ($products as $product) {
            Product::create(array_merge($product, [
                'slug' => Str::slug($product['name']),
            ]));
        }
    }
}
