@extends('layouts.blank')

@push('styles')
    <style>        
        .login-container {
            width: 100%;
            max-width: 400px;
            padding: 2rem;
            background: white;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
    </style>
@endpush

@push('scripts')
    @vite(['resources/js/pages/login.js'])
@endpush

@section('title', 'Login')

@section('content')

<div class="d-flex justify-content-center align-items-center" style="height: 100vh;">
    <div class="login-container">  
        <x-form id="form_login" :action="route('login')" method="POST">
            <x-text-field
                classNameWrapper="mb-3"
                label="Username"
                placeholder="Enter username"
                id="username"
                :required="true"
            />
        
            <x-password-field
                classNameWrapper="mb-3"
                type="password"
                label="Password"
                id="password"
                :required="true"
            />
        
            <div class="mt-4">
                <x-button
                    type="submit"
                    color="primary"
                    label="Sign in"
                    className="w-100"
                />
            </div>
        </x-form> 
    </div>
</div>

@endsection