<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\LandingPage;
use Inertia\Inertia;

class AdminLandingPageController extends Controller
{
    public function edit()
    {
        return Inertia::render('Admin/LandingPage/Editor', [
            'sections' => LandingPage::orderBy('order')->get(),
        ]);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'sections' => 'required|array',
            'sections.*.id' => 'nullable|exists:landing_pages,id',
            'sections.*.section_key' => 'required|string',
            'sections.*.title' => 'nullable|string',
            'sections.*.content' => 'nullable', // JSON or string
            'sections.*.is_visible' => 'boolean',
        ]);

        foreach ($request->sections as $sectionData) {
            LandingPage::updateOrCreate(
                ['section_key' => $sectionData['section_key']],
                [
                    'title' => $sectionData['title'] ?? null,
                    'content' => $sectionData['content'] ?? null,
                    'is_visible' => $sectionData['is_visible'] ?? true,
                    'order' => $sectionData['order'] ?? 0,
                ]
            );
        }

        return back()->with('success', 'Landing page updated.');
    }
}
