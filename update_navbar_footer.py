import os
import re

# Get all HTML files in the current directory (excluding index.html and files in assets folder)
html_files = [f for f in os.listdir('.') if f.endswith('.html') and f != 'index.html' and not f.startswith('assets')]

replacements = [
    # Side menu logo
    (r'src="assets/img/logo\.svg"', 'src="assets/img/Intio-logo.png"'),
    # Mobile menu logo
    (r'src="assets/img/icon/Image\.jpg"', 'src="assets/img/Intio-logo.png"'),
    # Header logo
    (r'src="assets/img/icon/Image\.jpg"', 'src="assets/img/Intio-logo.png"'),
    # Footer logo
    (r'src="assets/img/icon/logo\.png"', 'src="assets/img/Intio-logo.png"'),
    # Get Free Consultant button
    (r'href="contact\.html" class="th-btn black-border">Get Free Consultant</a>', 'href="#" class="th-btn black-border open-quote-popup">Get Free Consultant</a>'),
    # Footer phone numbers
    (r'<span class="text-white">\+91 98765 43210</span>\s*<span class="text-white">Andheri West', '<span class="text-white">+91 75075 93066</span>\n                  <span class="text-white">+91 98765 43210</span>\n                  <span class="text-white">Andheri West'),
    # Footer Quick Links - Design Blog to Inspiration
    (r'<li><a href="blog\.html">Design Blog</a></li>', '<li><a href="inspiration.html">Inspiration</a></li>'),
    # Footer Services link
    (r'<li><a href="service\.html">Our Services</a></li>', '<li><a href="service-design-styling.html">Our Services</a></li>'),
    # Copyright text
    (r'<a href="https://themeforest\.net/user/themeholy">Faren </a>', '<a href="https://themeforest.net/user/themeholy">Intio </a>'),
]

for filename in html_files:
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Apply all replacements
        for pattern, replacement in replacements:
            content = re.sub(pattern, replacement, content)
        
        # Only write if content changed
        if content != original_content:
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Updated: {filename}")
        else:
            print(f"No changes needed: {filename}")
    except Exception as e:
        print(f"Error processing {filename}: {e}")

print(f"\nProcessed {len(html_files)} files")

