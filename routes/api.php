<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\ProfileController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/


Route::post('/login', [AuthController::class, 'login']);



Route::middleware('auth:sanctum')->get('/user/did', [UserController::class, 'getDid']);
Route::post('/register', [App\Http\Controllers\Auth\RegisterController::class, 'register']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [UserController::class, 'show']);
    Route::get('/users/{user}/payment-details', [UserController::class, 'getPaymentDetails']);

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/transactions', [TransactionController::class, 'index']);
    Route::post('/transactions', [TransactionController::class, 'store']);
    Route::post('/transactions/{id}/rate', [TransactionController::class, 'rateTransaction']);


  
    
    Route::get('/invoices', [InvoiceController::class, 'index']);
    Route::post('/invoices', [InvoiceController::class, 'store']);
    Route::get('/invoices/{invoice}', [InvoiceController::class, 'show']);
    Route::post('/invoices/{invoice}/pay', [InvoiceController::class, 'pay']);
    Route::get('/validate-email', [InvoiceController::class, 'validateEmail'])->middleware('auth:sanctum');


    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile/payment-details', [ProfileController::class, 'updatePaymentDetails']);

});