@props([
    'type' => 'checkbox',
    'label' => null,
    'labelPosition' => 'left',
    'name' => null,
    'bindTo' => null,
    'required' => false,
    'disabled' => false,
    'hidden' => false,
    'outline' => false,
    'inline' => false,
    'color' => null,
    'classNameWrapper' => null,
    'classNameLabel' => null,
    'classNameInput' => null,
    'isError' => false,
    'isValid' => false,
    'message' => null,
    'options' => []
])

@php
    $formId = !empty($bindTo) ? $bindTo : $name;

    $_classNameLabel = [];
    $_classNameLabel[] = "form-label";
    if(!empty($id)) {
        $_classNameLabel[] = "{$formId}-label";
    }

    if(!empty($classNameLabel)) {
        $_classNameLabel[] = $classNameLabel;
    }

    $_classNameLabel = trim(implode(" ", $_classNameLabel));

    $isRadio = strtolower($type) === "radio";
    $isCheckbox = strtolower($type) === "checkbox";
    $isSwitch = strtolower($type) === "switch";
@endphp

<div {{
    $attributes->class([
        "{$formId}-hidden" => !empty($formId),
        "d-none" => $hidden === true,
        $classNameWrapper => !empty($classNameWrapper)
    ])
}}> 

<x-label
    :label="$label"
    :className="$_classNameLabel"
    :required="$required"
/>

@foreach ($options as $option)
    @php

    $isArray = is_array($option);

    $optionId = $isArray && isset($option["id"]) ? $option["id"] : (isset($option->id) ? $option->id : null);
    $optionLabel = $isArray && isset($option["label"]) ? $option["label"] : (isset($option->label) ? $option->label : null);
    $optionvalue = $isArray && isset($option["value"]) ? $option["value"] : (isset($option->value) ? $option->value : null);
    $optionChecked = $isArray && isset($option["checked"]) ? $option["checked"] : (isset($option->checked) ? $option->checked : false);
    $optionDisabled = $isArray && isset($option["disabled"]) ? $option["disabled"] : (isset($option->disabled) ? $option->disabled : $disabled);

    @endphp

    <div {{
        $attributes->class([
            'form-check',
            'form-check-inline' => $inline === true,
            "form-check-{$color}" => !empty($color) && $isCheckbox,
            "form-check-primary" => $outline === true && empty($color) && $isCheckbox,
            "form-check-outline" => $outline === true && $isCheckbox,
            "form-radio-{$color}" => !empty($color) && $isRadio,
            "form-radio-primary" => $outline === true && empty($color) && $isRadio,
            "form-radio-outline" => $outline === true && $isRadio,
            "form-switch" => $isSwitch,
            "form-switch-{$color}" => !empty($color) && $isSwitch,
            'form-check-right' => strtolower($labelPosition) === 'right',
        ])
    }}>

    <x-option
        :type="$type"
        :id="$optionId"
        :name="$name"
        :bindTo="$bindTo"
        :value="$optionvalue"
        :checked="$optionChecked"
        :required="$required"
        :disabled="$optionDisabled"
        :className="$classNameInput"
        :isValid="$isValid"
        :isError="$isError"
    />

    <x-label
        :for="$optionId"
        :label="$optionLabel"
        className="form-check-label"
        :required="$required"
    />

    </div>

@endforeach

<div {{
    $attributes->class([
        "{$formId}-message-feedback" => !empty($formId),
        'invalid-feedback' => $isError === true && $isValid === false,
        'valid-feedback' => $isError === false && $isValid === true
    ])
}}>{{ $message }}</div>

</div>