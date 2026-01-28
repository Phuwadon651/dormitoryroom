@echo off
cd %~dp0
php preserve_admin_and_nuke.php > nuke_output.txt 2>&1
type nuke_output.txt
