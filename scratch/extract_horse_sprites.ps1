Add-Type -AssemblyName System.Drawing
$srcPath = "C:\Users\WIN11\.gemini\antigravity-ide\brain\9e0251d6-3d17-44bc-890a-5fd36c297907\.user_uploaded\media_1793048866661.jpg"
$destDir = "c:\Users\WIN11\Desktop\metaversemini\public\assets\horse"
if (-not (Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir -Force }

$bmp = [System.Drawing.Bitmap]::FromFile($srcPath)

# Crop definitions for the 5 horses (X, Y, Width, Height)
$boxes = @(
    @{ Name = "horse_front";      X = 18;  Y = 140; W = 145; H = 360 },
    @{ Name = "horse_iso_front";  X = 158; Y = 140; W = 225; H = 360 },
    @{ Name = "horse_side";       X = 355; Y = 140; W = 295; H = 360 },
    @{ Name = "horse_iso_back";   X = 630; Y = 140; W = 235; H = 360 },
    @{ Name = "horse_back";       X = 850; Y = 140; W = 150; H = 360 }
)

foreach ($b in $boxes) {
    $cropBmp = New-Object System.Drawing.Bitmap($b.W, $b.H, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($cropBmp)
    $srcRect = New-Object System.Drawing.Rectangle($b.X, $b.Y, $b.W, $b.H)
    $destRect = New-Object System.Drawing.Rectangle(0, 0, $b.W, $b.H)
    $g.DrawImage($bmp, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
    $g.Dispose()

    # Remove white background
    for ($y = 0; $y -lt $b.H; $y++) {
        for ($x = 0; $x -lt $b.W; $x++) {
            $c = $cropBmp.GetPixel($x, $y)
            # Threshold for pure/near white
            if ($c.R -gt 242 -and $c.G -gt 242 -and $c.B -gt 242) {
                $cropBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
            } elseif ($c.R -gt 225 -and $c.G -gt 225 -and $c.B -gt 225) {
                # Smooth edge anti-aliasing
                $alpha = [int](255 * (255 - (($c.R + $c.G + $c.B) / 3)) / 30)
                if ($alpha -lt 0) { $alpha = 0 }
                if ($alpha -gt 255) { $alpha = 255 }
                $cropBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $c.R, $c.G, $c.B))
            }
        }
    }

    $outPath = Join-Path $destDir "$($b.Name).png"
    $cropBmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $cropBmp.Dispose()
    Write-Host "Saved: $outPath"
}

$bmp.Dispose()
Write-Host "All 5 horse sprites processed and saved successfully!"
