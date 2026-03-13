<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Media;
use Illuminate\Support\Facades\Storage;

class AdminMediaController extends Controller
{
    public function index()
    {
        return response()->json(Media::latest()->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'file' => 'required|file|image|mimes:jpeg,png,jpg,gif,svg,webp|max:5120',
        ]);

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $path = $file->store('media', 'public');
            $url = Storage::url($path);

            $media = Media::create([
                'url' => $url,
                'name' => $file->getClientOriginalName(),
                'disk' => 'public',
                'mime_type' => $file->getMimeType(),
                'size' => $file->getSize(),
                'user_id' => $request->user()?->id,
            ]);

            return response()->json($media);
        }

        return response()->json(['error' => 'No file uploaded'], 400);
    }

    public function destroy(Media $media)
    {
        // Delete the file from storage
        $path = str_replace('/storage/', '', $media->url);
        if (Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }

        $media->delete();

        return response()->json(['success' => true]);
    }
}
