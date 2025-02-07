<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasMany;

class Question extends BaseModel
{
    protected $table = 'questions';
    public static $displayValue = 'name';

    public function answers() : HasMany
    {
        return $this->hasMany(Answer::class, 'question_id', 'id');
    }
}