import { describe, it, expect } from 'vitest';
import StyleManager from '../../../src/services/StyleManager';
import { Style } from 'ol/style';
import { Circle } from 'ol/style';

describe('StyleManager', () => {
  const styleOptions = {
    strokeColor: 'rgba(255, 0, 0, 1)',
    fillColor: 'rgba(255, 0, 0, 0.5)',
    strokeWidth: 2,
    lineDash: [5, 5],
  };

  const styleManager = new StyleManager(styleOptions);

  describe('getStyle', () => {
    const style = styleManager.getStyle();

    it('Should return a style', () => {
      expect(style).toBeInstanceOf(Style);
    });

    it('Should return the correct stroke color', () => {
      expect(style.getStroke()?.getColor()).toBe(styleOptions.strokeColor);
    });

    it('Should return the correct stroke width', () => {
      expect(style.getStroke()?.getWidth()).toBe(styleOptions.strokeWidth);
    });

    it('Should return the correct stroke dash', () => {
      expect(style.getStroke()?.getLineDash()).toEqual(styleOptions.lineDash);
    });

    it('Should return the correct fill color', () => {
      expect(style.getFill()?.getColor()).toBe(styleOptions.fillColor);
    });
  });

  describe('getEditionStyle', () => {
    const editionStyle = styleManager.getEditionStyle();

    it('Should return an array of style', () => {
      expect(Array.isArray(editionStyle)).toBe(true);
    });

    it('Should return a point style to allow point modification', () => {
      expect(
        editionStyle.some((style) => style.getImage() instanceof Circle)
      ).toBe(true);
    });
  });

  describe('getSelectionStyle', () => {
    const selectionStyle = styleManager.getSelectionStyle();

    it('Should return a circle style to highlight vertex', () => {
      expect(Array.isArray(selectionStyle)).toBe(true);
      expect(
        selectionStyle.some((style) => style.getImage() instanceof Circle)
      ).toBe(true);
    });

    it('Should return a bold stroke to highlight polygons', () => {
      expect(
        selectionStyle.some((style) => {
          const width = style.getStroke()?.getWidth();
          return width !== undefined && width > styleOptions.strokeWidth;
        })
      ).toBe(true);
    });

    it('Should return a semi transparent stroke to highlight polygons', () => {
      expect(
        selectionStyle.some(
          (style) =>
            style.getStroke()?.getColor() === 'rgba(255, 255, 255, 0.2)'
        )
      ).toBe(true);
    });
  });
});
