/**
 * Development fallback data.
 *
 * These rows are a verbatim snapshot of the maintained spreadsheet, stored in
 * the same raw shape the Sheets adapters return so they run through the exact
 * same parser. They exist only so the app is runnable before Google Sheets
 * credentials are configured.
 *
 * Nothing here is invented. Do not hand-edit these records to make the site
 * look fuller — update the spreadsheet instead. In production the sheet is the
 * single source of truth.
 */
import type { SheetRow } from "@/lib/sheets/rows";

export const sampleJournalRows: SheetRow[] = [
  {
    "JOURNAL NAME": "IEEE Transactions on Pattern Analysis and Machine Intelligence",
    "JOURNAL LINK": "https://ieeexplore.ieee.org/xpl/RecentIssue.jsp?punumber=34 IEEE",
    "PUBLISHER": "IEEE Computer Society / IEEE",
    "ISSN": "0162-8828",
    "JOURNAL SCOPE": "Computer vision, image understanding, pattern analysis and recognition, and selected areas of machine intelligence, with particular emphasis on machine learning for pattern analysis. It also covers visual search, document/handwriting analysis, medical image analysis, video/image sequence analysis, image/video retrieval, face and gesture recognition, and relevant hardware/software architectures",
    "RESEARCH AREAS": "Computer Vision; Image Understanding; Pattern Recognition; Machine Learning; Medical Image Analysis; Video Analysis; Image/Video Retrieval; Face & Gesture Recognition; Document & Handwriting Analysis; Machine Intelligence",
    "PUBLICATION FREQUENCY": "Monthly — 12 issues/year",
    "OPEN ACCESS": "Hybrid Open Access — authors can publish through the traditional subscription route or choose Open Access.",
    "APC / PUBLICATION FEE": "US$2,800 for Open Access under the 2026 IEEE APC list. This is optional for the hybrid journal; traditional publication does not require the OA APC.",
    "JOURNAL FEES": "Mandatory overlength charge: US$220/page beyond the allowed regular-paper length. OA APC is separate",
    "PAPER SIZE": "Regular paper: 12 double-column pages without overlength charges. TPAMI's submission guidelines allow submissions up to 18 pages subject to mandatory overlength charges. Other types include Short (8 pages), Comments (2.5 pages), and Survey (20 pages).",
    "JOURNAL VOLUME": "Volume 48 (2026)",
    "INDEXING": "Web of Science – SCIE; Scopus; IEEE Xplore. It is also widely indexed in major scholarly databases",
    "IMPACT FACTOR": "20.4 — 2025 Journal Impact Factor, from the 2025 Journal Citation Reports released in June 2026.",
    "SUBMISSION TYPE": "Regular Paper; Short Paper; Comments Paper; Survey Paper.",
    "JOURNAL WEBSITE": "IEEE TPAMI – IEEE Computer Society"
  },
  {
    "JOURNAL NAME": "Pattern Recognition",
    "JOURNAL LINK": "https://www.sciencedirect.com/journal/pattern-recognition",
    "PUBLISHER": "Elsevier",
    "ISSN": "0031-3203 (E-ISSN: 1873-5142)",
    "JOURNAL SCOPE": "Pattern Recognition publishes original contributions to the theory, methodology, and applications of pattern recognition. Its scope covers computer vision, image processing, text and document analysis, neural networks, machine learning, biometrics, bioinformatics, multimedia data analysis, and data science. Papers should make an original contribution and be clearly grounded in the pattern-recognition literature; routine applications of established methods are generally outside its scope.",
    "RESEARCH AREAS": "Pattern Recognition; Computer Vision; Image Processing; Machine Learning; Neural Networks; Image Understanding; Text & Document Analysis; Biometrics; Bioinformatics; Multimedia Analysis; Data Science; Signal/Pattern Analysis",
    "PUBLICATION FREQUENCY": "Monthly — 12 issues/year",
    "OPEN ACCESS": "Hybrid / Supports Open Access — authors can publish through the subscription model or choose Open Access.",
    "APC / PUBLICATION FEE": "US$2,710 for Open Access according to the current journal listing. APC may be subject to applicable agreements, discounts, taxes, or changes.",
    "JOURNAL FEES": "No general mandatory publication fee for the standard subscription route. Additional charges may apply where applicable; OA APC is separate.",
    "PAPER SIZE": "Single-column, double-spaced: minimum 20 pages, maximum 35 pages for regular submissions; up to 40 pages for reviews.",
    "JOURNAL VOLUME": "Volume 179 (2026)",
    "INDEXING": "Web of Science (SCIE); Scopus; ScienceDirect/Elsevier databases; indexed in major bibliographic databases.",
    "IMPACT FACTOR": "7.6 — 2025 Journal Impact Factor",
    "SUBMISSION TYPE": "Original Research Articles; Review Articles; Pedagogical Papers; Special-issue contributions",
    "JOURNAL WEBSITE": "Pattern Recognition — Elsevier / ScienceDirect"
  },
  {
    "JOURNAL NAME": "Computer Vision and Image Understanding",
    "JOURNAL LINK": "https://www.sciencedirect.com/journal/computer-vision-and-image-understanding",
    "PUBLISHER": "Elsevier / Academic Press",
    "ISSN": "1077-3142 (E-ISSN: 1090-235X)",
    "JOURNAL SCOPE": "The central focus of the journal is the computer analysis of pictorial information. It publishes research covering all aspects of image analysis, from low-level visual processing to high-level recognition and interpretation. The journal covers theoretical and applied work in computer vision and image understanding, including novel approaches to visual analysis, recognition, representation, and vision systems.",
    "RESEARCH AREAS": "Theory; Computer Vision; Image Analysis; Early Vision; Data Structures and Representations; Shape Analysis; Range; Motion; Matching and Recognition; Vision Systems; Image Understanding; Visual Recognition",
    "PUBLICATION FREQUENCY": "Monthly — 12 issues/year",
    "OPEN ACCESS": "Hybrid / Supports Open Access — authors can publish through the subscription route or choose Open Access.",
    "APC / PUBLICATION FEE": "US$2,390 for Open Access, excluding taxes, according to the current Elsevier listing. The amount may be reduced where applicable agreements or discounts apply.",
    "JOURNAL FEES": "No publication fee for the standard subscription route; Open Access APC is separate.",
    "PAPER SIZE": "Regular research articles are submitted using the journal's author templates; no simple fixed page limit is prominently specified on the current journal information page, so authors should follow the current Guide for Authors for formatting and length requirements.",
    "JOURNAL VOLUME": "Volume 271 (2026) — current September 2026 volume",
    "INDEXING": "Web of Science – SCIE; Scopus; Web of Science Core Collection",
    "IMPACT FACTOR": "3.5 — 2025 Journal Impact Factor",
    "SUBMISSION TYPE": "Research Articles; Review Articles; Special Issue Contributions",
    "JOURNAL WEBSITE": "Computer Vision and Image Understanding — Elsevier / ScienceDirect"
  }
];
