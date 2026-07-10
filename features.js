'use strict';

/* SetupLab 1.5.0 — expanded catalog and strict budget planner */
const V14_VIEWS = ['dashboard','wizard','builds','catalog','simlab','presets','compare','inventory','settings'];
const V14_THEMES = ['dark','light','graphite','navy','titanium','mono','corsa','porsche','amg','mclaren','brutalist','industrial','oled','blueprint','terminal'];
const V14_DIMENSIONS = {
  performance:'Производительность', quality:'Качество', reliability:'Надёжность', functions:'Функциональность',
  compatibility:'Совместимость', upgrade:'Апгрейдность', value:'Цена/возможности', liquidity:'Ликвидность', ergonomics:'Эргономика', quiet:'Тишина'
};
const V14_DISCIPLINES = {
  GT:{label:'GT / Touring',wheel:['GT','KS','GS','CS','RS','McLaren'],optional:['shifter']},
  Formula:{label:'Formula',wheel:['Formula','KS','FSR','FX','Vision','Mission R'],optional:[]},
  Rally:{label:'Rally',wheel:['Round','RS','CS','Rally','R12'],optional:['shifter','handbrake']},
  Drift:{label:'Drift',wheel:['Round','RS','CS','Drift'],optional:['shifter','handbrake']},
  Truck:{label:'Truck',wheel:['Truck','TSW','Round'],optional:['shifter']}
};
const V14_PRESETS = [
  {id:'sim-moza-start',group:'sim',title:'MOZA Starter',subtitle:'Компактный Direct Drive для стола',budgetEUR:820,level:'economy',brand:'MOZA Racing',profile:{discipline:'GT',mount:'desk',platform:'PC'}},
  {id:'sim-moza-gt',group:'sim',title:'MOZA GT Balanced',subtitle:'R9/R12, GT-руль и load-cell педали',budgetEUR:1650,level:'balanced',brand:'MOZA Racing',profile:{discipline:'GT',mount:'cockpit',platform:'PC'}},
  {id:'sim-moza-formula',group:'sim',title:'MOZA Formula',subtitle:'Формульный руль, жёсткий кокпит и точные педали',budgetEUR:2300,level:'maximum',brand:'MOZA Racing',profile:{discipline:'Formula',mount:'cockpit',platform:'PC'}},
  {id:'sim-rally',group:'sim',title:'Rally / Drift',subtitle:'Круглый руль, шифтер и ручник',budgetEUR:1800,level:'balanced',profile:{discipline:'Rally',mount:'cockpit',platform:'PC'}},
  {id:'sim-high-torque',group:'sim',title:'Direct Drive 20+ Н·м',subtitle:'Высокий момент и алюминиевый профиль',budgetEUR:3400,level:'maximum',profile:{discipline:'GT',mount:'cockpit',platform:'PC',torqueMin:20}},
  {id:'pc-1080',group:'pc',title:'Игровой ПК 1080p',subtitle:'Рациональная конфигурация без переплаты',budgetEUR:1050,level:'economy'},
  {id:'pc-1440',group:'pc',title:'Игровой ПК 1440p',subtitle:'Сбалансированный CPU/GPU и запас платформы',budgetEUR:1850,level:'balanced'},
  {id:'pc-4k',group:'pc',title:'Игровой ПК 4K',subtitle:'Флагманская видеокарта и мощное питание',budgetEUR:3300,level:'maximum'},
  {id:'pc-sim',group:'pc',title:'ПК для симрейсинга',subtitle:'Высокий FPS, VR и три монитора',budgetEUR:2400,level:'maximum'},
  {id:'workspace-focus',group:'workspace',title:'Строгое рабочее место',subtitle:'Монитор, эргономика и чистая коммутация',budgetEUR:1800,level:'balanced'},
  {id:'workspace-pro',group:'workspace',title:'Профессиональная студия',subtitle:'Цвет, док-станция и премиальная эргономика',budgetEUR:4200,level:'maximum'},
  {id:'cinema-oled',group:'cinema',title:'OLED Cinema',subtitle:'OLED, AV-ресивер и многоканальная акустика',budgetEUR:3800,level:'balanced'},
  {id:'cinema-projector',group:'cinema',title:'Проекторный зал',subtitle:'Проектор, экран и полноценный звук',budgetEUR:7000,level:'maximum'},
  {id:'photo-starter',group:'photo',title:'Фото — старт',subtitle:'Камера, универсальный объектив и штатив',budgetEUR:1800,level:'economy'},
  {id:'photo-video',group:'photo',title:'Видео и контент',subtitle:'Стабилизация, свет и быстрые носители',budgetEUR:4200,level:'balanced'},
  {id:'audio-desktop',group:'audio',title:'Настольный Hi‑Fi',subtitle:'Активные мониторы и качественный источник',budgetEUR:1400,level:'balanced'},
  {id:'audio-vinyl',group:'audio',title:'Виниловая система',subtitle:'Проигрыватель, усилитель и пассивная акустика',budgetEUR:3200,level:'balanced'},
  {id:'audio-studio',group:'audio',title:'Домашняя студия',subtitle:'Интерфейс, мониторы, микрофон и наушники',budgetEUR:2600,level:'maximum'}
];

Object.assign(defaultState, {
  wizard:{group:'sim',budgetEUR:1600,level:'balanced',country:'RU',platform:'PC',discipline:'GT',mount:'cockpit',brand:'any',priority:'balance'},
  simLab:{discipline:'GT',platform:'PC',mount:'cockpit',brand:'MOZA Racing',baseId:'',cockpitId:''},
  priceHistory:{}, inventory:[], presetGroup:'sim', inventoryFilter:'all'
});

const sanitizeStateV13 = sanitizeState;
sanitizeState = function(input){
  const raw=input&&typeof input==='object'?input:{};
  const clean=sanitizeStateV13(raw);
  clean.version=5;
  clean.theme=V14_THEMES.includes(raw.theme)?raw.theme:(V14_THEMES.includes(clean.theme)?clean.theme:'dark');
  clean.activeView=V14_VIEWS.includes(raw.activeView)?raw.activeView:(V14_VIEWS.includes(clean.activeView)?clean.activeView:'dashboard');
  clean.priceHistory=raw.priceHistory&&typeof raw.priceHistory==='object'&&!Array.isArray(raw.priceHistory)?raw.priceHistory:{};
  Object.keys(clean.priceHistory).forEach(id=>{
    clean.priceHistory[id]=Array.isArray(clean.priceHistory[id])?clean.priceHistory[id].filter(p=>p&&Number.isFinite(Number(p.priceEUR))&&p.date).slice(-48).map(p=>({date:String(p.date),priceEUR:Number(p.priceEUR),source:String(p.source||'local')})):[];
  });
  clean.inventory=Array.isArray(raw.inventory)?raw.inventory.filter(Boolean).map(x=>({
    id:String(x.id||uid('owned')),itemId:String(x.itemId||''),customName:String(x.customName||'').slice(0,100),status:['owned','ordered','planned','sold','repair'].includes(x.status)?x.status:'owned',
    purchaseDate:String(x.purchaseDate||''),purchasePriceEUR:Math.max(0,Number(x.purchasePriceEUR)||0),store:String(x.store||'').slice(0,120),warrantyUntil:String(x.warrantyUntil||''),serial:String(x.serial||'').slice(0,120),receipt:String(x.receipt||'').slice(0,500),notes:String(x.notes||'').slice(0,2000),createdAt:Number(x.createdAt)||Date.now()
  })):[];
  const w=raw.wizard&&typeof raw.wizard==='object'?raw.wizard:{};
  clean.wizard={
    group:['pc','sim','cinema','workspace','photo','audio'].includes(w.group)?w.group:'sim', budgetEUR:clamp(Number(w.budgetEUR)||1600,100,100000),
    level:['economy','balanced','maximum'].includes(w.level)?w.level:'balanced', country:String(w.country||'RU'), platform:['PC','Xbox','PlayStation'].includes(w.platform)?w.platform:'PC',
    discipline:Object.keys(V14_DISCIPLINES).includes(w.discipline)?w.discipline:'GT', mount:['desk','cockpit','compact'].includes(w.mount)?w.mount:'cockpit', brand:String(w.brand||'any'), priority:['balance','performance','value','upgrade'].includes(w.priority)?w.priority:'balance'
  };
  const sl=raw.simLab&&typeof raw.simLab==='object'?raw.simLab:{};
  clean.simLab={discipline:Object.keys(V14_DISCIPLINES).includes(sl.discipline)?sl.discipline:'GT',platform:['PC','Xbox','PlayStation'].includes(sl.platform)?sl.platform:'PC',mount:['desk','cockpit','compact'].includes(sl.mount)?sl.mount:'cockpit',brand:String(sl.brand||'MOZA Racing'),baseId:String(sl.baseId||''),cockpitId:String(sl.cockpitId||'')};
  clean.presetGroup=['pc','sim','cinema','workspace','photo','audio'].includes(raw.presetGroup)?raw.presetGroup:'sim';
  clean.inventoryFilter=['all','owned','ordered','planned','sold','repair'].includes(raw.inventoryFilter)?raw.inventoryFilter:'all';
  return clean;
};
state=sanitizeState(state);

applyTheme = function(){
  if(!V14_THEMES.includes(state.theme)) state.theme='dark';
  document.documentElement.dataset.theme=state.theme;
  const colors={light:'#f4f5f8',corsa:'#050505',graphite:'#111214',navy:'#07111f',titanium:'#d9dde3',mono:'#0b0b0b',dark:'#090a0d',porsche:'#0a0a0b',amg:'#071313',mclaren:'#101010',brutalist:'#ece9df',industrial:'#141719',oled:'#000000',blueprint:'#061b35',terminal:'#020805'};
  const meta=$('meta[name="theme-color"]'); if(meta) meta.setAttribute('content',colors[state.theme]||colors.dark);
};

function todayV14(){ return new Date().toISOString().slice(0,10); }
function parseDateV14(value){ const d=new Date(value); return Number.isNaN(d.getTime())?null:d; }
function currentRateToEURV14(value){ return Number(value||0)/(Number(state.rates[state.currency])||1); }
function statusLabelV14(status){ return {owned:'Куплено',ordered:'Заказано',planned:'Планируется',sold:'Продано',repair:'Ремонт'}[status]||status; }
function platformTextV14(item){ return String(item.specs?.['Платформа']||item.specs?.['Совместимость']||'').toLowerCase(); }
function itemMatchesPlatformV14(item,platform){
  if(!platform||platform==='PC') return true;
  const t=platformTextV14(item); if(!t) return true;
  return platform==='Xbox'?t.includes('xbox'):t.includes('playstation')||t.includes('ps5')||t.includes('ps4');
}
function recordPriceV14(item,source='catalog'){
  if(!item||!item.id)return;
  const date=todayV14(), priceEUR=Number(item.priceEUR)||0;
  const arr=Array.isArray(state.priceHistory[item.id])?state.priceHistory[item.id]:[];
  if(!arr.some(p=>p.date===date&&Math.abs(Number(p.priceEUR)-priceEUR)<.001)) arr.push({date,priceEUR,source});
  state.priceHistory[item.id]=arr.slice(-48);
}
function pricePointsV14(item){
  const arr=[...(Array.isArray(state.priceHistory[item.id])?state.priceHistory[item.id]:[])];
  if(item.priceChecked&&Number(item.priceEUR)>=0&&!arr.some(p=>p.date===item.priceChecked)) arr.push({date:item.priceChecked,priceEUR:Number(item.priceEUR),source:item.priceBasis||'catalog'});
  if(!arr.some(p=>p.date===todayV14())) arr.push({date:todayV14(),priceEUR:Number(item.priceEUR)||0,source:'current'});
  const map=new Map(); arr.forEach(p=>map.set(`${p.date}-${p.priceEUR}`,p));
  return [...map.values()].sort((a,b)=>String(a.date).localeCompare(String(b.date))).slice(-48);
}
function priceChartV14(item){
  const pts=pricePointsV14(item); const values=pts.map(p=>p.priceEUR); const min=Math.min(...values),max=Math.max(...values),range=Math.max(1,max-min);
  const coords=pts.map((p,i)=>`${10+(pts.length===1?0:i/(pts.length-1))*280},${92-(p.priceEUR-min)/range*72}`).join(' ');
  const change=pts.length>1?(values.at(-1)-values[0])/Math.max(1,values[0])*100:0;
  return `<section class="price-history-card"><div class="panel-head"><div><h3>История цены</h3><p>${pts.length>1?`${pts.length} локальных снимков`:'История начинается с текущей версии каталога'}</p></div><b class="price-change ${change>0?'up':change<0?'down':''}">${change>0?'+':''}${number(change,1)}%</b></div><svg class="price-chart" viewBox="0 0 300 110" role="img" aria-label="График цены"><line x1="10" y1="92" x2="290" y2="92"></line><polyline points="${coords}"></polyline>${pts.map((p,i)=>`<circle cx="${10+(pts.length===1?0:i/(pts.length-1))*280}" cy="${92-(p.priceEUR-min)/range*72}" r="3"></circle>`).join('')}</svg><div class="price-chart-labels"><span>${escapeHTML(pts[0]?.date||'—')} · ${money(pts[0]?.priceEUR||0)}</span><span>${escapeHTML(pts.at(-1)?.date||'—')} · ${money(pts.at(-1)?.priceEUR||0)}</span></div><small>SetupLab сохраняет реальные снимки при просмотре, импорте или ручном изменении цены. Придуманные промежуточные значения не создаются.</small></section>`;
}

function typePricePercentileV14(item){
  const peers=allItems().filter(x=>x.group===item.group&&x.type===item.type&&Number(x.priceEUR)>=0).sort((a,b)=>Number(a.priceEUR)-Number(b.priceEUR));
  if(peers.length<2)return .5; const idx=peers.findIndex(x=>x.id===item.id); return idx<0?.5:idx/(peers.length-1);
}
function itemDimensionsV14(item){
  const score=clamp(Number(item.score)||0,0,100), upgrade=clamp(Number(item.upgrade)||0,0,100), specs=Object.keys(item.specs||{}).length;
  const pricePct=typePricePercentileV14(item), seed=hashString(`${item.brand}|${item.name}`)%100;
  const ecosystem=item.compatibility?.ecosystem, universal=ecosystem==='Universal'||item.compatibility?.connection==='USB';
  const power=Number(item.powerW)||0;
  return {
    performance:score,
    quality:clamp(Math.round(score*.68+upgrade*.18+12),0,100),
    reliability:clamp(Math.round(66+(seed%18)+(upgrade-50)*.12),0,100),
    functions:clamp(Math.round(score*.58+Math.min(24,specs*3)+18),0,100),
    compatibility:clamp(Math.round(52+upgrade*.32+(universal?15:0)+(ecosystem?4:0)),0,100),
    upgrade,
    value:clamp(Math.round(92-pricePct*52+score*.22),0,100),
    liquidity:clamp(Math.round(48+score*.32+(officialDomains[item.brand]?10:0)),0,100),
    ergonomics:clamp(Math.round(62+(seed%20)+(['chair','wheel','keyboard','mouse','camera'].includes(item.type)?7:0)),0,100),
    quiet:clamp(Math.round(power?96-Math.log10(power+1)*16:76+(seed%12)),0,100)
  };
}
function buildDimensionsV14(build){
  const rows=buildItems(build); const sums={}; Object.keys(V14_DIMENSIONS).forEach(k=>sums[k]=0); let weight=0;
  rows.forEach(({entry,item})=>{const w=(typeWeights[item.type]||.6)*Math.min(2,Number(entry.qty)||1),d=itemDimensionsV14(item); Object.keys(sums).forEach(k=>sums[k]+=d[k]*w);weight+=w;});
  const out={}; Object.keys(sums).forEach(k=>out[k]=weight?Math.round(sums[k]/weight):0); out.compatibility=checkCompatibility(build,rows).percent; return out;
}
function dimensionBarsV14(dim,limit=10){
  return `<div class="dimension-grid">${Object.entries(V14_DIMENSIONS).slice(0,limit).map(([k,label])=>`<div class="dimension-row"><span>${label}</span><i><b style="width:${clamp(dim[k]||0,0,100)}%"></b></i><strong>${dim[k]||0}</strong></div>`).join('')}</div>`;
}

const checkCompatibilityV13=checkCompatibility;
checkCompatibility=function(build,rows){
  const base=checkCompatibilityV13(build,rows); const issues=base.issues.map(i=>({...i,fix:i.fix||compatFixV14(i.text)}));
  const items=rows.map(r=>r.item), byType=t=>items.filter(i=>i.type===t), add=(level,text,fix,code)=>issues.push({level,text,fix,code});
  if(build.group==='sim'){
    const profile=build.profile||{}; const baseItem=byType('wheelbase')[0],cockpit=byType('cockpit')[0];
    items.forEach(item=>{ if(profile.platform&&!itemMatchesPlatformV14(item,profile.platform)) add('bad',`${item.brand} ${item.name} не заявлен для платформы ${profile.platform}.`,'Выберите версию для нужной консоли или используйте совместимый адаптер только при подтверждённой поддержке.','platform'); });
    if(baseItem&&profile.mount==='desk'&&Number(baseItem.compatibility?.torqueNm)>10) add('warn',`База ${baseItem.compatibility?.torqueNm} Н·м слишком мощная для большинства столешниц.`,'Перейдите на алюминиевый кокпит или ограничьте момент в ПО.','desk-torque');
    if(baseItem&&cockpit){ const ratio=Number(baseItem.compatibility?.torqueNm||0)/Math.max(1,Number(cockpit.compatibility?.maxTorqueNm||1)); if(ratio>.85&&ratio<=1) add('warn','Кокпит работает почти на пределе заявленной жёсткости.','Для будущего апгрейда выберите раму с запасом минимум 25–30%.','rig-reserve'); }
    const disc=profile.discipline; const wheel=byType('wheel')[0]; if(disc==='Formula'&&wheel&&!/(formula|ks|fsr|fx|vision|mission)/i.test(wheel.name)) add('warn','Выбранный руль не оптимизирован под формульную посадку.','Рассмотрите компактный формульный руль диаметром 270–300 мм.','discipline');
    if(['Rally','Drift'].includes(disc)&&wheel&&!/(round|rs|cs|rally|deep dish|330|350)/i.test(wheel.name)) add('warn','Для Rally/Drift удобнее круглый руль большего диаметра.','Замените обод на круглый 320–350 мм.','discipline');
  }
  if(build.group==='pc'){
    const cpu=byType('cpu')[0],gpu=byType('gpu')[0]; if(cpu&&gpu&&Math.abs(Number(cpu.score)-Number(gpu.score))>24){ const weak=Number(cpu.score)<Number(gpu.score)?cpu:gpu; add('warn',`Баланс CPU/GPU смещён: слабее выглядит ${weak.brand} ${weak.name}.`,'Подберите компонент того же класса, чтобы не переплачивать за нераскрытый узел.','balance'); }
  }
  if(build.group==='cinema'&&byType('projector').length&&!byType('screen').length) add('warn','Проектор добавлен без отдельного экрана.','Добавьте экран с подходящим форматом и коэффициентом усиления.','screen');
  if(build.group==='photo'&&byType('camera').length&&byType('lens').length===1) add('good','Камера и объектив образуют компактный базовый комплект.','Следующий шаг — резервный аккумулятор и быстрый носитель.','photo-kit');
  const bad=issues.filter(i=>i.level==='bad').length,warn=issues.filter(i=>i.level==='warn').length,good=issues.filter(i=>i.level==='good').length;
  const percent=clamp(Math.round(base.percent-(bad-base.issues.filter(i=>i.level==='bad').length)*24-(warn-base.issues.filter(i=>i.level==='warn').length)*6+Math.min(3,good)),0,100);
  return {percent,issues};
};
function compatFixV14(text=''){
  if(/сокет/i.test(text))return 'Замените CPU или материнскую плату на модель с тем же сокетом.';
  if(/памят/i.test(text))return 'Выберите память стандарта, который поддерживает материнская плата.';
  if(/блок|БП|питани/i.test(text))return 'Возьмите БП с запасом 20–30% и нужными коннекторами.';
  if(/корпус|помещается/i.test(text))return 'Проверьте длину, высоту и форм-фактор или выберите более просторный корпус.';
  if(/экосистем/i.test(text))return 'Нужен совместимый руль той же экосистемы либо подтверждённый USB/Hub-адаптер.';
  if(/кокпит/i.test(text))return 'Выберите более жёсткую раму с запасом по моменту.';
  if(/байонет/i.test(text))return 'Подберите объектив с тем же байонетом или официальный адаптер.';
  if(/импеданс/i.test(text))return 'Сверьте рабочий импеданс и мощность усилителя с акустикой.';
  return text.includes('комплектац')?'Добавьте отсутствующие базовые компоненты из каталога.':'Проверьте спецификации производителя перед покупкой.';
}

const calculateBuildV13=calculateBuild;
calculateBuild=function(build){ const m=calculateBuildV13(build); m.dimensions=buildDimensionsV14(build); return m; };

function missingRulesV14(build){
  const present=new Set(buildItems(build).map(x=>x.item.type));
  return (essentialTypes[build.group]||[]).filter(rule=>!rule.split('|').some(t=>present.has(t)));
}
function analyzeWeakPointsV14(build){
  const rows=buildItems(build),m=calculateBuild(build),out=[];
  m.issues.filter(i=>i.level==='bad').slice(0,2).forEach(i=>out.push({level:'bad',title:'Критический конфликт',text:i.text,fix:i.fix}));
  missingRulesV14(build).slice(0,2).forEach(rule=>out.push({level:'warn',title:'Неполная конфигурация',text:`Не добавлен обязательный тип: ${rule.split('|').map(itemTypeName).join(' или ')}.`,fix:'Добавьте компонент — это повысит полноту, итоговый балл и точность проверки.'}));
  rows.forEach(({item})=>{ const peers=allItems().filter(x=>x.group===build.group&&x.type===item.type); if(peers.length<4)return; const median=[...peers].sort((a,b)=>a.score-b.score)[Math.floor(peers.length/2)]?.score||0; if(Number(item.score)<median-13) out.push({level:'warn',title:`Слабое место: ${itemTypeName(item.type)}`,text:`${item.brand} ${item.name} заметно уступает среднему уровню этого типа в каталоге.`,fix:'Рассмотрите замену на позицию с приростом не менее 8–12 баллов.'}); });
  const dims=m.dimensions; const weakest=Object.entries(dims).sort((a,b)=>a[1]-b[1])[0]; if(weakest&&weakest[1]<65) out.push({level:'info',title:`Низкий профиль: ${V14_DIMENSIONS[weakest[0]]}`,text:`Текущая оценка ${weakest[1]}/100.`,fix:'Сравните варианты по многокритериальному профилю, а не только по производительности.'});
  return out.slice(0,5);
}
function nextUpgradesV14(build){
  const rows=buildItems(build),currentIds=new Set(rows.map(r=>r.item.id)),recs=[];
  const missing=missingRulesV14(build);
  missing.forEach(rule=>{
    const types=rule.split('|'); const cand=allItems().filter(i=>i.group===build.group&&types.includes(i.type)&&!currentIds.has(i.id)).sort((a,b)=>(b.score+b.upgrade*.25-b.priceEUR*.015)-(a.score+a.upgrade*.25-a.priceEUR*.015))[0];
    if(cand)recs.push({kind:'add',oldId:'',item:cand,gain:Math.round(cand.score*.35),net:cand.priceEUR,reason:`Закрывает обязательный тип «${itemTypeName(cand.type)}» и повышает полноту.`});
  });
  rows.forEach(({item})=>{
    const candidates=allItems().filter(c=>c.group===build.group&&c.type===item.type&&!currentIds.has(c.id)&&Number(c.score)>=Number(item.score)+6&&Number(c.upgrade)>=Number(item.upgrade)-5);
    candidates.forEach(c=>{
      const temp=deepClone(build); const e=temp.items.find(x=>x.id===item.id); if(e)e.id=c.id;
      const comp=checkCompatibility(temp,buildItems(temp)); if(comp.issues.some(i=>i.level==='bad'))return;
      const gain=(Number(c.score)-Number(item.score))*.7+(Number(c.upgrade)-Number(item.upgrade))*.3; const net=Math.max(0,Number(c.priceEUR)-Number(item.priceEUR)*.55); const efficiency=gain/Math.max(40,net)*100;
      recs.push({kind:'replace',oldId:item.id,item:c,gain:Math.round(gain),net,efficiency,reason:`Прирост ${Math.round(gain)} условных пунктов с сохранением совместимости; учтена ориентировочная перепродажа старого компонента за 55%.`});
    });
  });
  return recs.sort((a,b)=>(b.efficiency||b.gain/Math.max(1,b.net))-(a.efficiency||a.gain/Math.max(1,a.net))).slice(0,3);
}

const ALLOC_V14={
  pc:{cpu:.16,gpu:.34,motherboard:.10,ram:.08,storage:.08,psu:.08,case:.07,cooler:.06},
  sim:{wheelbase:.28,wheel:.17,pedals:.20,cockpit:.25,shifter:.05,handbrake:.05},
  cinema:{display:.36,projector:.36,receiver:.18,speakers:.28,soundbar:.34,source:.08,screen:.10,subwoofer:.10},
  workspace:{monitor:.35,desk:.20,chair:.25,keyboard:.06,mouse:.05,dock:.09},
  photo:{camera:.45,lens:.38,storage:.05,tripod:.06,gimbal:.10,flash:.06},
  audio:{speakers:.36,activemonitors:.48,headphones:.28,amplifier:.26,source:.12,interface:.16,turntable:.24,microphone:.14}
};
function candidateUtilityV14(item,target,priority,brand,slotBudget=Infinity){
  const d=itemDimensionsV14(item),price=Math.max(1,Number(item.priceEUR)||0);
  let val=item.score*.50+item.upgrade*.16+d.value*.22-Math.abs(item.score-target)*.16;
  if(priority==='performance')val+=item.score*.28;
  if(priority==='value')val+=d.value*.36;
  if(priority==='upgrade')val+=item.upgrade*.30;
  if(brand&&brand!=='any'&&item.brand===brand)val+=14;
  if(Number.isFinite(slotBudget)){
    const ratio=price/Math.max(1,slotBudget);
    if(ratio<=1) val+=(1-ratio)*12;
    else val-=(ratio-1)*80;
  }
  return val;
}
function ruleSatisfiedV15(group,rule,selected){
  const types=rule.split('|');
  if(selected.some(i=>types.includes(i.type))) return true;
  if(group==='sim'){
    const base=selected.find(i=>i.type==='wheelbase');
    if(types.includes('wheel')&&base?.compatibility?.includesWheel) return true;
    if(types.includes('pedals')&&base?.compatibility?.includesPedals) return true;
  }
  if(group==='photo'){
    const camera=selected.find(i=>i.type==='camera');
    if(types.includes('lens')&&camera?.compatibility?.includesLens) return true;
  }
  return false;
}
function ecosystemKeyV15(value){
  return String(value||'').toLowerCase().replace(/racing|simsports|simulation|simulations|\s|[-_]/g,'');
}
function ecosystemsMatchV15(a,b){
  const aa=ecosystemKeyV15(a),bb=ecosystemKeyV15(b);
  return !aa||!bb||aa==='universal'||bb==='universal'||aa===bb;
}
function requiredRulesV15(group,profile={}){
  return (essentialTypes[group]||[]).filter(rule=>!(group==='sim'&&profile.mount==='desk'&&rule.split('|').includes('cockpit')));
}
function requiredRulesCompleteV15(group,selected,profile={}){
  return requiredRulesV15(group,profile).every(rule=>ruleSatisfiedV15(group,rule,selected));
}

let wizardPoolIndexV15=null;
let wizardPoolStampV15='';
function ensureWizardPoolIndexV15(){
  const items=allItems();
  const stamp=`${items.length}:${items[0]?.id||''}:${items[items.length-1]?.id||''}:${catalog.version||''}`;
  if(wizardPoolIndexV15&&wizardPoolStampV15===stamp)return wizardPoolIndexV15;
  const map=new Map();
  for(const item of items){
    const key=`${item.group}:${item.type}`;
    if(!map.has(key))map.set(key,[]);
    map.get(key).push(item);
  }
  wizardPoolIndexV15=map;wizardPoolStampV15=stamp;
  return map;
}
function candidatePoolV15(group,types,profile,used,selected=[]){
  const index=ensureWizardPoolIndexV15();
  let candidates=[];
  for(const type of types)candidates.push(...(index.get(`${group}:${type}`)||[]));
  candidates=candidates.filter(i=>!used.has(i.id)&&itemMatchesPlatformV14(i,profile.platform));
  const first=t=>selected.find(i=>i.type===t);
  if(group==='sim'){
    const base=first('wheelbase');
    if(types.includes('pedals')) candidates=candidates.filter(i=>!/clutch pedal/i.test(`${i.brand} ${i.name}`));
    if(types.includes('shifter')) candidates=candidates.filter(i=>!/active shifter knob/i.test(`${i.brand} ${i.name}`));
    if(profile.torqueMin&&types.includes('wheelbase')) candidates=candidates.filter(i=>Number(i.compatibility?.torqueNm)>=profile.torqueMin);
    if(types.includes('wheel')&&base) candidates=candidates.filter(i=>ecosystemsMatchV15(i.compatibility?.ecosystem,base.compatibility?.ecosystem));
    if(types.includes('pedals')&&base) candidates=candidates.filter(i=>ecosystemsMatchV15(i.compatibility?.ecosystem,base.compatibility?.ecosystem)||i.compatibility?.connection==='USB');
    if(types.includes('cockpit')&&base) candidates=candidates.filter(i=>Number(i.compatibility?.maxTorqueNm||0)>=Number(base.compatibility?.torqueNm||0));
    if(types.includes('wheel')){const terms=V14_DISCIPLINES[profile.discipline]?.wheel||[];const matched=candidates.filter(i=>terms.some(t=>`${i.brand} ${i.name}`.toLowerCase().includes(t.toLowerCase())));if(matched.length)candidates=matched;}
  }
  if(group==='photo'&&types.includes('lens')){const camera=first('camera');if(camera)candidates=candidates.filter(i=>String(i.compatibility?.mount||'').split(' / ').some(m=>String(camera.compatibility?.mount||'').includes(m)));}
  if(group==='pc'){
    const cpu=first('cpu'),gpu=first('gpu'),mb=first('motherboard');
    if(types.includes('motherboard')&&cpu)candidates=candidates.filter(i=>i.compatibility?.socket===cpu.compatibility?.socket);
    if(types.includes('ram')&&mb)candidates=candidates.filter(i=>i.compatibility?.memoryType===mb.compatibility?.memoryType);
    if(types.includes('psu')&&gpu)candidates=candidates.filter(i=>Number(i.compatibility?.wattage||0)>=Number(gpu.compatibility?.recommendedPsuW||0));
    if(types.includes('case'))candidates=candidates.filter(i=>(!gpu||Number(i.compatibility?.maxGpuLength||0)>=Number(gpu.compatibility?.lengthMm||0))&&(!mb||(i.compatibility?.supportedFormFactors||[]).includes(mb.compatibility?.formFactor)));
    if(types.includes('cooler')&&cpu)candidates=candidates.filter(i=>(i.compatibility?.sockets||[]).includes(cpu.compatibility?.socket));
  }
  if(group==='workspace'&&types.includes('monitorarm')){const monitor=first('monitor');if(monitor)candidates=candidates.filter(i=>Number(i.compatibility?.maxWeightKg||0)>=Number(monitor.compatibility?.weightKg||0));}
  if(group==='audio'&&types.includes('speakers')){const amp=first('amplifier');if(amp)candidates=candidates.filter(i=>Number(i.compatibility?.impedance||0)>=Number(amp.compatibility?.impedanceMin||0));}
  if(group==='cinema'&&types.includes('speakers')){const rec=first('receiver');if(rec)candidates=candidates.filter(i=>Number(rec.compatibility?.channels||0)+1>=Number(i.compatibility?.channelsNeeded||0));}
  return candidates;
}
function chooseCandidateV14(group,types,budget,target,profile,used,selected=[]){
  let candidates=candidatePoolV15(group,types,profile,used,selected);
  if(!candidates.length)return null;
  const hard=Math.max(0,Number(budget)||0);
  const affordable=candidates.filter(i=>Number(i.priceEUR)<=hard+.01);
  if(affordable.length)candidates=affordable;
  else candidates=[...candidates].sort((a,b)=>Number(a.priceEUR)-Number(b.priceEUR)).slice(0,12);
  candidates.sort((a,b)=>candidateUtilityV14(b,target,profile.priority,profile.brand,hard)-candidateUtilityV14(a,target,profile.priority,profile.brand,hard));
  return candidates[0]||null;
}
function cheapestCandidateV15(group,types,profile,used,selected=[]){
  return candidatePoolV15(group,types,profile,used,selected).sort((a,b)=>Number(a.priceEUR)-Number(b.priceEUR))[0]||null;
}
function reserveForRulesV15(group,rules,profile,used,selected){
  let reserve=0,shadow=[...selected],shadowUsed=new Set(used);
  for(const rule of rules){
    if(ruleSatisfiedV15(group,rule,shadow))continue;
    const item=cheapestCandidateV15(group,rule.split('|'),profile,shadowUsed,shadow);
    if(item){reserve+=Number(item.priceEUR)||0;shadow.push(item);shadowUsed.add(item.id);}
  }
  return reserve;
}
function improveBuildWithinBudgetV15(build,cap,target,profile){
  let changed=true,loops=0;
  while(changed&&loops++<18){
    changed=false;
    const current=buildItems(build),metrics=calculateBuild(build),remaining=cap-metrics.total;
    if(remaining<8)break;
    let best=null;
    for(const row of current){
      const old=row.item;
      const share=ALLOC_V14[build.group]?.[old.type]||.18;
      const typeCeiling=Math.max(Number(old.priceEUR),cap*Math.min(.58,share*1.55));
      const selectedWithoutOld=current.filter(x=>x.item.id!==old.id).map(x=>x.item);
      const usedWithoutOld=new Set(selectedWithoutOld.map(i=>i.id));
      const rawPool=candidatePoolV15(build.group,[old.type],profile,usedWithoutOld,selectedWithoutOld).filter(i=>{
        if(i.id===old.id||Number(i.priceEUR)>Number(old.priceEUR)+remaining+.01||Number(i.priceEUR)>typeCeiling+.01)return false;
        return true;
      });
      const pool=rawPool.sort((a,b)=>{
        const ga=(Number(a.score)-Number(old.score))*.72+(Number(a.upgrade)-Number(old.upgrade))*.28;
        const gb=(Number(b.score)-Number(old.score))*.72+(Number(b.upgrade)-Number(old.upgrade))*.28;
        return gb/Math.max(4,Number(b.priceEUR)-Number(old.priceEUR)+4)-ga/Math.max(4,Number(a.priceEUR)-Number(old.priceEUR)+4);
      }).slice(0,54);
      for(const cand of pool){
        if(Number(cand.score)<=Number(old.score)&&Number(cand.upgrade)<=Number(old.upgrade))continue;
        const temp=deepClone(build),entry=temp.items.find(x=>x.id===old.id);if(!entry)continue;entry.id=cand.id;
        const tempRows=buildItems(temp),tempSelected=tempRows.map(x=>x.item);
        if(!requiredRulesCompleteV15(build.group,tempSelected,profile))continue;
        const comp=checkCompatibility(temp,tempRows);if(comp.issues.some(i=>i.level==='bad'))continue;
        const delta=Number(cand.priceEUR)-Number(old.priceEUR);if(delta>remaining+.01)continue;
        const gain=(Number(cand.score)-Number(old.score))*.72+(Number(cand.upgrade)-Number(old.upgrade))*.28;
        const efficiency=gain/Math.max(4,delta+4);
        const closeness=1-Math.min(1,Math.abs(Number(cand.score)-target)/100);
        const rank=efficiency*12+gain+closeness*3;
        if(!best||rank>best.rank)best={old,cand,rank};
      }
    }
    if(best){const entry=build.items.find(x=>x.id===best.old.id);if(entry){entry.id=best.cand.id;changed=true;}}
  }
}
function generatePlanV14(group,budgetEUR,tier,profile={}){
  const ratios={economy:.65,balanced:.85,maximum:1},targets={economy:56,balanced:74,maximum:90};
  const cap=Math.max(40,budgetEUR*(ratios[tier]||1)),target=targets[tier]||74;
  const rules=requiredRulesV15(group,profile),used=new Set(),items=[],selected=[];let spent=0,minimumShortfall=0;
  for(let index=0;index<rules.length;index++){
    const rule=rules[index];if(ruleSatisfiedV15(group,rule,selected))continue;
    const types=rule.split('|');
    const remainingRules=rules.slice(index+1).filter(r=>!ruleSatisfiedV15(group,r,selected));
    const reserve=reserveForRulesV15(group,remainingRules,profile,used,selected);
    const available=Math.max(0,cap-spent-reserve);
    const share=Math.max(...types.map(t=>ALLOC_V14[group]?.[t]||1/rules.length));
    const desired=Math.min(available,Math.max(25,cap*share*1.18));
    let item=chooseCandidateV14(group,types,desired,target,profile,used,selected);
    if(group==='sim'&&types.includes('wheelbase')&&(cap<=950||tier==='economy')){
      const bundleRules=remainingRules.filter(r=>!r.split('|').includes('wheel')&&!r.split('|').includes('pedals'));
      const bundleReserve=reserveForRulesV15(group,bundleRules,profile,used,selected);
      const bundleBudget=Math.max(0,cap-spent-bundleReserve);
      const bundles=candidatePoolV15(group,types,profile,used,selected).filter(i=>i.compatibility?.includesWheel&&i.compatibility?.includesPedals&&Number(i.priceEUR)<=bundleBudget+.01);
      bundles.sort((a,b)=>(candidateUtilityV14(b,target,profile.priority,profile.brand,bundleBudget)+16)-(candidateUtilityV14(a,target,profile.priority,profile.brand,bundleBudget)+16));
      const bundle=bundles[0];
      if(bundle){
        const bundleRank=candidateUtilityV14(bundle,target,profile.priority,profile.brand,bundleBudget)+16;
        const itemRank=item?candidateUtilityV14(item,target,profile.priority,profile.brand,desired): -Infinity;
        if(bundleRank>=itemRank-2)item=bundle;
      }
    }
    if(group==='sim'&&types.includes('wheelbase')&&cap>950&&tier!=='economy'&&item?.compatibility?.includesWheel&&item?.compatibility?.includesPedals){
      const separate=candidatePoolV15(group,types,profile,used,selected).filter(i=>!(i.compatibility?.includesWheel&&i.compatibility?.includesPedals)&&Number(i.priceEUR)<=desired+.01);
      separate.sort((a,b)=>candidateUtilityV14(b,target,profile.priority,profile.brand,desired)-candidateUtilityV14(a,target,profile.priority,profile.brand,desired));
      if(separate[0])item=separate[0];
    }
    if(!item)item=cheapestCandidateV15(group,types,profile,used,selected);
    if(item){
      const price=Number(item.priceEUR)||0;
      if(price>available+.01)minimumShortfall+=price-available;
      items.push({id:item.id,qty:1});selected.push(item);used.add(item.id);spent+=price;
    }
  }
  const essentialComplete=rules.every(rule=>ruleSatisfiedV15(group,rule,selected));
  let optionals=essentialComplete?({pc:[],sim:V14_DISCIPLINES[profile.discipline]?.optional||[],cinema:['subwoofer'],workspace:['dock','monitorarm','lighting'],photo:['tripod','gimbal','flash'],audio:['headphones','microphone']}[group]||[]):[];
  const optionalThresholds={
    sim:{shifter:550,handbrake:800,dashboard:1000,accessory:650},
    cinema:{subwoofer:850},
    workspace:{dock:700,monitorarm:600,lighting:500},
    photo:{tripod:450,gimbal:800,flash:650},
    audio:{headphones:400,microphone:550}
  };
  if(optionalThresholds[group])optionals=optionals.filter(type=>cap>=(optionalThresholds[group][type]||0));
  for(const type of optionals){
    const left=cap-spent;if(left<12)break;if(selected.some(i=>i.type===type))continue;
    const item=chooseCandidateV14(group,[type],left,target,profile,used,selected);
    if(item&&Number(item.priceEUR)<=left+.01){items.push({id:item.id,qty:1});selected.push(item);used.add(item.id);spent+=Number(item.priceEUR)||0;}
  }
  const build={id:'preview',name:'preview',group,items,profile:{...profile,budgetEUR:cap},createdAt:Date.now(),updatedAt:Date.now()};
  if(spent<=cap+.01)improveBuildWithinBudgetV15(build,cap,target,profile);
  const finalSelected=buildItems(build).map(x=>x.item),complete=requiredRulesCompleteV15(group,finalSelected,profile);
  const m=calculateBuild(build),remaining=cap-m.total,over=m.total>cap+.01;
  return {tier,budget:cap,build,metrics:m,over,complete,remaining,utilization:Math.round(m.total/Math.max(1,cap)*100),shortfall:over?m.total-cap:Math.max(0,minimumShortfall)};
}
let wizardResultsV14=[];

function renderWizardV14(){
  const w=state.wizard,displayBudget=Math.round(w.budgetEUR*(state.rates[state.currency]||1));
  const groupOptions=Object.entries(catalog.categories).map(([id,c])=>`<option value="${id}" ${w.group===id?'selected':''}>${escapeHTML(c.name)}</option>`).join('');
  const brands=[...new Set(allItems().filter(i=>i.group===w.group).map(i=>i.brand))].sort().slice(0,120);
  const results=wizardResultsV14.length?`<section class="wizard-results"><div class="panel-head"><div><h2>Три сценария</h2><p>Можно сохранить один вариант или сразу все три.</p></div><button class="secondary" data-action="create-all-wizard-builds">Сохранить все</button></div><div class="scenario-grid">${wizardResultsV14.map((r,i)=>wizardResultCardV14(r,i)).join('')}</div></section>`:'';
  $('#view-wizard').innerHTML=pageHead('Guided configuration','Умный мастер подбора','Ответьте на ключевые вопросы — SetupLab соберёт экономный, сбалансированный и максимальный варианты.')+`
  <div class="wizard-layout"><form id="wizardForm" class="panel wizard-form"><div class="form-grid"><label><span>Направление</span><select name="group">${groupOptions}</select></label><label><span>Бюджет, ${currencySymbol()}</span><input name="budget" type="number" min="100" value="${displayBudget}" required></label><label><span>Уровень пользователя</span><select name="level"><option value="economy" ${w.level==='economy'?'selected':''}>Начальный</option><option value="balanced" ${w.level==='balanced'?'selected':''}>Опытный</option><option value="maximum" ${w.level==='maximum'?'selected':''}>Энтузиаст / Pro</option></select></label><label><span>Главный приоритет</span><select name="priority"><option value="balance" ${w.priority==='balance'?'selected':''}>Баланс</option><option value="performance" ${w.priority==='performance'?'selected':''}>Максимум возможностей</option><option value="value" ${w.priority==='value'?'selected':''}>Цена/возможности</option><option value="upgrade" ${w.priority==='upgrade'?'selected':''}>Апгрейдность</option></select></label><label><span>Предпочтительный бренд</span><select name="brand"><option value="any">Без привязки</option>${brands.map(b=>`<option ${w.brand===b?'selected':''}>${escapeHTML(b)}</option>`).join('')}</select></label><label><span>Страна покупки</span><select name="country"><option value="RU" ${w.country==='RU'?'selected':''}>Россия</option><option value="EU" ${w.country==='EU'?'selected':''}>Европа</option><option value="RS" ${w.country==='RS'?'selected':''}>Сербия</option><option value="other" ${w.country==='other'?'selected':''}>Другая</option></select></label><div class="full wizard-sim-fields"><label><span>Платформа</span><select name="platform"><option ${w.platform==='PC'?'selected':''}>PC</option><option ${w.platform==='Xbox'?'selected':''}>Xbox</option><option ${w.platform==='PlayStation'?'selected':''}>PlayStation</option></select></label><label><span>Дисциплина автосима</span><select name="discipline">${Object.entries(V14_DISCIPLINES).map(([id,d])=>`<option value="${id}" ${w.discipline===id?'selected':''}>${d.label}</option>`).join('')}</select></label><label><span>Установка</span><select name="mount"><option value="desk" ${w.mount==='desk'?'selected':''}>На стол</option><option value="compact" ${w.mount==='compact'?'selected':''}>Складная стойка</option><option value="cockpit" ${w.mount==='cockpit'?'selected':''}>Полноценный кокпит</option></select></label></div><div class="full actions"><button class="primary" type="submit">Собрать три варианта</button></div></div></form><aside class="panel wizard-side"><span class="eyebrow">Что учитывается</span><h2>Строгий контроль бюджета</h2><div class="wizard-checks"><span>✓ обязательные компоненты</span><span>✓ совместимость и экосистемы</span><span>✓ запас для апгрейда</span><span>✓ цена одного балла</span><span>✓ жёсткий лимит сборки</span><span>✓ резерв на обязательные детали</span><span>✓ платформа и дисциплина</span><span>✓ слабые места комплекта</span></div><p>Каждый сценарий имеет собственный лимит: 65%, 85% и 100% указанного бюджета. Мастер резервирует деньги на обязательные компоненты и не сохраняет вариант с превышением.</p></aside></div>${results}`;
}
function wizardResultCardV14(r,index){
  const names=buildItems(r.build).map(x=>`${x.item.brand} ${x.item.name}`),labels={economy:'Экономный',balanced:'Сбалансированный',maximum:'Максимальный'};
  const invalid=r.over||!r.complete;
  const status=!r.complete?'Не удалось закрыть все обязательные позиции':r.over?`Не хватает ${money(r.shortfall)}`:`Остаток ${money(Math.max(0,r.remaining))}`;
  return `<article class="scenario-card ${r.tier}"><span class="scenario-label">${labels[r.tier]}</span><h3>${money(r.metrics.total)}</h3><div class="scenario-budget"><div><span>Лимит</span><b>${money(r.budget)}</b></div><div><span>Использовано</span><b>${Math.min(999,r.utilization)}%</b></div></div><div class="budget-meter ${invalid?'over':''}"><i style="width:${Math.min(100,r.utilization)}%"></i></div><small class="budget-status ${invalid?'over-budget':''}">${status}</small><div class="scenario-metrics"><span><b>${r.metrics.score}</b> баллов</span><span><b>${r.metrics.compatibility}%</b> совместимость</span><span><b>${r.metrics.upgrade}%</b> апгрейд</span></div><div class="scenario-items">${names.slice(0,8).map(n=>`<span>${escapeHTML(n)}</span>`).join('')}</div>${invalid?'<small class="over-budget">Увеличьте бюджет, смените платформу или разрешите более простую комплектацию.</small>':''}<button class="primary" data-action="create-wizard-build" data-index="${index}" ${invalid?'disabled':''}>Сохранить сборку</button></article>`;
}
function submitWizardV14(form){
  const d=new FormData(form),group=String(d.get('group')),budgetEUR=currentRateToEURV14(d.get('budget'));
  state.wizard={group,budgetEUR:clamp(budgetEUR,100,100000),level:String(d.get('level')),country:String(d.get('country')),platform:String(d.get('platform')),discipline:String(d.get('discipline')),mount:String(d.get('mount')),brand:String(d.get('brand')),priority:String(d.get('priority'))};
  const profile={platform:state.wizard.platform,discipline:state.wizard.discipline,mount:state.wizard.mount,brand:state.wizard.brand,priority:state.wizard.priority,country:state.wizard.country};
  wizardResultsV14=['economy','balanced','maximum'].map(t=>generatePlanV14(group,state.wizard.budgetEUR,t,profile)); saveState(); renderWizardV14();
  setTimeout(()=>$('.wizard-results')?.scrollIntoView({behavior:'smooth',block:'start'}),50);
}
function saveWizardPlanV14(index){ const r=wizardResultsV14[index];if(!r||r.over||!r.complete){toast('Сценарий не сохранён','Сначала нужен полный комплект внутри бюджета.','warn');return;} const labels={economy:'Экономный',balanced:'Сбалансированный',maximum:'Максимальный'}; const b={...deepClone(r.build),id:uid('build'),name:`${labels[r.tier]} · ${categoryName(r.build.group)}`,createdAt:Date.now(),updatedAt:Date.now()};state.builds.unshift(b);saveState();toast('Сборка сохранена',b.name); }

function presetPlanV14(def){ return generatePlanV14(def.group,def.budgetEUR,def.level,{brand:def.brand||'any',priority:'balance',...(def.profile||{})}); }
function renderPresetsV14(){
  const groups=Object.entries(catalog.categories).map(([id,c])=>`<button class="${state.presetGroup===id?'active':''}" data-action="preset-group" data-group="${id}">${escapeHTML(c.name)}</button>`).join('');
  const cards=V14_PRESETS.filter(p=>p.group===state.presetGroup).map(p=>`<article class="preset-card"><span class="preset-icon">${iconFor(p.group)}</span><span class="eyebrow">${escapeHTML(categoryName(p.group))}</span><h3>${escapeHTML(p.title)}</h3><p>${escapeHTML(p.subtitle)}</p><div class="preset-meta"><span>Ориентир ${money(p.budgetEUR)}</span><span>${p.level==='economy'?'Рациональный':p.level==='maximum'?'Максимальный':'Сбалансированный'}</span></div><div class="actions"><button class="secondary" data-action="preview-preset" data-id="${p.id}">Предпросмотр</button><button class="primary" data-action="create-preset" data-id="${p.id}">Создать</button></div></article>`).join('');
  $('#view-presets').innerHTML=pageHead('Curated configurations','Готовые комплекты','Стартовые конфигурации для типовых задач. Любую сборку можно изменить после создания.')+`<div class="segmented preset-tabs">${groups}</div><div class="preset-grid">${cards||emptyHTML('Пока нет пресетов','Используйте умный мастер для этого направления.')}</div>`;
}
function createPresetV14(id,preview=false){ const def=V14_PRESETS.find(p=>p.id===id);if(!def)return;const r=presetPlanV14(def); if(preview){openModal(def.title,'Готовый комплект',`<div class="metric-grid"><article class="metric-card"><small>Стоимость</small><b>${money(r.metrics.total)}</b></article><article class="metric-card"><small>Баллы</small><b>${r.metrics.score}/100</b></article><article class="metric-card"><small>Совместимость</small><b>${r.metrics.compatibility}%</b></article><article class="metric-card"><small>Апгрейд</small><b>${r.metrics.upgrade}%</b></article></div><div class="component-list" style="margin-top:16px">${buildItems(r.build).map(({item})=>`<div class="component-row"><span class="component-thumb">${iconFor(item.group)}</span><span><strong>${escapeHTML(item.brand+' '+item.name)}</strong><small>${escapeHTML(itemTypeName(item.type))} · ${money(item.priceEUR)}</small></span></div>`).join('')}</div><div class="actions" style="margin-top:16px"><button class="primary" data-action="create-preset" data-id="${def.id}">Создать эту сборку</button></div>`,true);return;} const b={...deepClone(r.build),id:uid('build'),name:def.title,notes:def.subtitle,createdAt:Date.now(),updatedAt:Date.now()};state.builds.unshift(b);saveState();closeModal();renderAll();toast('Готовый комплект создан',def.title); }

function torqueValueV14(i){ return Number(i.compatibility?.torqueNm)||Number(String(i.specs?.['Момент']||'').replace(',','.').match(/[\d.]+/)?.[0])||0; }
function renderSimLabV14(){
  const sl=state.simLab,sim=allItems().filter(i=>i.group==='sim'),bases=sim.filter(i=>i.type==='wheelbase').sort((a,b)=>torqueValueV14(a)-torqueValueV14(b)),cockpits=sim.filter(i=>i.type==='cockpit').sort((a,b)=>Number(a.compatibility?.maxTorqueNm)-Number(b.compatibility?.maxTorqueNm));
  if(!sl.baseId)sl.baseId=bases.find(i=>i.brand===sl.brand)?.id||bases[0]?.id||''; if(!sl.cockpitId)sl.cockpitId=cockpits[Math.floor(cockpits.length/2)]?.id||'';
  const brands=[...new Set(sim.map(i=>i.brand))].sort(); const selectedBase=getItem(sl.baseId),selectedCockpit=getItem(sl.cockpitId),torque=torqueValueV14(selectedBase||{}),limit=Number(selectedCockpit?.compatibility?.maxTorqueNm)||0,ratio=limit?torque/limit:0;
  const recommended=sim.filter(i=>i.brand===sl.brand&&(i.type==='wheelbase'||i.type==='wheel'||i.type==='pedals')).filter(i=>itemMatchesPlatformV14(i,sl.platform)).sort((a,b)=>candidateUtilityV14(b,80,'balance',sl.brand)-candidateUtilityV14(a,80,'balance',sl.brand)).slice(0,8);
  const brandStats=brands.map(b=>{const arr=sim.filter(i=>i.brand===b);return {brand:b,count:arr.length,bases:arr.filter(i=>i.type==='wheelbase').length,avg:Math.round(arr.reduce((s,i)=>s+i.score,0)/arr.length)}}).sort((a,b)=>b.count-a.count).slice(0,10);
  $('#view-simlab').innerHTML=pageHead('Dedicated ecosystem analysis','Sim Racing Lab','Экосистемы, момент, жёсткость кокпита, дисциплины и последовательный путь апгрейда.','<button class="primary" data-action="create-simlab-build">Создать рекомендуемый комплект</button>')+`
  <div class="simlab-controls panel"><label><span>Бренд</span><select id="simBrand">${brands.map(b=>`<option ${sl.brand===b?'selected':''}>${escapeHTML(b)}</option>`).join('')}</select></label><label><span>Дисциплина</span><select id="simDiscipline">${Object.entries(V14_DISCIPLINES).map(([id,d])=>`<option value="${id}" ${sl.discipline===id?'selected':''}>${d.label}</option>`).join('')}</select></label><label><span>Платформа</span><select id="simPlatform"><option ${sl.platform==='PC'?'selected':''}>PC</option><option ${sl.platform==='Xbox'?'selected':''}>Xbox</option><option ${sl.platform==='PlayStation'?'selected':''}>PlayStation</option></select></label><label><span>Монтаж</span><select id="simMount"><option value="desk" ${sl.mount==='desk'?'selected':''}>Стол</option><option value="compact" ${sl.mount==='compact'?'selected':''}>Складная стойка</option><option value="cockpit" ${sl.mount==='cockpit'?'selected':''}>Кокпит</option></select></label></div>
  <div class="simlab-grid"><section class="panel"><div class="panel-head"><div><h2>Карта экосистем</h2><p>Количество позиций и средний внутренний балл каталога.</p></div></div><div class="ecosystem-list">${brandStats.map(x=>`<button data-action="sim-brand" data-brand="${escapeHTML(x.brand)}" class="ecosystem-row ${x.brand===sl.brand?'active':''}"><span><b>${escapeHTML(x.brand)}</b><small>${x.count} товаров · ${x.bases} баз</small></span><strong>${x.avg}</strong></button>`).join('')}</div></section>
  <section class="panel"><div class="panel-head"><div><h2>Сравнение момента</h2><p>Рулевые базы по номинальному моменту.</p></div></div><div class="torque-chart">${bases.filter(i=>torqueValueV14(i)>0).slice(-18).map(i=>`<button data-action="sim-select-base" data-id="${i.id}" class="torque-row ${i.id===sl.baseId?'active':''}"><span>${escapeHTML(i.brand+' '+i.name)}</span><i><b style="width:${clamp(torqueValueV14(i)/30*100,2,100)}%"></b></i><strong>${number(torqueValueV14(i),1)} Н·м</strong></button>`).join('')}</div></section></div>
  <section class="panel rig-check"><div class="panel-head"><div><h2>Проверка нагрузки на кокпит</h2><p>Сопоставление момента базы и заявленного предела рамы.</p></div></div><div class="rig-selects"><label><span>Рулевая база</span><select id="simBaseSelect">${bases.map(i=>`<option value="${i.id}" ${i.id===sl.baseId?'selected':''}>${escapeHTML(i.brand+' '+i.name)} · ${number(torqueValueV14(i),1)} Н·м</option>`).join('')}</select></label><label><span>Кокпит</span><select id="simCockpitSelect">${cockpits.map(i=>`<option value="${i.id}" ${i.id===sl.cockpitId?'selected':''}>${escapeHTML(i.brand+' '+i.name)} · до ${i.compatibility?.maxTorqueNm||'—'} Н·м</option>`).join('')}</select></label></div><div class="rig-meter ${ratio>1?'bad':ratio>.8?'warn':'good'}"><div><span>Использование запаса жёсткости</span><b>${limit?Math.round(ratio*100):'—'}%</b></div><i><b style="width:${clamp(ratio*100,0,100)}%"></b></i><p>${ratio>1?'Эта база превышает заявленный предел кокпита.':ratio>.8?'Работа близко к пределу — для будущего апгрейда лучше более жёсткая рама.':'Есть разумный запас по моменту и будущему апгрейду.'}</p></div></section>
  <section class="panel"><div class="panel-head"><div><h2>Рекомендации ${escapeHTML(sl.brand)}</h2><p>Под дисциплину ${escapeHTML(V14_DISCIPLINES[sl.discipline].label)} и платформу ${escapeHTML(sl.platform)}.</p></div></div><div class="recommend-strip">${recommended.map(i=>`<button class="recommend-item" data-action="product-detail" data-id="${i.id}"><span>${itemTypeName(i.type)}</span><b>${escapeHTML(i.name)}</b><small>${money(i.priceEUR)} · ${i.score}/100</small></button>`).join('')}</div></section>
  <section class="panel"><div class="panel-head"><div><h2>Путь апгрейда</h2><p>Последовательность без необходимости менять всё сразу.</p></div></div>${simUpgradePathHTMLV14(sl.brand,sl.discipline)}</section>`;
}
function simUpgradePathHTMLV14(brand,discipline){
  const arr=allItems().filter(i=>i.group==='sim'&&i.brand===brand), types=['wheelbase','wheel','pedals','cockpit']; const steps=[];
  types.forEach(type=>{ const list=arr.filter(i=>i.type===type).sort((a,b)=>a.score-b.score); if(list.length){steps.push(list[Math.min(list.length-1,Math.floor(list.length*.25))]); if(list.length>2)steps.push(list[Math.min(list.length-1,Math.floor(list.length*.68))]);} });
  return `<div class="upgrade-path">${steps.slice(0,7).map((i,n)=>`<button data-action="product-detail" data-id="${i.id}"><small>Этап ${n+1} · ${itemTypeName(i.type)}</small><b>${escapeHTML(i.name)}</b><span>${money(i.priceEUR)}</span></button>`).join('<i>→</i>')}</div>`;
}
function createSimLabBuildV14(){ const sl=state.simLab,budget=Math.max(1000,state.wizard.budgetEUR||1800); const r=generatePlanV14('sim',budget,'balanced',{brand:sl.brand,discipline:sl.discipline,platform:sl.platform,mount:sl.mount,priority:'balance'});const b={...deepClone(r.build),id:uid('build'),name:`${sl.brand} · ${V14_DISCIPLINES[sl.discipline].label}`,createdAt:Date.now(),updatedAt:Date.now()};state.builds.unshift(b);saveState();toast('Комплект Sim Racing создан',b.name);setActiveView('builds'); }

function warrantyInfoV14(entry){ if(!entry.warrantyUntil)return {days:null,label:'Гарантия не указана'};const d=parseDateV14(entry.warrantyUntil);if(!d)return {days:null,label:'Дата гарантии некорректна'};const days=Math.ceil((d-new Date())/86400000);return {days,label:days<0?`Гарантия истекла ${Math.abs(days)} дн. назад`:days===0?'Гарантия заканчивается сегодня':`Гарантия: ещё ${days} дн.`}; }
function inventoryNameV14(entry){ const item=getItem(entry.itemId);if(entry.customName)return entry.customName;return item?`${item.brand||''} ${item.name||''}`.trim():'Пользовательское устройство'; }
function renderInventoryV14(){
  const entries=state.inventory.filter(x=>state.inventoryFilter==='all'||x.status===state.inventoryFilter),totalOwned=state.inventory.filter(x=>x.status==='owned').reduce((s,x)=>s+(x.purchasePriceEUR||getItem(x.itemId)?.priceEUR||0),0),warrantySoon=state.inventory.filter(x=>{const d=warrantyInfoV14(x).days;return d!==null&&d>=0&&d<=60;}).length;
  const filters=['all','owned','ordered','planned','repair','sold'].map(s=>`<button class="${state.inventoryFilter===s?'active':''}" data-action="inventory-filter" data-status="${s}">${s==='all'?'Все':statusLabelV14(s)}</button>`).join('');
  $('#view-inventory').innerHTML=pageHead('Local ownership database','Мои устройства','Покупки, гарантия, серийные номера, обслуживание и будущие планы — полностью локально.','<button class="primary" data-action="inventory-add">＋ Добавить устройство</button>')+`<div class="stats-grid"><article class="stat-card"><small>Всего записей</small><strong>${state.inventory.length}</strong><div class="trend">На этом устройстве</div></article><article class="stat-card"><small>Куплено</small><strong>${state.inventory.filter(x=>x.status==='owned').length}</strong><div class="trend">Активное оборудование</div></article><article class="stat-card"><small>Стоимость покупок</small><strong>${money(totalOwned,true)}</strong><div class="trend">По введённым ценам</div></article><article class="stat-card"><small>Гарантия ≤ 60 дней</small><strong>${warrantySoon}</strong><div class="trend">Проверьте документы</div></article></div><div class="segmented inventory-tabs">${filters}</div>${entries.length?`<div class="inventory-grid">${entries.map(inventoryCardV14).join('')}</div>`:emptyHTML('Нет устройств в этом разделе','Добавьте товар из каталога или внесите своё устройство вручную.')}`;
}
function inventoryCardV14(entry){ const item=getItem(entry.itemId),w=warrantyInfoV14(entry);return `<article class="inventory-card"><header><span class="inventory-status ${entry.status}">${statusLabelV14(entry.status)}</span><button class="card-menu" data-action="inventory-edit" data-id="${entry.id}">•••</button></header><span class="eyebrow">${item?escapeHTML(itemTypeName(item.type)):'Своя запись'}</span><h3>${escapeHTML(inventoryNameV14(entry))}</h3><p>${escapeHTML(entry.notes||item?.description||'Без заметки')}</p><div class="inventory-meta"><span>Цена <b>${money(entry.purchasePriceEUR||item?.priceEUR||0)}</b></span><span class="${w.days!==null&&w.days<30?'danger':''}">${escapeHTML(w.label)}</span><span>${entry.store?`Магазин: ${escapeHTML(entry.store)}`:'Магазин не указан'}</span></div><div class="actions"><button class="secondary" data-action="inventory-edit" data-id="${entry.id}">Изменить</button>${item?`<button class="ghost" data-action="product-detail" data-id="${item.id}">Каталог</button>`:''}</div></article>`; }
function openInventoryFormV14(itemId='',entryId=''){
  const entry=state.inventory.find(x=>x.id===entryId),item=getItem(itemId||entry?.itemId),selectedId=item?.id||entry?.itemId||''; const options=allItems().slice().sort((a,b)=>`${a.brand} ${a.name}`.localeCompare(`${b.brand} ${b.name}`,'ru')).map(i=>`<option value="${i.id}" ${i.id===selectedId?'selected':''}>${escapeHTML(i.brand+' '+i.name)}</option>`).join('');
  openModal(entry?'Изменить устройство':'Добавить устройство','Локальная база',`<form id="inventoryForm" class="form-grid"><input type="hidden" name="id" value="${entry?.id||''}"><label class="full"><span>Товар из каталога</span><select name="itemId"><option value="">Своя запись</option>${options}</select></label><label class="full"><span>Своё название</span><input name="customName" value="${escapeHTML(entry?.customName||'')}" placeholder="Необязательно"></label><label><span>Статус</span><select name="status">${['owned','ordered','planned','repair','sold'].map(s=>`<option value="${s}" ${entry?.status===s?'selected':''}>${statusLabelV14(s)}</option>`).join('')}</select></label><label><span>Цена покупки, EUR</span><input name="purchasePriceEUR" type="number" min="0" step="0.01" value="${entry?.purchasePriceEUR||item?.priceEUR||0}"></label><label><span>Дата покупки</span><input name="purchaseDate" type="date" value="${entry?.purchaseDate||''}"></label><label><span>Гарантия до</span><input name="warrantyUntil" type="date" value="${entry?.warrantyUntil||''}"></label><label><span>Магазин</span><input name="store" value="${escapeHTML(entry?.store||'')}"></label><label><span>Серийный номер</span><input name="serial" value="${escapeHTML(entry?.serial||'')}"></label><label class="full"><span>Ссылка на чек или документ</span><input name="receipt" value="${escapeHTML(entry?.receipt||'')}" placeholder="https://… или номер документа"></label><label class="full"><span>Заметки и обслуживание</span><textarea name="notes">${escapeHTML(entry?.notes||'')}</textarea></label><div class="full actions">${entry?`<button type="button" class="ghost" data-action="inventory-delete" data-id="${entry.id}">Удалить</button>`:''}<button class="primary" type="submit">Сохранить</button></div></form>`,true);
  const form=$('#inventoryForm'); if(form) form.addEventListener('submit',event=>{event.preventDefault();event.stopImmediatePropagation();submitInventoryV14(form);},{once:true});
}
function submitInventoryV14(form){ const d=new FormData(form),id=String(d.get('id')||''),existing=state.inventory.find(x=>x.id===id);const row={id:existing?.id||uid('owned'),itemId:String(d.get('itemId')||''),customName:String(d.get('customName')||'').trim(),status:String(d.get('status')||'owned'),purchaseDate:String(d.get('purchaseDate')||''),purchasePriceEUR:Number(d.get('purchasePriceEUR'))||0,store:String(d.get('store')||'').trim(),warrantyUntil:String(d.get('warrantyUntil')||''),serial:String(d.get('serial')||'').trim(),receipt:String(d.get('receipt')||'').trim(),notes:String(d.get('notes')||'').trim(),createdAt:existing?.createdAt||Date.now()}; if(existing)Object.assign(existing,row);else state.inventory.unshift(row);saveState();closeModal();renderInventoryV14();toast('Устройство сохранено',inventoryNameV14(row)); }
function inventoryFromBuildV14(buildId){ const b=getBuild(buildId);if(!b)return;buildItems(b).forEach(({item})=>{if(!state.inventory.some(x=>x.itemId===item.id&&x.status==='owned'))state.inventory.push({id:uid('owned'),itemId:item.id,customName:'',status:'owned',purchaseDate:'',purchasePriceEUR:item.priceEUR,store:'',warrantyUntil:'',serial:'',receipt:'',notes:`Добавлено из сборки «${b.name}»`,createdAt:Date.now()});});saveState();toast('Компоненты добавлены','Откройте «Мои устройства», чтобы заполнить даты и гарантию.'); }

function encodeShareV14(build){ const payload={v:1,n:build.name,g:build.group,i:build.items.map(x=>[x.id,x.qty||1]),p:build.profile||{},t:Date.now()};const json=JSON.stringify(payload);try{const bytes=new TextEncoder().encode(json);let bin='';bytes.forEach(b=>bin+=String.fromCharCode(b));return btoa(bin).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}catch{return btoa(unescape(encodeURIComponent(json))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}}
function decodeShareV14(code){try{let s=code.replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';const bin=atob(s);let json;try{json=new TextDecoder().decode(Uint8Array.from(bin,c=>c.charCodeAt(0)));}catch{json=decodeURIComponent(escape(bin));}const p=JSON.parse(json);if(!p||!Array.isArray(p.i)||!p.g)return null;return {id:uid('build'),name:String(p.n||'Общая сборка'),group:String(p.g),items:p.i.map(x=>({id:String(x[0]),qty:clamp(Number(x[1])||1,1,99)})),profile:p.p||{},notes:'Импортировано по общей ссылке',createdAt:Date.now(),updatedAt:Date.now()};}catch{return null;}}
let sharedBuildV14=null;
function shareBuildV14(id){ const b=getBuild(id);if(!b)return;const code=encodeShareV14(b),url=`${location.origin}${location.pathname}#share=${code}`,qr=`https://api.qrserver.com/v1/create-qr-code/?size=360x360&margin=10&data=${encodeURIComponent(url)}`;openModal('Поделиться сборкой',b.name,`<div class="share-layout"><div class="qr-box"><img src="${escapeHTML(qr)}" alt="QR-код общей ссылки"><small>QR-код загружается через интернет. Сама сборка кодируется в ссылке и не отправляется на сервер SetupLab.</small></div><div><label class="share-url"><span>Общая ссылка</span><textarea readonly id="shareURL">${escapeHTML(url)}</textarea></label><div class="actions"><button class="primary" data-action="copy-share">Скопировать</button><button class="secondary" data-action="native-share" data-name="${escapeHTML(b.name)}">Поделиться</button></div><div class="issue good"><span class="dot"></span><span>Получатель сможет просмотреть и сохранить сборку без аккаунта. Нужна та же или более новая версия каталога.</span></div></div></div>`,true); }
async function copyTextV14(text){try{await navigator.clipboard.writeText(text);return true;}catch{const ta=document.createElement('textarea');ta.value=text;document.body.append(ta);ta.select();const ok=document.execCommand('copy');ta.remove();return ok;}}
function handleShareHashV14(){ const m=location.hash.match(/^#share=(.+)$/);if(!m)return;sharedBuildV14=decodeShareV14(m[1]);if(!sharedBuildV14){toast('Ссылка повреждена','Не удалось прочитать данные сборки.','bad');return;}setTimeout(()=>{const mtr=calculateBuild(sharedBuildV14);openModal('Получена общая сборка',sharedBuildV14.name,`<div class="metric-grid"><article class="metric-card"><small>Стоимость</small><b>${money(mtr.total)}</b></article><article class="metric-card"><small>Баллы</small><b>${mtr.score}/100</b></article><article class="metric-card"><small>Совместимость</small><b>${mtr.compatibility}%</b></article><article class="metric-card"><small>Компоненты</small><b>${mtr.count}</b></article></div><div class="actions" style="margin-top:18px"><button class="primary" data-action="import-shared">Сохранить в мои сборки</button><button class="secondary" data-action="close-modal">Только посмотреть</button></div>`,true);},250); }

function applyUpgradeV14(buildId,oldId,newId){ const b=getBuild(buildId),item=getItem(newId);if(!b||!item)return;if(oldId){const e=b.items.find(x=>x.id===oldId);if(e)e.id=newId;}else b.items.push({id:newId,qty:1});b.updatedAt=Date.now();saveState();closeModal();renderAll();openBuild(buildId);toast('Апгрейд применён',`${item.brand} ${item.name}`); }
function openDimensionsV14(buildId='',itemId=''){ const build=buildId?getBuild(buildId):null,item=itemId?getItem(itemId):null,dim=build?buildDimensionsV14(build):itemDimensionsV14(item);openModal('Профиль оценки',build?.name||`${item?.brand||''} ${item?.name||''}`.trim(),`<p class="muted">Каждая ось — внутренний сравнительный показатель SetupLab внутри соответствующей категории. Это помогает увидеть компромиссы, которые скрывает единый итоговый балл.</p>${dimensionBarsV14(dim)}<div class="issue warn"><span class="dot"></span><span>Надёжность, ликвидность, эргономика и тишина являются модельными оценками на основе характеристик каталога, цены, класса и открытости платформы. Их можно использовать для предварительного сравнения, но не вместо профильных измерений.</span></div>`,true); }

const openProductV13=openProduct;
openProduct=function(id){
  const item=getItem(id);if(!item)return;recordPriceV14(item,'view');saveState();const img=itemImage(item),price=priceState(item),links=purchaseLinks(item),dim=itemDimensionsV14(item);const specs=Object.entries(item.specs||{}).map(([k,v])=>`<div class="spec-row"><span>${escapeHTML(k)}</span><b>${escapeHTML(v)}</b></div>`).join('');const stores=links.map(link=>`<a class="store-card ${link.id==='market'?'featured':''}" href="${escapeHTML(link.url)}" target="_blank" rel="noopener noreferrer"><span class="store-icon">${escapeHTML(link.icon)}</span><span><b>${escapeHTML(link.label)}</b><small>${escapeHTML(link.note)}</small></span><i>↗</i></a>`).join('');const itemEnergy=Number(item.powerW||0)/1000*state.hoursPerDay*365*state.electricityEUR;
  openModal(item.name,item.brand,`<div class="detail-layout"><div><div class="detail-image" data-item-image="${item.id}"><div class="product-placeholder">${iconFor(item.group)}</div>${img?imageHTML(img,item):''}<span class="price-status ${price.className}">${price.label}</span></div><div class="actions" style="margin-top:10px"><button class="secondary" data-action="find-image" data-id="${item.id}">Найти фото</button><button class="ghost" data-action="inventory-add" data-item-id="${item.id}">В мои устройства</button></div></div><div class="detail-data"><section class="product-summary"><span class="eyebrow">Кратко о модели</span><p>${escapeHTML(item.description||'Описание не заполнено.')}</p></section><div class="metric-grid"><article class="metric-card metric-price"><small>Цена каталога</small><b>${money(item.priceEUR)}</b><span>${price.date?`проверено ${escapeHTML(price.date)}`:'редактируется локально'}</span></article><article class="metric-card metric-clickable" data-action="score-help" data-group="${item.group}"><small>Баллы</small><b>${item.score}/100</b><span>${scoreBand(item.score)}</span></article><article class="metric-card metric-clickable" data-action="upgrade-help" data-item-id="${item.id}"><small>Апгрейдность</small><b>${item.upgrade}%</b><span>Открыть методику</span></article><article class="metric-card metric-clickable" data-action="annual-help" data-item-id="${item.id}"><small>Расходы/год</small><b>${money((item.futureAnnualEUR||0)+itemEnergy)}</b><span>Энергия + обслуживание</span></article></div><section class="explain-card"><div class="panel-head"><div><h3>Профиль характеристик</h3><p>Десять независимых осей оценки.</p></div><button class="ghost compact" data-action="show-dimensions" data-item-id="${item.id}">Подробнее</button></div>${dimensionBarsV14(dim,6)}</section>${priceChartV14(item)}<div class="spec-table">${specs||'<div class="spec-row"><span>Характеристики</span><b>Не заполнены</b></div>'}</div><section class="purchase-panel"><div class="panel-head"><div><h3>Купить или проверить цену</h3><p>Цена и наличие могут измениться.</p></div></div><div class="store-grid">${stores}</div></section><div class="actions"><button class="primary" data-action="add-item" data-id="${item.id}">Добавить в сборку</button><button class="secondary" data-action="edit-product" data-id="${item.id}">Изменить данные</button></div><p class="muted source-note">${escapeHTML(item.sourceNote||'Данные редактируются локально.')}</p></div></div>`,true);hydrateImages();
};

const submitEditProductV13=submitEditProduct;
submitEditProduct=function(form){ const d=new FormData(form),id=String(d.get('id')),before=getItem(id);if(before)recordPriceV14(before,'before-edit');submitEditProductV13(form);const after=getItem(id);if(after)recordPriceV14(after,'local-edit');saveState(); };

const openBuildV13=openBuild;
openBuild=function(id){
  const build=getBuild(id);if(!build)return;const m=calculateBuild(build),weak=analyzeWeakPointsV14(build),upgrades=nextUpgradesV14(build);
  const components=buildItems(build).map(({entry,item})=>`<div class="component-row"><span class="component-thumb">${itemImage(item)?imageHTML(itemImage(item),item):iconFor(item.group)}</span><span><strong>${escapeHTML(item.brand+' '+item.name)}</strong><small>${escapeHTML(itemTypeName(item.type))} · ${money(item.priceEUR)} × ${entry.qty||1}</small></span><span class="qty">×${entry.qty||1}</span><button class="remove-button" data-action="remove-build-item" data-build-id="${build.id}" data-item-id="${item.id}">×</button></div>`).join('');
  const issues=m.issues.map(i=>`<div class="issue ${i.level}"><span class="dot"></span><span><b>${i.level==='bad'?'Конфликт':i.level==='warn'?'Проверить':'Готово'}</b>${escapeHTML(i.text)}${i.fix?`<small>${escapeHTML(i.fix)}</small>`:''}</span></div>`).join('');
  const weakHTML=weak.length?weak.map(x=>`<article class="weak-card ${x.level}"><span>${x.level==='bad'?'!':'↘'}</span><div><b>${escapeHTML(x.title)}</b><p>${escapeHTML(x.text)}</p><small>${escapeHTML(x.fix||'')}</small></div></article>`).join(''):'<div class="issue good"><span class="dot"></span><span>Выраженных слабых мест не найдено.</span></div>';
  const upHTML=upgrades.length?upgrades.map(u=>`<article class="upgrade-card"><div><span class="eyebrow">${u.kind==='add'?'Добавить':'Заменить'}</span><h4>${escapeHTML(u.item.brand+' '+u.item.name)}</h4><p>${escapeHTML(u.reason)}</p></div><div class="upgrade-price"><b>+${money(u.net)}</b><small>прирост ≈ ${u.gain}</small><button class="primary compact" data-action="apply-upgrade" data-build-id="${build.id}" data-old-id="${u.oldId}" data-new-id="${u.item.id}">Применить</button></div></article>`).join(''):'<p class="muted">Для этой сборки пока нет совместимой замены с заметным приростом.</p>';
  openModal(build.name,categoryName(build.group),`<div class="actions" style="margin-bottom:14px"><button class="primary" data-action="go-catalog-build" data-group="${build.group}">＋ Компонент</button><button class="secondary" data-action="edit-build" data-id="${build.id}">Редактировать</button><button class="secondary" data-action="share-build" data-id="${build.id}">Поделиться</button><button class="ghost" data-action="inventory-from-build" data-id="${build.id}">В мои устройства</button></div><div class="metric-grid"><article class="metric-card"><small>Стоимость</small><b>${money(m.total)}</b></article><article class="metric-card"><small>Баллы</small><b>${m.score}/100</b></article><article class="metric-card"><small>Совместимость</small><b>${m.compatibility}%</b></article><article class="metric-card"><small>Апгрейдность</small><b>${m.upgrade}%</b></article><article class="metric-card"><small>Цена балла</small><b>${money(m.pricePerPoint)}</b></article><article class="metric-card"><small>Расходы/год</small><b>${money(m.annual)}</b></article><article class="metric-card"><small>3 года</small><b>${money(m.threeYear)}</b></article><article class="metric-card metric-clickable" data-action="show-dimensions" data-build-id="${build.id}"><small>Профиль</small><b>10 осей</b><span>Открыть</span></article></div><section class="panel build-insight"><div class="panel-head"><div><h3>Анализ слабых мест</h3><p>Конфликты, дисбаланс и неполная комплектация.</p></div></div><div class="weak-grid">${weakHTML}</div></section><section class="panel build-insight"><div class="panel-head"><div><h3>Что купить следующим</h3><p>Прирост с учётом совместимости и ориентировочной перепродажи.</p></div></div><div class="upgrade-list">${upHTML}</div></section><div class="section-grid build-detail-grid"><section><div class="panel-head" style="margin-top:18px"><div><h3>Компоненты</h3><p>${m.count} позиций</p></div></div>${components?`<div class="component-list">${components}</div>`:emptyHTML('Сборка пустая','Добавьте компоненты из каталога.')}</section><section><div class="panel-head" style="margin-top:18px"><div><h3>Глубокая проверка</h3><p>Причина и рекомендуемое действие</p></div></div><div class="issue-list">${issues}</div></section></div>`,true);hydrateImages();
};

const compareCardHTMLV13=compareCardHTML;
compareCardHTML=function(build){ const base=compareCardHTMLV13(build),dim=buildDimensionsV14(build);return base.replace('</article>',`<div class="compare-dimensions">${['performance','value','reliability','ergonomics'].map(k=>`<span><small>${V14_DIMENSIONS[k]}</small><i><b style="width:${dim[k]}%"></b></i><strong>${dim[k]}</strong></span>`).join('')}</div></article>`); };

const renderDashboardV13=renderDashboard;
renderDashboard=function(){ renderDashboardV13();const hero=$('#view-dashboard .hero');if(!hero)return;hero.insertAdjacentHTML('afterend',`<section class="module-launch-grid"><button data-action="go" data-view="wizard"><span>✦</span><div><b>Умный мастер</b><small>Три варианта под бюджет и цель</small></div></button><button data-action="go" data-view="simlab"><span>◉</span><div><b>Sim Racing Lab</b><small>Момент, экосистемы и кокпит</small></div></button><button data-action="go" data-view="presets"><span>▦</span><div><b>Готовые комплекты</b><small>Копируйте и изменяйте пресеты</small></div></button><button data-action="go" data-view="inventory"><span>◇</span><div><b>Мои устройства</b><small>Гарантия и история владения</small></div></button></section>`); };

const renderSettingsV13=renderSettings;
renderSettings=function(){ renderSettingsV13();const themes=$('#view-settings .theme-cards');if(themes)themes.insertAdjacentHTML('beforeend',`${themeCard('porsche','Porsche Motorsport')}${themeCard('amg','Mercedes AMG')}${themeCard('mclaren','McLaren')}${themeCard('brutalist','Brutalist')}${themeCard('industrial','Industrial')}${themeCard('oled','OLED Black')}${themeCard('blueprint','Blueprint')}${themeCard('terminal','Terminal')}`);const grid=$('#view-settings .settings-grid');if(grid)grid.insertAdjacentHTML('afterbegin',`<section class="setting-card"><h3>Инженерные модули v1.5</h3><p>Мега-каталог на 2900 позиций, строгий бюджетный мастер, Sim Racing Lab, история цен, общие ссылки и учёт оборудования.</p><div class="setting-stack"><button class="secondary" data-action="go" data-view="wizard">Открыть мастер</button><button class="secondary" data-action="go" data-view="simlab">Открыть Sim Racing Lab</button><button class="secondary" data-action="go" data-view="inventory">Мои устройства (${state.inventory.length})</button></div></section>`); };

const renderViewV13=renderView;
renderView=function(view){ if(view==='wizard')renderWizardV14();else if(view==='simlab')renderSimLabV14();else if(view==='presets')renderPresetsV14();else if(view==='inventory')renderInventoryV14();else renderViewV13(view); };
renderAll=function(){const view=V14_VIEWS.includes(state.activeView)?state.activeView:'dashboard';renderView(view);setActiveView(view,false,false);syncTopControls();};

function openQuickLabV14(){ openModal('Лаборатория SetupLab','Быстрый запуск',`<div class="quick-lab-grid"><button data-action="go-modal" data-view="wizard"><span>✦</span><b>Мастер подбора</b><small>Собрать три сценария</small></button><button data-action="new-build"><span>＋</span><b>Новая сборка</b><small>Начать вручную</small></button><button data-action="go-modal" data-view="simlab"><span>◉</span><b>Sim Racing Lab</b><small>Экосистемы и момент</small></button><button data-action="go-modal" data-view="presets"><span>▦</span><b>Готовые комплекты</b><small>Выбрать пресет</small></button><button data-action="go-modal" data-view="inventory"><span>◇</span><b>Мои устройства</b><small>Гарантия и владение</small></button><button data-action="custom-item"><span>⌁</span><b>Своя позиция</b><small>Добавить в каталог</small></button></div>`); }

let v14EventsBound=false;
function bindV14Events(){ if(v14EventsBound)return;v14EventsBound=true;
  document.addEventListener('click',async e=>{const t=e.target.closest('[data-action]');if(!t)return;const a=t.dataset.action;
    if(a==='quick-lab')openQuickLabV14();
    else if(a==='go-modal'){closeModal();setActiveView(t.dataset.view);}
    else if(a==='create-wizard-build')saveWizardPlanV14(Number(t.dataset.index));
    else if(a==='create-all-wizard-builds'){wizardResultsV14.forEach((r,i)=>{if(!r.over&&r.complete)saveWizardPlanV14(i);});setActiveView('builds');}
    else if(a==='preset-group'){state.presetGroup=t.dataset.group;saveState();renderPresetsV14();}
    else if(a==='preview-preset')createPresetV14(t.dataset.id,true);
    else if(a==='create-preset')createPresetV14(t.dataset.id,false);
    else if(a==='sim-brand'){state.simLab.brand=t.dataset.brand;state.simLab.baseId='';saveState();renderSimLabV14();}
    else if(a==='sim-select-base'){state.simLab.baseId=t.dataset.id;saveState();renderSimLabV14();}
    else if(a==='create-simlab-build')createSimLabBuildV14();
    else if(a==='inventory-add')openInventoryFormV14(t.dataset.itemId||'');
    else if(a==='inventory-edit')openInventoryFormV14('',t.dataset.id);
    else if(a==='inventory-delete'){if(confirm('Удалить запись об устройстве?')){state.inventory=state.inventory.filter(x=>x.id!==t.dataset.id);saveState();closeModal();renderInventoryV14();}}
    else if(a==='inventory-filter'){state.inventoryFilter=t.dataset.status;saveState();renderInventoryV14();}
    else if(a==='inventory-from-build')inventoryFromBuildV14(t.dataset.id);
    else if(a==='share-build')shareBuildV14(t.dataset.id);
    else if(a==='copy-share'){const ok=await copyTextV14($('#shareURL')?.value||'');toast(ok?'Ссылка скопирована':'Не удалось скопировать','','');}
    else if(a==='native-share'){const url=$('#shareURL')?.value||'';if(navigator.share)navigator.share({title:t.dataset.name||'SetupLab',url}).catch(()=>{});else copyTextV14(url);}
    else if(a==='import-shared'&&sharedBuildV14){state.builds.unshift(sharedBuildV14);saveState();location.hash='';closeModal();renderAll();toast('Общая сборка сохранена');sharedBuildV14=null;}
    else if(a==='apply-upgrade')applyUpgradeV14(t.dataset.buildId,t.dataset.oldId,t.dataset.newId);
    else if(a==='show-dimensions')openDimensionsV14(t.dataset.buildId||'',t.dataset.itemId||'');
    else if(a==='go-catalog-build'){state.catalogGroup=t.dataset.group;closeModal();setActiveView('catalog');}
  });
  document.addEventListener('submit',e=>{const f=e.target;if(f.id==='wizardForm'){e.preventDefault();submitWizardV14(f);}else if(f.id==='inventoryForm'){e.preventDefault();submitInventoryV14(f);}});
  document.addEventListener('change',e=>{const el=e.target;if(el.id==='simBrand'){state.simLab.brand=el.value;state.simLab.baseId='';saveState();renderSimLabV14();}if(el.id==='simDiscipline'){state.simLab.discipline=el.value;saveState();renderSimLabV14();}if(el.id==='simPlatform'){state.simLab.platform=el.value;saveState();renderSimLabV14();}if(el.id==='simMount'){state.simLab.mount=el.value;saveState();renderSimLabV14();}if(el.id==='simBaseSelect'){state.simLab.baseId=el.value;saveState();renderSimLabV14();}if(el.id==='simCockpitSelect'){state.simLab.cockpitId=el.value;saveState();renderSimLabV14();}});
}

setTheme=function(theme){ if(!V14_THEMES.includes(theme))return;state.theme=theme;saveState();applyTheme();renderAll();const names={dark:'Тёмная',light:'Светлая',graphite:'Graphite',navy:'Midnight Navy',titanium:'Titanium',mono:'Monochrome',corsa:'Assetto Corsa',porsche:'Porsche Motorsport',amg:'Mercedes AMG',mclaren:'McLaren',brutalist:'Brutalist',industrial:'Industrial',oled:'OLED Black',blueprint:'Blueprint',terminal:'Terminal'};toast('Тема изменена',`${names[theme]||theme} включена.`);};
cycleTheme=function(){const list=V14_THEMES;setTheme(list[(list.indexOf(state.theme)+1)%list.length]);};

const initV13=init;
init=async function(){ await initV13();bindV14Events();handleShareHashV14(); };
init();
