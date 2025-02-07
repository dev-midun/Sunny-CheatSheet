@props([
    'type' => 'text',
    'label' => null,
    'id' => null,
    'name' => null,
    'value' => null,
    'placeholder' => null,
    'size' => null,
    'icon' => null,
    'iconPosition' => 'left',
    'iconClicked' => false,
    'rounded' => false,
    'float' => false,
    'required' => false,
    'readonly' => false,
    'disabled' => false,
    'hidden' => false,
    'plugin' => null,
    'bindTo' => null,
    'classNameWrapper' => null,
    'classNameLabel' => null,
    'classNameInput' => null,
    'isError' => false,
    'isValid' => false,
    'message' => null
])

@php
    $_classNameLabel = [];
    $_classNameLabel[] = $float !== true ? "form-label" : "";
    if(!empty($id)) {
        $_classNameLabel[] = "{$id}-label";
    }

    if(!empty($classNameLabel)) {
        $_classNameLabel[] = $classNameLabel;
    }

    $_classNameLabel = trim(implode(" ", $_classNameLabel));
@endphp

<div {{
    $attributes->class([
        "{$id}-hidden" => !empty($id),
        "form-floating" => $float === true,
        "d-none" => $hidden === true,
        $classNameWrapper => !empty($classNameWrapper)
    ])
}}>

    @if ($float !== true)
    <x-label
        :for="$id"
        :label="$label"
        :className="$_classNameLabel"
        :required="$required"
    />
    @endif

    <x-input
        :type="$type"
        :plugin="$plugin"
        :bindTo="$bindTo"
        :id="$id"
        :name="$name"
        :value="$value"
        :placeholder="$placeholder"
        :size="$size"
        :required="$required"
        :readonly="$readonly"
        :disabled="$disabled"
        :hidden="$hidden"
        :icon="$icon"
        :iconPosition="$iconPosition"
        :iconClicked="$iconClicked"
        :float="$float"
        :rounded="$rounded"
        :isError="$isError"
        :isValid="$isValid"
        :className="$classNameInput"
    >

    @if ($float === true)
    <x-label
        :for="$id"
        :label="$label"
        :className="$_classNameLabel"
        :required="$required"
        :float="$float"
    />
    @endif

    </x-input>

    <div {{
        $attributes->class([
            "{$id}-message-feedback" => !empty($id),
            'invalid-feedback' => $isError === true && $isValid === false,
            'valid-feedback' => $isError === false && $isValid === true
        ])
    }}>{{ $message }}</div>
</div>