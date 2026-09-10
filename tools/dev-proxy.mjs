/**
 * Proxy de desenvolvimento — só para rodar o app no NAVEGADOR (Expo web).
 *
 * Problema: a API usa sessão por cookie (JSESSIONID). No navegador o cookie não
 * volta em requisições cross-site e o CORS não está liberado — então login até
 * funciona, mas qualquer rota autenticada (pets, perfil) dá 403.
 *
 * Solução: este proxy roda em http://localhost:8090 e repassa tudo para a API.
 * Como fica no mesmo site (localhost) que o app (localhost:8081), o cookie de
 * sessão passa a ser reenviado normalmente, e o proxy ainda adiciona os headers
 * de CORS que faltam.
 *
 * Uso:
 *   1. node tools/dev-proxy.mjs        (deixe rodando num terminal)
 *   2. no .env:  EXPO_PUBLIC_API_URL='http://localhost:8090'
 *   3. npx expo start --web            (Chrome normal, SEM --disable-web-security)
 *
 * Não precisa de nenhuma dependência — só Node.
 */
import http from "node:http";
import https from "node:https";

const PORTA = Number(process.env.PROXY_PORT ?? 8090);
const ALVO = process.env.PROXY_TARGET ?? "https://java-afetto-fork.onrender.com";
const ORIGENS_PERMITIDAS = [
  "http://localhost:8081",
  "http://localhost:19006",
  "http://localhost:19000",
];

const alvo = new URL(ALVO);

const servidor = http.createServer((req, res) => {
  const origem = ORIGENS_PERMITIDAS.includes(req.headers.origin ?? "")
    ? req.headers.origin
    : ORIGENS_PERMITIDAS[0];

  res.setHeader("Access-Control-Allow-Origin", origem);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    req.headers["access-control-request-headers"] ?? "content-type"
  );

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const cabecalhos = { ...req.headers };
  cabecalhos.host = alvo.host;
  cabecalhos.origin = ALVO;
  cabecalhos.referer = `${ALVO}/`;
  delete cabecalhos["accept-encoding"]; // evita ter que descomprimir

  const upstream = https.request(
    {
      protocol: alvo.protocol,
      hostname: alvo.hostname,
      port: alvo.port || 443,
      method: req.method,
      path: req.url,
      headers: cabecalhos,
    },
    (r) => {
      const headers = { ...r.headers };
      // Cookie fica preso ao localhost (tira Domain, força SameSite=Lax).
      if (Array.isArray(headers["set-cookie"])) {
        headers["set-cookie"] = headers["set-cookie"].map((c) =>
          c
            .replace(/;\s*Domain=[^;]+/i, "")
            .replace(/;\s*SameSite=[^;]+/i, "")
            .concat("; SameSite=Lax")
        );
      }
      // Deixa o CORS por conta do proxy.
      delete headers["access-control-allow-origin"];
      delete headers["access-control-allow-credentials"];
      res.writeHead(r.statusCode ?? 502, headers);
      r.pipe(res);
    }
  );

  upstream.on("error", (e) => {
    res.writeHead(502, { "content-type": "application/json" });
    res.end(JSON.stringify({ erro: `proxy: ${e.message}` }));
  });

  req.pipe(upstream);
});

servidor.listen(PORTA, () => {
  console.log(`\n  Proxy dev:  http://localhost:${PORTA}  →  ${ALVO}`);
  console.log(`  No .env:    EXPO_PUBLIC_API_URL='http://localhost:${PORTA}'\n`);
});
