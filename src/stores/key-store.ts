import { defineStore } from 'pinia';
import { onMounted } from 'vue';
import { useSiteStore } from './site-store';
import { useSidePanelStore } from './side-panel-store';
import { SidePanelParameters } from 'src/enums/side-panel.enum';

const siteStore = useSiteStore();
const sidePanelStore = useSidePanelStore();

/**
 * FIXME: Il faut ajouter ce store au démarrage.
 */
export const useKeyStore = defineStore('keyStore', () => {
  /**
   * Handle the escape event.
   * @param event the keyboard press envent
   */
  function handleEscape(event: KeyboardEvent): void {
    if (event.key === 'Escape' && sidePanelStore.isOpen && siteStore.site) {
      siteStore.closeSitePanel();
    }
  }

  /**
   * Initialize site.
   */
  onMounted(async () => {
    window.addEventListener('keydown', handleEscape);

    if (sidePanelStore.panelParameters.location === SidePanelParameters.SITE) {
      siteStore.openSitePanel(
        parseInt(sidePanelStore.panelParameters.parameterValue as string)
      );
    }
  });
});
