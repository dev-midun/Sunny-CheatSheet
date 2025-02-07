{{-- 

<x-breadcrumb
    :items="[
        ['name' => 'Account', 'url' => ''],
        ['name' => 'Form Page'],
    ]"
/>

--}}

@props([
    'home' => "Sunny",
    'homeUrl' => route('home'),
    'items' => []
])

<ol {{ $attributes->class(['breadcrumb m-0']) }}>
    <li class="breadcrumb-item"><a href="{{ $homeUrl }}">{{ $home }}</a></li>
    @foreach ($items as $item)
        <li class="breadcrumb-item {{ $loop->first && $loop->last ? 'active' : ($loop->last ? 'active' : '') }}">
            @if (!$loop->last && isset($item['url']))
                <a href="{{ $item['url'] }}">{{ $item['name'] }}</a>
            @else
                {{ $item['name'] }}
            @endif
        </li>
    @endforeach
</ol>