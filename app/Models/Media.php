<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Media extends Model
{
    protected $fillable = [
        'url',
        'name',
        'disk',
        'mime_type',
        'size',
        'user_id'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
