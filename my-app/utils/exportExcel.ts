import * as XLSX from "xlsx";

export const exportToExcel = (data: any[], filename: string, title?: string) => {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet([]);

  let currentRow = 0;
  const numCols = Object.keys(data[0] || {}).length;
  const startCol = 2; // Bắt đầu từ cột C (index 2)

  // ========== HEADER CÔNG TY ==========
  // Tên công ty
  XLSX.utils.sheet_add_aoa(worksheet, [["HỆ THỐNG GIỚI THIỆU NGƯỜI GIÚP VIỆC ĐÀ NẴNG"]], { origin: `C${currentRow + 1}` });
  worksheet["!merges"] = worksheet["!merges"] || [];
  worksheet["!merges"].push({ s: { r: currentRow, c: startCol }, e: { r: currentRow, c: startCol + numCols - 1 } });
  
  const companyCell = worksheet[XLSX.utils.encode_cell({ r: currentRow, c: startCol })];
  if (companyCell) {
    companyCell.s = {
      font: { bold: true, sz: 14, color: { rgb: "1E40AF" } },
      alignment: { horizontal: "center", vertical: "center" }
    };
  }
  currentRow++;

  // Địa chỉ công ty
  XLSX.utils.sheet_add_aoa(worksheet, [["Địa chỉ: Đà Nẵng, Việt Nam | Hotline: 1900-xxxx"]], { origin: `C${currentRow + 1}` });
  worksheet["!merges"].push({ s: { r: currentRow, c: startCol }, e: { r: currentRow, c: startCol + numCols - 1 } });
  
  const addressCell = worksheet[XLSX.utils.encode_cell({ r: currentRow, c: startCol })];
  if (addressCell) {
    addressCell.s = {
      font: { sz: 10, color: { rgb: "6B7280" } },
      alignment: { horizontal: "center", vertical: "center" }
    };
  }
  currentRow += 2;

  // ========== TIÊU ĐỀ BÁO CÁO ==========
  if (title) {
    XLSX.utils.sheet_add_aoa(worksheet, [[title]], { origin: `C${currentRow + 1}` });
    worksheet["!merges"].push({ s: { r: currentRow, c: startCol }, e: { r: currentRow, c: startCol + numCols - 1 } });
    
    const titleCell = worksheet[XLSX.utils.encode_cell({ r: currentRow, c: startCol })];
    if (titleCell) {
      titleCell.s = {
        font: { bold: true, sz: 18, color: { rgb: "FFFFFF" } },
        alignment: { horizontal: "center", vertical: "center" },
        fill: { fgColor: { rgb: "1E40AF" } },
        border: {
          top: { style: "medium", color: { rgb: "1E40AF" } },
          bottom: { style: "medium", color: { rgb: "1E40AF" } },
          left: { style: "medium", color: { rgb: "1E40AF" } },
          right: { style: "medium", color: { rgb: "1E40AF" } }
        }
      };
    }
    currentRow += 2;
  }

  // ========== NGÀY XUẤT BÁO CÁO ==========
  const today = new Date().toLocaleDateString('vi-VN', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  XLSX.utils.sheet_add_aoa(worksheet, [[`Ngày xuất báo cáo: ${today}`]], { origin: `C${currentRow + 1}` });
  worksheet["!merges"].push({ s: { r: currentRow, c: startCol }, e: { r: currentRow, c: startCol + numCols - 1 } });
  const dateCell = worksheet[XLSX.utils.encode_cell({ r: currentRow, c: startCol })];
  if (dateCell) {
    dateCell.s = {
      font: { italic: true, sz: 10, color: { rgb: "6B7280" } },
      alignment: { horizontal: "right", vertical: "center" }
    };
  }
  currentRow += 2;

  // ========== BẢNG DỮ LIỆU ==========
  const headers = Object.keys(data[0] || {});
  
  // Thêm headers từ cột B
  const headerRow = headers.map(h => h);
  XLSX.utils.sheet_add_aoa(worksheet, [headerRow], { origin: XLSX.utils.encode_cell({ r: currentRow, c: startCol }) });

  // Style cho header
  headers.forEach((_, colIndex) => {
    const cellAddress = XLSX.utils.encode_cell({ r: currentRow, c: startCol + colIndex });
    if (!worksheet[cellAddress]) worksheet[cellAddress] = { t: "s", v: "" };
    worksheet[cellAddress].s = {
      font: { bold: true, sz: 11, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "1E3A8A" } },
      alignment: { horizontal: "center", vertical: "center", wrapText: true },
      border: {
        top: { style: "medium", color: { rgb: "000000" } },
        bottom: { style: "medium", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } }
      }
    };
  });

  currentRow += 1;

  // Thêm data rows từ cột B
  const dataRows = data.map(row => headers.map(h => row[h]));
  XLSX.utils.sheet_add_aoa(worksheet, dataRows, { origin: XLSX.utils.encode_cell({ r: currentRow, c: startCol }) });

  // Style cho data rows
  dataRows.forEach((row, rowIndex) => {
    const actualRow = currentRow + rowIndex;
    const isTotalRow = String(row[0]).includes("TỔNG") || String(row[0]).includes("Tổng");

    headers.forEach((header, colIndex) => {
      const cellAddress = XLSX.utils.encode_cell({ r: actualRow, c: startCol + colIndex });
      if (!worksheet[cellAddress]) worksheet[cellAddress] = { t: "s", v: "" };

      const cellValue = row[colIndex];
      if (typeof cellValue === "number" && colIndex > 0) {
        worksheet[cellAddress].t = "n";
        worksheet[cellAddress].z = "#,##0";
      }

      worksheet[cellAddress].s = {
        font: { 
          bold: isTotalRow,
          sz: isTotalRow ? 11 : 10,
          color: { rgb: isTotalRow ? "1E40AF" : "1F2937" }
        },
        fill: { 
          fgColor: { 
            rgb: isTotalRow ? "DBEAFE" : (actualRow % 2 === 0 ? "FFFFFF" : "F9FAFB") 
          } 
        },
        alignment: { 
          horizontal: "center",
          vertical: "center" 
        },
        border: {
          top: { style: "thin", color: { rgb: "D1D5DB" } },
          bottom: { style: isTotalRow ? "double" : "thin", color: { rgb: isTotalRow ? "1E40AF" : "D1D5DB" } },
          left: { style: "thin", color: { rgb: "D1D5DB" } },
          right: { style: "thin", color: { rgb: "D1D5DB" } }
        }
      };
    });
  });

  currentRow += dataRows.length + 2;

  // ========== FOOTER ==========
  XLSX.utils.sheet_add_aoa(worksheet, [["Người lập báo cáo: Administrator"]], { origin: `C${currentRow + 1}` });
  const footerCell1 = worksheet[XLSX.utils.encode_cell({ r: currentRow, c: startCol })];
  if (footerCell1) {
    footerCell1.s = {
      font: { italic: true, sz: 9, color: { rgb: "6B7280" } },
      alignment: { horizontal: "left", vertical: "center" }
    };
  }

  currentRow++;
  XLSX.utils.sheet_add_aoa(worksheet, [[`Hệ thống tự động tạo lúc: ${new Date().toLocaleString('vi-VN')}`]], { origin: `C${currentRow + 1}` });
  const footerCell2 = worksheet[XLSX.utils.encode_cell({ r: currentRow, c: startCol })];
  if (footerCell2) {
    footerCell2.s = {
      font: { italic: true, sz: 9, color: { rgb: "9CA3AF" } },
      alignment: { horizontal: "left", vertical: "center" }
    };
  }

  // ========== ĐỊNH DẠNG CỘT VÀ DÒNG ==========
  const colWidths: any[] = [];
  colWidths[0] = { wch: 3 }; // Cột A để trống
  colWidths[1] = { wch: 3 }; // Cột B để trống
  
  headers.forEach((header, colIndex) => {
    const headerLength = header.length;
    const maxDataLength = Math.max(
      ...dataRows.map(row => String(row[colIndex] || "").length)
    );
    colWidths[startCol + colIndex] = { wch: Math.max(headerLength, maxDataLength, 15) + 4 };
  });
  
  worksheet["!cols"] = colWidths;

  const rowHeights: any[] = [];
  rowHeights[0] = { hpt: 25 }; // Tên công ty
  rowHeights[1] = { hpt: 18 }; // Địa chỉ
  rowHeights[2] = { hpt: 8 };  // Dòng trống
  if (title) {
    rowHeights[3] = { hpt: 45 }; // Tiêu đề
    rowHeights[4] = { hpt: 8 };  // Dòng trống
    rowHeights[5] = { hpt: 20 }; // Ngày xuất
    rowHeights[6] = { hpt: 8 };  // Dòng trống
    rowHeights[7] = { hpt: 35 }; // Header
  }
  
  const dataStartRow = title ? 8 : 4;
  dataRows.forEach((row, rowIndex) => {
    const isTotalRow = String(row[0]).includes("TỔNG") || String(row[0]).includes("Tổng");
    rowHeights[dataStartRow + rowIndex] = { hpt: isTotalRow ? 35 : 25 };
  });
  
  worksheet["!rows"] = rowHeights;

  XLSX.utils.book_append_sheet(workbook, worksheet, "Báo cáo");

  XLSX.writeFile(
    workbook,
    `${filename}_${new Date().toISOString().split("T")[0]}.xlsx`,
  );
};
