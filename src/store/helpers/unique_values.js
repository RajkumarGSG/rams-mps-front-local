// store/helpers/unique_values.js
// function returning array containing single values from another array

export const getUniqueValues = (source, key, id = '', addEmptyLine = false, secondField = '') => {
  const uniqueValues = Array.from(new Set(source.map(obj => obj[key])));
  const temp = id
    ? uniqueValues.map(item => {
      // Find the first object in the source array that has the current unique value
      const foundObj = source.find(obj => obj[key] === item);
      const mappedRes = {
        id: foundObj ? foundObj[id] : item, // Get the id from the found object
        description: item
      };
      if(secondField) mappedRes[secondField] = foundObj[secondField]; // Add second field if its name is provided
      return mappedRes;
    })
    : uniqueValues.map(item => ({ id: item, description: item }));
    const res = temp.sort((a, b) => !id ? a.id.localeCompare(b.id, undefined, { sensitivity: 'base' }) : a - b);

  if (addEmptyLine) res.unshift({ id: 0, description: '' })   // Add null value to the beginnig

  return res
};