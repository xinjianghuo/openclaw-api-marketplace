# ClawHub 自动发布脚本 (PowerShell 5+)
# 用法: .\publish.ps1 <zipPath> <name> <category> <tags> <price>

param(
  [string]$zipPath,
  [string]$name,
  [string]$description,
  [string]$category,
  [string]$tags,
  [int]$price
)

$token = "clh_2iRFN2GxdihpjcLUd6Ig6iwStzDa8Bi6PH69Ee9Hr1E"
$uri = "https://clawhub.ai/api/v1/skills"

# 生成 boundary
$boundary = "----Boundary$([Guid]::NewGuid().ToString('N'))"

# 构建 multipart body
$sb = New-Object System.Text.StringBuilder

# 文本字段
$fields = @{
  name = $name
  description = $description
  category = $category
  tags = $tags
  price = $price.ToString()
  trial_days = "7"
}

foreach ($key in $fields.Keys) {
  $value = $fields[$key]
  $sb.Append("--$boundary`r`n") | Out-Null
  $sb.Append("Content-Disposition: form-data; name=`"$key`"`r`n`r`n") | Out-Null
  $sb.Append("$value`r`n") | Out-Null
}

# 文件字段
$fileName = Split-Path $zipPath -Leaf
$fileBytes = [System.IO.File]::ReadAllBytes($zipPath)

$sb.Append("--$boundary`r`n") | Out-Null
$sb.Append("Content-Disposition: form-data; name=`"file`"; filename=`"$fileName`"`r`n") | Out-Null
$sb.Append("Content-Type: application/zip`r`n`r`n") | Out-Null

$preBody = [System.Text.Encoding]::UTF8.GetBytes($sb.ToString())
$postBody = [System.Text.Encoding]::UTF8.GetBytes("`r`n--$boundary--`r`n")

$body = New-Object System.Collections.ArrayList
$body.AddRange($preBody) | Out-Null
$body.AddRange($fileBytes) | Out-Null
$body.AddRange($postBody) | Out-Null

$bodyBytes = $body.ToArray()

# 发送请求
try {
  $httpClient = New-Object System.Net.Http.HttpClient
  $httpClient.DefaultRequestHeaders.Authorization = 
    [System.Net.Http.Headers.AuthenticationHeaderValue]::new("Bearer", $token)
  
  $content = New-Object System.Net.Http.ByteArrayContent($bodyBytes)
  $content.Headers.ContentType = 
    [System.Net.Http.Headers.MediaTypeHeaderValue]::new("multipart/form-data; boundary=$boundary")
  
  $response = $httpClient.PostAsync($uri, $content).Result
  $responseBody = $response.Content.ReadAsStringAsync().Result
  
  Write-Host "Status: $($response.StatusCode)" -ForegroundColor Cyan
  Write-Host "Response: $responseBody" -ForegroundColor Gray
  
  if ($response.IsSuccessStatusCode) {
    Write-Host "✅ Upload successful!" -ForegroundColor Green
    try {
      $json = ConvertFrom-Json $responseBody
      if ($json.url) { Write-Host "Skill URL: $($json.url)" -ForegroundColor Yellow }
    } catch {}
  } else {
    Write-Host "❌ Upload failed" -ForegroundColor Red
  }
} catch {
  Write-Error "Error: $_"
}
