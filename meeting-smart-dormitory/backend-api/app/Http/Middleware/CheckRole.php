<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        if (!$request->user()) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // Check if user has one of the allowed roles
        if (in_array($request->user()->role, $roles)) {
            return $next($request);
        }

        \Illuminate\Support\Facades\Log::warning('Role Check Failed', [
            'user_role' => $request->user()->role,
            'required_roles' => $roles,
            'user_id' => $request->user()->id
        ]);

        return response()->json(['message' => 'Unauthorized. Access restricted to: ' . implode(', ', $roles)], 403);
    }
}
