type SortOrderType = 1 | -1;

export interface SortQuery {
  [key: string]: SortOrderType;
}
