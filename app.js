/* PG/LAB — an entirely static GitHub Pages presentation.
   No dependencies, API calls, server, data collection or SQL execution. */
'use strict';

const products = [
  {id:1,name:'Atlas Pro 14',category:'laptop',price:1299,specs:{ram:16,cpu:'Core i7'},tags:['portable','premium']},
  {id:2,name:'Nova Air',category:'laptop',price:899,specs:{ram:8,cpu:'Ryzen 5'},tags:['student','lightweight']},
  {id:3,name:'Pulse X',category:'headset',price:149,wireless:true,tags:['gaming','wireless','audio']},
  {id:4,name:'Forge 16',category:'laptop',price:1699,specs:{ram:32,cpu:'Ryzen 9'},tags:['gaming','premium']},
  {id:5,name:'Orbit Key',category:'keyboard',price:99,mechanical:true,tags:['mechanical','office']},
  {id:6,name:'Wave Mini',category:'headset',price:79,wireless:true,tags:['wireless','budget']}
];

const presenterNotes = [
  `Today I'll show how PostgreSQL lets us query flexible, nested data without leaving SQL. We will compare JSON and JSONB, learn the key operators, explore nested queries and JSONPath, and finish with performance and production advice. There is also an interactive mini-lab where you can change search conditions and watch the SQL update.`,
  `Imagine a product catalog. A laptop has RAM and a CPU, but a headset has wireless properties. If every new product attribute requires a new database column, our table becomes difficult to maintain. JSONB lets us store these variable attributes together while continuing to query them with SQL. However, flexibility is valuable only if the information remains discoverable and usable.`,
  `PostgreSQL supports two different types for JSON-shaped data. JSON stores the input text, including whitespace and object key order. JSONB stores a decomposed binary representation that is faster to process in most querying situations and can be indexed. JSONB does not preserve object key order or duplicate keys. The tradeoff is conversion when data is inserted. For analytics and application queries, JSONB is often the practical choice.`,
  `We'll work with one catalog table. It has a conventional numeric primary key and a JSONB data column. The JSONB column can include each product's name, category, price, tags, and optional attributes. Our six-record demo contains three laptops, two headsets, and one keyboard. Notice how we combine relational structure for stable identifiers with JSONB flexibility for attributes that differ between products. The complete sample dataset is included with the presentation.`,
  `The operators are small but powerful. A single arrow extracts a JSON value; a double arrow extracts text. At-sign greater-than tests whether a JSON document contains a structure. Question mark checks whether a top-level key, or string array element, exists. Hash double-arrow takes a path of nested keys and returns text. Finally, at-question-mark enables JSONPath existence searches for more complex conditions.`,
  `Let's extract the RAM value. The path data to specs to ram returns the JSONB number 16. If we use hash-double-arrow with a path array, the output is the text string 16. That difference matters for comparisons: comparing numbers as text can produce incorrect ordering, so we cast the extracted value to integer. Also remember that a missing key normally produces SQL NULL rather than an exception for these extraction operators.`,
  `Here are two real queries on our catalog. The containment operator selects all JSONB documents whose category is laptop, returning three products. The existence operator tests whether specs is a top-level key; in this dataset, those are also the three laptops. These queries happen to return the same rows, but they ask different questions. Key existence is not a recursive search and does not check arbitrary nested attributes.`,
  `Now let's test these ideas. The controls on the left choose a category, a minimum amount of RAM, and a maximum price. The right side shows the corresponding PostgreSQL SQL and which sample records match. Try selecting laptops, sixteen gigabytes of RAM, and a maximum price of fifteen hundred dollars. Only Atlas Pro 14 remains. This interface is a deterministic browser teaching simulator, not a live database; the included SQL seed file lets you reproduce the queries in PostgreSQL.`,
  `JSONPath is useful when we need more expressive document searches. The first query uses at-question-mark to look inside the tags array for the string gaming; it matches Pulse X and Forge 16. The second query uses double-at to evaluate the predicate that price exceeds one thousand; it matches Atlas Pro 14 and Forge 16. These operators have distinct semantics, and PostgreSQL can use appropriate GIN indexes for certain JSONPath patterns.`,
  `JSONB is not only about retrieving a document. We can turn a JSON array into relational rows with jsonb_array_elements_text and a lateral join. Here we expand every product's tags and count the frequency of each tag. Gaming, premium, and wireless each appear twice in our small dataset. This pattern is useful for dashboards, usage analytics, and category reporting while retaining a flexible source document.`,
  `Performance requires the right kind of index. A default GIN index using jsonb_ops supports containment, key existence, and supported JSONPath searches. The jsonb_path_ops operator class is more specialized and can be effective for containment and JSONPath, but it does not support the question-mark existence operator. For comparisons on a scalar such as price, an expression-based B-tree index may be more suitable. Indexes help specific workloads; they also take storage and make writes more expensive.`,
  `Do not trust an index simply because it exists. Use EXPLAIN with ANALYZE and BUFFERS to inspect the actual execution and data-access behavior. On a table with only six rows, PostgreSQL may rightly prefer a sequential scan. On larger data, a suitable index may lead to a bitmap index scan. The diagrams here show possible plan shapes, not a measured speed improvement. Always test against realistic volumes and distributions.`,
  `There are four mistakes worth avoiding. First, the double arrow returns text, so cast for numeric comparisons. Second, the existence operator is not a recursive search. Third, indexes cost disk space and update work. Fourth, JSONB is not a replacement for relational modeling: stable primary keys, foreign keys, and heavily joined data often belong in regular SQL columns. The goal is a balanced design, not putting everything into one document.`,
  `Before the summary, three quick checks. Which arrow returns text? The double arrow. Does the question-mark operator search nested objects recursively? No, it checks only the top level. And does jsonb_path_ops support question-mark key existence? No; the default jsonb_ops class does. If the audience can answer these three questions, they understand the most common sources of mistakes in JSONB querying.`,
  `To conclude, JSONB combines flexible document storage with the analytical power of SQL. Extraction operators help navigate documents, JSONPath helps with more complex conditions, and lateral functions unlock conventional SQL aggregation. A thoughtful indexing strategy can improve performance, but must be validated against real queries. The references here link to the official PostgreSQL documentation for each major topic. Thank you for listening. I'm happy to take questions.`
];

const slides = Array.from(document.querySelectorAll('.slide'));
const total = slides.length;
const countLabel = document.getElementById('slideCount');
const nameLabel = document.getElementById('slideName');
const progress = document.getElementById('progressFill');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const noteText = document.getElementById('noteText');
const notesPanel = document.getElementById('notesPanel');
const noteSlideNumber = document.getElementById('noteSlideNumber');
const overview = document.getElementById('overview');
const overviewList = document.getElementById('overviewList');
const announce = document.getElementById('announce');
let current = 0;
let toastTimeout;

const pad = n => String(n).padStart(2,'0');
function toast(message){
  const t = document.getElementById('toast');
  t.textContent = message; t.classList.add('visible');
  clearTimeout(toastTimeout);
  toastTimeout=setTimeout(()=>t.classList.remove('visible'),2000);
}
function showSlide(index, push = true){
  index = Math.max(0,Math.min(total-1,index));
  slides[current].classList.remove('active');
  slides[current].setAttribute('aria-hidden','true');
  current=index;
  slides[current].classList.add('active');
  slides[current].removeAttribute('aria-hidden');
  slides[current].scrollTop=0;
  countLabel.innerHTML=`${pad(current+1)} <span>/ ${pad(total)}</span>`;
  nameLabel.textContent=slides[current].dataset.title;
  progress.style.width=`${((current+1)/total)*100}%`;
  prevBtn.disabled=current===0;
  nextBtn.disabled=current===total-1;
  prevBtn.style.opacity=current===0?'.45':'1';
  nextBtn.style.opacity=current===total-1?'.45':'1';
  noteText.textContent=presenterNotes[current] || '';
  noteSlideNumber.textContent=`${pad(current+1)} / ${pad(total)}`;
  if(push && window.location.hash!==`#${current+1}`){history.replaceState(null,'',`#${current+1}`)}
  announce.textContent=`Slide ${current+1} of ${total}: ${slides[current].dataset.title}`;
  overviewList.querySelectorAll('.overview-item').forEach((el,i)=>el.classList.toggle('current',i===current));
}
prevBtn.addEventListener('click',()=>showSlide(current-1));
nextBtn.addEventListener('click',()=>showSlide(current+1));
function setOverview(open){
  overview.hidden=!open;
  document.body.classList.toggle('overview-open',open);
  if(open){overview.querySelector('.close-btn').focus()}else{document.getElementById('overviewBtn').focus()}
}
function setNotes(open){notesPanel.hidden=!open}
for(let i=0;i<total;i++){
  const button=document.createElement('button');
  button.type='button';button.className='overview-item';
  button.innerHTML=`<span>${pad(i+1)} / ${pad(total)}</span><strong>${slides[i].dataset.title}</strong>`;
  button.addEventListener('click',()=>{showSlide(i);setOverview(false)});
  overviewList.appendChild(button);
}
document.getElementById('overviewBtn').addEventListener('click',()=>setOverview(true));
document.getElementById('closeOverview').addEventListener('click',()=>setOverview(false));
document.getElementById('closeNotes').addEventListener('click',()=>setNotes(false));
document.getElementById('fullscreenBtn').addEventListener('click',async()=>{
  try{if(!document.fullscreenElement)await document.documentElement.requestFullscreen();else await document.exitFullscreen()}
  catch{toast('Fullscreen is unavailable in this browser')}
});
document.addEventListener('keydown',e=>{
  const editing=['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName);
  if(editing && !['Escape'].includes(e.key))return;
  if(e.key==='Escape'){if(!overview.hidden)setOverview(false);else if(!notesPanel.hidden)setNotes(false);return}
  if(!overview.hidden)return;
  switch(e.key){
    case 'ArrowRight':case 'PageDown':case ' ':e.preventDefault();showSlide(current+1);break;
    case 'ArrowLeft':case 'PageUp':e.preventDefault();showSlide(current-1);break;
    case 'Home':e.preventDefault();showSlide(0);break;
    case 'End':e.preventDefault();showSlide(total-1);break;
    case 'g':case 'G':setOverview(true);break;
    case 'n':case 'N':setNotes(notesPanel.hidden);break;
    case 'f':case 'F':document.getElementById('fullscreenBtn').click();break;
    case '?':toast('← → navigate · N notes · G overview · F fullscreen · P print');break;
    case 'p':case 'P':window.print();break;
  }
});
window.addEventListener('hashchange',()=>{
 const num=parseInt(window.location.hash.slice(1),10);
 if(Number.isInteger(num) && num>=1 && num<=total && num!==current+1)showSlide(num-1,false);
});
let touchX=null;let touchY=null;
const deck=document.getElementById('presentation');
deck.addEventListener('touchstart',e=>{if(e.target.closest('input, select, button, a, pre'))return;touchX=e.changedTouches[0].screenX;touchY=e.changedTouches[0].screenY},{passive:true});
deck.addEventListener('touchend',e=>{if(touchX===null)return;const dx=e.changedTouches[0].screenX-touchX;const dy=e.changedTouches[0].screenY-touchY;if(Math.abs(dx)>70 && Math.abs(dx)>Math.abs(dy)*1.5)showSlide(current+(dx<0?1:-1));touchX=null;touchY=null},{passive:true});

// Small tokenizer: purely cosmetic syntax highlighting, no code execution.
function sqlHighlight(source){
  const tokens=/--[^\n]*|'(?:''|[^'])*'|\b(?:SELECT|FROM|WHERE|AS|CREATE|TABLE|BIGSERIAL|PRIMARY|KEY|JSONB|NOT|NULL|INSERT|INTO|VALUES|ON|USING|INDEX|LATERAL|CROSS|JOIN|GROUP|BY|ORDER|DESC|ASC|COUNT|EXPLAIN|ANALYZE|BUFFERS|AND|OR|TRUE|FALSE|INTEGER|INT|NUMERIC)\b|\b\d+(?:\.\d+)?\b|(?:->>|#>>|->|#>|@>|@\?|@@|\?|::|>=|<=|=|>)/gi;
  let html='';let last=0;
  const escape=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  for(const match of source.matchAll(tokens)){
    const m=match[0],at=match.index;
    html+=escape(source.slice(last,at));
    let type;
    if(m.startsWith('--'))type='sql-comment';
    else if(m.startsWith("'"))type='sql-string';
    else if(/^\d/.test(m))type='sql-number';
    else if(/^(->>|#>>|->|#>|@>|@\?|@@|\?|::|>=|<=|=|>)$/.test(m))type='sql-operator';
    else if(/^(COUNT|LATERAL)$/i.test(m))type='sql-function';
    else type='sql-keyword';
    html+=`<span class="${type}">${escape(m)}</span>`;
    last=at+m.length;
  }
  return html+escape(source.slice(last));
}
for(const code of document.querySelectorAll('.language-sql'))code.innerHTML=sqlHighlight(code.textContent);

// Interactive lab; mirrors the included PostgreSQL seed dataset.
const categorySelect=document.getElementById('categorySelect');
const ramSelect=document.getElementById('ramSelect');
const priceRange=document.getElementById('priceRange');
const priceValue=document.getElementById('priceValue');
const resultCount=document.getElementById('resultCount');
const queryResults=document.getElementById('queryResults');
const generatedSql=document.getElementById('generatedSql');
function updateLab(){
  const category=categorySelect.value, ram=Number(ramSelect.value), price=Number(priceRange.value);
  priceValue.textContent=`$${price.toLocaleString('en-US')}`;
  const where=[];
  if(category!=='all')where.push(`data @> '{"category":"${category}"}'::jsonb`);
  if(ram>0)where.push(`(data #>> '{specs,ram}')::int >= ${ram}`);
  if(price<2000)where.push(`(data->>'price')::numeric <= ${price}`);
  const sql=['SELECT id,','       data->>\'name\' AS product,',"       data->>'category' AS category,","       (data->>'price')::numeric AS price",'FROM catalog',...(where.length?['WHERE '+where.join('\n  AND ')]:[]),'ORDER BY id;'].join('\n');
  generatedSql.innerHTML=sqlHighlight(sql);
  const filtered=products.filter(p=>(category==='all'||p.category===category)&&(ram===0||(p.specs?.ram??0)>=ram)&&p.price<=price);
  resultCount.textContent=`${filtered.length} ${filtered.length===1?'ROW':'ROWS'}`;
  queryResults.replaceChildren();
  if(!filtered.length){const blank=document.createElement('div');blank.className='empty-results';blank.textContent='∅ No matching records — try wider filters.';queryResults.appendChild(blank)}
  for(const p of filtered){const row=document.createElement('div');row.className='results-row';for(const value of [pad(p.id),p.name,p.category,`$${p.price.toLocaleString('en-US')}`]){const cell=document.createElement('span');cell.textContent=value;row.appendChild(cell)}queryResults.appendChild(row)}
}
[categorySelect,ramSelect,priceRange].forEach(el=>el.addEventListener('input',updateLab));
document.getElementById('resetFilters').addEventListener('click',()=>{categorySelect.value='all';ramSelect.value='0';priceRange.value='2000';updateLab();toast('Filters reset')});
document.getElementById('copyQuery').addEventListener('click',async()=>{
  try{await navigator.clipboard.writeText(generatedSql.textContent);toast('SQL copied to clipboard')}
  catch{toast('Copy unavailable here — select the SQL manually')}
});
updateLab();
for(const card of document.querySelectorAll('.quiz-card')){
 card.setAttribute('aria-expanded','false');
 card.addEventListener('click',()=>{
   const opening=!card.classList.contains('revealed');
   card.classList.toggle('revealed',opening);
   card.querySelector('.quiz-answer').textContent=opening?card.dataset.answer:'';
   card.querySelector('.quiz-reveal').textContent=opening?'ANSWER SHOWN ✓':'TAP TO REVEAL ↗';
   card.setAttribute('aria-expanded',String(opening));
 });
}
const hashNum=parseInt(window.location.hash.slice(1),10);
showSlide(Number.isInteger(hashNum)&&hashNum>=1&&hashNum<=total?hashNum-1:0,false);
