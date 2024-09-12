<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Transactions;

class TransactionsTableSeeder extends Seeder
{
    public function run()
    {
        $user = User::first(); // or select a specific user

        $types = ['buy', 'sell', 'deposit', 'withdraw'];
        $currencies = ['USD', 'EUR', 'BTC', 'ETH'];
        $statuses = ['completed', 'pending', 'failed'];

        for ($i = 0; $i < 20; $i++) {
            Transactions::create([
                'user_id' => $user->id,
                'type' => $types[array_rand($types)],
                'amount' => rand(100, 10000) / 100,
                'currency' => $currencies[array_rand($currencies)],
                'status' => $statuses[array_rand($statuses)],
            ]);
        }
    }
}