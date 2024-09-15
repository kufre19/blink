<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Invoice;
use App\Models\User;

class InvoiceController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $createdInvoices = $user->invoices()->with('recipient')->latest()->get();
        $receivedInvoices = Invoice::where('recipient_id', $user->id)->with('user')->latest()->get();
        
        $allInvoices = $createdInvoices->merge($receivedInvoices);
        return response()->json($allInvoices);
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'amount' => 'required|numeric|min:0',
            'currency' => 'required|string|max:3',
            'recipient_email' => 'nullable|email',
        ]);

        if ($validatedData['recipient_email']) {
            $recipient = User::where('email', $validatedData['recipient_email'])->first();
            if (!$recipient || $recipient->id === $request->user()->id) {
                return response()->json(['error' => 'Invalid recipient'], 400);
            }
            $validatedData['recipient_id'] = $recipient->id;
        }

        unset($validatedData['recipient_email']);

        $invoice = $request->user()->invoices()->create($validatedData);
        return response()->json($invoice, 201);
    }

    public function show(Request $request, Invoice $invoice)
    {
        $invoice->load('user', 'recipient');
        return response()->json($invoice);
    }

    public function pay(Request $request, Invoice $invoice)
    {
        if ($invoice->status === 'paid') {
            return response()->json(['error' => 'Invoice is already paid'], 400);
        }
        
        if ($request->user()->id !== $invoice->recipient_id && $request->user()->id !== $invoice->user_id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        $invoice->update(['status' => 'paid']);
        
        return response()->json($invoice);
    }

    public function validateEmail(Request $request)
    {
        $email = $request->query('email');
        $user = User::where('email', $email)->first();
        
        return response()->json([
            'valid' => $user !== null && $user->id !== $request->user()->id,
            'user_id' => $user ? $user->id : null
        ]);
    }

  
}