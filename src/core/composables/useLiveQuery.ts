import { liveQuery } from "dexie";
import { ref, onUnmounted, type Ref } from "vue";

export function useLiveQuery<T>(
  querier: () => T | Promise<T>,
  initialValue: T,
): Ref<T> {
  const result = ref(initialValue) as Ref<T>;

  const subscription = liveQuery(querier).subscribe({
    next: (value) => {
      result.value = value as T;
    },
    error: (err) => console.error("[useLiveQuery]", err),
  });

  onUnmounted(() => subscription.unsubscribe());

  return result;
}
