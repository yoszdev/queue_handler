export const isEmpty = (obj: object): boolean => {
  return Object.keys(obj).length === 0;
};

export const isJsonSizeUnder256KB = (msg: any): boolean => {
  const jsonString = JSON.stringify(msg);
  const byteSize = Buffer.byteLength(jsonString, "utf-8");
  return byteSize <= 256 * 1024; // 256 KB
};
