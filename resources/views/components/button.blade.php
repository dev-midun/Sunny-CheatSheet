{{-- 

<x-button
    type="button"
    label=""
    id=""
    name=""
    size=""
    :rounded="false"
    :outline="false"
    :soft="false"
    :ghost="false"
    :gradient="false"
    color=""
    icon=""
    iconPosition="left"
    :disabled="false"
    tooltip=""
    tooltipPosition="top"
    className=""
/>

--}}

@props([
    'type' => 'button',
    'label' => null,
    'id' => null,
    'name' => null,
    'size' => null,
    'rounded' => false,
    'outline' => false,
    'soft' => false,
    'ghost' => false,
    'gradient' => false,
    'color' => 'primary',
    'icon' => null,
    'iconPosition' => 'left',
    'disabled' => false,
    'tooltip' => null,
    'tooltipPosition' => 'top',
    'className' => null
])
<button {{
    $attributes->merge([
        'type' => $type,
        'id' => !empty($id) ? $id : null,
        'name' => !empty($name) ? $name : null,
        'disabled' => $disabled ?? null,
        'solar-form' => 'button',
        'data-bs-toggle' => !empty($tooltip) ? 'tooltip' : null,
        'data-bs-placement' => !empty($tooltip) ? $tooltipPosition : null,
        'data-bs-original-title' => !empty($tooltip) ? $tooltip : null,
    ])
    ->class([
        'btn',
        'btn-'.$color => !$outline && !$soft && !$ghost,
        "btn-outline-{$color}" => $outline && !$soft && !$text_button,
        "btn-soft-{$color}" => !$outline && $soft && !$ghost,
        "btn-ghost-{$color}" => !$outline && !$soft && $ghost,
        'btn-icon' => !empty($icon) && empty($label),
        'bg-gradient' => $gradient === true,
        'btn-sm' => strtolower($size) == 'sm',
        'btn-lg' => strtolower($size) == 'lg',
        'rounded-pill' => $rounded,
        'waves-effect waves-light',
        $className => !empty($className)
    ])
}}>

@if (!empty($icon))
    @if (strtolower($iconPosition) == 'right' && !empty($label)) {{ $label }} @endif

    <i {{
        $attributes->class([
            $icon,
            'me-1' => !empty($label) && strtolower($iconPosition) == 'left',
            'ms-1' => !empty($label) && strtolower($iconPosition) == 'right',
        ])
    }}></i>
    
    @if (strtolower($iconPosition) == 'left' && !empty($label)) {{ $label }} @endif
    
@else {{ $label }} @endif

</button>