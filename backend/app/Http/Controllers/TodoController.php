<?php

namespace App\Http\Controllers;

use App\Models\Todo;
use Illuminate\Http\Request;

class TodoController extends Controller
{
    public function index(Request $request)
    {
        $todos = Todo::where('user_id', $request->user()->id)
                     ->orderBy('date')
                     ->orderBy('start_time')
                     ->get();
        return response()->json($todos);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'date'        => 'required|date',
            'start_time'  => 'nullable|date_format:H:i',
            'end_time'    => 'nullable|date_format:H:i',
            'category'    => 'nullable|string|max:100',
        ]);

        $todo = Todo::create([
            ...$validated,
            'user_id' => $request->user()->id,
        ]);

        return response()->json($todo, 201);
    }

    public function update(Request $request, $id)
    {
        $todo = Todo::where('id', $id)
                    ->where('user_id', $request->user()->id)
                    ->firstOrFail();

        $validated = $request->validate([
            'title'       => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'date'        => 'sometimes|date',
            'start_time'  => 'nullable|date_format:H:i',
            'end_time'    => 'nullable|date_format:H:i',
            'category'    => 'nullable|string|max:100',
            'completed'   => 'sometimes|boolean',
        ]);

        $todo->update($validated);
        return response()->json($todo);
    }

    public function destroy(Request $request, $id)
    {
        $todo = Todo::where('id', $id)
                    ->where('user_id', $request->user()->id)
                    ->firstOrFail();
        $todo->delete();
        return response()->json(['message' => 'Tâche supprimée.']);
    }
}