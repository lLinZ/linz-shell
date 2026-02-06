<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Database\Eloquent\Model;

class ModelUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $model;
    public $action; // 'created', 'updated', 'deleted'
    public $modelName;

    /**
     * Create a new event instance.
     */
    public function __construct(Model $model, string $action)
    {
        $this->model = $model;
        $this->action = $action;
        $this->modelName = class_basename($model);
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        // Broadcast to a generic channel for the model type (e.g., 'model.Product')
        // and specific channel for the model instance (e.g., 'model.Product.1')
        $channels = [
            new Channel('model.' . $this->modelName),
        ];

        if ($this->action !== 'deleted') {
            $channels[] = new Channel('model.' . $this->modelName . '.' . $this->model->id);
        }

        return $channels;
    }

    public function broadcastWith(): array
    {
        return [
            'model' => $this->model,
            'action' => $this->action,
            'model_name' => $this->modelName,
        ];
    }

    public function broadcastAs()
    {
        return 'model.updated';
    }
}
