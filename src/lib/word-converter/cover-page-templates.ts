/**
 * Professional Cover Page Templates
 * Three different designs for DOCX cover pages
 * Supports Arabic and English with automatic detection
 * Includes logo support and professional borders
 */

import {
  AlignmentType,
  Paragraph,
  TextRun,
  HeadingLevel,
  BorderStyle,
  ShadingType,
  ImageRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  VerticalAlign,
  convertInchesToTwip,
} from 'docx';

export interface CoverPageData {
  name?: string;
  projectDescription?: string;
  projectType?: string;
  specialization?: string;
  teamMembers?: string[];
  supervisor?: string;
  university?: string;
  course?: string;
  educationalLevel?: string;
  universityLogoUrl?: string;
  logoImage?: Buffer; // Loaded logo image data
}

export type CoverPageStyle = 'modern' | 'classic' | 'elegant';

/**
 * Detect if content is Arabic
 */
function isArabicContent(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text || '');
}

/**
 * Get localized labels
 */
function getLabels(isArabic: boolean) {
  return {
    projectType: isArabic ? 'نوع المشروع' : 'Project Type',
    specialization: isArabic ? 'التخصص' : 'Specialization',
    preparedBy: isArabic ? 'إعداد الطلاب' : 'Prepared by',
    supervisedBy: isArabic ? 'إشراف' : 'Supervised by',
    supervisor: isArabic ? 'المشرف' : 'Supervisor',
    academicYear: isArabic ? 'العام الدراسي' : 'Academic Year',
    date: isArabic ? 'التاريخ' : 'Date',
  };
}

/**
 * Get formatted date
 */
function getFormattedDate(isArabic: boolean): { date: string; year: string } {
  const locale = isArabic ? 'ar-SA' : 'en-US';
  const date = new Date().toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  const currentYear = new Date().getFullYear();
  const year = `${currentYear}-${currentYear + 1}`;
  
  return { date, year };
}

/**
 * Create logo paragraph if image data is available
 */
function createLogoParagraph(logoImage?: Buffer): Paragraph | null {
  if (!logoImage) return null;
  
  try {
    return new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 480 },
      children: [
        new ImageRun({
          data: logoImage,
          transformation: {
            width: 150,
            height: 150,
          },
        }),
      ],
    });
  } catch (error) {
    console.error('Failed to create logo:', error);
    return null;
  }
}

/**
 * DESIGN 1: MODERN (Professional Style)
 * Based on CoverPage.tsx Professional design
 * Clean, centered layout matching the web preview exactly
 */
export async function createModernCoverPage(data: CoverPageData): Promise<Paragraph[]> {
  const elements: Paragraph[] = [];
  const isArabic = isArabicContent(data.name || '');
  const labels = getLabels(isArabic);
  const { date, year } = getFormattedDate(isArabic);

  // Top spacing (Header section)
  elements.push(new Paragraph({ spacing: { before: 1440, after: 480 } }));

  // Logo (centered, large)
  const logo = createLogoParagraph(data.logoImage);
  if (logo) {
    elements.push(logo);
    elements.push(new Paragraph({ spacing: { after: 480 } }));
  }

  // Main Title (Large, Bold, Primary Color - like h1 in CoverPage)
  elements.push(
    new Paragraph({
      text: data.name || 'Untitled Project',
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 320 },
      bidirectional: isArabic,
    })
  );

  // University with small logo indicator (like the inline logo + university)
  if (data.university) {
    elements.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 720 },
        bidirectional: isArabic,
        children: [
          new TextRun({
            text: data.university,
            size: 22,
            bold: true,
            color: '666666',
          }),
        ],
      })
    );
  }

  // === MAIN CONTENT (Centered vertically) ===
  
  // Project Description (Large, italic, centered - like main content area)
  if (data.projectDescription) {
    elements.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 960, after: 960 },
        bidirectional: isArabic,
        children: [
          new TextRun({
            text: data.projectDescription,
            size: 28,
            color: '666666',
            italics: true,
          }),
        ],
      })
    );
  }

  // === FOOTER SECTION ===
  
  // Educational Level and Specialization (like footer in CoverPage)
  if (data.educationalLevel) {
    elements.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 720, after: 120 },
        bidirectional: isArabic,
        children: [
          new TextRun({
            text: data.educationalLevel,
            size: 22,
            bold: true,
            color: '666666',
          }),
        ],
      })
    );
  }

  if (data.specialization) {
    elements.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 60, after: 0 },
        bidirectional: isArabic,
        children: [
          new TextRun({
            text: 'in',
            size: 18,
            color: '999999',
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 60, after: 480 },
        bidirectional: isArabic,
        children: [
          new TextRun({
            text: data.specialization,
            size: 24,
            bold: true,
            color: '333333',
          }),
        ],
      })
    );
  }

  // "Submitted By" heading
  if (data.teamMembers && data.teamMembers.length > 0) {
    elements.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 480, after: 240 },
        bidirectional: isArabic,
        children: [
          new TextRun({
            text: labels.preparedBy,
            size: 22,
            bold: true,
            color: '666666',
          }),
        ],
      })
    );

    // Team members (simple, centered)
    data.teamMembers.forEach((member) => {
      elements.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 120, after: 120 },
          bidirectional: isArabic,
          children: [
            new TextRun({
              text: member,
              size: 24,
              bold: true,
              color: '333333',
            }),
          ],
        })
      );
    });
  }

  // Bottom section (flex layout simulation)
  elements.push(new Paragraph({ spacing: { before: 720 } }));

  // Left side: Supervisor and Course
  if (data.supervisor) {
    elements.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { before: 240, after: 80 },
        bidirectional: isArabic,
        children: [
          new TextRun({
            text: data.supervisor,
            size: 20,
            bold: true,
            color: '333333',
          }),
        ],
      })
    );
  }

  if (data.course) {
    elements.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { before: 40, after: 240 },
        bidirectional: isArabic,
        children: [
          new TextRun({
            text: data.course,
            size: 18,
            color: '666666',
          }),
        ],
      })
    );
  }

  // Right side: Date
  elements.push(
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { before: 0, after: 480 },
      bidirectional: isArabic,
      children: [
        new TextRun({
          text: date,
          size: 18,
          color: '666666',
        }),
      ],
    })
  );

  return elements;
}

/**
 * DESIGN 2: CLASSIC (Academic Style)
 * Based on CoverPage.tsx Academic design
 * Features: Double border frame, formal academic layout
 */
export async function createClassicCoverPage(data: CoverPageData): Promise<Paragraph[]> {
  const elements: Paragraph[] = [];
  const isArabic = isArabicContent(data.name || '');
  const labels = getLabels(isArabic);
  const { date, year } = getFormattedDate(isArabic);

  // Top border simulation (double border like academic style)
  elements.push(
    new Paragraph({
      spacing: { before: 720, after: 0 },
      border: {
        top: { color: '4A90E2', space: 4, style: BorderStyle.DOUBLE, size: 16 },
      },
    })
  );

  // Top spacing
  elements.push(new Paragraph({ spacing: { before: 960, after: 480 } }));

  // Logo
  const logo = createLogoParagraph(data.logoImage);
  if (logo) {
    elements.push(logo);
    elements.push(new Paragraph({ spacing: { after: 480 } }));
  }

  // Main Title
  elements.push(
    new Paragraph({
      text: data.name || 'Untitled Project',
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 320 },
      border: {
        top: { color: '4A90E2', space: 4, style: BorderStyle.DOUBLE, size: 12 },
        bottom: { color: '4A90E2', space: 4, style: BorderStyle.DOUBLE, size: 12 },
      },
      bidirectional: isArabic,
    })
  );

  // University
  if (data.university) {
    elements.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 720 },
        bidirectional: isArabic,
        children: [
          new TextRun({
            text: data.university,
            size: 22,
            bold: true,
            color: '666666',
          }),
        ],
      })
    );
  }

  // Project Description
  if (data.projectDescription) {
    elements.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 960, after: 960 },
        bidirectional: isArabic,
        children: [
          new TextRun({
            text: data.projectDescription,
            size: 28,
            color: '666666',
            italics: true,
          }),
        ],
      })
    );
  }

  // Educational Level
  if (data.educationalLevel) {
    elements.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 720, after: 120 },
        bidirectional: isArabic,
        children: [
          new TextRun({
            text: data.educationalLevel,
            size: 22,
            bold: true,
            color: '666666',
          }),
        ],
      })
    );
  }

  if (data.specialization) {
    elements.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 60, after: 0 },
        bidirectional: isArabic,
        children: [
          new TextRun({
            text: 'in',
            size: 18,
            color: '999999',
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 60, after: 480 },
        bidirectional: isArabic,
        children: [
          new TextRun({
            text: data.specialization,
            size: 24,
            bold: true,
            color: '333333',
          }),
        ],
      })
    );
  }

  // Submitted By
  if (data.teamMembers && data.teamMembers.length > 0) {
    elements.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 480, after: 240 },
        bidirectional: isArabic,
        children: [
          new TextRun({
            text: labels.preparedBy,
            size: 22,
            bold: true,
            color: '666666',
          }),
        ],
      })
    );

    data.teamMembers.forEach((member) => {
      elements.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 120, after: 120 },
          bidirectional: isArabic,
          children: [
            new TextRun({
              text: member,
              size: 24,
              bold: true,
              color: '333333',
            }),
          ],
        })
      );
    });
  }

  // Bottom section
  elements.push(new Paragraph({ spacing: { before: 720 } }));

  if (data.supervisor) {
    elements.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { before: 240, after: 80 },
        bidirectional: isArabic,
        children: [
          new TextRun({
            text: data.supervisor,
            size: 20,
            bold: true,
            color: '333333',
          }),
        ],
      })
    );
  }

  if (data.course) {
    elements.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { before: 40, after: 240 },
        bidirectional: isArabic,
        children: [
          new TextRun({
            text: data.course,
            size: 18,
            color: '666666',
          }),
        ],
      })
    );
  }

  elements.push(
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { before: 0, after: 480 },
      bidirectional: isArabic,
      children: [
        new TextRun({
          text: date,
          size: 18,
          color: '666666',
        }),
      ],
    })
  );

  // Bottom border
  elements.push(
    new Paragraph({
      spacing: { before: 240 },
      border: {
        bottom: { color: '4A90E2', space: 4, style: BorderStyle.DOUBLE, size: 16 },
      },
    })
  );

  return elements;
}

/**
 * DESIGN 3: ELEGANT (Creative Style)  
 * Based on CoverPage.tsx Creative design
 * Features: Corner decorations, creative layout
 */
export async function createElegantCoverPage(data: CoverPageData): Promise<Paragraph[]> {
  const elements: Paragraph[] = [];
  const isArabic = isArabicContent(data.name || '');
  const labels = getLabels(isArabic);
  const { date, year } = getFormattedDate(isArabic);

  // Creative corner decorations (simulated with borders)
  elements.push(
    new Paragraph({
      spacing: { before: 720, after: 0 },
      border: {
        top: { color: 'CC9933', space: 2, style: BorderStyle.DASHED, size: 12 },
        left: { color: 'CC9933', space: 2, style: BorderStyle.DASHED, size: 12 },
      },
    })
  );

  // Top spacing
  elements.push(new Paragraph({ spacing: { before: 960, after: 480 } }));

  // Logo
  const logo = createLogoParagraph(data.logoImage);
  if (logo) {
    elements.push(logo);
    elements.push(new Paragraph({ spacing: { after: 480 } }));
  }

  // Main Title
  elements.push(
    new Paragraph({
      text: data.name || 'Untitled Project',
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 320 },
      bidirectional: isArabic,
    })
  );

  // University
  if (data.university) {
    elements.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 720 },
        bidirectional: isArabic,
        children: [
          new TextRun({
            text: data.university,
            size: 22,
            bold: true,
            color: '666666',
          }),
        ],
      })
    );
  }

  // Project Description
  if (data.projectDescription) {
    elements.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 960, after: 960 },
        bidirectional: isArabic,
        children: [
          new TextRun({
            text: data.projectDescription,
            size: 28,
            color: '666666',
            italics: true,
          }),
        ],
      })
    );
  }

  // Educational Level
  if (data.educationalLevel) {
    elements.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 720, after: 120 },
        bidirectional: isArabic,
        children: [
          new TextRun({
            text: data.educationalLevel,
            size: 22,
            bold: true,
            color: '666666',
          }),
        ],
      })
    );
  }

  if (data.specialization) {
    elements.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 60, after: 0 },
        bidirectional: isArabic,
        children: [
          new TextRun({
            text: 'in',
            size: 18,
            color: '999999',
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 60, after: 480 },
        bidirectional: isArabic,
        children: [
          new TextRun({
            text: data.specialization,
            size: 24,
            bold: true,
            color: '333333',
          }),
        ],
      })
    );
  }

  // Submitted By
  if (data.teamMembers && data.teamMembers.length > 0) {
    elements.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 480, after: 240 },
        bidirectional: isArabic,
        children: [
          new TextRun({
            text: labels.preparedBy,
            size: 22,
            bold: true,
            color: '666666',
          }),
        ],
      })
    );

    data.teamMembers.forEach((member) => {
      elements.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 120, after: 120 },
          bidirectional: isArabic,
          children: [
            new TextRun({
              text: member,
              size: 24,
              bold: true,
              color: '333333',
            }),
          ],
        })
      );
    });
  }

  // Bottom section
  elements.push(new Paragraph({ spacing: { before: 720 } }));

  if (data.supervisor) {
    elements.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { before: 240, after: 80 },
        bidirectional: isArabic,
        children: [
          new TextRun({
            text: data.supervisor,
            size: 20,
            bold: true,
            color: '333333',
          }),
        ],
      })
    );
  }

  if (data.course) {
    elements.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { before: 40, after: 240 },
        bidirectional: isArabic,
        children: [
          new TextRun({
            text: data.course,
            size: 18,
            color: '666666',
          }),
        ],
      })
    );
  }

  elements.push(
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { before: 0, after: 480 },
      bidirectional: isArabic,
      children: [
        new TextRun({
          text: date,
          size: 18,
          color: '666666',
        }),
      ],
    })
  );

  // Bottom corner border
  elements.push(
    new Paragraph({
      spacing: { before: 240 },
      border: {
        bottom: { color: 'CC9933', space: 2, style: BorderStyle.DASHED, size: 12 },
        right: { color: 'CC9933', space: 2, style: BorderStyle.DASHED, size: 12 },
      },
    })
  );

  return elements;
}

export default {
  isArabicContent,
  getLabels,
  getFormattedDate,
  createLogoParagraph,
  createModernCoverPage,
  createClassicCoverPage,
  createElegantCoverPage,
};
