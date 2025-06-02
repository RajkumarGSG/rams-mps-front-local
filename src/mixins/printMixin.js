export default {
  methods: {
    printReport(reportHeader, tableHeaders = '', tableRows = '', styles = '') {
      const style = styles || `<style>
      body { font-family: Arial, sans-serif; }
      table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 11px; }
      th, td { border: 1px solid black; padding: 5px; overflow: visible; white-space: normal; word-wrap: break-word; }
      .numCell { text-align: right; padding-right: 5px; }
      .text_rotate { rotate: -90deg; white-space: pre; width: 50px; text-align: center; padding: 0px; }
    </style>`

      const html = `<!DOCTYPE html>
<html>
  <head>${style}</head>
  <body>${reportHeader}
    <table>
      <thead>${tableHeaders}</thead>
      <tbody>${tableRows}</tbody>
    </table>
  </body>
</html>`

      const PrintWin = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');
      PrintWin.document.write(html)
      PrintWin.document.close();
      PrintWin.focus();
      PrintWin.print();
      PrintWin.close();
    },

    generateWorkSheetHeader(worksheet, subtitle, approvedHeader = false) {
      // Calculate last column name/index
      const lastColumn = this.getColumnCode(this.getWorksheetColumns.length - 1)
      let rowNumber = 1;

      // If there is header with approvals - add it first
      if (approvedHeader) {
        const newColumns = Array(7).fill('')
        this.getApprovedHeader.forEach((row) => {
          let newRow = worksheet.insertRow(rowNumber, row.toSpliced(2, 0, ...newColumns));
          newRow.font = { bold: true, size: 12 };
          newRow.alignment = this.rowAlignmentWrapped;
          if (rowNumber === 2) newRow.height = 60;  // lineCount * 20
          worksheet.mergeCells(`A${rowNumber}:B${rowNumber}`);
          worksheet.mergeCells(`J${rowNumber}:${lastColumn}${rowNumber}`);
          rowNumber++;
        });
      }

      // Main header
      let titleRow = worksheet.insertRow(rowNumber, [this.$t('reports.reports_title')]);
      titleRow.font = { bold: true, size: 16 };
      titleRow.alignment = this.rowAlignment;
      worksheet.mergeCells(`A${rowNumber}:${lastColumn}${rowNumber}`);
      rowNumber++;

      // Subheaders
      titleRow = worksheet.insertRow(rowNumber, [subtitle]);
      titleRow.font = { size: 14 };
      titleRow.alignment = this.rowAlignment;
      worksheet.mergeCells(`A${rowNumber}:${lastColumn}${rowNumber}`);
      rowNumber++;

      // additional sub headers
      if (this.headerTitles && this.headerTitles.length > 0) {
        titleRow = worksheet.insertRow(rowNumber, [Array.isArray(this.headerTitles) ? this.headerTitles.join(', ') : this.headerTitles]);
        titleRow.font = { size: 14 };
        titleRow.alignment = this.rowAlignment;
        worksheet.mergeCells(`A${rowNumber}:${lastColumn}${rowNumber}`);
      }
    },

    formatHeaderRow(worksheet, rowNo)     {
      // Применение форматирования для строк заголовка
        const headerRow = worksheet.getRow(rowNo);
        headerRow.eachCell({ includeEmpty: true }, (cell) => {
          cell.fill = this.headerCellFill;
        });
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.alignment = this.rowAlignment;
      },

    insertAdditionalHeader(worksheet, key, label, rowNo, count) {
      // Вставка дополнительного заголовка
      const columnBefore = this.getWorksheetColumns.findIndex(item => item.key === key)
      const columnsAfter = this.getWorksheetColumns.length - columnBefore - count

      const newColumns = Array(columnBefore).fill('').concat([label], Array(columnsAfter + 1).fill(''));
      worksheet.insertRow(rowNo, newColumns);

      // Объединение ячеек для "coating_type"
      const column1Code = this.getColumnCode(columnBefore)
      const column2Code = this.getColumnCode(columnBefore + count - 1)
      worksheet.mergeCells(`${column1Code}${rowNo}:${column2Code}${rowNo}`);

      this.formatHeaderRow(worksheet, rowNo)
    },

    generateWorkSheet(workbook, workbookName, subtitle, reportData, totalData = null, colSpan = null, extraHeader = false) {
      const worksheet = workbook.addWorksheet(workbookName);

      // Установка заголовков таблицы
      const columns = this.getWorksheetColumns;
      worksheet.columns = columns;

      // Применение числового форматирования к колонкам
      const zerosAfterPoint = (digits) => `#,##0${digits ? '.' : ''}${'0'.repeat(digits)}`;
      columns.forEach(item => {
        if (item.num) {
          worksheet.getColumn(item.key).numFmt = zerosAfterPoint(item.digits);
        }
      });

      // Заполнение данными
      reportData.forEach(item => {
        worksheet.addRow(item);
      });

      // Добавление итоговой строки, если есть
      if (totalData !== null) {
        const emptyCells = colSpan ? Array(colSpan - 1).fill('') : [];
        const totalRow = worksheet.addRow([
          this.$t('label.total'),
          ...emptyCells,
          ...Object.values(totalData) //.map(numFormat)
        ]);
        totalRow.font = { bold: true, size: 12 };
      }

      this.formatHeaderRow(worksheet, 1)

      this.generateWorkSheetHeader(worksheet, subtitle, extraHeader);
      return worksheet;
    },

    getColumnCode(columnNo) {
      return String.fromCharCode('A'.charCodeAt(0) + columnNo)
    },
  },

  computed: {
    getTableHeaders() {
      const columns = this.getWorksheetColumns.map(col => `<th>${col.header}</th>`).join('')
      return `<tr>${columns}</tr>`
    },

    rowAlignment() {
      return { vertical: 'middle', horizontal: 'center' };
    },

    rowAlignmentWrapped() {
      return { vertical: 'middle', horizontal: 'center', wrapText: true };
    },

    headerCellFill() {
      return { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0070C0' } }; // Blue
    },

    getApprovedHeader() {
      const placeholders = "_______________";
      const datePlaceholder = `"_____"_________________ 202${new Date().toLocaleDateString().slice(-1)}`;

      return [
        [this.$t('reports.agreed'), '', this.$t('reports.approve')],
        [this.$t('reports.deputy_minister'), '', this.$t('reports.minister')],
        [placeholders, '', placeholders],
        [datePlaceholder, '', datePlaceholder]
      ];
    },
  }
}
