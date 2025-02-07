@props([
    'multiple' => false,
    'label' => null,
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
    'classNameWrapper' => null,
    'classNameLabel' => null,
    'classNameSelect' => null,
    'isError' => false,
    'isValid' => false,
    'message' => null,
    'options' => [],
    'lookupSource' => null,
    'lookupValue' => null
])

@php
    $_classNameLabel = [];
    $_classNameLabel[] = "form-label";
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
        "d-none" => $hidden === true,
        $classNameWrapper => !empty($classNameWrapper)
    ])
}}>

    <x-label
        :for="$id"
        :label="$label"
        :className="$_classNameLabel"
        :required="$required"
    />

    <x-select
        :multiple="$multiple"
        :plugin="$plugin"
        :bindTo="$bindTo"
        :id="$id"
        :name="$name"
        :value="$value"
        :placeholder="$placeholder"
        :size="$size"
        :required="$required"
        :disabled="$disabled"
        :hidden="$hidden"
        :rounded="$rounded"
        :isError="$isError"
        :isValid="$isValid"
        :className="$classNameSelect"
        :options="$options"
        :lookupSource="$lookupSource"
        :lookupValue="$lookupValue"
    />

    <div {{
        $attributes->class([
            "{$id}-message-feedback" => !empty($id),
            'invalid-feedback' => $isError === true && $isValid === false,
            'valid-feedback' => $isError === false && $isValid === true
        ])
    }}>{{ $message }}</div>
</div>