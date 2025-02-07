@props([
    'id' => null,
    'show' => false
])

<div id="{{ $id }}" {{ $attributes->class(['placeholder-glow', 'd-none' => $show === false]) }}>
    <div class="row mb-6">
        <div class="col-12 col-md-6 d-flex align-items-center justify-content-center justify-content-md-start gap-2">
            <span class="placeholder" style="width: 10%"></span>
            <span class="placeholder w-25"></span>
        </div>

        <div class="col-12 col-md-6 d-flex align-items-center justify-content-end">
            <span class="placeholder w-25"></span>
        </div>
    </div>

    <div class="row mt-2">
        <div class="col d-flex align-items-center justify-content-center justify-content-md-start gap-2">
            <span class="placeholder" style="width: 10%"></span>
            <span class="placeholder w-25"></span>
            <span class="placeholder" style="width: 10%"></span>
            <span class="placeholder w-25"></span>
            <span class="placeholder" style="width: 10%"></span>
            <span class="placeholder" style="width: 20%"></span>
        </div>
    </div>

    <span class="placeholder w-50 mt-2"></span>
    <span class="placeholder w-75 mt-2"></span>
    <span class="placeholder w-100 mt-2"></span>

    <div class="mt-2"></div>

    <span class="placeholder w-50 mt-2"></span>
    <span class="placeholder w-75 mt-2"></span>
    <span class="placeholder w-100 mt-2"></span>

    <div class="mt-3"></div>

    <div class="row mb-6">
        <div class="col-12 col-md-6 d-flex align-items-center justify-content-center justify-content-md-start gap-2">
            <span class="placeholder" style="width: 35%"></span>
        </div>

        <div class="col-12 col-md-6 d-flex align-items-center justify-content-end">
            <span class="placeholder w-25"></span>
        </div>
    </div>
</div>