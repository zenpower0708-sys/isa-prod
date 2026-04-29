const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');

const filesToProcess = [
    { src: 'ISA_Standing_FlowBoard_4급_문제은행_교재.docx', dest: 'standing_4.json' },
    { src: 'ISA_Standing_3급_문제은행_교재.docx', dest: 'standing_3.json' },
    { src: 'ISA_Standing_2급_문제은행_교재.docx', dest: 'standing_2.json' },
    { src: 'ISA_Standing_1급_문제은행_교재.docx', dest: 'standing_1.json' },
    { src: 'ISA_Body_4급_문제은행_교재.docx', dest: 'body_4.json' },
    { src: 'ISA_Body_3급_문제은행_교재.docx', dest: 'body_3.json' },
    { src: 'ISA_Body_2급_문제은행_교재.docx', dest: 'body_2.json' },
    { src: 'ISA_Body_1급_문제은행_교재.docx', dest: 'body_1.json' }
];

const downloadsDir = 'C:\\Users\\김도현\\Downloads';
const outputDir = path.join(__dirname, '../public/data');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

async function parseDocx(fileName, outputName) {
    const filePath = path.join(downloadsDir, fileName);
    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        return;
    }
    
    try {
        const result = await mammoth.extractRawText({path: filePath});
        let text = result.value;
        
        let part2Index = text.indexOf('Part 2');
        if (part2Index === -1) part2Index = text.indexOf('정답 및 해설편');
        if (part2Index !== -1) {
            text = text.substring(part2Index);
        }

        const questions = [];
        const blocks = text.split(/(?=Q\d+\.)/);
        
        for (let block of blocks) {
            if (!block.trim().startsWith('Q')) continue;
            
            let qMatch = block.match(/^Q(\d+)\.\s*([^\n]+)/);
            if (!qMatch) continue;
            let id = parseInt(qMatch[1]);
            let question = qMatch[2].trim();
            
            let ansMatch = block.match(/▶\s*정답:\s*([①②③④])/);
            if (!ansMatch) continue;
            let ansChar = ansMatch[1];
            let answer = ansChar === '①' ? 1 : ansChar === '②' ? 2 : ansChar === '③' ? 3 : 4;
            
            let options = [];
            let opt1 = block.match(/①\s*([^\n]+)/);
            let opt2 = block.match(/②\s*([^\n]+)/);
            let opt3 = block.match(/③\s*([^\n]+)/);
            let opt4 = block.match(/④\s*([^\n]+)/);
            
            if (opt1 && opt2 && opt3 && opt4) {
                options = [opt1[1].trim(), opt2[1].trim(), opt3[1].trim(), opt4[1].trim()];
            } else {
                continue;
            }
            
            let expMatch = block.match(/💡\s*해설\s*([\s\S]*?)(?=Q\d+\.|$)/);
            let explanation = expMatch ? expMatch[1].trim() : "해설이 제공되지 않았습니다.";
            
            questions.push({
                id,
                question,
                options,
                answer,
                explanation
            });
        }
        
        const outputPath = path.join(outputDir, outputName);
        fs.writeFileSync(outputPath, JSON.stringify(questions, null, 2), 'utf-8');
        console.log(`Generated ${outputName} with ${questions.length} questions.`);
        
    } catch (e) {
        console.error(`Error processing ${fileName}:`, e);
    }
}

async function main() {
    for (let fileObj of filesToProcess) {
        await parseDocx(fileObj.src, fileObj.dest);
    }
}

main();
