Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$public = Join-Path $root 'public'
$logoPath = Join-Path $public 'logo.png'

$logoSrc = [System.Drawing.Image]::FromFile($logoPath)

function New-RoundedPath([float]$x, [float]$y, [float]$w, [float]$h, [float]$r) {
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = $r * 2
  $path.AddArc($x, $y, $d, $d, 180, 90)
  $path.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
  $path.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
  $path.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
  $path.CloseFigure()
  return $path
}

function Draw-ContainedImage([System.Drawing.Graphics]$g, [System.Drawing.Image]$img, [float]$x, [float]$y, [float]$w, [float]$h) {
  $scale = [Math]::Min($w / $img.Width, $h / $img.Height)
  $dw = [float]($img.Width * $scale)
  $dh = [float]($img.Height * $scale)
  $dx = [float]($x + ($w - $dw) / 2)
  $dy = [float]($y + ($h - $dh) / 2)
  $g.DrawImage($img, [System.Drawing.RectangleF]::new($dx, $dy, $dw, $dh))
}

function Draw-SpacedText([System.Drawing.Graphics]$g, [string]$text, [System.Drawing.Font]$font, [System.Drawing.Brush]$brush, [float]$x, [float]$y, [float]$spacing) {
  $cursor = $x
  foreach ($ch in $text.ToCharArray()) {
    $g.DrawString([string]$ch, $font, $brush, $cursor, $y, [System.Drawing.StringFormat]::GenericTypographic)
    $size = $g.MeasureString([string]$ch, $font, [System.Drawing.PointF]::new(0, 0), [System.Drawing.StringFormat]::GenericTypographic)
    $cursor += $size.Width + $spacing
  }
}

function Draw-Glow([System.Drawing.Graphics]$g, [float]$cx, [float]$cy, [float]$radius, [System.Drawing.Color]$color, [int]$alpha) {
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $path.AddEllipse($cx - $radius, $cy - $radius, $radius * 2, $radius * 2)
  $brush = New-Object System.Drawing.Drawing2D.PathGradientBrush($path)
  $brush.CenterColor = [System.Drawing.Color]::FromArgb($alpha, $color.R, $color.G, $color.B)
  $brush.SurroundColors = @([System.Drawing.Color]::FromArgb(0, $color.R, $color.G, $color.B))
  $g.FillPath($brush, $path)
  $brush.Dispose()
  $path.Dispose()
}

# ---------- Favicon master (1024) ----------
$master = New-Object System.Drawing.Bitmap(1024, 1024, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($master)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.Clear([System.Drawing.Color]::Transparent)

$shadow = New-RoundedPath 44 62 936 936 232
$shadowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(55, 0, 0, 66))
$g.FillPath($shadowBrush, $shadow)

$bgPath = New-RoundedPath 32 32 960 960 232
$bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
  [System.Drawing.PointF]::new(32, 32),
  [System.Drawing.PointF]::new(992, 992),
  [System.Drawing.Color]::FromArgb(255, 255, 255, 255),
  [System.Drawing.Color]::FromArgb(255, 235, 227, 255)
)
$g.FillPath($bgBrush, $bgPath)

$borderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 196, 181, 255), 18)
$borderPen.Alignment = [System.Drawing.Drawing2D.PenAlignment]::Inset
$g.DrawPath($borderPen, $bgPath)

Draw-ContainedImage $g $logoSrc 122 297 780 430

$sizes = @(512, 192, 180, 48, 32, 16)
foreach ($size in $sizes) {
  $bmp = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $gb = [System.Drawing.Graphics]::FromImage($bmp)
  $gb.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $gb.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $gb.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $gb.DrawImage($master, [System.Drawing.Rectangle]::new(0, 0, $size, $size))
  if ($size -eq 512) { $bmp.Save((Join-Path $public 'favicon.png'), [System.Drawing.Imaging.ImageFormat]::Png) }
  if ($size -eq 512) { $bmp.Save((Join-Path $public 'favicon-512x512.png'), [System.Drawing.Imaging.ImageFormat]::Png) }
  if ($size -eq 192) { $bmp.Save((Join-Path $public 'favicon-192x192.png'), [System.Drawing.Imaging.ImageFormat]::Png) }
  if ($size -eq 180) { $bmp.Save((Join-Path $public 'apple-touch-icon.png'), [System.Drawing.Imaging.ImageFormat]::Png) }
  if ($size -eq 48) { $bmp.Save((Join-Path $public 'favicon-48x48.png'), [System.Drawing.Imaging.ImageFormat]::Png) }
  if ($size -eq 32) { $bmp.Save((Join-Path $public 'favicon-32x32.png'), [System.Drawing.Imaging.ImageFormat]::Png) }
  if ($size -eq 16) { $bmp.Save((Join-Path $public 'favicon-16x16.png'), [System.Drawing.Imaging.ImageFormat]::Png) }
  $gb.Dispose()
  $bmp.Dispose()
}

# ---------- ICO (16, 32, 48) ----------
$icoPngs = @(
  [System.IO.File]::ReadAllBytes((Join-Path $public 'favicon-16x16.png')),
  [System.IO.File]::ReadAllBytes((Join-Path $public 'favicon-32x32.png')),
  [System.IO.File]::ReadAllBytes((Join-Path $public 'favicon-48x48.png'))
)
$icoSizes = @(16, 32, 48)
$stream = New-Object System.IO.MemoryStream
$writer = New-Object System.IO.BinaryWriter($stream)
$writer.Write([UInt16]0)
$writer.Write([UInt16]1)
$writer.Write([UInt16]$icoPngs.Count)
$offset = 6 + (16 * $icoPngs.Count)
for ($i = 0; $i -lt $icoPngs.Count; $i++) {
  $dim = $icoSizes[$i]
  $writer.Write([byte]($(if ($dim -ge 256) { 0 } else { $dim })))
  $writer.Write([byte]($(if ($dim -ge 256) { 0 } else { $dim })))
  $writer.Write([byte]0)
  $writer.Write([byte]0)
  $writer.Write([UInt16]1)
  $writer.Write([UInt16]32)
  $writer.Write([UInt32]$icoPngs[$i].Length)
  $writer.Write([UInt32]$offset)
  $offset += $icoPngs[$i].Length
}
foreach ($bytes in $icoPngs) { $writer.Write($bytes) }
$writer.Flush()
[System.IO.File]::WriteAllBytes((Join-Path $public 'favicon.ico'), $stream.ToArray())
$writer.Dispose()
$stream.Dispose()

# ---------- SVG favicon (rounded rectangle + embedded logo) ----------
$logoBase64 = [Convert]::ToBase64String([System.IO.File]::ReadAllBytes($logoPath))
$svg = @"
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512" role="img" aria-label="Wemray Technology">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="1" stop-color="#ebe3ff"/>
    </linearGradient>
    <clipPath id="clip"><rect x="16" y="16" width="480" height="480" rx="116"/></clipPath>
  </defs>
  <rect x="16" y="16" width="480" height="480" rx="116" fill="url(#bg)" stroke="#c4b5ff" stroke-width="9"/>
  <g clip-path="url(#clip)">
    <image href="data:image/png;base64,$logoBase64" x="61" y="149" width="390" height="215" preserveAspectRatio="xMidYMid meet"/>
  </g>
</svg>
"@
[System.IO.File]::WriteAllText((Join-Path $public 'favicon.svg'), $svg, [System.Text.UTF8Encoding]::new($false))

# ---------- Open Graph image (1200x630) ----------
$og = New-Object System.Drawing.Bitmap(1200, 630, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
$g2 = [System.Drawing.Graphics]::FromImage($og)
$g2.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g2.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g2.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

$bg = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
  [System.Drawing.Rectangle]::new(0, 0, 1200, 630),
  [System.Drawing.Color]::FromArgb(255, 0, 0, 46),
  [System.Drawing.Color]::FromArgb(255, 24, 8, 92),
  [System.Drawing.Drawing2D.LinearGradientMode]::ForwardDiagonal
)
$g2.FillRectangle($bg, 0, 0, 1200, 630)
$bg.Dispose()

Draw-Glow $g2 1080 70 430 ([System.Drawing.Color]::FromArgb(81, 37, 210)) 135
Draw-Glow $g2 660 640 380 ([System.Drawing.Color]::FromArgb(122, 77, 255)) 80
Draw-Glow $g2 1180 560 300 ([System.Drawing.Color]::FromArgb(196, 181, 255)) 55

# subtle dot field
$dotBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(38, 196, 181, 255))
for ($x = 710; $x -lt 1200; $x += 26) {
  for ($y = 30; $y -lt 630; $y += 26) {
    $g2.FillEllipse($dotBrush, $x, $y, 2, 2)
  }
}
$dotBrush.Dispose()

# logo lockup
$panelPath = New-RoundedPath 80 74 190 108 26
$panelBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(245, 255, 255, 255))
$g2.FillPath($panelBrush, $panelPath)
$panelPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(120, 196, 181, 255), 2)
$g2.DrawPath($panelPen, $panelPath)
Draw-ContainedImage $g2 $logoSrc 100 91 150 74

$white = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$lav = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 196, 181, 255))
$soft = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 214, 211, 240))

$fontWord = [System.Drawing.Font]::new('Raleway SemiBold', [single]36, [System.Drawing.GraphicsUnit]::Pixel)
$fontSub = [System.Drawing.Font]::new('Raleway Medium', [single]14, [System.Drawing.GraphicsUnit]::Pixel)
$fontH1 = [System.Drawing.Font]::new('Raleway SemiBold', [single]64, [System.Drawing.GraphicsUnit]::Pixel)
$fontBody = [System.Drawing.Font]::new('Raleway Light', [single]25, [System.Drawing.GraphicsUnit]::Pixel)
$fontSmall = [System.Drawing.Font]::new('Raleway', [single]18, [System.Drawing.GraphicsUnit]::Pixel)
$fontTiny = [System.Drawing.Font]::new('Raleway Medium', [single]14, [System.Drawing.GraphicsUnit]::Pixel)
$fontList = [System.Drawing.Font]::new('Raleway Medium', [single]23, [System.Drawing.GraphicsUnit]::Pixel)
$fontNum = [System.Drawing.Font]::new('Raleway SemiBold', [single]15, [System.Drawing.GraphicsUnit]::Pixel)

Draw-SpacedText $g2 'WEMRAY' $fontWord $white 302 96 7
Draw-SpacedText $g2 'TECHNOLOGY' $fontSub $lav 306 146 5

$g2.DrawString('Branding, Software &', $fontH1, $white, 80, 238)
$g2.DrawString('Intelligent Growth.', $fontH1, $lav, 80, 312)

$g2.DrawString('We build brands, websites, software, AI and', $fontBody, $soft, 82, 424)
$g2.DrawString('automation for ambitious businesses.', $fontBody, $soft, 82, 462)

# services card
$cardPath = New-RoundedPath 790 108 356 414 30
$cardBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(26, 255, 255, 255))
$g2.FillPath($cardBrush, $cardPath)
$cardPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(90, 196, 181, 255), 2)
$g2.DrawPath($cardPen, $cardPath)

Draw-SpacedText $g2 'WHAT WE DO' $fontTiny $lav 828 150 3
$items = @(
  @('01', 'Brand & Identity'),
  @('02', 'Websites & E-commerce'),
  @('03', 'Software & SaaS'),
  @('04', 'AI & Automation'),
  @('05', 'SEO & Growth')
)
$iy = 210
foreach ($item in $items) {
  $g2.DrawString($item[0], $fontNum, $lav, 828, $iy + 4)
  $g2.DrawString($item[1], $fontList, $white, 872, $iy)
  $iy += 52
}
$g2.DrawString('Based in Port Harcourt.', $fontSmall, $soft, 828, 476)

$g2.DrawString('Port Harcourt  |  Lagos  |  Nigeria  |  London  |  United Kingdom  |  Canada', $fontSmall, $lav, 80, 546)
$g2.DrawString('wemray.com', $fontSmall, $white, 1010, 546)

$og.Save((Join-Path $public 'wemray-og.jpg'), [System.Drawing.Imaging.ImageFormat]::Jpeg)

# cleanup
$g2.Dispose()
$og.Dispose()
$g.Dispose()
$master.Dispose()
$logoSrc.Dispose()
$panelBrush.Dispose(); $panelPen.Dispose(); $cardBrush.Dispose(); $cardPen.Dispose()
$white.Dispose(); $lav.Dispose(); $soft.Dispose()
$fontWord.Dispose(); $fontSub.Dispose(); $fontH1.Dispose(); $fontBody.Dispose(); $fontSmall.Dispose(); $fontTiny.Dispose(); $fontList.Dispose(); $fontNum.Dispose()
$bgPath.Dispose(); $shadow.Dispose(); $shadowBrush.Dispose(); $bgBrush.Dispose(); $borderPen.Dispose(); $panelPath.Dispose(); $cardPath.Dispose()

Write-Output 'Brand assets generated.'



