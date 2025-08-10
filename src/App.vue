<template>
  <div class="h-100vh flex flex-col items-center justify-center">
    <form @submit.prevent="StartCountDown">
      <input
        id="count_down"
        class="w-20"
        type="number"
        v-model.number="form.count"
        placeholder="Count"
        min="1"
        max="999"
      />
      <select name="type" id="count_down_type" v-model="form.type">
        <option :value="CountDownType.Seconds">seconds</option>
        <option :value="CountDownType.Minutes">minutes</option>
        <option :value="CountDownType.Hours">hours</option>
      </select>
      <input
        type="checkbox"
        name="count_down_repeat"
        id="count_down_repeat"
        v-model="form.repeat"
      />
      <label for="count_down_repeat">repeat</label>
      <button type="submit">Start</button>
      <button type="button" @click.prevent="StopCountDown">Stop</button>
    </form>
    <div>
      Now:
      <span class="font-mono">{{ format(now, 'yyyy-MM-dd hh:mm:ss') }}</span>
    </div>
    <div>
      <span class="font-mono text-4xl" :style="countDownMainStyle">{{
        FormatCountDown(countDown)
      }}</span>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { format } from 'date-fns';
import { useSound } from '@vueuse/sound';
import notice from './assets/mixkit-retro-game-notification-212.wav';
import { useStorage } from '@vueuse/core';
import { animate } from 'animejs';

const CountDownType = {
  Seconds: 'seconds',
  Minutes: 'minutes',
  Hours: 'hours',
} as const;

type CountDownType = (typeof CountDownType)[keyof typeof CountDownType];

const countDown = ref(0); // 10 milliseconds
const countDownInterval = ref<number | null>(null);
const now = ref(new Date());
const form = useStorage('count-down-options', {
  count: 15,
  type: CountDownType.Minutes as CountDownType,
  repeat: true,
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

const StartCountDown = () => {
  if (form.value.count <= 0) return;

  switch (form.value.type) {
    case CountDownType.Seconds:
      countDown.value = form.value.count * 100; // convert to 10 milliseconds
      break;
    case CountDownType.Minutes:
      countDown.value = form.value.count * 60 * 100; // convert to 10 milliseconds
      break;
    case CountDownType.Hours:
      countDown.value = form.value.count * 60 * 60 * 100; // convert to 10 milliseconds
      break;
  }

  countDownInterval.value = setInterval(() => {
    if (countDown.value <= 0) {
      clearInterval(countDownInterval.value ?? undefined);
      sound.play();
      countDownAnimate.restart();

      if (form.value.repeat) {
        StartCountDown();
      }

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
  countDown.value = 0;
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

onMounted(() => {
  setInterval(() => {
    now.value = new Date();
  }, 1000 / 60);
});
</script>
