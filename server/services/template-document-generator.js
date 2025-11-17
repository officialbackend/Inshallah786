/**
 * Template-Based Document Generator
 * Uses authentic DHA document images as fallback templates when API fails
 * Only activates when official DHA API document fetch doesn't work
 */

import PDFDocument from 'pdfkit';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import QRCode from 'qrcode';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../..');

// Map document images to their types
const DOCUMENT_TEMPLATES = {
  'Coat of arms': path.join(PROJECT_ROOT, 'Coat of arms'),
  'Permanent resident': path.join(PROJECT_ROOT, 'Permanent resident'),
  'Template permanent resident': path.join(PROJECT_ROOT, 'Template permanent resident'),
  'Naturalisation': path.join(PROJECT_ROOT, 'Naturalisation'),
  'Workers permit': path.join(PROJECT_ROOT, 'Workers permit'),
  'Relative visa': path.join(PROJECT_ROOT, 'Relative visa'),
  'Declaration': path.join(PROJECT_ROOT, 'Declaration'),
  'Birth certificate': null, // Placeholder files
  'Refugee certificate': null // Placeholder files
};

/**
 * Process image to optimized PDF-ready buffer
 * @param {string} imagePath - Path to image file
 * @returns {Promise<Buffer>} - Optimized image buffer
 */
async function processImageToBuffer(imagePath) {
  try {
    if (!fs.existsSync(imagePath)) {
      console.log(`⚠️ Template not found: ${imagePath}`);
      return null;
    }

    const stat = fs.statSync(imagePath);
    if (stat.size < 10) {
      console.log(`⚠️ Invalid template file (too small): ${imagePath}`);
      return null;
    }

    // Process with sharp for optimal PDF embedding
    const buffer = await sharp(imagePath)
      .resize(1200, 1697, { // A4 proportions at good quality
        fit: 'inside',
        withoutEnlargement: false
      })
      .jpeg({ quality: 95, progressive: true })
      .toBuffer();

    console.log(`✅ Processed template: ${path.basename(imagePath)} (${(buffer.length / 1024).toFixed(1)}KB)`);
    return buffer;
  } catch (error) {
    console.error(`❌ Error processing ${imagePath}:`, error.message);
    return null;
  }
}

/**
 * Get coat of arms as buffer for use in PDF
 */
export async function getCoatOfArmsBuffer() {
  const coatPath = DOCUMENT_TEMPLATES['Coat of arms'];
  if (!coatPath) return null;
  return await processImageToBuffer(coatPath);
}

/**
 * Generate template-based PDF with applicant info overlaid
 * ONLY USED AS FALLBACK when DHA API fails
 */
export async function generateTemplateBasedPDF(permit) {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ 
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });

      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Determine template based on permit type
      let templatePath = null;
      let useTemplate = false;

      if (permit.type === 'Permanent Residence' || permit.type === 'Permanent Resident') {
        templatePath = DOCUMENT_TEMPLATES['Template permanent resident'] || DOCUMENT_TEMPLATES['Permanent resident'];
        useTemplate = true;
      } else if (permit.type === 'Naturalization Certificate' || permit.type === 'Naturalisation') {
        templatePath = DOCUMENT_TEMPLATES['Naturalisation'];
        useTemplate = true;
      } else if (permit.type === 'General Work Permit' || permit.type === 'Work Permit') {
        templatePath = DOCUMENT_TEMPLATES['Workers permit'];
        useTemplate = true;
      } else if (permit.type === "Relative's Permit" || permit.type === "Relative's Visa") {
        templatePath = DOCUMENT_TEMPLATES['Relative visa'];
        useTemplate = true;
      }

      if (useTemplate && templatePath && fs.existsSync(templatePath)) {
        console.log(`📄 Using template-based generation for ${permit.type}`);
        await generateFromTemplate(doc, permit, templatePath);
      } else {
        console.log(`📄 Using standard generation for ${permit.type}`);
        // Fall back to standard generation
        const { generatePermitPDF } = await import('./pdf-generator.js');
        doc.end();
        return resolve(await generatePermitPDF(permit));
      }

      doc.end();
    } catch (error) {
      console.error('Template PDF generation error:', error);
      reject(error);
    }
  });
}

/**
 * Generate PDF using authentic document template as base
 */
async function generateFromTemplate(doc, permit, templatePath) {
  // Process template image
  const templateBuffer = await processImageToBuffer(templatePath);
  
  if (!templateBuffer) {
    console.log('⚠️ Template processing failed, using standard generation');
    return;
  }

  // Page 1: Template-based document
  doc.image(templateBuffer, 0, 0, { width: 595, height: 842 });

  // Overlay applicant information on template
  // Coordinates are approximate - adjust based on actual document layout
  doc.fontSize(12).font('Helvetica-Bold').fillColor('#000000');

  // Common positioning for different document types
  if (permit.type === 'Permanent Residence' || permit.type === 'Permanent Resident') {
    overlayPermanentResidenceData(doc, permit);
  } else if (permit.type === 'Naturalization Certificate' || permit.type === 'Naturalisation') {
    overlayNaturalisationData(doc, permit);
  } else if (permit.type === 'General Work Permit' || permit.type === 'Work Permit') {
    overlayWorkPermitData(doc, permit);
  } else if (permit.type === "Relative's Permit" || permit.type === "Relative's Visa") {
    overlayRelativePermitData(doc, permit);
  }

  // Add QR code for verification (bottom right)
  const verificationUrl = `https://www.dha.gov.za/verify?ref=${permit.permitNumber || permit.referenceNumber || ''}`;
  try {
    const qrDataUrl = await QRCode.toDataURL(verificationUrl, { 
      width: 100, 
      margin: 1,
      errorCorrectionLevel: 'H'
    });
    const qrImage = Buffer.from(qrDataUrl.split(',')[1], 'base64');
    doc.image(qrImage, 480, 720, { width: 80, height: 80 });
  } catch (error) {
    console.log('QR code generation failed:', error.message);
  }
}

/**
 * Overlay data for Permanent Residence permit
 */
function overlayPermanentResidenceData(doc, permit) {
  // These coordinates are approximate - based on typical DHA PR permit layout
  // Adjust based on actual template positioning
  
  // Permit Number (top section)
  doc.fontSize(11).font('Helvetica-Bold').fillColor('#000000');
  doc.text(permit.permitNumber || '', 150, 165);

  // Reference Number
  doc.text(permit.referenceNumber || permit.permitNumber || '', 400, 165);

  // Surname (uppercase)
  doc.fontSize(12).font('Helvetica');
  doc.text((permit.surname || permit.name?.split(' ').pop() || '').toUpperCase(), 150, 255);

  // First Name(s)
  const firstName = permit.forename || permit.name?.split(' ').slice(0, -1).join(' ') || '';
  doc.text(firstName.toUpperCase(), 150, 340);

  // Nationality
  doc.text((permit.nationality || '').toUpperCase(), 150, 380);

  // Date of birth
  doc.text(permit.dateOfBirth || '', 150, 420);

  // Gender
  doc.text((permit.gender || '').toUpperCase(), 400, 420);

  // Issue date
  doc.text(permit.issueDate || '', 150, 540);
}

/**
 * Overlay data for Naturalisation certificate
 */
function overlayNaturalisationData(doc, permit) {
  doc.fontSize(16).font('Times-Bold').fillColor('#000000');
  
  // Name (center, prominent)
  const fullName = permit.name || `${permit.forename || ''} ${permit.surname || ''}`.trim();
  doc.text(fullName.toUpperCase(), 100, 350, { align: 'center', width: 395 });

  // Certificate number (bottom)
  doc.fontSize(10).font('Times-Roman');
  doc.text(permit.permitNumber || '', 100, 650);

  // Reference number
  doc.text(permit.referenceNumber || '', 100, 670);
}

/**
 * Overlay data for Work Permit
 */
function overlayWorkPermitData(doc, permit) {
  doc.fontSize(10).font('Helvetica').fillColor('#000000');

  // Control Number
  doc.text(permit.controlNumber || 'AA' + Math.random().toString().slice(2, 9), 200, 180);

  // Ref No
  doc.text(permit.permitNumber || '', 200, 210);

  // Name
  doc.text((permit.name || '').toUpperCase(), 200, 250);

  // Passport No
  doc.text(permit.passport || '', 200, 280);

  // Issue Date
  doc.text(permit.issueDate || '', 200, 360);

  // Expiry Date
  doc.text(permit.expiryDate || '', 200, 390);
}

/**
 * Overlay data for Relative's Permit
 */
function overlayRelativePermitData(doc, permit) {
  doc.fontSize(10).font('Helvetica').fillColor('#000000');

  // Similar to work permit but for relatives
  doc.text(permit.controlNumber || 'AA' + Math.random().toString().slice(2, 9), 200, 180);
  doc.text(permit.permitNumber || '', 200, 210);
  doc.text((permit.name || '').toUpperCase(), 200, 250);
  doc.text(permit.passport || '', 200, 280);
  doc.text(permit.issueDate || '', 200, 330);
  doc.text(permit.expiryDate || '', 200, 360);
}

/**
 * Check if template exists for given permit type
 */
export function hasTemplate(permitType) {
  const normalizedType = permitType.toLowerCase();
  
  if (normalizedType.includes('permanent')) {
    return fs.existsSync(DOCUMENT_TEMPLATES['Template permanent resident']) || 
           fs.existsSync(DOCUMENT_TEMPLATES['Permanent resident']);
  }
  if (normalizedType.includes('natural')) {
    return fs.existsSync(DOCUMENT_TEMPLATES['Naturalisation']);
  }
  if (normalizedType.includes('work')) {
    return fs.existsSync(DOCUMENT_TEMPLATES['Workers permit']);
  }
  if (normalizedType.includes('relative')) {
    return fs.existsSync(DOCUMENT_TEMPLATES['Relative visa']);
  }
  
  return false;
}

/**
 * Get list of available templates
 */
export function getAvailableTemplates() {
  const available = [];
  
  for (const [name, path] of Object.entries(DOCUMENT_TEMPLATES)) {
    if (path && fs.existsSync(path)) {
      const stats = fs.statSync(path);
      if (stats.size > 10) { // Ensure it's not a placeholder
        available.push({
          name,
          path,
          size: stats.size,
          exists: true
        });
      }
    }
  }
  
  return available;
}

export default {
  generateTemplateBasedPDF,
  getCoatOfArmsBuffer,
  hasTemplate,
  getAvailableTemplates
};
