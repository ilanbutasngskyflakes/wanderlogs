Param(
  [Parameter(Mandatory=$true)]
  [string]$BucketName
)
if (-not (Get-Command gsutil -ErrorAction SilentlyContinue)) {
  Write-Error "gsutil not found. Install Google Cloud SDK: https://cloud.google.com/sdk/docs/install"
  exit 1
}
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$corsPath = Join-Path $scriptDir "cors.json"
Write-Output "Applying CORS config $corsPath to gs://$BucketName"
gsutil cors set $corsPath "gs://$BucketName"
if ($LASTEXITCODE -eq 0) {
  Write-Output "CORS successfully applied to $BucketName"
} else {
  Write-Error "Failed to apply CORS to $BucketName"
  exit 1
}
