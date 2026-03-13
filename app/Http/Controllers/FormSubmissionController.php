<?php

namespace App\Http\Controllers;

use App\Models\FormSubmission;
use Illuminate\Http\Request;

class FormSubmissionController extends Controller
{
    /**
     * Display a listing of unique forms with submission counts.
     */
    public function index()
    {
        // 1. Get submission counts and last dates from existing leads
        $submissionsData = FormSubmission::selectRaw('form_name, count(*) as total_submissions, max(created_at) as last_submission_at')
            ->groupBy('form_name')
            ->get()
            ->keyBy('form_name');

        // 2. Get all form names defined in Page Blocks to include forms with 0 leads
        $definedForms = \App\Models\PageBlock::where('block_type', 'DynamicForm')
            ->get()
            ->map(function($block) {
                return $block->payload_json['form_name'] ?? null;
            })
            ->filter()
            ->unique();

        // 3. Merge both sources
        $forms = $definedForms->map(function($formName) use ($submissionsData) {
            $nameStr = (string)$formName;
            $data = $submissionsData->get($nameStr);
            return [
                'form_name' => $nameStr,
                'total_submissions' => $data ? $data->total_submissions : 0,
                'last_submission_at' => $data ? $data->last_submission_at : null
            ];
        })->values();

        // 4. Also include form names that have submissions but are no longer in blocks
        $submissionsData->each(function($data, $formName) use (&$forms, $definedForms) {
            if (!$definedForms->contains($formName)) {
                $forms->push([
                    'form_name' => $formName,
                    'total_submissions' => $data->total_submissions,
                    'last_submission_at' => $data->last_submission_at
                ]);
            }
        });

        // 5. Finally sort by last activity or name
        $forms = $forms->sortByDesc('last_submission_at')->values();
        
        return \Inertia\Inertia::render('Admin/FormSubmissions/Index', [
            'forms' => $forms
        ]);
    }

    /**
     * Display submissions for a specific form with dynamic headers.
     */
    public function show($formName)
    {
        $submissions = FormSubmission::where('form_name', $formName)
            ->orderBy('created_at', 'desc')
            ->paginate(50);

        // Extract dynamic headers
        $headers = [];
        
        // 1. Try to get headers from actual submissions (most accurate for historic data)
        if ($submissions->count() > 0) {
            $sampleData = FormSubmission::where('form_name', $formName)
                ->limit(10)
                ->pluck('data');

            foreach ($sampleData as $data) {
                if (is_array($data)) {
                    $headers = array_unique(array_merge($headers, array_keys($data)));
                }
            }
        }
        
        // 2. If no submissions or headers found, try to get them from the Page Block definition
        if (empty($headers)) {
            $block = \App\Models\PageBlock::where('block_type', 'DynamicForm')
                ->where('payload_json->form_name', $formName)
                ->first();
                
            if ($block && isset($block->payload_json['fields'])) {
                $headers = collect($block->payload_json['fields'])
                    ->pluck('name')
                    ->toArray();
            }
        }

        return \Inertia\Inertia::render('Admin/FormSubmissions/Show', [
            'formName' => $formName,
            'submissions' => $submissions,
            'headers' => $headers
        ]);
    }

    /**
     * Store a new form submission.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'form_name' => 'required|string|max:255',
            'data' => 'required|array',
        ]);

        $submission = FormSubmission::create($validated);

        // Broadcast the new lead captured
        broadcast(new \App\Events\FormSubmitted($submission))->toOthers();

        return response()->json([
            'success' => true,
            'message' => '¡Mensaje enviado correctamente! Nos pondremos en contacto pronto.',
        ]);
    }

    /**
     * Remove a submission.
     */
    public function destroy(FormSubmission $submission)
    {
        $submission->delete();
        return redirect()->back();
    }
}
