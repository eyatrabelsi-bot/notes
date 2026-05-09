<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class Task extends Model
{
protected $fillable = ['title', 'completed', 'user_id'];
protected $casts = ['completed' => 'boolean'];

public function user()
{
    return $this->belongsTo(User::class);
}
}
