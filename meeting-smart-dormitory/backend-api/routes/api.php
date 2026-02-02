<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\TenantController;
use App\Http\Controllers\FinanceController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\MeterReadingController;
use App\Http\Controllers\SettingController;

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

    // Rooms - Restricted to Admin & Manager
    Route::middleware(['role:Admin,Manager'])->group(function () {
        Route::apiResource('rooms', RoomController::class)->except(['index', 'show']);
    });
    // Allow read-only access to rooms for all auth users
    Route::get('/rooms', [RoomController::class, 'index']);
    Route::get('/rooms/{room}', [RoomController::class, 'show']);

    // Tenants - Restricted to Admin & Manager
    Route::middleware(['role:Admin,Manager'])->group(function () {
        Route::apiResource('tenants', TenantController::class)->except(['index', 'show', 'me']);
    });
    
    Route::get('/tenants/me', [TenantController::class, 'me']);
    Route::get('/tenants', [TenantController::class, 'index']); 
    Route::get('/tenants/{tenant}', [TenantController::class, 'show']);

    // Finance
    Route::get('/contracts', [FinanceController::class, 'getContracts']);
    
    Route::get('/invoices', [FinanceController::class, 'getInvoices']);
    
    Route::get('/payments', [FinanceController::class, 'getPayments']);
    Route::post('/payments', [FinanceController::class, 'createPayment']);

    // Activities
    Route::get('/activities', [FinanceController::class, 'getActivities']);

    // Maintenances
    Route::post('/maintenances/{maintenance}/accept', [\App\Http\Controllers\MaintenanceController::class, 'accept']);
    Route::post('/maintenances/{maintenance}/complete', [\App\Http\Controllers\MaintenanceController::class, 'complete']);
    Route::post('/maintenances/{maintenance}/pay', [\App\Http\Controllers\MaintenanceController::class, 'pay']);
    Route::apiResource('maintenances', \App\Http\Controllers\MaintenanceController::class);

    // Meter Readings (Read Only / Common)
    Route::middleware(['role:Admin,DormAdmin,Manager'])->group(function () {
        Route::get('/meter-readings/summary', [MeterReadingController::class, 'summary']);
        Route::get('/meter-readings', [MeterReadingController::class, 'index']);
        Route::get('/meter-readings/{room}/history', [MeterReadingController::class, 'history']);
    });

    // Settings - Read Access for All Authenticated Users
    Route::get('/settings', [SettingController::class, 'index']);

    // Restricted Finance Write Access (Admin, Manager)
    Route::middleware(['role:Admin,Manager'])->group(function () {
        Route::post('/contracts', [FinanceController::class, 'createContract']);
        
        Route::post('/invoices', [FinanceController::class, 'createInvoice']);
        Route::delete('/invoices/{invoice}', [FinanceController::class, 'destroyInvoice']);
        
        Route::put('/payments/{id}/verify', [FinanceController::class, 'verifyPayment']);

        Route::post('/settings', [SettingController::class, 'update']);
        Route::post('/settings/upload-qr', [SettingController::class, 'uploadQr']);
    });

    // Meter Readings Write Access
    Route::middleware(['role:Admin,DormAdmin,Manager'])->group(function () {
         Route::post('/meter-readings', [MeterReadingController::class, 'store']);
         Route::delete('/meter-readings/{meterReading}', [MeterReadingController::class, 'destroy']);
    });

});
