import React, { useState } from 'react';

/**
 * Higher Order Component to manage inputs that submit on blur and <enter>
 * @param {React.Component} Input text input that consumes onChange, onBlur, onKeyPress
 * @returns {React.Component} Buffered input that calls onSubmit on blur and <enter>
 */
// eslint-disable-next-line import/no-anonymous-default-export
export default function (Input: any) {
  const BufferedInput = (props: PropsInterface) => {
    const [value, setValue] = useState<any>(null);

    const handleKeyPress = (e: any) => {
      if (e.key === 'Enter') {
        handleFlush();
        e.target.blur();
      }
    };

    const handleFlush = () => {
      const isNumeric = typeof props.value === 'number';
      const validatesNumeric = isNumeric ? !isNaN(value) : true;
      if (value !== null && validatesNumeric) {
        props.onSubmit(isNumeric ? Number(value) : value);
      }
      setValue(null);
    };
    const handleChange = (e: any) => {
      setValue(e.target.value);
    };

    const bufferedValue: any = value === null ? props.value : value;

    return (
      <Input
        {...props}
        value={bufferedValue}
        onBlur={handleFlush}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
      />
    );
  };

  interface PropsInterface {
    onSubmit: any;
    value: string | number;
    className?: any;
    maxLength?: any;
    placeholder?: any;
    tabIndex?: any;
    type?: any;
  }

  // TODO
  // BufferedInput.propTypes = {
  //     onSubmit: PropTypes.func.isRequired,
  //     value: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  // };

  return BufferedInput;
}
