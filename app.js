const $=s=>document.querySelector(s);const $$=s=>[...document.querySelectorAll(s)];let wheelRotation=0;let wheelItems=[];let lastDaily=null;
function secureIndex(n){if(!Number.isSafeInteger(n)||n<1)throw Error('Ungültige Auswahl.');const range=0x100000000;const limit=Math.floor(range/n)*n;const a=new Uint32Array(1);let x;do{crypto.getRandomValues(a);x=a[0]}while(x>=limit);return x%n}
function pick(arr){if(!arr.length)throw Error('Bitte gib mindestens eine Möglichkeit ein.');return arr[secureIndex(arr.length)]}
function resultHTML(value,label='DEIN ERGEBNIS'){return '<div class="result pop"><div class="result-label">'+label+'</div><div class="result-value">'+escapeHTML(String(value))+'</div></div>'}
function escapeHTML(s){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function panel(title,sub,content){$('#workspace').innerHTML='<div class="tool-panel"><div class="panel-head"><div><div class="eyebrow">RANDOM TOOL</div><h2>'+title+'</h2><p>'+sub+'</p></div><button class="close-panel" id="closePanel">✕</button></div>'+content+'</div>';$('#closePanel').onclick=()=>{$('#workspace').innerHTML='<div class="workspace-empty"><span class="empty-orb">✳</span><h2>Dein Zufallsmoment wartet.</h2><p>Wähle oben ein Tool und leg los.</p></div>';$$('.tool-card').forEach(x=>x.classList.remove('active'))};$('#workspace').scrollIntoView({behavior:'smooth',block:'center'})}
function openTool(name){$$('.tool-card').forEach(x=>x.classList.toggle('active',x.dataset.tool===name));if(name==='wheel')wheelTool();if(name==='yesno')yesNoTool();if(name==='generator')generatorTool();if(name==='challenge')challengeTool();if(name==='thisthat')thisThatTool()}
function wheelTool(){
  panel('Random Wheel','Füge deine Möglichkeiten ein und lass den Zufall entscheiden.',`<div class="wheel-layout"><div class="wheel-wrap"><div class="wheel-pointer"></div><div class="wheel" id="wheel"></div></div><div><label class="field-label" for="wheelOptions">DEINE OPTIONEN · EINE PRO ZEILE</label><textarea class="text-area" id="wheelOptions">Pizza
Burger
Sushi
Pasta</textarea><div class="actions"><button class="action-btn" id="spin">Rad drehen</button><button class="secondary-btn" id="shuffleWheel">Beispiele laden</button></div><div id="wheelResult"></div></div></div>`);
  const colors=['#a78bfa','#67c9d8','#d68bd9','#8271bd','#bd9af5','#65b8a9'];
  let items=$('#wheelOptions').value.split(/\n/).map(x=>x.trim()).filter(Boolean);
  let wheelBusy=false;
  let rotation=0;
  const mod=(n,m)=>((n%m)+m)%m;
  function paintWheel(){
    const count=items.length;
    if(!count){$('#wheel').style.background='#282238';return}
    const stops=items.map((_,i)=>colors[i%colors.length]+' '+(i*360/count)+'deg '+((i+1)*360/count)+'deg');
    $('#wheel').style.background='conic-gradient('+stops.join(',')+')';
  }
  function updateButton(){
    $('#spin').disabled=items.length<2||wheelBusy;
  }
  function readOptions(){
    items=$('#wheelOptions').value.split(/\n/).map(x=>x.trim()).filter(Boolean);
    rotation=0;
    const wheel=$('#wheel');
    wheel.style.transition='none';
    wheel.style.transform='rotate(0deg)';
    $('#wheelResult').innerHTML='';
    paintWheel();
    updateButton();
  }
  $('#wheelOptions').addEventListener('input',readOptions);
  $('#shuffleWheel').onclick=()=>{$('#wheelOptions').value='Kaffee\nTee\nWasser\nSaft';readOptions()};
  $('#spin').onclick=()=>{
    if(items.length<2||wheelBusy)return;
    const idx=secureIndex(items.length);
    const segmentAngle=360/items.length;
    const targetAngle=mod(360-(idx*segmentAngle+segmentAngle/2),360);
    const extra=mod(targetAngle-mod(rotation,360),360);
    const target=rotation+360*5+extra;
    wheelBusy=true;updateButton();
    const wheel=$('#wheel');
    wheel.style.transition='none';
    wheel.style.transform='rotate('+rotation+'deg)';
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      wheel.style.transition='transform 3.6s cubic-bezier(.12,.75,.12,1)';
      wheel.style.transform='rotate('+target+'deg)';
    }));
    rotation=target;
    let finished=false;
    const finish=event=>{
      if(finished||(event&&event.target!==wheel))return;
      finished=true;
      wheel.removeEventListener('transitionend',finish);
      $('#wheelResult').innerHTML=resultHTML(items[idx]);
      wheelBusy=false;updateButton();
    };
    wheel.addEventListener('transitionend',finish);
    window.setTimeout(()=>finish(),3900);
  };
  paintWheel();updateButton();
}
function yesNoTool(){panel('Yes or No','Denk an deine Frage. RANDOM gibt dir eine zufällige Antwort.',`<label class="field-label" for="question">DEINE FRAGE (OPTIONAL)</label><input class="text-input" id="question" placeholder="Soll ich es machen?"><div class="actions"><button class="action-btn" id="ask">Entscheiden</button></div><div id="yesResult"></div>`);$('#ask').onclick=()=>{$('#yesResult').innerHTML=resultHTML(pick(['YES','NO']), 'DIE ANTWORT')}}
function generatorTool(){panel('Random Generator','Wähle eine Kategorie und lass etwas zufällig generieren.',`<label class="field-label" for="genType">KATEGORIE</label><select class="select-input" id="genType"><option value="number">Zufallszahl</option><option value="color">Farbe</option><option value="letter">Buchstabe</option><option value="coin">Münzwurf</option><option value="team">Team (Rot / Blau)</option></select><div id="numberFields"><label class="field-label">VON</label><input class="number-input" id="min" type="number" value="1"><label class="field-label">BIS</label><input class="number-input" id="max" type="number" value="100"></div><div class="actions"><button class="action-btn" id="generate">Generieren</button></div><div id="genResult"></div>`);$('#genType').onchange=()=>$('#numberFields').style.display=$('#genType').value==='number'?'block':'none';$('#generate').onclick=()=>{let v;const t=$('#genType').value;if(t==='number'){let a=Number($('#min').value),b=Number($('#max').value);if(!Number.isSafeInteger(a)||!Number.isSafeInteger(b)||b<a||b-a>1000000000){$('#genResult').innerHTML=resultHTML('Bitte gültigen Bereich eingeben','HINWEIS');return}v=a+secureIndex(b-a+1)}if(t==='color')v=pick(['Violett','#8B5CF6','Türkis','#2DD4BF','Koralle','#FB7185','Indigo','#6366F1','Gold','#FBBF24']);if(t==='letter')v=pick('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''));if(t==='coin')v=pick(['Kopf','Zahl']);if(t==='team')v=pick(['Team Rot','Team Blau']);$('#genResult').innerHTML=resultHTML(v)}}
const challenges=['Mach heute einen kleinen Spaziergang an einem neuen Ort.','Lerne ein neues Wort in einer anderen Sprache.','Zeichne etwas in nur 60 Sekunden.','Höre einen Song, den du noch nicht kennst.','Schreibe drei Dinge auf, die heute gut liefen.','Probiere eine neue Kombination aus deinem Lieblingsessen.','Räume eine kleine Ecke auf, die du oft übersiehst.','Mache jemandem ein ehrliches Kompliment.','Fotografiere heute ein interessantes Detail.','Lies zehn Minuten etwas, das dich interessiert.','Erfinde einen Namen für einen imaginären Planeten.','Lerne einen kleinen Trick oder eine neue Fähigkeit.'];
function challengeTool(){panel('Daily Challenge','Eine neue kleine Aufgabe. Jeden Tag eine andere Auswahl.',`<div class="result"><div class="result-label">DEINE AUFGABE FÜR HEUTE</div><div class="result-value" id="dailyTask" style="font-size:23px;line-height:1.35">Bereit?</div></div><div class="actions"><button class="action-btn" id="newChallenge">Challenge ziehen</button></div><p style="font-size:11px;color:var(--muted);margin-top:15px">Die Tagesauswahl wird lokal in deinem Browser gespeichert.</p>`);const today=new Date().toDateString();const saved=localStorage.getItem('random-daily');let data;try{data=JSON.parse(saved)}catch{}if(data&&data.date===today)$('#dailyTask').textContent=data.task;$('#newChallenge').onclick=()=>{const task=pick(challenges);localStorage.setItem('random-daily',JSON.stringify({date:today,task}));$('#dailyTask').textContent=task;$('#dailyTask').parentElement.classList.remove('pop');void $('#dailyTask').parentElement.offsetWidth;$('#dailyTask').parentElement.classList.add('pop')}}
function thisThatTool(){panel('This or That','Gib zwei Möglichkeiten ein. RANDOM wählt eine davon.',`<div class="choice-row"><input class="text-input" id="choiceA" placeholder="Option A" value="Meer"><input class="text-input" id="choiceB" placeholder="Option B" value="Berge"></div><div class="actions"><button class="action-btn" id="choose">Für mich wählen</button></div><div id="choiceResult"></div>`);$('#choose').onclick=()=>{const a=$('#choiceA').value.trim(),b=$('#choiceB').value.trim();if(!a||!b){$('#choiceResult').innerHTML=resultHTML('Bitte beide Optionen ausfüllen','HINWEIS');return}const chosen=pick([a,b]);$('#choiceResult').innerHTML=resultHTML(chosen,'RANDOM WÄHLT')}}
$$('.tool-card').forEach(card=>card.addEventListener('click',()=>openTool(card.dataset.tool)));
