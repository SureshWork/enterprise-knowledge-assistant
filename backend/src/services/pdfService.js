import pdf from "pdf-parse/lib/pdf-parse.js";

export const extractPdfText = async (buffer) => {
  try {
    const result = await pdf(buffer, {
      pagerender: async (pageData) => {
        const content = await pageData.getTextContent();

        const pageText = content.items
          .map(item => item.str)
          .join(" ");

        return `${pageText}\n[[PAGE_BREAK]]\n`;
      }
    });

    const pages = result.text
      .split("[[PAGE_BREAK]]")
      .map((text, index) => ({
        pageNumber: index + 1,
        text: text.trim()
      }))
      .filter(page => page.text.length > 0);

    if (!pages.length) {
      throw new Error("No readable text found in PDF");
    }

    return {
      totalPages: result.numpages,
      pages
    };

  } catch (error) {
    console.error("PDF extraction error:", error.message);
    throw new Error(`PDF extraction failed: ${error.message}`);
  }
};