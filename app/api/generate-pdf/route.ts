/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";

export async function POST(req: NextRequest) {
  try {
    const { html, fileName } = await req.json();

    if (!html) {
      return NextResponse.json({ error: "Brak HTML" }, { status: 400 });
    }

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    await page.setViewport({
      width: 1240,
      height: 1754,
      deviceScaleFactor: 2,
    });

    const fullHtml = `
      <html>
        <head>
          <meta charset="UTF-8" />

          <!-- Tailwind -->
          <script src="https://cdn.tailwindcss.com"></script>

          <!-- Font -->
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&display=swap" rel="stylesheet">

          <style>
            @page {
              size: A4;
              margin: 0;
            }

            body {
              margin: 0;
              padding: 0;
              font-family: 'Inter', sans-serif;
              -webkit-print-color-adjust: exact;
            }

            .page-break {
              page-break-before: always;
            }

            .avoid-break {
              page-break-inside: avoid;
            }
          </style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `;

    await page.setContent(fullHtml, {
      waitUntil: ["load", "networkidle0"],
    });

    await new Promise((resolve) => setTimeout(resolve, 800));

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "0mm",
        right: "0mm",
        bottom: "0mm",
        left: "0mm",
      },
    });

    await browser.close();

    return new NextResponse(pdfBuffer as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName || "cv.pdf"}"`,
      },
    });
  } catch (error) {
    console.error("PDF ERROR:", error);

    return NextResponse.json(
      { error: "Błąd generowania PDF" },
      { status: 500 },
    );
  }
}
