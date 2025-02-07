@props([
    'id' => null,
    'title' => null,
    'subtitle' => null,
    'prefix' => null,
    'icon' => null,
    'iconColor' => 'primary',
    'value' => 0,
    'counter' => false,
    'animate' => false,
    'className' => null
])

<x-card :animate="$animate" class="w-100">
    <x-slot:body>
        
        <div class="d-flex align-items-center">

            @if (!empty($icon))
            <div class="avatar-sm flex-shrink-0">
                <span {{
                    $attributes->class([
                        "avatar-title bg-light rounded-circle fs-3 material-shadow",
                        "text-{$iconColor}"
                    ])
                }}>
                    <i class="{{ $icon }} align-middle"></i>
                </span>
            </div>
            @endif

            <div class="flex-grow-1 ms-3">
                <p {{
                    $attributes->class([
                        "text-uppercase fw-semibold fs-12 text-muted mb-1",
                        "{$id}-title" => !empty($id)
                    ])
                }}>{{ $title }}</p>
                <h4 {{ !empty($subtitle) ? 'class="mb-2"' : '' }}>
                    {{ $prefix }}<span {{
                        $attributes->merge([
                            'data-target' => $counter === true ? $value : null
                        ])
                        ->class([
                            "counter-value",
                            "{$id}-value" => !empty($id)
                        ])
                    }}></span>
                </h4>
                <p {{
                    $attributes->class([
                        "text-muted mb-0",
                        "{$id}-subtitle" => !empty($id)
                    ])
                }}>{{ $subtitle }}</p>
            </div>
        </div>

    </x-slot>
</x-card>