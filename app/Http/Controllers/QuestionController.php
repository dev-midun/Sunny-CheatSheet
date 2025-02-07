<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\QuestionRequest;
use App\Models\Answer;
use App\Models\Question;
use App\Services\DataTable;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class QuestionController extends Controller
{
    public function index(Request $request)
    {
        return view('pages.home');
    }

    public function datatable(Request $request)
    {
        $filters = $request->input('filters');
        $searchValue = isset($filters['search']) ? $filters['search'] : null;

        $totalData = Question::query()->count();
        $query = Question::defaultSelect(
            'id',
            'name',
        )
        ->with(['answers' => fn($query) => $query->select('id', 'name', 'is_correct', 'question_id')->orderBy('position', 'ASC')])
        ->when(!empty($searchValue), function($query) use($searchValue) {
            $query->where('name', 'like', "%{$searchValue}%");
        })
        ->orderBy('created_at', 'DESC')
        ->orderBy('name', 'ASC');

        return DataTable::toJson($request, $totalData, $query);
    }

    public function store(QuestionRequest $request)
    {
        $result = [
            'success' => false,
            'message' => null
        ];
        $data = Arr::map($request->rules(), fn($value, $key) => $request->{$key});

        try {
            DB::beginTransaction();
            
            $question = new Question();
            $question->name = $data['name'];
            $question->save();

            foreach ($data['answers'] as $value) {
                Answer::create([
                    'question_id' => $question->id,
                    'name' => $value['answer'],
                    'position' => $value['no'],
                    'is_correct' => $value['isCorrect']
                ]);
            }
            
            $result['success'] = true;
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();

            $result['message'] = $e->getMessage();
        }

        return response()->json($result);
    }

    public function show(string $id)
    {
        $data = Question::defaultSelect(
            'id',
            'name',
        )
        ->with(['answers' => fn($query) => $query->select('id', 'position', 'name', 'is_correct', 'question_id')->orderBy('position', 'ASC')])
        ->where('id', $id)
        ->first();

        return response()->json($data);
    }

    public function update(QuestionRequest $request, string $id)
    {
        $result = [
            'success' => false,
            'message' => null
        ];
        $data = Arr::map($request->rules(), fn($value, $key) => $request->{$key});

        try {
            DB::beginTransaction();
            
            $question = Question::find($id);
            $question->name = $data['name'];
            $question->save();

            foreach ($data['answers'] as $value) {
                if($value['status'] == 'new') {
                    Answer::create([
                        'question_id' => $id,
                        'name' => $value['answer'],
                        'position' => $value['no'],
                        'is_correct' => $value['isCorrect']
                    ]);
                } else {
                    $answer = Answer::find($value['id']);

                    if($value['status'] == 'delete') {
                        $answer->delete();
                    } else {
                        $answer->name = $value['answer'];
                        $answer->position = $value['no'];
                        $answer->is_correct = $value['isCorrect'];

                        $answer->save();
                    }
                }
            }
            
            $result['success'] = true;
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();

            $result['message'] = $e->getMessage();
        }

        return response()->json($result);
    }

    public function destroy(string $id)
    {
        try {
            DB::beginTransaction();

            Answer::where('question_id', $id)->delete();
            Question::find($id)->delete();

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();

            throw $e;
        }

        return response()->json([
            'success' => true
        ]);
    }
}
