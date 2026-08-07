<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  decimal2degree,
  degree2decimal,
  isValidLatitude,
  isValidLongitude,
  isValidSexagesimalPart,
} from '@/utils/coordinates'

const props = withDefaults(defineProps<{
  label?: string
  kind?: 'latitude' | 'longitude'
}>(), {
  label: '',
  kind: 'longitude',
})

const { t } = useI18n()
const degree = shallowRef<number | string>('')
const minute = shallowRef<number | string>('')
const second = shallowRef<number | string>('')
const maxAngle = computed(() => props.kind === 'latitude' ? 90 : 180)

const angle = computed<number>({
  get() {
    return degree2decimal({
      degree: degree.value,
      minute: minute.value,
      second: second.value,
    })
  },
  set(value) {
    const angleParts = decimal2degree(value)
    degree.value = angleParts.degree
    minute.value = angleParts.minute
    second.value = angleParts.second
  },
})

function angleRule(value: unknown): true | string {
  const normalizedValue = String(value ?? '')
  const isValid = props.kind === 'latitude'
    ? isValidLatitude(normalizedValue)
    : isValidLongitude(normalizedValue)

  return isValid || t(`validation.${props.kind}`)
}

function sexagesimalRule(value: unknown): true | string {
  if (value === '' || value === null || value === undefined)
    return true

  return isValidSexagesimalPart(String(value ?? '')) || t('validation.sexagesimal')
}
</script>

<template>
  <v-row>
    <v-col cols="12" sm="6">
      <v-text-field
        v-model.number="angle"
        :label="label"
        type="number"
        :max="maxAngle"
        :min="-maxAngle"
        step="any"
        :rules="[angleRule]"
      />
    </v-col>
    <v-col cols="4" sm="2">
      <v-text-field
        v-model.number="degree"
        :label="`${$t('unit.degree')} °`"
        type="number"
        :max="maxAngle"
        :min="-maxAngle"
        step="1"
      />
    </v-col>
    <v-col cols="4" sm="2">
      <v-text-field
        v-model.number="minute"
        :label="`${$t('unit.minute')} ′`"
        type="number"
        max="59.999999"
        min="0"
        step="any"
        :rules="[sexagesimalRule]"
        validate-on="blur"
      />
    </v-col>
    <v-col cols="4" sm="2">
      <v-text-field
        v-model.number="second"
        :label="`${$t('unit.second')} ″`"
        type="number"
        max="59.999999"
        min="0"
        step="any"
        :rules="[sexagesimalRule]"
        validate-on="blur"
      />
    </v-col>
  </v-row>
</template>
