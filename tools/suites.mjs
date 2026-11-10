// 스위트 구성 확인 도구
//   npm run list:suites   → flow × 태그 표 출력
//   npm run check:suites  → 표 출력 + 태깅 규칙 위반이 있으면 exit 1 (CI 사전 검사용)
//
// 태깅 규칙 (CLAUDE.md "태깅 규칙"과 동일하게 유지할 것)
//   테스트 flow  = flows/<기능>/*.yaml
//     - 스위트 태그(sanity / regression) 최소 1개
//     - sanity면 regression도 함께 (sanity ⊂ regression)
//     - 플랫폼 태그 android
//   subflow     = flows/subflows/**/*.yaml
//     - 스위트 태그를 달지 않는다 (단독 실행 방지)

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const ROOT = "flows";
const SUITES = ["sanity", "regression"];
const check = process.argv.includes("--check");

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith(".yaml") ? [p] : [];
  });
}

// '---' 앞의 헤더에서 tags만 읽는다. (블록 리스트 / [a, b] 인라인 둘 다 지원)
function readTags(file) {
  const header = readFileSync(file, "utf8").split(/^---\s*$/m)[0];
  const inline = header.match(/^tags:\s*\[(.*)\]\s*$/m);
  if (inline) return inline[1].split(",").map((t) => t.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
  const block = header.match(/^tags:\s*\n((?:[ \t]+-.*\n?)+)/m);
  if (!block) return [];
  return block[1].split("\n").map((l) => l.replace(/^[ \t]+-\s*/, "").trim().replace(/^["']|["']$/g, "")).filter(Boolean);
}

const rows = [];
const errors = [];

for (const file of walk(ROOT).sort()) {
  const rel = relative(ROOT, file);
  if (rel === "config.yaml") continue;
  const parts = rel.split(sep);
  const isSubflow = parts[0] === "subflows";
  const tags = readTags(file);
  const has = (t) => tags.includes(t);

  if (isSubflow) {
    if (SUITES.some(has)) errors.push(`${file}: subflow에 스위트 태그가 있음 → 단독 테스트로 실행됨`);
    continue;
  }

  rows.push({ file: rel, feature: parts.length > 1 ? parts[0] : "-", tags });
  if (parts.length === 1) errors.push(`${file}: 기능 폴더 밖에 있음 → flows/<기능>/ 아래로 옮길 것`);
  if (!SUITES.some(has)) errors.push(`${file}: 스위트 태그(sanity/regression)가 없음 → 어떤 스위트에서도 실행되지 않음`);
  if (has("sanity") && !has("regression")) errors.push(`${file}: sanity인데 regression 태그가 없음`);
  if (!has("android")) errors.push(`${file}: 플랫폼 태그(android)가 없음`);
}

const mark = (b) => (b ? "O" : "");
console.log("| flow | 기능 | sanity | regression | 기타 태그 |");
console.log("|---|---|:-:|:-:|---|");
for (const r of rows) {
  const others = r.tags.filter((t) => !SUITES.includes(t)).join(", ");
  console.log(`| ${r.file} | ${r.feature} | ${mark(r.tags.includes("sanity"))} | ${mark(r.tags.includes("regression"))} | ${others} |`);
}
const count = (t) => rows.filter((r) => r.tags.includes(t)).length;
console.log(`\n테스트 flow ${rows.length}개 · sanity ${count("sanity")}개 · regression ${count("regression")}개`);

if (errors.length) {
  console.log(`\n태깅 규칙 위반 ${errors.length}건:`);
  for (const e of errors) console.log(`  - ${e}`);
  if (check) process.exit(1);
} else {
  console.log("\n태깅 규칙 위반 없음");
}
