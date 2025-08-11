<template>
  <div
    class="h-100vh w-full flex flex-col items-center justify-center p-4 text-onSurface"
  >
    <div class="w-full max-w-160">
      <div class="card p-6 md:p-8 flex flex-col gap-6">
        <header class="flex flex-col gap-2 text-center">
          <h1 class="text-2xl font-semibold tracking-wide">Repeat Timer</h1>
          <p class="text-sm opacity-80">
            設定一個可重複的倒數計時器，結束時發出提醒
          </p>
          <div class="flex justify-center gap-2 mt-2">
            <button
              type="button"
              class="btn-tonal text-xs px-3 py-1"
              @click="toggleDark()"
            >
              {{ isDark ? '☀️ Light' : '🌙 Dark' }}
            </button>
          </div>
        </header>

        <div
          class="flex justify-center text-xs md:text-sm opacity-85 font-mono"
        >
          <span>Now: {{ format(now, 'yyyy-MM-dd HH:mm:ss') }}</span>
        </div>

        <div class="flex flex-col items-center gap-3">
          <div
            class="font-mono tabular-nums text-4xl sm:text-6xl md:text-7xl font-light tracking-wider select-none"
            :style="countDownMainStyle"
          >
            {{ FormatCountDown(countDown) }}
          </div>
          <div class="w-full h-2 rounded bg-onSurface/10 overflow-hidden">
            <div
              class="h-full bg-primary/80 transition-width duration-10"
              :style="{ width: progressPercent + '%' }"
            />
          </div>
          <div class="text-xs uppercase tracking-widest font-medium opacity-70">
            {{ isRunning ? '進行中' : '已停止' }} •
            {{ progressPercent.toFixed(0) }}%
          </div>
        </div>

        <!-- Form -->
        <form @submit.prevent="StartCountDown" class="grid gap-4 md:gap-5">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
            <div class="flex flex-col gap-1 col-span-1">
              <label
                for="count_down"
                class="text-xs font-medium uppercase tracking-wide opacity-70"
                >數值</label
              >
              <input
                id="count_down"
                class="px-3 py-2 rounded bg-surfaceVariant/60 border border-outline/30 focus:(outline-none ring-2 ring-primary/60 border-primary) text-center"
                type="number"
                v-model.number="form.count"
                min="1"
                max="999"
              />
            </div>
            <div class="flex flex-col gap-1 col-span-1">
              <label
                for="count_down_type"
                class="text-xs font-medium uppercase tracking-wide opacity-70"
                >單位</label
              >
              <div class="relative">
                <select
                  id="count_down_type"
                  v-model="form.type"
                  class="w-full appearance-none px-3 py-2 rounded bg-surfaceVariant/60 border border-outline/30 focus:(outline-none ring-2 ring-primary/60 border-primary) tracking-wide"
                >
                  <option class="bg-slate-800" :value="CountDownType.Seconds">
                    秒
                  </option>
                  <option class="bg-slate-800" :value="CountDownType.Minutes">
                    分
                  </option>
                  <option class="bg-slate-800" :value="CountDownType.Hours">
                    時
                  </option>
                </select>
                <span
                  class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs opacity-70"
                  >⌄</span
                >
              </div>
            </div>
            <div class="flex items-center gap-2 col-span-2 md:col-span-1 mt-5">
              <input
                type="checkbox"
                id="count_down_repeat"
                class="w-5 h-5 accent-primary cursor-pointer"
                v-model="form.repeat"
              />
              <label
                for="count_down_repeat"
                class="cursor-pointer text-sm select-none"
                >重複</label
              >
            </div>
            <div class="flex gap-2 col-span-2 md:col-span-1 flex-wrap">
              <button
                v-for="set in quickSets"
                :key="`${set.value}-${set.type}`"
                type="button"
                class="px-2 py-1 rounded bg-surfaceVariant/50 hover:bg-surfaceVariant/80 text-xs border border-outline/30"
                @click="QuickSet(set.value, set.type)"
              >
                {{ set.value }}{{ DisplayType(set.type) }}
              </button>
            </div>
          </div>

          <div class="flex flex-wrap gap-3 justify-center pt-1">
            <button
              type="submit"
              class="btn-primary disabled:opacity-40"
              :disabled="isRunning"
            >
              開始
            </button>
            <button
              type="button"
              @click="StopCountDown"
              class="btn-danger"
              v-if="isRunning"
            >
              停止
            </button>
            <button type="button" @click="ResetCountDown" class="btn-tonal">
              重置
            </button>
          </div>
        </form>

        <footer class="text-center text-[10px] opacity-50 pt-2">
          使用瀏覽器本地儲存保存設定 · 音效來自 mixkit
        </footer>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, reactive, ref, computed } from 'vue';
import { format } from 'date-fns';
import { useSound } from '@vueuse/sound';
import notice from './assets/mixkit-retro-game-notification-212.wav';
import { useDark, useStorage, useToggle } from '@vueuse/core';
import { animate } from 'animejs';

const isDark = useDark({
  disableTransition: false,
});
const toggleDark = useToggle(isDark);

const CountDownType = {
  Seconds: 'seconds',
  Minutes: 'minutes',
  Hours: 'hours',
} as const;

type CountDownType = (typeof CountDownType)[keyof typeof CountDownType];

// countdown value: internal unit = 10ms ticks
const countDown = ref(0);
const countDownInterval = ref<number | null>(null);
const now = ref(new Date());
const form = useStorage('count-down-options', {
  count: 15,
  type: CountDownType.Minutes as CountDownType,
  repeat: true,
});

const initialTotal = ref(0);
const isRunning = computed(() => !!countDownInterval.value);
const progressPercent = computed(() => {
  if (!initialTotal.value) return 0;
  const spent = initialTotal.value - countDown.value;
  return Math.min(100, Math.max(0, (spent / initialTotal.value) * 100));
});

const countDownMainStyle = reactive({
  opacity: 1,
});

const countDownAnimate = animate(countDownMainStyle, {
  opacity: [1, 0, 1],
  easing: 'linear',
  duration: 300,
  direction: 'alternate',
  loop: 2,
  autoplay: false,
});

const sound = useSound(notice);

const quickSets = [
  { value: 30, type: CountDownType.Seconds },
  { value: 1, type: CountDownType.Minutes },
  { value: 5, type: CountDownType.Minutes },
  { value: 10, type: CountDownType.Minutes },
  { value: 15, type: CountDownType.Minutes },
  { value: 25, type: CountDownType.Minutes },
];

const StartCountDown = () => {
  if (form.value.count <= 0) return;
  if (countDownInterval.value) StopCountDown();

  switch (form.value.type) {
    case CountDownType.Seconds:
      countDown.value = form.value.count * 100; // 10ms ticks
      break;
    case CountDownType.Minutes:
      countDown.value = form.value.count * 60 * 100;
      break;
    case CountDownType.Hours:
      countDown.value = form.value.count * 60 * 60 * 100;
      break;
  }
  initialTotal.value = countDown.value;

  countDownInterval.value = setInterval(() => {
    if (countDown.value <= 0) {
      clearInterval(countDownInterval.value ?? undefined);
      countDownInterval.value = null;
      sound.play();
      countDownAnimate.restart();
      if (form.value.repeat) StartCountDown();
      return;
    }
    countDown.value--;
  }, 10);
};

const StopCountDown = () => {
  if (countDownInterval.value) {
    clearInterval(countDownInterval.value);
    countDownInterval.value = null;
  }
};

const ResetCountDown = () => {
  StopCountDown();
  countDown.value = 0;
  initialTotal.value = 0;
};

const QuickSet = (val: number, type: CountDownType) => {
  form.value.count = val;
  form.value.type = type;
  ResetCountDown();
};

const FormatCountDown = (count: number) => {
  const seconds = Math.floor(count / 100);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  const hh = hours.toString().padStart(2, '0');
  const mm = (minutes % 60).toString().padStart(2, '0');
  const ss = (seconds % 60).toString().padStart(2, '0');
  const tms = (count % 100).toString().padStart(2, '0');

  return `${hh}:${mm}:${ss}.${tms}`;
};

const DisplayType = (type: CountDownType) => {
  switch (type) {
    case CountDownType.Seconds:
      return 's';
    case CountDownType.Minutes:
      return 'm';
    case CountDownType.Hours:
      return 'h';
  }
};

onMounted(() => {
  setInterval(() => {
    now.value = new Date();
  }, 1000 / 60);

  setTimeout(() => {
    document.body.classList.remove('undone');
  }, 50);
});
</script>
