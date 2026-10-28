Add-Type -AssemblyName System.Drawing
$srcPath = "C:\Users\WIN11\.gemini\antigravity-ide\brain\9e0251d6-3d17-44bc-890a-5fd36c297907\.user_uploaded\media_1793048866661.jpg"
$bmp = [System.Drawing.Bitmap]::FromFile($srcPath)
Write-Host "Image loaded: $($bmp.Width) x $($bmp.Height)"

$w = $bmp.Width
$h = $bmp.Height

# Find vertical bounding box of the horses (excluding the text at bottom)
$topY = $h
$bottomY = 0
for ($y = 0; $y -lt ($h - 60); $y += 2) {
    for ($x = 0; $x -lt $w; $x += 4) {
        $c = $bmp.GetPixel($x, $y)
        if ($c.R -lt 235 -or $c.G -lt 235 -or $c.B -lt 235) {
            if ($y -lt $topY) { $topY = $y }
            if ($y -gt $bottomY) { $bottomY = $y }
        }
    }
}
Write-Host "Horses Vertical Range: Y=$topY to Y=$bottomY"

# Find horizontal columns
$colStats = @()
for ($x = 0; $x -lt $w; $x++) {
    $nonWhite = 0
    for ($y = $topY; $y -le $bottomY; $y += 2) {
        $c = $bmp.GetPixel($x, $y)
        if ($c.R -lt 235 -or $c.G -lt 235 -or $c.B -lt 235) {
            $nonWhite++
        }
    }
    $colStats += [PSCustomObject]@{ X = $x; Count = $nonWhite }
}

$bmp.Dispose()

# Print zero-density intervals (dividers between horses)
$dividers = $colStats | Where-Object { $_.Count -eq 0 } | Select-Object -ExpandProperty X
Write-Host "Empty Columns (dividers):"
$ranges = @()
$start = $null
$prev = $null
foreach ($d in $dividers) {
    if ($null -eq $start) { $start = $d; $prev = $d; continue }
    if ($d -eq ($prev + 1)) { $prev = $d; continue }
    $ranges += "$start - $prev"
    $start = $d
    $prev = $d
}
if ($null -ne $start) { $ranges += "$start - $prev" }
Write-Host ($ranges -join ", ")
