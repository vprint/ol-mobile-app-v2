import { LayerIdentifier } from 'src/enums/layers.enum';

export interface ILayerProperties {
  /**
   * Layer id. This id is used for servers request.
   */
  id: LayerIdentifier;
  /**
   * Layer title. This title is used in the layer panel.
   */
  title: string;
  /**
   * Can the layer be tuned in the layer tree ?
   */
  tunable: boolean;
  /**
   * Is the layer editable ? (e.g can we modify geo-features, can we modify attributes ?).
   */
  editable?: boolean;
  /**
   * Does this layer allows to select features ?
   */
  selectable?: boolean;
  /**
   * Is the layers dynamically adjusted after every zoom ?
   */
  dynamic?: boolean;
  /**
   * Layer description. This description is used in the layer tree.
   */
  description?: string;
}
