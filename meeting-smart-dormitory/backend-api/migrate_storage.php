<?php
$source = __DIR__ . '/storage/app/public';
$dest = __DIR__ . '/public/storage';

if (!file_exists($dest)) {
    mkdir($dest, 0777, true);
    echo "Created destination: $dest\n";
}

$iterator = new RecursiveIteratorIterator(
    new RecursiveDirectoryIterator($source, RecursiveDirectoryIterator::SKIP_DOTS),
    RecursiveIteratorIterator::SELF_FIRST
);

foreach ($iterator as $item) {
    $subPath = $iterator->getSubPathName();
    $targetPath = $dest . DIRECTORY_SEPARATOR . $subPath;
    
    if ($item->isDir()) {
        if (!file_exists($targetPath)) {
            mkdir($targetPath, 0777, true);
            echo "Created dir: $targetPath\n";
        }
    } else {
        copy($item, $targetPath);
        echo "Copied file: $subPath\n";
    }
}
echo "Migration complete.\n";
