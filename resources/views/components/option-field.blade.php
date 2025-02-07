@props([
    'type' => 'checkbox',
    'label' => null,
    'labelPosition' => 'left',
    'id' => null,
    'name' => null,
    'bindTo' => null,
    'value' => null,
    'checked' => false,
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
    'message' => null
])

@php
    $formId = !empty($bindTo) ? $bindTo : (!empty($name) ? $name : $id);

    $_classNameLabel = [];
    $_classNameLabel[] = 'form-check-label';
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
        'd-none' => $hidden === true,
        $classNameWrapper => !empty($classNameWrapper)
    ])
}}>

    <x-option
        :type="$type"
        :id="$id"
        :name="$name"
        :bindTo="$bindTo"
        :value="$value"
        :checked="$checked"
        :required="$required"
        :disabled="$disabled"
        :hidden="$hidden"
        :className="$classNameInput"
        :isValid="$isValid"
        :isError="$isError"
    />

    <x-label
        :for="$id"
        :label="$label"
        :className="$_classNameLabel"
        :required="$required"
    />

    <div {{
        $attributes->class([
            "{$formId}-message-feedback" => !empty($formId),
            'invalid-feedback' => $isError === true && $isValid === false,
            'valid-feedback' => $isError === false && $isValid === true
        ])
    }}>{{ $message }}</div>
</div>