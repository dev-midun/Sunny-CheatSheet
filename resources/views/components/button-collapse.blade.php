@props([
    'id' => null,
    'label' => null,
    'show' => false
])

<a class="link-primary d-flex align-items-center collapse-custom mb-4" data-bs-toggle="collapse" href="#{{ $id }}" role="button" aria-expanded="true" aria-controls="{{ $id }}">
    <i class="collapse-custom-icon ri-arrow-{{ $show === true ? 'down' : 'right' }}-fill fs-17 me-2"></i>{{ $label }}
</a>
<div class="collapse {{ $show === true ? 'show' : '' }}" id="{{ $id }}">
    <div class="mb-5">
        {{ $slot }}
    </div>
</div>