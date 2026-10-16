export function stripHtml(html) { if (!html) return ''; return html.replace(/<[^>]*>?/gm, '').slice(0,300)+'...'; }

export function createXPathHelper() {
  function $x(xpath, htmlInput) {
    if (!htmlInput || !xpath) return [];
    let html = typeof htmlInput === 'string' ? htmlInput : htmlInput.innerHTML || htmlInput.outerHTML || '';
    if (!html) return [];
    let normalized = xpath.replace(/id\(['\"](.*?)['\"]\)/g, "*[@id='$1']");
    const parts = normalized.split('/').filter(p => p.length > 0);
    let results = [html];
    for (let part of parts) {
      if (!part) continue;
      if (part === '') continue;
      let tag = '*'; let attrName = null; let attrValue = null; let index = null;
      const tagMatch = part.match(/^([\w\*]+)/);
      if (tagMatch) tag = tagMatch[1];
      const attrMatch = part.match(/\[@(\w+)=['\"](.*?)['\"]\]/);
      if (attrMatch) { attrName = attrMatch[1]; attrValue = attrMatch[2]; }
      const indexMatch = part.match(/\[(\d+)\]$/);
      if (indexMatch) index = parseInt(indexMatch[1], 10) - 1;
      let newResults = [];
      for (let chunk of results) {
        let regexPattern;
        if (tag === '*') {
          if (attrName && attrValue) {
            const escapedVal = attrValue.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            regexPattern = `<[^>]*${attrName}=['\"]${escapedVal}['\"][^>]*>([\\s\\S]*?)<\\/[^>]+>|<[^>]*${attrName}=['\"]${escapedVal}['\"][^>]*\\/?>`;
          } else {
            regexPattern = `<([a-zA-Z][\\w-]*)[^>]*>([\\s\\S]*?)<\\/\\1>`;
          }
        } else {
          if (attrName && attrValue) {
            const escapedVal = attrValue.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            regexPattern = `<${tag}[^>]*${attrName}=['\"]${escapedVal}['\"][^>]*>([\\s\\S]*?)<\\/${tag}>|<${tag}[^>]*${attrName}=['\"]${escapedVal}['\"][^>]*\\/?>`;
          } else {
            regexPattern = `<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>|<${tag}[^>]*\\/?>`;
          }
        }
        try {
          const re = new RegExp(regexPattern, 'gi');
          let m; let found = [];
          while ((m = re.exec(chunk)) !== null) { found.push(m[0]); if (found.length > 50) break; }
          if (index !== null) { if (found[index]) newResults.push(found[index]); } else { newResults.push(...found); }
        } catch(e) { console.log(`$x err ${part}: ${e.message}`); }
      }
      results = newResults;
      if (results.length === 0) break;
    }
    return results;
  }
  $x.text = (els) => { if (!els) return []; const arr = Array.isArray(els) ? els : [els]; return arr.map(el => el ? el.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() : ''); };
  $x.attr = (els, name) => { if (!els) return []; const arr = Array.isArray(els) ? els : [els]; return arr.map(el => { const m = el.match(new RegExp(`${name}=['\"](.*?)['\"]`, 'i')); return m ? m[1] : null; }); };
  return $x;
}
export const GLOBAL_XPATH = createXPathHelper();
