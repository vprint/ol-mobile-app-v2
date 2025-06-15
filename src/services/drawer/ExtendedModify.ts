import { Interaction, Modify, Select } from 'ol/interaction';
import { Collection, Feature, getUid } from 'ol';
import { click } from 'ol/events/condition';
import { Map } from 'ol';
import { EventsKey } from 'ol/events';
import StyleManager from '../StyleManager';
import VectorLayer from 'ol/layer/Vector';
import { InteractionSettings } from 'src/enums/map.enum';

enum ModifyEvent {
  SELECT = 'select',
}

interface IOptions {
  name: string;
  style: StyleManager;
  layer: VectorLayer;
}

interface IModifyEvents {
  selection?: EventsKey | EventsKey[];
}

/**
 * Provide selection and modification methods for draws.
 */
class ExtendedModify extends Interaction {
  private readonly selectInteraction: Select | undefined;
  private readonly modificationLayer: VectorLayer;
  private modifyInteraction: Modify | undefined;
  private style: StyleManager;
  private events: IModifyEvents = {};

  constructor(options: IOptions) {
    super();
    this.set(InteractionSettings.NAME, options.name);
    this.style = options.style;
    this.modificationLayer = options.layer;
    this.selectInteraction = this.createSelect(this.modificationLayer);
    this.modifyInteraction = this.createModify(
      this.selectInteraction.getFeatures()
    );
  }

  /**
   * Initialize the component and add the required interactions.
   * @param map - OpenLayers map
   */
  public setMap(map: Map | null): void {
    super.setMap(map);
    if (this.selectInteraction && this.modifyInteraction) {
      map?.addInteraction(this.selectInteraction);
      map?.addInteraction(this.modifyInteraction);
    }
    this.addSelectionListener();
  }

  /**
   * Create the modify interaction.
   */
  private createModify(features?: Collection<Feature>): Modify {
    return new Modify({
      style: this.style.getSelectionStyle(),
      features,
      deleteCondition: (event): boolean => {
        return click(event);
      },
    });
  }

  /**
   * Creates a select interaction for the specified layer.
   * @param selectionLayer - The layer on which to enable selection.
   * @returns A Select interaction configured for the given layer.
   */
  private createSelect(selectionLayer: VectorLayer): Select {
    return new Select({
      layers: (layer): boolean => {
        return getUid(layer) === getUid(selectionLayer);
      },
      condition: click,
      style: this.style.getSelectionStyle(),
      hitTolerance: 30,
    });
  }

  setActive(active: boolean): void {
    super.setActive(active);

    if (!active) {
      this.unselectFeature();
    }

    if (this.selectInteraction && this.modifyInteraction) {
      this.selectInteraction.setActive(active);
      this.modifyInteraction.setActive(active);
    }
  }

  /**
   * Enable modify interaction on selection.
   */
  private addSelectionListener(): void {
    this.events.selection = this.selectInteraction?.on(
      ModifyEvent.SELECT,
      () => {
        this.addFeaturesToModifier(this.selectInteraction?.getFeatures());
      }
    );
  }

  /**
   * Add new features to the modifier.
   * @param features - The collection of features to modify.
   */
  public addFeaturesToModifier(
    features: Collection<Feature> | undefined
  ): void {
    this.removeModifyInteraction();
    this.pushFeaturesToModifyLayer(features);
    this.modifyInteraction = this.createModify(features);
    this.getMap()?.addInteraction(this.modifyInteraction);
  }

  private pushFeaturesToModifyLayer(
    features: Collection<Feature> | undefined
  ): void {
    const layerSource = this.modificationLayer.getSource();
    const currentFeatures = layerSource?.getFeatures() ?? [];

    features?.forEach((feature) => {
      if (!currentFeatures.includes(feature)) {
        layerSource?.addFeature(feature);
      }
    });
  }

  /**
   * Remove the selected feature
   */
  public removeFeature(): void {
    const feature = this.getFeature();

    if (feature) {
      this.modificationLayer.getSource()?.removeFeature(feature);
      this.unselectFeature();
      this.removeModifyInteraction();
    }
  }

  /**
   * Get the selected feature
   * @returns The selected feature or undefined if no feature is selected
   */
  public getFeature(): Feature | undefined {
    return this.selectInteraction?.getFeatures().getArray()[0];
  }

  /**
   * Clear feature from the modifier.
   * Doesn't remove the feature from the layer like `removeFeature`.
   */
  public unselectFeature(): void {
    this.selectInteraction?.getFeatures().clear();
  }

  /**
   * Remove the modify interaction from the map.
   */
  private removeModifyInteraction(): void {
    if (this.modifyInteraction) {
      this.modifyInteraction.dispose();
      this.getMap()?.removeInteraction(this.modifyInteraction);
    }
  }

  public getLayer(): VectorLayer {
    return this.modificationLayer;
  }
}

export default ExtendedModify;
