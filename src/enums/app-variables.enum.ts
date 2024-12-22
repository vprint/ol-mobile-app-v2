export const AppVariables = {
  APPLICATION_NAME: 'Archaeo-Web',

  VECTOR_TILE_SERVER: `${import.meta.env.VITE_API_URL}:${
    import.meta.env.VITE_VECTOR_TILE_SERVER_PORT
  }`,

  QGIS_SERVER: `${import.meta.env.VITE_API_URL}:${
    import.meta.env.VITE_QGIS_SERVER_PORT
  }`,
} as const;
