export type Styles = {
  'lscg-button': string;
  'lscg-checkbox': string;
  'lscg-checkbox--disabled': string;
  'lscg-layers': string;
  'lscg-layers-body': string;
  'lscg-layers-container': string;
  'lscg-layers-listing': string;
  'lscg-layers-toolbar': string;
  'lscg-layers-translate-toolbar': string;
  'lscg-opacity-slider': string;
  'lscg-opacity-slider-inputs': string;
  'lscg-translate-direction': string;
  'lscg-translate-dragging': string;
  'selected': string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
