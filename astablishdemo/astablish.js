/**
 * @license
 * Author: pQCee
 * Description : AStablish implementation in Office Add-ins for Excel
 *
 * Copyright pQCee 2023. All rights reserved
 *
 * “Commons Clause” License Condition v1.0
 *
 * The Software is provided to you by the Licensor under the License, as defined
 * below, subject to the following condition.
 *
 * Without limiting other conditions in the License, the grant of rights under
 * the License will not include, and the License does not grant to you, the
 * right to Sell the Software.
 *
 * For purposes of the foregoing, “Sell” means practicing any or all of the
 * rights granted to you under the License to provide to third parties, for a
 * fee or other consideration (including without limitation fees for hosting or
 * consulting/ support services related to the Software), a product or service
 * whose value derives, entirely or substantially, from the functionality of the
 * Software. Any license notice or attribution required by the License must also
 * include this Commons Clause License Condition notice.
 *
 * Software: AStablish Office Add-in
 *
 * License: MIT License
 *
 * Licensor: pQCee Pte Ltd
 */

// =======================================
// REGISTER EVENTS FOR HTML GUI COMPONENTS
// =======================================

Office.onReady((info) => {
  // Check that we loaded into Excel
  if (info.host === Office.HostType.Excel) {
    document.getElementById("btnCreateTable").onclick = createTable;
    document.getElementById("btnValidateWalletAddress").onclick = validateAddr;
    document.getElementById("btnCreateSigningMessage").onclick = createMessage;
    document.getElementById("btnLoadSimulatedData").onclick = loadSimData;
  }
});

// =================================
// GLOBAL - ASTABLISH BUNDLE EXPORTS
// =================================
const Buffer = astablishBundle.Buffer;
const ECPairFactory = astablishBundle.ECPair.ECPairFactory;
const bitcoinjs = astablishBundle.bitcoinjs;
const secp256k1 = astablishBundle.secp256k1;

// ==========================================
// GLOBAL - AUDIT TEMPLATE WORKSHEET SETTINGS
// ==========================================

/** Grey colour for cell shading */
const GREY = "#A5A5A5";

/** Bright yellow colour for cell shading */
const YELLOW = "#FFFF00";

/** Left-most column of the audit worksheet template */
const WS_LEFT_COLUMN = "A";

/** Top row of the audit worksheet template */
const WS_TOP_ROW = 1;

/** Top-left cell of the audit worksheet template (A1) */
const WS_START_CELL = "".concat(WS_LEFT_COLUMN, WS_TOP_ROW);

/** Right-most column of the audit worksheet template */
const WS_RIGHT_COLUMN = "H";

/** Content for Instructions Table */
const INSTRUCTIONS = [
  ["Instructions:"],
  ["1. Auditor fills up Message Params and send workbook to client."],
  ["2. Client choose BTC/ETH in Crypto column."],
  ["3. Client fills up Wallet Address & Public Key."],
  ["4. Client sign Message and fills up Digital Signature."],
  ["5. Client sends workbook back to Auditor."],
  ["6. Auditor clicks Validate button to verify wallet ownership."],
];

/** Top-left cell of Instructions Table */
const I_TABLE_START_CELL = WS_START_CELL;

/** Bottom-right cell of Instructions Table */
const I_TABLE_END_CELL = "".concat(WS_LEFT_COLUMN, INSTRUCTIONS.length);

/** Cell range of Instructions Table */
const I_TABLE_RANGE = "".concat(I_TABLE_START_CELL, ":", I_TABLE_END_CELL);

/** Right column of MESSAGE PARAMS Table */
const P_TABLE_RIGHT_COLUMN = WS_RIGHT_COLUMN;

/** Zero-index value for right column of MESSAGE PARAMS Table */
const P_TABLE_RIGHT_CNUM = convertColToInt(P_TABLE_RIGHT_COLUMN) - 1;

/** Zero-index value for left column of MESSAGE PARAMS Table */
const P_TABLE_LEFT_CNUM = P_TABLE_RIGHT_CNUM - 1;

/** Left column of MESSAGE PARAMS Table */
const P_TABLE_LEFT_COLUMN = convertIntToCol(P_TABLE_LEFT_CNUM + 1);

/** Top-row of MESSAGE PARAMS Table */
const P_TABLE_TOP_ROW = WS_TOP_ROW + 1;

/** Row number of Sequence Number in MESSAGE PARAMS Table */
const P_TABLE_SEQNUM_ROW = P_TABLE_TOP_ROW + 1;

/** Cell range of Sequence Number in MESSAGE PARAMS Table */
const P_TABLE_SEQNUM_CELL = "".concat(P_TABLE_RIGHT_COLUMN, P_TABLE_SEQNUM_ROW);

/** Row number of Client Name in MESSAGE PARAMS Table */
const P_TABLE_CLIENT_ROW = P_TABLE_SEQNUM_ROW + 1;

/** Cell range of Client Name in MESSAGE PARAMS Table */
const P_TABLE_CLIENT_CELL = "".concat(P_TABLE_RIGHT_COLUMN, P_TABLE_CLIENT_ROW);

/** Row number of Audit Date in MESSAGE PARAMS Table */
const P_TABLE_DATE_ROW = P_TABLE_CLIENT_ROW + 1;

/** Cell range of Audit Date in MESSAGE PARAMS Table */
const P_TABLE_DATE_CELL = "".concat(P_TABLE_RIGHT_COLUMN, P_TABLE_DATE_ROW);

/** Number of spacer rows from top of worksheet to start of Main Table.
 *  It is computed from adding one empty row after the Instructions Table.
 */
const M_TABLE_SPACER_ROWS = INSTRUCTIONS.length + 1;

/** Default minimum number of data rows in Main Table */
const M_TABLE_DEFAULT_DATA_ROWS = 10;

/** Top row (header row) of Main Table */
const M_TABLE_TOP_ROW = WS_TOP_ROW + M_TABLE_SPACER_ROWS;

/** 2nd row (first row of data) of Main Table */
const M_TABLE_2ND_ROW = M_TABLE_TOP_ROW + 1;

/** Left-most column of Main Table*/
const M_TABLE_LEFT_COLUMN = WS_LEFT_COLUMN;

/** Top-left cell of Main Table */
const M_TABLE_START_CELL = "".concat(M_TABLE_LEFT_COLUMN, M_TABLE_TOP_ROW);

/** Right-most column of Main Table */
const M_TABLE_RIGHT_COLUMN = WS_RIGHT_COLUMN;

/** Zero-indexed value for Crypto column of Main Table */
// const M_TABLE_CRYPTO_COL = convertColToInt(M_TABLE_LEFT_COLUMN) + 1 - 1;

/** Zero-indexed value for Wallet Address column of Main Table */
const M_TABLE_ADDR_CNUM = convertColToInt(M_TABLE_LEFT_COLUMN) + 2 - 1;

/** Wallet Address column of Main Table */
const M_TABLE_ADDR_COLUMN = convertIntToCol(M_TABLE_ADDR_CNUM + 1);

/** Zero-indexed value for Public Key column of Main Table */
const M_TABLE_PUBKEY_CNUM = convertColToInt(M_TABLE_LEFT_COLUMN) + 3 - 1;

/** Public Key column of Main Table */
const M_TABLE_PUBKEY_COLUMN = convertIntToCol(M_TABLE_PUBKEY_CNUM + 1);

/** Zero-indexed value for Message column of Main Table */
const M_TABLE_MSG_CNUM = convertColToInt(M_TABLE_LEFT_COLUMN) + 4 - 1;

/** Message column of Main Table */
const M_TABLE_MSG_COLUMN = convertIntToCol(M_TABLE_MSG_CNUM + 1);

/** Zero-indexed value for Digital Signature column of Main Table */
//const M_TABLE_SIG_COL = convertColToInt(M_TABLE_LEFT_COLUMN) + 5 - 1;

/** Zero-indexed value for Valid Wallet Address column of Main Table */
const M_TABLE_VAL_WALLET_CNUM = convertColToInt(M_TABLE_LEFT_COLUMN) + 6 - 1;

/** Valid Wallet Address column of Main Table */
const M_TABLE_VWALLET_COLUMN = convertIntToCol(M_TABLE_VAL_WALLET_CNUM + 1);

/** Default minimum number of rows in Comments Table */
const C_TABLE_DEFAULT_ROWS = 10;

/** Number of spacer rows from bottom of Main Table to start of Comments Table.
 *  It is computed from adding two empty rows after the Main Table.
 */
const C_TABLE_SPACER_ROWS = 2;

// ===========================
// GLOBAL - INTERNAL CONSTANTS
// ===========================

/** Regular Expression string to validate hexadecimal strings */
const regexHex = new RegExp("^[0-9a-fA-F]+$");

/** Regular Expression string to validate base58 strings */
const regexBase58 = new RegExp("^[1-9A-HJ-NP-Za-km-z]+$");

// =============
// BUTTON EVENTS
// =============

function createTable() {
  Excel.run((context) => {
    let selectedSheet = context.workbook.worksheets.getActiveWorksheet();
    let intDataRows = M_TABLE_DEFAULT_DATA_ROWS; // Placeholder for user input
    const DATA_ROWS = Math.max(intDataRows, M_TABLE_DEFAULT_DATA_ROWS);
    setupAuditTableTemplate(selectedSheet, DATA_ROWS);
    return context.sync();
  });
}

function validateAddr() {
  Excel.run((context) => {
    let selectedSheet = context.workbook.worksheets.getActiveWorksheet();

    // Derive cell range of data section in Main Table
    const DATA_START_CELL = "".concat(M_TABLE_LEFT_COLUMN, M_TABLE_2ND_ROW);
    let intDataRows = M_TABLE_DEFAULT_DATA_ROWS; // Placeholder for user input
    const DATA_ROWS = Math.max(intDataRows, M_TABLE_DEFAULT_DATA_ROWS);
    const BOTTOM_ROW = M_TABLE_2ND_ROW + DATA_ROWS - 1;
    const DATA_END_CELL = "".concat(M_TABLE_RIGHT_COLUMN, BOTTOM_ROW);
    const DATA_RANGE = "".concat(DATA_START_CELL, ":", DATA_END_CELL);

    // Derive cell range of Valid Wallet Address Column
    const VW_START_CELL = "".concat(M_TABLE_VWALLET_COLUMN, M_TABLE_2ND_ROW);
    const VW_END_CELL = "".concat(M_TABLE_VWALLET_COLUMN, BOTTOM_ROW);
    const VW_RANGE = "".concat(VW_START_CELL, ":", VW_END_CELL);

    // Erase Valid Wallet Address Column first in one batch call to Office JS.
    // Rationale is to erase validation column in case subsequent validation
    // logic crashes w/o any feedback of crash to user.
    let vwDataRange = selectedSheet.getRange(VW_RANGE);
    vwDataRange.clear("Contents");
    return context.sync().then(() => {
      // Load data portion of Main Table to proxy object in Office JS
      let objDataRange = selectedSheet.getRange(DATA_RANGE);
      objDataRange.load("values");
      return context.sync().then(() => {
        validateWalletAddress(objDataRange);
        return context.sync();
      });
    });
  });
}

function createMessage() {
  Excel.run((context) => {
    let selectedSheet = context.workbook.worksheets.getActiveWorksheet();
    let intDataRows = M_TABLE_DEFAULT_DATA_ROWS; // Placeholder for user input
    const DATA_ROWS = Math.max(intDataRows, M_TABLE_DEFAULT_DATA_ROWS);

    // Derive cell range of message parameters
    const PARAMS_RANGE = "".concat(P_TABLE_SEQNUM_CELL, ":", P_TABLE_DATE_CELL);
    let paramsDataRange = selectedSheet.getRange(PARAMS_RANGE);
    paramsDataRange.load("values");
    return context.sync().then(() => {
      // Retrieve message parameters from worksheet
      let paramsData = paramsDataRange.values.map((arr) => arr.slice());
      let seqNumSrc = paramsData[P_TABLE_SEQNUM_ROW - P_TABLE_SEQNUM_ROW][0];
      let clientSrc = paramsData[P_TABLE_CLIENT_ROW - P_TABLE_SEQNUM_ROW][0];
      let dateSrc = paramsData[P_TABLE_DATE_ROW - P_TABLE_SEQNUM_ROW][0];

      // Build require message for signing
      let msg = "".concat(
        "[",
        seqNumSrc,
        "]",
        " ",
        clientSrc,
        " owns wallet on ",
        dateSrc,
        ".",
      );

      // Update message back into MAIN TABLE
      const MSG_START_CELL = "".concat(M_TABLE_MSG_COLUMN, M_TABLE_2ND_ROW);
      const BOTTOM_ROW = M_TABLE_2ND_ROW + DATA_ROWS - 1;
      const MSG_END_CELL = "".concat(M_TABLE_MSG_COLUMN, BOTTOM_ROW);
      const MSG_RANGE = "".concat(MSG_START_CELL, ":", MSG_END_CELL);
      let msgDataRange = selectedSheet.getRange(MSG_RANGE);
      let msgSrc = new Array(DATA_ROWS);
      for (let row = 0; row < DATA_ROWS; row++) {
        msgSrc[row] = [msg];
      }
      msgDataRange.values = msgSrc;
      return context.sync();
    });
  });
}

/**
 * Generate and load simulated data into empty Audit Table for demo purpose.
 */
function loadSimData() {
  Excel.run((context) => {
    let selectedSheet = context.workbook.worksheets.getActiveWorksheet();
    let intDataRows = M_TABLE_DEFAULT_DATA_ROWS; // Placeholder for user input
    const DATA_ROWS = Math.max(intDataRows, M_TABLE_DEFAULT_DATA_ROWS);
    generateSimulatedData(selectedSheet, DATA_ROWS);
    return context.sync();
  });
}

// ================
// HELPER FUNCTIONS
// ================
/**
 * Convert Excel column alphabet to column number.
 *
 * @param {string} charColAlpha - Single character containing column alphabet.
 * @returns {number} Number equivalent of column alphabet, where A = 1, B = 2, etc.
 */
function convertColToInt(charColAlpha) {
  // This function does not receive arbitrary input from user.
  // Safe to assume the developer for this code will not pass in:
  // - zero-length string
  // - non-alphabet character
  // - double-alphabet string
  const ASCII_UPPER_CASE_A = "A".charCodeAt(0);
  return charColAlpha.toUpperCase().charCodeAt(0) - ASCII_UPPER_CASE_A + 1;
}

/**
 * Convert column number to Excel column alphabet.
 *
 * @param {number} intColNumber - Integer value of column number.
 * @returns {string} Character equivalent of column number, where 1 = A, 2 = B, etc.
 */
function convertIntToCol(intColNumber) {
  // This function does not receive arbitrary input from user.
  // Similar to convertColToInt(), safe to assume developer does not pass in invalid values.
  const ASCII_UPPER_CASE_A = "A".charCodeAt(0);
  return String.fromCharCode(intColNumber + ASCII_UPPER_CASE_A - 1);
}

/**
 * Set up the worksheet table layout for entering audit data.
 *
 * @param {Excel.Worksheet} objWS - Target worksheet to process.
 * @param {number} intDataRows - Number of rows of audit data to be filled in Main Table.
 */
function setupAuditTableTemplate(objWS, intDataRows) {
  /**
   * Converts value for Excel row height or column width from pixel to font
   * point. The conversion is achieved by using an approximation, where font
   * point = pixel * 0.75.
   *
   * @inner
   * @param {number} intPixelSize - Value for Excel row height or column width in pixels.
   * @returns {number} Equivalent width (floating point) value in Excel font points.
   */
  function pixelToPoint(intPixelSize) {
    return intPixelSize * 0.75;
  }

  /**
   * Apply continuous border lines to all sides of target cells.
   *
   * @inner
   * @param {Excel.Range} objRange - Range object containing target cells.
   */
  function addBorderLines(objRange) {
    const objRangeBorderCollection = objRange.format.borders;
    const STR_LINE = "Continuous";

    // Apply continuous lines to all sides of target cells
    objRangeBorderCollection.getItem("EdgeTop").style = STR_LINE;
    objRangeBorderCollection.getItem("EdgeRight").style = STR_LINE;
    objRangeBorderCollection.getItem("EdgeLeft").style = STR_LINE;
    objRangeBorderCollection.getItem("EdgeBottom").style = STR_LINE;
    objRangeBorderCollection.getItem("InsideHorizontal").style = STR_LINE;
    objRangeBorderCollection.getItem("InsideVertical").style = STR_LINE;
  }

  /**
   * Returns today's date in dd-Mmm-yyyy format.
   *
   * @inner
   * @returns {string} Today's date. E.g., "20-Jan-2023".
   */
  function todayDate() {
    const MONTHS = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    let today = new Date();
    let dd = today.getDate().toString().padStart(2, "0");
    let Mmm = MONTHS[today.getMonth()];
    let yyyy = today.getFullYear();

    return "".concat(dd, "-", Mmm, "-", yyyy);
  }

  //
  // Calculate cell range of Main Table
  //

  /** Number of data rows in Main Table, has a minimum of 10 or more rows */
  const M_TABLE_DATA_ROWS = Math.max(intDataRows, M_TABLE_DEFAULT_DATA_ROWS);

  /** Bottom row of Main Table */
  const M_TABLE_BOTTOM_ROW = M_TABLE_TOP_ROW + M_TABLE_DATA_ROWS;

  /** Bottom-right cell of Main table */
  const M_TABLE_END_CELL = "".concat(M_TABLE_RIGHT_COLUMN, M_TABLE_BOTTOM_ROW);

  /** String containing cell range of Main Table */
  const M_TABLE_RANGE = "".concat(M_TABLE_START_CELL, ":", M_TABLE_END_CELL);

  //
  // Populate Instructions Table
  //
  objWS.getRange(I_TABLE_RANGE).values = INSTRUCTIONS;

  // =============================
  // MAIN TABLE BELOW INSTRUCTIONS
  // =============================
  // MAIN TABLE: HEADER
  const M_TABLE_HEADER = [
    [
      "No.",
      "Crypto",
      "Wallet Address",
      "Public Key",
      "Message",
      "Digital Signature",
      "Valid Wallet",
      "Verified",
    ],
  ];
  const M_TABLE_START_HDR = M_TABLE_START_CELL;
  const M_TABLE_END_HDR = "".concat(M_TABLE_RIGHT_COLUMN, M_TABLE_TOP_ROW);
  const M_TABLE_HDR_RANGE = "".concat(M_TABLE_START_HDR, ":", M_TABLE_END_HDR);
  objWS.getRange(M_TABLE_HDR_RANGE).values = M_TABLE_HEADER;
  objWS.getRange(M_TABLE_HDR_RANGE).format.font.bold = true;
  const M_TABLE_HDR_COLOURS = [
    GREY,
    YELLOW,
    YELLOW,
    YELLOW,
    GREY,
    YELLOW,
    GREY,
    GREY,
  ];

  for (
    let col = convertColToInt(M_TABLE_LEFT_COLUMN), row = M_TABLE_TOP_ROW;
    col <= convertColToInt(M_TABLE_RIGHT_COLUMN);
    col++
  ) {
    objWS.getRange("".concat(convertIntToCol(col), row)).format.fill.color =
      M_TABLE_HDR_COLOURS[col - 1];
  }

  // MAIN TABLE
  addBorderLines(objWS.getRange(M_TABLE_RANGE));
  objWS.getRange(M_TABLE_RANGE).format.horizontalAlignment = "Center";
  objWS.getRange(M_TABLE_RANGE).numberFormat = "0";

  // MAIN TABLE: DATA
  const M_TABLE_START_DAT = "".concat(M_TABLE_LEFT_COLUMN, M_TABLE_2ND_ROW);
  const M_TABLE_END_DAT = M_TABLE_END_CELL;
  const M_TABLE_DAT_RANGE = "".concat(M_TABLE_START_DAT, ":", M_TABLE_END_DAT);
  objWS.getRange(M_TABLE_DAT_RANGE).numberFormat = "@";

  // MAIN TABLE: DATA apply word-wrap from columns C to F
  const M_TABLE_START_WW = "".concat("C", M_TABLE_2ND_ROW);
  const M_TABLE_END_WW = "".concat("F", M_TABLE_BOTTOM_ROW);
  const M_TABLE_WW_RANGE = "".concat(M_TABLE_START_WW, ":", M_TABLE_END_WW);
  objWS.getRange(M_TABLE_WW_RANGE).format.wrapText = true;

  // MAIN TABLE: DATA left 2nd Column (Crypto)
  const M_TABLE_START_CC = "".concat("B", M_TABLE_2ND_ROW);
  const M_TABLE_END_CC = "".concat("B", M_TABLE_BOTTOM_ROW);
  const M_TABLE_CC_RANGE = "".concat(M_TABLE_START_CC, ":", M_TABLE_END_CC);
  objWS.getRange(M_TABLE_CC_RANGE).dataValidation.clear();
  objWS.getRange(M_TABLE_CC_RANGE).dataValidation.rule = {
    list: { inCellDropDown: true, source: "BTC,ETH" },
  };

  // MAIN TABLE: DATA 5th Column (Message)

  // MAIN TABLE: VALIDATION COLUMNS (Right 2 columns)
  const M_TABLE_START_VAL = "".concat("G", M_TABLE_2ND_ROW);
  const M_TABLE_END_VAL = M_TABLE_END_CELL;
  const M_TABLE_VAL_RANGE = "".concat(M_TABLE_START_VAL, ":", M_TABLE_END_VAL);
  objWS.getRange(M_TABLE_VAL_RANGE).conditionalFormats.clearAll();
  const trueConditionalFormat = objWS
    .getRange(M_TABLE_VAL_RANGE)
    .conditionalFormats.add(Excel.ConditionalFormatType.containsText);
  trueConditionalFormat.textComparison.format.font.color = "#006100";
  trueConditionalFormat.textComparison.format.fill.color = "#C6EFCE";
  trueConditionalFormat.textComparison.rule = {
    operator: Excel.ConditionalTextOperator.contains,
    text: "TRUE",
  };
  const falseConditionalFormat = objWS
    .getRange(M_TABLE_VAL_RANGE)
    .conditionalFormats.add(Excel.ConditionalFormatType.containsText);
  falseConditionalFormat.textComparison.format.font.color = "#9C0006";
  falseConditionalFormat.textComparison.format.fill.color = "#FFC7CE";
  falseConditionalFormat.textComparison.rule = {
    operator: Excel.ConditionalTextOperator.contains,
    text: "FALSE",
  };

  // MAIN TABLE: Fill index column
  for (let i = 1; i <= intDataRows; i++) {
    let cell = "".concat(M_TABLE_LEFT_COLUMN, M_TABLE_TOP_ROW + i);
    objWS.getRange(cell).values = [[i.toString()]];
  }

  // ==============================================
  // MESSAGE PARAMS TABLE AT TOP-RIGHT OF WORKSHEET
  // ==============================================
  const P_TABLE_START_HDR = "".concat(P_TABLE_LEFT_COLUMN, P_TABLE_TOP_ROW);
  const P_TABLE_END_HDR = "".concat(P_TABLE_RIGHT_COLUMN, P_TABLE_TOP_ROW);
  const P_TABLE_HDR_RANGE = "".concat(P_TABLE_START_HDR, ":", P_TABLE_END_HDR);
  objWS.getRange(P_TABLE_START_HDR).values = [["Message Params"]];
  objWS.getRange(P_TABLE_HDR_RANGE).merge(false);
  objWS.getRange(P_TABLE_HDR_RANGE).format.fill.color = YELLOW;
  objWS.getRange(P_TABLE_HDR_RANGE).format.font.bold = true;
  objWS.getRange(P_TABLE_HDR_RANGE).format.horizontalAlignment = "Center";
  const MSG_PARAMS = [["Seq. No."], ["Client Name"], ["Audit Date"]];
  objWS.getRange("G3:G5").values = MSG_PARAMS;
  objWS.getRange(P_TABLE_SEQNUM_CELL).values = [
    [Math.floor(Math.random() * 9000) + 1000],
  ];
  objWS.getRange(P_TABLE_CLIENT_CELL).values = [["Company A"]];
  objWS.getRange(P_TABLE_DATE_CELL).values = [[todayDate()]];
  addBorderLines(objWS.getRange("G2:H5"));
  objWS.getRange("H3:H5").numberFormat = "@";

  // =====================================
  // AUDIT COMMENTS TABLE BELOW MAIN TABLE
  // =====================================
  // AUDIT COMMENTS TABLE: HEADER
  const C_TABLE_TOP_ROW = M_TABLE_BOTTOM_ROW + 2;
  const C_TABLE_BOTTOM_ROW = C_TABLE_TOP_ROW + C_TABLE_DEFAULT_ROWS;
  const C_TABLE_LEFT_COLUMN = M_TABLE_LEFT_COLUMN;
  const C_TABLE_RIGHT_COLUMN = M_TABLE_RIGHT_COLUMN;
  const C_TABLE_START_HDR = "".concat(C_TABLE_LEFT_COLUMN, C_TABLE_TOP_ROW);
  const C_TABLE_END_HDR = "".concat(C_TABLE_RIGHT_COLUMN, C_TABLE_TOP_ROW);
  const C_TABLE_HDR_RANGE = "".concat(C_TABLE_START_HDR, ":", C_TABLE_END_HDR);
  objWS.getRange(C_TABLE_HDR_RANGE).merge(false);
  addBorderLines(objWS.getRange(C_TABLE_HDR_RANGE));
  objWS.getRange(C_TABLE_HDR_RANGE).format.horizontalAlignment = "Left";
  objWS.getRange(C_TABLE_HDR_RANGE).format.font.bold = true;
  objWS.getRange(C_TABLE_HDR_RANGE).format.fill.color = YELLOW;
  objWS.getRange(C_TABLE_START_HDR).values = [["Audit Comments"]];

  // AUDIT COMMENTS TABLE: DATA
  const C_TABLE_START_DAT = "".concat(C_TABLE_LEFT_COLUMN, C_TABLE_TOP_ROW + 1);
  const C_TABLE_END_DAT = "".concat(C_TABLE_RIGHT_COLUMN, C_TABLE_BOTTOM_ROW);
  const C_TABLE_DAT_RANGE = "".concat(C_TABLE_START_DAT, ":", C_TABLE_END_DAT);
  objWS.getRange(C_TABLE_DAT_RANGE).merge(false);
  addBorderLines(objWS.getRange(C_TABLE_DAT_RANGE));
  objWS.getRange(C_TABLE_DAT_RANGE).format.horizontalAlignment = "Left";

  // ================================
  // WORKSHEET RANGE FORMAT SETTINGS
  // ===============================
  /* TODO: optimise using set() method
  // ALSO GOOD: Use a "set" method to immediately set all the properties
  // without even needing to create a variable!
  worksheet.getRange("A1").set({
  numberFormat: [["0.00%"]],
  values: [[1]],
  format: {
      fill: {
          color: "red"
      }
  }
  });
  */
  const WS_BOTTOM_ROW = C_TABLE_BOTTOM_ROW;
  const WS_END_CELL = "".concat(WS_RIGHT_COLUMN, WS_BOTTOM_ROW);
  const WS_RANGE = "".concat(WS_START_CELL, ":", WS_END_CELL);
  const objWorkingRangeFormat = objWS.getRange(WS_RANGE).format;
  objWorkingRangeFormat.font.color = "#000000";
  objWorkingRangeFormat.font.name = "Calibri";
  objWorkingRangeFormat.font.size = 10;
  objWorkingRangeFormat.verticalAlignment = "Center";
  // Only Audit Comments Table: DATA need to be Top-justified
  objWS.getRange(C_TABLE_DAT_RANGE).format.verticalAlignment = "Top";

  // =======================================
  // WORKSHEET COLUMN WIDTHS AND ROW HEIGHTS
  // =======================================
  objWS.getRange("A1").format.columnWidth = pixelToPoint(29);
  objWS.getRange("B1").format.columnWidth = pixelToPoint(44);
  objWS.getRange("C1").format.columnWidth = pixelToPoint(138);
  objWS.getRange("D1").format.columnWidth = pixelToPoint(138);
  objWS.getRange("E1").format.columnWidth = pixelToPoint(138);
  objWS.getRange("F1").format.columnWidth = pixelToPoint(265);
  objWS.getRange("G1").format.columnWidth = pixelToPoint(74);
  objWS.getRange("H1").format.columnWidth = pixelToPoint(74);
  // Note: If you manually set the rowHeight, Excel no longer autofits rows
  //       to contents of cells with "wrapText = true". The way to do this
  //       is to not set the rowHeight programmatically.
  // objWS.getRange(WS_RANGE).format.rowHeight = pixelToPoint(17);
}

/**
 * Generate required rows of simulated data for inserting into the empty Audit
 * Worksheet. This function assumes the Audit Worksheet table layout has already
 * been set up and will overwrite contents of the Main Table and Message Params
 * Table.
 *
 * @param {Excel.Worksheet} objWS - Target worksheet to process.
 * @param {number} intDataRows - Number of rows of audit data to be filled in Main Table.
 */
function generateSimulatedData(objWS, intDataRows) {
  // Derive cell range of Message Params Table
  // Derive cell range of Main Table
  /*
  const M_TABLE_DATA_ROWS = Math.max(intDataRows, M_TABLE_DEFAULT_DATA_ROWS);
  const M_TABLE_BOTTOM_ROW = M_TABLE_TOP_ROW + M_TABLE_DATA_ROWS;
  const C_TABLE_TOP_ROW = M_TABLE_BOTTOM_ROW + C_TABLE_SPACER_ROWS;
  const C_TABLE_BOTTOM_ROW = C_TABLE_TOP_ROW + C_TABLE_DEFAULT_ROWS;
  const WS_BOTTOM_ROW = C_TABLE_BOTTOM_ROW;
  const WS_END_CELL = "".concat(WS_RIGHT_COLUMN, WS_BOTTOM_ROW);
  const WS_RANGE = "".concat(WS_START_CELL, ":", WS_END_CELL);
  */
}

/**
 * Validate public key belongs to the wallet address in MAIN TABLE
 *
 * @param {Excel.Range} objDataRange - Cell range of data in Main Table.
 */
function validateWalletAddress(objDataRange) {
  /**
   * Performs sanity checks on the format of the public key associated with a
   * Bitcoin address. Checks for valid lengths and valid prefixes used in both
   * compressed and uncompressed public key forms.
   *
   * @param {Uint8Array} publicKey - Byte array of a public key associated with a Bitcoin address.
   * @inner
   * @returns {boolean} True when public key has valid length and prefix; false otherwise.
   */
  function isBTCPublicKeyValidFormat(publicKey) {
    // Compressed public key is 33 bytes long and has either 0x02 or 0x03 prefix
    const BTC_COMP_PUBKEY_LENGTH = 33;
    const BTC_COMP_PUBKEY_PREFIX_EVEN = 0x02;
    const BTC_COMP_PUBKEY_PREFIX_ODD = 0x03;

    // Uncompressed public key is 65 bytes long and has 0x04 prefix
    const BTC_FULL_PUBKEY_LENGTH = 65;
    const BTC_FULL_PUBKEY_PREFIX = 0x04;

    let isValidFormat = false;

    if (publicKey.length === BTC_COMP_PUBKEY_LENGTH) {
      switch (publicKey[0]) {
        case BTC_COMP_PUBKEY_PREFIX_EVEN:
        case BTC_COMP_PUBKEY_PREFIX_ODD:
          isValidFormat = true;
          break;
        default:
          isValidFormat = false;
      }
    } else if (publicKey.length === BTC_FULL_PUBKEY_LENGTH) {
      isValidFormat = publicKey[0] === BTC_FULL_PUBKEY_PREFIX;
    } else {
      isValidFormat = false;
    }

    return isValidFormat;
  }

  // Constants
  const ERROR_EMPTY = "";
  const ERROR_PUBKEY = "X PubKey";
  const ERROR_WALLET = "X Wallet";

  // Create new array to populate updated data
  // I observed that Office JS context only updates the values back to the
  // Excel worksheet when a new array that contains entire range values in the
  // Excel.Range object are assigned to Excel.Range.values property.
  let data = objDataRange.values.map((arr) => arr.slice());

  // Check every wallet address === p2pkh(public key)
  for (let row = 0; row < data.length; row++) {
    let walletAddrSrc = data[row][M_TABLE_ADDR_CNUM];
    let publicKeySrc = data[row][M_TABLE_PUBKEY_CNUM];

    // Syntax Validation for wallet address & public key
    // 1. Ensure both wallet address and public key are not empty
    // 2. Ensure wallet address conforms to base58, otherwise "X Wallet" appears
    // 3. Ensure public key conforms to base16, otherwise "X PubKey" appears
    let walletAddrIsFilled = walletAddrSrc !== "";
    let publicKeyIsFilled = publicKeySrc !== "";

    if (walletAddrIsFilled && publicKeyIsFilled) {
      let walletAddrIsBase58 = regexBase58.test(walletAddrSrc);

      if (walletAddrIsBase58) {
        let publicKeyIsHex = regexHex.test(publicKeySrc);

        if (publicKeyIsHex) {
          // Internally prepend '0' if hex string has odd number of characters
          if (publicKeySrc.length % 2 === 1) {
            publicKeySrc = "".concat("0", publicKeySrc);
          }

          // Wallet Validation Workflow
          // 1. "X PubKey" appears when public key is invalid
          // 2. "false" appears when public key is valid, wallet address is wrong
          // 3. "true" appears when both public key and wallet address are valid
          let pubkey = Buffer.from(publicKeySrc, "hex");

          if (isBTCPublicKeyValidFormat(pubkey)) {
            let { address } = bitcoinjs.payments.p2pkh({ pubkey });
            let walletAddrIsValid = walletAddrSrc === address;
            data[row][M_TABLE_VAL_WALLET_CNUM] = walletAddrIsValid.toString();
          } else {
            // Public key does not conform to bitcoin ECDSA public key format
            data[row][M_TABLE_VAL_WALLET_CNUM] = ERROR_PUBKEY;
          }
        } else {
          // Public key is not a base16 string
          data[row][M_TABLE_VAL_WALLET_CNUM] = ERROR_PUBKEY;
        }
      } else {
        // Wallet is not a base58 string
        data[row][M_TABLE_VAL_WALLET_CNUM] = ERROR_WALLET;
      }
    } else {
      // Wallet address or Public Key is empty
      data[row][M_TABLE_VAL_WALLET_CNUM] = ERROR_EMPTY;
    }
  }

  // Update data in Main Table
  objDataRange.values = data;
}
