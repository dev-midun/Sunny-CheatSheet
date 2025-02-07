<?php

use App\Http\Controllers\QuestionController;
use App\Http\Controllers\LoginController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {
    Route::prefix('login')->group(function () {
        Route::get('/', [LoginController::class, 'index'])->name('login');
        Route::post('/', [LoginController::class, 'store'])->name('login.store');
    });
});

Route::middleware('is_session_valid')->group(function () {
    Route::get('/', [QuestionController::class, 'index'])->name('home');

    Route::prefix('questions')->group(function () {
        Route::post('/datatable', [QuestionController::class, 'datatable'])->name('questions.datatable');
        Route::post('/', [QuestionController::class, 'store'])->name('questions.create');
        Route::get('/{id}', [QuestionController::class, 'show'])->whereUuid('id')->name('questions.read');

        Route::put('/{id}', [QuestionController::class, 'update'])
            ->whereUuid('id')
            ->name('questions.update');

        Route::delete('/{id}', [QuestionController::class, 'destroy'])
            ->whereUuid('id')
            ->name('questions.delete');
    });

    Route::get('/logout', [LoginController::class, 'destroy'])->name('logout');
});