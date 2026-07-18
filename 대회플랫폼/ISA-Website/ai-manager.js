/**
 * ISA AI Chat Assistant Manager
 * Powered by Anthropic Claude 3.5 Sonnet
 */

const AI_CONFIG = {
    // Anthropic API Key (개인 크레딧 $30 사용)
    API_KEY: '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',
    MODEL: 'claude-3-5-sonnet-20241022',
    SYSTEM_PROMPT: `당신은 국제인공서핑협회(ISA - International Artificial Indoor Surfing Association)의 공식 AI 비서입니다.
사용자들에게 다음과 같은 정보를 친절하고 전문적으로 안내해야 합니다:
1. 자격증(Cert): 4급부터 1급까지의 과정, 응시료(4~3급 50만원, 2~1급 30만원), 재응시료(1만원) 등.
2. 교육(Edu): 강사 매칭 서비스 및 ISA 아카데미 교육 과정.
3. 공제회(Mutual Aid): 서핑 사고 대비 보험 및 복지 혜택.
4. 모든 답변은 한국어로 하며, 전문적이면서도 친근한 어조를 유지하세요.
5. 모르는 내용은 함부로 추측하지 말고 협회에 문의하도록 안내하세요.`
};

let isAIChatOpen = false;

function toggleAIChat() {
    const window = document.getElementById('ai-chat-window');
    if (!window) return;
    
    isAIChatOpen = !isAIChatOpen;
    window.style.display = isAIChatOpen ? 'flex' : 'none';
    
    if (isAIChatOpen) {
        document.getElementById('ai-chat-input')?.focus();
    }
}

function handleAIChatKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendAIMessage();
    }
}

async function sendAIMessage() {
    const input = document.getElementById('ai-chat-input');
    const container = document.getElementById('ai-chat-messages');
    const message = input?.value.trim();

    if (!message || !container) return;

    // 사용자 메시지 추가
    appendChatMessage('user', message);
    if (input) input.value = '';

    // 로딩 메시지 추가
    const loadingId = 'ai-loading-' + Date.now();
    appendChatMessage('ai', '생각 중...', loadingId);

    try {
        const response = await fetchAnthropic(message);
        const loadingEl = document.getElementById(loadingId);
        if (loadingEl) {
            loadingEl.textContent = response;
        }
    } catch (error) {
        console.error('AI Error:', error);
        const loadingEl = document.getElementById(loadingId);
        if (loadingEl) {
            loadingEl.textContent = '죄송합니다. 서비스 연결 중 오류가 발생했습니다. (잠시 후 다시 시도해 주세요)';
            loadingEl.style.color = '#ef4444';
        }
    }
}

function appendChatMessage(role, text, id = null) {
    const container = document.getElementById('ai-chat-messages');
    if (!container) return;

    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${role}`;
    if (id) bubble.id = id;
    bubble.textContent = text;
    
    container.appendChild(bubble);
    container.scrollTop = container.scrollHeight;
}

async function fetchAnthropic(userMessage) {
    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': AI_CONFIG.API_KEY,
                'anthropic-version': '2023-06-01',
                'anthropic-dangerous-direct-browser-access': 'true'
            },
            body: JSON.stringify({
                model: AI_CONFIG.MODEL,
                max_tokens: 1024,
                system: AI_CONFIG.SYSTEM_PROMPT,
                messages: [
                    { role: 'user', content: userMessage }
                ]
            })
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error?.message || 'API Request Failed');
        }

        const data = await response.json();
        return data.content[0].text;
    } catch (error) {
        throw error;
    }
}
