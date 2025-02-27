export const AppVariables = {
  /**
   * The application name.
   */
  APPLICATION_NAME: 'Archaeo-Web',

  /**
   * The main API URL.
   */
  API_URL: `${import.meta.env.VITE_API_URL}`,

  /**
   * Allows to send vector tiles to the frontend. Use Tegola Server.
   */
  VECTOR_TILE_SERVER: `${import.meta.env.VITE_API_URL}:${
    import.meta.env.VITE_VECTOR_TILE_SERVER_PORT
  }`,

  /**
   * Allows to display dynamics WMS. Use GGIS Server.
   */
  QGIS_SERVER: `${import.meta.env.VITE_API_URL}:${
    import.meta.env.VITE_QGIS_SERVER_URL
  }`,

  /**
   * WMTS (cached WMS) server. Use a MapProxy instance.
   */
  MAPPROXY_SERVER: `${import.meta.env.VITE_API_URL}:${
    import.meta.env.VITE_MAPPROXY_PORT
  }`,

  /**
   * Allows to read data (update / delete is not yet implemented) using OGC API Feature. Made with a pg_featurserv instance
   */
  FEATURE_SERVER: `${import.meta.env.VITE_API_URL}:${
    import.meta.env.VITE_FEATURE_SERVER
  }`,

  /**
   * Allows to execute processes online. Use a pg_featurserv instance
   */
  FUNCTION_SERVER: `${import.meta.env.VITE_API_URL}:${
    import.meta.env.VITE_FUNCTION_SERVER
  }`,

  /**
   * Allows CRUD on geo-feature. Use geoserver.
   */
  TRANSACTION_SERVER: `${import.meta.env.VITE_API_URL}:${
    import.meta.env.VITE_TRANSACTION_SERVER
  }`,
} as const;
