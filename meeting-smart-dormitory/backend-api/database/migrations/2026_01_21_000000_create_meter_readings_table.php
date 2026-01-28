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
        Schema::create('meter_readings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('room_id')->constrained('rooms')->onDelete('cascade');
            $table->date('reading_date');
            $table->decimal('electricity_meter', 10, 2);
            $table->decimal('water_meter', 10, 2);
            $table->foreignId('recorded_by')->nullable()->constrained('users')->onDelete('set null');
            $table->text('note')->nullable();
            $table->timestamps();

            // Ensure one reading per room per month is the standard, 
            // but we might want flexibility. For now, let's just index date and room.
            $table->index(['room_id', 'reading_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('meter_readings');
    }
};
