<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Invoice;

class InvoiceController extends Controller
{
    public function index(Request $request)
    {
        $invoices = $request->user()->invoices()->latest()->get();
        return response()->json($invoices);
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'amount' => 'required|numeric|min:0',
            'currency' => 'required|string|max:3',
        ]);

        $invoice = $request->user()->invoices()->create($validatedData);
        return response()->json($invoice, 201);
    }

    public function show(Request $request, Invoice $invoice)
    {
        if ($request->user()->id !== $invoice->user_id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        return response()->json($invoice);
    }

    public function pay(Request $request, Invoice $invoice)
    {
        // Check if the authenticated user is either the invoice creator or the payer
        if ($request->user()->id !== $invoice->user_id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        if ($invoice->status === 'paid') {
            return response()->json(['error' => 'Invoice is already paid'], 400);
        }
        
        $invoice->update(['status' => 'paid']);
        
        return response()->json($invoice);
    }

  
}