/**
 * Powered by Anthropic Claude 4.6 Sonnet
 */

const AI_CONFIG = {
    // Anthropic API Key (개인 크레딧)
    API_KEY: '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',
    // 2026년 기준 최신 모델 (혹은 claude-3-5-sonnet-latest)
    MODEL: 'claude-3-5-sonnet-20241022', 
    SYSTEM_PROMPT: `당신은 국제인공서핑협회(ISA - International Artificial Indoor Surfing Association)의 공식 AI 비서입니다.
사용자들에게 다음과 같은 정보를 친절하고 전문적으로 안내해야 합니다:
1. 자격증(Cert): 4급부터 1급까지의 과정, 응시료(4~3급 50만원, 2~1급 30만원), 재응시료(1만원) 등.
2. 공제회(Mutual Aid): 서핑 중 사고에 대한 보상 및 공제회 가입 안내.
3. 교육(Education): 강사 배정 및 ISA 아카데미 안내.
4. 장비스토어: 협회 공식 장비 스토어 안내.

답변 원칙:
- 항상 존댓말을 사용하며 전문적이면서도 서퍼다운 친근함을 유지하세요.
- ISA 포털 내에서 확인할 수 있는 정보 위주로 답변하세요.
- 모르는 정보는 임의로 지어내지 말고 고객센터(02-554-2212)로 문의하도록 안내하세요.
- 한국어 질문에는 한국어로, 영어 질문에는 영어로 답변하세요.`,
};

let chatHistory = [];

// UI 제어 함수
function toggleAIChat() {
    const window = document.getElementById('ai-chat-window');
    window.classList.toggle('open');
    if (window.classList.contains('open')) {
        document.getElementById('ai-chat-input').focus();
    }
}

function handleAIChatKey(event) {
    if (event.key === 'Enter') {
        sendAIMessage();
    }
}

async function sendAIMessage() {
    const input = document.getElementById('ai-chat-input');
    const message = input.value.trim();
    if (!message) return;

    // 사용자 메시지 UI 추가
    appendMessage('user', message);
    input.value = '';

    // 로딩 표시
    const loadingId = appendLoading();

    try {
        const response = await fetchAnthropic(message);
        removeLoading(loadingId);
        appendMessage('ai', response);
    } catch (error) {
        console.error('AI Error:', error);
        removeLoading(loadingId);
        appendMessage('ai', '죄송합니다. 서비스 연결 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    }
}

function appendMessage(role, text) {
    const container = document.getElementById('ai-chat-messages');
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${role}`;
    bubble.innerText = text;
    container.appendChild(bubble);
    container.scrollTop = container.scrollHeight;
    
    // 히스토리 업데이트 (최근 10개 유지)
    chatHistory.push({ role: role === 'ai' ? 'assistant' : 'user', content: text });
    if (chatHistory.length > 20) chatHistory.shift();
}

function appendLoading() {
    const container = document.getElementById('ai-chat-messages');
    const loading = document.createElement('div');
    const id = 'loading-' + Date.now();
    loading.id = id;
    loading.className = 'chat-bubble ai loading';
    loading.innerHTML = '<div class="dot"></div><div class="dot"></div><div class="dot"></div>';
    container.appendChild(loading);
    container.scrollTop = container.scrollHeight;
    return id;
}

function removeLoading(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

/**
 * Anthropic API 호출 (CORS 우회를 위해 직접 호출 방식 사용)
 * 참고: 실제 운영 환경에서는 CORS 이슈로 인해 백엔드 프록시가 필요합니다.
 */
async function fetchAnthropic(userMessage) {
    // Anthropic API는 브라우저에서 직접 호출 시 CORS 에러가 발생할 가능성이 매우 높습니다.
    // 하지만 사용자의 로컬 환경이나 특정 설정에서는 작동할 수 있도록 구현합니다.
    const url = 'https://api.anthropic.com/v1/messages';
    
    const messages = chatHistory.map(h => ({ role: h.role, content: h.content }));
    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'x-api-key': AI_CONFIG.API_KEY,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
            'anthropic-dangerous-direct-browser-access': 'true' // 브라우저 직접 접근 허용 (설정에 따라 비활성될 수 있음)
        },
        body: JSON.stringify({
            model: AI_CONFIG.MODEL,
            max_tokens: 1024,
            system: AI_CONFIG.SYSTEM_PROMPT,
            messages: messages
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'API request failed');
    }

    const data = await response.json();
    return data.content[0].text;
}
