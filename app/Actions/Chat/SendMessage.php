<?php

namespace App\Actions\Chat;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use App\Events\MessageSent;

class SendMessage
{
    /**
     * Send a message in a conversation.
     *
     * @param User $user
     * @param Conversation $conversation
     * @param string $body
     * @return Message
     */
    public function handle(User $user, Conversation $conversation, string $body): Message
    {
        /** @var Message $message */
        $message = $conversation->messages()->create([
            'user_id' => $user->id,
            'body' => $body,
        ]);

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
