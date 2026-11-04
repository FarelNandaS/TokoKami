<?php

namespace App\Http\Controllers;

use App\Models\Banner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class BannerController extends Controller
{
    public function createBanner(Request $request)
    {
        $request->validate([
            'banner' => 'required|array|min:1',
            'banner.*' => 'image|mimes:png,jpg,jpeg,webp|max:2048',
            'title' => 'nullable|string',
            'subtitle' => 'nullable|string',
            'link_url' => 'nullable|required_with:btn_text|url',
            'btn_text' => 'nullable|string|max:50',
            'order' => 'nullable|numeric',
            'is_active' => 'nullable|boolean', 
        ]);

        if ($request->hasFile('banner')) {
            $path = $request->file('banner')[0]->store('banners', 'public');
            
            Banner::create([
                'image_path' => $path,
                'title' => $request->title,
                'subtitle' => $request->subtitle,
                'link_url' => $request->link_url,
                'btn_text' => $request->btn_text,
                'order' => $request->order,
                'is_active' => $request->is_active,
            ]);
    
            Inertia::flash('toast', ['type' => 'success', 'message' => 'Berhasil membuat banner baru.']);
    
            return back();
        } else {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Gagal membuat banner file banner tidak terupload.']);

            return back();
        }
    }

    public function deleteBanner(Request $request)
    {
        $request->validate([
            'id' => 'required|numeric',
        ]);

        $banner = Banner::findOrFail($request->id);

        if (Storage::disk('public')->exists($banner->image_path)) {
            Storage::disk('public')->delete($banner->image_path);
        }

        $banner->delete();

        Inertia::flash('toast', ['type'=>'success', 'message'=>'Berhasil menghapus banner.']);

        return back();
    }

    public function editBanner(Request $request)
    {
        $request->validate([
            'id' => 'required|numeric',
            'current_banner' => 'nullable|string',
            'banner' => 'nullable|array',
            'banner.*' => 'nullable|image|mimes:png,jpg,jpeg,webp|max:2048',
            'title' => 'nullable|string',
            'subtitle' => 'nullable|string',
            'link_url' => 'nullable|required_with:btn_text|url',
            'btn_text' => 'nullable|string|max:50',
            'order' => 'nullable|numeric',
            'is_active' => 'nullable|boolean',
        ]);

        $banner = Banner::findOrFail($request->id);

        if (empty($request->current_banner) && (!$request->hasFile('banner') || empty($request->file('banner')))) {
            return back()->withErrors(['banner' => 'Image banner wajib diisi (pilih gambar baru atau pertahankan gambar lama).']);
        }

        if (empty($request->current_banner) && $request->hasFile('banner')) {
            if (Storage::disk('public')->exists($banner->image_path)) {
                Storage::disk('public')->delete($banner->image_path);
            }

            $path = $request->file('banner')[0]->store('banners', 'public');
            $banner->image_path = $path;
        }

        $banner->title = $request->title;
        $banner->subtitle = $request->subtitle;
        $banner->link_url = $request->link_url;
        $banner->btn_text = $request->btn_text;
        $banner->order = $request->order;
        $banner->is_active = $request->is_active;
        $banner->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Berhasil mengupdate data banner.']);
        
        return back();
    }
}
