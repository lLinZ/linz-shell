<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'user_id',
        'session_id',
        'customer_name',
        'customer_email',
        'customer_phone',
        'customer_address',
        'status',
        'is_manual',
        'manual_label',
        'total',
    ];

    protected $casts = [
        'is_manual' => 'boolean',
    ];

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function notes()
    {
        return $this->hasMany(OrderNote::class)->with('user:id,name,avatar_color')->latest();
    }
}
