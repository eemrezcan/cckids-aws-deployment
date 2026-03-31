param(
    [Parameter(Mandatory = $true)]
    [string]$BucketName,

    [Parameter(Mandatory = $false)]
    [string]$CloudFrontDistributionId
)

$ErrorActionPreference = "Stop"

if (-not $env:VITE_API_URL) {
    throw "VITE_API_URL env değeri gerekli. Örnek: https://api.example.com"
}

Write-Host "Installing admin dependencies..."
npm ci

Write-Host "Building admin app for production..."
npm run build

Write-Host "Syncing dist/ to s3://$BucketName ..."
aws s3 sync dist "s3://$BucketName" --delete

if ($CloudFrontDistributionId) {
    Write-Host "Creating CloudFront invalidation for $CloudFrontDistributionId ..."
    aws cloudfront create-invalidation --distribution-id $CloudFrontDistributionId --paths "/*"
}

Write-Host "Admin deployment completed."
