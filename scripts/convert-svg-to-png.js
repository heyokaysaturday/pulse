const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

// This script converts SVG to PNG using sharp library
// Install with: npm install --save-dev sharp

const convertSvgToPng = async () => {
  try {
    const sharp = require('sharp');

    const svgPath = path.join(__dirname, '../assets/logo.svg');
    const outputPath = path.join(__dirname, '../assets/icon-generated.png');

    await sharp(svgPath)
      .resize(1024, 1024)
      .png()
      .toFile(outputPath);

    console.log('✅ PNG created successfully:', outputPath);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\nTry installing sharp: npm install --save-dev sharp');
  }
};

convertSvgToPng();
