<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;

class LookupModel extends BaseModel
{
    public $isLookup = true;
    public static $orderBy = "position";
    public static $direction = "asc";
    public static $displayValue = 'name';
    protected $defaultSelectColumn = ['id', 'name', 'position'];
    protected $defaultWhereColumn = ['name'];
    
    protected function casts(): array
    {
        return array_merge(parent::casts(), [
            'position' => 'integer',
        ]);
    }

    public function scopeToLookup(Builder $query)
    {
        return $query->defaultOrder()->get()->map(function($item) {
            $item->id = $item->id;
            $item->name = $item->{static::$displayValue};
            
            return $item;
        });
    }

    public function scopeToLookupPagination(Builder $query, $page, $length)
    {
        return $query->paginate($length, ['*'], 'page', $page)
            ->through(function($item) {
                $item->id = $item->id;
                $item->name = $item->getDisplayValue();

                return $item;
            });
    }

    public function scopeToRadio(Builder $query, $checked = null)
    {
        return $query->get()->map(function($item) use($checked) {
            $newItem = (object)[];
            $newItem->id = $item->id;
            $newItem->label = $item->{static::$displayValue};
            $newItem->value = $item->id;

            if($checked == $newItem->id) {
                $newItem->checked = true;
            }
            
            return $newItem;
        });
    }
}
