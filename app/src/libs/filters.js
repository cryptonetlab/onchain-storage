/* inputDataStructure : unknown,
    specsStructure: {
        include : [{
            id,
            label,
            attribute (optional),
            inputType,
            getValue (optional),
            getValues (optional),
            applyFilter (optional),
            multiple (optional)
        }]
} */
export function generateFilters(inputData, specs) {
  if (!specs) {
    console.log("2 params required");
    return;
  }
  /* generateStructure: [{
        label,
        attribute,
        values,
        inputType
    }] */
  const generated = [];
  for (let i = 0; i < specs.include.length; i++) {
    const includeSpec = specs.include[i];

    const generatedFilter = {
      key: includeSpec.key,
      label: includeSpec.label,
      inputType: includeSpec.inputType,
      multiple: includeSpec.multiple ?? false,
    };

    if (includeSpec.inputType !== "date") {
      const values = [];
      for (let j = 0; j < inputData.length; j++) {
        const entry = inputData[j];
        if (includeSpec.getValues) {
          const entryValues = includeSpec.getValues(entry);
          entryValues.forEach((element) => {
            if (!values.includes(element)) {
              values.push(element);
            }
          });
        } else {
          let entryValue;
          if (includeSpec.getValue) {
            entryValue = includeSpec.getValue(entry);
          } else {
            entryValue = entry[includeSpec.attribute];
          }
          if (!values.includes(entryValue)) {
            values.push(entryValue);
          }
        }
      }

      generatedFilter["values"] = values;
    }

    if (includeSpec.applyFilter)
      generatedFilter["applyFilter"] = includeSpec.applyFilter;
    else if (includeSpec.attribute)
      generatedFilter["attribute"] = includeSpec.attribute;

    generated.push(generatedFilter);
  }
  return generated;
}

/* activeFiltersStructure: [{
    attribute,
    values: unknown[]
}] */
export function selectFilter(inputActiveFilters, filter, value) {
  // console.log(filter.attribute, value, filter.multiple)
  // console.log(value)

  const activeFilters = [...inputActiveFilters];

  const keyIndex = activeFilters.findIndex((el) => el.key == filter.key);

  /* active filters contain this attribute filters */
  if (keyIndex !== -1) {
    const filterEntry = { ...activeFilters[keyIndex] };

    /* apply new filter value only if it is not an empty string */
    if (value !== "") {
      const valueIndex = filterEntry.values.findIndex((el) => el == value);
      /* active attribute contains this value */
      if (valueIndex !== -1) {
        if (filter.multiple) {
          /* remove the value from the attribute filters */
          filterEntry.values.splice(valueIndex, 1);
          // if (filterEntry.values.length == 0) activeFilters.splice(keyIndex, 1);
        }
        /* active attribute does not contain the value */
      } else {
        if (filter.multiple) {
          /* add the value to the attribute filters */
          filterEntry.values.push(value);
        } else {
          filterEntry.values = [value];
        }
      }
      if (filterEntry.values.length > 0) {
        activeFilters[keyIndex] = filterEntry;
      } else {
        activeFilters.splice(keyIndex, 1);
      }
    } else {
      /* reset attribute filter if value is an empty string */
      activeFilters.splice(keyIndex, 1);
    }
  } else if (value !== "") {
    /* push new attribute in active filters */
    activeFilters.push({
      ...filter,
      values: [value],
    });
  }
  return activeFilters;
}

/* check whether the specified value of the filter is selected or no*/
export function isFilterValueSelected(inputActiveFilters, key, value) {
  const keyIndex = inputActiveFilters.findIndex((el) => el.key == key);
  if (keyIndex !== -1) {
    const activeFilter = inputActiveFilters[keyIndex];
    if (
      activeFilter?.values &&
      activeFilter.values.findIndex((el) => el === value) !== -1
    )
      return true;
  }

  return false;
}

/* check whether the specified filter has at least one selected value*/
export function isFilterDirty(inputActiveFilters, key) {
  const keyIndex = inputActiveFilters.findIndex((el) => el.key == key);
  if (keyIndex !== -1) {
    const activeFilter = inputActiveFilters[keyIndex];
    if (activeFilter?.values && activeFilter.values.length > 0) return true;
  }

  return false;
}

/* filter input data list with given filters */
export function applyFilters(inputData, inputActiveFilters) {
  /* filter every input entry according to active filters */
  const filteredData = inputData.filter((nft) => {
    if (inputActiveFilters.length == 0) return true;

    /* cycle every active attribute filter */
    for (let i = 0; i < inputActiveFilters.length; i++) {
      const activeFilter = inputActiveFilters[i];
      /* check if AT LEAST one of the filter values matches the item attribute value */
      for (let j = 0; j < activeFilter.values.length; j++) {
        const filterValue = activeFilter.values[j];
        if (activeFilter.applyFilter) {
          if (activeFilter.applyFilter(nft, filterValue)) return true;
        } else {
          console.log(
            "Filter Active is:",
            nft[activeFilter.attribute] == filterValue
          );
          if (nft[activeFilter.attribute] == filterValue) return true;
        }
      }
    }
    return false;
  });

  return filteredData;
}
