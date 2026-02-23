# 💬 Guía: Reacciones y Respuestas a Mensajes en el Chat

> Documento técnico para implementar reacciones (emoji) y respuestas a mensajes (reply) en el sistema de chat LinZ Shell.

---

## 📋 Resumen de Funcionalidades

| Feature | Dificultad | Tiempo Estimado |
|---|---|---|
| Menú contextual (click derecho) | ⭐⭐ | 1-2h |
| Responder a un mensaje (quote/reply) | ⭐⭐⭐ | 3-4h |
| Reacciones con emoji | ⭐⭐⭐⭐ | 4-6h |
| Tiempo presionado en móvil (long-press) | ⭐⭐ | 1h |

---

## 🗂️ PARTE 1: Base de Datos (Backend Laravel)

### 1.1 – Agregar `reply_to_id` a la tabla `messages`

Crea una nueva migración:

```bash
php artisan make:migration add_reply_to_id_to_messages_table
```

```php
// database/migrations/xxxx_add_reply_to_id_to_messages_table.php
public function up(): void
{
    Schema::table('messages', function (Blueprint $table) {
        $table->foreignId('reply_to_id')
              ->nullable()
              ->constrained('messages')
              ->nullOnDelete();
    });
}
```

### 1.2 – Crear tabla `message_reactions`

```bash
php artisan make:migration create_message_reactions_table
```

```php
// database/migrations/xxxx_create_message_reactions_table.php
public function up(): void
{
    Schema::create('message_reactions', function (Blueprint $table) {
        $table->id();
        $table->foreignId('message_id')->constrained()->cascadeOnDelete();
        $table->foreignId('user_id')->constrained()->cascadeOnDelete();
        $table->string('emoji', 10); // e.g. '👍', '❤️', '😂'
        $table->timestamps();

        // Un usuario solo puede reaccionar una vez por emoji por mensaje
        $table->unique(['message_id', 'user_id', 'emoji']);
    });
}
```

Luego corre: `php artisan migrate`

---

## 🏗️ PARTE 2: Modelos (Backend)

### 2.1 – Actualizar `app/Models/Message.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Message extends Model
{
    use HasFactory;

    protected $fillable = ['conversation_id', 'user_id', 'body', 'reply_to_id'];

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // El mensaje al que se está respondiendo
    public function replyTo(): BelongsTo
    {
        return $this->belongsTo(Message::class, 'reply_to_id')
                    ->with('user'); // Cargar el autor del mensaje original
    }

    // Las reacciones de este mensaje
    public function reactions(): HasMany
    {
        return $this->hasMany(MessageReaction::class);
    }
}
```

### 2.2 – Crear `app/Models/MessageReaction.php`

```bash
php artisan make:model MessageReaction
```

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MessageReaction extends Model
{
    protected $fillable = ['message_id', 'user_id', 'emoji'];

    public function message(): BelongsTo
    {
        return $this->belongsTo(Message::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
```

---

## 🎮 PARTE 3: Controlador (Backend)

### 3.1 – Actualizar `ChatController.php`

#### Actualizar el método `store` para soportar `reply_to_id`

```php
public function store(Request $request, \App\Models\Conversation $conversation, \App\Actions\Chat\SendMessage $sendMessageAction)
{
    $request->validate([
        'body' => 'required|string|max:5000',
        'reply_to_id' => 'nullable|integer|exists:messages,id',
    ]);

    if (!$conversation->users()->where('user_id', Auth::id())->exists()) {
        abort(403);
    }

    $message = $sendMessageAction->handle(
        Auth::user(),
        $conversation,
        $request->input('body'),
        $request->input('reply_to_id') // ← Nuevo parámetro
    );

    $message->load('user', 'replyTo.user'); // ← Cargar replies también

    return response()->json($message);
}
```

#### Actualizar el método `messages` para cargar reacciones y replies

```php
public function messages(\App\Models\Conversation $conversation)
{
    if (!$conversation->users()->where('user_id', Auth::id())->exists()) {
        abort(403);
    }

    $messages = $conversation->messages()
        ->with([
            'user:id,name,avatar_color',
            'replyTo.user:id,name',          // ← Mensaje citado
            'reactions.user:id,name',         // ← Reacciones
        ])
        ->latest()
        ->cursorPaginate(30);

    return response()->json($messages);
}
```

#### Agregar métodos para reacciones

```php
/**
 * Agregar o quitar una reacción (toggle)
 */
public function react(Request $request, \App\Models\Message $message)
{
    $request->validate([
        'emoji' => 'required|string|max:10',
    ]);

    // Verificar que el usuario pertenece a la conversación del mensaje
    if (!$message->conversation->users()->where('user_id', Auth::id())->exists()) {
        abort(403);
    }

    $existing = \App\Models\MessageReaction::where([
        'message_id' => $message->id,
        'user_id'    => Auth::id(),
        'emoji'      => $request->emoji,
    ])->first();

    if ($existing) {
        // Ya existe → quitar la reacción (toggle)
        $existing->delete();
    } else {
        // No existe → agregar reacción
        \App\Models\MessageReaction::create([
            'message_id' => $message->id,
            'user_id'    => Auth::id(),
            'emoji'      => $request->emoji,
        ]);
    }

    // Recargar y devolver reacciones agrupadas
    $message->load('reactions.user');
    
    // Agrupar reacciones: { '👍': [{id, name}, ...], '❤️': [...] }
    $grouped = $message->reactions->groupBy('emoji')->map(function ($reactions) {
        return $reactions->map(fn($r) => ['id' => $r->user_id, 'name' => $r->user->name]);
    });

    // Broadcast via WebSocket para que los demás también vean la reacción
    broadcast(new \App\Events\ReactionToggled($message, $grouped, Auth::id()))
        ->toOthers();

    return response()->json($grouped);
}
```

### 3.2 – Actualizar `SendMessage` Action

```php
// app/Actions/Chat/SendMessage.php
public function handle(User $user, Conversation $conversation, string $body, ?int $replyToId = null): Message
{
    $message = $conversation->messages()->create([
        'user_id'     => $user->id,
        'body'        => $body,
        'reply_to_id' => $replyToId, // ← Nuevo
    ]);

    broadcast(new MessageSent($message->load('user', 'replyTo.user')))->toOthers();

    return $message;
}
```

---

## 📡 PARTE 4: Rutas

```php
// routes/web.php — agregar estas rutas dentro del grupo de chat:

Route::post('/chat/messages/{message}/react', [ChatController::class, 'react'])
    ->name('chat.react');
```

---

## ⚡ PARTE 5: Evento WebSocket para Reacciones

```bash
php artisan make:event ReactionToggled
```

```php
// app/Events/ReactionToggled.php
<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class ReactionToggled implements ShouldBroadcast
{
    use InteractsWithSockets;

    public function __construct(
        public readonly Message $message,
        public readonly mixed $reactions,
        public readonly int $userId
    ) {}

    public function broadcastOn(): PresenceChannel
    {
        return new PresenceChannel("chat.{$this->message->conversation_id}");
    }

    public function broadcastWith(): array
    {
        return [
            'message_id' => $this->message->id,
            'reactions'  => $this->reactions,
        ];
    }
}
```

---

## 🎨 PARTE 6: Frontend React

### 6.1 – Actualizar el Hook `useChat.ts`

Agrega estas modificaciones:

```typescript
// En el canal de Echo, escuchar el nuevo evento de reacciones:
.listen('ReactionToggled', (e: any) => {
    setMessages(prev => prev.map(msg =>
        msg.id === e.message_id
            ? { ...msg, reactions: e.reactions }
            : msg
    ));
})

// Nueva función para enviar reacciones:
const reactToMessage = async (messageId: number, emoji: string) => {
    try {
        const response = await axios.post(`/chat/messages/${messageId}/react`, { emoji });
        // Actualizar localmente (optimistic update)
        setMessages(prev => prev.map(msg =>
            msg.id === messageId
                ? { ...msg, reactions: response.data }
                : msg
        ));
    } catch (error) {
        console.error("Failed to react", error);
    }
};

// Función para responder a un mensaje:
// Solo necesitas pasar reply_to_id al sendMessage
const sendMessage = async (body: string, replyToId?: number) => {
    if (!conversationId) return;
    try {
        const response = await axios.post(`/chat/${conversationId}/messages`, {
            body,
            reply_to_id: replyToId ?? null,
        });
        setMessages(prev => [...prev, response.data]);
    } catch (error) {
        console.error("Failed to send message:", error);
    }
};
```

### 6.2 – Actualizar `MessageBubble.tsx` (completo)

```tsx
import * as React from "react"
import { useState, useRef } from "react"
import { cn } from "@/lib/utils"
import Avatar from "@/Components/ui/Avatar"
import { Typography } from "@/Components/ui/Typography"
import { Reply, MoreVertical } from "lucide-react"

// Emojis disponibles para reaccionar
const EMOJI_LIST = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

interface MessageBubbleProps {
    message: {
        id: number
        body: string
        created_at: string
        user_id: number
        user?: any
        reply_to?: {          // ← Nuevo
            id: number
            body: string
            user?: { name: string }
        }
        reactions?: {         // ← Nuevo: { '👍': [{id, name}], ... }
            [emoji: string]: Array<{ id: number; name: string }>
        }
    }
    isMe: boolean
    currentUserId: number    // ← Nuevo: necesario para saber si YO ya reaccioné
    onReact: (messageId: number, emoji: string) => void   // ← Nuevo
    onReply: (message: any) => void                       // ← Nuevo
}

export default function MessageBubble({ message, isMe, currentUserId, onReact, onReply }: MessageBubbleProps) {
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showContextMenu, setShowContextMenu] = useState(false);
    const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });
    const longPressTimer = useRef<NodeJS.Timeout | null>(null);

    // -------- Long Press para móvil --------
    const handleTouchStart = () => {
        longPressTimer.current = setTimeout(() => {
            setShowContextMenu(true);
        }, 500); // 500ms = long press
    };

    const handleTouchEnd = () => {
        if (longPressTimer.current) clearTimeout(longPressTimer.current);
    };

    // -------- Click derecho (desktop) --------
    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        setContextMenuPos({ x: e.clientX, y: e.clientY });
        setShowContextMenu(true);
    };

    // -------- Cerrar menus al click fuera --------
    React.useEffect(() => {
        const close = () => {
            setShowContextMenu(false);
            setShowEmojiPicker(false);
        };
        if (showContextMenu || showEmojiPicker) {
            window.addEventListener('click', close, { once: true });
        }
        return () => window.removeEventListener('click', close);
    }, [showContextMenu, showEmojiPicker]);

    // -------- Agrupar reacciones para mostrar conteo --------
    const reactionEntries = Object.entries(message.reactions || {});

    return (
        <div
            className={cn(
                "group flex w-full mt-2 space-x-3 max-w-[85%] md:max-w-[70%] relative",
                isMe ? "ml-auto justify-end space-x-reverse" : ""
            )}
            onContextMenu={handleContextMenu}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchMove={handleTouchEnd}
        >
            {/* Avatar */}
            {!isMe && (
                <div className="flex-shrink-0">
                    <Avatar name={message.user?.name || "?"} color={message.user?.avatar_color} size="sm" />
                </div>
            )}

            <div className="flex flex-col">
                {/* Cita del mensaje al que responde */}
                {message.reply_to && (
                    <div className={cn(
                        "text-xs px-3 py-1.5 rounded-xl mb-1 border-l-2 border-[var(--color-primary)] bg-[var(--color-bg-tertiary)] opacity-80 max-w-[200px] truncate",
                        isMe ? "ml-auto" : ""
                    )}>
                        <span className="font-semibold text-[var(--color-primary)] block">
                            {message.reply_to.user?.name}
                        </span>
                        <span className="text-[var(--color-text-muted)] truncate block">
                            {message.reply_to.body}
                        </span>
                    </div>
                )}

                {/* Burbuja del mensaje */}
                <div
                    className={cn(
                        "relative p-3 rounded-2xl shadow-sm",
                        isMe
                            ? "bg-[var(--color-primary)] text-white rounded-tr-none"
                            : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] rounded-tl-none border border-[var(--color-border)]"
                    )}
                >
                    {!isMe && (
                        <Typography variant="small" className="text-[var(--color-primary)] font-bold mb-1 block text-xs">
                            {message.user?.name}
                        </Typography>
                    )}
                    <Typography variant="p" className="m-0 leading-relaxed break-words whitespace-pre-wrap text-sm">
                        {message.body}
                    </Typography>
                    <span className={cn(
                        "text-[10px] block mt-1 opacity-70 text-right",
                        isMe ? "text-white/80" : "text-[var(--color-text-muted)]"
                    )}>
                        {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>

                    {/* Botón de emoji — visible al hover en desktop */}
                    <button
                        className={cn(
                            "absolute -bottom-3 opacity-0 group-hover:opacity-100 transition-opacity",
                            "bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-full p-1 text-sm shadow-sm",
                            isMe ? "left-2" : "right-2"
                        )}
                        onClick={(e) => { e.stopPropagation(); setShowEmojiPicker(v => !v); }}
                    >
                        😊
                    </button>
                </div>

                {/* Reacciones existentes */}
                {reactionEntries.length > 0 && (
                    <div className={cn("flex flex-wrap gap-1 mt-1", isMe ? "justify-end" : "justify-start")}>
                        {reactionEntries.map(([emoji, users]) => {
                            const iReacted = users.some(u => u.id === currentUserId);
                            return (
                                <button
                                    key={emoji}
                                    onClick={() => onReact(message.id, emoji)}
                                    className={cn(
                                        "flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs border transition-all",
                                        iReacted
                                            ? "bg-[var(--color-primary)]/20 border-[var(--color-primary)] text-[var(--color-primary)]"
                                            : "bg-[var(--color-bg-tertiary)] border-[var(--color-border)] hover:border-[var(--color-primary)]"
                                    )}
                                >
                                    {emoji} {users.length}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Emoji Picker flotante */}
            {showEmojiPicker && (
                <div
                    className={cn(
                        "absolute bottom-8 z-50 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl shadow-xl p-2 flex gap-1",
                        isMe ? "right-0" : "left-0"
                    )}
                    onClick={e => e.stopPropagation()}
                >
                    {EMOJI_LIST.map(emoji => (
                        <button
                            key={emoji}
                            className="text-xl hover:scale-125 transition-transform"
                            onClick={() => { onReact(message.id, emoji); setShowEmojiPicker(false); }}
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            )}

            {/* Context Menu (click derecho / long press) */}
            {showContextMenu && (
                <div
                    className="fixed z-[100] bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl shadow-2xl py-1 min-w-[160px]"
                    style={{ top: contextMenuPos.y, left: contextMenuPos.x }}
                    onClick={e => e.stopPropagation()}
                >
                    <button
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition-colors"
                        onClick={() => { onReply(message); setShowContextMenu(false); }}
                    >
                        <Reply className="w-4 h-4" /> Responder
                    </button>
                    <button
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition-colors"
                        onClick={() => { setShowEmojiPicker(true); setShowContextMenu(false); }}
                    >
                        😊 Reaccionar
                    </button>
                    <button
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition-colors"
                        onClick={() => { navigator.clipboard.writeText(message.body); setShowContextMenu(false); }}
                    >
                        📋 Copiar texto
                    </button>
                    {/* Solo si el mensaje es mío */}
                    {isMe && (
                        <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition-colors">
                            🗑️ Eliminar
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
```

### 6.3 – Actualizar `ChatInput.tsx` para mostrar el reply

Agrega un estado `replyTo` en `ChatWindow.tsx` y pásalo a `ChatInput`:

```tsx
// En ChatWindow.tsx
const [replyingTo, setReplyingTo] = useState<any | null>(null);

// Y pásalo así:
<ChatInput
    onSendMessage={(body) => sendMessage(body, replyingTo?.id)}
    onTyping={sendTyping}
    replyingTo={replyingTo}
    onCancelReply={() => setReplyingTo(null)}
/>

// Y en MessageList:
<MessageList
    ...
    onReact={reactToMessage}
    onReply={(msg) => setReplyingTo(msg)}
    currentUserId={currentUser.id}
/>
```

```tsx
// En ChatInput.tsx — agregar encima del input:
{replyingTo && (
    <div className="flex items-center justify-between px-4 py-2 bg-[var(--color-bg-tertiary)] border-b border-[var(--color-border)] rounded-t-2xl">
        <div className="flex items-center gap-2 text-xs">
            <div className="w-0.5 h-8 bg-[var(--color-primary)] rounded-full" />
            <div>
                <span className="font-semibold text-[var(--color-primary)] block">
                    {replyingTo.user?.name}
                </span>
                <span className="text-[var(--color-text-muted)] truncate max-w-[200px] block">
                    {replyingTo.body}
                </span>
            </div>
        </div>
        <button onClick={onCancelReply} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
            ✕
        </button>
    </div>
)}
```

---

## 📱 PARTE 7: Long Press en Móvil

El long press ya está implementado en el `MessageBubble` de arriba con:

```tsx
const longPressTimer = useRef<NodeJS.Timeout | null>(null);

const handleTouchStart = () => {
    longPressTimer.current = setTimeout(() => {
        setShowContextMenu(true); // Abre el menú contextual después de 500ms
    }, 500);
};

const handleTouchEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
};
```

Y en el div del mensaje:
```tsx
onTouchStart={handleTouchStart}
onTouchEnd={handleTouchEnd}
onTouchMove={handleTouchEnd}  // Cancela si el user está haciendo scroll
```

---

## 📋 Checklist de Implementación

### Backend
- [ ] Crear migración `add_reply_to_id_to_messages_table`
- [ ] Crear migración `create_message_reactions_table`
- [ ] `php artisan migrate`
- [ ] Actualizar `Message.php` con relaciones `replyTo()` y `reactions()`
- [ ] Crear `MessageReaction.php` model
- [ ] Actualizar `ChatController::store()` para `reply_to_id`
- [ ] Actualizar `ChatController::messages()` para cargar reacciones/replies
- [ ] Agregar `ChatController::react()` método
- [ ] Actualizar `SendMessage` action para `reply_to_id`
- [ ] Crear `ReactionToggled` event + broadcast
- [ ] Agregar ruta `POST /chat/messages/{message}/react`

### Frontend
- [ ] Actualizar `useChat.ts`: agregar `reactToMessage()`, escuchar `ReactionToggled`
- [ ] Actualizar `useChat.ts`: `sendMessage` acepta `replyToId` opcional
- [ ] Reemplazar `MessageBubble.tsx` con el nuevo (incluye context menu, emoji picker, long press, reply quote)
- [ ] Actualizar `ChatWindow.tsx`: estado `replyingTo`, pasar props a `MessageList` y `ChatInput`
- [ ] Actualizar `ChatInput.tsx`: mostrar el preview del mensaje citado con botón de cancelar
- [ ] Pasar `currentUserId` desde `ChatWindow` a `MessageList` y `MessageBubble`

---

## 🎯 Tips Importantes

1. **Optimistic Updates**: En el frontend, actualiza el estado localmente antes de recibir confirmación del servidor para que la UI responda instantáneamente.

2. **El Context Menu debe cerrarse** cuando el usuario hace click en cualquier otro lugar. El `useEffect` con `window.addEventListener('click', close, { once: true })` maneja esto.

3. **Posición del Context Menu (IMPORTANTE)**: No uses coordenadas del cursor (`event.clientX/Y`) porque el popup puede quedar fuera de la pantalla cuando el mensaje está cerca del borde. En cambio, usa `position: absolute; bottom: 100%` dentro del contenedor del mensaje, alineado al mismo lado que la burbuja (izquierda para mensajes ajenos, derecha para los propios). Esto garantiza que el menú siempre aparezca encima del mensaje y dentro de la pantalla.

4. **Datos de reactions en el backend**: Cuando cargas mensajes, devuelve las reactions agrupadas por emoji con los usuarios. Así el frontend puede mostrar `👍 3` y saber si el usuario actual ya reaccionó.

5. **Broadcast de reactions**: Usa `broadcast(...)->toOthers()` para que el que hizo la reacción no reciba el evento (ya actualiza localmente por el response del axios).

6. **Chat privado vs. grupo**: En chats privados (`is_private = true`), NO mostrar el avatar ni el nombre del remitente en los mensajes de la otra persona — el contexto ya es claro. Solo en grupos se necesita identificar quién escribió. Pasa `isPrivate` como prop desde `ChatWindow` → `MessageList` → `MessageBubble` y usa `const showSenderInfo = !isPrivate && !isMe` para condicionar el avatar y el nombre.


Aquí un resumen de lo que cubre la guía:

🗂️ Lo que necesitas hacer (en orden):
Backend primero:

2 migraciones nuevas: agregar reply_to_id a 
messages
 + crear tabla message_reactions
Actualizar 
Message.php
: agregar relaciones replyTo() y reactions()
Crear MessageReaction.php: modelo simple
Actualizar 
ChatController
: el 
store
 acepta reply_to_id, el 
messages
 carga reacciones, nuevo método react() (toggle: si ya reaccionaste, la quita)
Crear evento ReactionToggled: para broadcast en tiempo real via Reverb
Frontend después: 6. 
useChat.ts
: agregar reactToMessage() + escuchar el evento WebSocket 7. 
MessageBubble.tsx
: el más complejo — incluye el emoji picker al hover, context menu (click derecho desktop / long press móvil 500ms), y renderizado de la cita del reply 8. 
ChatWindow.tsx
: estado replyingTo + pasar props 9. 
ChatInput.tsx
: mostrar preview del mensaje que estás respondiendo

La parte más difícil es sincronizar el estado de reacciones en tiempo real — pero con el broadcast de ReactionToggled y el listener en 
useChat
 se resuelve limpiamente. 🚀