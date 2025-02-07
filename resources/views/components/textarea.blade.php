{{-- 

<x-input
    id="input_id"
    name="input_name"
    value=""
    placeholder="Enter your name"
    size="sm"
    :rounded="false"
    :readonly="false"
    :disabled="false"
    :required="false"
    :hidden="false"
    className=""
/>

--}}

@props([
    'id' => null,
    'name' => null,
    'value' => null,
    'placeholder' => null,
    'size' => null,
    'float' => false,
    'rounded' => false,
    'required' => false,
    'readonly' => false,
    'disabled' => false,
    'hidden' => false,
    'plugin' => null,
    'bindTo' => null,
    'className' => null,
    'rows' => 3,
    'isValid' => false,
    'isError' => false
])
 
@if ($float === true)
<div {{
    $attributes->class([
        'form-floating' => $float,
    ])
}}>
@endif

<textarea {{
    $attributes->merge([
        'id' => $id,
        'name' => $name,
        'value' => $value,
        'placeholder' => $placeholder,
        'readonly' => $readonly === true,
        'disabled' => $disabled === true,
        'solar-form' => "default:textarea",
        'solar-form-id' => !empty($bindTo) ? $bindTo : $id,
        'solar-form-label' => ".{$id}-label",
        'solar-form-message' => ".{$id}-message-feedback",
        'solar-form-required' => $required === true ? "true" : null,
        'solar-form-hidden' => ".{$id}-hidden",
        'rows' => $rows
    ])
    ->class([
        'form-control',
        'form-control-sm' => strtolower($size) == "sm",
        'form-control-lg' => strtolower($size) == "lg",
        'is-invalid' => $isError === true && $isValid === false,
        'is-valid' => $isError === false && $isValid === true,
        'rounded-pill' => $rounded === true,
        'd-none' => $hidden === true,
        $className => !empty($className)
    ])
}}>{{ $value }}</textarea>

@if ($float === true)
</div>
@endif