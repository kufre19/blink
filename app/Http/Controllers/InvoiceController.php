<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Invoice;

class InvoiceController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'amount' => 'required|numeric|min:0',
        ]);

        $invoice = Invoice::create([
            'user_id' => $request->user()->id,
            'name' => $request->name,
            'description' => $request->description,
            'amount' => $request->amount,
            'status' => 'pending',
        ]);

        return response()->json($invoice, 201);
    }
}
