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
    'message' => null,
    'labelCol' => '3',
    'inputCol' => '9',
    'classNameLabelCol' => null,
    'classNameInputCol' => null,
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
        "row",
        "{$id}-hidden" => !empty($id),
        $classNameWrapper => !empty($classNameWrapper)
    ])
}}>

    <div {{
        $attributes->class([
            "col-md-{$labelCol}",
            $classNameLabelCol => !empty($classNameLabelCol)
        ])
    }}>
        <x-label
            :for="$id"
            :label="$label"
            :className="$_classNameLabel"
            :required="$required"
        />
    </div>

    <div {{
        $attributes->class([
            "col-md-{$inputCol}",
            $classNameInputCol => !empty($classNameInputCol)
        ])
    }}>
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
            :rounded="$rounded"
            :isError="$isError"
            :isValid="$isValid"
            :className="$classNameInput"
        />
        <div {{
            $attributes->class([
                "{$id}-message-feedback" => !empty($id),
                'invalid-feedback' => $isError === true && $isValid === false,
                'valid-feedback' => $isError === false && $isValid === true
            ])
        }}>{{ $message }}</div>
    </div>
</div>