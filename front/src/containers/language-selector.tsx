import { connect } from 'react-redux';
import { selectLocale } from '../reducers/locales';
import { closeLanguageMenu } from '../reducers/menus';

import LanguageSelectorComponent from '../components/language-selector/language-selector.jsx';

const LanguageSelector = (prop: PropsInterface) => {
  document.documentElement.lang = prop.currentLocale;
  const handleChange = (e: any) => {
    const newLocale: any = e.target.value;
    if (prop.messagesByLocale[newLocale]) {
      prop.onChangeLanguage(newLocale);
      document.documentElement.lang = newLocale;
    }
  };

  const {
    onChangeLanguage, // eslint-disable-line no-unused-vars
    messagesByLocale, // eslint-disable-line no-unused-vars
    children,
    ...props
  } = prop;

  return (
    <LanguageSelectorComponent onChange={handleChange} {...props}>
      {children}
    </LanguageSelectorComponent>
  );
};

interface PropsInterface {
  children: JSX.Element;
  currentLocale: string;
  // Only checking key presence for messagesByLocale, no need to be more specific than object
  messagesByLocale: object; // eslint-disable-line react/forbid-prop-types
  onChangeLanguage: any;
}

const mapStateToProps = (state: any) => ({
  currentLocale: state.locales.locale,
  messagesByLocale: state.locales.messagesByLocale,
});

const mapDispatchToProps = (dispatch: any) => ({
  onChangeLanguage: (locale: any) => {
    dispatch(selectLocale(locale));
    dispatch(closeLanguageMenu());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(LanguageSelector);
