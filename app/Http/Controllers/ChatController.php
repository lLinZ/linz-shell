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
            'body' => 'required|string|max:5000',
        ]);

        // Security check: Ensure user belongs to conversation
        if (!$conversation->users()->where('user_id', Auth::id())->exists()) {
            abort(403);
        }

        $message = $sendMessageAction->handle(
            Auth::user(),
            $conversation,
            $request->input('body')
        );

        // Load relationships for the frontend to display correctly immediately (e.g. user name/avatar)
        $message->load('user');

        return response()->json($message);
    }

    /**
     * Get messages for a conversation.
     */
    public function messages(\App\Models\Conversation $conversation)
    {
        // Security check
        if (!$conversation->users()->where('user_id', Auth::id())->exists()) {
            abort(403);
        }

        // Use cursor pagination for infinite scroll
        $messages = $conversation->messages()
            ->with('user')
            ->latest()
            ->cursorPaginate(20);

        return $messages;
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
}
