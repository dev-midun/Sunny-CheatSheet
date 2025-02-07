{{-- 

<x-input
    plugin=""
    type="text"
    id="input_id"
    name="input_name"
    value=""
    placeholder="Enter your name"
    size="sm"
    icon=""
    iconPosition="left"
    :rounded="false"
    :readonly="false"
    :disabled="false"
    :required="false"
    :hidden="false"
    className=""
/>

--}}

@props([
    'type' => "text",
    'id' => null,
    'name' => null,
    'value' => null,
    'placeholder' => null,
    'size' => null,
    'icon' => null,
    'iconPosition' => 'left',
    'iconClicked' => false,
    'float' => false,
    'rounded' => false,
    'required' => false,
    'readonly' => false,
    'disabled' => false,
    'hidden' => false,
    'plugin' => null,
    'bindTo' => null,
    'className' => null,
    'isValid' => false,
    'isError' => false
])
 
@if (!empty($icon) || $float === true)
<div {{
    $attributes->class([
        'form-floating' => $float,
        'form-icon' => !empty($icon),
        'right' => !empty($icon) && strtolower($iconPosition) == "right",
    ])
}}>
@endif

<input {{
    $attributes->merge([
        'type' => $type,
        'id' => $id,
        'name' => $name,
        'value' => $value,
        'placeholder' => $placeholder,
        'readonly' => $readonly === true,
        'disabled' => $disabled === true,
        'solar-form' => !empty($plugin) ? strtolower($plugin) : "default:{$type}",
        'solar-form-id' => !empty($bindTo) ? $bindTo : $id,
        'solar-form-label' => ".{$id}-label",
        'solar-form-message' => ".{$id}-message-feedback",
        'solar-form-required' => $required === true ? "true" : null,
        'solar-form-hidden' => ".{$id}-hidden"
    ])
    ->class([
        'form-control',
        'form-control-icon' => !empty($icon),
        'form-control-sm' => strtolower($size) == "sm",
        'form-control-lg' => strtolower($size) == "lg",
        'is-invalid' => $isError === true && $isValid === false,
        'is-valid' => $isError === false && $isValid === true,
        'rounded-pill' => $rounded === true,
        'd-none' => $hidden === true,
        $className => !empty($className)
    ])
}}>

@if (!empty($icon))
<i {{
    $attributes->class([
        $icon,
        'cursor-pointer' => $iconClicked
    ])
}}></i>
@endif

{{ $slot }}

@if (!empty($icon) || $float === true)
</div>
@endif