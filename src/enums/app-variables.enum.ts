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
   * Tegola Server. Allows to send vector tiles to the frontend.
   */
  VECTOR_TILE_SERVER: `${import.meta.env.VITE_API_URL}:${
    import.meta.env.VITE_VECTOR_TILE_SERVER_PORT
  }`,

  /**
   * GGIS Server. Allows to display dynamics WMS.
   */
  QGIS_SERVER: `${import.meta.env.VITE_API_URL}:${
    import.meta.env.VITE_QGIS_SERVER_URL
  }`,

  /**
   * MapProxy URL. This server is used for WMTS (cached WMS).
   */
  MAPPROXY_SERVER: `${import.meta.env.VITE_API_URL}:${
    import.meta.env.VITE_MAPPROXY_PORT
  }`,

  /**
   * pg_featureserv. The OGC API Feature server. Allows to read data (update / delete is not yet implemented).
   */
  FEATURE_SERVER: `${import.meta.env.VITE_API_URL}:${
    import.meta.env.VITE_FEATURE_SERVER
  }`,

  /**
   * pg_featureserv. The function server. Allows to execute processes online.
   */
  FUNCTION_SERVER: `${import.meta.env.VITE_API_URL}:${
    import.meta.env.VITE_FUNCTION_SERVER
  }`,
} as const;
