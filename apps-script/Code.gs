/**
 * Banco de propostas do Gerador de Propostas Solturi.
 * Cada proposta é uma linha da aba "Propostas". Publicar como App da Web:
 * Executar como: Eu · Quem pode acessar: Qualquer pessoa.
 */
const ABA = "Propostas";
const CABECALHO = ["Número", "Tipo", "Cliente", "Valor", "Emissão", "Atualizado em", "ID", "Dados"];
const PRIMEIRO_NUMERO = 203;

/** Planilha: a do vínculo (se o script estiver dentro de uma) ou uma criada automaticamente. */
function planilha_() {
  const ativa = SpreadsheetApp.getActiveSpreadsheet();
  if (ativa) return ativa;
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty("PLANILHA_ID");
  if (id) {
    try { return SpreadsheetApp.openById(id); } catch (err) {}
  }
  const nova = SpreadsheetApp.create("Propostas Solturi");
  props.setProperty("PLANILHA_ID", nova.getId());
  return nova;
}

/** Rode uma vez pelo editor para autorizar e criar a planilha. */
function configurar() {
  const ss = planilha_();
  aba_();
  const padrao = ss.getSheetByName("Página1") || ss.getSheetByName("Sheet1");
  if (padrao && ss.getSheets().length > 1) ss.deleteSheet(padrao);
  Logger.log("Planilha: " + ss.getUrl());
}

function aba_() {
  const ss = planilha_();
  let sh = ss.getSheetByName(ABA);
  if (!sh) {
    sh = ss.insertSheet(ABA);
    sh.appendRow(CABECALHO);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, CABECALHO.length).setFontWeight("bold");
  }
  return sh;
}

function linhas_() {
  const sh = aba_();
  const n = sh.getLastRow() - 1;
  if (n < 1) return [];
  return sh.getRange(2, 1, n, CABECALHO.length).getValues();
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  const propostas = linhas_().filter(function (r) { return r[0] !== ""; }).map(function (r) {
    let state = {};
    try { state = JSON.parse(r[7] || "{}"); } catch (err) {}
    return { numero: Number(r[0]), tipo: r[1], cliente: r[2], valor: String(r[3]), emissao: String(r[4]), atualizadoEm: String(r[5]), uid: r[6], state: state };
  }).sort(function (a, b) { return b.numero - a.numero; });
  return json_({ ok: true, propostas: propostas });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const req = JSON.parse(e.postData.contents || "{}");
    if (req.action !== "save" || !req.proposta) return json_({ ok: false, erro: "requisição inválida" });
    const p = req.proposta;
    const numero = Number(p.numero);
    if (!numero) return json_({ ok: false, erro: "número inválido" });
    const sh = aba_();
    const dados = linhas_();
    let max = PRIMEIRO_NUMERO - 1, linha = -1;
    dados.forEach(function (r, i) {
      const n = Number(r[0]);
      if (n > max) max = n;
      if (n === numero) linha = i + 2;
    });
    if (linha > 0) {
      const uidExistente = sh.getRange(linha, 7).getValue();
      if (uidExistente && p.uid && uidExistente !== p.uid) {
        return json_({ ok: false, conflict: true, next: max + 1 });
      }
    }
    const valores = [[numero, p.tipo || "", p.cliente || "", p.valor || "", p.emissao || "", p.atualizadoEm || new Date().toISOString(), p.uid || "", JSON.stringify(p.state || {})]];
    const destino = linha > 0 ? linha : sh.getLastRow() + 1;
    sh.getRange(destino, 3, 1, 6).setNumberFormat("@");
    sh.getRange(destino, 1, 1, CABECALHO.length).setValues(valores);
    return json_({ ok: true, numero: numero });
  } finally {
    lock.releaseLock();
  }
}
