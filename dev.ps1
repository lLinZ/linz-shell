# Script para iniciar todos los servicios de desarrollo en Windows
Write-Host "🚀 Iniciando servicios de desarrollo para Linz Shell..." -ForegroundColor Green
Write-Host "Servidores: PHP Serve, Reverb, Queue, Vite y Pail" -ForegroundColor Cyan

composer dev
