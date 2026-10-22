// Parse locally. Player names and friend codes are never sent to Firebase.
const codePattern = /[(（]\s*(\d{4}[-－‐–ー]\d{4}[-－‐–ー]\d{4})\s*[)）]/gu;
const splitChars = text => typeof Intl.Segmenter === 'function'
  ? [...new Intl.Segmenter('ja', { granularity: 'grapheme' }).segment(text)].map(x => x.segment)
  : Array.from(text);
function decode(text) {
  return text.replace(/&#(?:x([0-9a-f]+)|(\d+));|&(nbsp|amp|lt|gt|quot|apos);/gi, (full, hex, dec, named) => {
    if (named) return {nbsp:' ', amp:'&', lt:'<', gt:'>', quot:'"', apos:"'"}[named.toLowerCase()];
    const n = Number.parseInt(hex || dec, hex ? 16 : 10);
    return n > 0 && n <= 0x10ffff && !(n >= 0xd800 && n <= 0xdfff) ? String.fromCodePoint(n) : full;
  });
}
function clean(text) {
  return text.replace(/\*\*/g, '').replace(/★進/g, '').replace(/^[\s\\]+|[\s\\]+$/gu, '').trim();
}
export function suggestTag(names) {
  if (!names.length) return '';
  const chars = names.map(n => splitChars(n.trim()));
  // Longest common substring (prefix OR suffix OR infix), with stable tie-breaking.
  const first = chars.reduce((best, current) => current.length < best.length ? current : best, chars[0]);
  for (let len = Math.min(first.length,24); len >= 1; len--) {
    for (let start = 0; start + len <= first.length; start++) {
      const part = first.slice(start,start+len).join('').trim();
      if (!part || part.length > 24 || !names.every(n => n.includes(part))) continue;
      return part;
    }
  }
  return '';
}
export function parseRoster(text) {
  if (typeof text !== 'string' || !text.trim()) throw Error('組分けのテキストを貼り付けてください。');
  if (text.length > 100000) throw Error('テキストが長すぎます。対象の24人分だけを貼り付けてください。');
  const lines = decode(text).replace(/^\uFEFF/, '').replace(/\r\n?/g,'\n').replace(/\\[ \t]*(?=\n|$)/g,'').split('\n');
  const teams = [], codes = new Set();
  for (const [index, raw] of lines.entries()) {
    const line=raw.trim();
    if (!line || /^#{1,6}\s/.test(line)) continue;
    const matches=[...line.matchAll(codePattern)];
    if (!matches.length) throw Error(`${index+1}行目にフレンドコードがありません。1行に1チームずつ貼り付けてください。`);
    const players=[];let end=0;
    for(const match of matches){
      const name=clean(line.slice(end,match.index)).replace(/^(?:[-•]\s+|\d+[.)]\s+)/u,'').trim();
      if(!name || name.length>120)throw Error(`${index+1}行目の選手名を読み取れませんでした。フレンドコードの前に選手名を入れてください。`);
      const code=match[1].replace(/[-－‐–ー]/g,'');
      if(codes.has(code))throw Error('同じフレンドコードが複数回あります。組分けを確認してください。');
      codes.add(code);players.push(name);end=match.index+match[0].length;
    }
    if(clean(line.slice(end)))throw Error(`${index+1}行目の末尾に読み取れない文字があります。1行に1チームずつ貼り付けてください。`);
    teams.push({players,tag:suggestTag(players)});
  }
  if(!teams.length)throw Error('チームを読み取れませんでした。');
  const size=teams[0].players.length;
  if(![2,3,4].includes(size)||teams.some(t=>t.players.length!==size)||teams.length*size!==24)
    throw Error(`読み取り結果は${teams.length}行・${teams.reduce((n,t)=>n+t.players.length,0)}人です。2人×12行、3人×8行、4人×6行のいずれかで貼り付けてください。`);
  return {size,teams};
}
