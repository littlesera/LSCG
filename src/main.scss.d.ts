export type Styles = {
  'button': string;
  'button-tooltip': string;
  'lscg-button': string;
  'lscg-button-div': string;
  'lscg-button-menu': string;
  'lscg-button-tooltip': string;
  'lscg-dropdown': string;
  'lscg-dropdown-button': string;
  'lscg-dropdown-content': string;
  'lscg-screen': string;
  'lscg-timer': string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
