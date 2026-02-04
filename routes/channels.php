<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\User;
use App\Models\Conversation;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('chat.{conversationId}', function ($user, $conversationId) {
    if ($user->conversations->contains('id', $conversationId)) {
        return ['id' => $user->id, 'name' => $user->name, 'avatar_color' => $user->avatar_color];
    }
});

Broadcast::channel('global.presence', function ($user) {
    return ['id' => $user->id, 'name' => $user->name];
});
