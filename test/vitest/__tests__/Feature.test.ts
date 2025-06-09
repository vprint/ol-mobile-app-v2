import Feature from 'src/services/Feature';
import GeoJSON from 'ol/format/GeoJSON';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { describe, it, expect } from 'vitest';
import { FeatureCollection } from 'geojson';

const __dirname = dirname(fileURLToPath(import.meta.url));
interface IArrondissement {
  n_sq_ar: number;
  c_ar: number;
  c_arinsee: number;
  l_ar: string;
  l_aroff: string;
  n_sq_co: number;
  surface: number;
  perimetre: number;
  geom_x_y: {
    lon: number;
    lat: number;
  };
}

describe('Feature', () => {
  const geojson: FeatureCollection = JSON.parse(
    readFileSync(join(__dirname, 'data/arrondissements.geojson'), 'utf-8')
  );

  const firstFeature = geojson.features[0];

  const feature = new Feature<IArrondissement>({
    ...firstFeature.properties,
    geometry: new GeoJSON().readGeometry(firstFeature.geometry),
  });

  const properties = feature.getProperties();
  const attributes = feature.attributes;

  it('Should have a geometry', () => {
    expect(feature.getGeometry()).toBeDefined();
    expect(feature.getGeometry()?.getType()).toBe('Polygon');
  });

  it('Should have properties', () => {
    expect(properties).toBeDefined();
  });

  it('Should be typed', () => {
    expect(typeof properties.n_sq_ar).toBe('number');
    expect(typeof properties.c_ar).toBe('number');
    expect(typeof properties.c_arinsee).toBe('number');
    expect(typeof properties.l_ar).toBe('string');
    expect(typeof properties.l_aroff).toBe('string');
    expect(typeof properties.n_sq_co).toBe('number');
    expect(typeof properties.surface).toBe('number');
    expect(typeof properties.perimetre).toBe('number');
    expect(typeof properties.geom_x_y.lat).toBe('number');
    expect(typeof properties.geom_x_y.lon).toBe('number');

    expect(typeof attributes.n_sq_ar).toBe('number');
    expect(typeof attributes.c_ar).toBe('number');
    expect(typeof attributes.c_arinsee).toBe('number');
    expect(typeof attributes.l_ar).toBe('string');
    expect(typeof attributes.l_aroff).toBe('string');
    expect(typeof attributes.n_sq_co).toBe('number');
    expect(typeof attributes.surface).toBe('number');
    expect(typeof attributes.perimetre).toBe('number');
    expect(typeof attributes.geom_x_y.lat).toBe('number');
    expect(typeof attributes.geom_x_y.lon).toBe('number');
  });

  it('Should synchronize attributes and getProperties', () => {
    expect(properties).toEqual(feature.attributes);
  });
});
