/* ========================================
   BurnPoint Fitness — 预约小程序 Demo JS v2
   干净版：三Tab + 预约向导，无登录/商家端
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {

  const tabs       = [document.getElementById('tab-home'), document.getElementById('tab-booking'), document.getElementById('tab-profile'),
                       document.getElementById('tab-mdash'), document.getElementById('tab-msched'), document.getElementById('tab-mmanage')];
  const tabItems   = document.querySelectorAll('#tabBar .tab-item');
  const tabLabels  = document.querySelectorAll('#tabBar .tab-item span');
  const headerTitle = document.getElementById('headerTitle');
  const mainContent = document.getElementById('mainContent');
  const titles     = ['燃点健身', '预约训练', '我的'];

  // Booking
  const stepItems  = document.querySelectorAll('.step-item');
  const stepPanels = document.querySelectorAll('.booking-step');
  const svcItems   = document.querySelectorAll('.svc-select-item');
  const bookNext2  = document.getElementById('bookNext2');
  const bookBack1  = document.getElementById('bookBack1');
  const calGrid    = document.getElementById('calendarGrid');
  const calMonth   = document.getElementById('calendarMonthLabel');
  const bookNext3  = document.getElementById('bookNext3');
  const bookBack2  = document.getElementById('bookBack2');
  const slotMorn   = document.getElementById('slotMorning');
  const slotAfter  = document.getElementById('slotAfternoon');
  const slotEven   = document.getElementById('slotEvening');
  const dateHint   = document.getElementById('bookDateHint');
  const bookNext4  = document.getElementById('bookNext4');
  const bookBack3  = document.getElementById('bookBack3');
  const inpName    = document.getElementById('inputName');
  const inpPhone   = document.getElementById('inputPhone');
  const inpCode    = document.getElementById('inputCode');
  const inpNote    = document.getElementById('inputNote');
  const vfyBtn     = document.getElementById('verifyBtn');
  const submitBtn  = document.getElementById('submitBooking');
  const sumSvc     = document.getElementById('sumSvc');
  const sumDate    = document.getElementById('sumDate');
  const sumTime    = document.getElementById('sumTime');
  const sumPrice   = document.getElementById('sumPrice');
  const modal      = document.getElementById('successModal');
  const closeModal = document.getElementById('closeModal');
  const modalId    = document.getElementById('modalBookingId');

  // Login
  const unloggedView = document.getElementById('unloggedView');
  const loggedView   = document.getElementById('loggedView');
  const loginWechat  = document.getElementById('loginWechat');
  const loginPhone   = document.getElementById('loginPhone');
  const logoutBtn    = document.getElementById('logoutBtn');
  const profileName  = document.getElementById('profileName');
  const profilePhone = document.getElementById('profilePhone');

  const state = {
    tabIdx: 0, merchant: false,
    step: 1, svc: null, svcLabel: '', svcPrice: 0,
    date: null, dateLabel: '', time: null, pickedSlot: null,
    vfyCountdown: 0, vfyTimer: null,
    userBookings: [],
  };
  const prices = { 'personal-60':380,'personal-90':460,'group-flow':128,'group-hiit':128,'group-spin':128,'boxing':198,'yoga-60':158,'yoga-90':218 };
  // Maps booking service IDs → schedule course IDs
  const bookingSchedMap = {
    'personal-60': 'pt-60', 'personal-90': 'pt-90',
    'group-flow': 'yoga', 'group-hiit': 'hiit', 'group-spin': 'spin',
    'boxing': 'boxing', 'yoga-60': 'yoga', 'yoga-90': 'yoga'
  };

  // ===== SHARED DATA =====
  const courseMeta = {
    'pt-60':   { label:'私教一对一', coach:'Alex',   type:'pt',    cap:1,  group:'pt' },
    'pt-90':   { label:'私教 Pro',   coach:'Alex',   type:'pt',    cap:1,  group:'pt' },
    'yoga':    { label:'流瑜伽',     coach:'Mia',    type:'yoga',  cap:8,  group:'yoga' },
    'hiit':    { label:'HIIT',       coach:'Sofia',  type:'hiit',  cap:10, group:'group' },
    'spin':    { label:'动感单车',   coach:'Jay',    type:'spin',  cap:10, group:'group' },
    'boxing':  { label:'拳击燃脂',   coach:'Jay',    type:'box',   cap:4,  group:'boxing' }
  };
  function fmtDate(d) {
    const y = d.getFullYear(), m = String(d.getMonth()+1).padStart(2,'0'), day = String(d.getDate()).padStart(2,'0');
    return `${y}-${m}-${day}`;
  }
  function isSlotFull(slot) {
    const parts = slot.count.split('/');
    return parseInt(parts[0]) >= parseInt(parts[1]);
  }

  let scheduleData = {
    '2026-06-01': [
      { id:'s1', time:'09:00', courseId:'boxing', count:'1/4' },
      { id:'s2', time:'14:00', courseId:'yoga',   count:'3/8' },
      { id:'s3', time:'19:00', courseId:'hiit',   count:'8/10' }
    ],
    '2026-06-02': [
      { id:'s4', time:'10:30', courseId:'pt-60',  count:'1/1' },
      { id:'s5', time:'16:00', courseId:'yoga',   count:'4/8' },
      { id:'s6', time:'19:00', courseId:'spin',   count:'7/10' }
    ],
    '2026-06-03': [
      { id:'s7', time:'09:00', courseId:'pt-90',  count:'1/1' },
      { id:'s8', time:'14:00', courseId:'hiit',   count:'5/10' },
      { id:'s9', time:'18:00', courseId:'boxing', count:'2/4' }
    ],
    '2026-06-04': [
      { id:'s10', time:'10:30', courseId:'yoga',  count:'6/8' },
      { id:'s11', time:'16:00', courseId:'pt-60', count:'1/1' },
      { id:'s12', time:'19:00', courseId:'hiit',  count:'9/10' }
    ],
    '2026-06-05': [
      { id:'s13', time:'09:00', courseId:'spin',  count:'4/10' },
      { id:'s14', time:'14:00', courseId:'boxing',count:'1/4' },
      { id:'s15', time:'19:00', courseId:'yoga',  count:'8/8' }
    ],
    '2026-06-06': [
      { id:'s16', time:'10:30', courseId:'hiit',  count:'7/10' },
      { id:'s17', time:'15:00', courseId:'yoga',  count:'5/8' }
    ],
    '2026-06-07': [
      { id:'s18', time:'09:00', courseId:'pt-60',  count:'1/1' },
      { id:'s19', time:'14:00', courseId:'boxing', count:'2/4' },
      { id:'s20', time:'19:00', courseId:'yoga',   count:'5/8' }
    ],
    '2026-06-08': [
      { id:'s21', time:'10:30', courseId:'yoga',   count:'2/8' },
      { id:'s22', time:'16:00', courseId:'hiit',   count:'6/10' },
      { id:'s23', time:'19:00', courseId:'spin',   count:'4/10' }
    ],
    '2026-06-09': [
      { id:'s24', time:'09:00', courseId:'pt-90',  count:'0/1' },
      { id:'s25', time:'14:00', courseId:'yoga',   count:'3/8' },
      { id:'s26', time:'18:00', courseId:'boxing', count:'1/4' },
      { id:'s27', time:'19:00', courseId:'hiit',   count:'7/10' }
    ],
    '2026-06-10': [
      { id:'s28', time:'10:30', courseId:'pt-60',  count:'0/1' },
      { id:'s29', time:'15:00', courseId:'yoga',   count:'4/8' },
      { id:'s30', time:'19:00', courseId:'spin',   count:'9/10' }
    ],
    '2026-06-11': [
      { id:'s31', time:'09:00', courseId:'hiit',   count:'5/10' },
      { id:'s32', time:'14:00', courseId:'boxing', count:'3/4' },
      { id:'s33', time:'16:00', courseId:'yoga',   count:'6/8' },
      { id:'s34', time:'19:00', courseId:'pt-60',  count:'0/1' }
    ],
    '2026-06-12': [
      { id:'s35', time:'10:30', courseId:'spin',   count:'5/10' },
      { id:'s36', time:'14:00', courseId:'yoga',   count:'7/8' },
      { id:'s37', time:'18:00', courseId:'hiit',   count:'8/10' }
    ],
    '2026-06-13': [
      { id:'s38', time:'09:00', courseId:'yoga',   count:'3/8' },
      { id:'s39', time:'15:00', courseId:'pt-90',  count:'1/1' },
      { id:'s40', time:'19:00', courseId:'boxing', count:'0/4' }
    ]
  };

  // ===== TAB SWITCHING (with direction-aware animation) =====
  function switchTab(i, dir) {
    const old = state.tabIdx;
    state.tabIdx = i;

    // Animate out old tab
    const oldEl = tabs[old];
    if (oldEl && old !== i) {
      oldEl.style.animation = 'none';
      oldEl.offsetHeight; // force reflow
      oldEl.style.animation = (dir > 0 ? 'tabSlideOutL' : 'tabSlideOutR') + ' 0.15s cubic-bezier(0.55,0.06,0.68,0.19) forwards';
    }

    // Show new tab after brief delay
    setTimeout(() => {
      // Only toggle display for the 3 active tabs (0-2); ignore stale refs at 3+
      for (let j = 0; j < 3; j++) {
        const t = tabs[j];
        t.style.display = (j === i) ? 'block' : 'none';
        if (j !== i) { t.style.animation = ''; t.classList.remove('active'); }
      }
      // Also ensure old slots 3-5 stay hidden (stale refs from initial array)
      for (let j = 3; j < tabs.length; j++) {
        if (tabs[j]) tabs[j].style.display = 'none';
      }
      tabs[i].classList.add('active');
      tabs[i].style.animation = 'tabSlideIn 0.28s cubic-bezier(0.25,0.46,0.45,0.94)';
    }, 80);

    // Update tab bar
    const m = state.merchant;
    tabItems.forEach((el, j) => {
      el.classList.toggle('active', j === i);
      tabLabels[j].textContent = m ? ['数据','排期','管理'][j] : ['首页','预约','我的'][j];
    });
    headerTitle.textContent = m ? ['数据中心','排期管理','商家管理'][i] : ['燃点健身','预约训练','我的'][i];
    mainContent.scrollTop = 0;
  }

  tabItems.forEach((el, i) => el.addEventListener('click', function() {
    switchTab(i, i > state.tabIdx ? 1 : -1);
  }));
  document.querySelectorAll('[data-nav="booking"]').forEach(el => el.addEventListener('click', () => switchTab(1)));

  // ===== BOOKING WIZARD =====
  function goStep(n) {
    state.step = n;
    stepItems.forEach(el => {
      const s = +el.dataset.step;
      el.classList.remove('active','done');
      if (s === n) el.classList.add('active');
      if (s < n) el.classList.add('done');
    });
    stepPanels.forEach(el => { el.style.display = (+el.dataset.step === n) ? 'block' : 'none'; el.classList.toggle('active', +el.dataset.step === n); });
    mainContent.scrollTop = mainContent.scrollHeight;
  }

  svcItems.forEach(el => {
    el.addEventListener('click', () => {
      svcItems.forEach(e => e.classList.remove('selected'));
      el.classList.add('selected');
      state.svc = el.dataset.service;
      state.svcLabel = el.querySelector('h5').textContent;
      state.svcPrice = prices[el.dataset.service] || 0;
      bookNext2.disabled = false;
    });
  });
  bookNext2.addEventListener('click', () => { if (state.svc) { buildCal(); goStep(2); } });
  bookBack1.addEventListener('click', () => goStep(1));

  function buildCal() {
    state.date = null; state.dateLabel = ''; bookNext3.disabled = true;
    const now = new Date();
    const tDate = now.getDate(), y = now.getFullYear(), m = now.getMonth()+1;
    const wk = ['日','一','二','三','四','五','六'];
    calMonth.textContent = y + ' 年 ' + m + ' 月';
    const days = [];
    const schedId = bookingSchedMap[state.svc] || state.svc;
    const metaLookup = courseMeta || {};
    for (let i=0; i<7; i++) {
      const d = new Date(now); d.setDate(tDate+i);
      const key = fmtDate(d);
      const dow = d.getDay();
      // Count matching scheduled slots for this course type
      let matchCount = 0;
      let allFull = false;
      const daySlots = scheduleData[key] || [];
      if (schedId && metaLookup[schedId]) {
        const matched = daySlots.filter(s => s.courseId === schedId);
        matchCount = matched.length;
        allFull = matchCount > 0 && matched.every(s => isSlotFull(s));
      }
      const hasMatch = matchCount > 0;
      days.push({key, dn:d.getDate(), dow, wk:wk[dow], matchCount, full: allFull, hasMatch, today:i===0});
    }
    calGrid.innerHTML = '';
    const hR = document.createElement('div'); hR.className = 'cal-header-row';
    days.forEach(d => { const c = document.createElement('div'); c.className = 'cal-header-cell'; c.textContent = d.wk; hR.appendChild(c); });
    calGrid.appendChild(hR);
    const dR = document.createElement('div'); dR.className = 'cal-day-row';
    days.forEach(d => {
      const c = document.createElement('div'); c.className = 'cal-day-cell'; c.dataset.date = d.key;
      if (!d.hasMatch) {
        c.classList.add('cal-disabled');
        c.innerHTML = '<div class="cal-date">'+d.dn+'</div><div class="cal-avail" style="color:#CCC;">无课</div>';
      } else if (d.full) {
        c.classList.add('cal-disabled');
        c.innerHTML = '<div class="cal-date">'+d.dn+'</div><div class="cal-avail" style="color:#E74C3C;">已满</div>';
      } else {
        if (d.today) c.classList.add('cal-today');
        c.innerHTML = '<div class="cal-date">'+d.dn+'</div><div class="cal-avail">'+d.matchCount+'节可约</div>';
        c.addEventListener('click', () => {
          if (c.classList.contains('cal-disabled')) return;
          dR.querySelectorAll('.cal-day-cell').forEach(x => x.classList.remove('cal-selected'));
          c.classList.add('cal-selected');
          state.date = d.key; state.dateLabel = y+'年'+m+'月'+d.dn+'日 星期'+d.wk;
          bookNext3.disabled = false;
        });
      }
      dR.appendChild(c);
    });
    calGrid.appendChild(dR);
  }
  bookNext3.addEventListener('click', () => { if (state.date) { buildSlots(); goStep(3); } });
  bookBack2.addEventListener('click', () => goStep(2));

  function buildSlots() {
    state.time = null; state.pickedSlot = null; bookNext4.disabled = true;
    dateHint.textContent = '已选：' + state.dateLabel;
    const schedId = bookingSchedMap[state.svc] || state.svc;
    const daySlots = scheduleData[state.date] || [];
    const matched = daySlots.filter(s => s.courseId === schedId);

    function fillSlot(ct, slot) {
      ct.innerHTML = '';
      const meta = courseMeta[schedId];
      if (!meta || matched.length === 0) {
        ct.innerHTML = '<p style="text-align:center;font-size:0.78rem;color:var(--text-3);padding:18px 0;">该日期暂无此类型课程</p>';
        return;
      }
      matched.forEach(s => {
        const full = isSlotFull(s);
        const b = document.createElement('div');
        b.className = 'ts-btn ts-scheduled';
        if (full) b.classList.add('ts-disabled');
        b.innerHTML = `<div class="ts-time">${s.time}</div><div class="ts-sub">${meta.coach} · ${s.count}人</div><div class="ts-avail">${full?'已满':'剩余'+(meta.cap-parseInt(s.count))+'位'}</div>`;
        if (!full) {
          b.addEventListener('click', () => {
            if (b.classList.contains('ts-disabled')) return;
            document.querySelectorAll('.ts-btn').forEach(x => x.classList.remove('ts-picked'));
            b.classList.add('ts-picked');
            state.time = s.time;
            state.pickedSlot = s;
            bookNext4.disabled = false;
          });
        }
        ct.appendChild(b);
      });
    }
    fillSlot(slotMorn, matched[0]);
  }
  bookNext4.addEventListener('click', () => {
    if (!state.time || !state.pickedSlot) return;
    const meta = courseMeta[bookingSchedMap[state.svc]] || {};
    sumSvc.textContent = state.svcLabel;
    sumDate.textContent = state.dateLabel;
    sumTime.textContent = state.time + ' · ' + (meta.coach || '');
    sumPrice.textContent = '¥' + state.svcPrice;
    goStep(4);
  });
  bookBack3.addEventListener('click', () => goStep(3));

  function sErr(el) { el.classList.add('err'); }
  function hErr(el) { el.classList.remove('err'); }
  function vName(s) { const ok = inpName.value.trim().length>0; if (s&&!ok) sErr(inpName); else if (ok) hErr(inpName); return ok; }
  function vPhone(s) { const ok = /^1[3-9]\d{9}$/.test(inpPhone.value.trim()); if (s&&!ok) sErr(inpPhone); else if (ok) hErr(inpPhone); return ok; }
  function vCode(s) { const ok = /^\d{4}$/.test(inpCode.value.trim()); if (s&&!ok) sErr(inpCode); else if (ok) hErr(inpCode); return ok; }
  inpName.addEventListener('input', () => { if (state.step===4) vName(false); });
  inpPhone.addEventListener('input', () => { if (state.step===4) vPhone(false); });
  inpCode.addEventListener('input', () => { if (state.step===4) vCode(false); });

  vfyBtn.addEventListener('click', () => {
    if (state.vfyCountdown>0) return; if (!vPhone(true)) return;
    state.vfyCountdown=60; refVfy();
    state.vfyTimer=setInterval(()=>{state.vfyCountdown--; refVfy(); if(state.vfyCountdown<=0){clearInterval(state.vfyTimer);state.vfyTimer=null;}},1000);
  });
  function refVfy() {
    if (state.vfyCountdown>0) { vfyBtn.textContent=state.vfyCountdown+'s 后重试'; vfyBtn.classList.add('counting'); vfyBtn.disabled=true; }
    else { vfyBtn.textContent='获取验证码'; vfyBtn.classList.remove('counting'); vfyBtn.disabled=false; }
  }
  submitBtn.addEventListener('click', () => {
    if (!vName(true)|!vPhone(true)|!vCode(true)) return;
    const bookingId = 'BP-' + Date.now().toString(36).toUpperCase().slice(-6);
    modalId.textContent = bookingId;
    // Store booking record
    const meta = courseMeta[bookingSchedMap[state.svc]] || {};
    state.userBookings.push({
      id: bookingId,
      service: state.svcLabel,
      date: state.date,
      dateLabel: state.dateLabel,
      time: state.time,
      coach: meta.coach || '',
      price: state.svcPrice,
      status: 'upcoming',
      createdAt: new Date().toISOString()
    });
    // Update schedule count
    if (state.pickedSlot && scheduleData[state.date]) {
      const slot = scheduleData[state.date].find(s => s.id === state.pickedSlot.id);
      if (slot) {
        const parts = slot.count.split('/');
        const current = parseInt(parts[0]);
        slot.count = (current + 1) + '/' + parts[1];
        renderSchedule();
      }
    }
    modal.classList.add('active');
  });
  closeModal.addEventListener('click', reset);
  modal.addEventListener('click', e => { if (e.target===modal) reset(); });
  function reset() {
    modal.classList.remove('active');
    state.step=1; state.svc=null; state.svcLabel=''; state.svcPrice=0; state.date=null; state.dateLabel=''; state.time=null; state.pickedSlot=null;
    state.vfyCountdown=0; if(state.vfyTimer){clearInterval(state.vfyTimer);state.vfyTimer=null;}
    svcItems.forEach(e=>e.classList.remove('selected'));
    bookNext2.disabled=true; bookNext3.disabled=true; bookNext4.disabled=true;
    inpName.value=''; inpPhone.value=''; inpCode.value=''; inpNote.value='';
    vfyBtn.textContent='获取验证码'; vfyBtn.classList.remove('counting'); vfyBtn.disabled=false;
    [inpName,inpPhone,inpCode].forEach(hErr);
    goStep(1); mainContent.scrollTop=0;
    // Re-render schedule and profile
    renderSchedule();
    renderProfileBookings();
  }

  // ===== LOGIN / LOGOUT =====
  function doLogin(method) {
    if (method === 'wechat') { profileName.textContent = '微信用户'; profilePhone.textContent = '138****8888'; }
    else { profileName.textContent = '手机用户'; profilePhone.textContent = '139****9999'; }
    unloggedView.style.display = 'none';
    loggedView.style.display = 'block';
    renderProfileBookings();
  }
  loginWechat.addEventListener('click', () => doLogin('wechat'));
  loginPhone.addEventListener('click', () => doLogin('phone'));
  logoutBtn.addEventListener('click', () => {
    unloggedView.style.display = 'block';
    loggedView.style.display = 'none';
  });

  // ===== MERCHANT LOGIN (Modal) =====
  const merchantModal      = document.getElementById('merchantModal');
  const merchantModalClose = document.getElementById('merchantModalClose');
  const showMerchantLogin  = document.getElementById('showMerchantLogin');
  const merchantUser       = document.getElementById('merchantUser');
  const merchantPass       = document.getElementById('merchantPass');
  const merchantLoginBtn   = document.getElementById('merchantLoginBtn');
  const merchantError      = document.getElementById('merchantError');
  const merchantLogoutBtn  = document.getElementById('merchantLogoutBtn');

  showMerchantLogin.addEventListener('click', () => {
    merchantModal.classList.add('active');
    merchantUser.value = '';
    merchantPass.value = '';
    merchantError.classList.remove('show');
  });

  merchantModalClose.addEventListener('click', () => {
    merchantModal.classList.remove('active');
  });

  merchantModal.addEventListener('click', e => {
    if (e.target === merchantModal) merchantModal.classList.remove('active');
  });

  merchantLoginBtn.addEventListener('click', () => {
    if (merchantUser.value.trim() !== 'admin' || merchantPass.value.trim() !== '123456') {
      merchantError.classList.add('show'); return;
    }
    merchantError.classList.remove('show');
    merchantModal.classList.remove('active');
    // Hide ALL user tabs explicitly before swapping — prevents ghost content
    document.getElementById('tab-home').style.display = 'none';
    document.getElementById('tab-booking').style.display = 'none';
    document.getElementById('tab-profile').style.display = 'none';
    document.getElementById('tab-home').classList.remove('active');
    document.getElementById('tab-booking').classList.remove('active');
    document.getElementById('tab-profile').classList.remove('active');
    // Switch to merchant mode
    state.merchant = true;
    unloggedView.style.display = 'none';
    loggedView.style.display = 'none';
    // Reset merchant form
    merchantUser.value = ''; merchantPass.value = '';
    // Switch first 3 tabs to merchant tabs — nullify stale refs at 3-5
    tabs[0] = document.getElementById('tab-mdash');
    tabs[1] = document.getElementById('tab-msched');
    tabs[2] = document.getElementById('tab-mmanage');
    tabs[3] = null; tabs[4] = null; tabs[5] = null;
    switchTab(0, 0);
  });

  merchantLogoutBtn.addEventListener('click', () => {
    // Hide ALL merchant tabs explicitly — prevents ghost content
    document.getElementById('tab-mdash').style.display = 'none';
    document.getElementById('tab-msched').style.display = 'none';
    document.getElementById('tab-mmanage').style.display = 'none';
    document.getElementById('tab-mdash').classList.remove('active');
    document.getElementById('tab-msched').classList.remove('active');
    document.getElementById('tab-mmanage').classList.remove('active');
    state.merchant = false;
    // Restore client tabs — nullify stale refs at 3-5
    tabs[0] = document.getElementById('tab-home');
    tabs[1] = document.getElementById('tab-booking');
    tabs[2] = document.getElementById('tab-profile');
    tabs[3] = null; tabs[4] = null; tabs[5] = null;
    unloggedView.style.display = 'block';
    loggedView.style.display = 'none';
    switchTab(0, 0);
  });

  // ===== SCHEDULE MANAGEMENT (Redesigned) =====
  // courseMeta, scheduleData, fmtDate, isSlotFull — defined in shared data section above

  let schedWeekOffset = 0;
  let schedFilterType = 'all';
  const schedWeekLabel    = document.getElementById('schedWeekLabel');
  const schedDayList      = document.getElementById('schedDayList');
  const schedPrev         = document.getElementById('schedPrev');
  const schedNext         = document.getElementById('schedNext');
  const qsMsg             = document.getElementById('qsMsg');
  const schedTotalBadge   = document.getElementById('schedTotalBadge');

  function getWeekDates(offset) {
    const now = new Date();
    const day = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1) + offset * 7);
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      dates.push(d);
    }
    return dates;
  }

  const dowLabels = ['周一','周二','周三','周四','周五','周六','周日'];

  function renderSchedule() {
    const dates = getWeekDates(schedWeekOffset);
    const first = dates[0], last = dates[6];
    schedWeekLabel.textContent = `${first.getMonth()+1}月${first.getDate()}日 — ${last.getMonth()+1}月${last.getDate()}日`;

    const todayStr = fmtDate(new Date());
    let totalSlots = 0;
    let html = '';

    dates.forEach(d => {
      const dateStr = fmtDate(d);
      const isToday = dateStr === todayStr;
      let slots = scheduleData[dateStr] || [];

      // Apply filter
      if (schedFilterType !== 'all') {
        slots = slots.filter(s => {
          const meta = courseMeta[s.courseId];
          return meta && meta.group === schedFilterType;
        });
      }

      totalSlots += slots.length;

      html += '<div class="sched-day-group">';
      html += '<div class="sdg-header">';
      html += `<div class="sdg-day"><span class="sdg-date">${dowLabels[d.getDay() === 0 ? 6 : d.getDay() - 1]} ${d.getMonth()+1}/${d.getDate()}</span>${isToday ? '<span class="sdg-today-badge">今天</span>' : ''}</div>`;
      html += `<span class="sdg-count">${slots.length} 节</span>`;
      html += '</div>';

      if (slots.length === 0) {
        html += '<div class="sdg-empty">当日暂无排课</div>';
      } else {
        slots.forEach(s => {
          const meta = courseMeta[s.courseId];
          if (!meta) return;
          const full = isSlotFull(s);
          html += '<div class="sdg-slot">';
          html += `<div class="sdgs-left-stripe stripe-${meta.type}"></div>`;
          html += `<div class="sdgs-time">${s.time}</div>`;
          html += '<div class="sdgs-body">';
          html += `<div class="sdgs-course">${meta.label} <span class="course-badge ${meta.type}">${meta.cap===1?'私教':'团课'}</span></div>`;
          html += `<div class="sdgs-meta">${meta.coach} · ${meta.cap===1?'60/90分钟':(meta.cap+'人容量')}</div>`;
          html += '</div>';
          html += `<div class="sdgs-count${full?' full':''}">${s.count}人</div>`;
          html += `<div class="sdgs-del" data-date="${dateStr}" data-sid="${s.id}">×</div>`;
          html += '</div>';
        });
      }
      html += '</div>';
    });

    schedDayList.innerHTML = html;
    if (schedTotalBadge) {
      schedTotalBadge.textContent = schedFilterType === 'all' ? `共 ${totalSlots} 节` : `筛选 ${totalSlots} 节`;
    }

    // Bind delete events
    schedDayList.querySelectorAll('.sdgs-del').forEach(el => {
      el.addEventListener('click', e => {
        e.stopPropagation();
        deleteSlot(el.dataset.date, el.dataset.sid);
      });
    });
  }

  function deleteSlot(dateStr, sid) {
    if (!scheduleData[dateStr]) return;
    scheduleData[dateStr] = scheduleData[dateStr].filter(s => s.id !== sid);
    if (scheduleData[dateStr].length === 0) delete scheduleData[dateStr];
    renderSchedule();
    updateConflict();
  }

  schedPrev.addEventListener('click', () => { schedWeekOffset--; renderSchedule(); });
  schedNext.addEventListener('click', () => { schedWeekOffset++; renderSchedule(); });

  // Filter
  const schedFilter = document.getElementById('schedFilter');
  if (schedFilter) {
    schedFilter.querySelectorAll('.sf-item').forEach(item => {
      item.addEventListener('click', () => {
        schedFilter.querySelectorAll('.sf-item').forEach(x => x.classList.remove('active'));
        item.classList.add('active');
        schedFilterType = item.dataset.filter;
        renderSchedule();
      });
    });
  }

  // Conflict detection
  function updateConflict() {
    const conflictEl = document.getElementById('qsfConflict');
    const conflictText = document.getElementById('qsfConflictText');
    if (!conflictEl || !conflictText) return;
    const dates = getWeekDates(schedWeekOffset);
    const dayIdx = parseInt(document.getElementById('qsDay').value);
    const dateStr = fmtDate(dates[dayIdx]);
    const time = document.getElementById('qsTime').value;
    const hasDup = scheduleData[dateStr] && scheduleData[dateStr].some(s => s.time === time);
    if (hasDup) {
      conflictEl.classList.add('has-conflict');
      conflictText.textContent = '该时段已有排课，请更换时间';
    } else {
      conflictEl.classList.remove('has-conflict');
      conflictText.textContent = '该时段空闲';
    }
  }

  const qsDayC    = document.getElementById('qsDay');
  const qsTimeC   = document.getElementById('qsTime');
  if (qsDayC) qsDayC.addEventListener('change', updateConflict);
  if (qsTimeC) qsTimeC.addEventListener('change', updateConflict);

  // Quick schedule form
  const qsCourse = document.getElementById('qsCourse');
  const qsCoach  = document.getElementById('qsCoach');
  const qsAdd    = document.getElementById('qsAdd');

  qsAdd.addEventListener('click', () => {
    const dates = getWeekDates(schedWeekOffset);
    const dayIdx = parseInt(qsDayC.value);
    const dateStr = fmtDate(dates[dayIdx]);
    const time = qsTimeC.value;
    const courseId = qsCourse.value;
    const meta = courseMeta[courseId];
    if (!meta) return;

    if (scheduleData[dateStr] && scheduleData[dateStr].some(s => s.time === time)) {
      qsMsg.textContent = '该时段已有排课，请更换时间';
      qsMsg.className = 'qsf-msg error';
      return;
    }

    if (!scheduleData[dateStr]) scheduleData[dateStr] = [];
    const newId = 's' + Date.now().toString(36);
    scheduleData[dateStr].push({ id: newId, time, courseId, count: `0/${meta.cap}` });
    scheduleData[dateStr].sort((a,b) => a.time.localeCompare(b.time));

    qsMsg.textContent = `已添加：${dowLabels[dayIdx]} ${time} ${meta.label}`;
    qsMsg.className = 'qsf-msg success';
    renderSchedule();
    updateConflict();
    setTimeout(() => { qsMsg.textContent = ''; qsMsg.className = 'qsf-msg'; }, 2000);
  });

  // ===== REVENUE TREND with SVG Line =====
  function renderTrend() {
    const svgArea = document.getElementById('trendChartSvg');
    const labelsArea = document.getElementById('trendLabels');
    if (!svgArea) return;

    const days = ['周一','周二','周三','周四','周五','周六','周日'];
    const data = [2180, 1950, 2420, 2860, 2340, 3100, 1680];
    const max = Math.max(...data);
    const chartW = 340, chartH = 100, padL = 8, padR = 8, padB = 16, barW = 32, gap = 6;
    const usableW = chartW - padL - padR;
    const totalGap = gap * (data.length - 1);
    const actualBarW = Math.min(barW, (usableW - totalGap) / data.length);
    const totalBarsW = actualBarW * data.length + totalGap;
    const startX = padL + (usableW - totalBarsW) / 2;
    const barMaxH = chartH - padB - 14;
    const points = [];

    let svg = `<svg viewBox="0 0 ${chartW} ${chartH}" xmlns="http://www.w3.org/2000/svg">`;

    data.forEach((v, i) => {
      const h = Math.max(4, (v / max) * barMaxH);
      const x = startX + i * (actualBarW + gap);
      const y = chartH - padB - h;
      const isToday = i === 3;
      const color = isToday ? '#FF5E3A' : (i === 6 ? '#E5E5EA' : 'rgba(255,94,58,0.3)');
      svg += `<rect class="tc-bar-rect" x="${x}" y="${y}" width="${actualBarW}" height="${h}" rx="3" fill="${color}"/>`;
      svg += `<text x="${x + actualBarW/2}" y="${y - 4}" text-anchor="middle" font-family="Inter" font-size="9" font-weight="700" fill="#5C5C5C">¥${v}</text>`;

      const cx = x + actualBarW / 2;
      const cy = y;
      points.push({ cx, cy });
    });

    // Line overlay
    if (points.length >= 2) {
      const pathD = points.map((p, i) => (i === 0 ? 'M' : 'L') + p.cx + ',' + p.cy).join(' ');
      svg += `<path class="tc-line-path" d="${pathD}"/>`;
      points.forEach((p, i) => {
        if (i !== 6) { // Don't draw dot on grey bar
          svg += `<circle class="tc-line-dot" cx="${p.cx}" cy="${p.cy}" r="3.5"/>`;
        }
      });
    }

    svg += '</svg>';
    svgArea.innerHTML = svg;

    if (labelsArea) {
      labelsArea.innerHTML = days.map(d => `<span class="tl-item">${d}</span>`).join('');
    }
  }

  // Revenue Hero Mini Chart
  function renderHeroMiniChart() {
    const area = document.getElementById('rhMiniChart');
    if (!area) return;
    const data = [2180, 1950, 2420, 2860, 2340, 3100, 1680];
    const max = Math.max(...data), min = Math.min(...data);
    const range = max - min || 1;
    const W = 100, H = 60, pad = 6;
    const stepX = (W - pad * 2) / (data.length - 1);
    const points = data.map((v, i) => ({
      x: pad + i * stepX,
      y: H - pad - ((v - min) / range) * (H - pad * 2)
    }));
    const pathD = points.map((p, i) => (i === 0 ? 'M' : 'L') + p.x + ',' + p.y).join(' ');
    area.innerHTML = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
      <path class="rh-mini-line" d="${pathD}"/>
    </svg>`;
  }

  // ===== COACH MODAL =====
  const coachData = {
    alex:  { name:'Alex',  role:'力量训练', rating:'4.9', gradient:'cc-pic-1', tags:['力量训练','增肌','体态矫正','CrossFit'], weeks:8, students:42, desc:'ACE认证教练，8年执教经验，擅长力量训练与体态矫正。' },
    mia:   { name:'Mia',   role:'流瑜伽',   rating:'4.8', gradient:'cc-pic-2', tags:['流瑜伽','阴瑜伽','冥想','孕产瑜伽'], weeks:6, students:38, desc:'RYT-500认证导师，专注于流瑜伽与正念冥想教学。' },
    jay:   { name:'Jay',   role:'拳击燃脂', rating:'4.9', gradient:'cc-pic-3', tags:['拳击','有氧搏击','HIIT','核心训练'], weeks:5, students:35, desc:'前职业拳击手，将拳击技巧与燃脂训练完美结合。' },
    sofia: { name:'Sofia', role:'功能训练', rating:'4.7', gradient:'cc-pic-4', tags:['功能训练','HIIT','动感单车','体能提升'], weeks:3, students:28, desc:'NSCA认证教练，专注功能性训练与运动表现提升。' }
  };

  function openCoachModal(key) {
    const c = coachData[key];
    if (!c) return;
    const card = document.getElementById('coachModalCard');
    // Build upcoming courses based on schedule data
    const upcoming = [];
    Object.entries(scheduleData).forEach(([date, slots]) => {
      slots.forEach(s => {
        const meta = courseMeta[s.courseId];
        if (meta && meta.coach === c.name) {
          upcoming.push({ date: date.slice(5), time: s.time, course: meta.label, count: s.count });
        }
      });
    });
    upcoming.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

    card.innerHTML = `
      <div class="cmc-close" id="coachModalClose">&times;</div>
      <div class="cmc-header">
        <div class="cmc-pic ${c.gradient}"><svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="1.5"><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/></svg></div>
        <div>
          <h3>${c.name}</h3>
          <div class="cmc-role">${c.role}</div>
          <div class="cmc-rating-big">⭐ ${c.rating}</div>
        </div>
      </div>
      <div class="cmc-detail-row">
        <div class="cmc-dr-item"><div class="cmc-dr-val">${c.weeks}</div><div class="cmc-dr-label">周课量</div></div>
        <div class="cmc-dr-item"><div class="cmc-dr-val">${c.students}</div><div class="cmc-dr-label">学员数</div></div>
        <div class="cmc-dr-item"><div class="cmc-dr-val">${c.rating}</div><div class="cmc-dr-label">评分</div></div>
      </div>
      <div class="cmc-section">
        <h4>擅长领域</h4>
        <div class="cmc-tags">${c.tags.map(t => `<span>${t}</span>`).join('')}</div>
      </div>
      <div class="cmc-section">
        <h4>本周排课（${upcoming.length}节）</h4>
        <div class="cmc-upcoming">
          ${upcoming.length === 0 ? '<div style="font-size:0.72rem;color:var(--text-3);padding:8px 0;">本周暂无排课</div>' : upcoming.slice(0, 5).map(u => `
          <div class="cmc-upcoming-item">
            <span class="cmc-ui-time">${u.date} ${u.time}</span>
            <span class="cmc-ui-course">${u.course}</span>
            <span class="cmc-ui-count">${u.count}人</span>
          </div>`).join('')}
        </div>
      </div>
    `;

    document.getElementById('coachDetailModal').classList.add('active');

    document.getElementById('coachModalClose').addEventListener('click', closeCoachModal);
  }

  function closeCoachModal() {
    document.getElementById('coachDetailModal').classList.remove('active');
  }

  document.getElementById('coachDetailModal').addEventListener('click', e => {
    if (e.target === document.getElementById('coachDetailModal')) closeCoachModal();
  });

  document.querySelectorAll('.coach-chip-clickable').forEach(chip => {
    chip.addEventListener('click', () => openCoachModal(chip.dataset.coach));
  });

  // ===== DASHBOARD QUICK ACTIONS =====
  const exportBtn = document.getElementById('exportReport');
  const viewAllBtn = document.getElementById('viewAllBookings');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      alert('Demo模式：报表导出功能将在正式版上线');
    });
  }
  if (viewAllBtn) {
    viewAllBtn.addEventListener('click', () => {
      if (state.merchant) {
        switchTab(1, 1);
      }
    });
  }

  // ===== PROFILE BOOKINGS RENDER =====
  function renderProfileBookings() {
    const upcomingEl = document.getElementById('upcomingBookings');
    const historyEl = document.getElementById('historyBookings');
    if (!upcomingEl || !historyEl) return;

    const upcoming = state.userBookings.filter(b => b.status === 'upcoming');
    const today = fmtDate(new Date());

    // Upcoming
    if (upcoming.length === 0) {
      upcomingEl.innerHTML = `<div class="booking-record">
        <div class="br-icon br-icon-upcoming"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="4" width="18" height="18" rx="3"/><path d="M3 10h18M8 2v4M16 2v4"/></svg></div>
        <div class="br-info"><h5>暂无预约</h5><div class="br-meta">去预约课程开始训练吧</div></div>
      </div>`;
    } else {
      upcomingEl.innerHTML = upcoming.map(b => {
        const dateStr = b.date === today ? '今天' : b.dateLabel.split('年').pop().replace('年','/').replace('月','/').replace('日','');
        return `<div class="booking-record">
          <div class="br-icon br-icon-upcoming"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="4" width="18" height="18" rx="3"/><path d="M3 10h18M8 2v4M16 2v4"/></svg></div>
          <div class="br-info"><h5>${b.service}</h5><div class="br-meta">${dateStr} ${b.time} · ${b.coach}</div></div>
          <span class="br-status br-status-upcoming">待上课</span>
        </div>`;
      }).join('');
    }

    // History (demo hardcoded + any completed user bookings)
    const hardcodedHistory = [
      { service:'拳击燃脂 · 60min', date:'2026-05-28', time:'19:00', coach:'Jay' },
      { service:'流瑜伽 · 60min', date:'2026-05-25', time:'14:00', coach:'Mia' }
    ];
    const completed = state.userBookings.filter(b => b.status === 'done');
    const displayHistory = [...completed, ...hardcodedHistory].slice(0, 5);

    historyEl.innerHTML = displayHistory.map(b => {
      const dateStr = b.date ? (b.date === today ? '今天' : b.date.slice(5)) : b.dateLabel || '';
      return `<div class="booking-record">
        <div class="br-icon br-icon-done"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="4,12 9,17 20,6"/></svg></div>
        <div class="br-info"><h5>${b.service}</h5><div class="br-meta">${dateStr} ${b.time||''} ${b.coach?('· '+b.coach):''}</div></div>
        <span class="br-status br-status-done">已完成</span>
      </div>`;
    }).join('') || `<div class="booking-record">
      <div class="br-icon br-icon-done"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="4,12 9,17 20,6"/></svg></div>
      <div class="br-info"><h5>暂无历史记录</h5><div class="br-meta">完成训练后记录将显示在这里</div></div>
    </div>`;
  }

  // Initial renders
  renderSchedule();
  updateConflict();
  renderTrend();
  renderHeroMiniChart();

  switchTab(0, 0);
});
