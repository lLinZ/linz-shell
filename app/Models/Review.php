<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    protected $fillable = [
        'uuid',
        'rating',
        'comment',
        'photos_json',
        'status',
        'metadata',
        'author_name',
        'author_email',
        'user_id',
        'product_id',
    ];

    protected $casts = [
        'photos_json' => 'array',
        'metadata' => 'array',
        'rating' => 'integer',
        'user_id' => 'integer',
        'product_id' => 'integer',
    ];
}
