export interface ColorSelection {
  walls?: string;
  windows?: string;
  doors?: string;
  roof?: string;
  trim?: string;
  elevation?: string;
}

export interface HouseSection {
  id: keyof ColorSelection;
  label: string;
  color: string;
}
