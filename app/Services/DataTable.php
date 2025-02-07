<?php

namespace App\Services;

use App\Models\BaseModel;
use App\Models\LookupModel;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;

class DataTable
{
    public static function getColumns(Request $request): array
    {
        if(!$request->has('columns')) {
            throw new \Exception("Request does not have columns");
        }

        $columns = $request->input('columns');
        $validColumns = Arr::where($columns, fn($value, $key) => !empty($value["name"]));

        return array_values(Arr::map($validColumns, fn($value, $key) => $value["name"]));
    }

    /**
     * @return array [belongTo => fn]
     */
    public static function getLookupColumns(Request $request): array
    {
        if(!$request->has('columns')) {
            throw new \Exception("Request does not have columns");
        }

        $columns = $request->input('columns');
        $lookupColumns = Arr::where($columns, fn($value, $key) => !empty($value["name"]) && isset($value["type"]) && $value["type"] == "lookup");
        
        $lookup = [];
        foreach ($lookupColumns as $value) {
            $haveId = strtolower(substr($value["name"], -2, 2)) == "id";
            $belongsTo = $haveId ? substr($value["name"], 0, strlen($value["name"])-3) : $value["name"];

            $lookup[$belongsTo] = function($query) {
                return $query->getModel() instanceof BaseModel ? $query->defaultSelect() : $query;
            };
        }

        return $lookup;
    }

    /**
     * @return array ['search' => '', 'columns' => [['name' => '', 'type' => '']]]
     */
    public static function getSearch(Request $request): array
    {
        if(!$request->has('columns')) {
            throw new \Exception("Request does not have columns");
        }

        if(!$request->has('search')) {
            throw new \Exception("Request does not have search");
        }

        $search = $request->input('search');
        if(!isset($search['value'])) {
            return [];
        }

        $columns = $request->input('columns');
        $searchableOnly = Arr::where($columns, fn($value, $key) => $value["searchable"] == "true");

        $searchable = [
            "search" => $search["value"],
            "columns" => []
        ];
        foreach ($searchableOnly as $key => $value) {
            $searchable["columns"][] = [
                "name" => $value["name"],
                "type" => $value["type"] ?? "string"
            ];
        }

        return $searchable;
    }

    /**
     * @return array ['orderBy' => '', 'direction' => '']
     */
    public static function getOrderBy(Request $request): array
    {
        if(!$request->has('columns')) {
            throw new \Exception("Request does not have columns");
        }

        if(!$request->has('order')) {
            return [];
        }

        $columns = $request->input('columns');
        $order = $request->input('order');
        $orderValue = Arr::first($order);

        $orderBy = $columns[(int)$orderValue["column"]]["name"];
        $direction = $orderValue["dir"];

        if(empty($orderBy)) {
            return [];
        }

        return [
            "orderBy" => $orderBy,
            "direction" => $direction
        ];
    }

    /**
     * @param \Illuminate\Database\Eloquent\Builder $query 
     * @param array $columns ['name' => '', 'type' => '']
     * @param string $searchValue
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public static function getSearchQuery(Builder $query, array $columns, string $searchValue): Builder
    {
        $likeOperator = env("DB_CONNECTION") == 'pgsql' ? 'ilike' : 'like';

        foreach ($columns as $column) {
            switch ($column["type"]) {
                case 'lookup':
                    $belongsTo = Str::endsWith($column["name"], '_id') ? substr($column["name"], 0, -3) : $column["name"];
                    $query->orWhereHas($belongsTo, function($query) use($searchValue) {
                        $query->when($query->getModel() instanceof BaseModel, fn($query) => $query->defaultWhere($searchValue));
                    });

                    break;

                case 'string':
                default:
                    $query->orWhere($column["name"], $likeOperator, "%{$searchValue}%");

                    break;
            }
        }

        return $query;
    }

    /**
     * @param Model|BaseModel|LookupModel $model
     * @param array $columns
     * @param array $searchBy ['search' => '', 'columns' => [['name' => '', 'type' => '']]]
     * @param array $orderBy ['orderBy' => '', 'direction' => '']
     * @param array $withs [belongTo => fn] | [belongTo]
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public static function getQuery(Model $model, array $columns, array $searchBy, array $orderBy, array $filters = [], array $withs = []): Builder
    {
        $query = $model
            ->when($model instanceof BaseModel, 
                fn($query) => $query->defaultSelect($columns),
                function($query) use($columns, $withs) {
                    $query->select($columns)
                        ->when(!empty($withs), function($query) use($withs) {
                            $query->with($withs);
                        });
                }
            )
            ->when(!empty($searchBy), function($query) use($searchBy) {
                $searchValue = $searchBy["search"];
                $columns = $searchBy["columns"];

                $query->where(function($query) use($searchValue, $columns) {
                    return self::getSearchQuery($query, $columns, $searchValue);
                });
            })
            ->when(!empty($filters), function($query) use($filters) {
                foreach ($filters as $key => $value) {
                    $query->where($key, $value);
                }
            })
            ->when(!empty($orderBy), fn($query) => $query->orderBy($orderBy['orderBy'], $orderBy['direction']))
            ->when(empty($orderBy) && $model instanceof BaseModel, fn($query) => $query->orderBy($model::$orderBy, $model::$direction));

        return $query;
    }
    
    public static function toQuery(Request $request, Model $model): Builder
    {
        $columns = self::getColumns($request);
        $lookupColumns = self::getLookupColumns($request);
        $searchBy = self::getSearch($request);
        $orderBy = self::getOrderBy($request);
        $filters = $request->has('filters') ? $request->input('filters') : [];

        if(!in_array("id", $columns)) {
            array_unshift($columns, "id");
        }

        return self::getQuery($model, $columns, $searchBy, $orderBy, $filters, $lookupColumns);
    }

    public static function toDataTable(Request $request, Model $model, callable $callback = null)
    {
        $totalData = $model::query()->count();
        $query = self::toQuery($request, $model);

        return self::toJson($request, $totalData, $query, $callback);
    }

    public static function toJson(Request $request, int $totalData, Builder $query, callable $callback = null)
    {
        if(!$request->has('draw')) {
            throw new \Exception("Request does not have draw");
        }

        if(!$request->has('start')) {
            throw new \Exception("Request does not have start");
        }

        if(!$request->has('length')) {
            throw new \Exception("Request does not have length");
        }

        $refresh = (bool)$request->input('refresh');
        $draw = intval($request->input('draw'));
        $start = (int)$request->input('start');
        $length = (int)$request->input('length');
        $page = ceil(($start + 1) / $length);

        $data = collect([]);
        $recordFiltered = 0;
        if(!$refresh) {
            $query = $query->paginate($length, ['*'], 'page', $page);
            if($callback != null) {
                $query->through(fn ($item, $index) => $callback($item, $index));
            }
        } else {
            $recordFiltered = $query->count();
            $query->skip($start)
                ->take($length);

            $data = $query->get();
            if($callback != null) {
                $data = $data->map(fn ($item, $index) => $callback($item, $index));
            }
        }

        return response()->json([
            'draw' => $draw,
            'recordsTotal' => $totalData,
            'recordsFiltered' => !$refresh ? $query->total() : $recordFiltered,
            'data' => !$refresh ? $query->items() : $data
        ]);
    }
}