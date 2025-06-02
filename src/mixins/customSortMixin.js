// customSortMixin.js
export const customSortMixin = {
  methods: {
    customSort(value, secondarySort, tertiarySort) {
      return value.sort((a, b) => {
        const sortBy = this.currentSort

        // Сортировка по первичному полю
        let res = (a[sortBy] && b[sortBy])
          ? a[sortBy].toString().localeCompare(b[sortBy].toString(), undefined, { numeric: true })
          : (a[sortBy] ? 1 : -1);

        // Если первичное поле равное, сортируем по вторичному полю
        if (secondarySort && res === 0) {
          res = (a[secondarySort] && b[secondarySort])
            ? a[secondarySort].toString().localeCompare(b[secondarySort].toString(), undefined, { numeric: true })
            : (a[secondarySort] ? 1 : -1);
        }

        if (tertiarySort && res === 0) {
          res = (a[tertiarySort] && b[tertiarySort])
            ? a[tertiarySort].toString().localeCompare(b[tertiarySort].toString(), undefined, { numeric: true })
            : (a[tertiarySort] ? 1 : -1);
        }

        // Возвращаем результат с учетом направления сортировки
        return (this.currentSortOrder === 'asc') ? res : -res
      })
    },
  }
};
