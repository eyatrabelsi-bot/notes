<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;


class TaskController extends Controller
{
    public function index(Request $request)
    {
        return $request->user()->tasks()->orderBy('created_at', 'desc')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate(['title' => 'required|string|max:200']);
        return response()->json($request->user()->tasks()->create($validated), 201);
    }

    public function update(Request $request, $id)
    {
        $task = $request->user()->tasks()->findOrFail($id);
        $task->update($request->validate(['completed' => 'required|boolean']));
        return response()->json($task);
    }

    public function destroy(Request $request, $id)
    {
        $request->user()->tasks()->findOrFail($id)->delete();
        return response()->json(['message' => 'Supprimée.']);
    }

}