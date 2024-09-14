<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ProfileController extends Controller
{
    
    public function show(Request $request)
    {
        $user = $request->user()->load('paymentDetails');
        return response()->json($user);
    }

    public function updatePaymentDetails(Request $request)
    {
        $validatedData = $request->validate([
            'btc_address' => 'nullable|string',
            'usd_account_number' => 'nullable|string',
            'usd_routing_number' => 'nullable|string',
            'kes_account_number' => 'nullable|string',
            'iban' => 'nullable|string',
        ]);

        $user = $request->user();
        $user->paymentDetails()->updateOrCreate(
            ['user_id' => $user->id],
            $validatedData
        );

        return response()->json($user->load('paymentDetails'));
    }
}
