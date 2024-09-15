<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Transaction;
use App\Models\Transactions;
use Illuminate\Support\Facades\Auth;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $transactions = $user->transactions()->orderBy('created_at', 'desc')->take(10)->get();

        return response()->json($transactions);
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'from_currency' => 'required|string',
            'to_currency' => 'required|string',
            'from_amount' => 'required|numeric',
            'to_amount' => 'required|numeric',
            'status' => 'required|string',
            'pfi_did' => 'required|string',
            'exchange_id' => 'required|string',
        ]);

        $transaction = Auth::user()->transactions()->create($validatedData);

        return response()->json($transaction, 201);
    }

    public function rateTransaction(Request $request, $id)
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:500',
        ]);

        $transaction = Transactions::findOrFail($id);

        // Ensure the user can only rate their own transactions
        if ($transaction->user_id !== auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $transaction->rating = $request->rating;
        $transaction->rating_comment = $request->comment;
        $transaction->save();

        return response()->json(['message' => 'Rating submitted successfully']);
    }
}
