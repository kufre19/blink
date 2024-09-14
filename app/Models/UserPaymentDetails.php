<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserPaymentDetails extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'btc_address',
        'usd_account_number',
        'usd_routing_number',
        'kes_account_number',
        'iban',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
