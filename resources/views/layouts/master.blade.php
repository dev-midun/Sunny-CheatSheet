@php
    $dataBsTheme = isset($_COOKIE['sunny-cheatsheet-theme-data-bs-theme']) ? $_COOKIE['sunny-cheatsheet-theme-data-bs-theme'] : 'light';
    $dataSidebar = isset($_COOKIE['sunny-cheatsheet-theme-data-sidebar']) ? $_COOKIE['sunny-cheatsheet-theme-data-sidebar'] : 'light';
    $dataSidebarSize = isset($_COOKIE['sunny-cheatsheet-theme-data-sidebar-size']) ? $_COOKIE['sunny-cheatsheet-theme-data-sidebar-size'] : 'lg';
@endphp

<!doctype html >
<html 
    lang="{{ str_replace('_', '-', app()->getLocale()) }}" 
    data-layout="horizontal" 
    data-topbar="light" 
    data-sidebar="{{ $dataSidebar }}" 
    data-sidebar-size="{{ $dataSidebarSize }}" 
    data-sidebar-image="none" 
    data-preloader="disable"
    data-bs-theme="{{ $dataBsTheme }}">

    <head>
        <meta charset="utf-8" />
        <title>@yield('title') | Sunny Cheatsheet</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="description" content="The future of customer relationships rises. Simple, straightforward, CRM is easy as 1-2-3" />
        <meta name="author" content="Sunny" />
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <link rel="shortcut icon" href="{{ Vite::asset('resources/images/favicon.ico')}}">

        <script>
            window.BASE_URL = {{ Js::from(url('/')) }};
        </script>

        @vite([
            'resources/js/velzon/layout.js',
            'resources/css/app.scss'
        ])

        @stack('styles')
        @stack('head-scripts')
    </head>

    <body>
        @yield('layout-content')

        @vite([
            'resources/js/app.js',
        ])
        <script src="https://cdn.lordicon.com/lordicon.js"></script>
        @stack('scripts')
    </body>

</html>