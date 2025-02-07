@props([
    'id' => null,
    'show' => false
])

<div id="{{ $id }}" {{ $attributes->class(['row', 'd-none' => $show === false]) }}>

    <div class="col-xxl-3 col-lg-4 col-12">

        <x-card>
            <x-slot:body class="placeholder-glow">
                <div class="text-center mb-3">
                    <span class="border rounded-circle placeholder" style="width: 5rem; height: 5rem"></span>
                </div>
                
                <div class="row">
                    <div class="col">
                        <span class="placeholder w-100"></span>
                        <span class="placeholder w-75"></span>
                        <span class="placeholder w-100"></span>
                        <span class="placeholder w-75"></span>
                    </div>
                </div>
            </x-slot>
        </x-card>

    </div>

    <div class="col-xxl-9 col-lg-8 col-12">

        <x-card>
            <x-slot:body class="placeholder-glow">
                <span class="placeholder w-100"></span>
                <div class="row">
                    <div class="col-6 pe-0">
                        <span class="placeholder w-100"></span>
                    </div>
                    <div class="col-6">
                        <span class="placeholder w-100"></span>
                    </div>
                </div>
                <div class="row">
                    <div class="col-6 pe-0">
                        <span class="placeholder w-100"></span>
                    </div>
                </div>
                <div class="row">
                    <div class="col-6 pe-0">
                        <span class="placeholder w-100"></span>
                    </div>
                    <div class="col-6">
                        <span class="placeholder w-100"></span>
                    </div>
                </div>
                <span class="placeholder w-100"></span>
            </x-slot>
        </x-card>

        <x-card>
            <x-slot:body class="placeholder-glow">
                <div class="row">
                    <div class="col d-flex align-items-center justify-content-center justify-content-md-start gap-2">
                        <span class="placeholder" style="width: 10%"></span>
                        <span class="placeholder w-25"></span>
                        <span class="placeholder" style="width: 10%"></span>
                        <span class="placeholder w-25"></span>
                        <span class="placeholder" style="width: 10%"></span>
                        <span class="placeholder" style="width: 20%"></span>
                    </div>
                </div>
                
                <div class="row mt-2">
                    <div class="col">
                        <span class="placeholder w-100"></span>
                    </div>
                </div>
                <div class="row">
                    <div class="col-6 pe-0">
                        <span class="placeholder w-100"></span>
                    </div>
                    <div class="col-6">
                        <span class="placeholder w-100"></span>
                    </div>
                </div>
                <div class="row">
                    <div class="col">
                        <span class="placeholder w-100"></span>
                    </div>
                </div>
                <div class="row">
                    <div class="col">
                        <span class="placeholder w-100"></span>
                    </div>
                </div>
            </x-slot>
        </x-card>

    </div>

</div>