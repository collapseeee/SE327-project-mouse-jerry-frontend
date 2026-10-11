param(
    [Parameter(Mandatory=$true)]
    [string]$Owner,
    [Parameter(Mandatory=$true)]
    [string]$Repo,
    [Parameter(Mandatory=$true)]
    [int]$PrNumber
)

$ErrorActionPreference = "Stop"

# Retrieve GitHub Token from Git Credential Manager
$credOutput = "protocol=https`nhost=github.com" | git credential fill
$tokenMatch = $credOutput | Select-String "password=(.*)"

if (-not $tokenMatch) {
    Write-Error "Could not retrieve GitHub credentials from git credential helper."
    exit 1
}

$token = $tokenMatch.Matches[0].Groups[1].Value

$headers = @{
    "Authorization" = "Bearer $token"
    "User-Agent"    = "Antigravity-Agent"
    "Content-Type"  = "application/json"
}

# Query unresolved review threads
$queryBody = @{
    query = @"
query {
  repository(owner: "$Owner", name: "$Repo") {
    pullRequest(number: $PrNumber) {
      reviewThreads(first: 50) {
        nodes {
          id
          isResolved
          comments(first: 1) {
            nodes {
              path
              line
            }
          }
        }
      }
    }
  }
}
"@
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "https://api.github.com/graphql" -Method Post -Headers $headers -Body $queryBody
$threads = $response.data.repository.pullRequest.reviewThreads.nodes | Where-Object { -not $_.isResolved }

if (-not $threads -or $threads.Count -eq 0) {
    Write-Output "No unresolved review threads found on $Owner/$Repo PR #$PrNumber."
    exit 0
}

Write-Output "Found $($threads.Count) unresolved review threads. Resolving..."

foreach ($t in $threads) {
    $threadId = $t.id
    $mutationBody = @{
        query = @"
mutation {
  resolveReviewThread(input: {threadId: "$threadId"}) {
    thread {
      id
      isResolved
    }
  }
}
"@
    } | ConvertTo-Json

    $mutRes = Invoke-RestMethod -Uri "https://api.github.com/graphql" -Method Post -Headers $headers -Body $mutationBody
    $resolved = $mutRes.data.resolveReviewThread.thread.isResolved
    Write-Output "Thread $threadId (File: $($t.comments.nodes[0].path):$($t.comments.nodes[0].line)): Resolved = $resolved"
}

Write-Output "All review threads successfully resolved on $Owner/$Repo PR #$PrNumber."
