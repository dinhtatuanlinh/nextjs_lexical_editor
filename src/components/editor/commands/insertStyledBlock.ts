// commands/insertStyledBlock.ts
import { createCommand } from 'lexical';
import { StyledBlockNode } from '../nodes/styledBlockNode';

export type InsertStyledBlockPayload = {
  className?: string;
  style?: Record<string, string>;
};
export const INSERT_STYLED_BLOCK_COMMAND =
  createCommand<InsertStyledBlockPayload>('INSERT_STYLED_BLOCK');
