#!/bin/bash
# Generate self-signed SSL certificate for local HTTPS testing

echo "Generating self-signed SSL certificate..."

# Create certs directory
mkdir -p certs

# Generate private key and certificate
openssl req -x509 -newkey rsa:4096 -nodes \
    -keyout certs/key.pem \
    -out certs/cert.pem \
    -days 365 \
    -subj "/C=US/ST=California/L=SF/O=VIBE/CN=localhost"

echo ""
echo "✅ SSL certificate generated!"
echo ""
echo "Files created:"
echo "  - certs/cert.pem (certificate)"
echo "  - certs/key.pem (private key)"
echo ""
echo "Now run backend with HTTPS:"
echo "  uvicorn main:app --reload --host 0.0.0.0 --ssl-keyfile=certs/key.pem --ssl-certfile=certs/cert.pem"
echo ""
echo "Then visit on phone:"
echo "  https://YOUR_IP:8000/camera_scan.html"
echo ""
echo "NOTE: You'll see a security warning - tap 'Advanced' then 'Proceed' to accept the self-signed certificate."
