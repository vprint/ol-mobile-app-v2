export enum MapSettings {
  LONG = 103.859064,
  LAT = 13.441288,
  ZOOM = 12,
  MAX_ZOOM = 19,
  MIN_ZOOM = 7,
}

export enum InteractionSettings {
  NAME = 'name',
}

export enum TransactionMode {
  INSERT = 'insert',
  UPDATE = 'update',
  DELETE = 'delete',
}

export enum DrawEventType {
  DRAW_START = 'drawstart',
  DRAW_END = 'drawend',
  DRAW_ABORT = 'drawabort',
  DRAW_REMOVE = 'drawremove',
}

export enum GeometryType {
  POINT = 'Point',
  LINE_STRING = 'LineString',
  LINEAR_RING = 'LinearRing',
  POLYGON = 'Polygon',
  MULTI_POINT = 'MultiPoint',
  MULTI_LINE_STRING = 'MultiLineString',
  MULTI_POLYGON = 'MultiPolygon',
  GEOMETRY_COLLECTION = 'GeometryCollection',
  CIRCLE = 'Circle',
}
