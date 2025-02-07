@props([
    'label' => null,
    'id' => null,
    'name' => null,
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
    'message' => null
])

<x-text-field
    type="password"
    :label="$label"
    :bindTo="$bindTo"
    :id="$id"
    :name="$name"
    :placeholder="html_entity_decode('&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;')"
    :required="$required"
    :readonly="$readonly"
    :disabled="$disabled"
    :hidden="$hidden"
    icon="ri-eye-fill"
    iconPosition="right"
    :iconClicked="true"
    :float="$float"
    :rounded="$rounded"
    :isError="$isError"
    :isValid="$isValid"
    :classNameWrapper="$classNameWrapper"
    :classNameLabel="$classNameLabel"
    :classNameInput="$classNameInput"
/>