@props([
    'id' => null,
    'color' => 'primary',
    'size' => null,
    'className' => null
])

<x-button
    :id=$id
    icon="bx bx-refresh fs-22"
    :color="$color"
    :ghost="true"
    :rounded="true"
    :size="$size"
    :className="$className"
/>