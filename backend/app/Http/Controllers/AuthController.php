<?php

namespace App\Http\Controllers;

use App\Models\User;/***pour interagir avec le modèle User*/
use Illuminate\Http\Request;//pour gérer les requetes HTTP
use Illuminate\Support\Facades\Hash;//pour securiser des mots de passe
use Illuminate\Validation\ValidationException;//pour gérer les erreurs de validation

class AuthController extends Controller
{
    /**
     * Inscription d'un nouvel utilisateur.
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;//génère un token d'authentification pour l'utilisateur nouvellement créé

        return response()->json([
            'message' => 'Inscription réussie.',
            'token'   => $token,
            'user'    => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
            ],
        ], 201);
    }

    /**
     * Connexion d'un utilisateur existant.
     */
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Les identifiants sont incorrects.'],
            ]);
        }

        // Révoquer les anciens tokens pour ne garder qu'un token actif
        $user->tokens()->delete();

        $token = $user->createToken('auth_token')->plainTextToken;//génère un token d'authentification pour l'utilisateur

        return response()->json([
            'message' => 'Connexion réussie.',
            'token'   => $token,
            'user'    => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
            ],
        ]);
    }

    /**
     * Déconnexion : révocation du token courant.
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();//révoque le token d'authentification actuel de l'utilisateur

        return response()->json(['message' => 'Déconnexion réussie.']);
    }
}