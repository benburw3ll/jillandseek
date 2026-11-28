# Saves the Claude API key for Jill and Seek (ADR-0007 point 5, docs/claude-api.md).
#
#   powershell -NoProfile -ExecutionPolicy Bypass -File scripts\save-api-key.ps1
#
# The key is read from the clipboard, or typed at a hidden prompt: never from an argument, so it
# is never in a command line or a shell's history. It is stored encrypted to this Windows account
# (DPAPI) in a file under the user's profile, outside the repo and the data home. No part of the
# key is printed, and nothing is put in an environment variable. Works in Windows PowerShell 5.1.
param(
  # Skip the clipboard and ask at the hidden prompt.
  [switch]$Prompt,
  # Save only: don't run the check afterwards.
  [switch]$NoCheck
)

$ErrorActionPreference = 'Stop'

function Test-KeyShape([string]$Key) {
  if ($Key -cnotmatch '^sk-ant-[A-Za-z0-9_-]{16,400}$') { return 'not_a_key' }
  if ($Key.StartsWith('sk-ant-admin')) { return 'admin_key' }
  if ($Key.StartsWith('sk-ant-oat')) { return 'login_token' }
  return 'ok'
}

function Stop-WithMessage([string]$Message) {
  Write-Host "save-api-key: $Message"
  exit 1
}

$target = $env:JILL_AI_KEY_FILE
if ([string]::IsNullOrWhiteSpace($target)) {
  if ([string]::IsNullOrWhiteSpace($env:LOCALAPPDATA)) { Stop-WithMessage 'LOCALAPPDATA is not set, so there is no place to save the key.' }
  $target = Join-Path (Join-Path $env:LOCALAPPDATA 'JillAndSeek') 'claude-api-key.dpapi'
}
# The key file is never in the repo: a relative path, or one under the repo's folder, is refused.
$repoRoot = [IO.Path]::GetFullPath((Split-Path -Parent $PSScriptRoot)).TrimEnd('\') + '\'
if (-not [IO.Path]::IsPathRooted($target)) { Stop-WithMessage 'JILL_AI_KEY_FILE must be a full path outside the repo. Nothing was saved.' }
$target = [IO.Path]::GetFullPath($target)
if ($target.StartsWith($repoRoot, [StringComparison]::OrdinalIgnoreCase)) { Stop-WithMessage 'JILL_AI_KEY_FILE points inside the repo. The key is never saved there. Nothing was saved.' }

$key = $null
$fromClipboard = $false
if (-not $Prompt) {
  $clip = $null
  try { $clip = Get-Clipboard -Raw } catch { $clip = $null }
  if ($clip -is [string] -and (Test-KeyShape $clip.Trim()) -ne 'not_a_key') {
    $key = $clip.Trim()
    $fromClipboard = $true
  }
}
if ($null -eq $key) {
  if ([Console]::IsInputRedirected) {
    # Piped in by another program: one line.
    $line = [Console]::In.ReadLine()
    if ($null -ne $line) { $key = $line.Trim() }
  } else {
    if (-not $Prompt) { Write-Host 'save-api-key: the clipboard holds no API key.' }
    $typed = Read-Host -AsSecureString 'Paste the API key (it stays hidden) and press Enter'
    $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($typed)
    try { $key = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr).Trim() }
    finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr) }
  }
}

if ([string]::IsNullOrEmpty($key)) { Stop-WithMessage 'no key was given. Nothing was saved.' }
switch (Test-KeyShape $key) {
  'not_a_key' { Stop-WithMessage 'that is not an API key (one starts with sk-ant-). Nothing was saved.' }
  'admin_key' { Stop-WithMessage 'that is an Admin key, which manages the whole organization. Make an API key in the jillandseek workspace instead. Nothing was saved.' }
  'login_token' { Stop-WithMessage 'that is a login token, not an API key. Make an API key in the jillandseek workspace instead. Nothing was saved.' }
}

$folder = Split-Path -Parent $target
if (-not (Test-Path -LiteralPath $folder)) { New-Item -ItemType Directory -Force -Path $folder | Out-Null }
$encrypted = ConvertTo-SecureString -String $key -AsPlainText -Force | ConvertFrom-SecureString
[IO.File]::WriteAllText($target, $encrypted, (New-Object Text.UTF8Encoding($false)))
$key = $null

if ($fromClipboard) {
  try {
    Add-Type -AssemblyName System.Windows.Forms
    [Windows.Forms.Clipboard]::Clear()
    Write-Host 'save-api-key: the clipboard was cleared.'
  } catch {
    Write-Host 'save-api-key: the clipboard could not be cleared. Copy something else over the key.'
  }
}
Write-Host 'save-api-key: saved, encrypted to this Windows account, outside the repo and the data home.'

if (-not $NoCheck) {
  $repo = Split-Path -Parent $PSScriptRoot
  $env:JILL_AI_KEY_FILE = $target
  & node (Join-Path $repo 'apps\server\src\ai\check-main.ts')
  exit $LASTEXITCODE
}
