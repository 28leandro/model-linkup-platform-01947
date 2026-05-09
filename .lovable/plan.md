## Renomear site para "TROC.py"

Atualizar todas as referências do nome atual ("Neon Py" / "NEO.py" / "LinkUp") para **TROC.py** em toda a aplicação.

### Arquivos a alterar

1. **`src/components/Logo.tsx`** — substituir as letras N/E/O pelas letras T/R/O/C, mantendo o esquema de cores e o sufixo `.py`:
   - T (#632D48), R (#EDA04E), O (#4DC47F), C (cor adicional do tema) + `.py`

2. **`src/components/Footer.tsx`** — alterar `© Neon Py` para `© TROC.py`.

3. **`index.html`** — atualizar:
   - `<title>` → `TROC.py - Marketplace`
   - meta tags `title`, `description`, `og:title`, `og:description`, `twitter:title`, `twitter:description`, `apple-mobile-web-app-title`

4. **`public/manifest.json`** — atualizar `name` (`TROC.py - Marketplace`) e `short_name` (`TROC.py`).

### Fora do escopo
- Não alterar lógica de negócio, rotas, schema do banco ou domínio publicado.
- O domínio `neon-py.lovable.app` permanece (mudança de domínio é separada).
