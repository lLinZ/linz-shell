<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;

class ChatController extends Controller
{
    /**
     * Display the chat dashboard.
     */
    public function index(): Response
    {
        $user = Auth::user();

        $conversations = $user->conversations()
            ->with(['users']) // Eager load users to find the 'other' person
            ->get()
            ->map(function ($conversation) use ($user) {
                if ($conversation->is_private) {
                    $otherUser = $conversation->users->firstWhere('id', '!==', $user->id);
                    if ($otherUser) {
                        $conversation->name = $otherUser->name;
                        // pass other user info if needed
                        $conversation->avatar_color = $otherUser->avatar_color;
                        $conversation->other_user_id = $otherUser->id;
                    }
                }
                return $conversation;
            });

        return Inertia::render('Chat/Index', [
            'conversations' => $conversations,
            'allUsers' => \App\Models\User::where('id', '!=', $user->id)
                ->select('id', 'name', 'email', 'avatar_color')
                ->get(),
        ]);
    }

    /**
     * Store a new message.
     */
    public function store(Request $request, \App\Models\Conversation $conversation, \App\Actions\Chat\SendMessage $sendMessageAction)
    {
        $request->validate([
            'body'        => 'required|string|max:5000',
            'reply_to_id' => 'nullable|integer|exists:messages,id',
        ]);

        // Security check: Ensure user belongs to conversation
        if (!$conversation->users()->where('user_id', Auth::id())->exists()) {
            abort(403);
        }

        $message = $sendMessageAction->handle(
            Auth::user(),
            $conversation,
            $request->input('body'),
            $request->input('reply_to_id')
        );

        return response()->json($message);
    }

    /**
     * Get messages for a conversation (with reactions and reply-to).
     * Reactions are normalized to the same grouped format returned by react():
     * { '👍': [{id, name}, ...], '❤️': [...] }
     */
    public function messages(\App\Models\Conversation $conversation)
    {
        // Security check
        if (!$conversation->users()->where('user_id', Auth::id())->exists()) {
            abort(403);
        }

        $paginated = $conversation->messages()
            ->with([
                'user:id,name,avatar_color',
                'replyTo.user:id,name,avatar_color',
                'reactions.user:id,name',
            ])
            ->latest()
            ->cursorPaginate(20);

        // Normalize reactions to { emoji: [{id, name}] } — same shape as react() response
        $paginated->through(function ($message) {
            $reactions = $message->reactions ?? collect([]);
            
            $grouped = $reactions
                ->groupBy('emoji')
                ->map(fn($group) => $group->map(fn($r) => [
                    'id'   => $r->user_id,
                    'name' => $r->user->name,
                ]));
            
            $message->unsetRelation('reactions');
            $message->setAttribute('reactions', $grouped);
            
            return $message;
        });

        return $paginated;
    }

    /**
     * Update conversation name.
     */
    public function updateName(Request $request, \App\Models\Conversation $conversation)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        // Authorization: Only admin can rename
        if (Auth::user()->role !== 'admin') {
            abort(403, 'Unauthorized');
        }

        $conversation->update(['name' => $request->name]);

        return response()->json($conversation);
    }

    /**
     * Get users in a conversation.
     */
    public function users(\App\Models\Conversation $conversation)
    {
        // Security check
        if (!$conversation->users()->where('user_id', Auth::id())->exists()) {
            abort(403);
        }

        return $conversation->users()->select('users.id', 'users.name', 'users.email', 'users.avatar_color')->get();
    }

    /**
     * Add a user to the conversation.
     */
    public function addParticipant(Request $request, \App\Models\Conversation $conversation)
    {
        $request->validate(['user_id' => 'required|exists:users,id']);

        // Authorization: Only admin can add
        if (Auth::user()->role !== 'admin') {
            abort(403, 'Unauthorized');
        }

        $conversation->users()->attach($request->user_id);

        return response()->json(['message' => 'User added']);
    }

    /**
     * Remove a user from the conversation.
     */
    public function removeParticipant(Request $request, \App\Models\Conversation $conversation)
    {
        $request->validate(['user_id' => 'required|exists:users,id']);

        // Authorization: Only admin can remove
        if (Auth::user()->role !== 'admin') {
            abort(403, 'Unauthorized');
        }

        $conversation->users()->detach($request->user_id);

        return response()->json(['message' => 'User removed']);
    }

    /**
     * Toggle an emoji reaction on a message.
     */
    public function react(Request $request, \App\Models\Message $message)
    {
        $request->validate([
            'emoji' => 'required|string|max:20',
        ]);

        // Security: user must belong to the conversation
        if (!$message->conversation->users()->where('user_id', Auth::id())->exists()) {
            abort(403);
        }

        $existing = \App\Models\MessageReaction::where([
            'message_id' => $message->id,
            'user_id'    => Auth::id(),
            'emoji'      => $request->emoji,
        ])->first();

        if ($existing) {
            $existing->delete();
        } else {
            \App\Models\MessageReaction::create([
                'message_id' => $message->id,
                'user_id'    => Auth::id(),
                'emoji'      => $request->emoji,
            ]);
        }

        // Reload and group reactions: { '👍': [{id, name}], ... }
        $message->load('reactions.user:id,name');
        $grouped = $message->reactions
            ->groupBy('emoji')
            ->map(fn($group) => $group->map(fn($r) => ['id' => $r->user_id, 'name' => $r->user->name]))
            ->toArray();

        // Broadcast to all others in the channel
        broadcast(new \App\Events\ReactionToggled(
            $message->id,
            $message->conversation_id,
            $grouped
        ))->toOthers();

        return response()->json($grouped);
    }

    /**
     * Search users not in conversation.
     */
    public function searchUsers(Request $request, \App\Models\Conversation $conversation)
    {
        // Authorization: Only admin can search to add
        if (Auth::user()->role !== 'admin') {
            abort(403, 'Unauthorized');
        }

        $query = $request->input('query');

        return \App\Models\User::whereNotIn('id', $conversation->users->pluck('id'))
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                    ->orWhere('email', 'like', "%{$query}%");
            })
            ->select('id', 'name', 'email', 'avatar_color')
            ->take(10)
            ->get();
    }

    /**
     * Search all users for new chats.
     */
    public function searchAllUsers(Request $request)
    {
        $query = $request->input('query');
        if (!$query) return [];

        return \App\Models\User::where('id', '!=', Auth::id())
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                    ->orWhere('email', 'like', "%{$query}%");
            })
            ->select('id', 'name', 'email', 'avatar_color')
            ->take(10)
            ->get();
    }

    /**
     * Start or get existing private chat with a user.
     */
    public function startPrivateChat(\App\Models\User $user)
    {
        $authId = Auth::id();
        $targetId = $user->id;

        // Check if private conversation exists
        $existingConversation = \App\Models\Conversation::where('is_private', true)
            ->whereHas('users', function ($q) use ($authId) {
                $q->where('user_id', $authId);
            })
            ->whereHas('users', function ($q) use ($targetId) {
                $q->where('user_id', $targetId);
            })
            ->first();

        if ($existingConversation) {
            // For the response, we might want to ensure the name is set correctly for the frontend if using the simplistic logic
            // But the frontend usually handles name on load. 
            // Let's just return it.
            return response()->json($existingConversation);
        }

        // Create new private conversation
        $conversation = \App\Models\Conversation::create([
            'name' => 'Private Chat', // Placeholder, frontend/backend logic usually overrides this for private chats
            'is_private' => true,
        ]);

        $conversation->users()->attach([$authId, $targetId]);

        return response()->json($conversation);
    }

    /**
     * Create a new group conversation.
     */
    public function storeGroup(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        // Authorization: Only admin can create groups
        if (Auth::user()->role !== 'admin') {
            abort(403, 'Unauthorized');
        }

        $conversation = \App\Models\Conversation::create([
            'name' => $request->name,
            'is_private' => false,
        ]);

        $conversation->users()->attach(Auth::id());

        return response()->json($conversation);
    }
}
