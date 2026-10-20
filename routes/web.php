<?php

use App\Http\Controllers\MainController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::get('/', [MainController::class, 'home'])->name('home');

Route::prefix('admin')->middleware(['auth', 'verified'])->group(function () {
    //dashboar routes
    Route::get('/', [MainController::class, 'dashboard'])->name('admin');
    Route::get('dashboard', [MainController::class, 'dashboard'])->name('dashboard');

    //Product management routes
    Route::middleware(['permission:Product Management'])->group(function () {
        Route::get('product-management', [MainController::class, 'productManagement'])->name('product-management');

        Route::post('create-product', [ProductController::class, 'createProduct'])->name('create-product');
        Route::delete('delete-product', [ProductController::class, 'deleteProduct'])->name('delete-product');
        Route::put('edit-product', [ProductController::class, 'editProduct'])->name('edit-product');
    });

    //User / Admin management routes
    Route::middleware(['permission:Admin Management'])->group(function () {
        Route::get('admin-management', [MainController::class, 'adminManagement'])->name('admin-management');
        
        Route::post('create-user', [UserController::class, 'createUser'])->name('create-user');
        Route::delete('delete-user', [UserController::class, 'deleteUser'])->name('delete-user');
        Route::put('edit-permission', [UserController::class, 'editPermission'])->name('edit-permission');
    });
});

require __DIR__.'/settings.php';
