const crypto = require('crypto');
const fs = require('fs');

const filePath = process.argv[2];

if (!filePath) {
  console.log('Usage: node calculate_checksum.js <path-to-your-apk>');
  console.log(
    'Example: node calculate_checksum.js android/app/build/outputs/apk/release/app-release.apk',
  );
  process.exit(1);
}

const hash = crypto.createHash('sha256');
const input = fs.createReadStream(filePath);

input.on('readable', () => {
  const data = input.read();
  if (data) hash.update(data);
});

input.on('end', () => {
  const checksum = hash.digest('base64'); // Android Provisioning expects URL-safe Base64 usually, but standard Base64 is often accepted. It's strictly Base64 (URL safe recommended).
  // Actually for PROVISIONING_DEVICE_ADMIN_PACKAGE_CHECKSUM it is often URL-safe base64.
  // Let's print both just in case.

  console.log(
    '----------------------------------------------------------------',
  );
  console.log('APK Checksum Calculator');
  console.log(
    '----------------------------------------------------------------',
  );
  console.log(`File: ${filePath}`);
  console.log(
    '----------------------------------------------------------------',
  );
  console.log(
    "SHA-256 (Base64) - Use this for 'android.app.extra.PROVISIONING_DEVICE_ADMIN_PACKAGE_CHECKSUM':",
  );
  console.log(
    checksum.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''),
  );
  console.log(
    '----------------------------------------------------------------',
  );
});
