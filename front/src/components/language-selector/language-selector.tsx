import { FC } from 'react';

import locales from 'scratch-l10n';
import styles from './languageSelector.module.css';

// supported languages to exclude from the menu, but allow as a URL option
const ignore: any = [];

const LanguageSelector: FC<PropsInterface> = ({
  currentLocale,
  label,
  onChange,
}) => (
  <select
    aria-label={label}
    className={styles.languageSelect}
    value={currentLocale}
    onChange={onChange}
  >
    {Object.keys(locales)
      .filter(l => !ignore.includes(l))
      .map(locale => (
        <option key={locale} value={locale}>
          {locales[locale].name}
        </option>
      ))}
  </select>
);

interface PropsInterface {
  currentLocale: string;
  label?: string;
  onChange: any;
}

// TODO
// LanguageSelector.propTypes = {
//     currentLocale: PropTypes.string,
//     label: PropTypes.string,
//     onChange: PropTypes.func
// };

export default LanguageSelector;
