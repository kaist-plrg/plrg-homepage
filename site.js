/* PLRG site renderer. Reads data/*.yml and fills the page. No build step, no libraries. */
(function () {
  // Reader for the simple YAML used in data/: "key: value" lines, "- " list items, nesting by indentation.
  // Quotes are optional. Comments start with # (whole line, or " # " after a value). yes/no/true/false become booleans, plain integers numbers.
  const parse = (text, file) => {
    const fail = (n, msg) => { throw new Error(`${file || 'data'} line ${n}: ${msg}`); };
    const L = [];
    String(text).replace(/\r/g, '').split('\n').forEach((raw, i) => {
      const line = raw.replace(/\t/g, '  ').replace(/\s+$/, '');
      if (!line.trim() || line.trim().startsWith('#')) return;
      L.push({ n: i + 1, ind: line.length - line.trimStart().length, text: line.trim() });
    });
    const uncomment = v => v.replace(/(^|\s)#\s.*$/, '').trim();
    const scalar = v => {
      v = v.trim();
      if (!/^["']/.test(v)) v = uncomment(v);
      if (v.length > 1 && v[0] === '"' && v.endsWith('"')) return v.slice(1, -1).replace(/\\"/g, '"');
      if (v.length > 1 && v[0] === "'" && v.endsWith("'")) return v.slice(1, -1).replace(/''/g, "'");
      if (/^(yes|true)$/i.test(v)) return true;
      if (/^(no|false)$/i.test(v)) return false;
      if (/^\d{1,9}$/.test(v)) return Number(v);
      return v;
    };
    const isDash = l => l.text === '-' || l.text.startsWith('- ');
    const KEY = /^([^\s"'#][^:]*?):(?:\s+(.*))?$/;
    let i = 0;
    const node = ind => (isDash(L[i]) ? list : map)(L[i].ind > ind ? L[i].ind : ind);
    const list = ind => {
      const out = [];
      while (i < L.length && L[i].ind === ind && isDash(L[i])) {
        const l = L[i], rest = uncomment(l.text.slice(1));
        if (!rest) { i++; out.push(i < L.length && L[i].ind > ind ? node(ind) : ''); }
        // "- title: ..." starts a block of fields; "- Some text: more" (key with spaces) stays text.
        else if (/^[A-Za-z_][\w-]*:(\s|$)/.test(rest)) { L[i] = { n: l.n, ind: l.ind + l.text.indexOf(rest), text: rest }; out.push(map(L[i].ind)); }
        else { out.push(scalar(rest)); i++; }
      }
      if (i < L.length && L[i].ind > ind) fail(L[i].n, '들여쓰기(indentation)가 맞지 않습니다');
      return out;
    };
    const map = ind => {
      const out = {};
      while (i < L.length && L[i].ind === ind && !isDash(L[i])) {
        const l = L[i], m = l.text.match(KEY);
        if (!m) fail(l.n, '"이름: 값" 형식이 아닙니다 (콜론 뒤 한 칸 띄우기)');
        i++;
        if (m[2] !== undefined && uncomment(m[2]) !== '') out[m[1].trim()] = scalar(m[2]);
        else if (i < L.length && (L[i].ind > ind || (L[i].ind === ind && isDash(L[i])))) out[m[1].trim()] = node(ind);
        else out[m[1].trim()] = '';
      }
      if (i < L.length && L[i].ind > ind) fail(L[i].n, '들여쓰기(indentation)가 맞지 않습니다');
      return out;
    };
    if (!L.length) return [];
    const out = node(L[0].ind);
    if (i < L.length) fail(L[i].n, '들여쓰기(indentation)가 맞지 않습니다');
    return out;
  };
  if (typeof document === 'undefined') { module.exports = { parse }; return; } // used by the deploy check

  const $ = (s, el) => (el || document).querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  // Escaped text with [label](url) turned into links (any number per line) and **text** into orange emphasis.
  const md = s => esc(s).replace(/\[((?:[^[\]]|\[[^\]]*\])+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>').replace(/\*\*(.+?)\*\*/g, '<span style="color: #d56325;">$1</span>');
  const load = name => fetch('data/' + name + '.yml').then(r => { if (!r.ok) throw new Error('data/' + name + '.yml'); return r.text(); }).then(t => parse(t, 'data/' + name + '.yml'));
  const show = sel => e => { console.error(e); const el = $(sel); if (el) el.innerHTML = `<p class="small muted">${esc(e.message)}</p>`; };
  const page = document.body.dataset.page;
  // Keep short sentence-opening words ("We", "It", "A") glued to the next word so a line never ends right after a sentence starts.
  const tidy = el => { const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); let t; while ((t = w.nextNode())) t.nodeValue = t.nodeValue.replace(/(^|[.!?]\s)(\p{Lu}\p{L}{0,2}) /gu, '$1$2 '); };
  const settings = load('settings');
  // Papers live in two files with the same format (2026~ and older); the site merges them and sorts by date.
  const PUB_FILES = ['publications', 'publications-until-2025'];
  const loadPubs = () => Promise.all(PUB_FILES.map(load)).then(lists => [].concat(...lists.map(l => Array.isArray(l) ? l : [])));
  settings.catch(() => {}); // errors are shown by the page that uses it
  const link = p => String(p.link || '').trim();
  // Entries only need title/authors/venue/date/link. Year comes from the date ("June 2027").
  // "To appear 2027" is shown as "To appear" and sorts above everything else in 2027.
  const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
  const prep = pubs => (pubs || []).map(p => {
    const d = String(p.date || '').trim(), y = (d.match(/\d{4}/) || [])[0], m = d.toLowerCase();
    const rank = m.startsWith('to appear') ? 13 : m.length >= 3 ? MONTHS.findIndex(x => x.startsWith(m.slice(0, 3))) + 1 : 0;
    return Object.assign({}, p, { year: Number(y || 0), month: rank === 13 ? 'To appear' : d, rank });
  });
  // Newest first, whatever order the file is in. Ties keep file order.
  const byDate = pubs => prep(pubs).sort((a, b) => (b.year - a.year) || (b.rank - a.rank));
  // Members: by family name, then given name. Alumni: graduation year (newest first), Ph.D. before M.S., family name.
  const family = n => { const w = String(n).trim().split(/\s+/); return (w[w.length - 1] + ' ' + w.slice(0, -1).join(' ')).toLowerCase(); };
  const byName = rows => (rows || []).slice().sort((a, b) => family(a.name).localeCompare(family(b.name)));
  const degree = d => /ph\.?\s*d/i.test(d) ? 0 : /m\.?\s*s/i.test(d) ? 1 : 2;
  const byGrad = rows => (rows || []).slice().sort((a, b) => (Number(b.year) - Number(a.year)) || (degree(a.degree) - degree(b.degree)) || family(a.name).split(' ')[0].localeCompare(family(b.name).split(' ')[0]));

  const pubItem = (p, opts) => {
    const href = link(p);
    const title = href ? `<a href="${esc(href)}">${esc(p.title)}</a>` : esc(p.title);
    const venue = esc(p.venue) + (opts && opts.withMonth ? ', ' + esc(p.month) : '') + (p.award ? '. ' + esc(p.award) : '');
    const body = `<div><div class="t">${title}</div><div class="muted">${esc(p.authors)}</div><div class="muted">${venue}</div></div>`;
    return opts && opts.month ? `<li class="pub small"><span class="muted">${esc(p.month)}</span>${body}</li>` : `<li class="pub small">${body}</li>`;
  };

  if (page === 'home') {
    settings.then(s => {
      $('#headline').innerHTML = [].concat(s.home.headline).map(esc).join('<br>');
      $('#lede').innerHTML = md(s.home.intro); tidy($('#lede'));
      $('#areas').innerHTML = s.research.areas.map(a => `<li class="small"><a href="research.html" style="color:#000">${esc(a.title)}</a> <span class="muted">· ${esc(a.keywords)}</span></li>`).join('');
    }).catch(show('#lede'));
    // The newest papers, regardless of "research". How many: settings.yml → home → recent_publications.
    Promise.all([loadPubs().then(byDate), settings]).then(([pubs, s]) => {
      const n = Number(s.home.recent_publications) || 5;
      $('#recent').innerHTML = pubs.filter(p => !p.section).slice(0, n).map(p => pubItem(p, { month: true })).join('');
    }).catch(show('#recent'));
  }

  if (page === 'research') {
    Promise.all([settings.then(s => s.research), loadPubs().then(byDate)]).then(([r, pubs]) => {
      $('#intro').textContent = r.intro; tidy($('#intro'));
      $('#areas').innerHTML = r.areas.map(a => {
        // "research: rust" (or several: "rust, analysis") lists the paper under that area, newest first.
        const sel = pubs.filter(p => String(p.research || '').split(',').map(x => x.trim()).includes(a.id));
        const items = sel.map(p => {
          const href = link(p);
          const t = href ? `<a href="${esc(href)}">${esc(p.title)}</a>` : esc(p.title);
          const tail = '(' + esc(p.short || p.venue) + ')' + (p.award ? ' · ' + esc(String(p.award).replace('ACM SIGSOFT ', '')) : '');
          return `<li class="small">${t} <span class="muted">${tail}</span></li>`;
        }).join('');
        return `<section class="area"><h2>${esc(a.title)}</h2><p>${esc(a.description)}</p>${sel.length ? `<ul>${items}</ul>` : ''}</section>`;
      }).join('');
      document.querySelectorAll('.area p').forEach(tidy);
    }).catch(show('#areas'));
  }

  if (page === 'publications') {
    Promise.all([loadPubs().then(byDate), settings]).then(([pubs, s]) => {
      const cutoff = Number(s.publications.group_before) || 2020;
      $('#count').textContent = pubs.length + ' Papers';
      const main = pubs.filter(p => !p.section);
      const by = {};
      main.forEach(p => { const k = p.year >= cutoff ? String(p.year) : 'Before ' + cutoff; (by[k] = by[k] || []).push(p); });
      const keys = Object.keys(by).sort((a, b) => a.startsWith('B') ? 1 : b.startsWith('B') ? -1 : Number(b) - Number(a));
      const groups = keys.map(k => ({ label: k, items: by[k] }));
      ['Refereed Chapters in Books', 'Refereed Articles', 'Technical Reports'].forEach(sec => {
        const items = pubs.filter(p => p.section === sec); if (items.length) groups.push({ label: sec, items });
      });
      $('#list').innerHTML = groups.map(g => `<section class="year-sec"><h2>${esc(g.label)}</h2><ol class="pubs">${g.items.map(p => pubItem(p, { withMonth: true })).join('')}</ol></section>`).join('');
    }).catch(show('#list'));
  }

  if (page === 'members') {
    // Personal website: name becomes a link, marked with [🔗]. Empty website → plain name, no icon.
    const name = m => String(m.website || '').trim() ? `<a class="site" href="${esc(String(m.website).trim())}"><b>${esc(m.name)}</b> <span class="lk">[🔗]</span></a>` : `<b>${esc(m.name)}</b>`;
    const person = m => `<li class="person small"><span>${name(m)}</span><span class="muted">${esc(m.email || '')}</span></li>`;
    // One file for everyone: each top-level name is a category; the one called "Alumni" fills the alumni grid.
    load('members').then(groups => {
      const titles = Object.keys(groups), isAlum = t => /^alumni$/i.test(t.trim());
      $('#groups').innerHTML = titles.filter(t => !isAlum(t) && groups[t].length).map(t => `<section class="group"><h2>${esc(t)}</h2><ul class="people">${byName(groups[t]).map(person).join('')}</ul></section>`).join('');
      const alumni = byGrad(groups[titles.find(isAlum)]);
      // Alumni: never linked, even if a website line was carried over. affiliation = current position.
      $('#alumni').innerHTML = alumni.map(a => `<li class="alum"><span class="who"><b>${esc(a.name)}</b> <span class="muted">(${esc(a.degree)}, ${esc(a.year)})</span></span>${a.email ? `<span class="muted">${esc(a.email)}</span>` : ''}${a.affiliation ? `<span class="now">${esc(a.affiliation)}</span>` : ''}</li>`).join('');
    }).catch(show('#groups'));
  }

  if (page === 'profile') {
    // Overview and Biography tabs: sections with a heading and either a paragraph (text) or a list (items).
    const sections = list => (list || []).map(s => `<section class="prow"><h2>${esc(s.heading)}</h2>${s.text ? `<p>${md(s.text)}</p>` : ''}${s.items ? `<ul>${s.items.map(x => `<li>${md(x)}</li>`).join('')}</ul>` : ''}</section>`).join('');
    load('profile').then(p => {
      document.title = p.name + ' — PLRG @ KAIST';
      $('#profile').innerHTML = `<img class="avatar" src="photos/${esc(p.photo)}" alt="${esc(p.name)}"><div><h1>${esc(p.name)}</h1><p style="margin: 0 0 14px;">${md(p.position)}</p><ul class="links small">${(p.links || []).map(x => `<li>${md(x)}</li>`).join('')}</ul></div>`;
      $('#panel-main').innerHTML = sections(p.overview);
      $('#panel-biography').innerHTML = sections(p.biography);
    }).catch(show('#profile'));
    // Photos tab: every image in photos/gallery/, sorted by file name. Caption = file name without the
    // leading number and extension ("3 August 2021.png" → "August 2021"). The deploy writes list.json;
    // a local preview server's folder listing is used as a fallback.
    const IMG = /\.(png|jpe?g|gif|webp|avif)$/i;
    fetch('photos/gallery/list.json').then(r => { if (!r.ok) throw 0; return r.json(); })
      .catch(() => fetch('photos/gallery/').then(r => r.text()).then(t => [...t.matchAll(/href="([^"?#/]+)"/g)].map(m => decodeURIComponent(m[1]))))
      .then(files => {
        const list = [...new Set(files)].filter(f => IMG.test(f)).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
        $('#gallery').innerHTML = list.map(f => { const cap = f.replace(IMG, '').replace(/^\d+[\s._-]*/, ''); return `<li><img src="photos/gallery/${esc(encodeURIComponent(f))}" alt="${esc(cap)}"><div class="cap">${esc(cap)}</div></li>`; }).join('');
      }).catch(show('#gallery'));
  }
})();
