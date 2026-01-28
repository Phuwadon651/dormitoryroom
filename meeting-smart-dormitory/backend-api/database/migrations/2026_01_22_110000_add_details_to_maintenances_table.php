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
        Schema::table('maintenances', function (Blueprint $table) {
            $table->json('completion_proof_images')->nullable()->after('status');
            $table->decimal('expense_amount', 10, 2)->nullable()->after('completion_proof_images');
            $table->text('expense_details')->nullable()->after('expense_amount');
            $table->string('expense_receipt_image')->nullable()->after('expense_details');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('maintenances', function (Blueprint $table) {
            $table->dropColumn([
                'completion_proof_images',
                'expense_amount',
                'expense_details',
                'expense_receipt_image'
            ]);
        });
    }
};
