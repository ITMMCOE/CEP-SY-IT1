// Rule-based chatbot for emergency guidance
(function(){
  const storage = {
    get(k,fb){ try{ const v=localStorage.getItem(k); return v?JSON.parse(v):fb }catch(e){return fb} },
    set(k,v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} }
  };

  const keywords = {
    'heart attack':['chest pain','heart attack','severe chest','cardiac','tightness in chest','pressure chest','heart hurt','squeezing chest'],
    'bleeding':['bleed','bleeding','heavy bleed','blood loss','severe bleeding','cut','wound','gash','laceration'],
    'choking':['choke','choking','cant breathe','can\'t breathe','airway blocked','swallowed wrong','gagging'],
    'burns':['burn','burning','scald','scalding','hot oil','fire burn','steam burn','thermal injury'],
    'stroke':['stroke','slurred','face droop','arm weakness','speech difficulty','numbness','paralysis','confusion sudden'],
    'seizure':['seizure','convulsion','fit','shaking','epileptic','unconscious shaking'],
    'drowning':['drown','drowning','submerged','water rescue','not breathing water'],
    'poisoning':['poison','ingested','overdose','toxin','swallowed chemical','medication overdose','drug overdose'],
    'fracture':['broken bone','fracture','bone break','limb injury','deformed limb','can\'t move'],
    'allergic':['allergic reaction','allergy','anaphylaxis','swelling','hives','difficulty breathing allergy','epipen'],
    'unconscious':['unconscious','passed out','fainted','not responding','unresponsive','collapsed'],
    'diabetic':['low blood sugar','diabetic','hypoglycemia','hyperglycemia','insulin','dizzy diabetic'],
    'asthma':['asthma attack','can\'t breathe asthma','wheezing','inhaler','breathing difficulty'],
    'pregnancy':['pregnancy emergency','pregnant bleeding','contractions','baby coming','labor'],
    'headinjury':['head injury','head trauma','concussion','hit head','skull injury','unconscious fall']
  };

  // Structured, richer responses with steps and suggested quick actions
  const responses = {
    'heart attack': {
      title: '⚠️ Possible Heart Attack',
      intro: 'This is a life-threatening emergency. Follow these steps immediately:',
      steps: [
        '📞 Call emergency services immediately (Ambulance: 108)',
        '🪑 Help the person sit down and rest in a comfortable position',
        '👕 Loosen any tight clothing around neck and chest',
        '💊 If conscious and not allergic, give one adult aspirin (300mg) to chew',
        '👁️ Monitor breathing and pulse continuously',
        '🚫 Do NOT leave the person alone'
      ],
      actions: ['call-ambulance','nearest-hospital']
    },
    'bleeding':{
      title:'🩸 Severe Bleeding',
      intro:'Control bleeding immediately to prevent shock:',
      steps:[
        '🖐️ Apply firm, direct pressure with clean cloth or bandage',
        '⬆️ Elevate the injured area above heart level if possible',
        '➕ Add more cloth on top if bleeding soaks through (don\'t remove)',
        '⏱️ Maintain pressure for at least 10 minutes',
        '🚑 Call ambulance if bleeding doesn\'t stop or is arterial (spurting)'
      ],
      actions:['call-ambulance','nearest-hospital']
    },
    'choking':{
      title:'😮 Choking Emergency',
      intro:'Clear the airway immediately:',
      steps:[
        '❓ Ask "Are you choking?" - if they can speak, encourage coughing',
        '👋 If unable to breathe: 5 sharp back blows between shoulder blades',
        '🤲 Then 5 abdominal thrusts (Heimlich maneuver)',
        '🔄 Alternate between back blows and abdominal thrusts',
        '📞 Call emergency services if obstruction continues',
        '🚫 Never perform abdominal thrusts on pregnant women or infants'
      ],
      actions:['call-ambulance']
    },
    'burns':{
      title:'🔥 Burn Injury',
      intro:'Cool and protect the burn area:',
      steps:[
        '💧 Cool under running water for 10-20 minutes immediately',
        '💍 Remove jewelry and tight items (unless stuck to skin)',
        '🚫 Do NOT use ice, butter, or ointments',
        '🩹 Cover with sterile, non-stick dressing or clean cloth',
        '🏥 Seek immediate care for: large burns, face/hand burns, or severe pain'
      ],
      actions:['nearest-hospital']
    },
    'stroke':{
      title:'🧠 Stroke Alert - FAST',
      intro:'Time is critical! Use FAST test and call emergency:',
      steps:[
        '😊 Face: Ask person to smile - is one side drooping?',
        '🙌 Arm: Ask to raise both arms - does one drift down?',
        '🗣️ Speech: Ask to repeat a sentence - is speech slurred?',
        '⏰ Time: If ANY symptom present, call 108 IMMEDIATELY',
        '📝 Note time symptoms started (critical for treatment)',
        '🚫 Do NOT give food, drink, or medication'
      ],
      actions:['call-ambulance','nearest-hospital']
    },
    'seizure':{
      title:'⚡ Seizure First Aid',
      intro:'Keep the person safe during seizure:',
      steps:[
        '🛡️ Protect from injury - clear nearby objects',
        '🛏️ Cushion head with something soft',
        '⏱️ Time the seizure (call 108 if over 5 minutes)',
        '🚫 Do NOT restrain or put anything in mouth',
        '↩️ After seizure: place in recovery position, monitor breathing',
        '🏥 Seek medical care if: first seizure, injury, or breathing issues'
      ],
      actions:['call-ambulance','nearest-hospital']
    },
    'drowning':{
      title:'🌊 Drowning/Water Rescue',
      intro:'Immediate action required:',
      steps:[
        '🆘 Call emergency services immediately',
        '✅ Check airway, breathing, and circulation',
        '🫁 If not breathing: start CPR immediately',
        '🔥 Keep person warm with blankets',
        '🏥 Even if conscious, seek immediate medical evaluation',
        '📞 Continue CPR until help arrives or person recovers'
      ],
      actions:['call-ambulance']
    },
    'poisoning':{
      title:'☠️ Poisoning/Overdose',
      intro:'Act quickly - every second counts:',
      steps:[
        '📞 Call Poison Control (1800-180-1130) and ambulance (108)',
        '📦 Identify substance and bring container/packaging',
        '🚫 Do NOT induce vomiting unless instructed',
        '👁️ Monitor consciousness and breathing',
        '↩️ If unconscious: recovery position, check breathing',
        '🏥 Seek immediate emergency care'
      ],
      actions:['call-ambulance']
    },
    'fracture':{
      title:'🦴 Fracture/Broken Bone',
      intro:'Immobilize and seek medical care:',
      steps:[
        '🚫 Do NOT try to realign the bone',
        '❄️ Apply ice pack wrapped in cloth (not directly on skin)',
        '🪵 Immobilize the area with splint or padding',
        '⬆️ Elevate if possible to reduce swelling',
        '💊 Manage pain (avoid giving food/drink if surgery may be needed)',
        '🏥 Seek immediate medical care for proper treatment'
      ],
      actions:['nearest-hospital','call-ambulance']
    },
    'allergic':{
      title:'🐝 Severe Allergic Reaction',
      intro:'Anaphylaxis can be fatal - act immediately:',
      steps:[
        '💉 Use EpiPen/auto-injector if available (inject into thigh)',
        '📞 Call ambulance (108) immediately',
        '🛏️ Lay person flat (unless breathing difficulty - then sit up)',
        '⏱️ Second dose of epinephrine may be needed after 5-15 minutes',
        '🚑 Even if symptoms improve, emergency care is essential',
        '👁️ Monitor breathing and consciousness continuously'
      ],
      actions:['call-ambulance','nearest-hospital']
    },
    'unconscious':{
      title:'😴 Unconscious Person',
      intro:'Check responsiveness and breathing:',
      steps:[
        '📣 Check response: tap shoulders and shout',
        '👃 Check breathing: look, listen, feel for 10 seconds',
        '📞 Call emergency services (108) immediately',
        '🫁 If not breathing: start CPR',
        '↩️ If breathing: recovery position (on side)',
        '👁️ Monitor breathing until help arrives'
      ],
      actions:['call-ambulance']
    },
    'diabetic':{
      title:'🍬 Diabetic Emergency',
      intro:'Low blood sugar can be life-threatening:',
      steps:[
        '🍭 If conscious: give sugary drink or glucose tablets',
        '⏱️ Wait 10-15 minutes and recheck symptoms',
        '🍞 If improved: give complex carbs (bread, crackers)',
        '😴 If unconscious: recovery position, call 108',
        '🚫 Do NOT give food/drink to unconscious person',
        '💉 Severe cases may need glucagon injection'
      ],
      actions:['call-ambulance','nearest-hospital']
    },
    'asthma':{
      title:'🫁 Asthma Attack',
      intro:'Help restore normal breathing:',
      steps:[
        '🪑 Sit person upright, loosen tight clothing',
        '💨 Use rescue inhaler (4-6 puffs with spacer)',
        '🧘 Encourage slow, deep breathing - stay calm',
        '⏱️ If no improvement after 15 minutes: repeat inhaler',
        '📞 Call 108 if severe or no improvement',
        '🚑 Seek emergency care if lips turn blue or extreme difficulty breathing'
      ],
      actions:['call-ambulance','nearest-hospital']
    },
    'pregnancy':{
      title:'🤰 Pregnancy Emergency',
      intro:'Immediate obstetric care needed:',
      steps:[
        '📞 Call ambulance (108) immediately',
        '🛏️ Keep person lying on left side',
        '⏱️ If labor: time contractions',
        '🚫 Do NOT try to delay or stop delivery',
        '🧼 If baby coming: prepare clean area and towels',
        '🏥 Transport to hospital immediately'
      ],
      actions:['call-ambulance','nearest-hospital']
    },
    'headinjury':{
      title:'🤕 Head Injury',
      intro:'Head injuries can be serious - monitor carefully:',
      steps:[
        '🧊 Apply ice pack to reduce swelling',
        '🛏️ Keep person still and calm',
        '👁️ Watch for: confusion, vomiting, unequal pupils, seizures',
        '😴 If unconscious or severe: call 108 immediately',
        '🚫 Do NOT move person if neck injury suspected',
        '🏥 Seek medical evaluation for all significant head injuries'
      ],
      actions:['call-ambulance','nearest-hospital']
    },
    'default':{
      title:'🆘 Emergency Assistance',
      intro:'If this is a life-threatening emergency, call 108 immediately. I can guide you with first-aid steps or help locate nearby medical facilities.',
      steps:[
        '📞 For immediate danger: Call Ambulance (108)',
        '👮 For police emergency: Call 100',
        '🚒 For fire emergency: Call 101',
        '🏥 I can help you find the nearest hospital',
        '💬 Describe your emergency for specific guidance'
      ],
      actions:['nearest-hospital','call-ambulance']
    }
  };

  // Support both floating panel (chat-panel) and full-page chat (chat-page)
  const panel = document.getElementById('chat-panel') || document.querySelector('.chat-page') || null;
  const messages = document.getElementById('chat-messages');
  const input = document.getElementById('chat-input-field');
  const badge = document.getElementById('chat-badge');

  console.log('[Chatbot] Initializing...');
  console.log('[Chatbot] Messages element:', messages ? 'Found' : 'NOT FOUND');
  console.log('[Chatbot] Input element:', input ? 'Found' : 'NOT FOUND');
  console.log('[Chatbot] Send button:', document.getElementById('chat-send') ? 'Found' : 'NOT FOUND');

  let history = storage.get('chatHistory', []);
  console.log('[Chatbot] Loaded history:', history.length, 'messages');
  function escapeHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  function renderHistory(){
    if(!messages) return;
    messages.innerHTML = history.map(h=>{
      if(h.html){ return `<li class="${h.sender}"><div class="bubble">${h.html}<div class="ts">${new Date(h.ts).toLocaleTimeString()}</div></div></li>` }
      return `<li class="${h.sender}"><div class="bubble">${escapeHtml(h.text)}<div class="ts">${new Date(h.ts).toLocaleTimeString()}</div></div></li>`
    }).join('');
    messages.scrollTop = messages.scrollHeight;
  }
  renderHistory();

  // Add welcome message if chat is empty
  if(messages && history.length === 0){
    console.log('[Chatbot] Adding welcome message');
    setTimeout(() => {
      botReply('default');
    }, 500);
  } else {
    console.log('[Chatbot] History exists, skipping welcome message');
  }

  function pushMessage(sender, text){ history.push({sender,text,ts:new Date().toISOString()}); storage.set('chatHistory', history); renderHistory(); }

  function formatResponse(intent){
    const res = responses[intent] || responses['default'];
    const parts = [];
    if(res.title) parts.push(`<strong style="font-size: 1.1em; display: block; margin-bottom: 8px;">${escapeHtml(res.title)}</strong>`);
    if(res.intro) parts.push(`<div style="margin-bottom: 8px;">${escapeHtml(res.intro)}</div>`);
    if(res.steps && res.steps.length){ 
      parts.push('<ol style="margin: 8px 0; padding-left: 20px;">' + 
        res.steps.map(s=>`<li style="margin: 4px 0;">${escapeHtml(s)}</li>`).join('') + 
        '</ol>'); 
    }
    if(res.actions && res.actions.length){
      const map = { 
        'call-ambulance':'📞 Call Ambulance (108)', 
        'nearest-hospital':'🏥 Find Nearest Hospital', 
        'first-aid':'🩹 First Aid Guide',
        'call-police':'👮 Call Police (100)',
        'call-fire':'🚒 Call Fire (101)'
      };
      const btns = res.actions.map(a=>
        `<button class="suggest-btn" data-action="${a}" style="background: ${a.includes('call') ? '#ef4444' : '#3b82f6'}; color: white; border: none; padding: 8px 16px; margin: 4px; border-radius: 6px; cursor: pointer; font-weight: 600;">${escapeHtml(map[a]||a)}</button>`
      ).join('');
      parts.push(`<div class="suggested" style="margin-top: 12px;">${btns}</div>`);
    }
    return parts.join('');
  }

  function botReply(content){ // content can be intent key or plain text message
    if(!messages){
      // store textual fallback if messages div doesn't exist
      if(responses[content]){
        return pushMessage('bot', responses[content].intro || 'I can help.');
      }
      return pushMessage('bot', content);
    }
    
    const typing = document.createElement('li'); 
    typing.className='bot typing'; 
    typing.innerHTML = '<div class="bubble">Typing…</div>'; 
    messages.appendChild(typing); 
    messages.scrollTop = messages.scrollHeight;
    
    setTimeout(()=>{
      typing.remove();
      
      // Check if content is an intent key that exists in responses
      if(responses[content]){
        const html = formatResponse(content);
        history.push({sender:'bot', text:'', html, ts:new Date().toISOString()}); 
        storage.set('chatHistory', history); 
        renderHistory();
      } else {
        // It's a plain text message
        pushMessage('bot', content);
      }
    }, 600 + Math.random()*600);
  }

  function findIntent(text){ const t = (text||'').toLowerCase(); for(const intent in keywords){ for(const kw of keywords[intent]) if(t.includes(kw)) return intent; } return null; }

  function handleSend(){
    const t = input?.value?.trim(); 
    if(!t) return; 
    
    console.log('[Chatbot] User input:', t);
    pushMessage('user', t); 
    if(input) input.value=''; 
    if(badge) badge.classList.add('hidden');
    
    const intent = findIntent(t);
    console.log('[Chatbot] Matched intent:', intent || 'none');
    
    if(intent){ 
      console.log('[Chatbot] Sending intent response:', intent);
      botReply(intent); 
    } else if(t.match(/hospital|nearest/i)){
      console.log('[Chatbot] Hospital query detected');
      botReply('default'); 
      if(window.EmergencyMap) window.EmergencyMap.filterAndOpen('hospital');
    } else { 
      console.log('[Chatbot] Using default response');
      botReply('default'); 
    }
  }

  const sendBtn = document.getElementById('chat-send');
  if(sendBtn){
    console.log('[Chatbot] Send button listener attached');
    sendBtn.addEventListener('click', handleSend);
  } else {
    console.error('[Chatbot] Send button not found!');
  }

  // Add Enter key support
  if(input){
    console.log('[Chatbot] Enter key listener attached');
    input.addEventListener('keypress', (e) => {
      if(e.key === 'Enter'){
        e.preventDefault();
        handleSend();
      }
    });
  } else {
    console.error('[Chatbot] Input field not found!');
  }

  const clearBtn = document.getElementById('chat-clear'); if(clearBtn) clearBtn.addEventListener('click', ()=>{ if(confirm('Clear chat history?')){ history=[]; storage.set('chatHistory', history); renderHistory(); } });
  const closeBtn = document.getElementById('chat-close'); if(closeBtn) closeBtn.addEventListener('click', ()=>{ if(panel) panel.classList.add('hidden'); });

  // floating toggle badge when unseen messages (only if badge exists)
  if(badge) window.addEventListener('focus', ()=> badge.classList.add('hidden'));

  // handle suggested quick-action button clicks inside messages
  if(messages){
    messages.addEventListener('click', (ev)=>{
      const btn = ev.target.closest('.suggest-btn'); if(!btn) return;
      const action = btn.dataset.action;
      if(action === 'call-ambulance'){
        pushMessage('user','Call Ambulance');
        // trigger call
        window.location.href = 'tel:108';
      } else if(action === 'nearest-hospital'){
        pushMessage('user','Find nearest hospital');
        if(window.EmergencyMap) window.EmergencyMap.filterAndOpen('hospital');
      } else if(action === 'first-aid'){
        pushMessage('user','First aid'); botReply('default');
      }
    });
  }

  // expose for external quick actions
  window.ChatBot = { pushMessage, botReply };
})();
