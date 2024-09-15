<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Foundation\Auth\RegistersUsers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class RegisterController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Register Controller
    |--------------------------------------------------------------------------
    |
    | This controller handles the registration of new users as well as their
    | validation and creation. By default this controller uses a trait to
    | provide this functionality without requiring any additional code.
    |
    */

    use RegistersUsers;

    /**
     * Where to redirect users after registration.
     *
     * @var string
     */
    protected $redirectTo = '/home';

    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('guest');
    }

    /**
     * Get a validator for an incoming registration request.
     *
     * @param  array  $data
     * @return \Illuminate\Contracts\Validation\Validator
     */
    protected function validator(array $data)
    {
        return Validator::make($data, [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'did' => ['required', 'string'],
            'encrypted_portable_did' => ['required', 'string'],
            'encrypted_private_key' => ['required', 'string'],
        ]);
    }

    /**
     * Create a new user instance after a valid registration.
     *
     * @param  array  $data
     * @return \App\Models\User
     */
    protected function create(array $data)
    {
        return User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'did' => $data['did'],
            'encrypted_private_key' => $data['encrypted_private_key'],
            'encrypted_portable_did' => $data['encrypted_portable_did'],
        ]);
    }

    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'did' => ['required', 'string'],
            'encrypted_portable_did' => ['required', 'string'],
            'encrypted_private_key' => ['required', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::create([
            'name' => $request['name'],
            'email' => $request['email'],
            'password' => Hash::make($request['password']),
            'did' => $request['did'],
            'encrypted_private_key' => $request['encrypted_private_key'],
            'encrypted_portable_did' => $request['encrypted_portable_did'],
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;
        $this->updatePaymentDetails($user);

        return response()->json([
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    public function updatePaymentDetails($user)
    {
        $validatedData = [
            'btc_address' => "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
            'usd_account_number' => '6554018509',
            'usd_routing_number' => '655401850910',
            'kes_account_number' => '89554018509',
            'iban' => '101010124',
        ];

        $user->paymentDetails()->updateOrCreate(
            ['user_id' => $user->id],
            $validatedData
        );

        return ;
    }

    
}
