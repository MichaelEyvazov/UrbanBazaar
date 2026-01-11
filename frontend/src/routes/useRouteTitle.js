import { useEffect } from 'react';
import { useLocation, matchPath } from 'react-router-dom';
import { titleRules, BRAND } from './titleRules';

export function useRouteTitle() {
  const { pathname } = useLocation();

  useEffect(() => {
    const match = titleRules
      .map((r) => {
        const m = matchPath({ path: r.path, end: true }, pathname);
        return m ? { rule: r, params: m.params } : null;
      })
      .reverse()
      .find(Boolean);

    const raw = match?.rule.title;
    const pageTitle =
      typeof raw === 'function' ? raw(match.params) : raw;

    document.title = pageTitle ? `${pageTitle} • ${BRAND}` : BRAND;
  }, [pathname]);
}
