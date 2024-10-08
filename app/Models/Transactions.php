<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transactions extends Model
{
    use HasFactory;


    protected $fillable = [
        'user_id',
        'from_currency',
        'to_currency',
        'from_amount',
        'to_amount',
        'status',
        'pfi_did',
        'exchange_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
