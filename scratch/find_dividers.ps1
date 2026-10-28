Add-Type -AssemblyName System.Drawing
$srcPath = "C:\Users\WIN11\.gemini\antigravity-ide\brain\9e0251d6-3d17-44bc-890a-5fd36c297907\.user_uploaded\media_1793048866661.jpg"
$bmp = [System.Drawing.Bitmap]::FromFile($srcPath)
$w = $bmp.Width
$h = $bmp.Height

$colStats = @()
for ($x = 0; $x -lt $w; $x++) {
    $nonWhite = 0
    for ($y = 104; $y -le 502; $y += 2) {
        $c = $bmp.GetPixel($x, $y)
        if ($c.R -lt 235 -or $c.G -lt 235 -or $c.B -lt 235) {
            $nonWhite++
        }
    }
    $colStats += [PSCustomObject]@{ X = $x; Count = $nonWhite }
}
$bmp.Dispose()

# Find low count regions in 300..400 and 600..700
$low1 = $colStats | Where-Object { $_.X -ge 300 -and $_.X -le 400 } | Sort-Object Count | Select-Object -First 10
$low2 = $colStats | Where-Object { $_.X -ge 600 -and $_.X -le 700 } | Sort-Object Count | Select-Object -First 10

Write-Host "Low points between Horse 2 & 3:"
$low1 | ForEach-Object { Write-Host "X=$($_.X): $($_.Count)" }

Write-Host "Low points between Horse 3 & 4:"
$low2 | ForEach-Object { Write-Host "X=$($_.X): $($_.Count)" }
