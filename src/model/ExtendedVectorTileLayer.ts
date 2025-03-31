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
import { hasInteraction } from 'src/utils/MapUtils';

const vectorTileSelect = new VectorTileSelect({
  name: Interactions.SELECTOR,
  selectionStyle: new Style({
    image: new CircleStyle({
      radius: 15,
      fill: new Fill({ color: 'rgba(232,32,192,0.2)' }),
      stroke: new Stroke({ color: '#e820c0', width: 2 }),
    }),
  }),
});

const ExtendedVectorTileLayerParameters = {
  MODIFIER_NAME: 'modifier',
};

class ExtendedVectorTileLayer extends VectorTileLayer {
  private modifier: ExtendedModify | undefined;

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

    if (this.shouldEnableSelection(map)) {
      map.addInteraction(vectorTileSelect);
    }
  }

  /**
   * Enable / disable selection over the vector tile layer.
   * @param active - Should the selection be enabled / disabled ?
   */
  public enableSelection(active: boolean): void {
    vectorTileSelect.setSelectionLayer(active ? this : undefined);
    vectorTileSelect.setActive(active);
  }

  public getSelector(): VectorTileSelect {
    return vectorTileSelect;
  }

  /**
   * Enable / disable the modification. This method does not use `setActive()` but a custom function to save memory.
   * @param active - Should the modifier be enabled / disabled ?
   */
  public enableModifier(active: boolean): void {
    if (active) this.createModifier();
    else this.removeModifier();
  }

  private createModifier(): void {
    this.modifier = new ExtendedModify({
      name: `${this.getLayerInformations().title}_${
        ExtendedVectorTileLayerParameters.MODIFIER_NAME
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
  }

  private removeModifier(): void {
    if (this.modifier) {
      this.modifier.dispose();
      this.modifier = undefined;
    }
  }

  /**
   * Determines if selection should be enabled on this layer given the user parameters.
   * Acts as a TypeScript type guard to ensure map is not null when conditions are satisfied.
   * @param map - The OpenLayers map instance or null
   * @returns a boolean. If true, TypeScript set `map` to type `Map`
   */
  private shouldEnableSelection(map: Map | null): map is Map {
    return (
      !!map &&
      hasInteraction(map, vectorTileSelect) &&
      !!this.getLayerInformations().allowSelection
    );
  }
}

export default ExtendedVectorTileLayer;
