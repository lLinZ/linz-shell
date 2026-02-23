<?php

namespace App\Actions\Chat;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use App\Events\MessageSent;

class SendMessage
{
    public function handle(User $user, Conversation $conversation, string $body, ?int $replyToId = null): Message
    {
        /** @var Message $message */
        $message = $conversation->messages()->create([
            'user_id'     => $user->id,
            'body'        => $body,
            'reply_to_id' => $replyToId,
        ]);

        // Load relations needed for frontend display
        $message->load('user', 'replyTo.user');

        broadcast(new MessageSent($message))->toOthers();

        // Notify other participants (for badges/lists)
        foreach ($conversation->users as $participant) {
            if ($participant->id !== $user->id) {
                broadcast(new \App\Events\NewMessageNotification($message, $participant));
            }
        }

        return $message;
    }
}
