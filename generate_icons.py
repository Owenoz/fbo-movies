#!/usr/bin/env python3
from PIL import Image
import os

# Paths
input_file = '/home/owenoz123/Desktop/kawogo-web/public/fbo-logo.jpg'
output_dir = '/home/owenoz123/Desktop/kawogo-web/public'

# Icon sizes
sizes = [72, 96, 128, 144, 152, 192, 384, 512]

print('Generating PWA icons from fbo-logo.jpg...')

# Open the source image
img = Image.open(input_file)

# Generate icons
for size in sizes:
    output_file = os.path.join(output_dir, f'icon-{size}x{size}.png')
    resized = img.resize((size, size), Image.Resampling.LANCZOS)
    resized.save(output_file, 'PNG')
    print(f'✓ Generated {size}x{size} icon')

# Generate apple-touch-icon (180x180)
apple_icon = img.resize((180, 180), Image.Resampling.LANCZOS)
apple_icon.save(os.path.join(output_dir, 'apple-touch-icon.png'), 'PNG')
print('✓ Generated apple-touch-icon.png')

# Generate favicon (32x32)
favicon = img.resize((32, 32), Image.Resampling.LANCZOS)
favicon.save(os.path.join(output_dir, 'favicon.png'), 'PNG')
print('✓ Generated favicon.png')

print('\n✅ All icons generated successfully!')
