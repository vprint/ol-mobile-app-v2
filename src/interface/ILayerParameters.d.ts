import { LayerProperties } from 'src/enums/layers.enum';

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type ILayerProperties = {
  /**
   * Layer id. This id is used for servers request.
   */
  [LayerProperties.ID]: string;
  /**
   * Layer title. This title is used in the layer panel.
   */
  [LayerProperties.TITLE]: string;
  /**
   * Can the layer parameters be changed in the layer manager ?
   */
  [LayerProperties.ALLOW_PARAMETERS_CHANGE]: boolean;
  /**
   * Is the layer editable ? (e.g can we modify geo-features, can we modify attributes ?).
   */
  [LayerProperties.ALLOW_EDITION]?: boolean;
  /**
   * Does this layer allows to select features ?
   */
  [LayerProperties.ALLOW_SELECTION]?: boolean;
  /**
   * Is the layers dynamically adjusted after every zoom ?
   */
  [LayerProperties.IS_DYNAMIC]?: boolean;
  /**
   * Layer description. This description is used in the layer tree.
   */
  [LayerProperties.DESCRIPTION]?: string;
};
