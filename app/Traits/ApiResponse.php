<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;
use Illuminate\Pagination\LengthAwarePaginator;

trait ApiResponse
{
    protected function success(mixed $data = null, int $status = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $data,
            'error'   => null,
        ], $status);
    }

    protected function error(string $message, int $status = 400, mixed $details = null): JsonResponse
    {
        return response()->json([
            'success' => false,
            'data'    => null,
            'error'   => ['message' => $message, 'details' => $details],
        ], $status);
    }

    protected function paginated(LengthAwarePaginator $paginator, string $resource): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $resource::collection($paginator)->resolve(),
            'error'   => null,
            'meta'    => [
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
                'per_page'     => $paginator->perPage(),
                'total'        => $paginator->total(),
            ],
        ]);
    }
}
