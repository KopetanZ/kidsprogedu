import { z } from 'zod';

// HRM-like instruction set kept separate from existing BlockId/BlockSchema
// to avoid any breaking changes to current lessons/runtime.

export const HRMOpId = z.enum([
  'inbox',
  'outbox',
  'copyfrom',
  'copyto',
  'add',
  'sub',
  'bump_up',
  'bump_down',
  'jump',
  'jump_if_zero',
  'jump_if_neg',
  'label',
]);
export type HRMOpId = z.infer<typeof HRMOpId>;

export const HRMInstructionSchema = z.object({
  op: HRMOpId,
  // address for memory operations (floor index)
  addr: z.number().int().min(0).optional(),
  // label name (for label or jump targets)
  label: z.string().optional(),
  // jump target label name
  target: z.string().optional(),
});
export type HRMInstruction = z.infer<typeof HRMInstructionSchema>;

export const HRMProgramSchema = z.object({
  instructions: z.array(HRMInstructionSchema),
});
export type HRMProgram = z.infer<typeof HRMProgramSchema>;

export const HrmChallengeSchema = z.object({
  inbox: z.array(z.number()),
  expectedOutbox: z.array(z.number()),
  floorSize: z.number().int().min(0).default(8),
  constraints: z
    .object({
      sizeMax: z.number().int().min(1).optional(),
      stepMax: z.number().int().min(1).optional(),
      bannedOps: z.array(HRMOpId).default([]),
      requiredOps: z.array(HRMOpId).default([]),
    })
    .default({ bannedOps: [], requiredOps: [] }),
});
export type HrmChallenge = z.infer<typeof HrmChallengeSchema>;

