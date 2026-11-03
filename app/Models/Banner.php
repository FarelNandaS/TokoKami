<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
#[Fillable(['image_path', 'title', 'subtitle', 'link_url', 'order', 'is_active'])]
class Banner extends Model
{
    //
}
