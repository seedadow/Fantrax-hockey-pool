(function(){
document.documentElement.className += " js";
var DATA=window.TRUE_NORTH_DATA, KEY="trueNorthDraftV3";
var state={drafted:[]}, selected=null, pos="ALL", availableOnly=true;
function byId(x){return document.getElementById(x)}
function money(x){return "$"+Number(x||0).toFixed(2)}
try{var saved=window.localStorage&&localStorage.getItem(KEY); if(saved) state=JSON.parse(saved)}catch(e){}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){}}
function drafted(name){for(var i=0;i<state.drafted.length;i++)if(state.drafted[i].name===name)return state.drafted[i];return null}
function teamLive(t){var base=DATA.teams[t],spent=0,n=0;for(var i=0;i<state.drafted.length;i++){if(state.drafted[i].owner===t){spent+=Number(state.drafted[i].price);n++}}return{cap:25-Number(base.salary)-spent,open:Math.max(0,Number(base.open)-n)}}
function summary(){var t=teamLive("True North");byId("summary").innerHTML='<div class="stat"><b>'+money(t.cap)+'</b><small>TN cap remaining</small></div><div class="stat"><b>'+t.open+'</b><small>TN spots open</small></div><div class="stat"><b>'+state.drafted.length+'</b><small>players sold</small></div><div class="stat"><b>OFFLINE</b><small>database embedded</small></div>'}
function esc(s){return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;")}
function renderPlayers(){
 var q=byId("q").value.toLowerCase(), arr=[];
 for(var i=0;i<DATA.players.length;i++){var p=DATA.players[i];if(pos!=="ALL"&&p.pos!==pos)continue;if(availableOnly&&drafted(p.name))continue;var hay=(p.name+" "+p.team).toLowerCase();if(q&&hay.indexOf(q)<0)continue;arr.push(p)}
 arr.sort(function(a,b){return Number(a.tnRank)-Number(b.tnRank)});
 var out="";
 for(var j=0;j<Math.min(arr.length,180);j++){var p=arr[j],inj=(p.injury&&p.injury.indexOf("CLEAR")<0)?' · <span class="inj">'+esc(p.injury)+'</span>':"";
 out+='<button class="player" type="button" data-player="'+esc(p.name)+'"><span class="rank">#'+p.tnRank+'</span><span class="pname"><b>'+esc(p.name)+'</b><small>'+p.pos+' · '+esc(p.team)+' · GP '+(p.gp==null?"—":p.gp)+inj+'</small></span><span class="money">'+money(p.marketEstimate)+'<small>MKT</small></span><span class="money">'+money(p.maxBid)+'<small>MAX</small></span></button>'}
 byId("plist").innerHTML=out||'<div class="muted">No matching available players.</div>';
 bindPlayers();
}
function bindPlayers(){var els=document.querySelectorAll("[data-player]");for(var i=0;i<els.length;i++)els[i].onclick=function(){show(this.getAttribute("data-player"))}}
function show(name){var p=null;for(var i=0;i<DATA.players.length;i++)if(DATA.players[i].name===name){p=DATA.players[i];break}if(!p)return;selected=p;var sold=drafted(name),inj=(p.injury&&p.injury.indexOf("CLEAR")<0)?'<p class="inj"><b>'+esc(p.injury)+'</b><br>'+esc(p.return||"No firm return date")+'</p>':'<p class="good">No material current injury adjustment</p>';
 var stats="",k;for(k in (p.stats||{}))stats+=esc(k)+" "+Number(p.stats[k]).toFixed(k==="GAA"?2:1)+" · ";
 var body='<div class="big">'+esc(p.name)+'</div><div class="muted">'+p.pos+' · '+esc(p.team)+' · GP '+p.gp+'</div><div class="kv"><div><small>TN Rank</small><b>#'+p.tnRank+'</b></div><div><small>Fantrax Rank</small><b>#'+p.poolRank+'</b></div><div><small>TN Value</small><b>'+money(p.tnValue)+'</b></div><div><small>Market Est.</small><b>'+money(p.marketEstimate)+'</b></div><div><small>Maximum Bid</small><b>'+money(p.maxBid)+'</b></div></div><div class="muted">'+stats+'</div><p class="muted"><b>Category-only model:</b> '+Number(p.categoryScore||0).toFixed(1)+' · <b>vs Fantrax:</b> '+(p.fantraxGap==null?'—':(p.fantraxGap>0?'+':'')+p.fantraxGap)+' ranks · '+esc(p.source||'')+'</p>'+inj;
 if(sold)body+='<p class="bad"><b>SOLD:</b> '+esc(sold.owner)+' for '+money(sold.price)+'</p>';
 else body+='<div class="bidrow"><select id="owner"></select><input id="price" inputmode="decimal" type="number" min=".1" step=".1" value="'+Number(p.tnValue||.1).toFixed(1)+'"><button id="soldBtn" class="btn">SOLD</button></div><div id="advice"></div>';
 byId("detail").innerHTML=body;
 if(!sold){var sel=byId("owner"),teams=Object.keys(DATA.teams);for(i=0;i<teams.length;i++){var o=document.createElement("option");o.text=teams[i];o.value=teams[i];if(teams[i]==="True North")o.selected=true;sel.appendChild(o)}byId("price").oninput=advice;byId("soldBtn").onclick=function(){sell(p)};advice()}
}
function advice(){if(!selected)return;var bid=Number(byId("price").value||0),max=Number(selected.maxBid||0),val=Number(selected.tnValue||0),cap=teamLive("True North").cap,txt="BID",cl="good";if(bid>cap||bid>max){txt="STOP";cl="bad"}else if(bid>val){txt="STRETCH";cl="warn"}else if(bid>=val*.8){txt="ACCEPTABLE"}byId("advice").innerHTML='<p><b class="'+cl+'">'+txt+'</b> <span class="muted">at '+money(bid)+' for True North</span></p>'}
function sell(p){var price=Math.max(.1,Number(byId("price").value)||.1),owner=byId("owner").value;state.drafted.push({name:p.name,owner:owner,price:price});save();byId("detail").innerHTML="<h3>Recorded</h3><div class=muted>Tap the next player.</div>";selected=null;renderAll()}
function renderLog(){var out="";for(var i=state.drafted.length-1;i>=0;i--){var x=state.drafted[i];out+='<div class="log"><span><b>'+esc(x.name)+'</b><br><span class="muted">'+esc(x.owner)+'</span></span><b>'+money(x.price)+'</b></div>'}byId("draftlog").innerHTML=out||'<div class="muted">No test picks yet.</div>'}
function renderTeams(){var teams=Object.keys(DATA.teams),out="";for(var i=0;i<teams.length;i++){var t=teams[i],x=teamLive(t);out+='<div class="team"><b>'+esc(t)+'</b><div class="kv"><div><small>Cap left</small><b>'+money(x.cap)+'</b></div><div><small>Open spots</small><b>'+x.open+'</b></div></div></div>'}byId("teamgrid").innerHTML=out}
function renderRookies(){var out="";for(var i=0;i<DATA.rookies.length;i++){var r=DATA.rookies[i];var d=r.draftYear+" • Rd "+r.draftRound+", pick "+r.pickInRound+" in round • #"+r.overallPick+" overall";out+='<div class="player"><span class="rank">#'+r.rank+'</span><span class="pname"><b>'+esc(r.name)+'</b><small>'+esc(r.team)+' • '+esc(d)+'</small></span><span>'+r.pos+'</span><span></span></div>'}byId("rlist").innerHTML=out}
function renderAll(){summary();renderPlayers();renderLog();renderTeams();renderRookies()}
var tabs=document.querySelectorAll("[data-tab]");for(var i=0;i<tabs.length;i++)tabs[i].onclick=function(){var all=document.querySelectorAll("[data-tab]"),panels=document.querySelectorAll(".tab");for(var j=0;j<all.length;j++)all[j].classList.remove("on");for(j=0;j<panels.length;j++)panels[j].classList.add("hidden");this.classList.add("on");byId(this.getAttribute("data-tab")).classList.remove("hidden");renderAll()};
var filters=document.querySelectorAll("[data-pos]");for(i=0;i<filters.length;i++)filters[i].onclick=function(){for(var j=0;j<filters.length;j++)filters[j].classList.remove("on");this.classList.add("on");pos=this.getAttribute("data-pos");renderPlayers()};
byId("avail").onclick=function(){availableOnly=!availableOnly;this.classList.toggle("on");renderPlayers()};
byId("q").oninput=renderPlayers;
byId("undo").onclick=function(){if(state.drafted.length){state.drafted.pop();save();renderAll()}};
byId("reset").onclick=function(){if(window.confirm("Erase this test draft and start over?")){state={drafted:[]};save();renderAll()}};
renderAll();
})();
