{{-- 

<x-option
    type="checkbox"
    id=""
    name=""
    bindTo=""
    value=""
    :checked="false"
    :required="false"
    :disabled="false"
    :hidden="false"
    className=""
/>

--}}

@props([
    'type' => 'checkbox',
    'id' => null,
    'name' => null,
    'bindTo' => null,
    'value' => null,
    'checked' => false,
    'required' => false,
    'disabled' => false,
    'hidden' => false,
    'className' => null,
    'isValid' => false,
    'isError' => false
])

@php
    $formId = !empty($bindTo) ? $bindTo : (!empty($name) ? $name : $id);
@endphp

<input {{
    $attributes->merge([
        'type' => strtolower($type) === 'switch' ? 'checkbox' : $type,
        'id' => $id,
        'name' => $name,
        'value' => $value,
        'checked' => $checked === true,
        'disabled' => $disabled === true,
        'role' => strtolower($type) === 'switch' ? 'switch' : null,
        'solar-form' => "option:{$type}",
        'solar-form-id' => $formId,
        'solar-form-label' => ".{$formId}-label",
        'solar-form-message' => ".{$formId}-message-feedback",
        'solar-form-required' => $required === true ? "true" : null,
        'solar-form-hidden' => ".{$formId}-hidden"
    ])
    ->class([
        'form-check-input',
        'is-invalid' => $isError === true && $isValid === false,
        'is-valid' => $isError === false && $isValid === true,
        'd-none' => $hidden === true,
        $className => !empty($className)
    ])
}}>