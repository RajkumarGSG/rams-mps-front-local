<template>
  <div>
    <md-table v-model="users" class="md-table-global-sales">
      <md-table-row slot="md-table-row" slot-scope="{item}">
        <md-table-cell md-label="">
          <div class="flag">
            <img :src="item.flag" />
          </div>
        </md-table-cell>
        <md-table-cell>{{ item.country }}</md-table-cell>
        <md-table-cell>{{ item.sales }}</md-table-cell>
        <md-table-cell>{{ item.percent }}</md-table-cell>
      </md-table-row>
    </md-table>
  </div>
</template>

<script>
export default {
  name: 'global-sales-table',
  data() {
    return {
      selected: [],
      users: [
        {
          flag: '',
          country: 'РО1',
          sales: '580',
          percent: '13.23%'
        },
        {
          flag: '',
          country: 'РО2',
          sales: '830',
          percent: '17.43%'
        },
        {
          flag: '',
          country: 'РО3',
          sales: '760',
          percent: '10.35%'
        },
        {
          flag: '',
          country: 'РО4',
          sales: '690',
          percent: '7.87%'
        },
        {
          flag: '',
          country: 'УАД ЖАБ',
          sales: '600',
          percent: '5.94%'
        },
        {
          flag: '',
          country: 'ГДАД БО',
          sales: '550',
          percent: '5.94%'
        },
        {
          flag: '',
          country: 'УАД ОБИ',
          sales: '400',
          percent: '5.94%'
        },
        {
          flag: '',
          country: 'УАД ОСИ',
          sales: '600',
          percent: '5.94%'
        },
        {
          flag: '',
          country: 'УАД БНТ',
          sales: '600',
          percent: '5.94%'
        }
      ]
    }
  }
}
</script>
