import PDFDocument from 'pdfkit';

/* ---------------------------------------------------------------------------
 * RAY SEO Analyser — PDF report
 *
 * Design intent: match the website's RAY branding (deep navy hero, violet
 * accents, lavender tints, light page background) and read like a designed
 * document rather than a printout: a full-bleed cover, a stat strip, score
 * dial, labelled category bars, and severity-coloured finding cards.
 * ------------------------------------------------------------------------- */

const C = {
  navy: '#000066',
  ink: '#0a0a3a',
  purple: '#5125d2',
  purpleSoft: '#7a4dff',
  lavender: '#e3def7',
  lavPale: '#f7f6fd',
  muted: '#656590',
  faint: '#8a8aae',
  line: '#e6e2f6',
  white: '#ffffff',
  good: '#2c7a4b',
  fair: '#b8860b',
  poor: '#d35400',
  bad: '#c0392b',
};

const SEV = {
  critical: { color: C.bad, label: 'Critical' },
  high: { color: C.poor, label: 'High' },
  medium: { color: C.fair, label: 'Medium' },
  low: { color: C.good, label: 'Low' },
  informational: { color: C.purple, label: 'Info' },
};

const M = 46; // page margin
const GUT = 16; // column gutter
const BOTTOM = 74;

const gradeColor = (score) => {
  if (typeof score !== 'number') return C.faint;
  if (score >= 75) return C.good;
  if (score >= 60) return C.fair;
  if (score >= 40) return C.poor;
  return C.bad;
};

function prettyDate(value) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString('en-GB', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'UTC',
    });
  } catch {
    return String(value);
  }
}

function tidy(value, max = 120) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function hostOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return tidy(url, 40);
  }
}

/* ----------------------------------- chrome ------------------------------- */

function paintPageBackground(doc) {
  doc.save();
  doc.rect(0, 0, doc.page.width, doc.page.height).fill(C.white);
  // Subtle lavender wash at the very top of every page.
  doc.rect(0, 0, doc.page.width, 6).fill(C.purple);
  doc.restore();
}

function drawFooter(doc, pageNumber, pageCount) {
  const y = doc.page.height - 40;
  const w = doc.page.width;

  doc.save();
  doc
    .moveTo(M, y - 12)
    .lineTo(w - M, y - 12)
    .lineWidth(0.75)
    .strokeColor(C.line)
    .stroke();

  doc.fillColor(C.purple).circle(M + 3, y + 2, 2.6).fill();
  doc
    .font('Helvetica-Bold')
    .fontSize(7.5)
    .fillColor(C.navy)
    .text('RAY SEO ANALYSER', M + 12, y - 2, { characterSpacing: 0.8, lineBreak: false });

  doc
    .font('Helvetica')
    .fontSize(7.5)
    .fillColor(C.faint)
    .text('Wemray diagnostic — not an official Google score', M + 12, y + 8, {
      lineBreak: false,
    });

  doc
    .font('Helvetica')
    .fontSize(7.5)
    .fillColor(C.faint)
    .text(`${pageNumber} / ${pageCount}`, w - M - 60, y + 2, {
      width: 60,
      align: 'right',
      lineBreak: false,
    });
  doc.restore();
}

function ensureSpace(doc, needed) {
  if (doc.y + needed > doc.page.height - BOTTOM) {
    doc.addPage();
    return true;
  }
  return false;
}

function sectionTitle(doc, num, title) {
  ensureSpace(doc, 56);
  doc.moveDown(0.5);
  const y = doc.y;

  doc.font('Helvetica-Bold').fontSize(8).fillColor(C.purple);
  doc.text(String(num).padStart(2, '0'), M, y, { width: 22, lineBreak: false });

  doc.font('Helvetica-Bold').fontSize(13).fillColor(C.navy);
  doc.text(title, M + 24, y - 1.5, { width: doc.page.width - M * 2 - 24 });

  const lineY = doc.y + 5;
  doc.save();
  doc.moveTo(M, lineY).lineTo(doc.page.width - M, lineY).lineWidth(0.75).strokeColor(C.line).stroke();
  doc.restore();
  doc.y = lineY + 12;
}

/* ------------------------------------ cover ------------------------------- */

function drawCover(doc, report) {
  const w = doc.page.width;
  const heroH = 300;

  // Hero band
  doc.save();
  doc.rect(0, 0, w, heroH).fill(C.navy);
  // Decorative violet glow (stacked translucent circles keep it dependency-free).
  for (let i = 6; i >= 1; i -= 1) {
    doc
      .circle(w - 60, 40, i * 34)
      .fillOpacity(0.05)
      .fill(C.purpleSoft);
  }
  doc.restore();

  // Brand lockup
  doc.save();
  doc.circle(M + 4, 62, 4).fill(C.purpleSoft);
  doc
    .font('Helvetica-Bold')
    .fontSize(9.5)
    .fillColor(C.white)
    .text('WEMRAY TECHNOLOGY', M + 16, 57, { characterSpacing: 2.2, lineBreak: false });
  doc.restore();

  doc
    .font('Helvetica-Bold')
    .fontSize(34)
    .fillColor(C.white)
    .text('RAY SEO', M, 100, { lineBreak: false })
    .fillColor(C.lavender)
    .text('Analyser Report', M, 138);

  doc
    .font('Helvetica')
    .fontSize(10)
    .fillColor('#d7d3f4')
    .text('Single-page SEO audit · evidence-backed fixes · honest scope', M, 190, {
      width: w - M * 2 - 150,
    });

  // URL pill
  const urlText = tidy(report.finalUrl || report.url, 70);
  const pillY = 218;
  doc.save();
  doc.roundedRect(M, pillY, Math.min(w - M * 2, 380), 30, 15).fillOpacity(0.12).fill(C.white);
  doc.fillOpacity(1);
  doc.font('Helvetica-Bold').fontSize(9).fillColor(C.white).text('PAGE', M + 16, pillY + 11, {
    characterSpacing: 1,
    lineBreak: false,
  });
  doc.font('Helvetica').fontSize(9.5).fillColor('#e9e5ff').text(urlText, M + 58, pillY + 10, {
    width: Math.min(w - M * 2, 380) - 74,
    lineBreak: false,
  });
  doc.restore();

  doc
    .font('Helvetica')
    .fontSize(8)
    .fillColor('#a9a2d6')
    .text(`${report.reference || '—'}   ·   Generated ${prettyDate(report.fetchedAt)} UTC`, M, 262, {
      lineBreak: false,
    });

  // Score dial, overlapping the hero edge.
  const cx = w - M - 62;
  const cy = heroH - 8;
  const score = report.score?.overall;
  const color = gradeColor(score);

  doc.save();
  doc.circle(cx, cy, 68).fill(C.white);
  doc.circle(cx, cy, 60).lineWidth(9).strokeColor(C.lavender).stroke();
  doc
    .path(
      (() => {
        // 270° arc from 135° clockwise.
        const r = 60;
        const start = (135 * Math.PI) / 180;
        const end = (405 * Math.PI) / 180;
        const sx = cx + r * Math.cos(start);
        const sy = cy + r * Math.sin(start);
        const ex = cx + r * Math.cos(end);
        const ey = cy + r * Math.sin(end);
        return `M ${sx} ${sy} A ${r} ${r} 0 1 1 ${ex} ${ey}`;
      })(),
    )
    .lineWidth(9)
    .strokeColor(color)
    .stroke();
  doc.restore();

  doc
    .font('Helvetica-Bold')
    .fontSize(40)
    .fillColor(C.navy)
    .text(typeof score === 'number' ? String(score) : '—', cx - 46, cy - 26, {
      width: 92,
      align: 'center',
      lineBreak: false,
    });
  doc
    .font('Helvetica')
    .fontSize(7.5)
    .fillColor(C.muted)
    .text('RAY SCORE / 100', cx - 46, cy + 16, {
      width: 92,
      align: 'center',
      characterSpacing: 0.6,
      lineBreak: false,
    });

  // Grade chip
  const grade = report.score?.grade ? String(report.score.grade).toUpperCase() : null;
  if (grade) {
    const chipW = 74;
    doc.save();
    doc.roundedRect(cx - chipW / 2, cy + 30, chipW, 17, 8.5).fill(color);
    doc.restore();
    doc
      .font('Helvetica-Bold')
      .fontSize(7.5)
      .fillColor(C.white)
      .text(grade, cx - chipW / 2, cy + 35, { width: chipW, align: 'center', lineBreak: false });
  }

  doc.y = heroH + 34;
}

/* ------------------------------ stat strip -------------------------------- */

function drawStatStrip(doc, report) {
  const summary = report.summary || {};
  const stats = [
    ['Critical', summary.critical ?? 0, SEV.critical.color],
    ['High', summary.high ?? 0, SEV.high.color],
    ['Medium', summary.medium ?? 0, SEV.medium.color],
    ['Low', summary.low ?? 0, SEV.low.color],
    ['Passed', summary.passed ?? 0, C.good],
  ];

  const totalW = doc.page.width - M * 2;
  const gap = 9;
  const cellW = (totalW - gap * (stats.length - 1)) / stats.length;
  const h = 58;
  const y = doc.y;

  stats.forEach(([label, value, color], index) => {
    const x = M + index * (cellW + gap);
    doc.save();
    doc.roundedRect(x, y, cellW, h, 10).fill(C.lavPale);
    doc.roundedRect(x, y, cellW, 3, 1.5).fill(color);
    doc.restore();

    doc
      .font('Helvetica-Bold')
      .fontSize(20)
      .fillColor(C.navy)
      .text(String(value), x, y + 14, { width: cellW, align: 'center', lineBreak: false });
    doc
      .font('Helvetica')
      .fontSize(7)
      .fillColor(C.muted)
      .text(label.toUpperCase(), x, y + 40, {
        width: cellW,
        align: 'center',
        characterSpacing: 0.8,
        lineBreak: false,
      });
  });

  doc.y = y + h + 16;

  const headline =
    typeof report.score?.overall === 'number'
      ? `This page scores ${report.score.overall}/100 on the RAY diagnostic, with ${
          (summary.critical ?? 0) + (summary.high ?? 0)
        } high-priority issue${(summary.critical ?? 0) + (summary.high ?? 0) === 1 ? '' : 's'} to address first.`
      : 'The RAY Score could not be calculated for this page.';
  doc.font('Helvetica').fontSize(9.5).fillColor(C.muted).text(headline, M, doc.y, {
    width: totalW,
    lineGap: 2,
  });
  doc.y += 8;
}

/* ------------------------------ categories -------------------------------- */

function drawCategories(doc, report) {
  const categories = report.categories || report.score?.categories || [];
  if (!categories.length) return;

  sectionTitle(doc, 1, 'Score breakdown');

  const labelW = 132;
  const valueW = 44;
  const barX = M + labelW;
  const barW = doc.page.width - M * 2 - labelW - valueW - 10;

  for (const category of categories) {
    ensureSpace(doc, 34);
    const value = typeof category.score === 'number' ? category.score : null;
    const color = gradeColor(value);
    const y = doc.y;

    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .fillColor(C.ink)
      .text(category.label || category.id, M, y + 3, { width: labelW - 8, lineBreak: false });

    doc.save();
    doc.roundedRect(barX, y + 4, barW, 9, 4.5).fill(C.lavender);
    if (value != null) {
      doc
        .roundedRect(barX, y + 4, Math.max(9, (barW * Math.max(0, Math.min(100, value))) / 100), 9, 4.5)
        .fill(color);
    }
    doc.restore();

    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .fillColor(value == null ? C.faint : C.navy)
      .text(value == null ? 'n/a' : String(value), barX + barW + 8, y + 3, {
        width: valueW,
        align: 'right',
        lineBreak: false,
      });

    doc.y = y + 22;
  }
  doc.y += 6;
}

/* -------------------------------- findings -------------------------------- */

function issueCard(doc, issue) {
  const meta = SEV[issue.severity] || SEV.medium;
  const innerW = doc.page.width - M * 2 - 26;

  const desc = tidy(issue.description || '', 340);
  const fix = tidy(issue.fix || '', 300);
  const tag = `${meta.label} · ${issue.confidence || 'confirmed'} · ${
    issue.categoryLabel || issue.category || ''
  }`;

  doc.font('Helvetica').fontSize(8.5);
  const descH = desc ? doc.heightOfString(desc, { width: innerW }) : 0;
  const fixH = fix ? doc.heightOfString(`Fix: ${fix}`, { width: innerW }) : 0;
  const cardH = 34 + descH + (fixH ? fixH + 8 : 0) + 12;

  ensureSpace(doc, cardH + 12);

  const y = doc.y;

  // Card body
  doc.save();
  doc.roundedRect(M, y, doc.page.width - M * 2, cardH, 9).fill(C.lavPale);
  doc.roundedRect(M, y, 3.5, cardH, 1.75).fill(meta.color);
  doc.restore();

  doc
    .font('Helvetica-Bold')
    .fontSize(7)
    .fillColor(meta.color)
    .text(tag.toUpperCase(), M + 14, y + 10, {
      width: innerW,
      characterSpacing: 0.7,
      lineBreak: false,
    });

  doc
    .font('Helvetica-Bold')
    .fontSize(10)
    .fillColor(C.navy)
    .text(tidy(issue.title, 110), M + 14, y + 22, { width: innerW, lineGap: 1 });

  let cursor = doc.y + 4;
  if (desc) {
    doc.font('Helvetica').fontSize(8.5).fillColor(C.muted).text(desc, M + 14, cursor, {
      width: innerW,
      lineGap: 1.5,
    });
    cursor = doc.y + 5;
  }
  if (fix) {
    doc
      .font('Helvetica-Bold')
      .fontSize(8.5)
      .fillColor(C.purple)
      .text('Fix: ', M + 14, cursor, { continued: true, width: innerW })
      .font('Helvetica')
      .fillColor(C.ink)
      .text(fix, { width: innerW, lineGap: 1.5 });
  }

  doc.y = y + cardH + 9;
}

function drawFindings(doc, report) {
  const issues = (report.issues || []).filter((issue) => issue.severity !== 'informational');
  sectionTitle(doc, 2, 'Priority findings');

  if (!issues.length) {
    doc
      .font('Helvetica')
      .fontSize(9.5)
      .fillColor(C.good)
      .text('No scoring issues were found for this page.');
    doc.y += 6;
    return;
  }

  for (const issue of issues) issueCard(doc, issue);
}

/* ------------------------------- performance ------------------------------ */

function smallStat(doc, x, y, w, label, value) {
  doc.save();
  doc.roundedRect(x, y, w, 46, 9).fill(C.lavPale);
  doc.restore();
  doc
    .font('Helvetica-Bold')
    .fontSize(12)
    .fillColor(C.navy)
    .text(value, x, y + 11, { width: w, align: 'center', lineBreak: false });
  doc
    .font('Helvetica')
    .fontSize(6.8)
    .fillColor(C.muted)
    .text(label, x, y + 29, {
      width: w,
      align: 'center',
      characterSpacing: 0.6,
      lineBreak: false,
    });
}

function drawPerformance(doc, report) {
  sectionTitle(doc, 3, 'Performance');
  const perf = report.performance;

  if (!perf || !perf.available) {
    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor(C.muted)
      .text(perf?.reason || 'PageSpeed data is unavailable for this page.', { width: doc.page.width - M * 2 });
    doc.y += 6;
    return;
  }

  const perfColor = gradeColor(perf.score);
  doc.save();
  doc.roundedRect(M, doc.y, doc.page.width - M * 2, 34, 9).fill(C.lavPale);
  doc.restore();
  const y0 = doc.y;
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .fillColor(C.navy)
    .text('Mobile performance score', M + 14, y0 + 12, { lineBreak: false });
  doc
    .font('Helvetica-Bold')
    .fontSize(12)
    .fillColor(perfColor)
    .text(`${perf.score ?? '—'}/100`, doc.page.width - M - 90, y0 + 10, {
      width: 76,
      align: 'right',
      lineBreak: false,
    });
  doc.y = y0 + 46;

  const lab = perf.lab || {};
  const metrics = [
    ['LCP', lab.lcpMs != null ? `${Math.round(lab.lcpMs)} ms` : '—'],
    ['CLS', lab.cls != null ? String(lab.cls) : '—'],
    ['INP', lab.inpMs != null ? `${Math.round(lab.inpMs)} ms` : '—'],
    ['TBT', lab.tbtMs != null ? `${Math.round(lab.tbtMs)} ms` : '—'],
    ['FCP', lab.fcpMs != null ? `${Math.round(lab.fcpMs)} ms` : '—'],
    ['TTFB', lab.ttfbMs != null ? `${Math.round(lab.ttfbMs)} ms` : '—'],
  ];

  const gap = 8;
  const cellW = (doc.page.width - M * 2 - gap * (metrics.length - 1)) / metrics.length;
  const rowY = doc.y;
  metrics.forEach(([label, value], index) => {
    smallStat(doc, M + index * (cellW + gap), rowY, cellW, label, value);
  });
  doc.y = rowY + 54;

  doc
    .font('Helvetica')
    .fontSize(7.5)
    .fillColor(C.faint)
    .text(
      `Source: ${perf.source || 'Google PageSpeed Insights'}${perf.field?.category ? ` · Field data: ${perf.field.category}` : ''}`,
      M,
      doc.y,
      { width: doc.page.width - M * 2 },
    );
  doc.y += 8;
}

/* ---------------------------------- scope --------------------------------- */

function drawScope(doc, report) {
  sectionTitle(doc, 4, 'Scope, methodology and limitations');

  const limitations =
    report.scope?.limitations || [
      'This audit checks one page, not the whole site.',
      'The RAY Score is a Wemray diagnostic, not a Google score.',
    ];

  for (const line of limitations) {
    ensureSpace(doc, 20);
    const y = doc.y;
    doc.save();
    doc.circle(M + 2.5, y + 4.5, 1.8).fill(C.purpleSoft);
    doc.restore();
    doc.font('Helvetica').fontSize(8.5).fillColor(C.muted).text(line, M + 12, y, {
      width: doc.page.width - M * 2 - 12,
      lineGap: 1.5,
    });
    doc.y += 3;
  }

  doc.y += 10;
  ensureSpace(doc, 70);

  const boxY = doc.y;
  doc.save();
  doc.roundedRect(M, boxY, doc.page.width - M * 2, 52, 9).fill(C.navy);
  doc.restore();

  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .fillColor(C.white)
    .text('Want a full-site review?', M + 16, boxY + 14, { lineBreak: false });
  doc
    .font('Helvetica')
    .fontSize(8)
    .fillColor('#c9c3ee')
    .text('Wemray Technology · wemray.com/services/seo · hello@wemray.com', M + 16, boxY + 30, {
      lineBreak: false,
    });

  doc.y = boxY + 64;

  doc
    .font('Helvetica')
    .fontSize(7)
    .fillColor(C.faint)
    .text(
      `Report ${report.reference || '—'} · Rules v${report.versions?.rules || '—'} · Scoring v${report.versions?.score || '—'} · Generated ${prettyDate(report.fetchedAt)} UTC`,
      M,
      doc.y,
      { width: doc.page.width - M * 2, lineGap: 1 },
    );
}

/* ---------------------------------- build --------------------------------- */

export function buildReportPdf(report) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: M, bottom: BOTTOM, left: M, right: M },
        bufferPages: true,
        autoFirstPage: false,
        info: {
          Title: `RAY SEO Analyser — ${report.reference || 'Report'}`,
          Author: 'Wemray Technology',
          Subject: 'RAY SEO Analyser single-page SEO report',
          Keywords: `SEO, audit, RAY Score, ${hostOf(report.finalUrl || report.url)}`,
        },
      });

      const chunks = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.addPage();
      paintPageBackground(doc);

      drawCover(doc, report);
      drawStatStrip(doc, report);
      drawCategories(doc, report);
      drawFindings(doc, report);
      drawPerformance(doc, report);
      drawScope(doc, report);

      // Footers (page numbers need the final count, so add them last).
      const range = doc.bufferedPageRange();
      for (let i = 0; i < range.count; i += 1) {
        doc.switchToPage(range.start + i);
        drawFooter(doc, i + 1, range.count);
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
