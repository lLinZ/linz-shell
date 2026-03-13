<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePageBlockRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'payload_json' => ['required', 'array'],
            'payload_json.*' => ['nullable'],
            
            // Core common fields
            'payload_json.title' => [
                'sometimes',
                'nullable',
                'string',
                'max:255'
            ],
            'payload_json.subtitle' => ['sometimes', 'nullable', 'string', 'max:500'],
            'payload_json.description' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'payload_json.badge' => ['sometimes', 'nullable', 'string', 'max:100'],
            
            // Interactive Hero
            'payload_json.slides' => ['sometimes', 'nullable', 'array'],
            'payload_json.styles' => ['sometimes', 'nullable', 'array'],

            // CTAs
            'payload_json.primary_cta' => ['sometimes', 'nullable', 'array'],
            'payload_json.secondary_cta' => ['sometimes', 'nullable', 'array'],

            // Features Block
            'payload_json.features' => ['sometimes', 'nullable', 'array'],

            // Store Grid
            'payload_json.category' => ['sometimes', 'nullable', 'string'],
            'payload_json.limit' => ['sometimes', 'nullable', 'integer'],

            // Global Footer
            'payload_json.company_name' => ['sometimes', 'nullable', 'string'],
            'payload_json.columns' => ['sometimes', 'nullable', 'array'],
            'payload_json.copyright' => ['sometimes', 'nullable', 'string'],

            // Dynamic Form (Lead Capture)
            'payload_json.form_name' => ['sometimes', 'nullable', 'string'],
            'payload_json.submit_text' => ['sometimes', 'nullable', 'string'],
            'payload_json.fields' => ['sometimes', 'nullable', 'array'],
        ];
    }

    /**
     * Custom messages for validation.
     */
    public function messages(): array
    {
        return [
            'payload_json.title.required_if' => 'El título es obligatorio para este tipo de bloque.',
            'payload_json.badge.required_if' => 'El distintivo (badge) es necesario para bloques Hero.',
            'payload_json.features.required_if' => 'Debes definir al menos una característica.',
            'payload_json.slides.required_if' => 'El Hero interactivo requiere al menos un slide.',
        ];
    }
}
