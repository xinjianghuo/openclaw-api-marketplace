# API 测试命令 (PowerShell)

$uri = "https://api-marketplace-pearl.vercel.app/api/run"
$headers = @{ "Content-Type" = "application/json" }
$body = @{
    skill = "node-connection-doctor"
    input = @{ verbose = $true }
    email = "test@example.com"
    test = $true
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri $uri -Method Post -Headers $headers -Body $body
    Write-Host "Response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error:" -ForegroundColor Red
    $_.Exception.Response.StatusCode
    $_.Exception.Message
}
