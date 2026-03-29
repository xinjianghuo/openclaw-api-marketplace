$token = "clh_2iRFN2GxdihpjcLUd6Ig6iwStzDa8Bi6PH69Ee9Hr1E"
$uri = "https://clawhub.ai/api/v1/skills"
$zipPath = "D:/OpenClaw/.openclaw/workspace/releases/node-connection-doctor-v1.0.zip"
$boundary = "----Boundary$([Guid]::NewGuid().ToString('N'))"

$fields = @{
  name = "Node Connection Doctor"
  description = "Automatically diagnose OpenClaw node connection issues and generate fix commands. Supports Android, iOS, macOS pairing problems, QR code failures, tunnel connectivity, and more. One-click troubleshooting for your OpenClaw deployment."
  category = "System & Infrastructure"
  tags = "openclaw,node,connection,troubleshooting,pairing,qr-code,tailscale"
  price = "29"
  trial_days = "7"
}

$sb = New-Object System.Text.StringBuilder
foreach ($key in $fields.Keys) {
  $sb.Append("--$boundary`r`nContent-Disposition: form-data; name=`"$key`"`r`n`r`n$($fields[$key])`r`n") | Out-Null
}
$fileName = [System.IO.Path]::GetFileName($zipPath)
$fileBytes = [System.IO.File]::ReadAllBytes($zipPath)
$sb.Append("--$boundary`r`nContent-Disposition: form-data; name=`"file`"; filename=`"$fileName`"`r`nContent-Type: application/zip`r`n`r`n") | Out-Null

$preBody = [System.Text.Encoding]::UTF8.GetBytes($sb.ToString())
$postBody = [System.Text.Encoding]::UTF8.GetBytes("`r`n--$boundary--`r`n")
$body = New-Object System.Collections.ArrayList
$body.AddRange($preBody) | Out-Null
$body.AddRange($fileBytes) | Out-Null
$body.AddRange($postBody) | Out-Null

try {
  $httpClient = New-Object System.Net.Http.HttpClient
  $httpClient.DefaultRequestHeaders.Authorization = [System.Net.Http.Headers.AuthenticationHeaderValue]::new("Bearer", $token)
  $content = New-Object System.Net.Http.ByteArrayContent($body.ToArray())
  $content.Headers.ContentType = [System.Net.Http.Headers.MediaTypeHeaderValue]::new("multipart/form-data; boundary=$boundary")
  $response = $httpClient.PostAsync($uri, $content).Result
  $responseBody = $response.Content.ReadAsStringAsync().Result
  Write-Host "Status: $($response.StatusCode)"
  Write-Host "Response: $responseBody"
  if ($response.IsSuccessStatusCode) { Write-Host "✅ Success" } else { Write-Host "❌ Failed" }
} catch { Write-Error $_ }
