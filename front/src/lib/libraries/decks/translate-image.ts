/**
 * @fileoverview
 * Utility functions for handling tutorial images in multiple languages
 */

import { enImages as defaultImages } from './en-steps';

let savedImages: any = {};
let savedLocale = '';

const loadSpanish = () =>
  import(/* webpackChunkName: "es-steps" */ './es-steps').then(
    ({ esImages: imageData }) => imageData
  );

const loadSimplifiedChinese = () =>
  import(/* webpackChunkName: "zh_CN-steps" */ './zh_CN-steps').then(
    ({ zhCnImages: imageData }) => imageData
  );

const loadTraditionalChinese = () =>
  import(/* webpackChunkName: "zh_TW-steps" */ './zh_TW-steps').then(
    ({ zhTwImages: imageData }) => imageData
  );

const loadTurkish = () =>
  import(/* webpackChunkName: "tr-steps" */ './tr-steps').then(
    ({ trImages: imageData }) => imageData
  );

const loadFrench = () =>
  import(/* webpackChunkName: "fr-steps" */ './fr-steps').then(
    ({ frImages: imageData }) => imageData
  );

const loadPortugueseBrazilian = () =>
  import(/* webpackChunkName: "pt_BR-steps" */ './pt_BR-steps').then(
    ({ ptBrImages: imageData }) => imageData
  );

const loadArabic = () =>
  import(/* webpackChunkName: "ar-steps" */ './ar-steps').then(
    ({ arImages: imageData }) => imageData
  );

const loadAmharic = () =>
  import(/* webpackChunkName: "am-steps" */ './am-steps').then(
    ({ amImages: imageData }) => imageData
  );

const loadKiswahili = () =>
  import(/* webpackChunkName: "sw-steps" */ './sw-steps').then(
    ({ swImages: imageData }) => imageData
  );

const loadIsiZulu = () =>
  import(/* webpackChunkName: "zu-steps" */ './zu-steps').then(
    ({ zuImages: imageData }) => imageData
  );

const loadUkrainian = () =>
  import(/* webpackChunkName: "uk-steps" */ './uk-steps').then(
    ({ ukImages: imageData }) => imageData
  );

const loadJapanese = () =>
  import(/* webpackChunkName: "ja-steps" */ './ja-steps').then(
    ({ jaImages: imageData }) => imageData
  );

const translations: any = {
  es: () => loadSpanish(),
  'es-419': () => loadSpanish(),
  'zh-cn': () => loadSimplifiedChinese(),
  'zh-tw': () => loadTraditionalChinese(),
  tr: () => loadTurkish(),
  fr: () => loadFrench(),
  'pt-br': () => loadPortugueseBrazilian(),
  pt: () => loadPortugueseBrazilian(),
  ar: () => loadArabic(),
  am: () => loadAmharic(),
  sw: () => loadKiswahili(),
  zu: () => loadIsiZulu(),
  uk: () => loadUkrainian(),
  ja: () => loadJapanese(),
  'ja-Hira': () => loadJapanese(),
};

const loadImageData = (locale: any) => {
  if (translations.hasOwnProperty(locale)) {
    translations[locale]().then((newImages: any) => {
      savedImages = newImages;
      savedLocale = locale;
    });
  }
};

/**
 * Return image data for tutorials based on locale (default: en)
 * @param {string} imageId key in the images object, or id string.
 * @param {string} locale requested locale
 * @return {string} image
 */
const translateImage: any = (imageId: any, locale: any): string => {
  if (locale !== savedLocale || !savedImages.hasOwnProperty(imageId)) {
    return defaultImages[imageId];
  }
  return savedImages[imageId];
};

export { loadImageData, translateImage };
