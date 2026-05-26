// 👑 [최종 완결본] 6차원 온보딩 + 현재 시간 동기화 + 피드백 루프 탑재 엔진 (app.js)

// 1. 유저 프로필 상태 정의 (6가지 상세 정보)
let userProfile = { 
    gender: '', 
    age: '', 
    purpose: '', 
    companion: '', 
    transport: '', 
    tolerance: '' 
};

// DOM 엘리먼트 긁어오기
const onboardingScreen = document.getElementById('onboarding-screen');
const mainScreen = document.getElementById('main-screen');
const startBtn = document.getElementById('start-btn');
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const resetProfileBtn = document.getElementById('reset-profile-btn');

// 2. 6가지 사전 질문 제어 시스템
function setupOnboarding() {
    const groups = ['gender-group', 'age-group', 'purpose-group', 'companion-group', 'transport-group', 'tolerance-group'];
    
    groups.forEach(groupId => {
        const group = document.getElementById(groupId);
        if (!group) return; // 엘리먼트 안전 장치
        
        const buttons = group.querySelectorAll('.onboard-btn');
        
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                // 해당 그룹의 다른 버튼 스타일 초기화
                buttons.forEach(b => {
                    b.classList.remove('bg-emerald-500/20', 'border-emerald-500', 'text-emerald-400');
                    b.classList.add('bg-slate-800', 'border-slate-700', 'text-slate-100');
                });
                // 선택된 버튼 활성화 스타일 적용
                btn.classList.remove('bg-slate-800', 'border-slate-700');
                btn.classList.add('bg-emerald-500/20', 'border-emerald-500', 'text-emerald-400');
                
                // 데이터 수집
                const key = groupId.split('-')[0];
                userProfile[key] = btn.getAttribute('data-value');
                checkOnboardingComplete();
            });
        });
    });
}

// 6가지 문항을 모두 골랐는지 실시간 검사
function checkOnboardingComplete() {
    if (userProfile.gender && userProfile.age && userProfile.purpose && userProfile.companion && userProfile.transport && userProfile.tolerance) {
        startBtn.disabled = false;
        startBtn.innerText = "분석 엔진 기동하기! BOOM!";
        startBtn.className = "w-full py-4 rounded-xl bg-emerald-500 text-slate-950 font-black text-base cursor-pointer hover:bg-emerald-400 active:scale-95 transition-all duration-300 shadow-xl shadow-emerald-500/20 mb-2";
    }
}

// 화면 전환 및 재설정 리스너
startBtn.addEventListener('click', () => {
    onboardingScreen.classList.add('hidden');
    mainScreen.classList.remove('hidden');
});

resetProfileBtn.addEventListener('click', () => {
    mainScreen.classList.add('hidden');
    onboardingScreen.classList.remove('hidden');
});

// 3. 자연어 장소 매칭 엔진 (places.js 데이터와 대조)
function detectPlace(inputText) {
    const cleanText = inputText.replace(/\s+/g, '');
    for (const place of SEOUL_PLACES) {
        for (const keyword of place.keywords) {
            if (cleanText.includes(keyword)) {
                return place;
            }
        }
    }
    return null;
}

// 4. LocalStorage 기반 집단지성 피드백 제어 시스템
function saveFeedback(placeCode, feedbackText) {
    let allFeedbacks = JSON.parse(localStorage.getItem('boom_feedbacks')) || [];
    allFeedbacks.push({
        code: placeCode,
        feedback: feedbackText,
        timestamp: new Date().getTime()
    });
    localStorage.setItem('boom_feedbacks', JSON.stringify(allFeedbacks));
}

function getFeedbackHistory(placeCode) {
    if (!placeCode) return [];
    let allFeedbacks = JSON.parse(localStorage.getItem('boom_feedbacks')) || [];
    return allFeedbacks.filter(item => item.code === placeCode);
}

// 5. 대화창 렌더링 및 동적 UI 컴포넌트 관리
function appendMessage(sender, text, isSimulated = false, detectedBadge = null, placeCode = null) {
    const messageWrapper = document.createElement('div');
    messageWrapper.className = sender === 'user' ? 'flex flex-col items-end gap-1' : 'flex gap-3 max-w-[85%]';
    
    if (sender === 'user') {
        messageWrapper.innerHTML = `
            <div class="bg-emerald-500 text-slate-950 px-4 py-2.5 rounded-2xl rounded-tr-none text-sm font-medium shadow-sm max-w-[100%] break-all">
                ${text}
            </div>
            ${detectedBadge ? `<span class="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700/50 font-mono mt-1">📍 시스템 감지: ${detectedBadge}</span>` : ''}
        `;
        chatMessages.appendChild(messageWrapper);
    } else {
        messageWrapper.innerHTML = `
            <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center font-bold text-xs shrink-0 shadow">🤖</div>
            <div class="space-y-2 flex-1">
                <div class="chat-text bg-slate-800 border border-slate-700/60 px-4 py-2.5 rounded-2xl rounded-tl-none text-sm leading-relaxed shadow-sm whitespace-pre-line"></div>
                <div class="feedback-area flex gap-2 hidden"></div>
            </div>
        `;
        chatMessages.appendChild(messageWrapper);
        
        const textContainer = messageWrapper.querySelector('.chat-text');
        const feedbackArea = messageWrapper.querySelector('.feedback-area');
        
        if (isSimulated) {
            typeMessage(textContainer, text, () => {
                if (placeCode) renderFeedbackButtons(feedbackArea, placeCode);
            });
        } else {
            textContainer.innerText = text;
            if (placeCode) renderFeedbackButtons(feedbackArea, placeCode);
        }
    }
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 부드러운 글자 도도독 타이핑 효과
function typeMessage(element, text, callback = null) {
    element.classList.add('typing');
    let index = 0;
    function play() {
        if (index < text.length) {
            element.innerText += text[index];
            index++;
            chatMessages.scrollTop = chatMessages.scrollHeight;
            setTimeout(play, 12);
        } else {
            element.classList.remove('typing');
            if (callback) callback();
        }
    }
    play();
}

// 답변 완료 후 하단에 피드백 전송 칩 띄우기
function renderFeedbackButtons(container, placeCode) {
    container.classList.remove('hidden');
    container.innerHTML = `
        <button class="f-btn px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-rose-400 hover:border-rose-500 active:scale-95 transition-all" data-fb="생각보다 더 혼잡했음 🥵">생각보다 더 혼잡했어 🥵</button>
        <button class="f-btn px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-cyan-400 hover:border-cyan-500 active:scale-95 transition-all" data-fb="생각보다 여유로웠음 😎">생각보다 한산했어 😎</button>
    `;
    
    const buttons = container.querySelectorAll('.f-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const feedbackText = btn.getAttribute('data-fb');
            saveFeedback(placeCode, feedbackText);
            container.innerHTML = `<span class="text-[10px] text-slate-500 font-medium px-1">✓ 피드백 수집 완료! 다음 스케줄 검사 때 연계 분석할게.</span>`;
        });
    });
}

// 6. ⏰ 실시간 시계 동기화 및 서버 전송 파이프라인
async function handleSend() {
    const text = chatInput.value.trim();
    if (!text) return;
    
    const foundPlace = detectPlace(text);
    let badgeText = null;
    let placeCode = null;
    if (foundPlace) {
        badgeText = `${foundPlace.name} (${foundPlace.code})`;
        placeCode = foundPlace.code;
    }
    
    // 유저 말풍선 생성
    appendMessage('user', text, false, badgeText);
    chatInput.value = '';
    
    // 로컬 과거 이력 확보
    const historyData = getFeedbackHistory(placeCode);
    
    // 🔥 유저가 전송 버튼을 누른 바로 '지금 이 시점'의 시계 동기화 데이터 생성
    const now = new Date();
    const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    const currentTimeInfo = {
        date: now.toLocaleDateString('ko-KR'),
        dayOfWeek: days[now.getDay()],
        time: now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false }) // 예: 21:12
    };
    
    // 임시 로딩 메시지 출력
    appendMessage('bot', "실시간 타임라인 데이터 세그먼트 동기화 중... 💥", false);
    const allBotMessages = chatMessages.querySelectorAll('.chat-text');
    const loadingElement = allBotMessages[allBotMessages.length - 1];
    loadingElement.classList.add('typing');

    try {
        // 🚀 [⚠️본인의 클라우드플레어 Workers 주소 입력 확인]
        const WORKER_URL = "https://boom-ai-worker.sh031300.workers.dev

"; 
        
        const response = await fetch(WORKER_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message: text,
                place: foundPlace,
                userProfile: userProfile,
                history: historyData,
                currentTime: currentTimeInfo // 현재 요일 및 시각 바인딩
            })
        });

        const data = await response.json();
        loadingElement.classList.remove('typing');

        if (data.error) {
            loadingElement.innerHTML = `<span class="text-rose-400 font-semibold">❌ 에러 발생:</span> ${data.error}`;
            return;
        }
        
        // 로딩 말풍선 지우고 최종 타이핑 말풍선으로 변환 교체
        loadingElement.innerText = "";
        appendMessage('bot', data.reply, true, null, placeCode); 
        loadingElement.closest('.flex').remove();

    } catch (error) {
        loadingElement.classList.remove('typing');
        loadingElement.innerText = "서버 연결에 실패했어. Workers 배포 상태나 주소 오타를 확인해봐!";
    }
}

// 이벤트 이벤트 연결
sendBtn.addEventListener('click', handleSend);
chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleSend(); });

// 최초 기동
setupOnboarding();
