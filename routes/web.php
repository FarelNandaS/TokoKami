<?php

use App\Http\Controllers\CategoryController;
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

    //Stock management routes
    Route::middleware(['permission:Stock Management'])->group(function () {
        Route::get('stock-management', [MainController::class, 'stockManagement'])->name('stock-management');

        Route::post('adjust-stock/{product}', [ProductController::class, 'adjustStock'])->name('adjust-stock');
    });

    ///Category management routes
    Route::middleware(['permission:Category Management'])->group(function () {
        Route::get('category-management', [MainController::class, 'categoryManagement'])->name('category-management');

        Route::post('create-category', [CategoryController::class, 'createCategory'])->name('create-category');
        Route::delete('delete-category', [CategoryController::class, 'deleteCategory'])->name('delete-category');
        Route::put('edit-category', [CategoryController::class, 'editCategory'])->name('edit-category');
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
