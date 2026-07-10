'use strict';

const STORAGE_KEY = 'setuplab.state.v1';
const APP_VERSION = '1.3.0';
const categoryIcons = { pc:'⌨', sim:'◉', cinema:'▰', workspace:'▦', photo:'◍', audio:'♫' };
const typeLabels = {
  cpu:'Процессор', gpu:'Видеокарта', motherboard:'Материнская плата', ram:'Память', storage:'Накопитель', psu:'Блок питания', case:'Корпус', cooler:'Охлаждение',
  wheelbase:'Рулевая база', wheel:'Руль', pedals:'Педали', cockpit:'Кокпит', shifter:'Шифтер', handbrake:'Ручной тормоз', dashboard:'Телеметрия и панели',
  display:'Телевизор', projector:'Проектор', receiver:'AV-ресивер', speakers:'Акустика', soundbar:'Саундбар', subwoofer:'Сабвуфер', source:'Источник', screen:'Экран',
  monitor:'Монитор', desk:'Стол', chair:'Кресло', keyboard:'Клавиатура', mouse:'Мышь', dock:'Док-станция', lighting:'Свет', monitorarm:'Кронштейн', webcam:'Веб-камера',
  camera:'Камера', lens:'Объектив', gimbal:'Стабилизатор', flash:'Вспышка', tripod:'Штатив',
  amplifier:'Усилитель', turntable:'Проигрыватель', headphones:'Наушники', activemonitors:'Активные мониторы', interface:'Аудиоинтерфейс', microphone:'Микрофон'
};
const essentialTypes = {
  pc: ['cpu','gpu','motherboard','ram','storage','psu','case','cooler'],
  sim: ['wheelbase','wheel','pedals','cockpit'],
  cinema: ['display|projector','receiver|soundbar','speakers|soundbar','source'],
  workspace: ['monitor','desk','chair','keyboard','mouse'],
  photo: ['camera','lens','storage'],
  audio: ['speakers|activemonitors|headphones','amplifier|activemonitors|headphones','source|interface|turntable']
};
const typeWeights = {
  cpu:1.25,gpu:1.5,motherboard:.8,ram:.75,storage:.65,psu:.55,case:.45,cooler:.55,
  wheelbase:1.5,wheel:.9,pedals:1.2,cockpit:1.0,shifter:.45,handbrake:.4,dashboard:.35,
  display:1.4,projector:1.4,receiver:1.1,speakers:1.3,soundbar:1.1,subwoofer:.8,source:.5,screen:.55,
  monitor:1.4,desk:1.0,chair:1.2,keyboard:.55,mouse:.55,dock:.7,lighting:.45,monitorarm:.4,webcam:.45,
  camera:1.5,lens:1.5,gimbal:.7,flash:.55,tripod:.5,
  amplifier:1.2,turntable:.8,headphones:1.2,activemonitors:1.4,interface:.9,microphone:.8
};

const currencyMeta = {
  EUR:{label:'EUR',name:'Евро',symbol:'€'},
  RUB:{label:'RUB',name:'Российский рубль',symbol:'₽'},
  USD:{label:'USD',name:'Доллар США',symbol:'$'},
  GBP:{label:'GBP',name:'Фунт стерлингов',symbol:'£'},
  CNY:{label:'CNY',name:'Китайский юань',symbol:'¥'},
  RSD:{label:'RSD',name:'Сербский динар',symbol:'дин.'}
};
const verifiedRates = { EUR:1, USD:1.1435, RUB:86.5906, GBP:.8518, CNY:7.7712, RSD:117.37 };
const verifiedRatesDate = '10.07.2026';
const officialDomains = {
  'AMD':'amd.com','Intel':'intel.com','NVIDIA':'nvidia.com','ASUS':'asus.com','ASRock':'asrock.com','MSI':'msi.com','Gigabyte':'gigabyte.com','Corsair':'corsair.com','Kingston':'kingston.com','Crucial':'crucial.com','G.Skill':'gskill.com','TeamGroup':'teamgroupinc.com','Samsung':'samsung.com','WD':'westerndigital.com','SanDisk':'sandisk.com','Seagate':'seagate.com','Solidigm':'solidigm.com','Seasonic':'seasonic.com','Cooler Master':'coolermaster.com','be quiet!':'bequiet.com','Fractal Design':'fractal-design.com','HYTE':'hyte.com','NZXT':'nzxt.com','Lian Li':'lian-li.com','Noctua':'noctua.at','ARCTIC':'arctic.de','DeepCool':'deepcool.com','Thermalright':'thermalright.com',
  'MOZA Racing':'mozaracing.com','Fanatec':'fanatec.com','Simagic':'simagic.com','Simucube':'simucube.com','Asetek SimSports':'aseteksimsports.com','Heusinkveld':'heusinkveld.com','VRS':'virtualracingschool.com','Thrustmaster':'thrustmaster.com','Logitech':'logitech.com','Playseat':'playseat.com','Next Level Racing':'nextlevelracing.com','Sim-Lab':'sim-lab.eu','Trak Racer':'trakracer.com','GT Omega':'gtomega.com','RSeat':'rseat.net','SHH':'shiftershh.com','Apex Sim Racing':'apexsimracing.com','Cube Controls':'cubecontrols.com','VNM':'vnmsimulation.com','SimHub':'simhubdash.com',
  'LG':'lg.com','Sony':'sony.com','Samsung':'samsung.com','Panasonic':'panasonic.com','Philips':'philips.com','Hisense':'hisense.com','TCL':'tcl.com','Epson':'epson.com','JVC':'jvc.com','BenQ':'benq.com','Formovie':'formovie.com','Denon':'denon.com','Marantz':'marantz.com','Onkyo':'onkyo.com','Anthem':'anthemav.com','Yamaha':'yamaha.com','KEF':'kef.com','Focal':'focal.com','DALI':'dali-speakers.com','Bowers & Wilkins':'bowerswilkins.com','Q Acoustics':'qacoustics.com','Klipsch':'klipsch.com','Polk Audio':'polkaudio.com','SVS':'svsound.com','REL':'rel.net','Sonos':'sonos.com','Bose':'bose.com','Sennheiser':'sennheiser.com','Kaleidescape':'kaleidescape.com','Magnetar':'magnetar-audio.com','Zidoo':'zidoo.tv','Elite Screens':'elitescreens.com','Screen Innovations':'screeninnovations.com','Stewart Filmscreen':'stewartfilmscreen.com','Vividstorm':'vividstormscreen.com','XGIMI':'xgimi.com','Valerion':'valerion.com',
  'Apple':'apple.com','Dell':'dell.com','Eizo':'eizo.com','IKEA':'ikea.com','Herman Miller':'hermanmiller.com','Steelcase':'steelcase.com','Haworth':'haworth.com','Humanscale':'humanscale.com','FlexiSpot':'flexispot.com','Branch':'branchfurniture.com','USM':'usm.com','Grovemade':'grovemade.com','Secretlab':'secretlab.co','Ergotron':'ergotron.com','CBS':'colebrookbossonsaunders.com','Keychron':'keychron.com','Wooting':'wooting.io','HHKB':'hhkeyboard.us','NuPhy':'nuphy.com','Razer':'razer.com','Microsoft':'microsoft.com','Anker':'anker.com','CalDigit':'caldigit.com','OWC':'owc.com','Kensington':'kensington.com','Elgato':'elgato.com','Dyson':'dyson.com','Philips Hue':'philips-hue.com','OBSBOT':'obsbot.com','Insta360':'insta360.com','Contour Design':'contourdesign.com',
  'Canon':'canon.com','Nikon':'nikon.com','Fujifilm':'fujifilm.com','Leica':'leica-camera.com','OM System':'omsystem.com','Sigma':'sigma-global.com','Tamron':'tamron.com','DJI':'dji.com','Zhiyun':'zhiyun-tech.com','Godox':'godox.com','Profoto':'profoto.com','Manfrotto':'manfrotto.com','Gitzo':'gitzo.com','Peak Design':'peakdesign.com','SmallRig':'smallrig.com','Leofoto':'leofoto.com','Lexar':'lexar.com','Angelbird':'angelbird.com','ProGrade':'progradedigital.com',
  'Cambridge Audio':'cambridgeaudio.com','Hegel':'hegel.com','NAD':'nadelectronics.com','Naim':'naimaudio.com','Rotel':'rotel.com','Monitor Audio':'monitoraudio.com','Wharfedale':'wharfedale.co.uk','Arendal Sound':'arendalsound.com','Audeze':'audeze.com','Beyerdynamic':'beyerdynamic.com','HiFiMAN':'hifiman.com','Meze Audio':'mezeaudio.com','Technics':'technics.com','Rega':'rega.co.uk','Pro-Ject':'project-audio.com','Bluesound':'bluesound.com','Eversolo':'eversolo.com','Matrix Audio':'matrix-digi.com','WiiM':'wiimhome.com','Genelec':'genelec.com','Neumann':'neumann.com','ADAM Audio':'adam-audio.com','Kali Audio':'kaliaudio.com','Focusrite':'focusrite.com','Universal Audio':'uaudio.com','RME':'rme-audio.de','MOTU':'motu.com','Audient':'audient.com','Shure':'shure.com','Rode':'rode.com','Audio-Technica':'audio-technica.com','Electro-Voice':'electrovoice.com','JBL':'jbl.com'
};

const defaultState = {
  version: 3,
  theme: 'dark',
  currency: 'RUB',
  rates: { ...verifiedRates },
  ratesUpdated: verifiedRatesDate,
  electricityEUR: .30,
  hoursPerDay: 4,
  activeView: 'dashboard',
  catalogGroup: 'pc',
  catalogSearch: '',
  catalogType: 'all',
  builds: [],
  customItems: [],
  catalogOverrides: {},
  imageCache: {},
  compareIds: []
};

let catalog = { categories:{}, items:[] };
let state = loadState();
let deferredInstallPrompt = null;
let imageQueue = [];
let imageQueueBusy = 0;
let imageObserver = null;
const IMAGE_CONCURRENCY = 2;
let catalogVisibleCount = 0;
const catalogPageSize = () => window.innerWidth <= 780 ? 18 : 36;

const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];
function deepClone(value){ return typeof structuredClone === 'function' ? structuredClone(value) : JSON.parse(JSON.stringify(value)); }
const uid = (prefix='id') => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
const clamp = (n,min,max) => Math.min(max,Math.max(min,n));
const escapeHTML = (v='') => String(v).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

function loadState(){
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return deepClone(defaultState);
    const parsed = JSON.parse(raw);
    const merged = { ...deepClone(defaultState), ...parsed, rates:{...defaultState.rates,...(parsed.rates||{})} };
    if(Number(parsed.version||1)<3){
      merged.version=3;
      merged.rates={...verifiedRates};
      merged.ratesUpdated=verifiedRatesDate;
    }
    return merged;
  } catch { return deepClone(defaultState); }
}
function saveState(){
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  catch { toast('Не удалось сохранить','Проверьте настройки хранилища Safari.','bad'); }
}
function applyTheme(){
  const allowed=['dark','light','corsa','graphite','navy','titanium','mono'];
  if(!allowed.includes(state.theme)) state.theme='dark';
  document.documentElement.dataset.theme = state.theme;
  const colors={light:'#f4f5f8',corsa:'#050505',graphite:'#111214',navy:'#07111f',titanium:'#d9dde3',mono:'#0b0b0b',dark:'#090a0d'};
  $('meta[name="theme-color"]').setAttribute('content',colors[state.theme]||colors.dark);
}
function getItem(id){
  const base = catalog.items.find(i => i.id === id) || state.customItems.find(i => i.id === id);
  if (!base) return null;
  return { ...base, ...(state.catalogOverrides[id] || {}) };
}
function allItems(){ return [...catalog.items, ...state.customItems].map(i => ({...i,...(state.catalogOverrides[i.id]||{})})); }
function getBuild(id){ return state.builds.find(b => b.id === id); }
function categoryName(group){ return catalog.categories[group]?.name || group; }
function itemTypeName(type){ return typeLabels[type] || type; }
function iconFor(group){ return categoryIcons[group] || '◇'; }
function convertEUR(value){ return Number(value || 0) * (state.rates[state.currency] || 1); }
function currencySymbol(){ return currencyMeta[state.currency]?.symbol || state.currency; }
function money(valueEUR, compact=false){
  const value = convertEUR(valueEUR);
  const digits = state.currency==='RUB' || state.currency==='RSD' ? 0 : (value<100?2:0);
  return new Intl.NumberFormat('ru-RU',{style:'currency',currency:state.currency,maximumFractionDigits:compact?0:digits,notation:compact&&Math.abs(value)>=100000?'compact':'standard'}).format(value);
}
function currencyOptions(selected=state.currency){
  return Object.entries(currencyMeta).map(([id,c])=>`<option value="${id}" ${selected===id?'selected':''}>${c.symbol} ${c.label}</option>`).join('');
}
function syncTopControls(){
  const quick=$('#quickCurrency'); if(quick) quick.value=state.currency;
  const label=$('#currencyRateLabel'); if(label) label.textContent=`1 EUR = ${number(state.rates[state.currency]||1, state.currency==='RUB'||state.currency==='RSD'?2:4)} ${state.currency}`;
}
function productQuery(item){ return `${item.brand||''} ${item.name||''}`.replace(/\s+/g,' ').trim(); }
function officialLookupURL(item){
  if(item.purchase?.official) return item.purchase.official;
  const domain=officialDomains[item.brand];
  const q=domain?`site:${domain} ${productQuery(item)}`:`${productQuery(item)} official product`;
  return `https://www.google.com/search?q=${encodeURIComponent(q)}`;
}
function purchaseLinks(item){
  const q=encodeURIComponent(productQuery(item));
  const stored=item.purchase||{};
  const links=[
    {id:'market',label:'Яндекс Маркет',note:'Сравнить предложения',url:stored.market||`https://market.yandex.ru/search?text=${q}`,icon:'Я'},
    {id:'ozon',label:'Ozon',note:'Поиск в России',url:stored.ozon||`https://www.ozon.ru/search/?text=${q}`,icon:'O'}
  ];
  if(['pc','workspace','cinema','photo'].includes(item.group)) links.push({id:'dns',label:'DNS',note:'Проверить наличие',url:stored.dns||`https://www.dns-shop.ru/search/?q=${q}`,icon:'D'});
  links.push({id:'official',label:'Официальный сайт',note:'Характеристики и MSRP',url:officialLookupURL(item),icon:'↗'});
  return links;
}
function priceState(item){
  const market=item.priceBasis==='market';
  return {label:market?'Цена проверена':'Ориентировочная цена',className:market?'verified':'estimate',date:item.priceChecked||item.updated||''};
}
function scoreBand(score){
  const s=Number(score)||0;
  if(s>=90)return 'Флагман'; if(s>=75)return 'Высокий класс'; if(s>=60)return 'Сильный'; if(s>=40)return 'Базовый'; return 'Начальный';
}
function categoryAccent(group){ const v=catalog.categories[group]?.accent||'#7c5cff'; return /^#[0-9a-f]{3,8}$/i.test(v)?v:'#7c5cff'; }
function number(value, digits=0){ return new Intl.NumberFormat('ru-RU',{maximumFractionDigits:digits}).format(value); }
function hashString(value=''){
  let hash=0;
  for(let i=0;i<value.length;i++) hash=((hash<<5)-hash+value.charCodeAt(i))|0;
  return Math.abs(hash);
}
function autoImageQuery(item){
  return `${item.brand||''} ${item.name||''} ${itemTypeName(item.type)} product photo`.trim();
}
function bingImageURL(item){
  const host=(hashString(item.id||item.name)%4)+1;
  const query=encodeURIComponent(autoImageQuery(item));
  return `https://tse${host}.mm.bing.net/th?q=${query}&w=900&h=600&c=7&rs=1&p=0&o=7&pid=1.7&mkt=en-US&cc=US&setlang=en&adlt=moderate&t=1`;
}
function fallbackImageURL(item){
  const known=Object.prototype.hasOwnProperty.call(typeLabels,item.type);
  return `./assets/fallbacks/${known?item.type:'generic'}.svg`;
}
function itemImage(item){
  if (item.image) return { url:item.image, credit:item.imageCredit || 'Пользовательское изображение', kind:'custom' };
  const cached = state.imageCache[item.id];
  if(cached) return { url:cached.thumbnail || cached.url, credit:[cached.creator,cached.license].filter(Boolean).join(' · '), landing:cached.landing, kind:'cached' };
  return { url:fallbackImageURL(item), remote:bingImageURL(item), credit:'Фото загружается при просмотре', kind:'lazy' };
}
function handleProductImageError(img){
  if(!img) return;
  const fallback=img.dataset.fallbackSrc;
  if(fallback && !img.src.endsWith(fallback.replace('./','')) && img.dataset.triedFallback!=='1'){
    img.dataset.triedFallback='1';
    img.closest('.product-image, .detail-image, .component-thumb')?.classList.add('using-fallback');
    const credit=img.parentElement?.querySelector('.image-credit');
    if(credit) credit.textContent='Локальная иллюстрация';
    img.src=fallback;
    return;
  }
  img.removeAttribute('data-remote-src');
}
window.handleProductImageError=handleProductImageError;
function buildItems(build){
  return (build?.items || []).map(entry => ({ entry, item:getItem(entry.id) })).filter(x=>x.item);
}

function completenessFor(group, items){
  const present = new Set(items.map(i=>i.item.type));
  const req = essentialTypes[group] || [];
  if (!req.length) return 1;
  const hit = req.filter(rule => rule.split('|').some(t=>present.has(t))).length;
  return hit / req.length;
}

function calculateBuild(build){
  const rows = buildItems(build);
  let total=0, annual=0, power=0, weightedScore=0, weightedUpgrade=0, weight=0;
  for (const {entry,item} of rows){
    const qty = Math.max(1,Number(entry.qty)||1);
    const w = (typeWeights[item.type] || .6) * Math.min(qty,2);
    total += Number(item.priceEUR||0) * qty;
    annual += Number(item.futureAnnualEUR||0) * qty;
    power += Number(item.powerW||0) * qty;
    weightedScore += Number(item.score||0) * w;
    weightedUpgrade += Number(item.upgrade||0) * w;
    weight += w;
  }
  const completeness = completenessFor(build.group, rows);
  const rawScore = weight ? weightedScore/weight : 0;
  const score = Math.round(rawScore * (.55 + .45*completeness));
  const upgrade = Math.round((weight?weightedUpgrade/weight:0) * (.7 + .3*completeness));
  const energyAnnual = power/1000 * state.hoursPerDay * 365 * state.electricityEUR;
  const compatibility = checkCompatibility(build, rows);
  return {
    total, score, upgrade, power,
    annual: annual + energyAnnual,
    recurringAnnual: annual,
    energyAnnual,
    threeYear: total + (annual+energyAnnual)*3,
    pricePerPoint: score ? total/score : 0,
    completeness: Math.round(completeness*100),
    compatibility: compatibility.percent,
    issues: compatibility.issues,
    count: rows.reduce((s,r)=>s+(Number(r.entry.qty)||1),0)
  };
}

function checkCompatibility(build, rows){
  const items = rows.map(r=>r.item);
  const issues=[];
  const byType = t => items.filter(i=>i.type===t);
  const add = (level,text) => issues.push({level,text});
  const oneOnly = types => types.forEach(t => { if(byType(t).length>1) add('warn',`Добавлено несколько компонентов типа «${itemTypeName(t)}». Проверьте, нужен ли каждый из них.`); });

  if (build.group==='pc'){
    oneOnly(['cpu','gpu','motherboard','psu','case','cooler']);
    const cpu=byType('cpu')[0], mb=byType('motherboard')[0], ram=byType('ram')[0], psu=byType('psu')[0], gpu=byType('gpu')[0], pcCase=byType('case')[0], cooler=byType('cooler')[0];
    if(cpu&&mb&&cpu.compatibility?.socket!==mb.compatibility?.socket) add('bad',`Сокет CPU ${cpu.compatibility?.socket} не совпадает с сокетом платы ${mb.compatibility?.socket}.`);
    if(ram&&mb&&ram.compatibility?.memoryType!==mb.compatibility?.memoryType) add('bad',`Тип памяти ${ram.compatibility?.memoryType} не поддерживается выбранной платой (${mb.compatibility?.memoryType}).`);
    if(gpu&&psu&&Number(psu.compatibility?.wattage)<Number(gpu.compatibility?.recommendedPsuW)) add('bad',`Для видеокарты рекомендуется БП от ${gpu.compatibility?.recommendedPsuW} Вт, выбран ${psu.compatibility?.wattage} Вт.`);
    if(gpu&&pcCase&&Number(gpu.compatibility?.lengthMm)>Number(pcCase.compatibility?.maxGpuLength)) add('bad',`Видеокарта длиной ${gpu.compatibility?.lengthMm} мм не помещается в корпус с лимитом ${pcCase.compatibility?.maxGpuLength} мм.`);
    if(mb&&pcCase&&!((pcCase.compatibility?.supportedFormFactors||[]).includes(mb.compatibility?.formFactor))) add('bad',`Корпус не поддерживает форм-фактор платы ${mb.compatibility?.formFactor}.`);
    if(cpu&&cooler&&!((cooler.compatibility?.sockets||[]).includes(cpu.compatibility?.socket))) add('bad',`Кулер не заявлен для сокета ${cpu.compatibility?.socket}.`);
    if(cpu&&psu&&gpu){ const approx=Number(cpu.powerW||0)+Number(gpu.powerW||0)+140; if(Number(psu.compatibility?.wattage)<approx) add('warn',`Расчётное пиковое потребление около ${approx} Вт. Запас блока питания небольшой.`); }
  }
  if(build.group==='sim'){
    oneOnly(['wheelbase','wheel','cockpit']);
    const base=byType('wheelbase')[0], wheel=byType('wheel')[0], cockpit=byType('cockpit')[0];
    if(base&&wheel && base.compatibility?.ecosystem!==wheel.compatibility?.ecosystem) add('bad',`Рулевая база ${base.compatibility?.ecosystem} и руль ${wheel.compatibility?.ecosystem} относятся к разным экосистемам.`);
    if(base&&cockpit&&Number(base.compatibility?.torqueNm)>Number(cockpit.compatibility?.maxTorqueNm)) add('bad',`Кокпит рассчитан до ${cockpit.compatibility?.maxTorqueNm} Н·м, а база выдаёт ${base.compatibility?.torqueNm} Н·м.`);
    byType('pedals').forEach(p=>{ const eco=p.compatibility?.ecosystem; if(base&&eco&&!['Universal',base.compatibility?.ecosystem].includes(eco)&&p.compatibility?.connection!=='USB') add('warn','Педали могут потребовать отдельный адаптер.'); });
  }
  if(build.group==='cinema'){
    const rec=byType('receiver')[0], speakers=byType('speakers')[0], source=byType('source')[0], display=byType('display')[0]||byType('projector')[0];
    if(rec&&speakers&&Number(rec.compatibility?.channels)+1<Number(speakers.compatibility?.channelsNeeded)) add('bad',`Ресиверу не хватает каналов для комплекта ${speakers.specs?.['Конфигурация']||'акустики'}.`);
    if(rec&&speakers&&Number(speakers.compatibility?.impedance)<Number(rec.compatibility?.impedanceMin)) add('bad','Импеданс акустики ниже минимального значения ресивера.');
    if(source&&display&&source.compatibility?.resolution==='4K'&&display.compatibility?.resolution!=='4K') add('warn','Источник 4K не будет раскрыт дисплеем полностью.');
    if(byType('soundbar').length && (rec||speakers)) add('warn','Саундбар и раздельная AV-система частично дублируют друг друга.');
  }
  if(build.group==='workspace'){
    const monitor=byType('monitor')[0], arm=byType('monitorarm')[0];
    if(monitor&&arm&&Number(monitor.compatibility?.weightKg)>Number(arm.compatibility?.maxWeightKg)) add('bad',`Монитор тяжелее допустимой нагрузки кронштейна (${arm.compatibility?.maxWeightKg} кг).`);
    if(monitor&&arm&&monitor.compatibility?.vesa==='optional') add('warn','Для этого монитора может потребоваться отдельная VESA-версия или адаптер.');
  }
  if(build.group==='photo'){
    const camera=byType('camera')[0];
    byType('lens').forEach(lens=>{ if(camera&&lens.compatibility?.mount!==camera.compatibility?.mount) add('bad',`Байонет объектива ${lens.compatibility?.mount} не совпадает с камерой ${camera.compatibility?.mount}.`); });
    if(byType('lens').length && !camera) add('warn','Объектив добавлен без корпуса камеры.');
  }
  if(build.group==='audio'){
    const amp=byType('amplifier')[0];
    byType('speakers').forEach(sp=>{
      if(amp&&Number(sp.compatibility?.impedance)<Number(amp.compatibility?.impedanceMin)) add('bad','Импеданс акустики ниже допустимого для усилителя.');
      if(amp&&Number(amp.compatibility?.powerPerChannelW)>Number(sp.compatibility?.powerMaxW)*1.8) add('warn','Усилитель значительно мощнее рекомендуемого диапазона акустики.');
    });
    if(byType('speakers').length&&!amp) add('warn','Пассивной акустике нужен усилитель.');
    if(byType('activemonitors').length&&amp) add('warn','Активным мониторам отдельный усилитель мощности обычно не требуется.');
    const turntable=byType('turntable')[0];
    if(turntable?.compatibility?.needsPhono && !amp) add('warn','Проигрывателю нужен фонокорректор или усилитель с Phono-входом.');
  }

  const completeness = completenessFor(build.group, rows);
  if(completeness < 1) add('warn',`Базовая комплектация заполнена на ${Math.round(completeness*100)}%.`);
  if(!issues.some(i=>i.level==='bad') && completeness===1) add('good','Критических конфликтов по сохранённым характеристикам не найдено.');
  const bad=issues.filter(i=>i.level==='bad').length, warn=issues.filter(i=>i.level==='warn').length;
  return { percent:clamp(Math.round(100-bad*28-warn*7-(1-completeness)*18),0,100), issues };
}

async function init(){
  applyTheme();
  try {
    const res = await fetch(`./catalog.json?v=${APP_VERSION}`,{cache:'no-store'});
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    catalog = await res.json();
  } catch (err) {
    catalog = {categories:{pc:{name:'ПК'},sim:{name:'Автосим'},cinema:{name:'Домашний кинотеатр'},workspace:{name:'Рабочее место'},photo:{name:'Фотооборудование'},audio:{name:'Музыкальная система'}},items:[]};
    toast('Каталог не загружен','Откройте проект через GitHub Pages или локальный HTTP-сервер. Пользовательские позиции доступны.','bad');
  }
  seedDemoBuilds();
  bindEvents();
  renderAll();
  registerServiceWorker();
  setupInstallPrompt();
}

function seedDemoBuilds(){
  if(state.builds.length) return;
  const exists = id => catalog.items.some(i=>i.id===id);
  const demos = [
    {name:'Performance PC',group:'pc',ids:['pc-cpu-9800x3d','pc-gpu-rtx5080','pc-mb-x870','pc-ram-32','pc-ssd-990','pc-psu-rm1000','pc-case-northxl','pc-cooler-lf3']},
    {name:'GT Direct Drive',group:'sim',ids:['sim-base-r9','sim-wheel-ks','sim-pedals-crp2','sim-cockpit-gtelite','sim-shifter-hgp']},
    {name:'OLED Cinema',group:'cinema',ids:['cinema-tv-lgc5','cinema-avr-x2800','cinema-speakers-kefq','cinema-sub-svs','cinema-player-atv']}
  ];
  state.builds = demos.map(d=>({id:uid('build'),name:d.name,group:d.group,items:d.ids.filter(exists).map(id=>({id,qty:1})),createdAt:Date.now(),notes:''}));
  state.compareIds = state.builds.slice(0,3).map(b=>b.id);
  saveState();
}

function renderAll(){
  renderDashboard();
  renderBuilds();
  renderCompare();
  renderSettings();
  const catalogView=$('#view-catalog');
  if(state.activeView==='catalog') renderCatalog();
  else if(catalogView) catalogView.innerHTML='';
  setActiveView(state.activeView,false);
  syncTopControls();
}

function pageHead(eyebrow,title,description,actions=''){
  return `<div class="page-head"><div><span class="eyebrow">${escapeHTML(eyebrow)}</span><h1>${escapeHTML(title)}</h1><p>${escapeHTML(description)}</p></div><div class="actions">${actions}</div></div>`;
}

function renderDashboard(){
  const metrics = state.builds.map(b=>calculateBuild(b));
  const totalPortfolio = metrics.reduce((s,m)=>s+m.total,0);
  const avgScore = metrics.length ? Math.round(metrics.reduce((s,m)=>s+m.score,0)/metrics.length) : 0;
  const avgCompatibility = metrics.length ? Math.round(metrics.reduce((s,m)=>s+m.compatibility,0)/metrics.length) : 0;
  const bestValue = metrics.filter(m=>m.score).sort((a,b)=>a.pricePerPoint-b.pricePerPoint)[0];
  const recent = [...state.builds].sort((a,b)=>(b.updatedAt||b.createdAt)-(a.updatedAt||a.createdAt)).slice(0,4);
  const categories = Object.entries(catalog.categories).map(([id,c])=>{ const count=allItems().filter(i=>i.group===id).length; return `<button class="category-chip" data-action="new-build-group" data-group="${id}"><span>${iconFor(id)}</span><b>${escapeHTML(c.name)}</b><small>${count} позиций</small></button>`; }).join('');
  $('#view-dashboard').innerHTML = `
    <section class="hero glass">
      <div class="hero-copy">
        <span class="eyebrow">Configuration intelligence</span>
        <h1>Соберите комплект без слабых мест</h1>
        <p>SetupLab сравнивает стоимость, условный балл, совместимость, расходы и запас для апгрейда. У каждой позиции есть ссылки на российские магазины и официальный источник.</p>
        <div class="actions"><button class="primary" data-action="new-build">＋ Новая сборка</button><button class="secondary" data-action="go" data-view="compare">Сравнить варианты</button><button class="ghost" data-action="score-help">Как считаются баллы</button></div>
      </div>
      <div class="hero-visual" aria-hidden="true"><div class="orbit"><span class="orbit-node">${iconFor('pc')}</span><span class="orbit-node">${iconFor('sim')}</span><span class="orbit-node">${iconFor('photo')}</span><span class="orbit-node">${iconFor('audio')}</span></div></div>
    </section>
    <div class="stats-grid">
      <article class="stat-card"><small>Сохранено вариантов</small><strong>${state.builds.length}</strong><div class="trend">Локально и без аккаунта</div></article>
      <article class="stat-card"><small>Стоимость портфеля</small><strong>${money(totalPortfolio,true)}</strong><div class="trend">По текущим ценам каталога</div></article>
      <article class="stat-card"><small>Средний балл</small><strong>${avgScore}/100</strong><div class="trend">С учётом полноты сборки</div></article>
      <article class="stat-card"><small>Совместимость</small><strong>${avgCompatibility}%</strong><div class="trend">Лучшее значение: ${bestValue?money(bestValue.pricePerPoint)+'/балл':'—'}</div></article>
    </div>
    <div class="section-grid">
      <section class="panel"><div class="panel-head"><div><h2>Новая конфигурация</h2><p>Выберите направление — структуру всегда можно изменить.</p></div></div><div class="category-strip">${categories}</div></section>
      <section class="panel"><div class="panel-head"><div><h2>Последние сборки</h2><p>Быстрый доступ к редактированию.</p></div><button class="ghost compact" data-action="go" data-view="builds">Все</button></div>
        ${recent.length?`<div class="build-list">${recent.map(buildRowHTML).join('')}</div>`:emptyHTML('Пока нет сборок','Создайте первый вариант и добавьте компоненты из каталога.')}
      </section>
    </div>`;
}

function buildRowHTML(build){
  const m=calculateBuild(build);
  return `<button class="build-row" data-action="open-build" data-id="${build.id}"><span class="build-icon">${iconFor(build.group)}</span><span><strong>${escapeHTML(build.name)}</strong><small>${escapeHTML(categoryName(build.group))} · ${m.count} компонентов · совместимость ${m.compatibility}%</small></span><span class="build-row-metric"><b>${money(m.total)}</b><span>${m.score}/100</span></span></button>`;
}
function emptyHTML(title,text,button=''){
  return `<div class="empty-state"><div><div class="empty-icon">◇</div><h3>${escapeHTML(title)}</h3><p>${escapeHTML(text)}</p>${button}</div></div>`;
}

function renderBuilds(){
  const actions=`<button class="secondary" data-action="import-data">Импорт</button><button class="primary" data-action="new-build">＋ Новая сборка</button>`;
  const cards=state.builds.map(b=>{
    const m=calculateBuild(b);
    return `<article class="build-card" data-action="open-build" data-id="${b.id}">
      <div class="build-card-top"><span class="build-icon">${iconFor(b.group)}</span><button class="card-menu" data-action="build-menu" data-id="${b.id}" aria-label="Действия">•••</button></div>
      <h3>${escapeHTML(b.name)}</h3><div class="type">${escapeHTML(categoryName(b.group))} · ${m.count} компонентов</div>
      <div class="build-metrics"><div><small>Стоимость</small><b>${money(m.total)}</b></div><div><small>Баллы</small><b>${m.score}/100</b></div><div><small>Совместимость</small><b>${m.compatibility}%</b></div><div><small>3 года</small><b>${money(m.threeYear)}</b></div></div>
    </article>`;
  }).join('');
  $('#view-builds').innerHTML = pageHead('Мои конфигурации','Сборки','Создавайте независимые варианты, копируйте их и сравнивайте итоговые показатели.',actions)+
    (cards?`<div class="build-grid">${cards}</div>`:emptyHTML('Нет сохранённых вариантов','Создайте первую сборку — каталог уже готов к работе.','<button class="primary" data-action="new-build">Создать сборку</button>'));
}

function renderCatalog(){
  const items=allItems();
  const counts=items.reduce((acc,item)=>{acc[item.group]=(acc[item.group]||0)+1;return acc;},{});
  const groups=Object.entries(catalog.categories).map(([id,c])=>`<button class="${state.catalogGroup===id?'active':''}" data-action="catalog-group" data-group="${id}"><span>${escapeHTML(c.name)}</span><small>${counts[id]||0}</small></button>`).join('');
  const groupItems=items.filter(i=>i.group===state.catalogGroup);
  const types=[...new Set(groupItems.map(i=>i.type))].sort((a,b)=>itemTypeName(a).localeCompare(itemTypeName(b),'ru'));
  const typeOptions=`<option value="all">Все типы</option>`+types.map(t=>`<option value="${t}" ${state.catalogType===t?'selected':''}>${escapeHTML(itemTypeName(t))}</option>`).join('');
  const q=state.catalogSearch.trim().toLowerCase();
  const filtered=groupItems.filter(i=>(state.catalogType==='all'||i.type===state.catalogType)&&(!q||`${i.brand} ${i.name} ${i.description||''} ${Object.values(i.specs||{}).join(' ')}`.toLowerCase().includes(q)));
  if(!catalogVisibleCount) catalogVisibleCount=catalogPageSize();
  const shown=filtered.slice(0,catalogVisibleCount);
  const cards=shown.map(productCardHTML).join('');
  const actions=`<button class="secondary" data-action="remote-catalog">Каталог по URL</button><button class="secondary" data-action="import-catalog">Импорт JSON</button><button class="primary" data-action="custom-item">＋ Своя позиция</button>`;
  const more=shown.length<filtered.length?`<div class="catalog-pagination"><span>Показано ${shown.length} из ${filtered.length}</span><button class="secondary" data-action="load-more-catalog">Показать ещё ${Math.min(catalogPageSize(),filtered.length-shown.length)}</button></div>`:`<div class="catalog-pagination done"><span>Показаны все ${filtered.length} позиций</span></div>`;
  $('#view-catalog').innerHTML = pageHead('Каталог и магазины',`Каталог · ${items.length} позиций`,`В разделе «${categoryName(state.catalogGroup)}» найдено ${filtered.length}. Для стабильной работы iPhone карточки загружаются порциями.`,actions)+`
    <div class="catalog-notice">
      <div><span class="notice-icon">◎</span><span><b>Стабильный каталог с ленивой загрузкой</b><small>Фотографии и карточки загружаются только рядом с экраном — это исключает переполнение памяти Safari.</small></span></div>
      <div class="notice-actions"><button class="ghost compact" data-action="annual-help">Расходы в год</button><button class="ghost compact" data-action="upgrade-help">Апгрейдность</button><button class="ghost compact" data-action="score-help" data-group="${state.catalogGroup}">Баллы</button></div>
    </div>
    <div class="toolbar"><div class="segmented">${groups}</div><div class="search-field"><input id="catalogSearch" value="${escapeHTML(state.catalogSearch)}" placeholder="Поиск по модели, описанию и характеристикам"></div><select id="catalogType">${typeOptions}</select></div>
    ${cards?`<div class="catalog-grid">${cards}</div>${more}`:emptyHTML('Ничего не найдено','Измените поисковый запрос или добавьте собственную позицию.')}`;
  if(state.activeView==='catalog') hydrateImages();
}

function productCardHTML(item){
  const img=itemImage(item);
  const specs=Object.entries(item.specs||{}).slice(0,3).map(([k,v])=>`<span>${escapeHTML(v)}</span>`).join('');
  const price=priceState(item), links=purchaseLinks(item), primary=links[0];
  return `<article class="catalog-card" data-product-id="${item.id}" style="--card-accent:${categoryAccent(item.group)}">
    <div class="product-image" data-item-image="${item.id}"><div class="product-placeholder">${iconFor(item.group)}</div>${img?imageHTML(img,item):''}<span class="price-status ${price.className}">${price.label}</span></div>
    <div class="catalog-card-body"><div class="card-kicker"><div class="product-brand">${escapeHTML(item.brand)}</div><button class="score-info-mini" data-action="score-help" data-group="${item.group}" aria-label="Объяснение баллов">?</button></div><h3>${escapeHTML(item.name)}</h3><p class="product-description">${escapeHTML(item.description||'Описание будет добавлено в следующем обновлении каталога.')}</p><div class="spec-pills">${specs}</div>
      <div class="product-foot"><div class="product-price"><b>${money(item.priceEUR)}</b><small>${escapeHTML(itemTypeName(item.type))}${price.date?` · ${escapeHTML(price.date)}`:''}</small></div><button class="score-ring" data-action="score-help" data-group="${item.group}" style="--p:${clamp(item.score||0,0,100)}" title="${escapeHTML(scoreBand(item.score))}: ${item.score||0}/100"><b>${item.score||0}</b></button></div>
      <div class="score-caption"><span>${escapeHTML(scoreBand(item.score))}</span><span>балл внутри типа</span></div>
      <div class="card-actions card-actions-store"><button class="secondary" data-action="add-item" data-id="${item.id}">Добавить</button><a class="shop-button" href="${escapeHTML(primary.url)}" target="_blank" rel="noopener noreferrer">Купить</a><button class="icon-button" data-action="product-detail" data-id="${item.id}" aria-label="Подробнее">›</button></div>
    </div></article>`;
}
function imageHTML(img,item){
  const fallback=fallbackImageURL(item);
  const remote=img.kind==='lazy'?(img.remote||bingImageURL(item)):'';
  const initial=img.kind==='lazy'?fallback:img.url;
  return `<img src="${escapeHTML(initial)}" alt="${escapeHTML(item.brand+' '+item.name)}" loading="lazy" decoding="async" referrerpolicy="no-referrer" ${remote?`data-remote-src="${escapeHTML(remote)}"`:''} data-fallback-src="${escapeHTML(fallback)}" onerror="handleProductImageError(this)">${img.credit?`<span class="image-credit">${escapeHTML(img.credit)}</span>`:''}`;
}

function renderCompare(){
  const selected = state.compareIds.map(getBuild).filter(Boolean).slice(0,3);
  const selectors = [0,1,2].map(index=>{
    const current=selected[index]?.id||'';
    return `<select data-action="compare-select" data-index="${index}"><option value="">Вариант ${index+1}</option>${state.builds.map(b=>`<option value="${b.id}" ${b.id===current?'selected':''}>${escapeHTML(b.name)}</option>`).join('')}</select>`;
  }).join('');
  const cards=selected.map(b=>compareCardHTML(b)).join('');
  $('#view-compare').innerHTML = pageHead('Аналитика','Сравнение','Сопоставьте до трёх вариантов по стоимости, производительности, совместимости и потенциалу апгрейда.','<button class="secondary" data-action="export-report">Экспорт отчёта</button>')+`
    <div class="compare-controls">${selectors}</div>
    ${selected.length?`<div class="compare-grid">${cards}</div><section class="panel chart-wrap"><div class="panel-head"><div><h2>Сравнительная диаграмма</h2><p>Показатели нормализованы относительно выбранных вариантов.</p></div></div><canvas id="compareChart" width="1200" height="420"></canvas></section>`:emptyHTML('Выберите сборки','Добавьте в сравнение хотя бы один сохранённый вариант.')}`;
  requestAnimationFrame(drawCompareChart);
}
function compareCardHTML(build){
  const m=calculateBuild(build);
  const metrics=[['Стоимость',money(m.total)],['Баллы',`${m.score}/100`],['Цена балла',money(m.pricePerPoint)],['Совместимость',`${m.compatibility}%`],['Апгрейд',`${m.upgrade}%`],['Расходы/год',money(m.annual)],['3 года',money(m.threeYear)]];
  return `<article class="compare-card selected"><header><div><span class="eyebrow">${escapeHTML(categoryName(build.group))}</span><h3>${escapeHTML(build.name)}</h3></div><span class="build-icon">${iconFor(build.group)}</span></header><div class="compare-table">${metrics.map(([k,v])=>`<div class="compare-line"><span>${k}</span><b>${v}</b></div>`).join('')}</div></article>`;
}

function renderSettings(){
  $('#view-settings').innerHTML = pageHead('Персонализация','Настройки','Темы, валюта, энергозатраты, резервные копии и параметры каталога.')+`
    <div class="settings-grid">
      <section class="setting-card"><h3>Визуальная тема</h3><p>Каждая тема меняет фон, акценты, стеклянные поверхности и системный цвет PWA.</p><div class="theme-cards">
        ${themeCard('dark','Тёмная')}${themeCard('light','Светлая')}${themeCard('graphite','Graphite')}${themeCard('navy','Midnight Navy')}${themeCard('titanium','Titanium')}${themeCard('mono','Monochrome')}${themeCard('corsa','Assetto Corsa')}
      </div></section>
      <section class="setting-card"><h3>Валюта и стоимость энергии</h3><p>База хранится в EUR, а интерфейс мгновенно пересчитывает суммы. Проверенные курсы зафиксированы на ${state.ratesUpdated||verifiedRatesDate} и остаются редактируемыми.</p><div class="setting-stack form-grid">
        <label><span>Валюта интерфейса</span><select id="settingCurrency">${currencyOptions()}</select></label>
        <label><span>Электроэнергия, €/кВт·ч</span><input id="settingElectricity" type="number" min="0" step="0.01" value="${state.electricityEUR}"></label>
        ${['USD','RUB','GBP','CNY','RSD'].map(code=>`<label><span>${code} за 1 EUR</span><input data-rate-code="${code}" type="number" min="0" step="0.0001" value="${state.rates[code]}"></label>`).join('')}
        <label class="full"><span>Среднее использование в день, часов</span><input id="settingHours" type="number" min="0" max="24" step="0.5" value="${state.hoursPerDay}"></label>
        <div class="full actions"><button type="button" class="secondary" data-action="restore-rates">Восстановить проверенные курсы</button><small class="muted">Курс RUB — официальный ориентир Банка России; USD/CNY — референсные курсы ECB.</small></div>
      </div></section>
      <section class="setting-card"><h3>Расходы и апгрейд</h3><p>Откройте методики расчёта и проверьте, какие параметры используются для долгосрочной оценки.</p><div class="setting-stack"><button class="secondary" data-action="annual-help">Как считаются расходы в год</button><button class="secondary" data-action="upgrade-help">Как считается апгрейдность</button></div></section><section class="setting-card"><h3>Система баллов</h3><p>Баллы нужны для сравнения вариантов внутри одного направления. Это прозрачная модель SetupLab, а не универсальный лабораторный бенчмарк.</p><div class="setting-stack"><button class="secondary" data-action="score-help">Открыть подробное объяснение</button><div class="score-scale"><span>0–39<br><b>Начальный</b></span><span>40–59<br><b>Базовый</b></span><span>60–74<br><b>Сильный</b></span><span>75–89<br><b>Высокий</b></span><span>90–100<br><b>Флагман</b></span></div></div></section>
      <section class="setting-card"><h3>Данные приложения</h3><p>Резервная копия содержит сборки, пользовательские позиции, исправления каталога и кэш изображений.</p><div class="setting-stack"><button class="secondary" data-action="export-data">Скачать резервную копию</button><button class="secondary" data-action="import-data">Импортировать копию</button><button class="ghost" data-action="clear-image-cache">Очистить кэш фотографий</button></div></section>
      <section class="setting-card"><h3>Каталог проекта</h3><p>Файл catalog.json можно редактировать прямо в репозитории. Дополнительно поддерживается импорт собственного JSON без пересборки приложения.</p><div class="setting-stack"><button class="secondary" data-action="export-catalog">Скачать текущий каталог</button><button class="secondary" data-action="remote-catalog">Подключить JSON по URL</button><button class="secondary" data-action="import-catalog">Импортировать catalog.json</button><button class="primary" data-action="custom-item">Добавить свою позицию</button></div></section>
      <section class="setting-card"><h3>Установка на iPhone</h3><p>Откройте сайт в Safari, нажмите «Поделиться», затем «На экран Домой». SetupLab запустится без адресной строки и будет работать офлайн.</p><div class="setting-stack"><button class="secondary" data-action="install-help">Показать инструкцию</button></div></section>
      <section class="setting-card"><h3>Сброс</h3><p>Удаляет локальные сборки и настройки только на этом устройстве. Файлы проекта на GitHub не меняются.</p><div class="setting-stack"><button class="ghost" data-action="reset-app">Сбросить локальные данные</button><small class="muted">SetupLab ${APP_VERSION}</small></div></section>
    </div>`;
}
function themeCard(id,label){ return `<button class="theme-card ${state.theme===id?'active':''}" data-action="set-theme" data-theme="${id}"><span class="theme-preview ${id}"></span><b>${label}</b></button>`; }

function setActiveView(view,save=true){
  if(!document.getElementById(`view-${view}`)) view='dashboard';
  state.activeView=view; if(save) saveState();
  if(view==='catalog' && !$('#view-catalog').innerHTML.trim()) renderCatalog();
  $$('.view').forEach(v=>v.classList.toggle('active',v.id===`view-${view}`));
  $$('[data-action="go"]').forEach(b=>b.classList.toggle('active',b.dataset.view===view));
  $$('.bottom-nav button[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===view));
  if(view==='catalog') hydrateImages();
  if(view==='compare') requestAnimationFrame(drawCompareChart);
  window.scrollTo({top:0,behavior:'smooth'});
}

function bindEvents(){
  document.addEventListener('click', async event=>{
    const target=event.target.closest('[data-action],#installButton,#quickTheme,#mobileAddBuild');
    if(!target) return;
    if(target.id==='installButton'){ openInstall(); return; }
    if(target.id==='quickTheme'){ cycleTheme(); return; }
    if(target.id==='mobileAddBuild'){ openNewBuild(); return; }
    const action=target.dataset.action;
    if(action==='go') setActiveView(target.dataset.view);
    else if(action==='new-build') openNewBuild();
    else if(action==='new-build-group') openNewBuild(target.dataset.group);
    else if(action==='open-build') openBuild(target.dataset.id);
    else if(action==='build-menu'){ event.stopPropagation(); openBuildMenu(target.dataset.id); }
    else if(action==='catalog-group'){ state.catalogGroup=target.dataset.group; state.catalogType='all'; catalogVisibleCount=catalogPageSize(); saveState(); renderCatalog(); }
    else if(action==='product-detail') openProduct(target.dataset.id);
    else if(action==='score-help') openScoreHelp(target.dataset.group||state.catalogGroup);
    else if(action==='annual-help') openAnnualHelp(target.dataset.buildId||'',target.dataset.itemId||'');
    else if(action==='upgrade-help') openUpgradeHelp(target.dataset.buildId||'',target.dataset.itemId||'');
    else if(action==='load-more-catalog'){ catalogVisibleCount+=catalogPageSize(); renderCatalog(); }
    else if(action==='add-item') openAddItem(target.dataset.id);
    else if(action==='custom-item') openCustomItem();
    else if(action==='close-modal' && (target===event.target || target.closest('.icon-button'))) closeModal();
    else if(action==='remove-build-item') removeBuildItem(target.dataset.buildId,target.dataset.itemId);
    else if(action==='duplicate-build') duplicateBuild(target.dataset.id);
    else if(action==='delete-build') deleteBuild(target.dataset.id);
    else if(action==='edit-build') openEditBuild(target.dataset.id);
    else if(action==='edit-product') openEditProduct(target.dataset.id);
    else if(action==='find-image') openImageSearch(target.dataset.id);
    else if(action==='select-image') selectImage(target.dataset.id,Number(target.dataset.index));
    else if(action==='set-theme') setTheme(target.dataset.theme);
    else if(action==='export-data') exportData();
    else if(action==='import-data') pickJSON(importDataFile);
    else if(action==='export-catalog') exportCatalog();
    else if(action==='import-catalog') pickJSON(importCatalogFile);
    else if(action==='remote-catalog') openRemoteCatalog();
    else if(action==='clear-image-cache'){ state.imageCache={}; saveState(); renderAll(); toast('Кэш очищен','Фотографии будут загружены заново при открытии каталога.'); }
    else if(action==='install-help') showInstallHelp();
    else if(action==='restore-rates'){ state.rates={...verifiedRates}; state.ratesUpdated=verifiedRatesDate; saveState(); renderAll(); toast('Курсы восстановлены',`Проверенные значения на ${verifiedRatesDate}.`); }
    else if(action==='reset-app') resetApp();
    else if(action==='export-report') exportComparisonReport();
  });

  document.addEventListener('input',event=>{
    if(event.target.id==='catalogSearch'){
      state.catalogSearch=event.target.value; catalogVisibleCount=catalogPageSize();
      clearTimeout(window._catalogSearchTimer);
      window._catalogSearchTimer=setTimeout(()=>{
        renderCatalog();
        const input=$('#catalogSearch');
        if(input){ input.focus({preventScroll:true}); const end=input.value.length; input.setSelectionRange?.(end,end); }
      },220);
    }
  });
  document.addEventListener('change',event=>{
    const el=event.target;
    if(el.id==='catalogType'){ state.catalogType=el.value; catalogVisibleCount=catalogPageSize(); saveState(); renderCatalog(); }
    if(el.dataset.action==='compare-select'){
      const arr=[...state.compareIds]; arr[Number(el.dataset.index)]=el.value; state.compareIds=arr.filter(Boolean); saveState(); renderCompare();
    }
    if(el.id==='settingCurrency'||el.id==='quickCurrency'){ state.currency=el.value; saveState(); renderAll(); }
    if(el.id==='settingElectricity'){ state.electricityEUR=Number(el.value)||0; saveState(); renderAll(); }
    if(el.dataset.rateCode){ state.rates[el.dataset.rateCode]=Number(el.value)||1; state.ratesUpdated='Изменено вручную'; saveState(); renderAll(); }
    if(el.id==='settingHours'){ state.hoursPerDay=clamp(Number(el.value)||0,0,24); saveState(); renderAll(); }
  });
  document.addEventListener('submit',event=>{
    event.preventDefault();
    const form=event.target;
    if(form.id==='newBuildForm') submitNewBuild(form);
    if(form.id==='editBuildForm') submitEditBuild(form);
    if(form.id==='addItemForm') submitAddItem(form);
    if(form.id==='customItemForm') submitCustomItem(form);
    if(form.id==='editProductForm') submitEditProduct(form);
    if(form.id==='imageSearchForm') submitImageSearch(form);
    if(form.id==='remoteCatalogForm') submitRemoteCatalog(form);
  });
  document.addEventListener('keydown',e=>{ if(e.key==='Escape') closeModal(); });
}

function openModal(title,eyebrow,html,wide=false){
  const root=$('#modalRoot');
  root.innerHTML=$('#modalTemplate').innerHTML;
  $('#modalTitle',root).textContent=title;
  $('#modalEyebrow',root).textContent=eyebrow;
  $('#modalBody',root).innerHTML=html;
  if(wide) $('.modal-card',root).style.width='min(980px,100%)';
  document.body.style.overflow='hidden';
  requestAnimationFrame(()=>root.querySelector('input,select,button')?.focus({preventScroll:true}));
}
function closeModal(){ $('#modalRoot').innerHTML=''; document.body.style.overflow=''; }
function toast(title,text='',kind='ok'){
  const node=document.createElement('div'); node.className='toast';
  node.innerHTML=`<span class="dot" style="background:${kind==='bad'?'var(--danger)':kind==='warn'?'var(--warn)':'var(--accent)'}"></span><div><b>${escapeHTML(title)}</b>${text?`<small>${escapeHTML(text)}</small>`:''}</div>`;
  $('#toastStack').append(node); setTimeout(()=>node.remove(),4200);
}

function openNewBuild(group='pc'){
  const options=Object.entries(catalog.categories).map(([id,c])=>`<option value="${id}" ${id===group?'selected':''}>${escapeHTML(c.name)}</option>`).join('');
  openModal('Новая сборка','Создание',`<form id="newBuildForm" class="form-grid"><label class="full"><span>Название</span><input name="name" required maxlength="60" placeholder="Например, Игровой ПК 2026"></label><label class="full"><span>Направление</span><select name="group">${options}</select></label><label class="full"><span>Заметка</span><textarea name="notes" placeholder="Цель, бюджет, ограничения"></textarea></label><div class="full actions"><button type="button" class="ghost" data-action="close-modal">Отмена</button><button class="primary" type="submit">Создать</button></div></form>`);
}
function submitNewBuild(form){
  const data=new FormData(form); const name=String(data.get('name')||'').trim(); if(!name)return;
  const build={id:uid('build'),name,group:String(data.get('group')),notes:String(data.get('notes')||''),items:[],createdAt:Date.now(),updatedAt:Date.now()};
  state.builds.unshift(build); state.catalogGroup=build.group; saveState(); closeModal(); renderAll(); setActiveView('catalog'); toast('Сборка создана','Добавьте компоненты из каталога.');
}

function openBuild(id){
  const build=getBuild(id); if(!build)return;
  const m=calculateBuild(build);
  const components=buildItems(build).map(({entry,item})=>`<div class="component-row"><span class="component-thumb">${itemImage(item)?imageHTML(itemImage(item),item):iconFor(item.group)}</span><span><strong>${escapeHTML(item.brand+' '+item.name)}</strong><small>${escapeHTML(itemTypeName(item.type))} · ${money(item.priceEUR)} × ${entry.qty||1}</small></span><span class="qty">×${entry.qty||1}</span><button class="remove-button" data-action="remove-build-item" data-build-id="${build.id}" data-item-id="${item.id}">×</button></div>`).join('');
  const issues=m.issues.map(i=>`<div class="issue ${i.level}"><span class="dot"></span><span>${escapeHTML(i.text)}</span></div>`).join('');
  openModal(build.name,categoryName(build.group),`
    <div class="actions" style="margin-bottom:14px"><button class="primary" data-action="go" data-view="catalog" onclick="document.getElementById('modalRoot').innerHTML='';document.body.style.overflow=''">＋ Добавить компонент</button><button class="secondary" data-action="edit-build" data-id="${build.id}">Редактировать</button><button class="ghost" data-action="duplicate-build" data-id="${build.id}">Копия</button></div>
    <div class="metric-grid"><article class="metric-card"><small>Стоимость</small><b>${money(m.total)}</b></article><article class="metric-card"><small>Баллы</small><b>${m.score}/100</b><div class="progress"><i style="--value:${m.score}%"></i></div></article><article class="metric-card"><small>Совместимость</small><b>${m.compatibility}%</b><div class="progress"><i style="--value:${m.compatibility}%"></i></div></article><article class="metric-card metric-clickable" data-action="upgrade-help" data-build-id="${build.id}"><small>Апгрейдность</small><b>${m.upgrade}%</b><div class="progress"><i style="--value:${m.upgrade}%"></i></div><span>Открыть методику</span></article><article class="metric-card"><small>Цена балла</small><b>${money(m.pricePerPoint)}</b></article><article class="metric-card metric-clickable" data-action="annual-help" data-build-id="${build.id}"><small>Расходы/год</small><b>${money(m.annual)}</b><span>Энергия + обслуживание</span></article><article class="metric-card"><small>Полная стоимость 3 года</small><b>${money(m.threeYear)}</b></article><article class="metric-card"><small>Потребление</small><b>${number(m.power)} Вт</b></article></div>
    <div class="section-grid build-detail-grid"><section><div class="panel-head" style="margin-top:18px"><div><h3>Компоненты</h3><p>${m.count} позиций</p></div></div>${components?`<div class="component-list">${components}</div>`:emptyHTML('Сборка пустая','Добавьте компоненты из каталога.')}</section><section><div class="panel-head" style="margin-top:18px"><div><h3>Проверка</h3><p>На основе характеристик каталога</p></div></div><div class="issue-list">${issues}</div></section></div>
    ${build.notes?`<section class="panel" style="margin-top:16px"><h3>Заметка</h3><p class="muted" style="margin:0;white-space:pre-wrap">${escapeHTML(build.notes)}</p></section>`:''}
  `,true);
  hydrateImages();
}

function openEditBuild(id){
  const build=getBuild(id); if(!build)return;
  openModal('Редактировать сборку','Параметры',`<form id="editBuildForm" class="form-grid"><input type="hidden" name="id" value="${build.id}"><label class="full"><span>Название</span><input name="name" required maxlength="60" value="${escapeHTML(build.name)}"></label><label class="full"><span>Заметка</span><textarea name="notes">${escapeHTML(build.notes||'')}</textarea></label><div class="full actions"><button type="button" class="ghost" data-action="delete-build" data-id="${build.id}">Удалить</button><button class="primary" type="submit">Сохранить</button></div></form>`);
}
function submitEditBuild(form){
  const data=new FormData(form), build=getBuild(String(data.get('id'))); if(!build)return;
  build.name=String(data.get('name')||'').trim()||build.name; build.notes=String(data.get('notes')||''); build.updatedAt=Date.now(); saveState(); closeModal(); renderAll(); toast('Изменения сохранены');
}
function openBuildMenu(id){
  const b=getBuild(id); if(!b)return;
  openModal(b.name,'Действия',`<div class="setting-stack"><button class="secondary" data-action="open-build" data-id="${id}">Открыть</button><button class="secondary" data-action="duplicate-build" data-id="${id}">Создать копию</button><button class="secondary" data-action="edit-build" data-id="${id}">Переименовать и заметки</button><button class="ghost" data-action="delete-build" data-id="${id}">Удалить</button></div>`);
}
function duplicateBuild(id){
  const b=getBuild(id); if(!b)return; const copy={...deepClone(b),id:uid('build'),name:`${b.name} — копия`,createdAt:Date.now(),updatedAt:Date.now()}; state.builds.unshift(copy); saveState(); closeModal(); renderAll(); toast('Копия создана');
}
function deleteBuild(id){
  const b=getBuild(id); if(!b)return;
  if(!confirm(`Удалить сборку «${b.name}»?`))return;
  state.builds=state.builds.filter(x=>x.id!==id); state.compareIds=state.compareIds.filter(x=>x!==id); saveState(); closeModal(); renderAll(); toast('Сборка удалена');
}
function removeBuildItem(buildId,itemId){
  const b=getBuild(buildId); if(!b)return; const idx=b.items.findIndex(x=>x.id===itemId); if(idx<0)return;
  if((b.items[idx].qty||1)>1)b.items[idx].qty-=1; else b.items.splice(idx,1);
  b.updatedAt=Date.now(); saveState(); renderAll(); openBuild(buildId); toast('Компонент удалён');
}


function openScoreHelp(group='pc'){
  const labels={pc:'ПК',sim:'автосима',cinema:'домашнего кинотеатра',workspace:'рабочего места',photo:'фотооборудования',audio:'музыкальной системы'};
  const weighted=Object.entries(typeWeights).filter(([type])=>allItems().some(i=>i.group===group&&i.type===type)).sort((a,b)=>b[1]-a[1]).slice(0,8);
  const weightRows=weighted.map(([type,w])=>`<div class="spec-row"><span>${escapeHTML(itemTypeName(type))}</span><b>вес ×${number(w,2)}</b></div>`).join('');
  openModal('Как считаются баллы',`Модель для ${labels[group]||'конфигурации'}`,`
    <div class="score-explainer">
      <section class="score-hero"><span class="score-ring score-ring-large" style="--p:82"><b>82</b></span><div><h3>Баллы — относительная оценка 0–100</h3><p>Оценка компонента сравнивает его возможности с другими позициями того же типа. Процессор не сравнивается напрямую с креслом или объективом.</p></div></section>
      <div class="score-band-grid"><div><b>0–39</b><small>Начальный уровень</small></div><div><b>40–59</b><small>Базовый</small></div><div><b>60–74</b><small>Сильный</small></div><div><b>75–89</b><small>Высокий класс</small></div><div><b>90–100</b><small>Флагман</small></div></div>
      <section class="explain-card"><h3>Баллы сборки</h3><p>SetupLab берёт средневзвешенную оценку компонентов. Самые важные элементы получают больший вес, затем применяется коэффициент полноты: незавершённая сборка не может получить максимальный итог.</p><div class="spec-table">${weightRows}</div></section>
      <section class="explain-card"><h3>Цена одного балла</h3><p>Итоговая стоимость делится на балл сборки. Чем меньше значение, тем выгоднее конфигурация при сопоставимом назначении. Сравнивать цену балла корректно только между сборками одного направления.</p></section>
      <section class="issue warn"><span class="dot"></span><span>Баллы не заменяют FPS-тесты, измерения звука, DxOMark или лабораторные обзоры. Их можно локально изменить вместе с ценой и характеристиками.</span></section>
    </div>`,true);
}

function upgradeBand(score){
  const s=Number(score)||0;
  if(s>=85)return 'Отличный запас'; if(s>=70)return 'Хороший запас'; if(s>=50)return 'Средний запас'; return 'Ограниченный запас';
}
function openUpgradeHelp(buildId='',itemId=''){
  const build=buildId?getBuild(buildId):null;
  const item=itemId?getItem(itemId):null;
  const score=build?calculateBuild(build).upgrade:Number(item?.upgrade||0);
  const title=build?build.name:item?`${item.brand} ${item.name}`:'Система SetupLab';
  openModal('Что означает апгрейдность',title,`<div class="score-explainer"><section class="score-hero"><span class="score-ring score-ring-large" style="--p:${score}"><b>${score}</b></span><div><h3>${upgradeBand(score)}</h3><p>Апгрейдность показывает, насколько легко сохранить основу комплекта и улучшать её частями, не заменяя всё сразу.</p></div></section><div class="upgrade-factor-grid"><div><b>Платформа</b><small>Актуальность сокета, стандарта, байонета или экосистемы.</small></div><div><b>Модульность</b><small>Можно ли менять отдельные узлы и расширять конфигурацию.</small></div><div><b>Запас</b><small>Мощность, нагрузка, интерфейсы и свободные каналы на будущее.</small></div><div><b>Совместимость</b><small>Ширина выбора компонентов и отсутствие жёсткой привязки.</small></div></div><section class="explain-card"><h3>Как читается процент</h3><p><b>85–100%</b> — платформа рассчитана на несколько этапов обновления. <b>70–84%</b> — хороший запас. <b>50–69%</b> — часть улучшений потребует компромиссов. Ниже 50% — закрытая или близкая к пределу система.</p></section><section class="issue warn"><span class="dot"></span><span>Это прогноз удобства обновления, а не гарантия будущей совместимости: производители могут менять стандарты и поддержку.</span></section></div>`,true);
}
function openAnnualHelp(buildId='',itemId=''){
  const build=buildId?getBuild(buildId):null;
  const item=itemId?getItem(itemId):null;
  let power=0, recurring=0, energy=0, total=0, title='Методика SetupLab';
  if(build){ const m=calculateBuild(build); power=m.power; recurring=m.recurringAnnual; energy=m.energyAnnual; total=m.annual; title=build.name; }
  else if(item){ power=Number(item.powerW||0); recurring=Number(item.futureAnnualEUR||0); energy=power/1000*state.hoursPerDay*365*state.electricityEUR; total=recurring+energy; title=`${item.brand} ${item.name}`; }
  const formula=`${number(power)} Вт × ${number(state.hoursPerDay,1)} ч/день × 365 × ${money(state.electricityEUR)}/кВт·ч`;
  openModal('Как считаются расходы в год',title,`<div class="score-explainer"><section class="explain-card"><h3>1. Электроэнергия</h3><p>Используется паспортная или ориентировочная мощность, среднее время работы из настроек и заданный тариф электроэнергии.</p><div class="cost-formula"><span>${escapeHTML(formula)}</span><b>${money(energy)} / год</b></div></section><section class="explain-card"><h3>2. Регулярные расходы</h3><p>Сюда входят расходники, подписки, обслуживание, замена фильтров, картриджей, ламп, носителей и другие ежегодные затраты, записанные в каталоге.</p><div class="cost-formula"><span>Обслуживание и расходники</span><b>${money(recurring)} / год</b></div></section><section class="annual-total"><span>Итоговый ориентир</span><b>${money(total)} / год</b></section><section class="issue warn"><span class="dot"></span><span>Расчёт не включает кредит, доставку, ремонт после поломок и изменение тарифа. Часы использования и стоимость энергии меняются в настройках.</span></section></div>`,true);
}

function openProduct(id){
  const item=getItem(id); if(!item)return;
  const img=itemImage(item), price=priceState(item), links=purchaseLinks(item);
  const specs=Object.entries(item.specs||{}).map(([k,v])=>`<div class="spec-row"><span>${escapeHTML(k)}</span><b>${escapeHTML(v)}</b></div>`).join('');
  const stores=links.map(link=>`<a class="store-card ${link.id==='market'?'featured':''}" href="${escapeHTML(link.url)}" target="_blank" rel="noopener noreferrer"><span class="store-icon">${escapeHTML(link.icon)}</span><span><b>${escapeHTML(link.label)}</b><small>${escapeHTML(link.note)}</small></span><i>↗</i></a>`).join('');
  const priceReference=item.priceReferenceUrl?`<a class="price-reference" href="${escapeHTML(item.priceReferenceUrl)}" target="_blank" rel="noopener noreferrer">Открыть источник ценового ориентира ↗</a>`:'';
  const itemEnergy=Number(item.powerW||0)/1000*state.hoursPerDay*365*state.electricityEUR;
  openModal(item.name,item.brand,`<div class="detail-layout"><div><div class="detail-image" data-item-image="${item.id}"><div class="product-placeholder">${iconFor(item.group)}</div>${img?imageHTML(img,item):''}<span class="price-status ${price.className}">${price.label}</span></div><div class="actions" style="margin-top:10px"><button class="secondary" data-action="find-image" data-id="${item.id}">Найти фото</button></div></div><div class="detail-data"><section class="product-summary"><span class="eyebrow">Кратко о модели</span><p>${escapeHTML(item.description||'Описание не заполнено.')}</p></section><div class="metric-grid"><article class="metric-card metric-price"><small>Цена каталога</small><b>${money(item.priceEUR)}</b><span>${price.date?`проверено ${escapeHTML(price.date)}`:'редактируется локально'}</span></article><article class="metric-card metric-clickable" data-action="score-help" data-group="${item.group}"><small>Баллы · ${escapeHTML(scoreBand(item.score))}</small><b>${item.score}/100</b><span>Нажмите для объяснения</span></article><article class="metric-card metric-clickable" data-action="upgrade-help" data-item-id="${item.id}"><small>Апгрейдность</small><b>${item.upgrade}%</b><span>Что влияет на оценку</span></article><article class="metric-card metric-clickable" data-action="annual-help" data-item-id="${item.id}"><small>Расходы/год</small><b>${money((item.futureAnnualEUR||0)+itemEnergy)}</b><span>Энергия + обслуживание</span></article></div><div class="spec-table">${specs||'<div class="spec-row"><span>Характеристики</span><b>Не заполнены</b></div>'}</div><section class="purchase-panel"><div class="panel-head"><div><h3>Купить или проверить цену</h3><p>Ссылки открываются в новой вкладке. Цена и наличие могут измениться.</p></div></div><div class="store-grid">${stores}</div>${priceReference}</section><div class="actions"><button class="primary" data-action="add-item" data-id="${item.id}">Добавить в сборку</button><button class="secondary" data-action="edit-product" data-id="${item.id}">Изменить цену и данные</button></div><p class="muted source-note">${escapeHTML(item.sourceNote||'Данные редактируются локально.')}</p></div></div>`,true);
  hydrateImages();
}

function openAddItem(id){
  const item=getItem(id); if(!item)return;
  const compatibleBuilds=state.builds.filter(b=>b.group===item.group);
  if(!compatibleBuilds.length){
    openModal('Сначала создайте сборку','Добавление',`<p class="muted">Для позиции «${escapeHTML(item.name)}» нужна сборка направления «${escapeHTML(categoryName(item.group))}».</p><button class="primary" data-action="new-build-group" data-group="${item.group}">Создать сборку</button>`); return;
  }
  openModal('Добавить компонент','Каталог',`<form id="addItemForm" class="form-grid"><input type="hidden" name="itemId" value="${item.id}"><label class="full"><span>Сборка</span><select name="buildId">${compatibleBuilds.map(b=>`<option value="${b.id}">${escapeHTML(b.name)}</option>`).join('')}</select></label><label class="full"><span>Количество</span><input type="number" name="qty" min="1" max="99" value="1"></label><div class="full actions"><button type="button" class="ghost" data-action="close-modal">Отмена</button><button class="primary" type="submit">Добавить</button></div></form>`);
}
function submitAddItem(form){
  const data=new FormData(form), b=getBuild(String(data.get('buildId'))), item=getItem(String(data.get('itemId'))); if(!b||!item)return;
  const qty=clamp(Number(data.get('qty'))||1,1,99), existing=b.items.find(x=>x.id===item.id);
  if(existing)existing.qty=(existing.qty||1)+qty; else b.items.push({id:item.id,qty});
  b.updatedAt=Date.now(); saveState(); closeModal(); renderAll(); toast('Компонент добавлен',`${item.brand} ${item.name} → ${b.name}`);
}

function openCustomItem(prefill={}){
  const group=prefill.group||state.catalogGroup||'pc';
  const groupOptions=Object.entries(catalog.categories).map(([id,c])=>`<option value="${id}" ${id===group?'selected':''}>${escapeHTML(c.name)}</option>`).join('');
  const typeOptions=Object.entries(typeLabels).map(([id,label])=>`<option value="${id}" ${prefill.type===id?'selected':''}>${escapeHTML(label)}</option>`).join('');
  openModal('Своя позиция','Пользовательский каталог',`<form id="customItemForm" class="form-grid"><label><span>Раздел</span><select name="group">${groupOptions}</select></label><label><span>Тип</span><select name="type">${typeOptions}</select></label><label><span>Бренд</span><input name="brand" required value="${escapeHTML(prefill.brand||'')}"></label><label><span>Модель</span><input name="name" required value="${escapeHTML(prefill.name||'')}"></label><label><span>Базовая цена, EUR</span><input name="priceEUR" type="number" min="0" step="0.01" value="${prefill.priceEUR||0}"></label><label><span>Производительность, 0–100</span><input name="score" type="number" min="0" max="100" value="${prefill.score||70}"></label><label><span>Апгрейдность, 0–100</span><input name="upgrade" type="number" min="0" max="100" value="${prefill.upgrade||70}"></label><label><span>Будущие расходы/год, EUR</span><input name="futureAnnualEUR" type="number" min="0" step="0.01" value="${prefill.futureAnnualEUR||0}"></label><label><span>Потребление, Вт</span><input name="powerW" type="number" min="0" value="${prefill.powerW||0}"></label><label class="full"><span>Краткое описание</span><textarea name="description" placeholder="Для чего подходит модель и чем она выделяется">${escapeHTML(prefill.description||'')}</textarea></label><label><span>URL фотографии</span><input name="image" type="url" value="${escapeHTML(prefill.image||'')}"></label><label class="full"><span>Прямая ссылка на покупку (необязательно)</span><input name="purchaseURL" type="url" value="${escapeHTML(prefill.purchaseURL||'')}" placeholder="https://..."></label><label class="full"><span>Характеристики: одна строка «Название: значение»</span><textarea name="specs" placeholder="Сокет: AM5&#10;Память: DDR5">${escapeHTML(prefill.specsText||'')}</textarea></label><div class="full actions"><button type="button" class="ghost" data-action="close-modal">Отмена</button><button class="primary" type="submit">Сохранить</button></div></form>`,true);
}
function parseSpecs(text){
  return Object.fromEntries(String(text||'').split('\n').map(s=>s.trim()).filter(Boolean).map(line=>{ const idx=line.indexOf(':'); return idx>-1?[line.slice(0,idx).trim(),line.slice(idx+1).trim()]:['Описание',line]; }));
}
function submitCustomItem(form){
  const d=new FormData(form); const item={id:uid('custom'),group:String(d.get('group')),type:String(d.get('type')),brand:String(d.get('brand')).trim(),name:String(d.get('name')).trim(),priceEUR:Number(d.get('priceEUR'))||0,score:clamp(Number(d.get('score'))||0,0,100),upgrade:clamp(Number(d.get('upgrade'))||0,0,100),futureAnnualEUR:Number(d.get('futureAnnualEUR'))||0,powerW:Number(d.get('powerW'))||0,description:String(d.get('description')||'').trim(),image:String(d.get('image')||'').trim(),purchase:{market:String(d.get('purchaseURL')||'').trim()},priceBasis:'estimate',priceChecked:new Date().toISOString().slice(0,10),specs:parseSpecs(d.get('specs')),compatibility:{},imageQuery:`${d.get('brand')} ${d.get('name')} product photo`,sourceNote:'Пользовательская позиция',updated:new Date().toISOString().slice(0,10)};
  state.customItems.unshift(item); state.catalogGroup=item.group; saveState(); closeModal(); renderAll(); setActiveView('catalog'); toast('Позиция добавлена','Совместимость можно уточнить через импорт расширенного JSON.');
}

function openEditProduct(id){
  const item=getItem(id); if(!item)return;
  openModal('Изменить данные','Локальное переопределение',`<form id="editProductForm" class="form-grid"><input type="hidden" name="id" value="${item.id}"><label><span>Базовая цена, EUR</span><input name="priceEUR" type="number" min="0" step="0.01" value="${item.priceEUR}"></label><label><span>Баллы, 0–100</span><input name="score" type="number" min="0" max="100" value="${item.score}"></label><label><span>Апгрейдность, 0–100</span><input name="upgrade" type="number" min="0" max="100" value="${item.upgrade}"></label><label><span>Расходы/год, EUR</span><input name="futureAnnualEUR" type="number" min="0" step="0.01" value="${item.futureAnnualEUR||0}"></label><label><span>Потребление, Вт</span><input name="powerW" type="number" min="0" value="${item.powerW||0}"></label><label class="full"><span>Краткое описание</span><textarea name="description">${escapeHTML(item.description||'')}</textarea></label><label><span>URL фотографии</span><input name="image" type="url" value="${escapeHTML(item.image||'')}"></label><label class="full"><span>Прямая ссылка на покупку</span><input name="purchaseURL" type="url" value="${escapeHTML(item.purchase?.market||'')}" placeholder="https://..."></label><label class="full"><span>Характеристики</span><textarea name="specs">${escapeHTML(Object.entries(item.specs||{}).map(([k,v])=>`${k}: ${v}`).join('\n'))}</textarea></label><div class="full actions"><button type="button" class="secondary" data-action="find-image" data-id="${item.id}">Найти фото</button><button class="primary" type="submit">Сохранить</button></div></form>`,true);
}
function submitEditProduct(form){
  const d=new FormData(form), id=String(d.get('id'));
  state.catalogOverrides[id]={...(state.catalogOverrides[id]||{}),priceEUR:Number(d.get('priceEUR'))||0,score:clamp(Number(d.get('score'))||0,0,100),upgrade:clamp(Number(d.get('upgrade'))||0,0,100),futureAnnualEUR:Number(d.get('futureAnnualEUR'))||0,powerW:Number(d.get('powerW'))||0,description:String(d.get('description')||'').trim(),image:String(d.get('image')||'').trim(),purchase:{...(getItem(id)?.purchase||{}),market:String(d.get('purchaseURL')||'').trim()},priceBasis:'local',priceChecked:new Date().toISOString().slice(0,10),specs:parseSpecs(d.get('specs'))};
  saveState(); closeModal(); renderAll(); toast('Данные обновлены','Изменения сохранены только на этом устройстве.');
}

let imageSearchResults=[];
function openImageSearch(id){
  const item=getItem(id); if(!item)return;
  openModal('Поиск фотографии','Openverse',`<form id="imageSearchForm" class="toolbar"><input type="hidden" name="id" value="${item.id}"><div class="search-field"><input name="query" required value="${escapeHTML(item.imageQuery||item.brand+' '+item.name)}"></div><button class="primary" type="submit">Найти</button></form><div id="imageSearchResults">${emptyHTML('Введите запрос','Будут показаны открыто лицензированные изображения с указанием автора и лицензии.')}</div>`,true);
}
async function submitImageSearch(form){
  const d=new FormData(form), id=String(d.get('id')), query=String(d.get('query')||'').trim();
  const box=$('#imageSearchResults'); if(!box||!query)return;
  box.innerHTML='<div class="empty-state"><div><div class="empty-icon">⌕</div><h3>Поиск…</h3><p>Запрашиваем открытые изображения.</p></div></div>';
  try {
    const url=`https://api.openverse.org/v1/images/?q=${encodeURIComponent(query)}&page_size=12&mature=false`;
    const res=await fetch(url,{headers:{Accept:'application/json'}}); if(!res.ok)throw new Error(`HTTP ${res.status}`);
    const data=await res.json(); imageSearchResults=(data.results||[]).map(r=>({url:r.url,thumbnail:r.thumbnail||r.url,creator:r.creator||'',license:(r.license||'').toUpperCase(),landing:r.foreign_landing_url||r.detail_url||'',title:r.title||query}));
    box.innerHTML=imageSearchResults.length?`<div class="catalog-grid">${imageSearchResults.map((r,i)=>`<article class="catalog-card"><div class="product-image"><img src="${escapeHTML(r.thumbnail)}" alt="${escapeHTML(r.title)}" loading="lazy" referrerpolicy="no-referrer"><span class="image-credit">${escapeHTML([r.creator,r.license].filter(Boolean).join(' · '))}</span></div><div class="catalog-card-body"><h3>${escapeHTML(r.title)}</h3><button class="primary" data-action="select-image" data-id="${id}" data-index="${i}">Выбрать</button></div></article>`).join('')}</div>`:emptyHTML('Ничего не найдено','Уточните запрос или вставьте прямой URL изображения вручную.');
  } catch(err){ box.innerHTML=emptyHTML('Поиск недоступен','Проверьте интернет-соединение. Каталог и сборки продолжают работать офлайн.'); }
}
function selectImage(id,index){
  const r=imageSearchResults[index]; if(!r)return; state.imageCache[id]=r; saveState(); closeModal(); renderAll(); toast('Фотография сохранена','Источник и лицензия добавлены в подпись.');
}

function hydrateImages(){
  imageObserver?.disconnect();
  imageQueue=imageQueue.filter(job=>job.img?.isConnected);
  const targets=$$('img[data-remote-src]:not([data-remote-loaded])');
  const enqueue=img=>{
    if(!img?.dataset.remoteSrc || img.dataset.remoteQueued==='1')return;
    img.dataset.remoteQueued='1';
    imageQueue.push({img,src:img.dataset.remoteSrc});
    processImageQueue();
  };
  if(!('IntersectionObserver' in window)){
    targets.slice(0,8).forEach(enqueue);
    return;
  }
  imageObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      imageObserver.unobserve(entry.target);
      enqueue(entry.target);
    });
  },{rootMargin:'180px 0px'});
  targets.forEach(img=>imageObserver.observe(img));
}
function processImageQueue(){
  while(imageQueueBusy<IMAGE_CONCURRENCY&&imageQueue.length){
    const job=imageQueue.shift();
    if(!job.img?.isConnected)continue;
    imageQueueBusy++;
    loadRemoteImage(job).finally(()=>{ imageQueueBusy--; processImageQueue(); });
  }
}
function loadRemoteImage(job){
  return new Promise(resolve=>{
    const probe=new Image();
    let done=false;
    const finish=ok=>{ if(done)return; done=true; clearTimeout(timer); if(ok&&job.img?.isConnected){ job.img.src=job.src; job.img.dataset.remoteLoaded='1'; job.img.closest('.using-fallback')?.classList.remove('using-fallback'); const credit=job.img.parentElement?.querySelector('.image-credit'); if(credit)credit.textContent='Веб-фото'; } resolve(); };
    const timer=setTimeout(()=>finish(false),6000);
    probe.referrerPolicy='no-referrer';
    probe.decoding='async';
    probe.onload=()=>finish(true);
    probe.onerror=()=>finish(false);
    probe.src=job.src;
  });
}

function setTheme(theme){
  const list=['dark','light','graphite','navy','titanium','mono','corsa'];
  if(!list.includes(theme))return;
  state.theme=theme; saveState(); applyTheme(); renderAll();
  const names={dark:'Тёмная',light:'Светлая',graphite:'Graphite',navy:'Midnight Navy',titanium:'Titanium',mono:'Monochrome',corsa:'Assetto Corsa'};
  toast('Тема изменена',`${names[theme]} включена.`);
}
function cycleTheme(){ const list=['dark','light','graphite','navy','titanium','mono','corsa']; setTheme(list[(list.indexOf(state.theme)+1)%list.length]); }

function downloadJSON(data,filename){
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=filename; a.click(); setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function downloadText(text,filename,type='text/plain'){ const blob=new Blob([text],{type}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=filename; a.click(); setTimeout(()=>URL.revokeObjectURL(url),1000); }
function exportData(){ downloadJSON({app:'SetupLab',version:APP_VERSION,exportedAt:new Date().toISOString(),state},`setuplab-backup-${new Date().toISOString().slice(0,10)}.json`); toast('Резервная копия создана'); }
function exportCatalog(){ downloadJSON({version:1,updated:new Date().toISOString().slice(0,10),currency:'EUR',categories:catalog.categories,items:allItems()},`setuplab-catalog-${new Date().toISOString().slice(0,10)}.json`); }
function pickJSON(handler){ const input=document.createElement('input'); input.type='file'; input.accept='application/json,.json'; input.onchange=()=>{ const f=input.files?.[0]; if(f)handler(f); }; input.click(); }
async function importDataFile(file){
  try { const data=JSON.parse(await file.text()); const incoming=data.state||data; if(!Array.isArray(incoming.builds))throw new Error('Invalid backup'); state={...deepClone(defaultState),...incoming,rates:{...defaultState.rates,...(incoming.rates||{})}}; saveState(); applyTheme(); renderAll(); toast('Резервная копия восстановлена'); }
  catch { toast('Ошибка импорта','Файл не похож на резервную копию SetupLab.','bad'); }
}
async function importCatalogFile(file){
  try {
    const data=JSON.parse(await file.text()); if(!Array.isArray(data.items))throw new Error('Invalid catalog');
    const normalized=data.items.map((i,index)=>({id:i.id||uid(`import-${index}`),group:i.group||'pc',type:i.type||'custom',brand:i.brand||'Без бренда',name:i.name||`Позиция ${index+1}`,priceEUR:Number(i.priceEUR)||0,score:clamp(Number(i.score)||0,0,100),upgrade:clamp(Number(i.upgrade)||0,0,100),futureAnnualEUR:Number(i.futureAnnualEUR)||0,powerW:Number(i.powerW)||0,specs:i.specs||{},compatibility:i.compatibility||{},description:i.description||'',image:i.image||'',imageQuery:i.imageQuery||`${i.brand||''} ${i.name||''} product photo`,sourceNote:i.sourceNote||'Импортированная позиция',purchase:i.purchase||{},priceBasis:i.priceBasis||'estimate',priceChecked:i.priceChecked||i.updated||new Date().toISOString().slice(0,10),updated:i.updated||new Date().toISOString().slice(0,10)}));
    const ids=new Set([...catalog.items.map(i=>i.id),...state.customItems.map(i=>i.id)]); normalized.forEach(i=>{ if(ids.has(i.id)) i.id=uid('import'); ids.add(i.id); }); state.customItems=[...normalized,...state.customItems]; saveState(); renderAll(); setActiveView('catalog'); toast('Каталог импортирован',`Добавлено позиций: ${normalized.length}`);
  } catch { toast('Ошибка каталога','Ожидается JSON-объект с массивом items.','bad'); }
}

function openRemoteCatalog(){
  openModal('Каталог по URL','Удалённый JSON',`<form id="remoteCatalogForm" class="form-grid"><label class="full"><span>HTTPS-адрес JSON-файла</span><input name="url" type="url" required placeholder="https://example.com/catalog.json"></label><div class="full issue warn"><span class="dot"></span><span>Сервер должен разрешать CORS-запросы из браузера. Данные будут импортированы локально и останутся доступны офлайн.</span></div><div class="full actions"><button type="button" class="ghost" data-action="close-modal">Отмена</button><button class="primary" type="submit">Загрузить</button></div></form>`);
}
async function submitRemoteCatalog(form){
  const url=String(new FormData(form).get('url')||'').trim(); if(!url)return;
  const submit=form.querySelector('button[type="submit"]'); submit.disabled=true; submit.textContent='Загрузка…';
  try{
    const res=await fetch(url,{headers:{Accept:'application/json'}}); if(!res.ok)throw new Error(`HTTP ${res.status}`);
    const data=await res.json();
    const blob=new Blob([JSON.stringify(data)],{type:'application/json'});
    const file=new File([blob],'remote-catalog.json',{type:'application/json'});
    closeModal(); await importCatalogFile(file);
  }catch(err){ submit.disabled=false; submit.textContent='Загрузить'; toast('URL недоступен','Проверьте адрес и CORS-настройки источника.','bad'); }
}

function resetApp(){
  if(!confirm('Удалить все локальные сборки, пользовательский каталог и настройки SetupLab?'))return;
  localStorage.removeItem(STORAGE_KEY); state=deepClone(defaultState); applyTheme(); seedDemoBuilds(); renderAll(); toast('Локальные данные сброшены');
}

function exportComparisonReport(){
  const builds=state.compareIds.map(getBuild).filter(Boolean).slice(0,3); if(!builds.length){toast('Нет данных','Выберите сборки для сравнения.','warn');return;}
  const rows=builds.map(b=>{ const m=calculateBuild(b); return `<tr><td>${escapeHTML(b.name)}</td><td>${escapeHTML(categoryName(b.group))}</td><td>${money(m.total)}</td><td>${m.score}/100</td><td>${money(m.pricePerPoint)}</td><td>${m.compatibility}%</td><td>${m.upgrade}%</td><td>${money(m.threeYear)}</td></tr>`; }).join('');
  const html=`<!doctype html><html lang="ru"><meta charset="utf-8"><title>SetupLab Report</title><style>body{font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;margin:40px;color:#17191f}h1{margin-bottom:4px}p{color:#666}table{width:100%;border-collapse:collapse;margin-top:26px}th,td{padding:12px;border:1px solid #ddd;text-align:left;font-size:13px}th{background:#f4f4f6}@media print{body{margin:20px}}</style><h1>SetupLab Report</h1><p>Сформировано ${new Date().toLocaleString('ru-RU')}</p><table><thead><tr><th>Сборка</th><th>Тип</th><th>Стоимость</th><th>Баллы</th><th>Цена балла</th><th>Совместимость</th><th>Апгрейд</th><th>Стоимость 3 года</th></tr></thead><tbody>${rows}</tbody></table></html>`;
  downloadText(html,`setuplab-report-${new Date().toISOString().slice(0,10)}.html`,'text/html'); toast('Отчёт подготовлен','HTML можно открыть в браузере и сохранить как PDF.');
}

function drawCompareChart(){
  const canvas=$('#compareChart'); if(!canvas)return; const builds=state.compareIds.map(getBuild).filter(Boolean).slice(0,3); if(!builds.length)return;
  const css=getComputedStyle(document.documentElement), text=css.getPropertyValue('--text').trim(), muted=css.getPropertyValue('--muted').trim(), line=css.getPropertyValue('--line-strong').trim(), accent=css.getPropertyValue('--accent').trim();
  const dpr=Math.min(window.devicePixelRatio||1,2), rect=canvas.getBoundingClientRect(), w=Math.max(320,rect.width), h=340; canvas.width=w*dpr; canvas.height=h*dpr; const ctx=canvas.getContext('2d'); ctx.scale(dpr,dpr); ctx.clearRect(0,0,w,h);
  const data=builds.map(b=>({b,m:calculateBuild(b)}));
  const maxCost=Math.max(...data.map(x=>x.m.total),1), maxValue=Math.max(...data.map(x=>x.m.pricePerPoint),1);
  const metrics=[
    {label:'Баллы',value:x=>x.m.score},
    {label:'Совместимость',value:x=>x.m.compatibility},
    {label:'Апгрейдность',value:x=>x.m.upgrade},
    {label:'Доступность',value:x=>100-(x.m.total/maxCost*80)},
    {label:'Цена/балл',value:x=>100-(x.m.pricePerPoint/maxValue*80)}
  ];
  const pad={l:104,r:18,t:36,b:58}, plotW=w-pad.l-pad.r, rowH=(h-pad.t-pad.b)/metrics.length;
  ctx.font='11px -apple-system,BlinkMacSystemFont,sans-serif'; ctx.textBaseline='middle';
  for(let i=0;i<=4;i++){ const x=pad.l+plotW*i/4; ctx.strokeStyle=line; ctx.globalAlpha=.42; ctx.beginPath();ctx.moveTo(x,pad.t-10);ctx.lineTo(x,h-pad.b+8);ctx.stroke(); ctx.fillStyle=muted;ctx.globalAlpha=1;ctx.textAlign='center';ctx.fillText(`${i*25}`,x,h-pad.b+25); }
  const barH=Math.min(12,rowH/(data.length+1));
  metrics.forEach((metric,mi)=>{
    const y0=pad.t+mi*rowH; ctx.fillStyle=muted;ctx.textAlign='right';ctx.fillText(metric.label,pad.l-12,y0+rowH/2);
    data.forEach((entry,bi)=>{ const val=clamp(metric.value(entry),0,100), y=y0+rowH/2+(bi-(data.length-1)/2)*(barH+3)-barH/2; const grad=ctx.createLinearGradient(pad.l,0,pad.l+plotW,0); grad.addColorStop(0,accent); grad.addColorStop(1,bi===0?accent:bi===1?'#30d158':'#ff9f0a'); ctx.globalAlpha=.45+bi*.23; ctx.fillStyle=grad; roundRect(ctx,pad.l,y,plotW*val/100,barH,barH/2);ctx.fill(); });
  });
  ctx.globalAlpha=1; let x=pad.l; data.forEach((entry,i)=>{ ctx.fillStyle=i===0?accent:i===1?'#30d158':'#ff9f0a';ctx.beginPath();ctx.arc(x,h-18,5,0,Math.PI*2);ctx.fill();ctx.fillStyle=text;ctx.textAlign='left';ctx.fillText(entry.b.name,x+10,h-18);x+=Math.min(220,ctx.measureText(entry.b.name).width+46); });
}
function roundRect(ctx,x,y,w,h,r){ const rr=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+rr,y);ctx.arcTo(x+w,y,x+w,y+h,rr);ctx.arcTo(x+w,y+h,x,y+h,rr);ctx.arcTo(x,y+h,x,y,rr);ctx.arcTo(x,y,x+w,y,rr);ctx.closePath(); }
window.addEventListener('resize',()=>{ if(state.activeView==='compare')requestAnimationFrame(drawCompareChart); });

function setupInstallPrompt(){
  window.addEventListener('beforeinstallprompt',e=>{ e.preventDefault(); deferredInstallPrompt=e; });
  window.addEventListener('appinstalled',()=>{ deferredInstallPrompt=null; toast('SetupLab установлен','Приложение доступно с домашнего экрана.'); });
}
function isIOS(){ return /iphone|ipad|ipod/i.test(navigator.userAgent); }
function isStandalone(){ return matchMedia('(display-mode: standalone)').matches || navigator.standalone===true; }
async function openInstall(){
  if(isStandalone()){toast('Приложение уже установлено');return;}
  if(deferredInstallPrompt){ deferredInstallPrompt.prompt(); await deferredInstallPrompt.userChoice; deferredInstallPrompt=null; return; }
  showInstallHelp();
}
function showInstallHelp(){
  const body=isIOS()?`<div class="issue-list"><div class="issue good"><span class="dot"></span><span>Откройте опубликованный сайт в Safari.</span></div><div class="issue good"><span class="dot"></span><span>Нажмите кнопку «Поделиться» в панели Safari.</span></div><div class="issue good"><span class="dot"></span><span>Выберите «На экран Домой», затем подтвердите добавление.</span></div><div class="issue warn"><span class="dot"></span><span>Первый запуск с интернетом нужен для загрузки каталога и офлайн-кэша.</span></div></div>`:`<div class="issue-list"><div class="issue good"><span class="dot"></span><span>Откройте меню браузера и выберите «Установить приложение».</span></div><div class="issue warn"><span class="dot"></span><span>Если пункта нет, приложение всё равно можно использовать в браузере и добавить страницу в закладки.</span></div></div>`;
  openModal('Установка SetupLab','PWA',body);
}
function registerServiceWorker(){
  if('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register(`./sw.js?v=${APP_VERSION}`,{updateViaCache:'none'}).then(reg=>reg.update()).catch(()=>{});
}

init();
