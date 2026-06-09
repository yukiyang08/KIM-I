import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

const KEY = 'kim-i-profile'

export const useProfileStore = defineStore('profile', () => {
  const _saved = JSON.parse(localStorage.getItem(KEY) || 'null') ?? {}

  const name       = ref(_saved.name       ?? '')
  const birthYear  = ref(_saved.birthYear  ?? 45)   // 民國年
  const region     = ref(_saved.region     ?? null)  // 'south'|'north'|'central'|'east'|'island'|'military'
  const occupation = ref(_saved.occupation ?? null)  // 'farming'|'factory'|'trade'|'official'|'teacher'|'homemaker'
  const family     = ref(_saved.family     ?? null)  // 'alone'|'children'|'extended'
  const isSetup    = ref(_saved.isSetup    ?? false)

  // 推算全盛年代（出生+30歲）
  const eraLabel = computed(() => {
    const y = birthYear.value
    if (y <= 34) return '民國60年代'
    if (y <= 44) return '民國70年代'
    if (y <= 54) return '民國80年代'
    return '民國90年代'
  })

  const regionLabel = computed(() => ({
    south: '南部', north: '北部', central: '中部',
    east: '東部', island: '離島', military: '眷村',
  }[region.value] ?? ''))

  const occupationLabel = computed(() => ({
    farming: '務農', factory: '工廠', trade: '做生意',
    official: '公務員', teacher: '教師', homemaker: '家管',
  }[occupation.value] ?? ''))

  const displayName = computed(() => name.value.trim() || '你')

  const _persist = () => {
    localStorage.setItem(KEY, JSON.stringify({
      name: name.value, birthYear: birthYear.value,
      region: region.value, occupation: occupation.value,
      family: family.value, isSetup: isSetup.value,
    }))
  }

  watch([name, birthYear, region, occupation, family, isSetup], _persist, { deep: true })

  const completeSetup = () => { isSetup.value = true }

  const reset = () => {
    name.value = ''; birthYear.value = 45; region.value = null
    occupation.value = null; family.value = null; isSetup.value = false
    localStorage.removeItem(KEY)
  }

  return {
    name, birthYear, region, occupation, family, isSetup,
    eraLabel, regionLabel, occupationLabel, displayName,
    completeSetup, reset,
  }
})
