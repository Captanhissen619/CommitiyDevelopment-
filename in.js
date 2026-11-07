var heroes = [];
var voted = [];
var ads = {};
var catNow = "All";
var ADMIN_PASS = "AmosGudeleblock123+";
try{ var s1 = localStorage.getItem("jh_heroes_v2"); if(s1) heroes = JSON.parse(s1); var s2 = localStorage.getItem("jh_voted"); if(s2) voted = JSON.parse(s2); var s3 = localStorage.getItem("jh_ads"); if(s3) ads = JSON.parse(s3); }catch(e){}
for(var i=0;i<heroes.length;i++){ if(!heroes[i].status) heroes[i].status="approved"; if(typeof heroes[i].votes!=="number") heroes[i].votes=0; if(typeof heroes[i].views!=="number") heroes[i].views=0; }
function saveAll(){ try{ localStorage.setItem("jh_heroes_v2",JSON.stringify(heroes)); localStorage.setItem("jh_voted",JSON.stringify(voted)); localStorage.setItem("jh_ads",JSON.stringify(ads)); }catch(e){} }
function el(id){ return document.getElementById(id); }
function showMsg(t){ var b=el("msgBox"); if(!b){ alert(t); return; } b.innerText=t; b.style.display="block"; window.scrollTo(0,0); setTimeout(function(){ b.style.display="none"; },5000); }
function go(p){
  var pages=["home","leader","hero","about","ads","contact","admin"];
  for(var i=0;i<pages.length;i++){ var pg=el("p-"+pages[i]); if(pg) pg.classList.remove("show"); }
  var target=el("p-"+p); if(target) target.classList.add("show");
  window.scrollTo(0,0);
  if(p==="leader") drawLeader();
  if(p==="admin") drawAdmin();
  drawAds(); updatePendingBadge();
}
function setCat(c){ catNow=c; draw(); }
function photo(h){ try{ return h.photo || "https://via.placeholder.com/400x180?text="+encodeURIComponent(h.name); }catch(e){ return "https://via.placeholder.com/400x180?text=Hero"; } }
function wa(text){ return "https://api.whatsapp.com/send?phone=211925799662&text="+encodeURIComponent(text||"Hello Amos"); }
function cleanPhone(p){ if(!p) return ""; p = String(p).replace(/[^0-9]/g,""); if(p.length===10 && p.charAt(0)==="0") p = "211"+p.substring(1); if(p.length===9) p = "211"+p; return p; }
function fixLink(l){ if(!l) return ""; l = String(l).trim(); if(l.indexOf("http")!==0) l = "https://"+l; return l; }
function shopWA(ad, text){ var num = cleanPhone((ad && (ad.wa || ad.phone)) || ""); if(num) return "https://api.whatsapp.com/send?phone="+num+"&text="+encodeURIComponent(text||"Hello, I saw your ad on Juba Heroes"); return wa(text||"Hello Amos"); }
function shareLink(h){ return "https://api.whatsapp.com/send?text="+encodeURIComponent("Vote for "+h.name+" on JUBA HEROES! "+h.loc+" - "+h.votes+" votes. Help them become #1 Hero of Juba!"); }
function approvedList(){ return heroes.filter(function(h){ return h.status==="approved"; }); }
function pendingList(){ return heroes.filter(function(h){ return h.status==="pending"; }); }
function updatePendingBadge(){ var n=pendingList().length; var c=el("pendingCount"); if(c) c.innerText = n>0 ? "("+n+" PENDING)" : ""; var t=el("pendingTitle"); if(t) t.innerText=n+" waiting"; }
function voteBtn(h,big){ if(voted.indexOf(h.id)!==-1) return '<button type="button" class="btn '+(big?'btn-vote btn-off':'small btn-off')+'" disabled>✓ VOTED</button>'; return '<button type="button" class="btn '+(big?'btn-vote vote-btn':'small btn-vote vote-btn')+'" onclick="doVote('+h.id+',this)">✔ VOTE</button>'; }
function openLightbox(id){
  var h=null; for(var i=0;i<heroes.length;i++){ if(String(heroes[i].id)===String(id)) h=heroes[i]; }
  if(!h) return;
  var img=el("lightboxImg"); if(!img) return;
  img.src=photo(h); img.classList.remove("zoomed");
  var nm=el("lightboxName"); if(nm) nm.innerText=h.name+" - "+h.loc+" • Tap image to zoom";
  var lb=el("lightbox"); if(lb) lb.classList.add("show");
  document.body.style.overflow="hidden";
}
function closeLightbox(){ var lb=el("lightbox"); if(lb) lb.classList.remove("show"); document.body.style.overflow=""; var img=el("lightboxImg"); if(img) img.classList.remove("zoomed"); }
function toggleZoom(){ var img=el("lightboxImg"); if(img) img.classList.toggle("zoomed"); }
function openAdLightbox(src, name){
  if(!src) return;
  var img=el("lightboxImg"); if(!img) return;
  img.src=src; img.classList.remove("zoomed");
  var nm=el("lightboxName"); if(nm) nm.innerText=name||"Advertisement";
  var lb=el("lightbox"); if(lb) lb.classList.add("show");
  document.body.style.overflow="hidden";
}
function safeAdImg(ad){ if(!ad || !ad.p) return ""; return ad.p; }
function adHTML(ad, key){
  if(!ad) return "";
  var link = fixLink(ad.link||"");
  var imgTag = safeAdImg(ad) ? '<img src="'+safeAdImg(ad)+'" onclick="event.stopPropagation();openAdLightbox(\''+String(safeAdImg(ad)).substring(0,2000).replace(/\'/g,"")+'\',\''+String(ad.t||"").replace(/\'/g,"")+'\')">' : '';
  var titleHTML = '<h3>'+(ad.t||"")+'</h3><p>'+(ad.x||"")+'</p>'+imgTag;
  var buttons = '';
  if(link) buttons += '<a class="btn btn-share" href="'+link+'" target="_blank" style="margin-top:8px;">🌐 VISIT WEBSITE</a> ';
  buttons += '<a class="btn btn-wa" href="'+shopWA(ad, "Hello, I saw your ad on Juba Heroes: "+(ad.t||""))+'" target="_blank" style="margin-top:8px;">🟢 WHATSAPP SHOP</a>';
  if(link) return '<div class="ad"><span>ADVERTISEMENT - '+key.toUpperCase()+'</span><div style="color:#0a2a5e;">'+titleHTML+'</div>'+buttons+'<br><small style="color:#888;">'+link+'</small></div>';
  return '<div class="ad"><span>ADVERTISEMENT - '+key.toUpperCase()+'</span><div style="color:#0a2a5e;">'+titleHTML+'</div>'+buttons+'</div>';
}
function drawAds(){
  try{
    function one(key,title,price){
      if(ads[key]) return adHTML(ads[key], key);
      return '<div class="ad"><span>ADVERTISEMENT</span><a href="'+wa("I want "+key+" AD")+'" style="text-decoration:none;color:#0a2a5e;"><h3>📢 YOUR SHOP HERE - '+title+' - '+price+'</h3><span class="btn btn-vote" style="animation:none;margin-top:8px;display:inline-block;">Click To Advertise</span></a></div>';
    }
    var t=el("topAd"); if(t) t.innerHTML = one("top","Top Banner","10,000 SSP / Week");
    var b=el("botAd"); if(b) b.innerHTML = one("bottom","Bottom Banner","7,000 SSP / Week");
  }catch(e){}
}
function midAd(){
  try{
    if(ads["middle"]){
      var ad = ads["middle"]; var link = fixLink(ad.link||"");
      var inner = '<span>SPONSORED</span><h3>'+(ad.t||"")+'</h3><p>'+(ad.x||"")+'</p>'+(safeAdImg(ad)?'<img src="'+safeAdImg(ad)+'" style="height:110px;" onclick="event.stopPropagation();openAdLightbox(\''+String(safeAdImg(ad)).substring(0,2000).replace(/\'/g,"")+'\',\''+String(ad.t||"").replace(/\'/g,"")+'\')">':'')+'<br>';
      if(link) inner += '<a class="small btn-share" href="'+link+'" target="_blank">🌐 WEBSITE</a> ';
      inner += '<a class="small btn-wa" href="'+shopWA(ad, "Hello, I saw your middle ad on Juba Heroes: "+(ad.t||""))+'" target="_blank">🟢 WHATSAPP</a>';
      return '<div class="card" style="background:#fffbe6;padding:14px;">'+inner+'</div>';
    }
  }catch(e){}
  return '<div class="card" style="background:#fffbe6;padding:18px;"><span>SPONSORED</span><h3 style="margin-top:25px;">📢 YOUR AD HERE</h3><p>Middle - 5,000 SSP / Week</p><a class="small btn-vote" href="'+wa("I want MIDDLE AD")+'">BUY THIS SPOT</a></div>';
}
function draw(){
  try{
    var searchEl=el("search"); if(!searchEl) return;
    var q = (searchEl.value||"").toLowerCase();
    var list = approvedList();
    if(catNow!=="All") list = list.filter(function(h){ return h.cat===catNow; });
    if(q) list = list.filter(function(h){ return (h.name+h.loc+h.cat).toLowerCase().indexOf(q)!==-1; });
    list.sort(function(a,b){ return b.votes-a.votes; });
    var hc=el("heroCount"); if(hc) hc.innerText = "featured heroes • "+list.length+" approved heroes";
    var f = list[0];
    var featEl=el("feat");
    if(featEl){
      if(f){ featEl.innerHTML = '<div class="feature anim-up"><img src="'+photo(f)+'" class="zoom-img feature-img" onclick="openLightbox('+f.id+')"><div><span class="badge">⭐ #1 HERO OF JUBA</span><h1>'+f.name+'</h1><p>'+f.loc+' - '+f.cat+' - '+f.story+'</p><h2 style="margin:8px 0;">Votes: '+f.votes+' votes • 👁 '+(f.views||0)+'</h2><div>'+voteBtn(f,true)+'<button type="button" class="btn btn-share" onclick="openHero('+f.id+')">👁 VIEW STORY</button><a class="btn btn-share" href="'+shareLink(f)+'">↗ SHARE</a><a class="btn btn-wa" href="'+wa("Hello Amos, I want to vote for "+f.name)+'">🟢 WHATSAPP</a></div><p style="font-size:12px;color:#888;margin-top:6px;">👆 Tap photo to see FULL image</p></div></div>'; }
      else { featEl.innerHTML=""; }
    }
    var html = "";
    for(var i=0;i<list.length;i++){
      var h = list[i];
      html += '<div class="card anim-up"><img src="'+photo(h)+'" class="zoom-img" onclick="openLightbox('+h.id+')"><h3 onclick="openHero('+h.id+')">'+h.name+'</h3><p>📍 '+h.loc+' • '+h.cat+'</p><p><b>'+h.votes+' votes</b> • 👁 '+(h.views||0)+'</p>'+voteBtn(h,false)+' <button type="button" class="small btn-share" onclick="openHero('+h.id+')">👁 VIEW</button> <a class="small btn-share" href="'+shareLink(h)+'">↗ SHARE</a></div>';
      if(i===1) html += midAd();
    }
    var gridEl=el("grid"); if(gridEl) gridEl.innerHTML = html || "<p>No approved heroes yet. Be first to nominate!</p>";
    drawAds(); updatePendingBadge();
  }catch(e){ console.log(e); }
}
function drawLeader(){
  try{
    var list = approvedList().sort(function(a,b){ return b.votes-a.votes; }).slice(0,10);
    var html = "";
    for(var i=0;i<list.length;i++){ var h=list[i]; html += '<div style="position:relative;"><div class="rank">#'+(i+1)+'</div><div class="card"><img src="'+photo(h)+'" onclick="openLightbox('+h.id+')"><h3>'+h.name+'</h3><p>📍 '+h.loc+'</p><p><b>'+h.votes+' votes</b></p>'+voteBtn(h,false)+' <a class="small btn-share" href="'+shareLink(h)+'">↗ SHARE</a></div></div>'; }
    var lg=el("leaderGrid"); if(lg) lg.innerHTML = html;
  }catch(e){}
}
function doVote(id,btn){
  if(voted.indexOf(id)!==-1){ alert("You already voted! 1 person = 1 vote."); return; }
  var h=null; for(var i=0;i<heroes.length;i++){ if(String(heroes[i].id)===String(id) && heroes[i].status==="approved") h=heroes[i]; }
  if(!h) return;
  h.votes++; voted.push(id); saveAll(); draw();
  if(btn) btn.classList.add("pop");
  var pt=el("popText"); if(pt) pt.innerHTML = "You voted for <b>"+h.name+"</b> from "+h.loc;
  var pv=el("popVotes"); if(pv) pv.innerHTML = h.votes + " votes 🎉";
  var ps=el("popShare"); if(ps) ps.href = shareLink(h);
  var pb=el("popBox"); if(pb) pb.classList.add("show");
  var em=["🎉","⭐","❤️","💛","🎊","👏","🇸🇸"];
  for(var k=0;k<25;k++){ var c=document.createElement("div"); c.className="conf"; c.innerText=em[Math.floor(Math.random()*em.length)]; c.style.left=Math.random()*100+"vw"; c.style.fontSize=(18+Math.random()*18)+"px"; if(pb) pb.appendChild(c); (function(elm){ setTimeout(function(){ if(elm.parentNode) elm.parentNode.removeChild(elm); },2800); })(c); }
  try{ if(navigator.vibrate) navigator.vibrate([100,50,100]); }catch(e){}
}
function closePop(){ var b=el("popBox"); if(b) b.classList.remove("show"); }
function openHero(id){
  var h=null; for(var i=0;i<heroes.length;i++){ if(String(heroes[i].id)===String(id) && heroes[i].status==="approved") h=heroes[i]; }
  if(!h) return;
  h.views=(h.views||0)+1; saveAll();
  var hb=el("heroBox"); if(hb) hb.innerHTML = '<div class="feature anim-up"><img src="'+photo(h)+'" class="zoom-img feature-img" onclick="openLightbox('+h.id+')"><div><span class="badge">'+h.cat+'</span><h1>'+h.name+'</h1><p>📍 '+h.loc+'</p><p style="font-size:17px;line-height:1.6;margin:10px 0;">'+h.story+'</p><h2>'+h.votes+' votes • 👁 '+(h.views||0)+' views</h2>'+voteBtn(h,true)+' <a class="btn btn-share" href="'+shareLink(h)+'">↗ SHARE</a> <a class="btn btn-wa" href="'+wa("Hello Amos, I want to vote for "+h.name)+'">🟢 WHATSAPP</a><p style="font-size:12px;color:#888;margin-top:6px;">👆 Tap photo to see FULL image</p></div></div>';
  var more = approvedList().filter(function(x){ return String(x.id)!==String(id); }).slice(0,3);
  var mh=""; for(var i=0;i<more.length;i++){ mh+='<div class="card"><img src="'+photo(more[i])+'" onclick="openLightbox('+more[i].id+')"><h3>'+more[i].name+'</h3><p>'+more[i].votes+' votes</p><button type="button" class="small btn-share" onclick="openHero('+more[i].id+')">VIEW</button></div>'; }
  var mg=el("moreGrid"); if(mg) mg.innerHTML=mh;
  go("hero");
}
function addHero(){
  var n=el("nName").value.trim(); var l=el("nLoc").value.trim(); var s=el("nStory").value.trim(); var ph=el("nPhone").value.trim();
  if(!n||!l||!s){ alert("Please fill Name, Location and Story"); return; }
  var f=el("nPhoto").files[0];
  function done(p){
    heroes.push({id:Date.now(),name:n,loc:l,cat:el("nCat").value,story:s,votes:0,photo:p||"",views:0,phone:ph,status:"pending",by:ph||"Guest"});
    saveAll(); draw(); updatePendingBadge();
    el("nMsg").innerText="⏳ Thank you! '"+n+"' is PENDING. Amos will review and approve it soon. It will NOT show until approved.";
    el("nName").value=""; el("nLoc").value=""; el("nStory").value=""; el("nPhone").value="";
    showMsg("⏳ Your hero '"+n+"' is PENDING. Waiting for Amos to approve.");
  }
  if(f){ var r=new FileReader(); r.onload=function(e){ done(e.target.result); }; r.readAsDataURL(f); } else done("");
}
function approveHero(id){
  for(var i=0;i<heroes.length;i++){ if(String(heroes[i].id)===String(id)){ heroes[i].status="approved"; showMsg("✅ Approved! "+heroes[i].name+" now shows on Home."); } }
  saveAll(); draw(); drawAdmin();
}
function rejectHero(id){
  for(var i=0;i<heroes.length;i++){ if(String(heroes[i].id)===String(id)){ heroes[i].status="rejected"; showMsg("❌ Rejected: "+heroes[i].name); } }
  saveAll(); draw(); drawAdmin();
}
function delHero(id){ heroes = heroes.filter(function(h){ return String(h.id)!==String(id); }); voted = voted.filter(function(x){ return String(x)!==String(id); }); saveAll(); draw(); drawAdmin(); }
function loginAdmin(){
  var pass = el("adminPass").value;
  var err = el("adminError");
  if(pass===ADMIN_PASS){
    window.adminOk=true;
    if(err) err.style.display="none";
    var aa=el("adminArea"); if(aa) aa.style.display="block";
    el("adminPass").value="";
    drawAdmin();
  } else {
    if(err) err.style.display="block";
    el("adminPass").value="";
  }
}
function drawAdmin(){
  if(!window.adminOk) return;
  var aa=el("adminArea"); if(aa) aa.style.display="block";
  var pend = heroes.filter(function(h){ return h.status==="pending"; });
  var appr = heroes.filter(function(h){ return h.status==="approved"; });
  var rej = heroes.filter(function(h){ return h.status==="rejected"; });
  var st=el("adminStats"); if(st) st.innerHTML = "<b>Approved: "+appr.length+" | Pending: "+pend.length+" | Rejected: "+rej.length+" | Total Votes: "+heroes.reduce(function(a,h){return a+(h.votes||0);},0)+"</b>";
  var ph=""; if(pend.length===0) ph="<p style='color:green;'>No pending. All clear ✅</p>";
  for(var i=0;i<pend.length;i++){ var h=pend[i]; ph+='<div class="admin-box admin-pending"><b>⏳ '+h.name+'</b> - '+h.loc+' - '+h.cat+'<br><p style="margin:8px 0;">'+h.story+'</p>'+(h.photo?'<img src="'+h.photo+'" style="width:120px;height:80px;object-fit:cover;border-radius:8px;cursor:pointer;" onclick="openLightbox('+h.id+')"><br>':'')+'<p style="font-size:13px;color:#666;">From: '+(h.phone||h.by||"Guest")+'</p><br><button type="button" class="btn btn-vote" style="animation:none;" onclick="approveHero('+h.id+')">✅ APPROVE - Show On Website</button> <button type="button" class="btn btn-share" onclick="rejectHero('+h.id+')">❌ REJECT</button> <button type="button" class="small btn-share" onclick="delHero('+h.id+')">🗑 Delete</button></div>'; }
  var pl=el("pendingList"); if(pl) pl.innerHTML=ph;
  var ah=""; for(var i=0;i<appr.length;i++){ var h=appr[i]; ah+='<div class="admin-box"><b>'+h.name+'</b> - '+h.votes+' votes - '+h.loc+' <button type="button" class="small btn-share" onclick="delHero('+h.id+')">Delete</button> <button type="button" class="small btn-share" onclick="rejectHero('+h.id+')">Move to Rejected</button></div>'; }
  var al=el("approvedList"); if(al) al.innerHTML=ah||"<p>No approved yet</p>";
  var rh=""; for(var i=0;i<rej.length;i++){ var h=rej[i]; rh+='<div class="admin-box"><b>'+h.name+'</b> - '+h.loc+' <button type="button" class="small btn-vote" onclick="approveHero('+h.id+')">Approve Again</button> <button type="button" class="small btn-share" onclick="delHero('+h.id+')">Delete</button></div>'; }
  var rl=el("rejectedList"); if(rl) rl.innerHTML=rh||"<p>No rejected</p>";
  var tn=el("aTopNow"); if(tn) tn.innerHTML = ads["top"] ? "<p style='color:green;'>Now: "+ads["top"].t+"<br>🌐 "+(ads["top"].link||"No link")+"<br>🟢 WA: "+(ads["top"].wa||"Amos")+"</p>" : "<p>No Top Ad</p>";
  var mn=el("aMidNow"); if(mn) mn.innerHTML = ads["middle"] ? "<p style='color:green;'>Now: "+ads["middle"].t+"<br>🌐 "+(ads["middle"].link||"No link")+"<br>🟢 WA: "+(ads["middle"].wa||"Amos")+"</p>" : "<p>No Middle Ad</p>";
  var bn=el("aBotNow"); if(bn) bn.innerHTML = ads["bottom"] ? "<p style='color:green;'>Now: "+ads["bottom"].t+"<br>🌐 "+(ads["bottom"].link||"No link")+"<br>🟢 WA: "+(ads["bottom"].wa||"Amos")+"</p>" : "<p>No Bottom Ad</p>";
}
function saveAd(key){
  var tEl = key==="top"?el("aTopT"):key==="middle"?el("aMidT"):el("aBotT");
  var xEl = key==="top"?el("aTopX"):key==="middle"?el("aMidX"):el("aBotX");
  var linkEl = key==="top"?el("aTopLink"):key==="middle"?el("aMidLink"):el("aBotLink");
  var waEl = key==="top"?el("aTopWA"):key==="middle"?el("aMidWA"):el("aBotWA");
  var pEl = key==="top"?el("aTopP"):key==="middle"?el("aMidP"):el("aBotP");
  var t=tEl.value.trim(); var x=xEl.value.trim(); var link=linkEl.value.trim(); var waNum=waEl.value.trim();
  if(!t){ alert("Please type Ad Title"); return; }
  var old = ads[key] || {};
  function done(p){ ads[key]={t:t,x:x,link:link,wa:waNum,p:p||old.p||""}; saveAll(); draw(); drawAdmin(); alert("Ad Saved! "+t); }
  if(pEl.files[0]){ var r=new FileReader(); r.onload=function(e){ done(e.target.result); }; r.readAsDataURL(pEl.files[0]); } else done("");
}
function delAd(key){ delete ads[key]; saveAll(); draw(); drawAdmin(); alert("Ad deleted."); }
function resetVotes(){ if(!confirm("Reset ALL votes to 0?")) return; voted=[]; saveAll(); draw(); drawAdmin(); alert("All votes reset."); }
window.go=go; window.setCat=setCat; window.doVote=doVote; window.openHero=openHero; window.openLightbox=openLightbox; window.closeLightbox=closeLightbox; window.toggleZoom=toggleZoom; window.openAdLightbox=openAdLightbox; window.addHero=addHero; window.approveHero=approveHero; window.rejectHero=rejectHero; window.delHero=delHero; window.loginAdmin=loginAdmin; window.saveAd=saveAd; window.delAd=delAd; window.resetVotes=resetVotes; window.closePop=closePop;
document.addEventListener("keydown", function(e){ if(e.key==="Escape"){ closeLightbox(); closePop(); } });
try{ draw(); }catch(e){ console.log(e); }
