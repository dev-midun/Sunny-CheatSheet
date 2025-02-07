@props([
    'label' => null,
    'id' => null,
    'name' => null,
    'value' => null,
    'placeholder' => null,
    'size' => null,
    'rounded' => false,
    'float' => false,
    'required' => false,
    'readonly' => false,
    'disabled' => false,
    'hidden' => false,
    'bindTo' => null,
    'classNameWrapper' => null,
    'classNameLabel' => null,
    'classNameInput' => null,
    'isError' => false,
    'isValid' => false,
    'rows' => 3,
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

    <x-textarea
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
        :float="$float"
        :rounded="$rounded"
        :isError="$isError"
        :isValid="$isValid"
        :className="$classNameInput"
        :rows="$rows"
    />

    @if ($float === true)
    <x-label
        :for="$id"
        :label="$label"
        :className="$_classNameLabel"
        :required="$required"
        :float="$float"
    />
    @endif

    <div {{
        $attributes->class([
            "{$id}-message-feedback" => !empty($id),
            'invalid-feedback' => $isError === true && $isValid === false,
            'valid-feedback' => $isError === false && $isValid === true
        ])
    }}>{{ $message }}</div>
</div>