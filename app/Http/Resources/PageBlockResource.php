<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PageBlockResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'page_id' => $this->page_id,
            'module_namespace' => $this->module_namespace,
            'block_type' => $this->block_type,
            'payload_json' => $this->payload_json,
            'order' => $this->order,
            // Omitimos timestamps internos para limpiar la respuesta del API
            // y facilitar la reconciliación de datos en el frontend.
        ];
    }
}
