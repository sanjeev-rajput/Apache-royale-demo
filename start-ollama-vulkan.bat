@echo off
setlocal

rem Enable Intel integrated GPU selection and the Vulkan backend for this
rem Ollama server process only. These settings do not modify Windows globally.
set OLLAMA_IGPU_ENABLE=1
set OLLAMA_VULKAN=1

echo Starting Ollama with Intel integrated GPU and Vulkan enabled...
echo Keep this window open while using Ollama.
echo Press Ctrl+C to stop the Ollama server.

ollama serve

echo.
echo Ollama server has stopped.
pause
endlocal
