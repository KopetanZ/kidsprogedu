#!/usr/bin/env ts-node
import { readFileSync } from 'node:fs';
import { LessonSchema, checkBlockDepth } from '../core/blocks/schemas.ts';

function lintOne(path: string) {
  try {
    const raw = readFileSync(path, 'utf-8');
    const json = JSON.parse(raw);
    const parsed = LessonSchema.safeParse(json);
    if (!parsed.success) {
      console.error(`[NG] ${path}`);
      parsed.error.issues.forEach((i) => console.error(' -', i.path.join('.'), i.message));
      return 1;
    }
    const lesson = parsed.data;
    // toolbox contains all used blocks in starterCode?
    const used = new Set<string>();
    const walk = (bs: any[]) => bs?.forEach((b) => { used.add(b.block); if (b.children) walk(b.children); });
    walk(lesson.starterCode);
    for (const id of used) {
      if (!lesson.toolbox.includes(id as any)) {
        console.error(`[NG] ${path} starterCode uses block not in toolbox: ${id}`);
        return 1;
      }
    }
    // depth <= 3
    if (!checkBlockDepth(lesson.starterCode, 3)) {
      console.error(`[NG] ${path} nested depth exceeds 3`);
      return 1;
    }
    // must include when_flag somewhere in starter
    if (!used.has('when_flag')) {
      console.error(`[NG] ${path} starterCode must include when_flag`);
      return 1;
    }
    console.log(`[OK] ${path}`);
    return 0;
  } catch (e: any) {
    console.error(`[NG] ${path}: ${e.message}`);
    return 1;
  }
}

function main() {
  const files = process.argv.slice(2);
  if (!files.length) {
    console.error('Pass lesson file paths (shell can expand globs).');
    process.exit(1);
  }
  let code = 0;
  for (const f of files) code |= lintOne(f);
  process.exit(code);
}

main();
