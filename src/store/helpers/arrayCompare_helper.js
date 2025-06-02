function arrayCompare(first, second) {
  if (!first || !second) return false

  // compare lengths - can save a lot of time
  if (first.length != second.length) return false

  for (let i = 0, l = first.length; i < l; i++) {
    // Check if we have nested arrays
    if (first[i] instanceof Array && second[i] instanceof Array) {
      // recurse into the nested arrays
      if (!arrayCompare(first[i], second[i])) return false
    } else if (first[i] != second[i]) {
      // Warning - two different object instances will never be equal: {x:20} != {x:20}
      return false
    }
  }
  return true
}

function getRangeVal(val, range) {
  let res = null
  if (val < range[0]) {
    return 0
  }

  if (val >= range[range.length - 1]) {
    return range.length
  }

  for (let i = 0, len = range.length; i < len; i += 1) {
    if (val >= range[i] && val < range[i + 1]) {
      res = i + 1
    }
  }

  return res
}

export {arrayCompare, getRangeVal}
