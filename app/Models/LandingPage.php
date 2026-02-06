<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LandingPage extends Model
{
    use HasFactory;

    protected $fillable = ['section_key', 'title', 'content', 'image', 'is_visible', 'order'];

    protected $casts = [
        'is_visible' => 'boolean',
        'content' => 'array',
    ];
}
