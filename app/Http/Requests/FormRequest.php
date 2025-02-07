<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest as BaseFormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rules\File;

class FormRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        return true;
    }
    
    protected function failedValidation(Validator $validator)
    {
        if ($this->expectsJson()) {
            $errors = $validator->errors()->messages();
            $errorList = [];
            foreach ($errors as $key => $value) {
                $errorList[$key] = implode(" ", $value);
            }

            $response = [
                'success' => false,
                'message' => null,
                'errors' => $errorList,
            ];

            throw new HttpResponseException(response()->json($response, 200));
        } 

        parent::failedValidation($validator);
    }

    protected function pictureValidation()
    {
        return ['nullable', File::image()->min(1)->max(1024)];
    }
}