var textVide = (function (L) {
  'use strict';
  const f = t => t == null || t === '',
    h = (t, n) =>
      Object.keys(t).reduce((e, s) => (n(e[s]) && delete e[s], e), t),
    I = (t, n) => ({ ...n, ...h(t, f) }),
    _ = ['<b>', '</b>'],
    y = t =>
      I(t, {
        sep: _,
        fixationPoint: 1,
        ignoreHtmlTag: !0,
        ignoreHtmlEntity: !0,
      }),
    u = [
      [0, 4, 12, 17, 24, 29, 35, 42, 48],
      [1, 2, 7, 10, 13, 14, 19, 22, 25, 28, 31, 34, 37, 40, 43, 46, 49],
      [
        1, 2, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35, 37,
        39, 41, 43, 45, 47, 49,
      ],
      [
        0, 2, 4, 5, 6, 8, 9, 11, 14, 15, 17, 18, 20, 0, 21, 23, 24, 26, 27, 29,
        30, 32, 33, 35, 36, 38, 39, 41, 42, 44, 45, 47, 48,
      ],
      [
        0, 2, 3, 5, 6, 7, 8, 10, 11, 12, 14, 15, 17, 19, 20, 21, 23, 24, 25, 26,
        28, 29, 30, 32, 33, 34, 35, 37, 38, 39, 41, 42, 43, 44, 46, 47, 48,
      ],
    ],
    A = (t, n) => {
      const { length: i } = t,
        e = u[n - 1] ?? u[0],
        s = e.findIndex(c => i <= c);
      let o = i - s;
      return s === -1 && (o = i - e.length), Math.max(o, 0);
    },
    R = (t, n) =>
      typeof n === 'string' ? `${n}${t}${n}` : `${n[0]}${t}${n[1]}`,
    m = t =>
      Array.from(t).map(n => {
        const i = n.index,
          [e] = n,
          { length: s } = e;
        return [i, i + s - 1];
      }),
    H = /(<!--[\s\S]*?-->)|(<[^>]*>)/g,
    N = t => {
      const n = t.matchAll(H),
        e = m(n).reverse();
      return s => {
        const o = s.index,
          c = e.find(([r]) => o > r);
        if (!c) {
          return !1;
        }
        const [, a] = c;
        return o < a;
      };
    },
    O = /(&[\w#]+;)/g,
    M = t => {
      const n = t.matchAll(O),
        e = m(n).reverse();
      return s => {
        const o = s.index,
          c = e.find(([r]) => o > r);
        if (!c) {
          return !1;
        }
        const [, a] = c;
        return o < a;
      };
    },
    x = /(\p{L}|\p{Nd})*\p{L}(\p{L}|\p{Nd})*/gu,
    F = (t, n = {}) => {
      if (!(t != null && t.length)) {
        return '';
      }
      const {
          fixationPoint: i,
          sep: e,
          ignoreHtmlTag: s,
          ignoreHtmlEntity: o,
        } = y(n),
        c = Array.from(t.matchAll(x));
      let a = '',
        l = 0,
        r;
      s && (r = N(t));
      let d;
      o && (d = M(t));
      for (const g of c) {
        if ((r == null ? void 0 : r(g)) || (d == null ? void 0 : d(g))) {
          continue;
        }
        const [D] = g,
          T = g.index,
          E = T + A(D, i),
          U = t.slice(l, T);
        (a += U), T !== E && (a += R(t.slice(T, E), e)), (l = E);
      }
      const G = t.slice(l);
      return a + G;
    };
  return (
    (L.textVide = F),
    Object.defineProperty(L, Symbol.toStringTag, { value: 'Module' }),
    L
  );
})({});
