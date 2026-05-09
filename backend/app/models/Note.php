<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Note extends Model
{
    use HasFactory;

    /**
     * Champs autorisés pour l'assignation en masse.
     */
    protected $fillable = [
        'title',
        'content',
        'priority',
        'user_id',
        'date',
    ];
    protected $casts = [
        'date'       => 'date:Y-m-d',
        'created_at' => 'datetime',
    ];

    /**
     * Une note appartient à un utilisateur.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}