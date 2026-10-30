<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function createCategory(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'slug' => 'required|string|regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/'
        ]);

        Category::create([
            'name' => $request->name,
            'slug' => $request->slug,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Berhasil membuat category!']);

        return back();
    }

    public function deleteCategory(Request $request)
    {
        $request->validate([
            'id' => 'required|numeric'
        ]);

        $category = Category::findOrFail($request->id);

        $categoryName = $category->name;

        $category->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Berhasil menghapus category ' . $categoryName]);

        return back();
    }

    public function editCategory(Request $request)
    {
        $request->validate([
            'id' => 'required|numeric',
            'name' => 'required|string',
            'slug' => 'required|string|regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/'
        ]);

        $category = Category::findOrFail($request->id);

        $category->update([
            'name' => $request->name,
            'slug' => $request->slug,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Berhasil merubah category']);

        return back();
    }
}
