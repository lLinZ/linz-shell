<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SystemHealthController extends Controller
{
    public function index()
    {
        // Database health
        $dbStats = $this->getDatabaseStats();

        // Storage stats
        $storageStats = $this->getStorageStats();

        // Session stats
        $sessionStats = $this->getSessionStats();

        // PHP / App env
        $appInfo = [
            'php_version'       => phpversion(),
            'laravel_version'   => app()->version(),
            'environment'       => app()->environment(),
            'debug_mode'        => config('app.debug'),
            'timezone'          => config('app.timezone'),
            'url'               => config('app.url'),
            'cache_driver'      => config('cache.default'),
            'session_driver'    => config('session.driver'),
            'queue_driver'      => config('queue.default'),
            'mail_mailer'       => config('mail.default'),
        ];

        // Key tables row counts
        $tableCounts = $this->getTableCounts();

        // Failed jobs
        $failedJobs = 0;
        try {
            $failedJobs = DB::table('failed_jobs')->count();
        } catch (\Exception $e) {}

        // Cache health
        $cacheHealth = $this->checkCacheHealth();

        // Pending migrations
        $pendingMigrations = $this->checkPendingMigrations();

        return Inertia::render('Admin/SystemHealth/Index', [
            'dbStats'            => $dbStats,
            'storageStats'       => $storageStats,
            'sessionStats'       => $sessionStats,
            'appInfo'            => $appInfo,
            'tableCounts'        => $tableCounts,
            'failedJobs'         => $failedJobs,
            'cacheHealth'        => $cacheHealth,
            'pendingMigrations'  => $pendingMigrations,
            'generatedAt'        => now()->toISOString(),
        ]);
    }

    private function getDatabaseStats(): array
    {
        try {
            $driver = config('database.default');
            $connection = config("database.connections.{$driver}");

            // Try to get SQLite file size if sqlite
            $dbSize = null;
            if ($driver === 'sqlite') {
                $dbPath = database_path('database.sqlite');
                if (file_exists($dbPath)) {
                    $dbSize = $this->formatBytes(filesize($dbPath));
                }
            }

            // Test connection speed
            $start = microtime(true);
            DB::select('SELECT 1');
            $latencyMs = round((microtime(true) - $start) * 1000, 2);

            return [
                'driver'       => $driver,
                'status'       => 'ok',
                'latency_ms'   => $latencyMs,
                'size'         => $dbSize,
                'connection'   => $connection['database'] ?? 'N/A',
            ];
        } catch (\Exception $e) {
            return [
                'driver'     => config('database.default'),
                'status'     => 'error',
                'error'      => $e->getMessage(),
                'latency_ms' => null,
            ];
        }
    }

    private function getStorageStats(): array
    {
        $storagePath = storage_path();
        $publicPath  = public_path();

        return [
            'storage_path'       => $storagePath,
            'storage_writable'   => is_writable($storagePath),
            'logs_size'          => $this->formatBytes($this->dirSize(storage_path('logs'))),
            'cache_size'         => $this->formatBytes($this->dirSize(storage_path('framework/cache'))),
            'sessions_size'      => $this->formatBytes($this->dirSize(storage_path('framework/sessions'))),
            'public_writable'    => is_writable($publicPath),
            'disk_free'          => $this->formatBytes(disk_free_space('/')),
            'disk_total'         => $this->formatBytes(disk_total_space('/')),
            'disk_used_percent'  => round((1 - disk_free_space('/') / disk_total_space('/')) * 100, 1),
        ];
    }

    private function getSessionStats(): array
    {
        try {
            $total  = DB::table('sessions')->count();
            $recent = DB::table('sessions')->where('last_activity', '>=', now()->subMinutes(15)->timestamp)->count();
            $today  = DB::table('sessions')->where('last_activity', '>=', today()->timestamp)->count();

            return [
                'total'   => $total,
                'active'  => $recent,
                'today'   => $today,
                'status'  => 'ok',
            ];
        } catch (\Exception $e) {
            return ['total' => 0, 'active' => 0, 'today' => 0, 'status' => 'error'];
        }
    }

    private function getTableCounts(): array
    {
        $tables = ['users', 'orders', 'products', 'sessions', 'messages', 'reviews', 'media'];
        $counts = [];

        foreach ($tables as $table) {
            try {
                $counts[$table] = DB::table($table)->count();
            } catch (\Exception $e) {
                $counts[$table] = null;
            }
        }

        return $counts;
    }

    private function checkCacheHealth(): array
    {
        try {
            $key = 'health_check_' . time();
            cache()->put($key, 'ok', 5);
            $result = cache()->get($key);
            cache()->forget($key);

            return ['status' => $result === 'ok' ? 'ok' : 'error', 'driver' => config('cache.default')];
        } catch (\Exception $e) {
            return ['status' => 'error', 'error' => $e->getMessage(), 'driver' => config('cache.default')];
        }
    }

    private function checkPendingMigrations(): int
    {
        try {
            $migrator = app('migrator');
            $files = $migrator->getMigrationFiles(database_path('migrations'));
            $ran = $migrator->getRepository()->getRan();
            
            // Pending are those in files but not in ran
            $pending = array_diff(array_keys($files), $ran);
            
            return count($pending);
        } catch (\Exception $e) {
            return -1;
        }
    }

    private function dirSize(string $path): int
    {
        $size = 0;
        if (!is_dir($path)) return $size;
        foreach (new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator($path, \FilesystemIterator::SKIP_DOTS)) as $file) {
            $size += $file->getSize();
        }
        return $size;
    }

    private function formatBytes(int $bytes): string
    {
        if ($bytes < 1024)       return "{$bytes} B";
        if ($bytes < 1048576)    return round($bytes / 1024, 1) . ' KB';
        if ($bytes < 1073741824) return round($bytes / 1048576, 1) . ' MB';
        return round($bytes / 1073741824, 2) . ' GB';
    }
}
