import classNames from 'classnames';
import React from 'react';
import styles from './box.module.css';

const getRandomColor: any = (function () {
  // In "DEBUG" mode this is used to output a random background color for each
  // box. The function gives the same "random" set for each seed, allowing re-
  // renders of the same content to give the same random display.
  const random = (function (seed: any) {
    let mW: any = seed;
    let mZ: any = 987654321;
    const mask = 0xffffffff;
    return function () {
      mZ = (36969 * (mZ & 65535) + (mZ >> 16)) & mask;
      mW = (18000 * (mW & 65535) + (mW >> 16)) & mask;
      let result = ((mZ << 16) + mW) & mask;
      result /= 4294967296;
      return result + 1;
    };
  })(601);
  return function () {
    // For the toString is not a good solution, Looking for good one
    const r: any = Math.max(parseInt((random() * 100).toString(), 10) % 256, 1);
    const g: any = Math.max(parseInt((random() * 100).toString(), 10) % 256, 1);
    const b: any = Math.max(parseInt((random() * 100).toString(), 10) % 256, 1);
    return `rgb(${r},${g},${b})`;
  };
})();

const Box = (props: PropsInterface) => {
  const {
    alignContent,
    alignItems,
    alignSelf,
    basis,
    children,
    className,
    componentRef,
    direction,
    element,
    grow,
    height,
    justifyContent,
    width,
    wrap,
    shrink,
    style,
    ...componentProps
  } = props;
  return React.createElement(
    element,
    {
      className: classNames(className, styles.box),
      ref: componentRef,
      style: Object.assign(
        {
          alignContent: alignContent,
          alignItems: alignItems,
          alignSelf: alignSelf,
          flexBasis: basis,
          flexDirection: direction,
          flexGrow: grow,
          flexShrink: shrink,
          flexWrap: wrap,
          justifyContent: justifyContent,
          width: width,
          height: height,
        },
        process.env.DEBUG
          ? {
              backgroundColor: getRandomColor(),
              outline: `1px solid black`,
            }
          : {},
        style
      ),
      ...componentProps,
    },
    children
  );
};

interface PropsInterface {
  /** Defines how the browser distributes space between and around content items vertically within this box. */
  alignContent?: any;
  /** Defines how the browser distributes space between and around flex items horizontally within this box. */
  alignItems?: any;
  /** Specifies how this box should be aligned inside of its container (requires the container to be flexable). */
  alignSelf?: any;
  /** Specifies the initial length of this box */
  basis?: any;
  /** Specifies the the HTML nodes which will be child elements of this box. */
  children?: any;
  /** Specifies the class name that will be set on this box */
  className?: string;
  /**
   * A callback function whose first parameter is the underlying dom elements.
   * This call back will be executed immediately after the component is mounted or unmounted
   */
  componentRef?: any;
  /** https://developer.mozilla.org/en-US/docs/Web/CSS/flex-direction */
  direction?: any;
  /** Specifies the type of HTML element of this box. Defaults to div. */
  element?: any;
  /** Specifies the flex grow factor of a flex item. */
  grow?: number;
  /** The height in pixels (if specified as a number) or a string if different units are required. */
  height?: number | string;
  /** https://developer.mozilla.org/en-US/docs/Web/CSS/justify-content */
  justifyContent?: any;
  /** Specifies the flex shrink factor of a flex item. */
  shrink?: number;
  /** An object whose keys are css property names and whose values correspond the the css property. */
  style?: any;
  /** The width in pixels (if specified as a number) or a string if different units are required. */
  width?: number | string;
  /** How whitespace should wrap within this block. */
  wrap?: any;
  dir?: any;
  onMouseDown?: any;
  onTouchStart?: any;
  bounds?: any;
  role?: any;
  tabIndex?: any;
  onBlur?: any;
  onClick?: any;
  onFocus?: any;
  onKeyPress?: any;
  onMouseEnter?: any;
  onMouseLeave?: any;
  onDoubleClick?: any;
}

// TODO
// Box.propTypes = {
//   /** Defines how the browser distributes space between and around content items vertically within this box. */
//   alignContent: PropTypes.oneOf([
//     'flex-start',
//     'flex-end',
//     'center',
//     'space-between',
//     'space-around',
//     'stretch',
//   ]),
//   /** Defines how the browser distributes space between and around flex items horizontally within this box. */
//   alignItems: PropTypes.oneOf([
//     'flex-start',
//     'flex-end',
//     'center',
//     'baseline',
//     'stretch',
//   ]),
//   /** Specifies how this box should be aligned inside of its container (requires the container to be flexable). */
//   alignSelf: PropTypes.oneOf([
//     'auto',
//     'flex-start',
//     'flex-end',
//     'center',
//     'baseline',
//     'stretch',
//   ]),
//   /** Specifies the initial length of this box */
//   basis: PropTypes.oneOfType([PropTypes.number, PropTypes.oneOf(['auto'])]),
//   /** Specifies the the HTML nodes which will be child elements of this box. */
//   children: PropTypes.node,
//   /** Specifies the class name that will be set on this box */
//   className: PropTypes.string,
//   /**
//    * A callback function whose first parameter is the underlying dom elements.
//    * This call back will be executed immediately after the component is mounted or unmounted
//    */
//   componentRef: PropTypes.func,
//   /** https://developer.mozilla.org/en-US/docs/Web/CSS/flex-direction */
//   direction: PropTypes.oneOf([
//     'row',
//     'row-reverse',
//     'column',
//     'column-reverse',
//   ]),
//   /** Specifies the type of HTML element of this box. Defaults to div. */
//   element: PropTypes.string,
//   /** Specifies the flex grow factor of a flex item. */
//   grow: PropTypes.number,
//   /** The height in pixels (if specified as a number) or a string if different units are required. */
//   height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
//   /** https://developer.mozilla.org/en-US/docs/Web/CSS/justify-content */
//   justifyContent: PropTypes.oneOf([
//     'flex-start',
//     'flex-end',
//     'center',
//     'space-between',
//     'space-around',
//   ]),
//   /** Specifies the flex shrink factor of a flex item. */
//   shrink: PropTypes.number,
//   /** An object whose keys are css property names and whose values correspond the the css property. */
//   style: stylePropType,
//   /** The width in pixels (if specified as a number) or a string if different units are required. */
//   width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
//   /** How whitespace should wrap within this block. */
//   wrap: PropTypes.oneOf(['nowrap', 'wrap', 'wrap-reverse']),
// };
Box.defaultProps = {
  element: 'div',
  style: {},
};
export default Box;
