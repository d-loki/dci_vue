<template>
  <option v-for="item in lists" v-bind:key="item.slug" :value="item.slug">{{ item.value }}</option>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { ItemList } from '@/types/v2/File/Common/ItemList';

export default defineComponent( {
                                  name:  'item-list',
                                  props: {
                                      lists: Object as () => ItemList[],
                                  },
                                } );
</script>
