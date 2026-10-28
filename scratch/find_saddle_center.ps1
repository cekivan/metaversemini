Add-Type -AssemblyName System.Drawing
$dir = "c:\Users\WIN11\Desktop\metaversemini\public\assets\horse"
$sprites = @("horse_front.png", "horse_iso_front.png", "horse_side.png", "horse_iso_back.png", "horse_back.png")

foreach ($s in $sprites) {
    $bmp = [System.Drawing.Bitmap]::FromFile((Join-Path $dir $s))
    $w = $bmp.Width
    $h = $bmp.Height
    $minX = $w; $maxX = 0; $minY = $h; $maxY = 0
    $count = 0
    for ($y = 0; $y -lt $h; $y++) {
        for ($x = 0; $x -lt $w; $x++) {
            $c = $bmp.GetPixel($x, $y)
            # Find the red saddle cloth
            if ($c.A -gt 150 -and $c.R -gt 130 -and $c.G -lt 55 -and $c.B -lt 55) {
                if ($x -lt $minX) { $minX = $x }
                if ($x -gt $maxX) { $maxX = $x }
                if ($y -lt $minY) { $minY = $y }
                if ($y -gt $maxY) { $maxY = $y }
                $count++
            }
        }
    }
    $bmp.Dispose()
    if ($count -gt 0) {
        $midX = [math]::Round(($minX + $maxX) / 2)
        $midY = [math]::Round(($minY + $maxY) / 2)
        Write-Host "$($s) - Total W=$w H=$h | Saddle Center: X=$midX, Y=$midY (Range X: $minX..$maxX, Y: $minY..$maxY, Pixels: $count)"
    } else {
        Write-Host "$($s) - Saddle red pixels not detected directly. Total W=$w H=$h"
    }
}
