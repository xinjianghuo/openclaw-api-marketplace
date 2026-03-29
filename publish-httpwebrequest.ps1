$token = "clh_2iRFN2GxdihpjcLUd6Ig6iwStzDa8Bi6PH69Ee9Hr1E"
$url = "https://clawhub.ai/api/v1/skills"
$zipPath = "D:/OpenClaw/.openclaw/workspace/releases/node-connection-doctor-v1.0.zip"

$boundary = "----Boundary$([Guid]::NewGuid().ToString('N'))"
$LF = "`r`n"

$sb = New-Object System.Text.StringBuilder
$sb.Append("--$boundary$LF") | Out-Null
$sb.Append("Content-Disposition: form-data; name=`"name`"$LF$LF") | Out-Null
$sb.Append("Node Connection Doctor$LF") | Out-Null

$sb.Append("--$boundary$LF") | Out-Null
$sb.Append("Content-Disposition: form-data; name=`"description`"$LF$LF") | Out-Null
$sb.Append("Automatically diagnose OpenClaw node connection issues. One-click troubleshooting.$LF") | Out-Null

$sb.Append("--$boundary$LF") | Out-Null
$sb.Append("Content-Disposition: form-data; name=`"category`"$LF$LF") | Out-Null
$sb.Append("System & Infrastructure$LF") | Out-Null

$sb.Append("--$boundary$LF") | Out-Null
$sb.Append("Content-Disposition: form-data; name=`"tags`"$LF$LF") | Out-Null
$sb.Append("openclaw,node,connection,troubleshooting,pairing,qr-code,tailscale$LF") | Out-Null

$sb.Append("--$boundary$LF") | Out-Null
$sb.Append("Content-Disposition: form-data; name=`"price`"$LF$LF") | Out-Null
$sb.Append("29$LF") | Out-Null

$sb.Append("--$boundary$LF") | Out-Null
$sb.Append("Content-Disposition: form-data; name=`"trial_days`"$LF$LF") | Out-Null
$sb.Append("7$LF") | Out-Null

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

try {
  $request = [System.Net.HttpWebRequest]::Create($url)
  $request.Method = "POST"
  $request.Accept = "application/json"
  $request.ContentType = "multipart/form-data; boundary=$boundary"
  $request.Headers["Authorization"] = "Bearer $token"
  $request.ContentLength = $body.Count
  
  $stream = $request.GetRequestStream()
  $stream.Write($body.ToArray(), 0, $body.Count)
  $stream.Close()
  
  $response = $request.GetResponse()
  $reader = New-Object System.IO.StreamReader($response.GetResponseStream())
  $respBody = $reader.ReadToEnd()
  Write-Host "Status: $($response.StatusCode)"
  Write-Host "Response: $respBody"
  if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 201) {
    Write-Host "✅ Uploaded successfully" -ForegroundColor Green
  }
} catch [System.Net.WebException] {
  $er = $_.Exception.Response
  if ($er -ne $null) {
    $rdr = New-Object System.IO.StreamReader($er.GetResponseStream())
    $rdr.BaseStream.Position = 0
    $rdr.DiscardBufferedData()
    $errBody = $rdr.ReadToEnd()
    Write-Host "HTTP $($er.StatusCode): $errBody" -ForegroundColor Red
  } else {
    Write-Error $_
  }
}
