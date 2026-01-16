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
        Schema::create('invoices', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('contract_id')->constrained('contracts')->onDelete('cascade');
            $table->integer('period_month');
            $table->integer('period_year');
            
            // Water
            $table->decimal('water_prev', 10, 2);
            $table->decimal('water_curr', 10, 2);
            $table->decimal('water_unit_price', 10, 2);
            $table->decimal('water_total', 10, 2);
            
            // Electric
            $table->decimal('electric_prev', 10, 2);
            $table->decimal('electric_curr', 10, 2);
            $table->decimal('electric_unit_price', 10, 2);
            $table->decimal('electric_total', 10, 2);
            
            // Rent & Fees
            $table->decimal('rent_total', 10, 2);
            $table->decimal('common_fee', 10, 2)->default(0);
            $table->decimal('parking_fee', 10, 2)->default(0);
            $table->decimal('internet_fee', 10, 2)->default(0);
            $table->decimal('cleaning_fee', 10, 2)->default(0);
            $table->decimal('other_fees', 10, 2)->default(0);
            
            $table->decimal('total_amount', 10, 2);
            $table->string('status')->default('Pending'); // Pending, Paid, Overdue, Cancelled
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
