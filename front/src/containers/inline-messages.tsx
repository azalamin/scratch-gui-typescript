import { FC } from 'react';
import { connect } from 'react-redux';

import { filterInlineAlerts } from '../reducers/alerts';

import InlineMessageComponent from '../components/alerts/inline-message.jsx';

const InlineMessages: FC<PropsInterface> = ({ alertsList, className }) => {
  if (!alertsList) {
    return null;
  }
  // only display inline alerts here
  const inlineAlerts = filterInlineAlerts(alertsList);
  if (!inlineAlerts || !inlineAlerts.length) {
    return null;
  }

  // get first alert
  const firstInlineAlert = inlineAlerts[0];
  const { content, iconSpinner, level } = firstInlineAlert;

  return (
    <InlineMessageComponent
      className={className}
      content={content}
      iconSpinner={iconSpinner}
      level={level}
    />
  );
};

interface PropsInterface {
  alertsList: any; // Todo PropTypes.arrayOf(PropTypes.object);
  className: string;
}

const mapStateToProps = (state: any) => ({
  alertsList: state.scratchGui.alerts.alertsList,
});

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(InlineMessages);
