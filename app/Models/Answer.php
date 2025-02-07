<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Answer extends BaseModel
{
    protected $table = 'answers';
    public static $displayValue = 'name';

    protected function casts(): array
    {
        return [
            'is_correct' => 'boolean'
        ];
    }

    public function question() : BelongsTo
    {
        return $this->belongsTo(Question::class, 'question_id', 'id');
    }
}