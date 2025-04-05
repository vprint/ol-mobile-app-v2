import { LAYER_PROPERTIES_FIELD } from 'src/enums/layers.enum';
import { Interactions } from 'src/enums/interactions.enum';
import { ILayerProperties } from 'src/interface/ILayerParameters';
import { Map } from 'ol';
import VectorLayer from 'ol/layer/Vector';
import VectorTileLayer from 'ol/layer/VectorTile';
import VectorSource from 'ol/source/Vector';
import ExtendedModify from 'src/services/drawer/ExtendedModify';
import StyleManager from 'src/services/StyleManager';
import VectorTileSelect from 'src/services/VectorTileSelect';
import Style from 'ol/style/Style';
import CircleStyle from 'ol/style/Circle';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';

let vectorTileSelect: VectorTileSelect | undefined;

class ExtendedVectorTileLayer extends VectorTileLayer {
  public static instance: VectorTileSelect | null = null;
  private modifier: ExtendedModify | undefined;
  private map: Map | undefined;
  private internalParams = {
    MODIFIER_NAME: 'modifier',
    SELECTOR_IS_FALSE:
      "Selection is set to false and can't be activated or getted",
    MODIFIER_IS_FALSE:
      "modification is set to false and can't be activated or getted",
  };

  /**
   * Get the layer informations.
   * @returns
   */
  public getLayerInformations(): ILayerProperties {
    return this.get(LAYER_PROPERTIES_FIELD) as ILayerProperties;
  }

  /**
   * Get the layer as an OpenLayers layer.
   * @returns The OpenLayers VectorTileLayer instance.
   */
  public getAsLayer(): VectorTileLayer {
    return this as VectorTileLayer;
  }

  public setMap(map: Map | null): void {
    super.setMap(map);
    this.map = map ?? undefined;

    if (!!map && this.shouldEnableSelection()) {
      ExtendedVectorTileLayer.initVectorTileSelect(map);
    }
  }

  // #region selection

  /**
   * Enable / disable selection over the vector tile layer.
   * @param active - Should the selection be enabled / disabled ?
   */
  public enableSelection(active: boolean): void {
    if (this.isSelectionEnabled()) {
      vectorTileSelect?.setSelectionLayer(active ? this : undefined);
      vectorTileSelect?.setActive(active);
    }
  }

  public getSelector(): VectorTileSelect | undefined {
    this.isSelectionEnabled();
    return vectorTileSelect;
  }

  /**
   * Checks if the selection is enabled in the layer parameters.
   * @returns - The selection mode.
   */
  private isSelectionEnabled(): boolean {
    if (!this.getLayerInformations().allowSelection) {
      console.warn(this.internalParams.SELECTOR_IS_FALSE);
    }
    return this.getLayerInformations().allowSelection ?? false;
  }

  /**
   * Determines if selection should be enabled on this layer given the user parameters.
   * @returns a boolean.
   */
  private shouldEnableSelection(): boolean {
    return !vectorTileSelect && !!this.getLayerInformations().allowSelection;
  }

  /**
   * Initializes a VectorTileSelect only if necessary. VectorTileSelect is implemented as a singleton,
   * which means only one instance of vectorTileSelect exists throughout the application.
   * * @param map - The OpenLayers map
   */
  private static initVectorTileSelect(map: Map): void {
    vectorTileSelect = new VectorTileSelect({
      name: Interactions.SELECTOR,
      selectionStyle: new Style({
        image: new CircleStyle({
          radius: 15,
          fill: new Fill({ color: 'rgba(232,32,192,0.2)' }),
          stroke: new Stroke({ color: '#e820c0', width: 2 }),
        }),
      }),
    });

    map.addInteraction(vectorTileSelect);
  }

  // #region modify

  /**
   * Enable / disable the modification. This method does not use `setActive()` but a custom function to save memory.
   * @param active - Should the modifier be enabled / disabled ?
   */
  public enableModifier(active: boolean): void {
    if (this.isEditionEnabled()) {
      if (active) this.createModifier();
      else this.removeModifier();
    }
  }

  private createModifier(): void {
    if (!this.modifier) {
      this.modifier = new ExtendedModify({
        name: `${this.getLayerInformations().title}_${
          this.internalParams.MODIFIER_NAME
        }`,
        style: new StyleManager({
          strokeColor: 'rgba(232,32,192,1)',
          fillColor: 'rgba(232,32,192,0.2)',
          strokeWidth: 2,
        }),
        layer: new VectorLayer({
          source: new VectorSource(),
        }),
      });
      this.map?.addInteraction(this.modifier);
    }
  }

  private removeModifier(): void {
    if (this.modifier) {
      this.modifier.dispose();
      this.modifier = undefined;
    }
  }

  public getModifier(): ExtendedModify | undefined {
    this.isEditionEnabled();
    return this.modifier;
  }

  /**
   * Checks if the edition is enabled in the layer parameters.
   * @returns - The edition mode.
   */
  private isEditionEnabled(): boolean {
    if (!this.getLayerInformations().allowEdition) {
      console.warn(this.internalParams.MODIFIER_IS_FALSE);
    }

    return this.getLayerInformations().allowEdition ?? false;
  }
}

export default ExtendedVectorTileLayer;
