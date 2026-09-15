import { describe, it, expect } from 'vitest';
import { getOptimizedImageUrl, generateResponsiveSrcSet } from '../utils/imageOptimizer';

describe('F41 — Production File Storage & Medical Asset Suite', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const storage = require('../../server/services/fileStorageService');

  it('1. Antivirus Scanning Hook: rejects malicious payloads and permits clean files', async () => {
    const cleanBuffer = Buffer.from('%PDF-1.4 Clinical Blood Chemistry Report Patient #1029');
    const cleanScan = await storage.scanFileForViruses(cleanBuffer, 'blood_test.pdf');
    expect(cleanScan.safe).toBe(true);

    const maliciousBuffer = Buffer.from('<script>malicious_payload()</script>');
    const infectedScan = await storage.scanFileForViruses(maliciousBuffer, 'infected.png');
    expect(infectedScan.safe).toBe(false);
    expect(infectedScan.reason).toContain('Malware signature detected');
  });

  it('2. SHA-256 Checksum: calculates cryptographic integrity checksums', () => {
    const buffer = Buffer.from('HealthSphere Medical Record Data');
    const checksum = storage.calculateChecksum(buffer);

    expect(typeof checksum).toBe('string');
    expect(checksum.length).toBe(64); // 32 bytes hex = 64 characters
  });

  it('3. MIME Validation & Upload: safely stores reports and returns metadata', async () => {
    const reportBuffer = Buffer.from('%PDF-1.4 Ultrasound Abdominal Scan Report');
    const uploadResult = await storage.uploadMedicalReport(reportBuffer, {
      fileName: 'ultrasound.pdf',
      mimeType: 'application/pdf',
      patientId: 'pat-999',
      category: 'radiology',
      userId: 'doc-123',
    });

    expect(uploadResult).toBeDefined();
    expect(uploadResult.publicId).toContain('pat-999');
    expect(uploadResult.fileUrl).toBeDefined();
    expect(uploadResult.thumbnailUrl).toBeDefined();
    expect(uploadResult.checksum).toBeDefined();
    expect(uploadResult.virusScanned).toBe(true);
  });

  it('4. MIME Rejection: rejects forbidden file extensions (e.g. .exe, .sh)', async () => {
    const execBuffer = Buffer.from('MZ... Executable file');
    await expect(
      storage.uploadMedicalReport(execBuffer, {
        fileName: 'malware.exe',
        mimeType: 'application/x-msdownload',
        patientId: 'pat-1',
      })
    ).rejects.toThrow('not permitted for medical uploads');
  });

  it('5. Signed URLs: generates expirable private download URLs', () => {
    const publicId = 'healthsphere/medical-reports/pat-999/scan.pdf';
    const signedUrl = storage.generateSignedUrl(publicId, 1800);

    expect(signedUrl).toBeDefined();
    expect(typeof signedUrl).toBe('string');
    expect(signedUrl).toMatch(/expires/i);
  });

  it('6. Medical Asset Deletion: safely destroys asset and updates audit trail', async () => {
    const result = await storage.deleteMedicalReport('healthsphere/medical-reports/pat-999/scan.pdf', 'doc-123');
    expect(result).toBe(true);
  });

  it('7. Frontend Image Optimizer: transforms Cloudinary URLs with auto-format and responsive srcSets', () => {
    const sampleUrl = 'https://res.cloudinary.com/healthsphere/image/upload/v12345/avatar.jpg';

    const optimized = getOptimizedImageUrl(sampleUrl, {
      width: 400,
      height: 400,
      crop: 'thumb',
      format: 'webp',
    });

    expect(optimized).toContain('f_webp');
    expect(optimized).toContain('w_400');
    expect(optimized).toContain('c_thumb');

    const srcSet = generateResponsiveSrcSet(sampleUrl, [320, 640]);
    expect(srcSet).toContain('320w');
    expect(srcSet).toContain('640w');
  });
});
