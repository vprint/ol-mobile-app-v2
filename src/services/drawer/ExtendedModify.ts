import { Interaction, Modify, Select } from 'ol/interaction';
import { Collection, Feature, getUid } from 'ol';
import { click } from 'ol/events/condition';
import { Map } from 'ol';
import { EventsKey } from 'ol/events';
import StyleManager from '../StyleManager';
import VectorLayer from 'ol/layer/Vector';
import { unByKey } from 'ol/Observable';
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
  private selectInteraction: Select;
  private modifyInteraction: Modify;
  private modificationLayer: VectorLayer;
  private style: StyleManager;
  private events: IModifyEvents = {};

  constructor(options: IOptions) {
    super();
    this.set(InteractionSettings.NAME, options.name);
    this.style = options.style;
    this.modificationLayer = options.layer;
    this.selectInteraction = this.getSelect(this.modificationLayer);
    this.modifyInteraction = this.getModify(
      this.selectInteraction.getFeatures()
    );
  }

  /**
   * Initialize the component and add the required interactions.
   * @param map - OpenLayers map
   */
  public setMap(map: Map | null): void {
    super.setMap(map);
    map?.addInteraction(this.selectInteraction);
    map?.addInteraction(this.modifyInteraction);
    this.addSelectionListener();
  }

  /**
   * Get the modify interaction.
   * @param selector - The select interaction.
   * @returns
   */
  private getModify(feature?: Collection<Feature>): Modify {
    return new Modify({
      style: this.style.getEditionStyle(),
      features: feature,
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
  private getSelect(selectionLayer: VectorLayer): Select {
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
      this.removeModifyInteraction();
    }
  }

  /**
   * Enable modify interaction on selection.
   */
  private addSelectionListener(): void {
    this.events.selection = this.selectInteraction.on(
      ModifyEvent.SELECT,
      () => {
        this.addFeaturesToModifier(this.selectInteraction.getFeatures());
      }
    );
  }

  /**
   * Enable the modifier.
   * @param feature - The feature to modify.
   */
  public addFeaturesToModifier(feature: Collection<Feature>): void {
    this.removeModifyInteraction();
    this.modifyInteraction = this.getModify(feature);
    this.getMap()?.addInteraction(this.modifyInteraction);
  }

  /**
   * Remove the selected feature
   */
  public removeFeature(): void {
    const feature = this.getFeature();
    if (feature) {
      this.modificationLayer.getSource()?.removeFeature(feature);
    }
    this.removeModifyInteraction();
  }

  /**
   * Get the selected feature
   * @returns The selected feature or undefined if no feature is selected
   */
  public getFeature(): Feature | undefined {
    return this.selectInteraction.getFeatures().getArray()[0];
  }

  /**
   * Clear feature from the modifier.
   * Doesn't remove the feature from the layer like `removeFeature`.
   */
  public unselectFeature(): void {
    this.selectInteraction.getFeatures().clear();
  }

  /**
   * Remove the modify interaction from the map.
   */
  private removeModifyInteraction(): void {
    this.modifyInteraction.dispose();
    this.getMap()?.removeInteraction(this.modifyInteraction);
  }

  public dispose(): void {
    if (this.events.selection) unByKey(this.events.selection);

    this.selectInteraction.dispose();
    this.modifyInteraction.dispose();

    this.getMap()?.removeLayer(this.modificationLayer);
    this.modificationLayer.dispose();

    super.dispose();
  }
}

export default ExtendedModify;
