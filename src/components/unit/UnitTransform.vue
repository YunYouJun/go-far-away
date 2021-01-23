<template>
  <v-row>
    <v-col cols="6">
      <v-text-field
        v-model="angle"
        :label="label"
        type="number"
        max="180"
        min="-180"
      ></v-text-field>
    </v-col>
    <v-col cols="2">
      <v-text-field
        v-model="degree"
        :label="$t('unit.degree') + ' °'"
        type="number"
        max="180"
        min="-180"
      ></v-text-field>
    </v-col>
    <v-col cols="2">
      <v-text-field
        v-model="minute"
        :label="$t('unit.minute') + ' ′'"
        type="number"
        max="60"
        min="0"
      ></v-text-field>
    </v-col>
    <v-col cols="2">
      <v-text-field
        v-model="second"
        :label="$t('unit.second') + ' ″'"
        type="number"
        max="60"
        min="0"
      ></v-text-field>
    </v-col>
  </v-row>
</template>

<script>
export default {
  props: {
    label: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      degree: "",
      minute: "",
      second: "",
    };
  },
  computed: {
    angle: {
      get: function () {
        return this.degree2decimal({
          degree: this.degree,
          minute: this.minute,
          second: this.second,
        });
      },
      set: function (val) {
        let angle = this.decimal2degree(val);
        this.degree = angle.degree;
        this.minute = angle.minute;
        this.second = angle.second;
      },
    },
  },
  methods: {
    decimal2degree(decimal) {
      let degree = Math.floor(decimal);
      let minute = Math.floor((decimal - degree) * 60);
      let second = Math.floor(((decimal - degree) * 60 - minute) * 60);
      return {
        degree,
        minute,
        second,
      };
    },
    degree2decimal(degree) {
      let d = Number(degree.degree);
      let m = Number(degree.minute);
      let s = Number(degree.second);
      let decimal = d + m / 60 + s / 3600;
      return decimal;
    },
  },
};
</script>
