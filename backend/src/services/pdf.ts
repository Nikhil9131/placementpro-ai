import pdfParse from 'pdf-parse';

export async function extractTextFromPdf(pdfBuffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(pdfBuffer);
    return data.text || '';
  } catch (error: any) {
    throw new Error(`Failed to parse PDF: ${error.message}`);
  }
}
