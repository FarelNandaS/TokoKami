<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class MainController extends Controller
{
    // Controller Guest
    public function home()
    {
        return Inertia::render('home');
    }

    // Controller Admin 
    public function dashboard()
    {
        return Inertia::render('admin/dashboard');
    }

    public function adminManagement()
    {
        $admins = User::where('id', '!=', Auth::id())->get();

        $data = $admins->map(function ($admin) {
            return [
                'id' => $admin->id,
                'name' => $admin->name,
                'email' => $admin->email,
                'permissions' => $admin->getAllPermissions()->pluck('name')->values()->all(),
            ];
        })->values()->all();

        return Inertia::render('admin/adminManagement', [
            'data' => $data
        ]);
    }
}
