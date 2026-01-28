<?php

use Illuminate\Support\Facades\File;

require __DIR__ . '/vendor/autoload.php';

// Load env helper
if (!function_exists('env_update')) {
    function env_update($key, $value)
    {
        $path = __DIR__ . '/.env';
        if (file_exists($path)) {
            $content = file_get_contents($path);
            if (strpos($content, "{$key}=") !== false) {
                 $content = preg_replace("/^{$key}=.*/m", "{$key}={$value}", $content);
            } else {
                 $content .= "\n{$key}={$value}\n";
            }
            file_put_contents($path, $content);
        }
    }
}

echo "Switching to Persistent Database...\n";

// 1. Create new DB file
$newDbFile = __DIR__ . '/database/database_final.sqlite';
if (!file_exists($newDbFile)) {
    touch($newDbFile);
    echo "Created database_final.sqlite\n";
}

// 2. Update .env
env_update('DB_CONNECTION', 'sqlite');
// Use absolute path to be safe, or relative to project
// escaping backslashes for .env
$dbPathEnv = 'C:\\workproPhu\\dormitoryroom\\meeting-smart-dormitory\\backend-api\\database\\database_final.sqlite';
env_update('DB_DATABASE', $dbPathEnv); 

echo "Updated .env to use new database.\n";

// 3. Clear Config Cache (important)
exec('php artisan config:clear');

// 4. Migrate
echo "Running Migrations...\n";
passthru('php artisan migrate:fresh --force');

// 5. Seed (only roles/users, strict wipe logic included in migrate:fresh essentially)
echo "Seeding...\n";
passthru('php artisan db:seed --class=RoleSeeder'); 
// Also run DatabaseSeeder for users
passthru('php artisan db:seed --class=DatabaseSeeder');

echo "Done. Please restart your server.\n";
