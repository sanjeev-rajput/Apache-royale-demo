@echo off
setlocal

rem Stop any existing Ollama background processes so new GPU settings apply
taskkill /f /im ollama.exe >nul 2>&1
taskkill /f /im "ollama app.exe" >nul 2>&1

rem Enable Intel integrated GPU selection and the Vulkan backend
set OLLAMA_IGPU_ENABLE=1
set OLLAMA_VULKAN=1

rem Keep the model loaded in memory for 10 minutes between Node requests
set OLLAMA_KEEP_ALIVE=10m

rem Limit context window to 4096 tokens to save system/iGPU RAM
set OLLAMA_NUM_CTX=4096

echo Starting Ollama server with Intel integrated GPU and Vulkan enabled...
echo Keep this window open while running your Node.js app.
echo Press Ctrl+C to stop the Ollama server.
echo.

ollama serve

echo.
echo Ollama server has stopped.
pause
endlocal
