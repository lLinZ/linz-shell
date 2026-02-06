<?php

namespace App\Traits;

use App\Events\ModelUpdated;

trait BroadcastsState
{
    public static function bootBroadcastsState()
    {
        static::created(function ($model) {
            event(new ModelUpdated($model, 'created'));
        });

        static::updated(function ($model) {
            event(new ModelUpdated($model, 'updated'));
        });

        static::deleted(function ($model) {
            event(new ModelUpdated($model, 'deleted'));
        });
    }
}
