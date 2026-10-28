Add-Type -AssemblyName System.Drawing
$dir = "c:\Users\WIN11\Desktop\metaversemini\public\assets\horse"
Get-ChildItem $dir -Filter *.png | ForEach-Object {
    $bmp = [System.Drawing.Bitmap]::FromFile($_.FullName)
    $minX = $bmp.Width; $maxX = 0; $minY = $bmp.Height; $maxY = 0
    for ($y = 0; $y -lt $bmp.Height; $y++) {
        for ($x = 0; $x -lt $bmp.Width; $x++) {
            if ($bmp.GetPixel($x, $y).A -gt 30) {
                if ($x -lt $minX) { $minX = $x }
                if ($x -gt $maxX) { $maxX = $x }
                if ($y -lt $minY) { $minY = $y }
                if ($y -gt $maxY) { $maxY = $y }
            }
        }
    }
    $bmp.Dispose()
    Write-Host "$($_.Name): W=$($maxX - $minX) H=$($maxY - $minY) [X: $minX..$maxX, Y: $minY..$maxY]"
}
