@props([
    'id' => null,
    'backdrop' => false,
    'fullscreen' => false,
    'size' => null,
    'centered' => true,
    'scrollable' => false,
    'position' => null,
    'animation' => null,
    'classNameContent' => null,
    'header',
    'body',
    'footer'
])

<div {{
    $attributes->merge([
        'id' => $id,
        'data-bs-backdrop' => $backdrop ? 'static' : null,
        'data-bs-keyboard' => $backdrop ? 'false' : null,
        'tabindex' => '-1',
        'aria-hidden' => 'true' 
    ])->class([
        'modal',
        'fade',
        $animation => !empty($animation)
    ])
}}>
    <div {{
        $attributes->class([
            'modal-dialog',
            'modal-dialog-centered' => $centered === true,
            'modal-dialog-scrollable' => $scrollable === true,
            'modal-xl' => strtolower($size) == 'xl',
            'modal-lg' => strtolower($size) == 'lg',
            'modal-sm' => strtolower($size) == 'sm',
            'modal-fullscreen' => $fullscreen === true,
            'modal-dialog-bottom' => strtolower($position) == 'bottom',
            'modal-dialog-right' => strtolower($position) == 'right',
            'modal-dialog-bottom-right' => strtolower($position) == 'bottom-right'
        ])
    }}>
        <div {{ $attributes->class(['modal-content', $classNameContent => !empty($classNameContent)]) }}>
            @if (isset($header))
            <div {{
                $header->attributes->class(['modal-header'])
            }}>
                {{ $header }}
            </div>
            @endif

            @if (isset($body))
            <div {{
                $body->attributes->class(['modal-body'])
            }}>
                {{ $body }}
            </div>
            @endif

            @if (isset($footer))
            <div {{
                $footer->attributes->class(['modal-footer'])
            }}>
                {{ $footer }}
            </div>
            @endif
        </div>
    </div>
</div>  