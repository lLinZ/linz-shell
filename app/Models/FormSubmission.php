<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FormSubmission extends Model
{
    protected $fillable = [
        'form_name',
        'data'
    ];

    protected $casts = [
        'data' => 'array'
    ];
}
