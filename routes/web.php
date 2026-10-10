<?php

use Illuminate\Support\Facades\Route;

Route::inertia('/', 'home')->name('home');

Route::prefix('admin')->middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'admin/dashboard')->name('dashboard');
});

require __DIR__.'/settings.php';
