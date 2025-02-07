<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;

class Menu extends LookupModel
{
    protected $table = 'menu';
    protected $defaultSelectColumn = ['id', 'name', 'url', 'route_name', 'icon', 'position'];

    public function parent()
    {
        return $this->belongsTo(Menu::class, 'parent_id', 'id');
    }

    public function sub_menu()
    {
        return $this->hasMany(Menu::class, 'parent_id', 'id');
    }

    public function scopeValidMenu(Builder $query): void
    {
        $query->whereNotNull('route_name')
            ->whereNotNull('url')
            ->where('url', '<>', '');
    }
}
