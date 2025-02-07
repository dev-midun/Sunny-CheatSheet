<?php

namespace App\Http\Controllers;

use App\Models\LookupModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class LookupController extends Controller
{
    public function index(Request $request, $name) 
    {
        $modelClass = "App\\Models\\{$name}";

        if(!class_exists($modelClass)) {
            return response()->json(['success' => false, 'meessage' => "Lookup {$name} not found"], 404);
        }

        $model = new $modelClass;
        if(!$model instanceof LookupModel) {
            return response()->json(['success' => false, 'meessage' => "Lookup {$name} not found"], 404);
        }

        $isPagination = $request->has('page') && $request->has('length');
        $isSearch = $request->has('search') && !empty(trim($request->input('search')));
        $isFilter = $request->has('filter') && !empty($request->input('filter'));
        $isFromCache = !$isPagination && !$isSearch && !$isFilter;

        if($isFromCache) {
            $data = Cache::remember("lookup_{$name}", 7200, fn () => $model->defaultSelect()->defaultOrder()->toLookup());
            return response()->json($data);
        }

        $page = $request->input('page');
        $length = $request->input('length');
        $search = $request->input('search');

        $data = $model->defaultSelect()
            ->defaultOrder()
            ->when($isSearch, function($query) use($search) {
                $query->defaultWhere($search);
            })
            ->when($isPagination, function($query) use($page, $length) {
                $query->toLookupPagination($page, $length);
            });

        if($isPagination) {
            return response()->json([
                'data' => $data->items(),
                'pagination' => [
                    'more' => $data->hasMorePages()
                ]
            ]);
        }

        return response()->json($data->get());
    }
}
