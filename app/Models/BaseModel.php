<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;

class BaseModel extends Model
{
    use HasUuids;

    public $isLookup = false;
    public $incrementing = false;
    public static $orderBy = "created_at";
    public static $direction = "desc";
    public static $displayValue = null;
    protected $primaryKey = 'id';
    protected $keyType = 'string';
    protected $guarded = ['created_at', 'updated_at'];
    protected $defaultSelectColumn = [];
    protected $defaultWhereColumn = [];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime:Y-m-d H:i:s',
            'updated_at' => 'datetime:Y-m-d H:i:s'
        ];
    }

    public function getDisplayValue() 
    {
        if(empty(static::$displayValue)) {
            return null;
        }

        return $this->{static::$displayValue};
    }

    public function scopeDefaultSelect(Builder $query, $column = null)
    {
        $totalColArg = func_num_args();
        $colArg = array_slice(func_get_args(), 1);

        if($totalColArg == 1 || empty($column)) {
            return $query
                ->when(!empty($this->defaultSelectColumn), fn($query) => $query->defaultSelect($this->defaultSelectColumn))
                ->when(empty($this->defaultSelectColumn) && !empty(static::$displayValue), fn($query) => $query->select('id', static::$displayValue));
        }

        $selectColumn = [];
        foreach ($colArg as $arg) {
            if(is_array($arg)) {
                $selectColumn = array_merge($selectColumn, $arg);
            } else if(is_string($arg)) {
                $selectColumn[] = $arg;
            }
        }

        if(!empty($this->defaultSelectColumn)) {
            $selectColumn = array_merge($selectColumn, $this->defaultSelectColumn);
        }

        $selectColumn = array_values(array_unique($selectColumn));        
        $lookupColumn = Arr::map(
            array_flip(Arr::map(
                Arr::where($selectColumn, fn($item) => $this->isLookup($item)),
                fn($item) => Str::endsWith($item, '_id') ? substr($item, 0, -3) : $item
            )),
            fn($item) => fn($query) => $query->getModel() instanceof BaseModel ? $query->defaultSelect() : $query 
        );

        return $query->select($selectColumn)
            ->when(!empty($lookupColumn), fn($query) => $query->with($lookupColumn));
    }

    public function scopeDefaultWhere(Builder $query, $searchValue)
    {
        $likeOperator = env("DB_CONNECTION") == 'pgsql' ? 'ilike' : 'like';

        if(empty($this->defaultWhereColumn) || !isset($searchValue)) {
            return $query->when(!empty(static::$displayValue), fn($query) => $query->where(static::$displayValue, $likeOperator, "%{$searchValue}%"));
        }

        $scope = $this;
        return $query->where(function($query) use($searchValue, $likeOperator, $scope) {
            foreach ($this->defaultWhereColumn as $column) {
                $query->when(
                    $scope->isLookup($column), 
                    function($query) use($column, $searchValue) {
                        $belongTo = Str::endsWith($column, '_id') ? substr($column, 0, -3) : $column;
                        $query->orWhereHas(
                            $belongTo, 
                            fn($query) => $query->getModel() instanceof BaseModel ? $query->defaultWhere($searchValue) : $query
                        );
                    },
                    fn($query) => $query->orWhere($column, $likeOperator, "%{$searchValue}%")
                );
            }
        });
    }

    public function scopeDefaultOrder(Builder $query)
    {
        if(empty(static::$orderBy)) {
            return $query;
        }
        
        $query->orderBy(static::$orderBy, static::$direction ?? "asc");
    }

    public function isLookup($attribute)
    {
        $relationMethod = Str::endsWith($attribute, '_id') ? substr($attribute, 0, -3) : $attribute;
        $isMethodExists = method_exists($this, $relationMethod);
        
        return $isMethodExists && $this->$relationMethod() instanceof \Illuminate\Database\Eloquent\Relations\BelongsTo;
    }
}