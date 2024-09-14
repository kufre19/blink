<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Transaction;
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
}