{{-- 

<x-label
    for=""
    label=""
    className=""
    :required="false"
    :float="false"
/>

--}}

@props([
    'for' => null,
    'label' => "",
    'required' => false,
    'float' => false,
    'className' => null  
])

<label {{
    $attributes->merge([
        'for' => $for,
    ])
    ->class([
        $className => !empty($className)
    ])
}}>
    {{ $label }}
    @if($required)
    <span class="text-danger">*</span>
    @endif
</label>