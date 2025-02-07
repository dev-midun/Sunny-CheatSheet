@props([
    'id' => null,
    'animate' => false,
    'header',
    'body',
    'footer'
])

<div {{ $attributes->merge(['id' => $id])->class(["card", "card-animate" => $animate === true]) }}>
    @if (isset($header))
    <div {{
        $header->attributes->class(['card-header'])
    }}>
        {{ $header }}
    </div>
    @endif
    
    @if (isset($body))
    <div {{
        $body->attributes->class(['card-body'])
    }}>
        {{ $body }}
    </div>
    @endif

    @if (isset($footer))
    <div {{
        $footer->attributes->class(['card-footer'])
    }}>
        {{ $footer }}
    </div>
    @endif
</div>