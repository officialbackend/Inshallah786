export function generateVerificationPage(permit) {
  const fullName = permit.name || `${permit.forename || ''} ${permit.surname || ''}`.trim();
  const refNumber = permit.permitNumber || permit.referenceNumber || permit.fileNumber;
  const baseUrl = process.env.RENDER_EXTERNAL_URL || 
                  (process.env.REPL_SLUG ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` : `http://localhost:5000`);
  const verificationUrl = `${baseUrl}/api/permits/${permit.id}/verify-document`;
  
  const permitTypeColors = {
    'Permanent Residence': { bg: '#d4f1d4', border: '#006600', text: '#006600' },
    'Naturalization Certificate': { bg: '#e8d4f1', border: '#6600cc', text: '#6600cc' },
    'General Work Permit': { bg: '#d4e8f1', border: '#0066cc', text: '#0066cc' },
    "Relative's Permit": { bg: '#f1d4e8', border: '#cc0066', text: '#cc0066' },
    'Refugee Status (Section 24)': { bg: '#f1e8d4', border: '#cc6600', text: '#cc6600' },
    'Birth Certificate': { bg: '#d4f1f1', border: '#00cccc', text: '#00cccc' }
  };
  
  const colors = permitTypeColors[permit.type] || { bg: '#d4f1d4', border: '#006600', text: '#006600' };
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DHA Document Verification - ${fullName}</title>
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🇿🇦</text></svg>">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', Arial, sans-serif;
            background: linear-gradient(135deg, #004d00 0%, #006600 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        
        .header {
            padding: 40px;
            text-align: center;
            border-bottom: 8px solid;
            border-image: linear-gradient(to right, #007749 33%, #FFD700 33%, #FFD700 66%, #DE3831 66%) 1;
        }
        
        .name-section {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 15px;
            margin-bottom: 30px;
            flex-wrap: wrap;
        }
        
        .name {
            font-size: 36px;
            font-weight: 800;
            color: #000;
        }
        
        .issued-badge {
            background: #006600;
            color: white;
            padding: 10px 24px;
            border-radius: 25px;
            font-size: 16px;
            font-weight: 700;
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }
        
        .check-icon {
            width: 20px;
            height: 20px;
            background: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #006600;
            font-weight: bold;
        }
        
        .content {
            padding: 40px;
        }
        
        .section {
            margin-bottom: 30px;
        }
        
        .section-label {
            font-size: 13px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: 600;
            margin-bottom: 10px;
        }
        
        .permit-type {
            display: inline-block;
            background: ${colors.bg};
            border: 2px solid ${colors.border};
            color: ${colors.text};
            padding: 12px 24px;
            border-radius: 25px;
            font-size: 18px;
            font-weight: 700;
        }
        
        .permit-number {
            font-size: 32px;
            font-weight: 800;
            color: #006600;
        }
        
        .field-value {
            font-size: 20px;
            font-weight: 700;
            color: #000;
        }
        
        .qr-section {
            background: #f8f9fa;
            border: 4px solid #006600;
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
        }
        
        .qr-section img {
            width: 250px;
            height: 250px;
            border: 2px solid #006600;
            border-radius: 8px;
            padding: 10px;
            background: white;
        }
        
        .qr-text {
            margin-top: 15px;
            font-size: 15px;
            color: #666;
        }
        
        .verification-links {
            background: #e8f4f8;
            border-left: 5px solid #0066cc;
            padding: 25px;
            border-radius: 8px;
            margin: 30px 0;
        }
        
        .verification-links h3 {
            font-size: 18px;
            font-weight: 700;
            color: #333;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .verification-link {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            color: #0066cc;
            text-decoration: none;
            font-size: 16px;
            font-weight: 600;
            padding: 12px 20px;
            background: white;
            border-radius: 8px;
            border: 2px solid #0066cc;
            transition: all 0.2s;
        }
        
        .verification-link:hover {
            background: #0066cc;
            color: white;
        }
        
        .system-status {
            background: linear-gradient(135deg, #d4f4dd 0%, #b8e6c5 100%);
            border: 2px solid #006600;
            border-radius: 12px;
            padding: 25px;
            margin: 30px 0;
        }
        
        .system-status h3 {
            font-size: 16px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 15px;
        }
        
        .status-message {
            font-size: 18px;
            font-weight: 700;
            color: #006600;
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 10px;
        }
        
        .status-detail {
            font-size: 14px;
            color: #006600;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        
        @media (max-width: 768px) {
            .name {
                font-size: 28px;
            }
            .permit-number {
                font-size: 24px;
            }
            .content {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="name-section">
                <div class="name">${fullName}</div>
                <div class="issued-badge">
                    <div class="check-icon">✓</div>
                    ISSUED
                </div>
                <div style="width: 40px; height: 40px; background: #006600; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px;">✓</div>
            </div>
        </div>
        
        <div class="content">
            <div class="section">
                <div class="section-label">PERMIT TYPE</div>
                <div class="permit-type">${permit.type}</div>
            </div>
            
            <div class="section">
                <div class="section-label">PERMIT NUMBER</div>
                <div class="permit-number">${refNumber}</div>
            </div>
            
            <div class="info-grid">
                ${permit.passport ? `
                <div class="section">
                    <div class="section-label">PASSPORT NUMBER</div>
                    <div class="field-value">${permit.passport}</div>
                </div>
                ` : ''}
                
                ${permit.idNumber || permit.identityNumber ? `
                <div class="section">
                    <div class="section-label">ID NUMBER</div>
                    <div class="field-value">${permit.idNumber || permit.identityNumber}</div>
                </div>
                ` : ''}
                
                <div class="section">
                    <div class="section-label">ISSUE DATE</div>
                    <div class="field-value">${permit.issueDate || 'N/A'}</div>
                </div>
                
                <div class="section">
                    <div class="section-label">EXPIRY DATE</div>
                    <div class="field-value">${permit.expiryDate || 'Permanent'}</div>
                </div>
            </div>
            
            ${permit.nationality ? `
            <div class="section">
                <div class="section-label">NATIONALITY</div>
                <div class="field-value">${permit.nationality}</div>
            </div>
            ` : ''}
            
            <div class="section">
                <div class="section-label">CATEGORY</div>
                <div class="field-value">${permit.category || 'N/A'}</div>
            </div>
            
            ${permit.officerName ? `
            <div class="info-grid">
                <div class="section">
                    <div class="section-label">ISSUING OFFICER</div>
                    <div class="field-value">${permit.officerName}</div>
                </div>
                <div class="section">
                    <div class="section-label">OFFICER ID</div>
                    <div class="field-value">${permit.officerID || 'N/A'}</div>
                </div>
            </div>
            ` : ''}
            
            <div class="qr-section">
                <img src="/api/permits/${permit.id}/qr" alt="QR Code" />
                <div class="qr-text">Scan to verify on official DHA website</div>
            </div>
            
            <div class="verification-links">
                <h3>🔗 Official Verification Links</h3>
                <a href="${verificationUrl}" class="verification-link" target="_blank">
                    🌐 Verify on DHA Official Website →
                </a>
            </div>
            
            <div class="system-status">
                <h3>SYSTEM STATUS</h3>
                <div class="status-message">
                    ✓ Verified and issued by Department of Home Affairs
                </div>
                <div class="status-detail">
                    This permit is active and valid in the national database
                </div>
            </div>
        </div>
    </div>
</body>
</html>
  `;
}
