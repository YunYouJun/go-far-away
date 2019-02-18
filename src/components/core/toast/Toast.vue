<template>
  <v-snackbar v-model="open" v-bind="options">
    <div class="ctn">
      <div v-if="title" class="title mb-2">
        {{ title }}
      </div>
      <div class="txt">
        {{ text }}
      </div>
    </div>
    <v-btn v-if="options.closeable" dark flat @click.native="open = false">
      Close
    </v-btn>
  </v-snackbar>
</template>

<script>
export default {
  name: 'Toast',
  props: {
    title: {
      type: String,
      default: ''
    },
    text: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: ''
    },
    options: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      open: false
    }
  },
  watch: {
    open: function(val) {
      if (!val) {
        this.close()
      }
    }
  },
  beforeMount() {
    document.querySelector('#app').appendChild(this.$el)
  },
  mounted() {
    this.open = true
  },
  methods: {
    close() {
      if (this.open) this.open = false
      setTimeout(() => {
        this.$options.onClose()
        this.$destroy()
      }, 700) // wait for close animation
    }
  }
}
</script>
