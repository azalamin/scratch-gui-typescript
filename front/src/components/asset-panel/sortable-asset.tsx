import React from 'react';

import bindAll from 'lodash.bindall';

class SortableAsset extends React.Component<PropsInterface> {
  ref: any;
  constructor(props: PropsInterface) {
    super(props);
    bindAll(this, ['setRef']);
  }
  componentDidMount() {
    this.props.onAddSortable(this.ref);
  }
  componentWillUnmount() {
    this.props.onRemoveSortable(this.ref);
  }
  setRef(ref: any) {
    this.ref = ref;
  }
  render() {
    return (
      <div
        className={this.props.className}
        ref={this.setRef}
        style={{
          order: this.props.index,
        }}
      >
        {this.props.children}
      </div>
    );
  }
}

interface PropsInterface {
  children: JSX.Element;
  className?: string;
  index?: number;
  onAddSortable?: any;
  onRemoveSortable?: any;
  id?: any;
}

// TODO
// SortableAsset.propTypes = {
//   children: PropTypes.node.isRequired,
//   className: PropTypes.string,
//   index: PropTypes.number.isRequired,
//   onAddSortable: PropTypes.func.isRequired,
//   onRemoveSortable: PropTypes.func.isRequired,
// };

export default SortableAsset;
