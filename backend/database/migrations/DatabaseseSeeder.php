<?php

namespace Database\Seeders;

use App\Models\Note;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed : 1 utilisateur de test + notes d'exemple.
     */
    public function run(): void
    {
        $user = User::create([
            'name'     => 'Utilisateur Test',
            'email'    => 'test@example.com',
            'password' => Hash::make('password123'),
        ]);

        $notes = [
            [
                'title'    => 'Réviser le cours de React',
                'content'  => 'Revoir les hooks : useState, useEffect, useContext. Pratiquer avec des exemples concrets.',
                'priority' => 'haute',
            ],
            [
                'title'    => 'Faire les courses',
                'content'  => 'Pain, lait, œufs, légumes, fruits.',
                'priority' => 'basse',
            ],
            [
                'title'    => 'Configurer Sanctum',
                'content'  => "Ajouter SANCTUM_STATEFUL_DOMAINS dans .env\nConfigure CORS dans config/cors.php",
                'priority' => 'haute',
            ],
            [
                'title'    => 'Appel avec le client',
                'content'  => 'Préparer la démo de l\'application et les slides de présentation.',
                'priority' => 'moyenne',
            ],
            [
                'title'    => 'Lire un livre',
                'content'  => null,
                'priority' => 'basse',
            ],
        ];

        foreach ($notes as $noteData) {
            Note::create(array_merge($noteData, ['user_id' => $user->id]));
        }
    }
}