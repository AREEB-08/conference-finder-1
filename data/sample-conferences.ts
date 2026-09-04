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

export const sampleConferenceRows: SheetRow[] = [
  {
    "CONFERENCE NAME": "NEURA IPS",
    "CONFERENCE LINK": "https://neurips.cc/",
    "Last Date - Paper Submission": "",
    "CONFERENCE DATE": "date has been gone",
    "PAPER SIZE": "",
    "PAPER FORMAT": "",
    "CONFERENCE TOPICS": "",
    "MODE": "",
    "CONFERENCE PLACE": "",
    "CONFERENCE FEES": ""
  },
  {
    "CONFERENCE NAME": "ICASSE 2026 – International Conference on Academic Studies in Science and Education",
    "CONFERENCE LINK": "ICASSE 2026 - International Conference on Academic Studies in Science and Education",
    "Last Date - Paper Submission": "December 10, 2026 (abstract submission continues until this date)",
    "CONFERENCE DATE": "December 18–20, 2026",
    "PAPER SIZE": "No page limit stated; Abstract 100–300 words",
    "PAPER FORMAT": ".doc / .docx; APA 7; Times New Roman 10 pt; 1-inch margins; single-spaced",
    "CONFERENCE TOPICS": "Science & Education; Educational Technology; Technology in Education; Academic Research & Innovation; Educational Practices; Interdisciplinary Collaboration; Education Policy & Strategies",
    "MODE": "In-person + Online/Virtual",
    "CONFERENCE PLACE": "Nippon Hotel, Istanbul, Türkiye",
    "CONFERENCE FEES": "In-person participant: €300 Virtual/online participant: €300 Accompanying person: €100 Virtual listener: €250 Additional paper: €100 per paper"
  },
  {
    "CONFERENCE NAME": "IEEE India Council International Conference (INDICON 2026)",
    "CONFERENCE LINK": "https://events.ieee.org/indicon-2026/ https://www.indicon2026.com/",
    "Last Date - Paper Submission": "2026-08-31",
    "CONFERENCE DATE": "December 18–20, 2026",
    "PAPER SIZE": "4–6 pages",
    "PAPER FORMAT": "IEEE two-column confer format 10-point font 8.5 × 11 inch (US Letter) Includes figures, tables, and references",
    "CONFERENCE TOPICS": "Artificial Intelligence; 6G Communications; Cyber-Physical Systems; Sustainable Electronics; Smart Societies; Net-Zero Technologies",
    "MODE": "In-person + Online/Virtual",
    "CONFERENCE PLACE": "Sri Sai Ram Engineering College, Chennai, Tamil Nadu, India",
    "CONFERENCE FEES": "Indian – IEEE Student Member: ₹9,000 Indian – Non-IEEE Student Member: ₹10,000 Indian – IEEE Member: ₹10,000 Indian – Non-IEEE Member: ₹11,000"
  },
  {
    "CONFERENCE NAME": "ICMAI-MAC 2026 – 1st International Conference on Mathematics and AI: Modelling, Analysis and Computation",
    "CONFERENCE LINK": "https://nitgoa.ac.in/icmai-mac2026/",
    "Last Date - Paper Submission": "2026-09-30",
    "CONFERENCE DATE": "10–11 December 2026",
    "PAPER SIZE": "Extended Abstract: ≤500 words, 1 page; PDF + LaTeX (.tex)",
    "PAPER FORMAT": "PDF (.pdf) LaTeX source (.tex",
    "CONFERENCE TOPICS": "Applied Mathematics; Mathematical Modeling; Machine Learning; Artificial Intelligence; Data Science; Optimization; Numerical Analysis; Differential Equations; Statistical Modeling; Forecasting; Dynamical Systems; Control Theory; Scientific Computing; Cryptography; Statistics & Econometrics",
    "MODE": "Physical venue; online mode not specified",
    "CONFERENCE PLACE": "National Institute of Technology Goa (NIT Goa), Goa, India",
    "CONFERENCE FEES": "Research Scholar: ₹3,540 early / ₹4,720 late Faculty/Scientist: ₹5,015 early / ₹6,195 late Industry: ₹7,080 early / ₹8,260 late Overseas: $50 / $100 / $200"
  },
  {
    "CONFERENCE NAME": "CVMI-2026 – 5th IEEE International Conference on Computer Vision and Machine Intelligence",
    "CONFERENCE LINK": "https://cvmi2026.coeptech.ac.in/",
    "Last Date - Paper Submission": "Paper Submission Round 2: 30 April 2026 Camera-Ready: 1 October 2026 Late Registration: 30 September 2026 Conference: 30 Oct – 1 Nov 2026",
    "CONFERENCE DATE": "October 30 – November 1, 2026",
    "PAPER SIZE": "IEEE Conference Template; A4; 6 pages; up to 2 additional pages with extra charges",
    "PAPER FORMAT": "PDF; IEEE PDF eXpress verified",
    "CONFERENCE TOPICS": "Computer Vision; Machine Learning; Deep Learning; Artificial Intelligence; Medical Image Analysis; Image/Video Processing; Image/Video Security; Explainable & Ethical AI; Recognition & Processing; Remote Sensing; Segmentation; Scene Understanding; Robotics; Intelligent Systems",
    "MODE": "IN PERSON",
    "CONFERENCE PLACE": "COEP Technological University, Shivajinagar, Pune, Maharashtra, India",
    "CONFERENCE FEES": "Indian Student: ₹10,620 IEEE/IAPR | ₹11,800 Non-IEEE/IAPR Academia: ₹12,980 IEEE/IAPR | ₹14,160 Non-IEEE/IAPR Industry: ₹14,160 IEEE/IAPR | ₹15,340 Non-IEEE/IAPR Extra page: ₹1,770/page (max 2)"
  },
  {
    "CONFERENCE NAME": "WCCG 2026 – World Conference on Cognitive Computing and Generative AI",
    "CONFERENCE LINK": "https://wccg.in/",
    "Last Date - Paper Submission": "2026-08-20",
    "CONFERENCE DATE": "20–21 November 2026",
    "PAPER SIZE": "Regular paper: up to 6 pages; maximum 2 additional pages with extra fee; IEEE template; Letter size",
    "PAPER FORMAT": "IEEE-MS Word or LaTeX; PDF submission through Microsoft CMT",
    "CONFERENCE TOPICS": "Cognitive Computing; Intelligent Agents; Human-Inspired Reasoning; Knowledge Representation; Semantic Understanding; Neuro-Symbolic Systems; Commonsense Reasoning; Deep Learning; Cognitive Machine Learning; Meta-Learning; Explainable AI; Reinforcement Learning; Multimodal Cognitive Reasoning",
    "MODE": "Hybrid",
    "CONFERENCE PLACE": "Smt. Kamala and Sri Venkappa M. Agadi College of Engineering & Technology (SKSVMACET), Lakshmeshwar, Karnataka, India",
    "CONFERENCE FEES": "Student/Research Scholar: ₹8,200 IEEE / ₹9,000 Non-IEEE Academician: ₹8,500 IEEE / ₹9,200 Non-IEEE Industry: ₹8,700 IEEE / ₹9,400 Non-IEEE Extra page: ₹800 IEEE / ₹1,000 Non-IEEE per page"
  },
  {
    "CONFERENCE NAME": "OCIT 2026 – 24th OITS International Conference on Information Technology",
    "CONFERENCE LINK": "https://oits-icit.github.io/",
    "Last Date - Paper Submission": "17 August 2026 (2nd Round Full Paper)",
    "CONFERENCE DATE": "17–19 December 2026",
    "PAPER SIZE": "ABSTRACT - 1400 - 1600 IEEE FORMAT-6 pages",
    "PAPER FORMAT": "IEEE",
    "CONFERENCE TOPICS": "Artificial Intelligence; Machine Learning; Deep Learning; Data Science; Networking & Information Security; Distributed & Cloud Computing; Multimedia; Signal Processing; Embedded Systems; Smart Grid & IoT; Information Systems & Business Analytics; Healthcare Technologies; Generative AI; Quantum Computing; Green Computing & Sustainable IT",
    "MODE": "",
    "CONFERENCE PLACE": "National Institute of Technology Kurukshetra, Haryana, India",
    "CONFERENCE FEES": "IEEE Student: ₹7,000 | Non-IEEE Student: ₹8,400 IEEE Faculty/Scientists: ₹8,000 | Non-IEEE: ₹9,600 IEEE Industry: ₹10,000 | Non-IEEE: ₹12,000 IEEE Foreign: $200 | Non-IEEE Foreign: $250"
  }
];
