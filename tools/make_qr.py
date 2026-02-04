import qrcode

# IMPORTANT:
# This MUST be your *hosted* link (GitHub Pages link or your own domain)
# Example format:
# https://YOURNAME.github.io/vrr-quick-register/?apt=Hebron%20121%20Station&resident=Martin&unit=101
URL = "https://martinlegge.github.io/vrr-quick-register/"

OUT_FILE = "vrr_quick_register_qr.png"

img = qrcode.make(URL)
img.save(OUT_FILE)

print("Saved:", OUT_FILE)
print("Points to:", URL)
 