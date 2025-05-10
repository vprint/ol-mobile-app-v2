import { LAYER_PROPERTIES_FIELD } from 'src/enums/layers.enum';
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
import FeatureHover from './FeatureHover';

class ExtendedVectorTileLayer extends VectorTileLayer {
  private modifier: ExtendedModify | undefined;
  private vectorTileSelect: VectorTileSelect | undefined;
  private featureHover: FeatureHover | undefined;
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

  // #region selection

  /**
   * Enable / disable selection over the vector tile layer.
   * @param active - Should the selection be enabled / disabled ?
   */
  public enableSelection(active: boolean): void {
    const map = this.getMapInternal();

    if (this.canCreateSelector() && active) {
      this.initializeSelector(map, this);
    }

    if (this.canCreateHover() && active) {
      this.featureHover = FeatureHover.getInstance(this);
      map?.addInteraction(this.featureHover);
    }

    this.vectorTileSelect?.setActive(active);
  }

  public getSelector(): VectorTileSelect | undefined {
    this.isSelectionAllowed();
    return this.vectorTileSelect;
  }

  /**
   * Initializes a VectorTileSelect only if necessary.
   * * @param map - The OpenLayers map
   */
  private initializeSelector(map: Map | null, layer: VectorTileLayer): void {
    if (!this.vectorTileSelect) {
      this.vectorTileSelect = new VectorTileSelect({
        selectableLayer: layer,
        selectionStyle: new Style({
          image: new CircleStyle({
            radius: 15,
            fill: new Fill({ color: 'rgba(232,32,192,0.2)' }),
            stroke: new Stroke({ color: '#e820c0', width: 2 }),
          }),
        }),
      });
    }
    map?.addInteraction(this.vectorTileSelect);
  }

  /**
   * Checks if the selection is allowed in the layer parameters.
   * @returns - The selection mode.
   */
  private isSelectionAllowed(): boolean {
    if (!this.getLayerInformations().allowSelection) {
      console.warn(this.internalParams.SELECTOR_IS_FALSE);
    }
    return this.getLayerInformations().allowSelection ?? false;
  }

  private canCreateSelector(): boolean {
    const map = this.getMapInternal();
    return this.isSelectionAllowed() && !!map && !this.vectorTileSelect;
  }

  private canCreateHover(): boolean {
    const map = this.getMapInternal();
    return this.isSelectionAllowed() && !!map && !this.featureHover;
  }

  // #region modify

  /**
   * Enable / disable the modification.
   * @param active - Should the modifier be enabled / disabled ?
   */
  public enableModifier(active: boolean): void {
    if (this.isModificationAllowed()) {
      if (active) this.createModifier();
      else this.removeModifier();
    }
  }

  private createModifier(): void {
    if (!this.modifier) {
      const modificationLayer = new VectorLayer({
        source: new VectorSource(),
      });

      this.modifier = new ExtendedModify({
        name: `${this.getLayerInformations().title}_${
          this.internalParams.MODIFIER_NAME
        }`,
        style: new StyleManager({
          strokeColor: 'rgba(232,32,192,1)',
          fillColor: 'rgba(232,32,192,0.2)',
          strokeWidth: 2,
        }),
        layer: modificationLayer,
      });

      const map = this.getMapInternal();
      map?.addInteraction(this.modifier);
      map?.addLayer(modificationLayer);
    }
  }

  private removeModifier(): void {
    if (this.modifier) {
      this.modifier.dispose();
      this.modifier = undefined;
    }
  }

  public getModifier(): ExtendedModify | undefined {
    if (this.isModificationAllowed()) {
      return this.modifier;
    }
  }

  /**
   * Checks if the edition is allowed in the layer parameters.
   * @returns - The edition mode.
   */
  private isModificationAllowed(): boolean {
    if (!this.getLayerInformations().allowModification) {
      console.warn(this.internalParams.MODIFIER_IS_FALSE);
    }

    return this.getLayerInformations().allowModification ?? false;
  }
}

export default ExtendedVectorTileLayer;
