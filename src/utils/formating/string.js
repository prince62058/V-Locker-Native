export const maskId = id => {
  if (!id || id.length < 8) return id;
  return `${id.substring(0, 4)}...${id.substring(id.length - 4)}`;
};
