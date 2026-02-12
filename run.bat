@echo off
REM Library Management System - Docker Startup Script
REM This script sets up the environment and starts the Docker containers

echo ================================================
echo Library Management System - Starting...
echo ================================================
echo.

REM Check if Docker is installed
echo [1/5] Checking Docker installation...
docker --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not installed or not in PATH
    echo Please install Docker Desktop from: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)
echo Docker found!
echo.

REM Check if Docker daemon is running
echo [2/5] Checking if Docker is running...
docker info >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not running
    echo Please start Docker Desktop and try again
    pause
    exit /b 1
)
echo Docker is running!
echo.

REM Create necessary directories if they don't exist
echo [3/5] Setting up directories...
if not exist "data" (
    echo Creating data directory...
    mkdir data
)
if not exist "static" (
    echo Creating static directory...
    mkdir static
)
if not exist "templates" (
    echo Creating templates directory...
    mkdir templates
)
echo Directories ready!
echo.

REM Stop any existing containers
echo [4/5] Stopping existing containers...
docker-compose down >nul 2>&1
echo.

REM Build and start Docker containers
echo [5/5] Building and starting Docker containers...
echo This may take a few minutes on first run...
echo.
docker-compose up --build -d

if errorlevel 1 (
    echo.
    echo ERROR: Failed to start Docker containers
    echo Check the error messages above for details
    pause
    exit /b 1
)

echo.
echo ================================================
echo SUCCESS! Library Management System is running
echo ================================================
echo.
echo Web Application: http://localhost:5000
echo.
echo To view logs: docker-compose logs -f
echo To stop: docker-compose down
echo.
echo Press any key to view container status...
pause >nul

docker-compose ps

echo.
echo Press any key to exit...
pause >nul
