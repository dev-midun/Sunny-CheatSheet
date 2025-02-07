<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Http\Request;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\RateLimiter;

class LoginController extends Controller
{
    public function index(Request $request)
    {
        return view('pages.login');
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(Request $request)
    {
        $this->ensureIsNotRateLimited($request);

        $authUsername = env('AUTH_USERNAME');
        $authPassword = env('AUHT_PASSWORD');

        $username = $request->input('username');
        $password = $request->input('password');

        $isValid = $username === $authUsername && $password === $authPassword;
        if(!$isValid) {
            $this->loginFailed($request);
        }

        $request->session()->regenerate();
        $request->session()->put(env('AUTH_SESSION_KEY'), true);

        return response()->json([
            'success' => true,
            'redirect' => route('home')
        ]);
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request)
    {
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect(route('login'));
    }

    protected function ensureIsNotRateLimited(Request $request): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey($request), 5)) {
            return;
        }

        event(new Lockout($request));

        $seconds = RateLimiter::availableIn($this->throttleKey($request));
        $response = [
            'success' => false,
            'message' => trans('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ])
        ];

        throw new HttpResponseException(response()->json($response, 200));
    }

    protected function throttleKey(Request $request): string
    {
        return Str::transliterate(Str::lower($request->ip()));
    }

    protected function loginFailed(Request $request)
    {
        RateLimiter::hit($this->throttleKey($request));

        $response = [
            'success' => false,
            'message' => null,
            'errors' => [
                'username' => __('auth.failed'),
                'password' => __('auth.failed')
            ]
        ];
        throw new HttpResponseException(response()->json($response, 200));
    }
}
