<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UserAndRolesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roleSuperAdmin = Role::create(['name' => 'Super Admin']);

        $superAdmin = User::create([
            'name' => 'Super Admin',
            'email' => 'SuperAdmin@gmail.com',
            'password' => Hash::make('password'),
            'email_verified_at' => Carbon::now(),
        ]);
        $superAdmin->assignRole($roleSuperAdmin);
    }
}
