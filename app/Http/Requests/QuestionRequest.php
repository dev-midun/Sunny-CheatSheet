<?php

namespace App\Http\Requests;

use Closure;

class QuestionRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:500',
            'answers' => [
                'required',
                'array',
                function (string $attribute, mixed $value, Closure $fail) {
                    foreach ($value as $answer) {
                        if($answer['status'] != 'delete' && empty($answer['answer'])) {
                            return $fail("Ada jawaban yang masih kosong, tolong lengkapi");
                        }
                    }
                }
            ]
        ];
    }
}