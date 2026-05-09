<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\NoteController;
use App\Http\Controllers\TodoController;
use App\Http\Controllers\TaskController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout',       [AuthController::class, 'logout']);

    // Notes
    Route::get('/notes',         [NoteController::class, 'index']);
    Route::post('/notes',        [NoteController::class, 'store']);
    Route::put('/notes/{id}',    [NoteController::class, 'update']);
    Route::delete('/notes/{id}', [NoteController::class, 'destroy']);

    // Todos
    Route::get('/todos',         [TodoController::class, 'index']);
    Route::post('/todos',        [TodoController::class, 'store']);
    Route::put('/todos/{id}',    [TodoController::class, 'update']);
    Route::delete('/todos/{id}', [TodoController::class, 'destroy']);

    // Tasks
    Route::middleware('auth:sanctum')->group(function () {
    // your existing routes...
    Route::get('/tasks',          [TaskController::class, 'index']);
    Route::post('/tasks',         [TaskController::class, 'store']);
    Route::patch('/tasks/{id}',   [TaskController::class, 'update']);
    Route::delete('/tasks/{id}',  [TaskController::class, 'destroy']);
});
});