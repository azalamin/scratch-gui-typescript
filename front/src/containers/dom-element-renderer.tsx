import omit from 'lodash.omit';
import { useEffect, useRef } from 'react';
import Style from 'to-style';

/*
 * DOMElementRenderer wraps a DOM element, allowing it to be
 * rendered by React. It's up to the containing component
 * to retain a reference to the element prop, or else it
 * will be garbage collected after unmounting.
 *
 * Props passed to the DOMElementRenderer will be set on the
 * DOM element like it's a normal component.
 */

const DOMElementRenderer = (props: PropsInterface) => {
  let container: any = useRef();
  useEffect(() => {
    container.appendChild(props.domElement);

    return () => {
      container.removeChild(props.domElement);
    };
  }, [props.domElement]);

  const setContainer = (c: any) => {
    container = c;
  };

  // Apply props to the DOM element, so its attributes
  // are updated as if it were a normal component.
  // Look at me, I'm the React now!
  Object.assign(
    props.domElement,
    omit(props, ['domElement', 'children', 'style'])
  );
  // Convert react style prop to dom element styling.
  if (props.style) {
    props.domElement.style.cssText = Style.string(props.style);
  }
  return <div ref={setContainer} />;
};

interface PropsInterface {
  domElement: any;
  style: any;
}

export default DOMElementRenderer;
