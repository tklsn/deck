<script setup lang="ts">
import { onMounted } from "vue";
import AppSidebar from "./components/AppSidebar.vue";
import SidebarProvider from "./components/ui/sidebar/SidebarProvider.vue";
import SidebarInset from "./components/ui/sidebar/SidebarInset.vue";
import { loadApiKeysFromStorage } from "./core/services/provider_settings";

onMounted(async () => {
  await loadApiKeysFromStorage();
});
</script>

<template>
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <RouterView />
    </SidebarInset>
  </SidebarProvider>
</template>
