@extends('layouts.main')

@section('title', 'Home')

@section('content')

<div class="row mb-2">
    <div class="col d-flex">
        <button class="btn btn-primary btn-lg waves-effect waves-light me-2" type="button" id="new-questions">
            <i class="bx bx-plus"></i><span class="d-none d-lg-inline">New</span>
        </button>
        <div class="flex-grow-1">
            <x-input
                type="search"
                id="search"
                name="search"
                placeholder="Cari contekannya monggo :D"
                size="lg"
                icon="ri-search-2-line"
                iconPosition="left"
            />
        </div>
    </div>
</div>

<x-placeholder-list id="questions-placeholder" :show="true"/>
<div class="questions-table d-none">
    <div class="table-card table-responsive table-card-ui mt-2">
        <table id="questions-table" class="table table-nowrap">
            <thead class="d-none">
                <tr>
                    <th class="cell-fit">#</th>
                </tr>
            </thead>
        </table>
    </div>
</div>

@include('pages.modal')

@endsection

@push('scripts')
    @vite(['resources/js/pages/home.js'])
@endpush