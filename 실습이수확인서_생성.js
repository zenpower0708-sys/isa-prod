/**
 * ISA 실습 이수 확인서 DOCX 생성 스크립트
 * 실행 방법: node 실습이수확인서_생성.js
 * 필요: npm install docx
 */

const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType, VerticalAlign,
  HeadingLevel, Header, Footer, PageNumber
} = require('docx');
const fs = require('fs');
const path = require('path');

// ── 공통 스타일 ──────────────────────────────────────
const FONT = 'Malgun Gothic';
const COLOR_BLUE = '0284C7';
const COLOR_DARK = '0F172A';
const COLOR_GRAY = '475569';
const COLOR_LIGHT = 'F8FAFC';
const COLOR_RED   = 'EF4444';

const border = { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' };
const borders = { top: border, bottom: border, left: border, right: border };
const noBorder = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

function cell(text, opts = {}) {
  const {
    bold = false, color = COLOR_DARK, size = 20,
    bg = 'FFFFFF', colspan = 1, width = 2340,
    align = AlignmentType.LEFT, italic = false
  } = opts;
  return new TableCell({
    columnSpan: colspan,
    width: { size: width, type: WidthType.DXA },
    borders,
    shading: { fill: bg, type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({
      alignment: align,
      children: [new TextRun({ text, bold, color, size, font: FONT, italics: italic })]
    })]
  });
}

function labelCell(text, width = 2340) {
  return cell(text, { bold: true, color: COLOR_GRAY, size: 18, bg: COLOR_LIGHT, width });
}

function valueCell(text = '', width = 4680, colspan = 1) {
  return cell(text, { width, colspan });
}

function sectionTitle(text) {
  return new Paragraph({
    spacing: { before: 160, after: 80 },
    border: { left: { style: BorderStyle.SINGLE, size: 16, color: COLOR_BLUE } },
    indent: { left: 120 },
    shading: { fill: 'F0F9FF', type: ShadingType.CLEAR },
    children: [new TextRun({ text, bold: true, color: COLOR_BLUE, size: 20, font: FONT })]
  });
}

function emptyRow() {
  return new Paragraph({ spacing: { before: 60, after: 60 }, children: [] });
}

// ── 메인 문서 생성 ────────────────────────────────────
const doc = new Document({
  styles: {
    default: {
      document: { run: { font: FONT, size: 22, color: COLOR_DARK } }
    }
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },  // A4
        margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 }
      }
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: COLOR_BLUE } },
          spacing: { after: 80 },
          children: [new TextRun({
            text: '국제인공서핑협회 (ISA)  |  International Surfing Association',
            size: 16, color: COLOR_GRAY, font: FONT
          })]
        })]
      })
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          border: { top: { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0' } },
          spacing: { before: 80 },
          children: [
            new TextRun({ text: '© 2025 국제인공서핑협회 (ISA)  ·  본 양식의 무단 복제 및 변조를 금합니다.  ·  ', size: 16, color: 'CBD5E1', font: FONT }),
            new TextRun({ text: '페이지 ', size: 16, color: 'CBD5E1', font: FONT }),
            new TextRun({ children: [PageNumber.CURRENT], size: 16, color: 'CBD5E1', font: FONT }),
          ]
        })]
      })
    },
    children: [

      // ── 제목 ──
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 120, after: 60 },
        children: [new TextRun({ text: '실  습  이  수  확  인  서', bold: true, size: 44, font: FONT, color: COLOR_DARK })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 200 },
        children: [new TextRun({ text: 'Practical Training Completion Certificate', size: 20, font: FONT, color: COLOR_GRAY })]
      }),

      // ── ① 신청자 정보 ──
      sectionTitle('① 신청자 정보'),
      new Table({
        width: { size: 9746, type: WidthType.DXA },
        columnWidths: [2340, 2533, 2340, 2533],
        rows: [
          new TableRow({ children: [
            labelCell('성명  *'),
            valueCell('', 2533),
            labelCell('생년월일  *'),
            valueCell('', 2533),
          ]}),
          new TableRow({ children: [
            labelCell('연락처  *'),
            valueCell('', 2533),
            labelCell('신청 급수  *'),
            valueCell('□ 4급(일반)  □ 3급(중급)  □ 2급(상급)  □ 1급(프로)', 2533),
          ]}),
        ]
      }),

      emptyRow(),

      // ── ② 실습 이수 내용 ──
      sectionTitle('② 실습 이수 내용'),
      new Table({
        width: { size: 9746, type: WidthType.DXA },
        columnWidths: [2340, 7406],
        rows: [
          new TableRow({ children: [
            labelCell('교육 기간  *', 2340),
            valueCell('____년 ____월 ____일  ~  ____년 ____월 ____일', 7406),
          ]}),
          new TableRow({ children: [
            labelCell('총 이수 시간  *', 2340),
            valueCell('________ 시간', 7406),
          ]}),
          new TableRow({ children: [
            labelCell('교육 장소  *', 2340),
            valueCell('', 7406),
          ]}),
          new TableRow({ children: [
            labelCell('교육 시설명', 2340),
            valueCell('', 7406),
          ]}),
        ]
      }),

      emptyRow(),

      // ── ③ 강사 구분 ──
      sectionTitle('③ 강사 구분 및 정보'),
      new Paragraph({
        spacing: { before: 80, after: 100 },
        shading: { fill: 'F8FAFC', type: ShadingType.CLEAR },
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0' } },
        children: [
          new TextRun({ text: '□  ISA 공인 강사 (자격증 번호 기재 필수)          □  비공인 강사 (연락처 기재 및 서명 필수)', size: 20, font: FONT })
        ]
      }),
      new Table({
        width: { size: 9746, type: WidthType.DXA },
        columnWidths: [2340, 2533, 2340, 2533],
        rows: [
          new TableRow({ children: [
            labelCell('강사 성명  *'),
            valueCell('', 2533),
            labelCell('강사 연락처  *'),
            valueCell('', 2533),
          ]}),
          new TableRow({ children: [
            labelCell('ISA 자격증 번호'),
            valueCell('（공인 강사만 기재）', 7406, 3),
          ]}),
        ]
      }),

      emptyRow(),

      // ── ④ 급수별 최소 이수 시간 ──
      sectionTitle('④ 급수별 최소 이수 시간 기준'),
      new Table({
        width: { size: 9746, type: WidthType.DXA },
        columnWidths: [2436, 3000, 2310, 2000],
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              new TableCell({ width: { size: 2436, type: WidthType.DXA }, borders, shading: { fill: COLOR_BLUE, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '급수', bold: true, color: 'FFFFFF', size: 20, font: FONT })] })] }),
              new TableCell({ width: { size: 3000, type: WidthType.DXA }, borders, shading: { fill: COLOR_BLUE, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '등급명', bold: true, color: 'FFFFFF', size: 20, font: FONT })] })] }),
              new TableCell({ width: { size: 2310, type: WidthType.DXA }, borders, shading: { fill: COLOR_BLUE, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '최소 이수 시간', bold: true, color: 'FFFFFF', size: 20, font: FONT })] })] }),
              new TableCell({ width: { size: 2000, type: WidthType.DXA }, borders, shading: { fill: COLOR_BLUE, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '비고', bold: true, color: 'FFFFFF', size: 20, font: FONT })] })] }),
            ]
          }),
          ...[
            ['4급', '일반 (General)',       '10시간 이상', '기초 입문 과정'],
            ['3급', '중급 (Intermediate)',  '20시간 이상', '기본 기술 숙련'],
            ['2급', '상급 (Advanced)',      '30시간 이상', '심화 기술 과정'],
            ['1급', '프로 (Pro)',           '50시간 이상', '전문가·강사 수준'],
          ].map(([lv, name, hrs, note], i) =>
            new TableRow({ children: [
              new TableCell({ width: { size: 2436, type: WidthType.DXA }, borders, shading: { fill: i % 2 === 0 ? 'FFFFFF' : 'F8FAFC', type: ShadingType.CLEAR }, margins: { top: 60, bottom: 60, left: 120, right: 120 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: lv, bold: true, size: 20, font: FONT })] })] }),
              new TableCell({ width: { size: 3000, type: WidthType.DXA }, borders, shading: { fill: i % 2 === 0 ? 'FFFFFF' : 'F8FAFC', type: ShadingType.CLEAR }, margins: { top: 60, bottom: 60, left: 120, right: 120 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: name, size: 20, font: FONT })] })] }),
              new TableCell({ width: { size: 2310, type: WidthType.DXA }, borders, shading: { fill: i % 2 === 0 ? 'FFFFFF' : 'F8FAFC', type: ShadingType.CLEAR }, margins: { top: 60, bottom: 60, left: 120, right: 120 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: hrs, bold: true, size: 20, font: FONT })] })] }),
              new TableCell({ width: { size: 2000, type: WidthType.DXA }, borders, shading: { fill: i % 2 === 0 ? 'FFFFFF' : 'F8FAFC', type: ShadingType.CLEAR }, margins: { top: 60, bottom: 60, left: 120, right: 120 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: note, size: 18, color: COLOR_GRAY, font: FONT })] })] }),
            ]})
          )
        ]
      }),

      emptyRow(),

      // ── ⑤ 인정 서류 안내 ──
      sectionTitle('⑤ 인정 서류 기준 안내'),
      ...[
        '공인 강습장 또는 ISA 공인 강사가 발급한 수료증 (교육 날짜·시간 명기 필수)',
        'ISA 공식 양식의 실습 확인서 (강사 서명 필수)',
        '캠프·클리닉 참가 확인서 (주최 기관 직인 또는 강사 서명 포함)',
        '자체 훈련 일지 (강사 서명 + 연락처 기재 필수, 일자별 시간 상세 기록)',
      ].map(txt => new Paragraph({
        spacing: { before: 40, after: 40 },
        indent: { left: 200 },
        children: [
          new TextRun({ text: '● ', color: COLOR_BLUE, bold: true, font: FONT, size: 20 }),
          new TextRun({ text: txt, size: 20, font: FONT })
        ]
      })),

      new Paragraph({
        spacing: { before: 100, after: 60 },
        shading: { fill: 'FFF1F2', type: ShadingType.CLEAR },
        border: { left: { style: BorderStyle.SINGLE, size: 12, color: COLOR_RED } },
        indent: { left: 120 },
        children: [new TextRun({ text: '⚠️ 비공인 강습의 경우 강사 성명·연락처를 반드시 기재하여야 하며, 허위 기재 시 자격 취소 및 법적 책임이 따를 수 있습니다.', size: 18, color: '991B1B', font: FONT })]
      }),

      emptyRow(),

      // ── 서명란 ──
      new Paragraph({
        spacing: { before: 80, after: 60 },
        children: [new TextRun({ text: '위 내용이 사실임을 확인합니다.', size: 20, font: FONT })]
      }),
      new Paragraph({
        spacing: { before: 0, after: 160 },
        children: [new TextRun({ text: '확인일：____년  ____월  ____일', size: 20, font: FONT })]
      }),

      new Table({
        width: { size: 9746, type: WidthType.DXA },
        columnWidths: [3248, 3248, 3250],
        rows: [
          new TableRow({ children: [
            new TableCell({ width: { size: 3248, type: WidthType.DXA }, borders, shading: { fill: COLOR_LIGHT, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: '신청자 서명', bold: true, size: 18, color: COLOR_GRAY, font: FONT })] })] }),
            new TableCell({ width: { size: 3248, type: WidthType.DXA }, borders, shading: { fill: COLOR_LIGHT, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: '강사 서명  ', bold: true, size: 18, color: COLOR_GRAY, font: FONT }), new TextRun({ text: '*필수', bold: true, size: 18, color: COLOR_RED, font: FONT })] })] }),
            new TableCell({ width: { size: 3250, type: WidthType.DXA }, borders, shading: { fill: COLOR_LIGHT, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: '심사위원회 확인 (ISA 내부용)', bold: true, size: 18, color: COLOR_GRAY, font: FONT })] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ width: { size: 3248, type: WidthType.DXA }, borders, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [
              new Paragraph({ children: [new TextRun({ text: '성명：', size: 20, font: FONT })] }),
              new Paragraph({ spacing: { before: 400 }, children: [new TextRun({ text: '（서명 또는 인）', size: 18, color: '94A3B8', font: FONT, italics: true })] })
            ]}),
            new TableCell({ width: { size: 3248, type: WidthType.DXA }, borders, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [
              new Paragraph({ children: [new TextRun({ text: '강사명：', size: 20, font: FONT })] }),
              new Paragraph({ spacing: { before: 400 }, children: [new TextRun({ text: '（서명 또는 인）', size: 18, color: '94A3B8', font: FONT, italics: true })] })
            ]}),
            new TableCell({ width: { size: 3250, type: WidthType.DXA }, borders, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [
              new Paragraph({ children: [new TextRun({ text: '확인자：', size: 20, font: FONT })] }),
              new Paragraph({ spacing: { before: 400 }, children: [new TextRun({ text: '（직인）', size: 18, color: '94A3B8', font: FONT, italics: true })] })
            ]}),
          ]}),
        ]
      }),

      emptyRow(),

      // ── 제출처 ──
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 120 },
        border: { top: { style: BorderStyle.DASHED, size: 4, color: 'CBD5E1' } },
        children: [
          new TextRun({ text: '본 확인서는 ', size: 18, color: COLOR_GRAY, font: FONT }),
          new TextRun({ text: '국제인공서핑협회 자격 심사위원회', bold: true, size: 18, color: COLOR_BLUE, font: FONT }),
          new TextRun({ text: '에 제출하시기 바랍니다.', size: 18, color: COLOR_GRAY, font: FONT }),
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 40 },
        children: [new TextRun({ text: '문의：isa-web-portal.vercel.app', size: 18, color: COLOR_GRAY, font: FONT })]
      }),

    ]
  }]
});

// ── 파일 저장 ──
Packer.toBuffer(doc).then(buffer => {
  const outputPath = path.join(__dirname, '실습이수확인서.docx');
  fs.writeFileSync(outputPath, buffer);
  console.log('✅ 실습이수확인서.docx 생성 완료:', outputPath);
}).catch(err => {
  console.error('❌ 오류:', err);
});
