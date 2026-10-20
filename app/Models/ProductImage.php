<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
#[Fillable(['product_id', 'image_path', 'is_primary'])]
class ProductImage extends Model
{
    //
}
