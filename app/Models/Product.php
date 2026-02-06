<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\BroadcastsState;

class Product extends Model
{
    use HasFactory;
    use BroadcastsState;

    protected $fillable = [
        'name',
        'description',
        'price',
        'is_active',
        'stock', // Add stock
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'price' => 'decimal:2',
    ];
}
