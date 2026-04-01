$token = "clh_2iRFN2GxdihpjcLUd6Ig6iwStzDa8Bi6PH69Ee9Hr1E"
$url = "https://clawhub.ai/api/v1/skills"
$zipPath = "D:/OpenClaw/.openclaw/workspace/releases/node-connection-doctor-v1.0.zip"

$fileBytes = [System.IO.File]::ReadAllBytes($zipPath)
$base64 = [System.Convert]::ToBase64String($fileBytes)

$payload = @{
  name = "Node Connection Doctor"
  description = "Automatically diagnose OpenClaw node connection issues and generate fix commands. One-click troubleshooting."
  category = "System & Infrastructure"
  tags = "openclaw,node,connection,troubleshooting,pairing,qr-code,tailscale"
  price = 29
  trial_days = 7
  file = $base64
} | ConvertTo-Json

$headers = @{
  Authorization = "Bearer $token"
  "Content-Type" = "application/json"
}

try {
  $response = Invoke-RestMethod -Uri $url -Method Post -Headers $headers -Body $payload -UseBasicParsing
  Write-Host "Response: $response"
} catch {
  $err = $_.Exception.Response
  if ($err) {
    $reader = New-Object System.IO.StreamReader($err.GetResponseStream())
    $reader.BaseStream.Position = 0
    $reader.DiscardBufferedData()
    $respBody = $reader.ReadToEnd()
    Write-Host "HTTP $($err.StatusCode): $respBody" -ForegroundColor Red
  } else {
    Write-Error $_
  }
}
