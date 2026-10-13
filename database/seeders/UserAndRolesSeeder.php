<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class UserAndRolesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = [
            'Product Management',
            'Stock Management',
            'Category Management',
            'Banner Organize',
            'Sale Management',
            'Admin Management',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        $allPermisson = Permission::all();

        $superAdmin = User::create([
            'name' => 'Super Admin',
            'email' => 'SuperAdmin@gmail.com',
            'password' => Hash::make('password'),
            'email_verified_at' => Carbon::now(),
        ]);
        // $superAdmin->assignRole($roleSuperAdmin);
        $superAdmin->givePermissionTo($allPermisson);
    }
}
