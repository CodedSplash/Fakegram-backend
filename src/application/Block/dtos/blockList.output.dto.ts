import { BlockListItem } from '@domain/Block/types/blockListItem.type';

export interface BlockListOutputDto {
  readonly items: BlockListItem[];
  readonly nextCursor: string | null;
}
