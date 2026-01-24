/**
 * Test Document Fixtures
 * 
 * Provides mock document data and builders for testing export workflows
 */

export const testDocxExportRequest = {
  projectId: 'test-project-123',
  format: 'docx' as const,
  includeTableOfContents: true,
  includePageNumbers: true,
};

export const testPptxExportRequest = {
  projectId: 'test-project-123',
  format: 'pptx' as const,
  theme: 'professional',
  slidesPerSection: 2,
};

export const testPdfExportRequest = {
  projectId: 'test-project-123',
  format: 'pdf' as const,
  pageSize: 'a4',
  margins: { top: 1, bottom: 1, left: 1, right: 1 },
};

export const testExportResponse = {
  success: true,
  fileUrl: 'https://storage.example.com/exports/test-project-123.docx',
  fileName: 'test-project-123.docx',
  fileSize: 15234,
  mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  createdAt: new Date().toISOString(),
};

export const testExportMetadata = {
  projectId: 'test-project-123',
  userId: 'test-user-123',
  format: 'docx' as const,
  fileSize: 15234,
  generatedAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
};

export const testDocxContent = {
  title: 'Test Project',
  subtitle: 'A test project for export testing',
  author: 'Test User',
  createdDate: new Date().toISOString(),
  sections: [
    {
      heading: 'Introduction',
      content: 'This is the introduction section with detailed content.',
      level: 1,
    },
    {
      heading: 'Background',
      content: 'Background information goes here.',
      level: 2,
    },
    {
      heading: 'Main Content',
      content: 'The main content of the document.',
      level: 1,
    },
    {
      heading: 'Conclusion',
      content: 'Final thoughts and conclusions.',
      level: 1,
    },
  ],
};

export const testPptxContent = {
  title: 'Test Project',
  subtitle: 'A test project for PowerPoint export',
  slides: [
    {
      type: 'title',
      title: 'Test Project',
      subtitle: 'A test project for PowerPoint export',
    },
    {
      type: 'content',
      title: 'Introduction',
      content: ['Key point 1', 'Key point 2', 'Key point 3'],
    },
    {
      type: 'content',
      title: 'Main Content',
      content: ['Main point 1', 'Main point 2', 'Main point 3'],
    },
    {
      type: 'conclusion',
      title: 'Conclusion',
      content: ['Summary point 1', 'Summary point 2'],
    },
  ],
};

export const testPdfContent = {
  title: 'Test Project',
  author: 'Test User',
  subject: 'Test project for PDF export',
  keywords: ['test', 'pdf', 'export'],
  createdDate: new Date(),
  pages: 5,
};

export const testFileValidation = {
  docxMimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  pptxMimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  pdfMimeType: 'application/pdf',
  minFileSize: 1000, // 1 KB
  maxFileSize: 50 * 1024 * 1024, // 50 MB
};

export const createMockDocxFile = (overrides = {}) => ({
  ...testDocxExportRequest,
  ...overrides,
});

export const createMockPptxFile = (overrides = {}) => ({
  ...testPptxExportRequest,
  ...overrides,
});

export const createMockPdfFile = (overrides = {}) => ({
  ...testPdfExportRequest,
  ...overrides,
});

export const createMockExportResponse = (
  fileName: string,
  format: 'docx' | 'pptx' | 'pdf',
  fileSize = 15234
) => ({
  ...testExportResponse,
  fileName,
  fileUrl: `https://storage.example.com/exports/${fileName}`,
  mimeType: testFileValidation[`${format}MimeType`],
  fileSize,
});

export const testExportErrorResponses = {
  projectNotFound: {
    success: false,
    error: {
      code: 'PROJECT_NOT_FOUND',
      message: 'Project not found',
    },
  },
  invalidFormat: {
    success: false,
    error: {
      code: 'INVALID_FORMAT',
      message: 'Invalid export format. Supported: docx, pptx, pdf',
    },
  },
  emptyProject: {
    success: false,
    error: {
      code: 'EMPTY_PROJECT',
      message: 'Cannot export empty project',
    },
  },
  unauthorizedAccess: {
    success: false,
    error: {
      code: 'UNAUTHORIZED',
      message: 'User is not authorized to export this project',
    },
  },
  exportFailed: {
    success: false,
    error: {
      code: 'EXPORT_FAILED',
      message: 'Failed to generate export file',
    },
  },
};
