const CONFIG = {
  driveFileId: "1UCY2HKEGuT8ntU-4w0m_ZhCQTeWJPs80",
  clientEmail: "datasabe@database-490402.iam.gserviceaccount.com",
  adminUser: "admin_dewi",
  privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDUmMjmsxTWcmyC\nALQtKLjF2KBN1A3wbx6PwxwhGS9Lo9VmfUy+Py7xhbWwxItcSUt/HJg/UGXvHe7L\nuhwUEXvCOXJCTfGDUEm7AEtrJn2UYbo70gjkymrSkotTbANuL0rzTAJzjFq3IEST\nq2cQ6I40DQSUSKwLEhIW2y9IR+9+EQ9/3YUyNFINFx1femQNxE+vRFzxLr0oiN/p\nicP4mcpOfwVLqnn4q3ArsMKcSKtkgNjhzUYNUIKdx/JoBgx9iCC4t4FhKvUQ6Smj\nwQnJiixb39Ga8ATTqiUhQotuugO/tjNhb4+ILWZvjGkLKlP/x8AGrBsacCTU1S87\nH26Jeq+tAgMBAAECggEARjW093eB9LZyPlbUKivOJcy+WCWletd/vNOfORETrQPM\nyJ2t2BCOxMW3NMscCRzNmYuMfjBjkZ4NjGuItVn2yLRnFx2dmpPL3b2hqp/aDkRe\nGD5roH922tb5u1GrKlrlAkeCcb2TAfJeo3QSRCPBPtBjyELdyoQrxC+bxF+5aKTI\nfj9g/2PN1tDWB6i+TAS/g/TWqxAiKB0keAt3hnZ2C3cam6W4sLCRp4drSVSLrvax\n7WrR3iRAvQd0Vn2VZB/y15TnB3UKOPGDBBNKJ8yP09YogxXTpefEsNmFaG/rbOEf\nmLbCmTffVcB5iOmI9C0dOg0g1XW1JJSQPWD0wPkEgwKBgQDz/q7r4URRAIm2OHD2\nqUHhNBzyqEkTYH/bTuIUTwdjyoaLfs8swv7mHFg/cV6xLYOZp1DXayYJUDCxmYVo\nlNFvWyI2yrTFvK5Lk+rLUWSlR/jxqVsiTZgikubWNpe15r0zRXbroVaZA550VWDx\n5zh7dOHU3B3NU0u7G5cms6nUIwKBgQDfDp4CmCOBrW3jk9h3N/bv8T8rmOwJMfgu\nB5L/hSpU2GW39yNRiKsQCO8gdbLdUZ2WzUflA8f+vNlTe9feE6tF9HDfHS6fh6lP\n6VtQA+FhAqsoJqNcD1Xs50prDVYYQdJYwaFkmrDH1NWm3YEdkVc9VzIetQuGs826\nJVNlWliB7wKBgQDewzV8kexHcBBK13j7GkjVjTioqtAc6suQtJJgLE744ty32wzX\ Nyh1eodvVNg5Nu6hiEqcgmz1r8rlOt68PrJ/0lqIX8VvivYudlu1SRh0diNor1BP\nHzy4xBoQlUMphgJTHyaVtnVTuiQe3hxmfs3omSvdpSFoZpYLvALiCMIStQKBgQCb\nMNNU4L8LcTucc/fOcpyXMlUOIzZN63tNoy1uJBtgrrKOvR7QknLaFC0ze1A31Zn8\nGtUjjG7wWDoocGivdSXb5QdG5EnU6pEtLSG/2QNM+ItWwxMzcOQKkJ1hQAUfmWQd\nJpMAqPPIBNelYkV76ew1nF4dqT7cuGqxUVjlkmcz9wKBgFNoTVJd0q74F1UDWe9c\n4xSA+9HVaNkZmv083rT7Eo541Zi59YlULWc/TxIRtU4vZk/cNpuCLMvhreQLZrXb\n98NFWbbO7TVIEonjuJdYLyd3l+6l6NzNHznOH8oMQqSVJDukp6dWRZm57sj/BMac\nRdT/4DRIXtKqHIEK4awVztJz\n-----END PRIVATE KEY-----\n"
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cookie = request.headers.get("Cookie") || "";
    const username = (cookie.match(/user_session=([^;]+)/) || [])[1];

    if (url.pathname === "/api/data") {
      try {
        const token = await getAccessToken();
        const data = await getDriveFile(token);
        return new Response(data, { headers: { "Content-Type": "application/json" } });
      } catch (e) { return new Response("{}", { status: 500 }); }
    }

    if (url.pathname === "/logout") {
      return new Response("OK", { status: 302, headers: { "Location": "/", "Set-Cookie": "user_session=; Path=/; Max-Age=0" } });
    }

    if (request.method === "POST" && url.searchParams.has("login")) {
      const formData = await request.formData();
      const user = formData.get("username") || "Guest";
      return new Response("OK", { status: 302, headers: { "Location": "/", "Set-Cookie": `user_session=${user}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400` } });
    }

    if (!username) return new Response(renderLogin(), { headers: { "Content-Type": "text/html" } });

    if (request.method === "POST") {
      const token = await getAccessToken();
      const formData = await request.formData();
      const action = formData.get("action");
      let db = JSON.parse(await getDriveFile(token));

      if (action === "chat") {
        db.messages.push({ id: Date.now(), from: username, text: formData.get("message"), time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) });
        if (db.messages.length > 80) db.messages.shift();
      } else if (action === "deleteMsg" && username === CONFIG.adminUser) {
        db.messages = db.messages.filter(m => m.id != formData.get("id"));
      } else if (action === "addVideo" && username === CONFIG.adminUser) {
        if(!db.videoList) db.videoList = [];
        db.videoList.push({ id: Date.now(), title: formData.get("title"), url: formData.get("videoUrl") });
      } else if (action === "deleteVideo" && username === CONFIG.adminUser) {
        db.videoList = db.videoList.filter(v => v.id != formData.get("id"));
      } else if (action === "setVideo" && username === CONFIG.adminUser) {
        db.currentVideo = formData.get("videoUrl");
      }

      await updateDriveFile(token, JSON.stringify(db, null, 2));
      return new Response(JSON.stringify({ status: "success" }));
    }

    const token = await getAccessToken();
    const db = JSON.parse(await getDriveFile(token));
    return new Response(renderMainApp(username, db), { headers: { "Content-Type": "text/html" } });
  }
};

async function getAccessToken() {
  const pem = CONFIG.privateKey.replace(/\\n/g, '\n');
  const privateKey = await crypto.subtle.importKey('pkcs8', str2ab(atob(pem.split('-----')[2].replace(/\s/g, ''))), { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const now = Math.floor(Date.now() / 1000);
  const payload = btoa(JSON.stringify({ iss: CONFIG.clientEmail, scope: 'https://www.googleapis.com/auth/drive', aud: 'https://oauth2.googleapis.com/token', exp: now + 3600, iat: now }));
  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', privateKey, new TextEncoder().encode(`${header}.${payload}`));
  const jwt = `${header}.${payload}.${btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/\//g, '_').replace(/\+/g, '-').replace(/=/g, '')}`;
  const res = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}` });
  const data = await res.json();
  return data.access_token;
}
async function getDriveFile(token) { const res = await fetch(`https://www.googleapis.com/drive/v3/files/${CONFIG.driveFileId}?alt=media`, { headers: { 'Authorization': `Bearer ${token}` } }); return await res.text(); }
async function updateDriveFile(token, content) { await fetch(`https://www.googleapis.com/upload/drive/v3/files/${CONFIG.driveFileId}?uploadType=media`, { method: 'PATCH', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: content }); }
function str2ab(str) { const buf = new ArrayBuffer(str.length); const bufView = new Uint8Array(buf); for (let i = 0; i < str.length; i++) { bufView[i] = str.charCodeAt(i); } return buf; }

function renderLogin() {
  return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"><script src="https://cdn.tailwindcss.com"></script></head>
  <body class="bg-[#0b0f1a] flex items-center justify-center min-h-screen p-6 font-sans text-white text-center">
    <div class="bg-slate-900/80 backdrop-blur-xl p-10 rounded-[3rem] border border-slate-800 shadow-2xl w-full max-w-sm">
      <h1 class="text-4xl font-black text-blue-500 italic uppercase mb-8 tracking-tighter">The Hub</h1>
      <form method="POST" action="?login">
        <input name="username" placeholder="Enter Nickname..." class="w-full p-4 rounded-2xl bg-black border border-slate-800 mb-4 text-center outline-none focus:border-blue-600">
        <button class="w-full bg-blue-600 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-500 transition-all">Login</button>
      </form>
    </div></body></html>`;
}

function renderMainApp(currentUser, db) {
  const isAdmin = currentUser === CONFIG.adminUser;
  return `<!DOCTYPE html><html><head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://www.youtube.com/iframe_api"></script>
  <style>
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
    .vid-container { position: relative; padding-bottom: 56.25%; height: 0; background: #000; border-radius: 1.5rem; overflow: hidden; }
    .vid-container iframe, .vid-container video { position: absolute; top:0; left:0; width:100%; height:100%; border:0; }
    
    #sidebar { transition: transform 0.3s ease-in-out; z-index: 100; }
    @media (max-width: 1024px) {
      #sidebar { position: fixed; left: 0; top: 0; bottom: 0; width: 85%; transform: translateX(-100%); background: #0b0f1a; border-right: 1px solid #1e293b; }
      #sidebar.open { transform: translateX(0); }
    }
    #overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 90; backdrop-filter: blur(4px); }
    #overlay.open { display: block; }
    .player-hidden { display: none !important; }

    /* Fix Input Melekat di Bawah */
    .input-container {
      padding-bottom: calc(1.5rem + env(safe-area-inset-bottom));
    }
  </style></head>
  <body class="bg-[#0b0f1a] text-slate-300 h-screen overflow-hidden font-sans flex flex-col">
    <div id="overlay" onclick="toggleSidebar()"></div>
    
    <div class="flex items-center justify-between p-4 border-b border-slate-800 bg-[#0b0f1a] relative z-[70] shrink-0">
      <div class="flex items-center gap-3">
        <button onclick="toggleSidebar()" class="p-2 bg-slate-900 rounded-xl border border-slate-800 lg:hidden hover:bg-slate-800 transition-all">
          <svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </button>
        <h1 class="text-xl font-black text-blue-500 italic tracking-tighter uppercase">The Hub</h1>
      </div>
      <div class="text-[9px] font-black uppercase text-slate-400 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700">${currentUser}</div>
    </div>

    <div class="max-w-[1700px] mx-auto w-full p-4 lg:p-6 grid lg:grid-cols-12 gap-6 flex-1 min-h-0 overflow-hidden">
      
      <div id="sidebar" class="lg:col-span-4 space-y-4 flex flex-col h-full overflow-hidden p-6 lg:p-0">
        <div class="bg-slate-900/50 p-6 rounded-[2.5rem] border border-slate-800 flex flex-col shrink-0">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-[10px] font-black uppercase text-blue-500 italic tracking-widest">Gallery</h2>
            <button onclick="togglePlayerUI()" id="btnToggle" class="text-[8px] bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded-full font-black text-slate-400 uppercase">Hide Player</button>
          </div>
          <div id="videoList" class="grid grid-cols-2 gap-3 max-h-[180px] overflow-y-auto mb-4 pr-2"></div>
          ${isAdmin ? `
            <div class="pt-4 border-t border-slate-800 space-y-2 text-[10px]">
              <div class="grid grid-cols-2 gap-2">
                <input id="newVidTitle" placeholder="Title..." class="bg-black p-3 rounded-xl border border-slate-800 outline-none">
                <input id="newVidUrl" placeholder="URL..." class="bg-black p-3 rounded-xl border border-slate-800 outline-none">
              </div>
              <button onclick="addNewVideo()" class="w-full bg-blue-600 font-black py-3 rounded-xl uppercase hover:bg-blue-500 transition-all">Add Video</button>
            </div>
          ` : ''}
        </div>
        <div class="bg-slate-900/50 p-6 rounded-[2.5rem] border border-slate-800 flex-1 flex flex-col overflow-hidden">
           <h3 class="text-[9px] font-black uppercase text-slate-500 mb-3 tracking-widest italic">Presence</h3>
           <div id="userList" class="flex-1 overflow-y-auto pr-2 space-y-1"></div>
           <a href="/logout" class="mt-4 text-center text-[8px] font-black text-slate-600 hover:text-white uppercase transition-all">Logout Account</a>
        </div>
      </div>

      <div class="lg:col-span-8 flex flex-col h-full min-h-0 overflow-hidden">
        
        <div id="playerSection" class="bg-slate-900/80 rounded-[2.5rem] border border-slate-800 shadow-2xl overflow-hidden shrink-0 mb-4">
          <div class="vid-container" id="playerTarget">
            <div id="ytPlayer"></div>
            <video id="nativePlayer" crossorigin="anonymous" playsinline class="hidden"></video>
          </div>
          <div class="p-4 bg-slate-900 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800 text-[10px] font-black uppercase">
            <div class="flex items-center gap-4">
              <button onclick="togglePlay()" class="bg-blue-600 p-3 rounded-full hover:bg-blue-500"><svg id="playIcon" class="w-5 h-5 fill-white" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></button>
              <div class="flex gap-2">
                <button onclick="skip(-10)" class="bg-slate-800 px-4 py-2 rounded-xl hover:bg-slate-700">-10s</button>
                <button onclick="skip(10)" class="bg-slate-800 px-4 py-2 rounded-xl hover:bg-slate-700">+10s</button>
              </div>
            </div>
            <div class="flex items-center gap-3 flex-1 max-w-[150px]">
              <input type="range" min="0" max="100" value="100" oninput="setVolume(this.value)" class="w-full accent-blue-600 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer">
            </div>
          </div>
        </div>

        <div class="bg-slate-900/40 rounded-[2.5rem] border border-slate-800 flex flex-col flex-1 min-h-0 backdrop-blur-md overflow-hidden">
           <div id="chatBox" class="flex-1 p-6 overflow-y-auto scroll-smooth flex flex-col gap-4"></div>
           <div class="input-container p-4 bg-black/40 border-t border-slate-800 shrink-0">
             <form id="chatForm" class="flex gap-3">
               <input name="msg" autocomplete="off" placeholder="Write something..." class="flex-1 bg-slate-950 p-4 rounded-2xl border border-slate-800 outline-none focus:border-blue-600 text-sm">
               <button type="submit" class="bg-blue-600 px-8 rounded-2xl font-black text-[10px] uppercase hover:bg-blue-500">Send</button>
             </form>
           </div>
        </div>

      </div>
    </div>

    <script>
      let ytPlayer, activeType = 'none', isPlayerVisible = true;
      const nativePlayer = document.getElementById('nativePlayer');
      let activeVid = "", msgLen = -1, playlistLen = -1;

      function toggleSidebar() {
        const sb = document.getElementById('sidebar');
        const ov = document.getElementById('overlay');
        sb.classList.toggle('open');
        ov.classList.toggle('open');
      }

      function togglePlayerUI() {
        isPlayerVisible = !isPlayerVisible;
        const section = document.getElementById('playerSection');
        if (!isPlayerVisible) section.classList.add('player-hidden');
        else section.classList.remove('player-hidden');
      }

      function onYouTubeIframeAPIReady() {
        ytPlayer = new YT.Player('ytPlayer', {
          height: '100%', width: '100%',
          playerVars: { 'controls': 0, 'disablekb': 1, 'rel': 0, 'modestbranding': 1, 'origin': location.origin },
          events: { 'onStateChange': onPlayerStateChange }
        });
      }

      function onPlayerStateChange(event) {
        const icon = document.getElementById('playIcon');
        if (event.data == YT.PlayerState.PLAYING) icon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
        else icon.innerHTML = '<path d="M8 5v14l11-7z"/>';
      }

      function togglePlay() {
        if (activeType === 'yt') {
          const state = ytPlayer.getPlayerState();
          state === 1 ? ytPlayer.pauseVideo() : ytPlayer.playVideo();
        } else {
          nativePlayer.paused ? nativePlayer.play() : nativePlayer.pause();
        }
      }

      function skip(sec) {
        if (activeType === 'yt') ytPlayer.seekTo(ytPlayer.getCurrentTime() + sec, true);
        else nativePlayer.currentTime += sec;
      }

      function setVolume(val) {
        if (activeType === 'yt') ytPlayer.setVolume(val);
        else nativePlayer.volume = val / 100;
      }

      async function update() {
        try {
          const res = await fetch('/api/data');
          const db = await res.json();
          if (db.currentVideo !== activeVid) {
            activeVid = db.currentVideo;
            const ytMatch = activeVid.match(/(?:youtube\\.com\\/watch\\?v=|youtu\\.be\\/)([a-zA-Z0-9_-]{11})/);
            if (ytMatch) {
              activeType = 'yt'; nativePlayer.classList.add('hidden'); document.getElementById('ytPlayer').classList.remove('hidden');
              if(ytPlayer && ytPlayer.loadVideoById) ytPlayer.loadVideoById(ytMatch[1]);
            } else {
              activeType = 'native'; document.getElementById('ytPlayer').classList.add('hidden'); nativePlayer.classList.remove('hidden');
              nativePlayer.src = activeVid; nativePlayer.load(); nativePlayer.play().catch(()=>{});
            }
          }
          if(db.videoList && db.videoList.length !== playlistLen) {
            document.getElementById('videoList').innerHTML = db.videoList.map(v => \`
              <div class="relative aspect-video bg-black/60 rounded-xl border border-slate-800 flex flex-col items-center justify-center p-2 text-center hover:border-blue-500 transition-all cursor-pointer group" onclick="syncVid('\${v.url}')">
                <span class="text-[8px] font-black uppercase truncate w-full mb-1 text-slate-400">\${v.title}</span>
                ${isAdmin ? `<button onclick="event.stopPropagation(); delVid('\${v.id}')" class="text-red-500 text-[10px] font-bold">×</button>` : ''}
              </div>\`).join('');
            playlistLen = db.videoList.length;
          }
          document.getElementById('userList').innerHTML = (db.users || []).map(u => \`
            <div class="flex items-center gap-2 text-[10px] uppercase font-black px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 shadow-sm">
              <div class="w-1.5 h-1.5 rounded-full \${u === "${currentUser}" ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}"></div>
              <span>\${u}</span>
            </div>\`).join('');
          if (db.messages.length !== msgLen) {
            const chatBox = document.getElementById('chatBox');
            const shouldScroll = chatBox.scrollTop + chatBox.clientHeight >= chatBox.scrollHeight - 50;
            chatBox.innerHTML = db.messages.map(m => \`
              <div class="group flex flex-col \${m.from === "${currentUser}" ? 'items-end' : 'items-start'}">
                <div class="flex items-center gap-2 mb-1">
                  ${isAdmin ? `<button onclick="delMsg('\${m.id}')" class="opacity-0 group-hover:opacity-100 text-red-500 text-[10px] font-bold transition-all">Del</button>` : ''}
                  <span class="text-[8px] font-black text-slate-600 uppercase tracking-widest">\${m.from} • \${m.time}</span>
                </div>
                <div class="max-w-[85%] px-4 py-2.5 rounded-2xl text-sm shadow-xl \${m.from === "${currentUser}" ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'} break-words">\${m.text}</div>
              </div>\`).join('');
            if (shouldScroll || msgLen === -1) chatBox.scrollTop = chatBox.scrollHeight;
            msgLen = db.messages.length;
          }
        } catch(e) {}
      }
      async function handleAction(a, d = {}) {
        const fd = new FormData(); fd.append('action', a);
        for(let k in d) fd.append(k, d[k]);
        await fetch('/', { method: 'POST', body: fd }); update();
      }
      function addNewVideo() {
        const t = document.getElementById('newVidTitle').value, u = document.getElementById('newVidUrl').value;
        if(t && u) { handleAction('addVideo', { title: t, videoUrl: u }); document.getElementById('newVidTitle').value=''; document.getElementById('newVidUrl').value=''; }
      }
      function delVid(id) { if(confirm('Hapus video?')) handleAction('deleteVideo', { id }); }
      function delMsg(id) { handleAction('deleteMsg', { id }); }
      function syncVid(url) { handleAction('setVideo', { videoUrl: url }); if(window.innerWidth < 1024) toggleSidebar(); }
      document.getElementById('chatForm').onsubmit = (e) => {
        e.preventDefault(); const i = e.target.msg;
        if(i.value.trim()) { handleAction('chat', { message: i.value }); i.value = ''; }
      };
      setInterval(update, 5000); update();
    </script>
  </body></html>`;
                          }
