<?php
$target = __DIR__ . '/storage/app/public';
$link = __DIR__ . '/public/storage';

echo "Target: $target\n";
echo "Link: $link\n";

if (file_exists($link)) {
    echo "Link already exists.\n";
} else {
    // Try PHP symlink
    if (@symlink($target, $link)) {
        echo "Link created successfully via symlink().\n";
    } else {
        echo "symlink() failed. Trying mklink via exec...\n";
        // Convert to Windows paths for mklink
        $targetWin = str_replace('/', '\\', $target);
        $linkWin = str_replace('/', '\\', $link);
        $cmd = "mklink /D \"$linkWin\" \"$targetWin\"";
        echo "Command: $cmd\n";
        exec($cmd, $out, $ret);
        echo "Output: " . implode("\n", $out) . "\n";
        echo "Return: $ret\n";
    }
}
