<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;

class UserController extends Controller
{
    public function createUser(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'email' => 'required|email',
            'password' => 'required|string'
        ]);

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        Inertia::flash('toast', [
            'type'=>'success',
            'message'=>__('Berhasil membuat user admin baru!'),
        ]);

        return redirect()->back();
    }

    public function deleteUser(Request $request) {
        $request->validate([
            'id'=>'required|integer'
        ]);

        $user = User::find($request->id);

        $user->delete();

        return redirect()->back();
    }

    public function editPermission(Request $request) {
        $request->validate([
            'id'=>'required|integer',
            'permissions'=>'required|array',
            'permissions.*'=>'required|string|exists:permissions,name'
        ]);

        $user = User::findOrFail($request->id);
        
        $permissions = Permission::whereIn('name', $request->permissions ?? [])->where('guard_name', 'web')->get();

        $user->syncPermissions($permissions);

        Inertia::flash('toast', ['type'=>'success', 'message'=>'Berhasil mengubah akses user ' . $user->name]);

        return back();
    }
}
