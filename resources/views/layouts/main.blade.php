@extends('layouts.master')
@section('layout-content')
    
<div id="layout-wrapper">
    @include('layouts.sections.topbar')
    <div class="main-content">
        <div class="page-content">
            <div class="container-fluid">
                @yield('content')
            </div>
            <!-- container-fluid -->
        </div>
        <!-- End Page-content -->
        @include('layouts.sections.footer')
    </div>
    <!-- end main content-->
</div>
<!-- END layout-wrapper -->

@prepend('scripts')
    @vite(['resources/js/velzon/app.js'])
@endprepend

@endsection