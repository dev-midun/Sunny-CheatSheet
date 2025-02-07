{{-- 

<x-form
    id=""
    action=""
    method=""
    prefix=""
    className=""
    :formElement="true"
>
    <x-text-field/>
    <x-text-field/>
    <x-text-field/>
    ...
    ...
</x-form>

--}}

@props([
    'id' => null,
    'action' => null,
    'method' => 'POST',
    'prefix' => null,
    'model' => null,
    'formElement' => true,
    'className' => null
])

@php
    $isNotPostAndGet = strtoupper($method) != 'POST' && strtoupper($method) != 'GET' ? true : false;
    $attr = $attributes->merge([
        'id' => $id,
        'action' => $formElement === true ? $action : null,
        'method' => $isNotPostAndGet ? null : ($formElement === true ? strtoupper($method) : null),
        'solar-form-action' => $formElement === false ? $action : null,
        'solar-form-method' => $formElement === false || $isNotPostAndGet ? $method : null,
        'solar-form-model' => $model,
        'solar-form-prefix' => $prefix
    ])
    ->class([
        $className => !empty($className)
    ]);
@endphp

<{{ $formElement === true ? 'form' : 'div' }} {{ $attr }}>

    @if ($formElement) @csrf @endif

    {{ $slot }}

</{{ $formElement === true ? 'form' : 'div' }}>