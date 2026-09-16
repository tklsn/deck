<script setup lang="ts">
import { computed } from "vue";
import { marked } from "marked";
import DOMPurify from "dompurify";

const props = defineProps<{ content: string; inline?: boolean }>();

const html = computed(() => {
  const raw = props.inline
    ? (marked.parseInline(props.content ?? "") as string)
    : (marked.parse(props.content ?? "") as string);
  return DOMPurify.sanitize(raw);
});
</script>

<template>
  <span v-if="inline" v-html="html" />
  <div v-else class="prose dark:prose-invert max-w-none" v-html="html" />
</template>
