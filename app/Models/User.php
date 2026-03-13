<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'avatar_color',
        'dark_mode',
        'role',
        'is_active',
    ];

    /**
     * Env-Lock: Automatically downgrade Master role if email doesn't match.
     */
    public function getRoleAttribute($value)
    {
        if ($value === 'master' && $this->email !== config('app.master_email')) {
            return 'admin';
        }
        return $value;
    }

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }
    public function conversations(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(Conversation::class)->withPivot('is_archived');
    }

    public function messages(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Message::class);
    }

    public function isAdmin(): bool
    {
        return in_array($this->role, ['admin', 'master']);
    }

    /**
     * Env-Lock: Master is ONLY the user with the configured MASTER_EMAIL.
     * Use raw role for internal check, accessor handles the rest.
     */
    public function isMaster(): bool
    {
        return $this->getRawOriginal('role') === 'master' && $this->email === config('app.master_email');
    }

    public function isClient(): bool
    {
        return $this->role === 'client';
    }
}
