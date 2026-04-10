<script setup lang="ts">
import { computed } from "vue";
import { marked } from "marked";
import DOMPurify from "dompurify";

const props = defineProps<{ content: string }>();

const html = computed(() =>
  DOMPurify.sanitize(marked.parse(props.content ?? "") as string)
);
</script>

<template>
  <div class="prose dark:prose-invert max-w-none" v-html="html" />
</template>
