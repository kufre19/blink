<?php

namespace App\Http\Controllers;

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

}
