// 👑 [최종 마스터 버전] LocalStorage 피드백 루프 반영 프론트엔드 엔진 (app.js)

let userProfile = { gender: '', age: '', purpose: '' };

const onboardingScreen = document.getElementById('onboarding-screen');
const mainScreen = document.getElementById('main-screen');
const startBtn = document.getElementById('start-btn');
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const resetProfileBtn = document.getElementById('reset-profile-btn');

// 1️⃣ 온보딩 시스템
function setupOnboarding() {
    const groups = ['gender-group', 'age-group', 'purpose-group'];
    groups.forEach(groupId => {
        const group = document.getElementById(groupId);
        const buttons = group.querySelectorAll('.onboard-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                buttons.forEach(b => {
                    b.classList.remove('bg-emerald-500/20', 'border-emerald-500', 'text-emerald-400');
                    b.classList.add('bg-slate-800', 'border-slate-700', 'text-slate-100');
                });
                btn.classList.remove('bg-slate-800', 'border-slate-700');
                btn.classList.add('bg-emerald-500/20', 'border-emerald-500', 'text-emerald-400');
                
                const key = groupId.split('-')[0];
                userProfile[key] = btn.getAttribute('data-value');
                checkOnboardingComplete();
            });
        });
    });
}

function checkOnboardingComplete() {
    if (userProfile.gender && userProfile.age && userProfile.purpose) {
        startBtn.disabled = false;
        startBtn.innerText = "BOOM! 시작하기";
        startBtn.className = "w-full py-4 rounded-xl bg-emerald-500 text-slate-950 font-black text-base cursor-pointer hover:bg-emerald-400 active:scale-95 transition-all duration-300 shadow-xl shadow-emerald-500/20 mb-4";
    }
}

startBtn.addEventListener('click', () => {
    onboardingScreen.classList.add('hidden');
    mainScreen.classList.remove('hidden');
});

resetProfileBtn.addEventListener('click', () => {
    mainScreen.classList.add('hidden');
    onboardingScreen.classList.remove('hidden');
});

// 2️⃣ 자연어 장소 감지 엔진
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

// 3️⃣ 💾 [4단계 핵심] LocalStorage 집단지성 피드백 제어 함수
function saveFeedback(placeCode, feedbackText) {
    // 기존에 저장된 피드백 리스트 가져오기 (없으면 빈 배열)
    let allFeedbacks = JSON.parse(localStorage.getItem('boom_feedbacks')) || [];
    
    // 새 피드백 데이터 객체 추가
    allFeedbacks.push({
        code: placeCode,
        feedback: feedbackText,
        timestamp: new Date().getTime()
    });
    
    // 로컬스토리지에 다시 쏙 저장
    localStorage.setItem('boom_feedbacks', JSON.stringify(allFeedbacks));
}

function getFeedbackHistory(placeCode) {
    if (!placeCode) return [];
    let allFeedbacks = JSON.parse(localStorage.getItem('boom_feedbacks')) || [];
    // 현재 가려는 장소 코드(예: POI007)와 일치하는 과거 기록만 필터링해서 반환
    return allFeedbacks.filter(item => item.code === placeCode);
}


// 4️⃣ UI 렌더링 및 동적 피드백 버튼 생성
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
                // 타이핑 연출이 완전히 끝나면 피드백 버튼들을 서서히 보여줍니다.
                if (placeCode) {
                    renderFeedbackButtons(feedbackArea, placeCode);
                }
            });
        } else {
            textContainer.innerText = text;
            if (placeCode) renderFeedbackButtons(feedbackArea, placeCode);
        }
    }
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 타이핑 함수 확장 (끝났을 때 실행할 콜백 기능 추가)
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
            if (callback) callback(); // 타이핑 종료 후 피드백 버튼 노출
        }
    }
    play();
}

// 칩 모양 피드백 버튼을 화면에 직접 만들어주는 함수
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
            // 1. 로컬스토리지에 저장
            saveFeedback(placeCode, feedbackText);
            
            // 2. 피드백 완료 후 연출
            container.innerHTML = `<span class="text-[10px] text-slate-500 font-medium px-1">✓ 데이터 피드백이 기록되었어! 다음 추천에 반영할게.</span>`;
        });
    });
}

// 5️⃣ 실시간 서버 전송 로직
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
    
    appendMessage('user', text, false, badgeText);
    chatInput.value = '';
    
    // 💾 로컬스토리지에서 이 장소에 대한 과거 피드백 기록이 있는지 긁어오기
    const historyData = getFeedbackHistory(placeCode);
    
    appendMessage('bot', "실시간 데이터와 유저 기록을 교차 분석 중이야...", false);
    
    const allBotMessages = chatMessages.querySelectorAll('.chat-text');
    const loadingElement = allBotMessages[allBotMessages.length - 1];
    loadingElement.classList.add('typing');

    try {
        // 🚀 [⚠️본인 서버 주소 입력⚠️]
        const WORKER_URL = "https://boom-gem.sh031300.workers.dev"; 
        
        const response = await fetch(WORKER_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message: text,
                place: foundPlace,
                userProfile: userProfile,
                history: historyData // 💥 과거 피드백 배열을 서버로 토스!
            })
        });

        const data = await response.json();
        loadingElement.classList.remove('typing');

        if (data.error) {
            loadingElement.innerHTML = `<span class="text-rose-400 font-semibold">❌ 에러:</span> ${data.error}`;
            return;
        }
        
        loadingElement.innerText = "";
        // ★ 답변이 끝나면 버튼이 생기도록 장소 코드를 함께 넘겨줍니다.
        appendMessage('bot', data.reply, true, null, placeCode); 
        // 기존 임시 로딩 말풍선 엘리먼트는 불필요하므로 화면에서 삭제
        loadingElement.closest('.flex').remove();

    } catch (error) {
        loadingElement.classList.remove('typing');
        loadingElement.innerText = "서버와 연결하지 못했어. 주소나 인터넷 상태를 확인해줘!";
    }
}

sendBtn.addEventListener('click', handleSend);
chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleSend(); });
setupOnboarding();
