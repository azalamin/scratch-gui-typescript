import TagButtonComponent from '../components/tag-button/tag-button.jsx';

const TagButton = (props: PropsInterface) => {
  const handleClick = () => {
    props.onClick(props.tag);
  };

  return <TagButtonComponent {...props} onClick={handleClick} />;
};

interface PropsInterface {
  onClick: any;
  tag: any; //todo
  active?: any;
  className: any;
}

export default TagButton;
