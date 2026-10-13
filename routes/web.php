<?php

use App\Http\Controllers\MainController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::get('/', [MainController::class, 'home'])->name('home');

Route::prefix('admin')->middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [MainController::class, 'dashboard'])->name('dashboard');
    Route::get('admin-management', [MainController::class, 'adminManagement'])->name('admin-management');

    Route::post('create-user', [UserController::class, 'createUser'])->name('create-user');
    Route::delete('delete-user', [UserController::class, 'deleteUser'])->name('delete-user');
    Route::put('edit-permission', [UserController::class, 'editPermission'])->name('edit-permission');
});

require __DIR__.'/settings.php';
