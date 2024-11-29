export interface ILayerProperties {
  /**
   * Layer id. This id is used for servers request.
   */
  id: string;
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

export enum LayerProperties {
  ID = 'id',
  TITLE = 'title',
  TUNABLE = 'tunable',
  EDITABLE = 'editable',
  SELECTABLE = 'selectable',
  DYNAMIC = 'dynamic',
  DESCRIPTION = 'description',
}
