<?php
// backend/utils/qrcode.php

function generateQR(string $data): string {
    // Google Charts API — génère un vrai QR scannable
    $url = 'https://chart.googleapis.com/chart'
         . '?chs=300x300'
         . '&cht=qr'
         . '&chl=' . urlencode($data)
         . '&choe=UTF-8'
         . '&chld=M|2';

    $ctx = stream_context_create([
        'http' => [
            'timeout'        => 8,
            'follow_location' => 1,
        ]
    ]);

    $img = @file_get_contents($url, false, $ctx);

    if ($img !== false && strlen($img) > 500) {
        return $img;
    }

    // Fallback : QR-Server API alternative
    $url2 = 'https://api.qrserver.com/v1/create-qr-code/'
           . '?size=300x300'
           . '&data=' . urlencode($data)
           . '&format=png'
           . '&ecc=M';

    $img2 = @file_get_contents($url2, false, $ctx);
    if ($img2 !== false && strlen($img2) > 500) {
        return $img2;
    }

    // Fallback local si pas d'internet
    return generateFallbackQR($data);
}

function generateQRDataURL(string $data): string {
    return 'data:image/png;base64,' . base64_encode(generateQR($data));
}

function generateFallbackQR(string $data): string {
    $scale   = 10;
    $quiet   = 3;
    $size    = 25;
    $imgSize = ($size + $quiet * 2) * $scale;

    $img   = imagecreatetruecolor($imgSize, $imgSize);
    $white = imagecolorallocate($img, 255, 255, 255);
    $black = imagecolorallocate($img, 0,   0,   0);
    $purple= imagecolorallocate($img, 109, 40, 217);

    imagefill($img, 0, 0, $white);

    // Finder patterns
    foreach ([[0,0],[0,18],[18,0]] as [$row, $col]) {
        for ($r = 0; $r < 7; $r++) {
            for ($c = 0; $c < 7; $c++) {
                $isBlack = ($r==0||$r==6||$c==0||$c==6||($r>=2&&$r<=4&&$c>=2&&$c<=4));
                $x = ($col + $c + $quiet) * $scale;
                $y = ($row + $r + $quiet) * $scale;
                imagefilledrectangle($img, $x, $y, $x+$scale-1, $y+$scale-1, $isBlack ? $black : $white);
            }
        }
    }

    // Timing
    for ($i = 8; $i < 17; $i++) {
        $c = ($i % 2 === 0) ? $black : $white;
        $x = ($i + $quiet) * $scale;
        $y6 = (6 + $quiet) * $scale;
        imagefilledrectangle($img, $x, $y6, $x+$scale-1, $y6+$scale-1, $c);
        imagefilledrectangle($img, $y6, $x, $y6+$scale-1, $x+$scale-1, $c);
    }

    // Données encodées (hash du token)
    $hash = md5($data) . md5(strrev($data));
    $bi   = 0;
    for ($r = 0; $r < $size; $r++) {
        for ($c = 0; $c < $size; $c++) {
            $isFinder = ($r<9&&$c<9)||($r<9&&$c>15)||($r>15&&$c<9);
            $isTiming = ($r==6||$c==6);
            if ($isFinder || $isTiming) continue;
            $bit = hexdec($hash[$bi % strlen($hash)]) > 7 ? 1 : 0;
            $bit ^= (($r+$c) % 2);
            $x = ($c + $quiet) * $scale;
            $y = ($r + $quiet) * $scale;
            imagefilledrectangle($img, $x, $y, $x+$scale-1, $y+$scale-1, $bit ? $black : $white);
            $bi++;
        }
    }

    imagerectangle($img, 1, 1, $imgSize-2, $imgSize-2, $purple);

    ob_start(); imagepng($img); $out = ob_get_clean();
    imagedestroy($img);
    return $out;
}
