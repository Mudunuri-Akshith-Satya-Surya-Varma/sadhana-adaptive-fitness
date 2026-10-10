import re, os, base64, sys
sys.stdout.reconfigure(encoding='utf-8')

html_path = 'sadhana_homepage_final.html'
out_dir = 'sadhana_frontend/public/assets'
os.makedirs(out_dir, exist_ok=True)

with open(html_path, 'r', encoding='utf-8') as f:
    content = f.read()

imgs = re.findall(r'<img[^>]*>', content)
print(f'Total img tags found: {len(imgs)}')

saved_files = {}

for idx, img in enumerate(imgs):
    src_match = re.search(r'src=["\']([^"\']*)["\']', img)
    alt_match = re.search(r'alt=["\']([^"\']*)["\']', img)
    class_match = re.search(r'class=["\']([^"\']*)["\']', img)
    
    src = src_match.group(1) if src_match else ''
    alt = alt_match.group(1) if alt_match else ''
    cls = class_match.group(1) if class_match else ''
    
    print(f'Img #{idx+1}: class="{cls}", alt="{alt}"')
    
    if src.startswith('data:image/'):
        # extract mime and data
        header, b64data = src.split(';base64,', 1)
        ext = 'png'
        if 'image/jpeg' in header or 'image/jpg' in header:
            ext = 'jpg'
        elif 'image/svg+xml' in header:
            ext = 'svg'
        elif 'image/webp' in header:
            ext = 'webp'
            
        data_bytes = base64.b64decode(b64data)
        data_len = len(data_bytes)
        
        # Exact mapping by index (0-based)
        if idx == 0:
            filename = f'sai_logo.{ext}'
        elif 1 <= idx <= 8:
            filename = f'sai_pose_{idx}.{ext}'
        elif idx == 9:
            filename = f'card_sthira_front.{ext}'
        elif idx == 10:
            filename = f'card_sthira_back.{ext}'
        elif idx == 11:
            filename = f'card_vistara_front.{ext}'
        elif idx == 12:
            filename = f'card_vistara_back.{ext}'
        elif idx == 13:
            filename = f'card_yodha_front.{ext}'
        elif idx == 14:
            filename = f'card_yodha_back.{ext}'
        elif idx == 15:
            filename = f'card_dhruva_front.{ext}'
        elif idx == 16:
            filename = f'card_dhruva_back.{ext}'
        elif idx == 17:
            filename = f'card_samanvaya_front.{ext}'
        elif idx == 18:
            filename = f'card_samanvaya_back.{ext}'
        elif idx in [19, 20, 21]:
            filename = f'sai_logo_copy_{idx}.{ext}'
        else:
            filename = f'asset_{idx+1}.{ext}'
            
        out_file = os.path.join(out_dir, filename)
        with open(out_file, 'wb') as out_f:
            out_f.write(data_bytes)
            
        print(f'   -> Saved: {filename} ({data_len} bytes)')

print('Done extracting assets!')
