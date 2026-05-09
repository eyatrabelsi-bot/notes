<?php

namespace App\Http\Controllers;

use App\Models\Note;
use Illuminate\Http\Request;

class NoteController extends Controller
{
    /**
     * Lister toutes les notes de l'utilisateur connecté,
     * triées par date de création décroissante.
     */
    public function index(Request $request)
    {
        $notes = $request->user()
            ->notes()
            ->orderBy('date', 'desc')
            ->get();

        return response()->json($notes);
    }

    /**
     * Créer une nouvelle note.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'    => 'required|string|max:100',
            'content'  => 'nullable|string',
            'priority' => 'required|in:basse,moyenne,haute',
            'date'     => 'nullable|date',
        ]);
        

        $note = $request->user()->notes()->create($validated);

        return response()->json($note, 201);
    }

    /**
     * Modifier une note existante.
     */
    public function update(Request $request, $id)
    {
        $note = $request->user()->notes()->findOrFail($id);

        $validated = $request->validate([
            'title'    => 'required|string|max:100',
            'content'  => 'nullable|string',
            'priority' => 'required|in:basse,moyenne,haute',
        ]);

        $note->update($validated);

        return response()->json($note);
    }

    /**
     * Supprimer une note.
     */
    public function destroy(Request $request, $id)
    {
        $note = $request->user()->notes()->findOrFail($id);
        $note->delete();

        return response()->json(['message' => 'Note supprimée avec succès.']);
    }
}