<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

echo "Checking database...\n";

if (!Schema::hasTable('personal_access_tokens')) {
    echo "Table 'personal_access_tokens' is MISSING. Creating it now...\n";
    
    Schema::create('personal_access_tokens', function (Blueprint $table) {
        $table->id();
        $table->morphs('tokenable');
        $table->string('name');
        $table->string('token', 64)->unique();
        $table->text('abilities')->nullable();
        $table->timestamp('last_used_at')->nullable();
        $table->timestamp('expires_at')->nullable();
        $table->timestamps();
    });
    
    echo "Table 'personal_access_tokens' has been CREATED successfully.\n";
} else {
    echo "Table 'personal_access_tokens' ALREADY EXISTS.\n";
}
