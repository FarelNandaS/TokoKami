<?php

use App\Http\Controllers\MainController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::get('/', [MainController::class, 'home'])->name('home');

Route::prefix('admin')->middleware(['auth', 'verified'])->group(function () {
    //main routes
    Route::get('dashboard', [MainController::class, 'dashboard'])->name('dashboard');
    Route::get('product-management', [MainController::class, 'productManagement'])->name('product-management');
    Route::get('admin-management', [MainController::class, 'adminManagement'])->name('admin-management');

    //User / Admin routes
    Route::post('create-user', [UserController::class, 'createUser'])->name('create-user');
    Route::delete('delete-user', [UserController::class, 'deleteUser'])->name('delete-user');
    Route::put('edit-permission', [UserController::class, 'editPermission'])->name('edit-permission');

    //Product routes
    Route::post('create-product', [ProductController::class, 'createProduct'])->name('create-product');
    Route::delete('delete-product', [ProductController::class, 'deleteProduct'])->name('delete-product');
    Route::put('edit-product', [ProductController::class, 'editProduct'])->name('edit-product');
});

require __DIR__.'/settings.php';
