<?php

namespace Database\Seeders;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class ChatSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Create main user (Admin)
        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'avatar_color' => '#ef4444', // Red
            ]
        );

        // 2. Create secondary user (Alice)
        $alice = User::firstOrCreate(
            ['email' => 'alice@example.com'],
            [
                'name' => 'Alice Johnson',
                'password' => Hash::make('password'),
                'role' => 'user',
                'avatar_color' => '#3b82f6', // Blue
            ]
        );

        // 3. Create third user (Bob)
        $bob = User::firstOrCreate(
            ['email' => 'bob@example.com'],
            [
                'name' => 'Bob Smith',
                'password' => Hash::make('password'),
                'role' => 'user',
                'avatar_color' => '#10b981', // Green
            ]
        );

        // 4. Create "General" Public Channel (Conversation)
        // Note: Logic for public channels might differ, but using shared conversation for now
        $generalChat = Conversation::firstOrCreate(
            ['name' => 'General (Public)'],
            ['is_private' => false]
        );

        // Attach all users to General
        if (!$generalChat->users()->where('user_id', $admin->id)->exists()) $generalChat->users()->attach($admin->id);
        if (!$generalChat->users()->where('user_id', $alice->id)->exists()) $generalChat->users()->attach($alice->id);
        if (!$generalChat->users()->where('user_id', $bob->id)->exists()) $generalChat->users()->attach($bob->id);

        // 5. Create Private Chat (Admin <-> Alice)
        $privateChat = Conversation::create([
            'is_private' => true,
            'name' => 'Private: Admin & Alice' // In real app, name is dynamic usually
        ]);
        $privateChat->users()->attach([$admin->id, $alice->id]);

        // 6. Seed Messages
        Message::create([
            'conversation_id' => $generalChat->id,
            'user_id' => $admin->id,
            'body' => 'Welcome to the General channel everyone!',
        ]);

        Message::create([
            'conversation_id' => $generalChat->id,
            'user_id' => $alice->id,
            'body' => 'Hi Admin! Happy to be here.',
        ]);

        Message::create([
            'conversation_id' => $privateChat->id,
            'user_id' => $alice->id,
            'body' => 'Hey Admin, I have a private question.',
        ]);

        Message::create([
            'conversation_id' => $privateChat->id,
            'user_id' => $admin->id,
            'body' => 'Sure Alice, what is it?',
        ]);
    }
}
