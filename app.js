const $=s=>document.querySelector(s);const $$=s=>[...document.querySelectorAll(s)];let wheelRotation=0;let wheelItems=[];let lastDaily=null;
function secureIndex(n){if(!Number.isSafeInteger(n)||n<1)throw Error('Ungültige Auswahl.');const range=0x100000000;const limit=Math.floor(range/n)*n;const a=new Uint32Array(1);let x;do{crypto.getRandomValues(a);x=a[0]}while(x>=limit);return x%n}
function pick(arr){if(!arr.length)throw Error('Bitte gib mindestens eine Möglichkeit ein.');return arr[secureIndex(arr.length)]}
function resultHTML(value,label='DEIN ERGEBNIS'){return '<div class="result pop"><div class="result-label">'+label+'</div><div class="result-value">'+escapeHTML(String(value))+'</div></div>'}
function escapeHTML(s){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function panel(title,sub,content){$('#workspace').innerHTML='<div class="tool-panel"><div class="panel-head"><div><div class="eyebrow">RANDOM TOOL</div><h2>'+title+'</h2><p>'+sub+'</p></div><button class="close-panel" id="closePanel">✕</button></div>'+content+'</div>';$('#closePanel').onclick=()=>{$('#workspace').innerHTML='<div class="workspace-empty"><span class="empty-orb">✳</span><h2>Dein Zufallsmoment wartet.</h2><p>Wähle oben ein Tool und leg los.</p></div>';$$('.tool-card').forEach(x=>x.classList.remove('active'))};$('#workspace').scrollIntoView({behavior:'smooth',block:'center'})}
function openTool(name){$$('.tool-card').forEach(x=>x.classList.toggle('active',x.dataset.tool===name));if(name==='wheel')wheelTool();if(name==='yesno')yesNoTool();if(name==='generator')generatorTool();if(name==='challenge')challengeTool();if(name==='thisthat')thisThatTool()}
function wheelTool(){
  panel('Random Wheel','Füge deine Möglichkeiten ein und bestimme selbst, wie wahrscheinlich sie gezogen werden.',`<div class="wheel-layout"><div class="wheel-wrap"><div class="wheel-pointer"></div><div class="wheel" id="wheel"></div></div><div><label class="field-label" for="wheelOptions">DEINE OPTIONEN · EINE PRO ZEILE</label><textarea class="text-area" id="wheelOptions">Pizza\nBurger\nSushi\nPasta</textarea><div class="probability-box"><div class="probability-head"><strong>Wahrscheinlichkeiten</strong><span class="tool-number">MAX. 100 %</span></div><p class="probability-help">Verteile die 100 % auf deine Optionen. Kein Wert kann die Gesamtsumme über 100 % bringen.</p><div id="probabilityRows"></div><div class="probability-total"><span>Gesamt</span><strong id="probabilityTotal">100 %</strong></div><div class="probability-status" id="probabilityStatus">Alle 100 % sind verteilt.</div></div><div class="actions"><button class="action-btn" id="spin">Rad drehen</button><button class="secondary-btn" id="shuffleWheel">Beispiele laden</button></div><div id="wheelResult"></div></div></div>`);
  const colors=['#a78bfa','#67c9d8','#d68bd9','#8271bd','#bd9af5','#65b8a9'];
  let items=$('#wheelOptions').value.split(/\n/).map(x=>x.trim()).filter(Boolean);
  let weights=items.map(()=>Math.floor(100/items.length));
  weights[weights.length-1]+=100-weights.reduce((a,b)=>a+b,0);
  let wheelBusy=false;
  function total(){return weights.reduce((a,b)=>a+b,0)}
  function paintWheel(){
    let cursor=0;const stops=items.map((item,i)=>{const start=cursor;cursor+=weights[i]*3.6;return colors[i%colors.length]+' '+start+'deg '+cursor+'deg'});
    $('#wheel').style.background='conic-gradient('+stops.join(',')+')';
  }
  function renderWeights(){
    const sum=total();
    $('#probabilityRows').innerHTML=items.map((item,i)=>{
      const max=Math.max(0,100-(sum-weights[i]));
      return '<div class="probability-row"><span class="probability-name" title="'+escapeHTML(item)+'">'+escapeHTML(item)+'</span><input class="probability-slider" type="range" min="0" max="'+max+'" step="1" value="'+weights[i]+'" data-index="'+i+'" aria-label="Wahrscheinlichkeit für '+escapeHTML(item)+'"><span class="probability-value">'+weights[i]+' %</span></div>';
    }).join('');
    $('#probabilityTotal').textContent=sum+' %';
    $('#probabilityTotal').className=sum===100?'complete':'incomplete';
    $('#probabilityStatus').textContent=sum===100?'Alle 100 % sind verteilt.':(100-sum)+' % noch zu verteilen.';
    $('#spin').disabled=sum!==100||items.length<2||weights.every(x=>x===0)||wheelBusy;
    $('#probabilityRows').querySelectorAll('input').forEach(input=>input.addEventListener('input',()=>{
      const i=Number(input.dataset.index);
      const otherTotal=sum-weights[i];
      weights[i]=Math.min(Number(input.value),100-otherTotal);
      renderWeights();paintWheel();
    }));
    paintWheel();
  }
  function readOptions(){
    const next=$('#wheelOptions').value.split(/\n/).map(x=>x.trim()).filter(Boolean);
    if(next.length<2){$('#probabilityRows').innerHTML='<p class="probability-help">Bitte mindestens zwei Optionen eingeben.</p>';$('#probabilityTotal').textContent='—';$('#probabilityStatus').textContent='';$('#spin').disabled=true;return}
    items=next;
    weights=items.map(()=>Math.floor(100/items.length));
    weights[weights.length-1]+=100-weights.reduce((a,b)=>a+b,0);
    $('#wheelResult').innerHTML='';
    renderWeights();
  }
  $('#wheelOptions').addEventListener('change',readOptions);
  $('#shuffleWheel').onclick=()=>{$('#wheelOptions').value='Kaffee\nTee\nWasser\nSaft';readOptions()};
  $('#spin').onclick=()=>{
    if(total()!==100||items.length<2||wheelBusy)return;
    const ticket=secureIndex(100);
    let cumulative=0,idx=-1;
    for(let i=0;i<weights.length;i++){cumulative+=weights[i];if(ticket<cumulative){idx=i;break}}
    if(idx<0)return;
    const startAngle=weights.slice(0,idx).reduce((a,b)=>a+b,0)*3.6;
    const segmentAngle=weights[idx]*3.6;
    const target=360*5+(360-(startAngle+segmentAngle/2));
    wheelRotation+=target;wheelBusy=true;renderWeights();
    $('#wheel').style.transform='rotate('+wheelRotation+'deg)';
    setTimeout(()=>{$('#wheelResult').innerHTML=resultHTML(items[idx]+' · '+weights[idx]+' %');wheelBusy=false;renderWeights()},3700);
  };
  renderWeights();
}
function yesNoTool(){panel('Yes or No','Denk an deine Frage. RANDOM gibt dir eine zufällige Antwort.',`<label class="field-label" for="question">DEINE FRAGE (OPTIONAL)</label><input class="text-input" id="question" placeholder="Soll ich es machen?"><div class="actions"><button class="action-btn" id="ask">Entscheiden</button></div><div id="yesResult"></div>`);$('#ask').onclick=()=>{$('#yesResult').innerHTML=resultHTML(pick(['YES','NO']), 'DIE ANTWORT')}}
function generatorTool(){panel('Random Generator','Wähle eine Kategorie und lass etwas zufällig generieren.',`<label class="field-label" for="genType">KATEGORIE</label><select class="select-input" id="genType"><option value="number">Zufallszahl</option><option value="color">Farbe</option><option value="letter">Buchstabe</option><option value="coin">Münzwurf</option><option value="team">Team (Rot / Blau)</option></select><div id="numberFields"><label class="field-label">VON</label><input class="number-input" id="min" type="number" value="1"><label class="field-label">BIS</label><input class="number-input" id="max" type="number" value="100"></div><div class="actions"><button class="action-btn" id="generate">Generieren</button></div><div id="genResult"></div>`);$('#genType').onchange=()=>$('#numberFields').style.display=$('#genType').value==='number'?'block':'none';$('#generate').onclick=()=>{let v;const t=$('#genType').value;if(t==='number'){let a=Number($('#min').value),b=Number($('#max').value);if(!Number.isSafeInteger(a)||!Number.isSafeInteger(b)||b<a||b-a>1000000000){$('#genResult').innerHTML=resultHTML('Bitte gültigen Bereich eingeben','HINWEIS');return}v=a+secureIndex(b-a+1)}if(t==='color')v=pick(['Violett','#8B5CF6','Türkis','#2DD4BF','Koralle','#FB7185','Indigo','#6366F1','Gold','#FBBF24']);if(t==='letter')v=pick('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''));if(t==='coin')v=pick(['Kopf','Zahl']);if(t==='team')v=pick(['Team Rot','Team Blau']);$('#genResult').innerHTML=resultHTML(v)}}
const challenges=['Mach heute einen kleinen Spaziergang an einem neuen Ort.','Lerne ein neues Wort in einer anderen Sprache.','Zeichne etwas in nur 60 Sekunden.','Höre einen Song, den du noch nicht kennst.','Schreibe drei Dinge auf, die heute gut liefen.','Probiere eine neue Kombination aus deinem Lieblingsessen.','Räume eine kleine Ecke auf, die du oft übersiehst.','Mache jemandem ein ehrliches Kompliment.','Fotografiere heute ein interessantes Detail.','Lies zehn Minuten etwas, das dich interessiert.','Erfinde einen Namen für einen imaginären Planeten.','Lerne einen kleinen Trick oder eine neue Fähigkeit.'];
function challengeTool(){panel('Daily Challenge','Eine neue kleine Aufgabe. Jeden Tag eine andere Auswahl.',`<div class="result"><div class="result-label">DEINE AUFGABE FÜR HEUTE</div><div class="result-value" id="dailyTask" style="font-size:23px;line-height:1.35">Bereit?</div></div><div class="actions"><button class="action-btn" id="newChallenge">Challenge ziehen</button></div><p style="font-size:11px;color:var(--muted);margin-top:15px">Die Tagesauswahl wird lokal in deinem Browser gespeichert.</p>`);const today=new Date().toDateString();const saved=localStorage.getItem('random-daily');let data;try{data=JSON.parse(saved)}catch{}if(data&&data.date===today)$('#dailyTask').textContent=data.task;$('#newChallenge').onclick=()=>{const task=pick(challenges);localStorage.setItem('random-daily',JSON.stringify({date:today,task}));$('#dailyTask').textContent=task;$('#dailyTask').parentElement.classList.remove('pop');void $('#dailyTask').parentElement.offsetWidth;$('#dailyTask').parentElement.classList.add('pop')}}
function thisThatTool(){panel('This or That','Gib zwei Möglichkeiten ein. RANDOM wählt eine davon.',`<div class="choice-row"><input class="text-input" id="choiceA" placeholder="Option A" value="Meer"><input class="text-input" id="choiceB" placeholder="Option B" value="Berge"></div><div class="actions"><button class="action-btn" id="choose">Für mich wählen</button></div><div id="choiceResult"></div>`);$('#choose').onclick=()=>{const a=$('#choiceA').value.trim(),b=$('#choiceB').value.trim();if(!a||!b){$('#choiceResult').innerHTML=resultHTML('Bitte beide Optionen ausfüllen','HINWEIS');return}const chosen=pick([a,b]);$('#choiceResult').innerHTML=resultHTML(chosen,'RANDOM WÄHLT')}}
$$('.tool-card').forEach(card=>card.addEventListener('click',()=>openTool(card.dataset.tool)));
