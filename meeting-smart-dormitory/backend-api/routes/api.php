<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\TenantController;
use App\Http\Controllers\FinanceController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\HomeController;

Route::post('/login', [AuthController::class, 'login'])->name('login');



Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Dashboard Data
    Route::get('/dashboard', [HomeController::class, 'index']);

    // Users
    Route::apiResource('users', UserController::class);
    Route::patch('/users/{user}/toggle-status', [UserController::class, 'toggleStatus']);

    // Roles
    Route::apiResource('roles', \App\Http\Controllers\RoleController::class);
    Route::post('/roles/{role}/users', [\App\Http\Controllers\RoleController::class, 'assignUser']);
    Route::delete('/roles/{role}/users', [\App\Http\Controllers\RoleController::class, 'removeUser']);



    // Rooms
    Route::apiResource('rooms', RoomController::class);

    // Tenants
    Route::apiResource('tenants', TenantController::class);

    // Finance
    Route::get('/contracts', [FinanceController::class, 'getContracts']);
    Route::post('/contracts', [FinanceController::class, 'createContract']);
    
    Route::get('/invoices', [FinanceController::class, 'getInvoices']);
    Route::post('/invoices', [FinanceController::class, 'createInvoice']);
    
    Route::get('/payments', [FinanceController::class, 'getPayments']);
    Route::post('/payments', [FinanceController::class, 'createPayment']);
    Route::put('/payments/{id}/verify', [FinanceController::class, 'verifyPayment']);

    // Activities
    Route::get('/activities', [FinanceController::class, 'getActivities']);

    // Maintenances
    Route::apiResource('maintenances', \App\Http\Controllers\MaintenanceController::class);

    // Settings
    Route::get('/settings', [\App\Http\Controllers\SettingController::class, 'index']);
    Route::post('/settings', [\App\Http\Controllers\SettingController::class, 'update']);
});
