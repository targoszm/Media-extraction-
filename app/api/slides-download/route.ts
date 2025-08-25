import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { fileId, slides, format, fileName } = await request.json()

    console.log("[v0] Slides download request:", { fileId, format, slideCount: slides.length })

    if (format === "pdf") {
      const pdfContent = await generatePDFWithSlides(slides, fileName)

      return new NextResponse(pdfContent, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${fileName}_slides.pdf"`,
        },
      })
    } else {
      const zipContent = await generateZIPWithSlides(slides, fileName)

      return new NextResponse(zipContent, {
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition": `attachment; filename="${fileName}_slides.zip"`,
        },
      })
    }
  } catch (error) {
    console.error("[v0] Slides download error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Download failed",
      },
      { status: 500 },
    )
  }
}

async function generatePDFWithSlides(slides: any[], fileName: string): Promise<Buffer> {
  console.log("[v0] Generating PDF with embedded slide images (slideextract approach)")

  const pdfParts: Buffer[] = []

  // PDF Header
  pdfParts.push(Buffer.from("%PDF-1.4\n"))

  const objects: Buffer[] = []
  let objNum = 1

  // Catalog object (1)
  const catalog = Buffer.from(`1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
`)
  objects.push(catalog)
  objNum++

  // Pages object (2) - will be updated later with actual page references
  const pagesObjIndex = objects.length
  objects.push(Buffer.alloc(0)) // Placeholder
  objNum++

  const pageRefs: number[] = []
  const imageRefs: number[] = []

  // Process each slide
  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i]

    if (slide.imageUrl && slide.imageUrl.startsWith("data:image/")) {
      try {
        // Extract image data properly
        const [header, base64Data] = slide.imageUrl.split(",")
        const mimeType = header.split(";")[0].split(":")[1]
        const imageBuffer = Buffer.from(base64Data, "base64")

        // Create image XObject with proper binary handling
        const imageObjStart = Buffer.from(`${objNum} 0 obj
<<
/Type /XObject
/Subtype /Image
/Width 1280
/Height 720
/ColorSpace /DeviceRGB
/BitsPerComponent 8
/Filter /${mimeType === "image/png" ? "FlateDecode" : "DCTDecode"}
/Length ${imageBuffer.length}
>>
stream
`)
        const imageObjEnd = Buffer.from(`
endstream
endobj
`)

        const imageObj = Buffer.concat([imageObjStart, imageBuffer, imageObjEnd])
        objects.push(imageObj)
        imageRefs.push(objNum)
        objNum++

        // Create page content stream
        const contentStream = `q
612 0 0 792 0 0 cm
/Im${i + 1} Do
Q
`
        const contentObj = Buffer.from(`${objNum} 0 obj
<<
/Length ${contentStream.length}
>>
stream
${contentStream}
endstream
endobj
`)
        objects.push(contentObj)
        const contentRef = objNum
        objNum++

        // Create page object
        const pageObj = Buffer.from(`${objNum} 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Resources <<
  /XObject <<
    /Im${i + 1} ${imageRefs[i]} 0 R
  >>
>>
/Contents ${contentRef} 0 R
>>
endobj
`)
        objects.push(pageObj)
        pageRefs.push(objNum)
        objNum++

        console.log(`[v0] Embedded slide ${i + 1} image in PDF (${imageBuffer.length} bytes)`)
      } catch (error) {
        console.error(`[v0] Error processing slide ${i + 1} image:`, error)
      }
    }
  }

  // Update pages object with actual page references
  const pagesObj = Buffer.from(`2 0 obj
<<
/Type /Pages
/Kids [${pageRefs.map((ref) => `${ref} 0 R`).join(" ")}]
/Count ${pageRefs.length}
>>
endobj
`)
  objects[pagesObjIndex] = pagesObj

  // Build final PDF
  let currentOffset = 9 // Length of "%PDF-1.4\n"
  const xrefOffsets: number[] = [0] // First entry is always 0

  // Calculate offsets and build content
  const pdfContent: Buffer[] = [Buffer.from("%PDF-1.4\n")]

  for (const obj of objects) {
    xrefOffsets.push(currentOffset)
    pdfContent.push(obj)
    currentOffset += obj.length
  }

  // Build xref table
  const xrefStart = currentOffset
  let xrefTable = `xref\n0 ${xrefOffsets.length}\n`
  for (let i = 0; i < xrefOffsets.length; i++) {
    if (i === 0) {
      xrefTable += "0000000000 65535 f \n"
    } else {
      xrefTable += `${xrefOffsets[i].toString().padStart(10, "0")} 00000 n \n`
    }
  }

  // Add trailer
  xrefTable += `trailer
<<
/Size ${xrefOffsets.length}
/Root 1 0 R
>>
startxref
${xrefStart}
%%EOF
`

  pdfContent.push(Buffer.from(xrefTable))

  const finalPdf = Buffer.concat(pdfContent)
  console.log(`[v0] Generated PDF with ${pageRefs.length} slide images (${finalPdf.length} bytes total)`)
  return finalPdf
}

async function generateZIPWithSlides(slides: any[], fileName: string): Promise<Buffer> {
  // Create a simple ZIP file structure
  const files: { name: string; data: Buffer }[] = []

  // Process each slide
  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i]

    if (slide.imageUrl && slide.imageUrl.startsWith("data:image/")) {
      try {
        // Extract base64 data from data URL
        const base64Data = slide.imageUrl.split(",")[1]
        const imageBuffer = Buffer.from(base64Data, "base64")

        // Determine file extension from data URL
        const mimeType = slide.imageUrl.split(";")[0].split(":")[1]
        const extension = mimeType === "image/png" ? "png" : "jpg"

        files.push({
          name: `slide_${String(i + 1).padStart(2, "0")}_${Math.floor(slide.timestamp || 0)}s.${extension}`,
          data: imageBuffer,
        })
      } catch (error) {
        console.error(`[v0] Error processing slide ${i + 1}:`, error)
        // Create a placeholder file if image processing fails
        files.push({
          name: `slide_${String(i + 1).padStart(2, "0")}_error.txt`,
          data: Buffer.from(`Error processing slide ${i + 1} at ${slide.timestamp}s`, "utf-8"),
        })
      }
    } else {
      // Create a text file for slides without valid image data
      files.push({
        name: `slide_${String(i + 1).padStart(2, "0")}_${Math.floor(slide.timestamp || 0)}s.txt`,
        data: Buffer.from(
          `Slide ${i + 1}\nTimestamp: ${slide.timestamp}s\nTitle: ${slide.title || "Untitled"}`,
          "utf-8",
        ),
      })
    }
  }

  // Add a summary file
  const summaryContent = `Extracted Slides Summary
========================
Source: ${fileName}
Total Slides: ${slides.length}
Extraction Date: ${new Date().toISOString()}

Slide List:
${slides.map((slide, i) => `${i + 1}. ${slide.title || `Slide ${i + 1}`} (${Math.floor(slide.timestamp || 0)}s)`).join("\n")}
`

  files.push({
    name: "slides_summary.txt",
    data: Buffer.from(summaryContent, "utf-8"),
  })

  // Create simple ZIP structure (basic implementation)
  // For a production app, you'd want to use a proper ZIP library like 'jszip'
  const zipData = createSimpleZip(files)
  return zipData
}

function createSimpleZip(files: { name: string; data: Buffer }[]): Buffer {
  // This is a simplified ZIP implementation
  // In production, use a proper ZIP library like 'jszip' or 'archiver'

  const centralDirectory: Buffer[] = []
  const fileData: Buffer[] = []
  let offset = 0

  for (const file of files) {
    // Local file header
    const fileName = Buffer.from(file.name, "utf-8")
    const fileNameLength = fileName.length
    const fileSize = file.data.length

    const localHeader = Buffer.alloc(30 + fileNameLength)
    localHeader.writeUInt32LE(0x04034b50, 0) // Local file header signature
    localHeader.writeUInt16LE(20, 4) // Version needed to extract
    localHeader.writeUInt16LE(0, 6) // General purpose bit flag
    localHeader.writeUInt16LE(0, 8) // Compression method (stored)
    localHeader.writeUInt16LE(0, 10) // Last mod file time
    localHeader.writeUInt16LE(0, 12) // Last mod file date
    localHeader.writeUInt32LE(0, 14) // CRC-32 (simplified, using 0)
    localHeader.writeUInt32LE(fileSize, 18) // Compressed size
    localHeader.writeUInt32LE(fileSize, 22) // Uncompressed size
    localHeader.writeUInt16LE(fileNameLength, 26) // File name length
    localHeader.writeUInt16LE(0, 28) // Extra field length
    fileName.copy(localHeader, 30)

    fileData.push(localHeader)
    fileData.push(file.data)

    // Central directory entry
    const centralEntry = Buffer.alloc(46 + fileNameLength)
    centralEntry.writeUInt32LE(0x02014b50, 0) // Central file header signature
    centralEntry.writeUInt16LE(20, 4) // Version made by
    centralEntry.writeUInt16LE(20, 6) // Version needed to extract
    centralEntry.writeUInt16LE(0, 8) // General purpose bit flag
    centralEntry.writeUInt16LE(0, 10) // Compression method
    centralEntry.writeUInt16LE(0, 12) // Last mod file time
    centralEntry.writeUInt16LE(0, 14) // Last mod file date
    centralEntry.writeUInt32LE(0, 16) // CRC-32
    centralEntry.writeUInt32LE(fileSize, 20) // Compressed size
    centralEntry.writeUInt32LE(fileSize, 24) // Uncompressed size
    centralEntry.writeUInt16LE(fileNameLength, 28) // File name length
    centralEntry.writeUInt16LE(0, 30) // Extra field length
    centralEntry.writeUInt16LE(0, 32) // File comment length
    centralEntry.writeUInt16LE(0, 34) // Disk number start
    centralEntry.writeUInt16LE(0, 36) // Internal file attributes
    centralEntry.writeUInt32LE(0, 38) // External file attributes
    centralEntry.writeUInt32LE(offset, 42) // Relative offset of local header
    fileName.copy(centralEntry, 46)

    centralDirectory.push(centralEntry)
    offset += localHeader.length + file.data.length
  }

  // End of central directory record
  const centralDirSize = centralDirectory.reduce((sum, entry) => sum + entry.length, 0)
  const endRecord = Buffer.alloc(22)
  endRecord.writeUInt32LE(0x06054b50, 0) // End of central dir signature
  endRecord.writeUInt16LE(0, 4) // Number of this disk
  endRecord.writeUInt16LE(0, 6) // Number of disk with start of central directory
  endRecord.writeUInt16LE(files.length, 8) // Total number of entries on this disk
  endRecord.writeUInt16LE(files.length, 10) // Total number of entries
  endRecord.writeUInt32LE(centralDirSize, 12) // Size of central directory
  endRecord.writeUInt32LE(offset, 16) // Offset of start of central directory
  endRecord.writeUInt16LE(0, 20) // ZIP file comment length

  return Buffer.concat([...fileData, ...centralDirectory, endRecord])
}
