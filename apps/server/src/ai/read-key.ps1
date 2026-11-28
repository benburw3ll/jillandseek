# Decrypts the saved Claude API key for the app's own process (ADR-0007 point 5).
# apps/server/src/ai/key.ts runs this with its output on a pipe. It never writes to a console:
# run by hand in a terminal, it stops without decrypting anything.
param([Parameter(Mandatory = $true)][string]$Path)

$ErrorActionPreference = 'Stop'
if (-not [Console]::IsOutputRedirected) {
  [Console]::Error.WriteLine('read-key: this script only answers the app. Use "pnpm ai:check" to test the key.')
  exit 3
}
try {
  $secure = (Get-Content -LiteralPath $Path -Raw).Trim() | ConvertTo-SecureString
  $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  try {
    [Console]::Out.Write([Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr))
  } finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
  }
} catch {
  exit 2
}
