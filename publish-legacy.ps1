$token = "clh_2iRFN2GxdihpjcLUd6Ig6iwStzDa8Bi6PH69Ee9Hr1E"
$uri = "https://clawhub.ai/api/v1/skills"
$zipPath = "D:/OpenClaw/.openclaw/workspace/releases/node-connection-doctor-v1.0.zip"

$boundary = "----Boundary$([Guid]::NewGuid().ToString('N'))"
$LF = "`r`n"

$fields = @{
  name = "Node Connection Doctor"
  description = "Automatically diagnose OpenClaw node connection issues and generate fix commands. One-click troubleshooting."
  category = "System & Infrastructure"
  tags = "openclaw,node,connection,troubleshooting,pairing,qr-code,tailscale"
  price = "29"
  trial_days = "7"
}

$sb = New-Object System.Text.StringBuilder
foreach ($key in $fields.Keys) {
  $sb.Append("--$boundary$LF") | Out-Null
  $sb.Append("Content-Disposition: form-data; name=`"$key`"$LF$LF") | Out-Null
  $sb.Append("$($fields[$key])$LF") | Out-Null
}

$fileName = [System.IO.Path]::GetFileName($zipPath)
$fileBytes = [System.IO.File]::ReadAllBytes($zipPath)
$sb.Append("--$boundary$LF") | Out-Null
$sb.Append("Content-Disposition: form-data; name=`"file`"; filename=`"$fileName`"$LF") | Out-Null
$sb.Append("Content-Type: application/zip$LF$LF") | Out-Null

$preBody = [System.Text.Encoding]::UTF8.GetBytes($sb.ToString())
$postBody = [System.Text.Encoding]::UTF8.GetBytes("$LF--$boundary--$LF")
$body = New-Object System.Collections.ArrayList
$body.AddRange($preBody) | Out-Null
$body.AddRange($fileBytes) | Out-Null
$body.AddRange($postBody) | Out-Null

$headers = @{
  Authorization = "Bearer $token"
  "Content-Type" = "multipart/form-data; boundary=$boundary"
}

try {
  $response = Invoke-WebRequest -Uri $uri -Method Post -Headers $headers -Body $body.ToArray() -UseBasicParsing
  Write-Host "Status: $($response.StatusCode)"
  Write-Host "Response: $($response.Content)"
  if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 201) {
    Write-Host "✅ Uploaded successfully" -ForegroundColor Green
  } else {
    Write-Host "❌ Upload failed" -ForegroundColor Red
  }
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
