export interface Position {
  x: number;
  y: number;
}

export const GRID_SIZE = 100;
export const ICON_SIZE = { width: 80, height: 80 };

export const getGridPosition = (index: number, containerWidth: number): Position => {
  const effectiveWidth = Math.max(containerWidth, GRID_SIZE);
  const cols = Math.max(1, Math.floor(effectiveWidth / GRID_SIZE));
  const row = Math.floor(index / cols);
  const col = index % cols;
  
  return {
    x: col * GRID_SIZE + 20,
    y: row * GRID_SIZE + 20
  };
};