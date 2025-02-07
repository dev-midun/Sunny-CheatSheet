<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class Guest
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $authSessionKey = env('AUTH_SESSION_KEY');
        $isAuth = $request->session()->get($authSessionKey);
        if($isAuth === true) {
            return redirect('/');
        }

        return $next($request);
    }
}
