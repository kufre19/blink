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

    public function show(Invoice $invoice)
    {
        $this->authorize('view', $invoice);
        return response()->json($invoice);
    }

    public function pay(Request $request, Invoice $invoice)
    {
        $this->authorize('update', $invoice);
        
     
        $invoice->update(['status' => 'paid']);
        
        return response()->json($invoice);
    }
}
