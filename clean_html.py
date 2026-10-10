import sys, re
sys.stdout.reconfigure(encoding='utf-8')

with open('sadhana_homepage_final.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace any data:image/... with [ASSET_PATH]
cleaned = re.sub(r'data:image/[^\"\']+', '[ASSET_PATH]', text)
lines = cleaned.splitlines()

with open('sadhana_homepage_clean.html', 'w', encoding='utf-8') as out_f:
    out_f.write('\n'.join(lines))

print('Wrote sadhana_homepage_clean.html (without base64). Total lines:', len(lines))
