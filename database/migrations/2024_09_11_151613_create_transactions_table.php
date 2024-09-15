<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('from_currency');
            $table->string('to_currency');
            $table->decimal('from_amount', 20, 8);
            $table->decimal('to_amount', 20, 8);
            $table->string('status');
            $table->string('pfi_did');
            $table->string('exchange_id');
            $table->string('rating')->nullable();
            $table->text('rating_comment')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
