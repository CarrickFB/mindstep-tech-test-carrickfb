const flattenObject = (obj: Record<string, any>, parentKey = '', sep = '.') => {
  return Object.entries(obj).reduce(
    (acc, [key, value]) => {
      const newKey = parentKey ? `${parentKey}${sep}${key}` : key;
      if (
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value)
      ) {
        Object.assign(acc, flattenObject(value, newKey, sep));
      } else {
        acc[newKey] = value;
      }
      return acc;
    },
    {} as Record<string, any>,
  );
};

const generateCSV = (data: Record<string, any>): string => {
  const flattenedData = flattenObject(data);
  const headers = Object.keys(flattenedData).join(',');
  const values = Object.values(flattenedData)
    .map((value) => {
      if (value === null) return 'null';
      if (value === undefined) return 'undefined';
      return typeof value === 'string'
        ? `"${value.replace(/"/g, '""')}"`
        : value;
    })
    .join(',');

  return `${headers}\n${values}`;
};

export default generateCSV;
