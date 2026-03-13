<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Review;
use App\Http\Requests\StoreReviewRequest;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ReviewController extends Controller
{
    /**
     * Show the public review submission form.
     */
    public function publicShow($uuid)
    {
        $review = Review::where('uuid', $uuid)->firstOrFail();

        return Inertia::render('Public/ReviewForm', [
            'reviewInvitation' => $review
        ]);
    }

    /**
     * Store a submitted review.
     */
    public function publicStore(StoreReviewRequest $request)
    {
        $review = Review::where('uuid', $request->uuid)
            ->where('status', 'invited')
            ->firstOrFail();

        $photos = [];
        if ($request->hasFile('photos')) {
            foreach ($request->file('photos') as $file) {
                $path = $file->store('reviews', 'public');
                $photos[] = Storage::url($path);
            }
        }

        $review->update([
            'rating' => $request->rating,
            'comment' => $request->comment,
            'photos_json' => $photos,
            'author_name' => $request->author_name,
            'author_email' => $request->author_email,
            'status' => 'pending', // Set to pending for admin approval
        ]);

        return back()->with('success', '¡Gracias por tu reseña! Será revisada pronto.');
    }

    /**
     * API for Page Builder to fetch reviews.
     */
    public function getApprovedReviews(Request $request)
    {
        $query = Review::where('status', 'approved');

        if ($request->has('ids') && !empty($request->ids)) {
            $query->whereIn('id', $request->ids);
        }

        if ($request->sort === 'rating') {
            $query->orderBy('rating', 'desc');
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $limit = $request->input('limit', 10);
        
        return response()->json($query->limit($limit)->get());
    }

    /**
     * ADMIN: List all reviews.
     */
    public function index()
    {
        return Inertia::render('Admin/Reviews/Index', [
            'reviews' => Review::latest()->paginate(20)
        ]);
    }

    /**
     * ADMIN: Generate a new invitation link.
     */
    public function generateInvitation(Request $request)
    {
        $review = Review::create([
            'uuid' => (string) Str::uuid(),
            'status' => 'invited',
            'rating' => 0,
        ]);

        return response()->json([
            'url' => route('reviews.show', ['uuid' => $review->uuid]),
        ]);
    }

    /**
     * ADMIN: Update review status (approve/reject).
     */
    public function update(Request $request, Review $review)
    {
        $request->validate([
            'status' => 'required|in:approved,rejected,pending'
        ]);

        $review->update(['status' => $request->status]);

        return back()->with('success', 'Reseña actualizada.');
    }

    /**
     * ADMIN: Delete a review.
     */
    public function destroy(Review $review)
    {
        $review->delete();

        return back()->with('success', 'Reseña eliminada para siempre.');
    }
}
