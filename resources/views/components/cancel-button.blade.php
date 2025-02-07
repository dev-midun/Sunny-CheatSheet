@props([
    'id' => null,
    'size' => null,
    'className' => null
])

<x-button {{ $attributes->merge() }}
    :id="$id"
    label="Cancel"
    color="secondary"
    :soft="true"
    :className="$className"
/>