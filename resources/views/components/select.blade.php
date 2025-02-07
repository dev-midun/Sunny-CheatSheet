{{-- 

<x-select
    plugin=""
    :multiple="false"
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
    :options="[]"
/>

--}}

@props([
    'multiple' => false,
    'id' => null,
    'name' => null,
    'value' => null,
    'placeholder' => null,
    'size' => null,
    'rounded' => false,
    'required' => false,
    'disabled' => false,
    'hidden' => false,
    'plugin' => null,
    'bindTo' => null,
    'className' => null,
    'isValid' => false,
    'isError' => false,
    'options' => [],
    'lookupSource' => null,
    'lookupValue' => null
])

<select {{
    $attributes->merge([
        'multiple' => $multiple === true,
        'id' => $id,
        'name' => $name,
        'placeholder' => $placeholder,
        'disabled' => $disabled === true,
        'solar-form' => !empty($plugin) ? strtolower($plugin) : "default:select-".($multiple === true ? "multiple" : "one"),
        'solar-form-id' => !empty($bindTo) ? $bindTo : $id,
        'solar-form-label' => ".{$id}-label",
        'solar-form-message' => ".{$id}-message-feedback",
        'solar-form-required' => $required === true ? "true" : null,
        'solar-form-hidden' => ".{$id}-hidden",
        'solar-form-placeholder' => $placeholder,
        'solar-form-lookup-source' => $lookupSource,
        'solar-form-lookup-value' => $lookupValue
    ])
    ->class([
        'form-select',
        'form-select-sm' => strtolower($size) == 'sm',
        'form-select-lg' => strtolower($size) == 'lg',
        'is-invalid' => $isError === true && $isValid === false,
        'is-valid' => $isError === false && $isValid === true,
        'rounded-pill' => $rounded === true,
        'd-none' => $hidden === true,
        $className => !empty($className)
    ])
}}>

@if (!empty($options) && empty($plugin) && !empty($placeholder))
@php 
    if(is_array($options)) {
        array_unshift($options, (object)['name' => $placeholder]); 
    } else if($options instanceof Illuminate\Support\Collection) {
        $options->prepend((object)['name' => $placeholder]);
    }
@endphp
@endif

@foreach ($options as $option)

    @php

    $isArray = is_array($option);

    $optionText = $isArray && isset($option["name"]) ? $option["name"] : (isset($option->name) ? $option->name : null);
    $optionValue = $isArray && isset($option["id"]) ? $option["id"] : (isset($option->id) ? $option->id : "");
    $optionDisabled = $isArray && isset($option["disabled"]) ? $option["disabled"] : (isset($option->disabled) ? $option->disabled : null);

    if($optionValue == $value) {
        $optionSelected = true;
    } else {
        $optionSelected = $isArray && isset($option["checked"]) ? $option["checked"] : (isset($option->checked) ? $option->checked : null);
    }

    @endphp

    <option {{
        $attributes->merge([
            "value" => $optionValue,
            "selected" => $optionSelected,
            "disabled" => $optionDisabled
        ])
    }}>{{ $optionText }}</option>

@endforeach

</select>