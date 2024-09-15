<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function getDid(Request $request)
    {
        return response()->json(['did' => $request->user()->did]);
    }

    public function show(Request $request)
    {
        return $request->user()->load("paymentDetails");
    }


    public function getPaymentDetails(User $user)
    {
     
        // if (auth()->id() !== $user->id) {
        //     return response()->json(['error' => 'Unauthorized'], 403);
        // }

        return response()->json($user->paymentDetails);
    }
}
