@props([
    'id' => null,
    'size' => null,
    'className' => null
])

<x-button
    :id="$id"
    label="New"
    icon="bx bx-plus"
    :className="$className"
/>