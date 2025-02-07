@props([
    'id' => null,
    'size' => 'lg',
    'title' => null,
    'subTitle' => null
])

<x-modal
    :id="$id"
    :size="$size"
    :backdrop="true"
    :centered="true"
    animation="zoomIn"
>
    <x-slot:header>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
    </x-slot>

    <x-slot:body class="p-5">
        <div class="text-center mb-3">
            <h3 class="mb-2">{{ $title }}</h3>
            @if (!empty($subTitle)) <p>{{ $subTitle }}</p> @endif
        </div>

        <div class="p-4">
            {{ $slot }}
        </div>    
    </x-slot>
</x-modal>